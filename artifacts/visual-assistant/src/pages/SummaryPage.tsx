import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sessionRepository } from '../services/sessionRepository';
import type { Session } from '../types';

const measures = ['Duration','Topics completed','Topics in progress','Topics not started','Visuals shown','Manual overrides','Pauses'];
export default function SummaryPage() {
  const {sessionId=''}=useParams(); const [session,setSession]=useState<Session|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  useEffect(()=>{let alive=true;sessionRepository.get(sessionId).then(item=>{if(alive){setSession(item??null);if(!item)setError('This session could not be found in this browser.')}}).catch(()=>{if(alive)setError('Saved session data could not be read from this browser.')}).finally(()=>{if(alive)setLoading(false)});return()=>{alive=false}},[sessionId]);
  if(loading)return <div className="page"><div className="skeleton"/></div>;
  if(!session)return <div className="page"><section className="empty-state"><h3>Summary unavailable</h3><p>{error || 'This session could not be found in this browser.'}</p><Link className="btn btn-secondary" to="/sessions">Back to sessions</Link></section></div>;
  return <div className="page"><div className="breadcrumb"><Link to={`/sessions/${sessionId}`}>{session.title}</Link><span>/</span><span>Summary</span></div><div className="page-header"><div><p className="eyebrow">After the lecture</p><h1>Session summary</h1><p className="subtitle">Only backend-supplied session analytics are shown here. No summary data has been received.</p></div><Link className="btn btn-secondary" to={`/sessions/${sessionId}`}><ArrowLeft size={15}/> Overview</Link></div>
    <div className="summary-grid">{measures.map(value=><div className="card summary-value" key={value}><span>{value}</span><strong className="unavailable">Unavailable</strong></div>)}</div>
    <section className="empty-state"><h3>Summary data hasn’t been supplied</h3><p>Duration, topic counts, visual count, manual overrides, and pauses remain unavailable until the backend provides them.</p><Link className="btn btn-secondary" to="/sessions">Return to sessions</Link></section>
  </div>;
}
