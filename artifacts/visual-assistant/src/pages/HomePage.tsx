import { Link } from 'react-router-dom';
import { ArrowRight, Plus, Clock3, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sessionRepository } from '../services/sessionRepository';
import type { Session } from '../types';

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [error,setError]=useState('');
  const refresh=()=>{setError('');setSessions(null);sessionRepository.list().then(setSessions).catch(()=>setError('Saved sessions could not be read from this browser.'))};
  useEffect(() => { let live = true; sessionRepository.list().then(items => { if (live) setSessions(items); }).catch(()=>{if(live)setError('Saved sessions could not be read from this browser.')}); return () => { live = false; }; }, []);
  const recent = sessions?.slice(0, 3) ?? [];
  return <div className="page">
    <section className="welcome">
      <div>
        <p className="eyebrow">A steady hand behind the lecture</p>
        <h1>Your lecture, with room for the moment.</h1>
        <p>Prepare a topic flow, then keep your attention where it belongs: with the room. Visuals follow the live session only when the connected service supplies them.</p>
        <Link className="btn btn-primary btn-large" to="/sessions/new"><Plus size={17}/> Prepare a session</Link>
      </div>
      <aside className="welcome-aside">
        <strong>Teacher stays in control</strong>
        <p>Manual controls take priority. Focus pauses visual switching without stopping speech recognition.</p>
      </aside>
    </section>
    <div className="section-heading"><h2>Recent sessions</h2><Link className="text-button" to="/sessions">All sessions <ArrowRight size={14}/></Link></div>
    {error ? <section className="empty-state"><h3>Sessions unavailable</h3><p>{error}</p><button className="btn btn-secondary" onClick={refresh}>Try again</button></section> :
    sessions === null ? <div className="session-list"><div className="skeleton"/><div className="skeleton"/></div> :
      recent.length ? <div className="session-list">{recent.map(session => <article className="card session-row" key={session.id}>
        <div className="session-main"><h3 className="session-title">{session.title}</h3><div className="session-meta"><span>{session.subject}</span><span><BookOpen size={13}/> {session.topics.length} topics</span><span><Clock3 size={13}/> {session.estimatedDurationMinutes} min</span></div></div>
        <Link className="btn btn-secondary" to={`/sessions/${session.id}`}>Open <ArrowRight size={14}/></Link>
      </article>)}</div> :
      <section className="empty-state"><h3>No sessions prepared yet</h3><p>Create a session outline before your next lecture. Your definitions stay in this browser until you connect a session service.</p><Link className="btn btn-secondary" to="/sessions/new">Create your first session</Link></section>}
  </div>;
}
