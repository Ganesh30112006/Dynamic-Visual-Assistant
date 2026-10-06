export type TopicCompletion = 'not_started' | 'in_progress' | 'completed';
export interface Topic {
  id: string;
  name: string;
  subtopics: string[];
  completion: TopicCompletion | null;
}
export interface Session {
  id: string;
  title: string;
  subject: string;
  description?: string;
  estimatedDurationMinutes: number;
  topics: Topic[];
  status: string;
  createdAt: string;
}
export type VisualType = 'image' | 'diagram' | 'video' | 'chart' | 'equation' | 'interactive' | (string & {});
export interface Visual {
  id: string;
  type: VisualType;
  title?: string;
  description?: string;
  src?: string;
  content?: string;
  source?: string;
}
export type PresentationState = 'ACTIVE' | 'FOCUS' | 'EXAMPLE' | 'DISCUSSION' | 'Q_AND_A' | 'MANUAL_LOCK' | 'RESUME_PENDING';
export type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';
export type SessionSummary = {
  duration: number | null;
  topicCounts: { completed: number; inProgress: number; notStarted: number } | null;
  visualCount: number | null;
  manualOverrides: number | null;
  pauses: number | null;
};
type RealtimeMetadata = { eventId?: string; sequence?: number };
export type RealtimeEvent =
  | ({ type: 'transcript'; text: string; timestamp?: string } & RealtimeMetadata)
  | ({ type: 'topic_update'; topicId: string; completion: TopicCompletion } & RealtimeMetadata)
  | ({ type: 'state_update'; state: PresentationState; confidence?: number | null } & RealtimeMetadata)
  | ({ type: 'visual_update'; visual: Visual | null } & RealtimeMetadata)
  | ({ type: 'connection_status'; status: ConnectionStatus } & RealtimeMetadata)
  | ({ type: 'resume_pending'; message?: string; reason?: string } & RealtimeMetadata);
export type RealtimeCommand =
  | { type: 'set_state'; state: PresentationState }
  | { type: 'resume'; decision: 'resume' | 'stay_focused' }
  | { type: 'visual_navigation'; direction: 'previous' | 'next' }
  | { type: 'show_alternative' }
  | { type: 'end_session' };
export interface TranscriptEntry { id: string; text: string; timestamp?: string; }
export interface RealtimeSnapshot {
  connection: ConnectionStatus;
  state: PresentationState | null;
  confidence: number | null;
  currentTopicId: string | null;
  visual: Visual | null;
  transcript: TranscriptEntry[];
  topicUpdates: Record<string, TopicCompletion>;
  resumePending: boolean;
  resumeMessage?: string;
  sendCommand: (command: RealtimeCommand) => boolean;
  reconnect: () => void;
}
