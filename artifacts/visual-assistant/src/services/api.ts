import type { Session } from '../types';
import { isSession } from '../utils/sessionValidation';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
export class ApiUnavailableError extends Error {
  constructor(message = 'No session API is configured.') { super(message); this.name = 'ApiUnavailableError'; }
}
async function request(path: string, init?: RequestInit): Promise<unknown> {
  if (!API_BASE) throw new ApiUnavailableError();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init, credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) throw new Error(`Session service returned ${response.status}.`);
  if (response.status === 204) return undefined;
  return response.json() as Promise<unknown>;
}
function parseSession(value: unknown): Session {
  if (!isSession(value)) throw new Error('Session service returned invalid session data.');
  return value;
}
async function parseSessionList(): Promise<Session[]> {
  const value = await request('/sessions');
  if (!Array.isArray(value) || !value.every(isSession)) throw new Error('Session service returned an invalid session list.');
  return value;
}
// Optional typed network adapter. Local session definitions remain available when no API is configured.
export const sessionApi = {
  configured: Boolean(API_BASE),
  list: parseSessionList,
  async get(id: string) { return parseSession(await request(`/sessions/${encodeURIComponent(id)}`)); },
  async create(session: Omit<Session, 'id' | 'createdAt'>) { return parseSession(await request('/sessions', { method: 'POST', body: JSON.stringify(session) })); },
  async update(id: string, session: Omit<Session, 'id' | 'createdAt'>) { return parseSession(await request(`/sessions/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(session) })); },
  async remove(id: string) { await request(`/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' }); },
};
