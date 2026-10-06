import { NavLink, Outlet } from 'react-router-dom';
import { AudioLines, Settings2 } from 'lucide-react';

export default function AppLayout() {
  return <div className="app-shell">
    <header className="topbar">
      <NavLink to="/" className="brand" aria-label="Dynamic Visual Assistant home">
        <span className="brand-mark"><AudioLines size={17} strokeWidth={2.2}/></span>
        <span>Dynamic Visual Assistant</span>
      </NavLink>
      <nav className="topnav" aria-label="Main navigation">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Home</NavLink>
        <NavLink to="/sessions" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Sessions</NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><Settings2 size={15}/> <span>Settings</span></NavLink>
      </nav>
      <div className="nav-tools"><span className="connection-pill" title="Live connection is shown inside a session"><span className="connection-dot"/> Ready when you are</span></div>
    </header>
    <main><Outlet/></main>
  </div>;
}
