import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ProjectList from '../components/ProjectList';
import ProjectForm from '../components/ProjectForm';
import AboutEditor from '../components/AboutEditor.jsx';
import Inbox from '../components/Inbox.jsx';

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [projectSubView, setProjectSubView] = useState('list');
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Login failed: ' + error.message);
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- 1. LOGIN SCREEN ---
  if (!session) {
    return (
      <div className="admin-login" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#c9c9c9', fontFamily: '"Montserrat", "Noto Sans Bengali", sans-serif' }}>
        <form className="admin-login-form" onSubmit={handleLogin} style={{ background: '#e0e0e0', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid #efdccf' }}>
          <h2 style={{ textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '20px', margin: '0 0 10px 0', color: '#333' }}>Admin Login</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #e8d6c8', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #e8d6c8', outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            style={{ padding: '14px', background: '#c65f20', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px', marginTop: '10px' }}
          >
            {authLoading ? 'LOGGING IN...' : 'LOG IN'}
          </button>
        </form>
      </div>
    );
  }

  // --- 2. MAIN DASHBOARD ---
  const menuItems = ['Overview', 'Projects', 'About Us', 'Collections', 'People', 'Journal', 'Inbox', 'Analytics', 'Services', 'FAQs', 'Settings'];

  return (
    <div className="admin-dashboard" style={{ display: 'flex', height: '100vh', background: '#c9c9c9', fontFamily: '"Montserrat", "Noto Sans Bengali", sans-serif', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div className="admin-sidebar" style={{ width: '240px', borderRight: '1px solid #efdccf', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '30px 20px', background: '#e0e0e0' }}>
        <div>
          <div className="admin-brand" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', letterSpacing: '2px', margin: '0 0 5px 0', fontWeight: '900', color: '#111' }}>Akkhorekha Architects</h2>
            <span style={{ fontSize: '11px', letterSpacing: '1.5px', color: '#888', textTransform: 'uppercase' }}>Admin</span>
          </div>

          <div className="admin-nav" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {menuItems.map((item) => {
              const isActive = activeTab.toLowerCase() === item.toLowerCase();
              return (
                <button
                  key={item}
                  onClick={() => setActiveTab(item.toLowerCase())}
                  style={{
                    textAlign: 'left',
                    background: isActive ? '#c65f20' : 'transparent',
                    color: isActive ? '#fff' : '#444',
                    border: 'none',
                    padding: '12px 16px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    borderRadius: '5px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Info & Logout Button */}
        <div className="admin-user" style={{ borderTop: '1px solid #efdccf', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session?.user?.email}</span>
          <button
            onClick={handleLogout}
            style={{ background: '#c65f20', color: '#fff', border: 'none', textAlign: 'center', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}
          >
            SIGN OUT
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-main" style={{ flex: 1, padding: '40px 50px', overflowY: 'auto', background: '#c9c9c9' }}>
        {activeTab === 'inbox' ? (
          <Inbox />
        ) : activeTab === 'about us' ? (
          <AboutEditor />
        ) : activeTab === 'projects' ? (
          <div className="w-full">
            {projectSubView === 'list' ? (
              <ProjectList
                onNewProject={() => {
                  setSelectedProjectId(null);
                  setProjectSubView('form');
                }}
                onEditProject={(id) => {
                  setSelectedProjectId(id);
                  setProjectSubView('form');
                }}
              />
            ) : (
              <ProjectForm
                projectId={selectedProjectId}
                onBack={() => {
                  setProjectSubView('list');
                  setSelectedProjectId(null);
                }}
              />
            )}
          </div>
        ) : (
          <div style={{ padding: '30px', background: '#fff', borderRadius: '8px', border: '1px solid #efdccf' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'capitalize', color: '#333' }}>{activeTab}</h2>
            <p style={{ color: '#666', marginTop: '10px' }}>This section is currently under development.</p>
          </div>
        )}
      </div>
    </div>
  );
}