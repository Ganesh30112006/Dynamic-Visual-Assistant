import type { RealtimeCommand, RealtimeEvent } from '../types';

const states = ['ACTIVE','FOCUS','EXAMPLE','DISCUSSION','Q_AND_A','MANUAL_LOCK','RESUME_PENDING'];
const completions = ['not_started','in_progress','completed'];
const connections = ['connected','connecting','reconnecting','disconnected'];
function isEvent(value: unknown): value is RealtimeEvent {
  if (!value || typeof value !== 'object' || !('type' in value)) return false;
  const event = value as Record<string, unknown>;
  if ('eventId' in event && typeof event.eventId !== 'string') return false;
  if ('sequence' in event && (typeof event.sequence !== 'number' || !Number.isSafeInteger(event.sequence) || event.sequence < 0)) return false;
  switch (event.type) {
    case 'transcript': return typeof event.text === 'string' && (event.timestamp === undefined || typeof event.timestamp === 'string');
    case 'topic_update': return typeof event.topicId === 'string' && completions.includes(String(event.completion));
    case 'state_update': return states.includes(String(event.state)) && (event.confidence === undefined || event.confidence === null || (typeof event.confidence === 'number' && Number.isFinite(event.confidence) && event.confidence >= 0 && event.confidence <= 1));
    case 'visual_update': return event.visual === null || (Boolean(event.visual) && typeof event.visual === 'object' && typeof (event.visual as Record<string, unknown>).id === 'string' && typeof (event.visual as Record<string, unknown>).type === 'string');
    case 'connection_status': return connections.includes(String(event.status));
    case 'resume_pending': return (event.message === undefined || typeof event.message === 'string') && (event.reason === undefined || typeof event.reason === 'string');
    default: return false;
  }
}

export class RealtimeSocket {
  private socket: WebSocket | null = null;
  private generation = 0;
  private readonly url: string;
  constructor(sessionId: string) {
    const base = import.meta.env.VITE_WS_BASE_URL?.replace(/\/$/, '');
    this.url = base ? `${base}/sessions/${encodeURIComponent(sessionId)}/live` : '';
  }
  get configured() { return Boolean(this.url); }
  connect(onEvent: (event: RealtimeEvent) => void, onStatus: (status: 'connected' | 'connecting' | 'reconnecting' | 'disconnected') => void) {
    this.close();
    const generation = ++this.generation;
    if (!this.url) { onStatus('disconnected'); return () => undefined; }
    let closedByCaller = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const open = () => {
      if (closedByCaller || generation !== this.generation) return;
      onStatus(attempts ? 'reconnecting' : 'connecting');
      let socket: WebSocket;
      try { socket = new WebSocket(this.url); } catch { onStatus('disconnected'); return; }
      this.socket = socket;
      socket.onopen = () => {
        if (generation !== this.generation || socket !== this.socket) return;
        attempts = 0; onStatus('connected');
      };
      socket.onmessage = message => {
        if (generation !== this.generation || socket !== this.socket) return;
        try {
          const parsed: unknown = JSON.parse(String(message.data));
          if (isEvent(parsed)) onEvent(parsed);
        } catch { /* Ignore malformed server frames; never promote them into UI state. */ }
      };
      socket.onerror = () => { if (generation === this.generation && socket === this.socket) onStatus('reconnecting'); };
      socket.onclose = () => {
        if (generation !== this.generation || socket !== this.socket || closedByCaller) return;
        attempts += 1;
        onStatus('reconnecting');
        retryTimer = setTimeout(open, Math.min(12000, 650 * 2 ** Math.min(attempts - 1, 4)));
      };
    };
    open();
    return () => {
      closedByCaller = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (generation === this.generation) this.close();
    };
  }
  send(command: RealtimeCommand) {
    if (this.socket?.readyState !== WebSocket.OPEN) return false;
    this.socket.send(JSON.stringify(command));
    return true;
  }
  close() {
    this.generation += 1;
    const active = this.socket;
    this.socket = null;
    if (active) { active.onclose = null; active.onmessage = null; active.onerror = null; active.onopen = null; active.close(); }
  }
}
