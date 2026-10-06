import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import type { Visual } from '../types';

function safeSource(src?: string) {
  if (!src) return null;
  try {
    const url = new URL(src, window.location.href);
    return ['http:', 'https:', 'blob:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export default function VisualViewer({ visual }: { visual: Visual }) {
  const [failed, setFailed] = useState(false);
  const src = safeSource(visual.src);
  const title = visual.title || 'Lecture visual';
  const mediaType = visual.type === 'image' || visual.type === 'diagram' || visual.type === 'chart' || visual.type === 'equation';

  if (src && !failed && mediaType) {
    return (
      <figure className="visual-figure">
        <img className="visual-image" src={src} alt={title} onError={() => setFailed(true)} />
        {(visual.title || visual.description || visual.source) && (
          <figcaption className="visual-caption">
            {visual.title && <strong>{visual.title}</strong>}
            {visual.description && <span>{visual.description}</span>}
            {visual.source && <span>Source: {visual.source}</span>}
          </figcaption>
        )}
      </figure>
    );
  }

  if (src && !failed && visual.type === 'video') {
    return (
      <figure className="visual-figure">
        <video className="visual-image" src={src} controls onError={() => setFailed(true)} aria-label={title} />
        {(visual.title || visual.description || visual.source) && (
          <figcaption className="visual-caption">
            {visual.title && <strong>{visual.title}</strong>}
            {visual.description && <span>{visual.description}</span>}
            {visual.source && <span>Source: {visual.source}</span>}
          </figcaption>
        )}
      </figure>
    );
  }

  if (src && !failed && visual.type === 'interactive') {
    return <iframe className="visual-iframe" src={src} title={title} sandbox="allow-scripts allow-forms" referrerPolicy="no-referrer" />;
  }

  if (visual.type === 'equation' && visual.content?.trim() && !failed) {
    return (
      <figure className="visual-figure">
        <pre className="equation-content">{visual.content}</pre>
        {(visual.description || visual.source) && (
          <figcaption className="visual-caption">
            {visual.description && <span>{visual.description}</span>}
            {visual.source && <span>Source: {visual.source}</span>}
          </figcaption>
        )}
      </figure>
    );
  }

  const supported = ['image', 'diagram', 'chart', 'video', 'equation', 'interactive'].includes(visual.type);
  const unavailable = failed || !supported || Boolean(visual.src && !src) || (visual.type === 'equation' && !visual.content?.trim() && !src);
  return (
    <div className="visual-placeholder" role="status">
      <div className="visual-icon"><ImageIcon size={22} /></div>
      <p className="eyebrow">{unavailable ? 'Visual unavailable' : visual.type}</p>
      <h2>{visual.title || (unavailable ? 'This visual could not be displayed' : 'Equation unavailable')}</h2>
      <p>{visual.description || (visual.source ? `Source: ${visual.source}` : 'The session service did not supply a displayable visual for this item.')}</p>
    </div>
  );
}
