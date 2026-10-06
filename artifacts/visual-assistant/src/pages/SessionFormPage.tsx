import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { sessionRepository } from '../services/sessionRepository';
import type { Session, Topic } from '../types';

const makeTopic = (): Topic => ({ id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`, name: '', subtopics: [], completion: null });
const blankSession = (): Omit<Session, 'id' | 'createdAt'> => ({ title: '', subject: '', description: '', estimatedDurationMinutes: 50, topics: [makeTopic()], status: 'planned' });

export default function SessionFormPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blankSession);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!sessionId) return;
    let alive = true;
    sessionRepository.get(sessionId).then(session => {
      if (!alive) return;
      if (!session) setLoadError('This session could not be found in this browser.');
      else setForm({ title: session.title, subject: session.subject, description: session.description ?? '', estimatedDurationMinutes: session.estimatedDurationMinutes, topics: session.topics, status: session.status });
      setLoading(false);
    }).catch(() => { if (alive) { setLoadError('The saved session could not be opened.'); setLoading(false); } });
    return () => { alive = false; };
  }, [sessionId]);
  const updateTopic = (id: string, patch: Partial<Topic>) => setForm(current => ({ ...current, topics: current.topics.map(topic => topic.id === id ? { ...topic, ...patch } : topic) }));
  const moveTopic = (index: number, direction: -1 | 1) => setForm(current => {
    const next = [...current.topics]; const target = index + direction;
    if (target < 0 || target >= next.length) return current;
    [next[index], next[target]] = [next[target], next[index]];
    return { ...current, topics: next };
  });
  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = 'Add a session title.';
    if (!form.subject.trim()) next.subject = 'Add a subject.';
    if (!Number.isFinite(form.estimatedDurationMinutes) || form.estimatedDurationMinutes < 1 || form.estimatedDurationMinutes > 600) next.duration = 'Duration must be between 1 and 600 minutes.';
    if (!form.topics.length) next.topics = 'Add at least one topic.';
    form.topics.forEach((topic, index) => { if (!topic.name.trim()) next[`topic-${topic.id}`] = `Topic ${index + 1} needs a name.`; });
    if (new Set(form.topics.map(topic => topic.id)).size !== form.topics.length) next.topics = 'Each topic must have a unique ID. Remove and re-add duplicate topics before saving.';
    setErrors(next); return Object.keys(next).length === 0;
  };
  const persist = async (start: boolean) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const saved = await sessionRepository.save({ ...form, title: form.title.trim(), subject: form.subject.trim(), description: form.description?.trim(), topics: form.topics.map(topic => ({ ...topic, name: topic.name.trim(), subtopics: topic.subtopics.map(item => item.trim()).filter(Boolean) })) }, sessionId);
      navigate(start ? `/sessions/${saved.id}/live` : sessionId ? `/sessions/${saved.id}` : '/sessions');
    } catch { setErrors({ form: 'Could not save this session in browser storage. Check available storage and try again.' }); }
    finally { setSaving(false); }
  };
  if (loading) return <div className="page"><div className="skeleton"/></div>;
  if (loadError) return <div className="page"><section className="empty-state"><h3>Session unavailable</h3><p>{loadError}</p><Link className="btn btn-secondary" to="/sessions">Back to sessions</Link></section></div>;
  return <div className="page">
    <div className="breadcrumb"><Link to="/sessions">Sessions</Link><span>/</span><span>{sessionId ? 'Edit session' : 'New session'}</span></div>
    <div className="page-header"><div><p className="eyebrow">Prepare the outline</p><h1>{sessionId ? 'Edit session' : 'New session'}</h1><p className="subtitle">Set the structure. Topic completion and live visuals are supplied by the connected session service during a lecture.</p></div></div>
    <section className="card form-card">
      <div className="field-grid">
        <div className="field"><label htmlFor="session-title">Session title</label><input id="session-title" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="e.g. Reading the climate record" aria-invalid={Boolean(errors.title)}/>{errors.title && <span className="field-error">{errors.title}</span>}</div>
        <div className="field"><label htmlFor="session-duration">Estimated duration (minutes)</label><input id="session-duration" type="number" min="1" max="600" value={form.estimatedDurationMinutes} onChange={event => setForm({ ...form, estimatedDurationMinutes: Number(event.target.value) })} aria-invalid={Boolean(errors.duration)}/>{errors.duration && <span className="field-error">{errors.duration}</span>}</div>
        <div className="field"><label htmlFor="session-subject">Subject</label><input id="session-subject" value={form.subject} onChange={event => setForm({ ...form, subject: event.target.value })} placeholder="e.g. Earth systems" aria-invalid={Boolean(errors.subject)}/>{errors.subject && <span className="field-error">{errors.subject}</span>}</div>
         <div className="field"><label htmlFor="session-description">Description <span style={{fontWeight:400}}>(optional)</span></label><textarea id="session-description" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="A brief note for your preparation"/></div>
      </div>
    </section>
    <section className="card form-card">
      <div className="section-heading" style={{margin:'0 0 8px'}}><div><h2>Topic flow</h2><p className="small-note">Reorder topics to shape the lecture. Add subtopics as useful prompts.</p></div><button className="btn btn-secondary" type="button" onClick={() => setForm(current => ({...current, topics:[...current.topics, makeTopic()]}))}><Plus size={15}/> Add topic</button></div>
      {errors.topics && <span className="field-error">{errors.topics}</span>}
      <div className="topic-list">{form.topics.map((topic, index) => <div className="topic-editor" key={topic.id}>
        <div className="topic-editor-head"><div><label className="sr-only" htmlFor={`topic-${topic.id}`}>Topic {index + 1} name</label><input id={`topic-${topic.id}`} className="topic-name-input" value={topic.name} onChange={event => updateTopic(topic.id, {name:event.target.value})} placeholder={`Topic ${index + 1}`} aria-invalid={Boolean(errors[`topic-${topic.id}`])}/>{errors[`topic-${topic.id}`] && <span className="field-error">{errors[`topic-${topic.id}`]}</span>}</div>
          <div className="topic-actions"><button className="btn-icon" type="button" aria-label={`Move topic ${index + 1} up`} disabled={index===0} onClick={() => moveTopic(index,-1)}><ArrowUp size={15}/></button><button className="btn-icon" type="button" aria-label={`Move topic ${index + 1} down`} disabled={index===form.topics.length-1} onClick={() => moveTopic(index,1)}><ArrowDown size={15}/></button><button className="btn-icon" type="button" aria-label={`Delete topic ${index + 1}`} onClick={() => setForm(current => ({...current,topics:current.topics.filter(item=>item.id!==topic.id)}))}><Trash2 size={15}/></button></div>
        </div>
        <div className="subtopic-area"><label>Subtopics</label>{topic.subtopics.map((subtopic, subIndex) => <div className="subtopic-row" key={`${topic.id}-${subIndex}`}><input className="subtopic-input" aria-label={`Subtopic ${subIndex+1} for topic ${index+1}`} value={subtopic} onChange={event => updateTopic(topic.id,{subtopics:topic.subtopics.map((item,i)=>i===subIndex?event.target.value:item)})} placeholder="Add a prompt or supporting idea"/><button className="btn-icon" type="button" aria-label={`Remove subtopic ${subIndex+1}`} onClick={() => updateTopic(topic.id,{subtopics:topic.subtopics.filter((_,i)=>i!==subIndex)})}><X size={14}/></button></div>)}<button className="text-button" type="button" onClick={() => updateTopic(topic.id,{subtopics:[...topic.subtopics,'']})}><Plus size={13}/> Add subtopic</button></div>
      </div>)}</div>
      {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
      <div className="form-footer"><Link className="btn btn-quiet" to={sessionId ? `/sessions/${sessionId}` : '/sessions'}>Cancel</Link><div className="form-footer-right"><button className="btn btn-secondary" disabled={saving} onClick={() => void persist(false)}>{saving ? 'Saving…' : 'Save session'}</button><button className="btn btn-primary" disabled={saving} onClick={() => void persist(true)}>Start session</button></div></div>
    </section>
  </div>;
}
