import { Link } from 'react-router-dom';
import { ArrowRight, CircleHelp, Server, Wifi } from 'lucide-react';

export default function SettingsPage() {
  const apiConfigured=Boolean(import.meta.env.VITE_API_BASE_URL);
  const wsConfigured=Boolean(import.meta.env.VITE_WS_BASE_URL);
  return <div className="page"><div className="page-header"><div><p className="eyebrow">Connection &amp; storage</p><h1>Settings</h1><p className="subtitle">A straightforward view of how this cockpit is configured. Live content is provided by your session service, never generated in the browser.</p></div></div>
    <section className="card settings-card">
      <div className="settings-row"><div><strong><Server size={15}/> Session API adapter</strong><p>{apiConfigured?'An API base URL is present. Session definitions remain browser-persisted; this workspace does not assume server sync.':'No API base URL configured. Session outlines use browser storage.'}</p></div><span className={`status-tag ${apiConfigured?'active':''}`}>{apiConfigured?'URL present':'Not configured'}</span></div>
      <div className="settings-row"><div><strong><Wifi size={15}/> Realtime service</strong><p>{wsConfigured?'WebSocket base URL is configured.':'No WebSocket base URL configured. Live sessions remain disconnected.'}</p></div><span className={`status-tag ${wsConfigured?'active':''}`}>{wsConfigured?'Configured':'Not configured'}</span></div>
      <div className="settings-row"><div><strong>Session definitions</strong><p>Created and edited outlines are stored locally in this browser when no session API is connected.</p></div><Link className="btn btn-secondary" to="/sessions">View sessions <ArrowRight size={14}/></Link></div>
      <div className="settings-row"><div><strong><CircleHelp size={15}/> During a lecture</strong><p>Manual controls require a connected service. Focus keeps speech recognition active and pauses visual switching. Resume requests always wait for service confirmation.</p></div></div>
    </section>
  </div>;
}
