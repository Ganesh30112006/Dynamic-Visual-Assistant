import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Circle, LockKeyhole, Pause, RefreshCw, Sparkles, UnlockKeyhole } from 'lucide-react';
import { sessionRepository } from '../services/sessionRepository';
import { useRealtimeSession } from '../hooks/useRealtimeSession';
import type { PresentationState, RealtimeCommand, Session, Visual } from '../types';
import StatusPill from '../components/StatusPill';
import VisualViewer from '../components/VisualViewer';
import TranscriptPanel from '../components/TranscriptPanel';

const stateLabels: Record<PresentationState, string> = { ACTIVE:'Active', FOCUS:'Focus', EXAMPLE:'Example', DISCUSSION:'Discussion', Q_AND_A:'Q&A', MANUAL_LOCK:'Manual lock', RESUME_PENDING:'Resume pending' };
const stateChoices: PresentationState[] = ['ACTIVE','EXAMPLE','DISCUSSION','Q_AND_A'];

export default function LivePage() {
  const { sessionId = '' } = useParams(); const navigate = useNavigate();
  const [session,setSession] = useState<Session | null>(null); const [loading,setLoading] = useState(true); const [loadError,setLoadError]=useState('');
  const [toast,setToast] = useState('');
  const [transcriptVisible,setTranscriptVisible] = useState(true);
  const realtime = useRealtimeSession(sessionId);
  useEffect(() => { let alive=true; sessionRepository.get(sessionId).then(item=>{if(alive){setSession(item??null);setLoadError(item?'':'This saved session could not be found in this browser.')}}).catch(()=>{if(alive)setLoadError('Saved session data could not be read from this browser.')}).finally(()=>{if(alive)setLoading(false)}); return()=>{alive=false}; },[sessionId]);
  useEffect(() => { if(!toast) return; const timer=setTimeout(()=>setToast(''),3800); return()=>clearTimeout(timer); },[toast]);
  const request = (command: RealtimeCommand, success: string) => {
    if (realtime.connection !== 'connected' || !realtime.sendCommand(command)) { setToast('Not sent. The session service is not connected; no control change was applied.'); return false; }
    setToast(success); return true;
  };
  const sendState = (state: PresentationState) => request({type:'set_state',state}, `${stateLabels[state]} request sent. Waiting for backend confirmation.`);
  const endSession = () => {
    if (!window.confirm('End this live session and open its summary?')) return;
    if (realtime.connection === 'connected') {
      if (!realtime.sendCommand({type:'end_session'})) {
        setToast('The end command could not be sent. Opening summary without changing backend state.');
        window.setTimeout(()=>navigate(`/sessions/${sessionId}/summary`),1100);
      } else navigate(`/sessions/${sessionId}/summary`);
    } else {
      setToast('Disconnected: no end command was sent. Opening the summary view.');
      window.setTimeout(()=>navigate(`/sessions/${sessionId}/summary`),1100);
    }
  };
  if (loading) return <div className="page"><div className="skeleton"/></div>;
  if (!session) return <div className="page"><section className="empty-state"><h3>Session unavailable</h3><p>{loadError || 'This saved session could not be found in this browser.'}</p><Link className="btn btn-secondary" to="/sessions">Back to sessions</Link></section></div>;
  const currentState = realtime.state;
  const liveConfirmed = realtime.connection === 'connected';
  const currentTopicIndex = session.topics.findIndex(topic => topic.id === realtime.currentTopicId);
  const currentTopic = currentTopicIndex >= 0 ? session.topics[currentTopicIndex] : undefined;
  const nextTopic = currentTopicIndex >= 0 ? session.topics[currentTopicIndex + 1] : undefined;
  const confidencePercent = realtime.confidence === null ? '—' : `${Math.round(realtime.confidence * 100)}%`;
  return <div className="page">
    <div className="breadcrumb"><Link to={`/sessions/${sessionId}`}>{session.title}</Link><span>/</span><span>Live cockpit</span></div>
    <div className="live-toolbar"><div><p className="live-title">{session.title}</p><div className="live-statusline"><StatusPill status={realtime.connection}/><span>{liveConfirmed ? 'LIVE · Connected to session service' : 'Not live · waiting for session service'}</span><span className={`presentation-state${currentState ? ` ${currentState.toLowerCase()}` : ''}`} aria-live="polite">State · {currentState ? stateLabels[currentState] : 'Awaiting service'}</span></div></div>
      <div className="live-controls"><button className="btn btn-secondary" onClick={realtime.reconnect}><RefreshCw size={15}/> Reconnect</button><button className="btn btn-primary" onClick={endSession}>End session</button></div>
    </div>
    {realtime.connection !== 'connected' && <div className="callout" role="status" style={{marginBottom:16}}>{realtime.connection === 'connecting' ? 'Connecting to the session service. No transcript or visual has been received yet.' : realtime.connection === 'reconnecting' ? 'Connection interrupted. Reconnecting automatically; the last confirmed state and visual are preserved.' : 'Disconnected. Live speech and visual updates are unavailable. State and current visual are preserved; LIVE is not active.'}</div>}
    <div className="live-layout">
      <section className="visual-stage" aria-label="Current lecture visual">
        <div className="visual-stage-head"><span>Current visual</span><span>{realtime.visual ? realtime.visual.type : 'Waiting for connected service'}</span></div>
        <div className="visual-content">{realtime.visual ? <VisualViewer key={`${realtime.visual.id}-${realtime.visual.src ?? ''}`} visual={realtime.visual}/> :
          <div className="visual-placeholder"><div className="visual-icon"><Circle size={22}/></div><p className="eyebrow">Presentation canvas</p><h2>No visual supplied</h2><p>When connected, visuals appear here only when the session service sends them. This space is intentionally clear until then.</p></div>}</div>
      </section>
      <aside className="live-side">
        <section className="card control-panel"><h3><LockKeyhole size={15}/> Teacher controls</h3>
          <div className="manual-controls">
            <button className="btn btn-secondary" disabled={!liveConfirmed || currentState==='FOCUS' || currentState==='MANUAL_LOCK'} onClick={()=>sendState('FOCUS')}><Pause size={15}/> Pause visuals</button>
            <button className="btn btn-secondary" disabled={!liveConfirmed || (currentState!=='FOCUS'&&currentState!=='MANUAL_LOCK')} onClick={()=>sendState('ACTIVE')}><UnlockKeyhole size={15}/> Resume visuals</button>
            {currentState==='MANUAL_LOCK'
              ? <button className="btn btn-primary" disabled={!liveConfirmed} onClick={()=>sendState('ACTIVE')}><UnlockKeyhole size={15}/> Unlock</button>
              : <button className="btn btn-secondary" disabled={!liveConfirmed || !realtime.visual} onClick={()=>sendState('MANUAL_LOCK')}><LockKeyhole size={15}/> Lock current visual</button>}
            <button className="btn btn-secondary" disabled={!liveConfirmed || !realtime.visual || currentState==='MANUAL_LOCK'} onClick={()=>request({type:'visual_navigation',direction:'previous'},'Previous visual requested. Waiting for backend update.')}><ChevronLeft size={15}/> Previous visual</button>
            <button className="btn btn-secondary" disabled={!liveConfirmed || !realtime.visual || currentState==='MANUAL_LOCK'} onClick={()=>request({type:'visual_navigation',direction:'next'},'Next visual requested. Waiting for backend update.')}><ChevronRight size={15}/> Next visual</button>
            <button className="btn btn-secondary" disabled={!liveConfirmed || currentState==='MANUAL_LOCK'} onClick={()=>request({type:'show_alternative'},'Alternative requested. Waiting for backend update.')}><Sparkles size={15}/> Show alternative</button>
          </div>
          <div className="state-options" aria-label="Presentation state override">{stateChoices.map(state=><button key={state} className={`state-option${currentState===state?' selected':''}`} disabled={!liveConfirmed || currentState==='MANUAL_LOCK'} onClick={()=>sendState(state)}>{stateLabels[state]}{currentState===state&&<span aria-label="Confirmed by service">Confirmed</span>}</button>)}</div>
          <p className="small-note">{currentState==='FOCUS'&&liveConfirmed?'Speech recognition remains active; visual switching is paused until the service confirms a state change.':currentState==='FOCUS'?'Focus is the last confirmed state. Speech status is unavailable while disconnected; the last visual is preserved.':currentState==='MANUAL_LOCK'?'Manual lock remains in effect until you explicitly unlock it.':currentState==='RESUME_PENDING'?'The service is waiting for your decision. Nothing resumes automatically.':'Controls are sent as manual requests. The displayed state or visual changes only after backend confirmation.'}</p>
        </section>
        {realtime.resumePending&&<section className="resume-banner" role="alert"><strong>Possible transition detected</strong><p>{realtime.resumeMessage || 'The service is asking whether to resume after focus. It has not assumed your understanding.'}</p><div className="resume-actions"><button className="btn btn-primary" disabled={!liveConfirmed} onClick={()=>request({type:'resume',decision:'resume'},'Resume request sent. Waiting for confirmation.')}>Resume</button><button className="btn btn-secondary" disabled={!liveConfirmed} onClick={()=>request({type:'resume',decision:'stay_focused'},'Stay-focused request sent.')}>Stay focused</button></div></section>}
        <section className="card control-panel"><h3>Session context</h3><div className="context-grid"><div className="context-value"><span>Current topic</span><strong>{currentTopic?.name || (liveConfirmed?'Awaiting topic update':'Unavailable while disconnected')}</strong></div><div className="context-value"><span>Next topic</span><strong>{nextTopic?.name || '—'}</strong></div><div className="context-value"><span>AI confidence</span><strong>{confidencePercent}</strong></div></div><div className="topic-progress">{session.topics.map(topic=>{const completion=realtime.topicUpdates[topic.id];return <div className={`topic-progress-row${realtime.currentTopicId===topic.id?' current':''}`} key={topic.id}><span className="progress-mark">{completion==='completed'?<Check size={13}/>:completion==='in_progress'?<span className="progress-dot"/>:<Circle size={12}/>}</span><span>{topic.name}</span><span className="progress-label">{completion==='completed'?'Covered':completion==='in_progress'?'In progress':'Not reported'}</span></div>})}{!session.topics.length&&<p className="small-note">No planned topics in this session.</p>}</div></section>
        <TranscriptPanel entries={realtime.transcript} visible={transcriptVisible} connected={liveConfirmed} onToggle={()=>setTranscriptVisible(value=>!value)}/>
        {currentState==='FOCUS'&&<p className="small-note focus-note">{liveConfirmed?'Speech recognition active · visual switching paused':'Last confirmed mode: Focus. Speech status is unavailable while disconnected.'}</p>}
      </aside>
    </div>
    {toast&&<div className="toast" role="status">{toast}</div>}
  </div>;
}
