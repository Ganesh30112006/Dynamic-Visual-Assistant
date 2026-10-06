import type { Session } from '../types';
import { isSession } from '../utils/sessionValidation';

const STORAGE_KEY = 'dynamic-visual-assistant.sessions.v1';
const newId = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function readSessions(): Session[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every(isSession)) throw new Error('Saved session data is invalid.');
    return parsed;
  } catch { throw new Error('Saved sessions could not be read. Browser storage may be unavailable or invalid.'); }
}
function writeSessions(sessions: Session[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}
export const sessionRepository = {
  async list(): Promise<Session[]> { return readSessions().sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
  async get(id: string): Promise<Session | undefined> { return readSessions().find(session => session.id === id); },
  async save(input: Omit<Session, 'id' | 'createdAt'>, id?: string): Promise<Session> {
    const sessions = readSessions();
    const existing = id ? sessions.find(session => session.id === id) : undefined;
    const session: Session = { ...input, id: existing?.id ?? id ?? newId(), createdAt: existing?.createdAt ?? new Date().toISOString() };
    writeSessions(existing ? sessions.map(item => item.id === session.id ? session : item) : [session, ...sessions]);
    return session;
  },
  async remove(id: string): Promise<void> { writeSessions(readSessions().filter(session => session.id !== id)); },
};
