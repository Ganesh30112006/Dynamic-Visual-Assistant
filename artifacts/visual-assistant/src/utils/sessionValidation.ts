import type { Session, Topic, TopicCompletion } from '../types';

const completions: TopicCompletion[] = ['not_started', 'in_progress', 'completed'];

export function isTopic(value: unknown): value is Topic {
  if (!value || typeof value !== 'object') return false;
  const topic = value as Record<string, unknown>;
  return typeof topic.id === 'string'
    && topic.id.trim().length > 0
    && typeof topic.name === 'string'
    && Array.isArray(topic.subtopics)
    && topic.subtopics.every(item => typeof item === 'string')
    && (topic.completion === null || completions.includes(topic.completion as TopicCompletion));
}

export function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const session = value as Record<string, unknown>;
  if (
    typeof session.id !== 'string'
    || !session.id.trim()
    || typeof session.title !== 'string'
    || !session.title.trim()
    || typeof session.subject !== 'string'
    || !session.subject.trim()
    || typeof session.estimatedDurationMinutes !== 'number'
    || !Number.isFinite(session.estimatedDurationMinutes)
    || session.estimatedDurationMinutes < 1
    || session.estimatedDurationMinutes > 600
    || typeof session.status !== 'string'
    || typeof session.createdAt !== 'string'
    || !Array.isArray(session.topics)
    || !session.topics.every(isTopic)
    || new Set(session.topics.map(topic => topic.id)).size !== session.topics.length
  ) return false;
  return session.description === undefined || typeof session.description === 'string';
}
