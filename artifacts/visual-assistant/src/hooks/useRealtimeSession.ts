import { useCallback, useEffect, useRef, useState } from 'react';
import { RealtimeSocket } from '../services/realtimeSocket';
import type { ConnectionStatus, PresentationState, RealtimeCommand, RealtimeEvent, RealtimeSnapshot, TopicCompletion, TranscriptEntry, Visual } from '../types';

const transcriptLimit = 80;
export function useRealtimeSession(sessionId: string): RealtimeSnapshot {
  const socketRef = useRef<RealtimeSocket | null>(null);
  const [connection, setConnection] = useState<ConnectionStatus>('connecting');
  const [state, setState] = useState<PresentationState | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
  const [visual, setVisual] = useState<Visual | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [topicUpdates, setTopicUpdates] = useState<Record<string, TopicCompletion>>({});
  const [resumePending, setResumePending] = useState(false);
  const [resumeMessage, setResumeMessage] = useState<string>();
  const [revision, setRevision] = useState(0);
  const stateRef = useRef<PresentationState | null>(null);
  const unlockRequested = useRef(false);
  const lockRequested = useRef(false);
  const eventIds = useRef(new Set<string>());
  const lastSequence = useRef<number | null>(null);
  useEffect(() => {
    stateRef.current = null;
    unlockRequested.current = false;
    lockRequested.current = false;
    eventIds.current.clear();
    lastSequence.current = null;
    setConnection('connecting');
    setState(null);
    setConfidence(null);
    setCurrentTopicId(null);
    setVisual(null);
    setTranscript([]);
    setTopicUpdates({});
    setResumePending(false);
    setResumeMessage(undefined);
  }, [sessionId]);
  useEffect(() => {
    let alive = true;
    const service = new RealtimeSocket(sessionId);
    socketRef.current = service;
    const handleEvent = (event: RealtimeEvent) => {
      if (!alive) return;
      if ('eventId' in event && event.eventId) {
        if (eventIds.current.has(event.eventId)) return;
        eventIds.current.add(event.eventId);
        if (eventIds.current.size > 600) eventIds.current.delete(eventIds.current.values().next().value as string);
      }
      if ('sequence' in event && typeof event.sequence === 'number') {
        if (lastSequence.current !== null && event.sequence <= lastSequence.current) return;
        lastSequence.current = event.sequence;
      }
      switch (event.type) {
        case 'transcript': setTranscript(items => [...items, { id: `${Date.now()}-${items.length}`, text: event.text, timestamp: event.timestamp }].slice(-transcriptLimit)); break;
        case 'topic_update':
          setTopicUpdates(items => ({ ...items, [event.topicId]: event.completion }));
          if (event.completion === 'in_progress') setCurrentTopicId(event.topicId);
          else if (event.completion === 'completed') setCurrentTopicId(current => current === event.topicId ? null : current);
          break;
        case 'state_update':
          if ((stateRef.current === 'MANUAL_LOCK' || lockRequested.current) && event.state !== 'MANUAL_LOCK' && !unlockRequested.current) break;
          stateRef.current = event.state;
          unlockRequested.current = false;
          lockRequested.current = false;
          if (event.confidence !== undefined) setConfidence(event.confidence);
          setState(event.state); if (event.state !== 'RESUME_PENDING') setResumePending(false);
          break;
        case 'visual_update':
          if (stateRef.current === 'MANUAL_LOCK' || lockRequested.current) break;
          setVisual(event.visual);
          break;
        case 'connection_status': setConnection(event.status); break;
        case 'resume_pending':
          if (stateRef.current === 'MANUAL_LOCK') break;
          stateRef.current = 'RESUME_PENDING';
          setResumePending(true); setResumeMessage(event.message ?? event.reason); setState('RESUME_PENDING'); break;
      }
    };
    const connect = () => service.connect(handleEvent, status => { if (alive) setConnection(status); });
    const disconnect = connect();
    return () => { alive = false; disconnect(); service.close(); socketRef.current = null; };
  }, [sessionId, revision]);
  const sendCommand = useCallback((command: RealtimeCommand) => {
    const sent = socketRef.current?.send(command) ?? false;
    if (sent && command.type === 'set_state' && command.state === 'ACTIVE' && stateRef.current === 'MANUAL_LOCK') unlockRequested.current = true;
    if (sent && command.type === 'set_state' && command.state === 'MANUAL_LOCK') lockRequested.current = true;
    return sent;
  }, []);
  const reconnect = useCallback(() => setRevision(value => value + 1), []);
  return { connection, state, confidence, currentTopicId, visual, transcript, topicUpdates, resumePending, resumeMessage, sendCommand, reconnect };
}
