import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sessionRepository } from '../services/sessionRepository';
import type { Session } from '../types';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [error, setError] = useState('');
  const refresh = () => sessionRepository.list().then(setSessions).catch(() => setError('Your saved sessions could not be read. Please try again.'));
  useEffect(() => { void refresh(); }, []);
  return <div className="page">
    <div className="page-header"><div><p className="eyebrow">Your lecture plans</p><h1>Sessions</h1><p className="subtitle">Keep a clear outline ready for the room. Session definitions are stored in this browser.</p></div><Link className="btn btn-primary" to="/sessions/new"><Plus size={16}/> New session</Link></div>
    {error ? <section className="empty-state"><h3>Couldn’t load sessions</h3><p>{error}</p><button className="btn btn-secondary" onClick={() => { setError(''); void refresh(); }}>Try again</button></section> :
      sessions === null ? <div className="session-list"><div className="skeleton"/><div className="skeleton"/></div> :
      sessions.length ? <div className="session-list">{sessions.map(session => <article className="card session-row" key={session.id}>
        <div className="session-main"><h2 className="session-title">{session.title}</h2><div className="session-meta"><span>{session.subject}</span><span>{session.topics.length} topics</span><span><Clock3 size={13}/> {session.estimatedDurationMinutes} min</span><span className={`status-tag ${session.status === 'active' ? 'active' : ''}`}>{session.status}</span></div></div>
        <Link className="btn btn-secondary" to={`/sessions/${session.id}`}>Overview <ArrowRight size={14}/></Link>
      </article>)}</div> :
      <section className="empty-state"><h3>A clean slate</h3><p>Your prepared sessions will appear here. Start with a title, a subject, and the topics you plan to cover.</p><Link className="btn btn-primary" to="/sessions/new"><Plus size={16}/> Create a session</Link></section>}
  </div>;
}
