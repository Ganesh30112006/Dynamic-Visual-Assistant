import { memo } from 'react';
import { MessageSquareText } from 'lucide-react';
import type { TranscriptEntry } from '../types';

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  visible: boolean;
  connected: boolean;
  onToggle: () => void;
}

function TranscriptPanel({ entries, visible, connected, onToggle }: TranscriptPanelProps) {
  return (
    <section className="card control-panel">
      <div className="panel-heading">
        <h3><MessageSquareText size={15} /> Live transcript</h3>
        <button className="text-button" type="button" aria-expanded={visible} aria-controls="live-transcript-window" onClick={onToggle}>
          {visible ? 'Hide transcript' : 'Show transcript'}
        </button>
      </div>
      {visible && (
        <div className="transcript-box" id="live-transcript-window" aria-live="polite" aria-label="Incremental transcript">
          {entries.length
            ? entries.map(entry => <p className="transcript-line" key={entry.id}>{entry.text}</p>)
            : <p className="transcript-empty">{connected ? 'Waiting for transcript from the session service.' : 'Transcript appears when the live service is connected.'}</p>}
        </div>
      )}
    </section>
  );
}

export default memo(TranscriptPanel);
