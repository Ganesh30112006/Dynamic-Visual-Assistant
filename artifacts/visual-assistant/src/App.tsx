import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import SessionsPage from './pages/SessionsPage';
import SessionFormPage from './pages/SessionFormPage';
import SessionOverviewPage from './pages/SessionOverviewPage';
import LivePage from './pages/LivePage';
import SummaryPage from './pages/SummaryPage';
import SettingsPage from './pages/SettingsPage';

function NotFound() {
  return <div className="page"><section className="empty-state"><h3>Page not found</h3><p>The address may have changed. Return to your session workspace.</p><Link className="btn btn-secondary" to="/">Go home</Link></section></div>;
}
function App() {
  return <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
    <Routes><Route element={<AppLayout/>}>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/sessions" element={<SessionsPage/>}/>
      <Route path="/sessions/new" element={<SessionFormPage/>}/>
      <Route path="/sessions/:sessionId/edit" element={<SessionFormPage/>}/>
      <Route path="/sessions/:sessionId" element={<SessionOverviewPage/>}/>
      <Route path="/sessions/:sessionId/live" element={<LivePage/>}/>
      <Route path="/sessions/:sessionId/summary" element={<SummaryPage/>}/>
      <Route path="/settings" element={<SettingsPage/>}/>
      <Route path="*" element={<NotFound/>}/>
    </Route></Routes>
  </BrowserRouter>;
}
export default App;
