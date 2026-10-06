import type { ConnectionStatus } from '../types';

const labels: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  connecting: 'Connecting',
  reconnecting: 'Reconnecting',
  disconnected: 'Disconnected',
};
export default function StatusPill({ status }: { status: ConnectionStatus }) {
  return <span className={`connection-pill ${status}`} role="status" aria-live="polite">
    <span className="connection-dot"/>{labels[status]}
  </span>;
}
