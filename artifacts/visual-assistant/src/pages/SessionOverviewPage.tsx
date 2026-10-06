import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock3, Pencil, Radio, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sessionRepository } from '../services/sessionRepository';
import type { Session } from '../types';

export default function SessionOverviewPage() {
  const { sessionId = '' } = useParams(); const navigate = useNavigate();
  const [session,setSession] = useState<Session | null>(null); const [loading,setLoading] = useState(true); const [error,setError] = useState('');
  const load = () => { setLoading(true); sessionRepository.get(sessionId).then(item => { setSession(item ?? null); setError(item ? '' : 'This session is not available in this browser.'); }).catch(() => setError('Could not open this session.')).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [sessionId]);
  const remove = async () => { if (!session || !window.confirm(`Delete “${session.title}”? This only removes the saved session outline from this browser.`)) return; try { await sessionRepository.remove(session.id); navigate('/sessions'); } catch { setError('Could not delete this session.'); } };
  if (loading) return <div className="page"><div className="skeleton"/></div>;
  if (!session || error) return <div className="page"><section className="empty-state"><h3>Session unavailable</h3><p>{error || 'This session could not be found.'}</p><button className="btn btn-secondary" onClick={load}>Try again</button><Link className="btn btn-quiet" to="/sessions">Back to sessions</Link></section></div>;
  return <div className="page">
    <div className="breadcrumb"><Link to="/sessions">Sessions</Link><span>/</span><span>Overview</span></div>
    <div className="page-header"><div><p className="eyebrow">{session.subject}</p><h1>{session.title}</h1><p className="subtitle">{session.description || 'A prepared outline for your lecture. Live context and visual state appear only when supplied by the connected session service.'}</p></div><div className="live-controls"><Link className="btn btn-secondary" to={`/sessions/${session.id}/edit`}><Pencil size={15}/> Edit</Link><button className="btn btn-quiet" onClick={() => void remove()} aria-label="Delete session"><Trash2 size={15}/></button></div></div>
    <div className="overview-grid">
      <section className="card overview-topics"><div className="section-heading" style={{margin:'0 0 12px'}}><h2>Planned topic flow</h2><span className={`status-tag ${session.status==='active'?'active':''}`}>{session.status.replaceAll('_',' ')}</span></div>
        {session.topics.map((topic,index)=><div className="topic-overview" key={topic.id}><strong>{String(index+1).padStart(2,'0')} &nbsp; {topic.name}</strong>{topic.subtopics.length>0&&<p>{topic.subtopics.join(' · ')}</p>}</div>)}
        {!session.topics.length&&<p className="small-note">No topics have been added to this outline.</p>}
      </section>
      <aside className="card overview-side"><p className="eyebrow">Session details</p><dl><div><dt>Subject</dt><dd>{session.subject}</dd></div><div><dt>Estimated duration</dt><dd><Clock3 size={13}/> {session.estimatedDurationMinutes} min</dd></div><div><dt>Planned topics</dt><dd>{session.topics.length}</dd></div></dl><Link className="btn btn-primary" style={{width:'100%'}} to={`/sessions/${session.id}/live`}><Radio size={15}/> Open live cockpit</Link><Link className="btn btn-secondary" style={{width:'100%',marginTop:8}} to={`/sessions/${session.id}/summary`}>Session summary <ArrowRight size={14}/></Link><Link className="text-button" style={{marginTop:10}} to="/sessions"><ArrowLeft size={13}/> All sessions</Link></aside>
    </div>
  </div>;
}
