import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Form state for New Project
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [location, setLocation] = useState('Dhaka');
  const [year, setYear] = useState('2026');
  const [files, setFiles] = useState([]);

  // Auth Session check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Projects/Posts
  const fetchProjects = async () => {
    setFetchLoading(true);
    setFetchError('');
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching data:', error.message);
      setFetchError('Could not load content. Please try again.');
    } else {
      setProjects(data);
    }
    setFetchLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session]);

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Login failed: ' + error.message);
    }
    setAuthLoading(false);
  };

  // Logout Handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Add Project Handler
  const handleAddProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    const imageUrls = [];
    const uploadedPaths = [];

    for (const [index, file] of files.entries()) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${index}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        if (uploadedPaths.length > 0) {
          const { error: cleanupError } = await supabase.storage
            .from('portfolio-images')
            .remove(uploadedPaths);
          if (cleanupError) console.error('Error cleaning up uploaded images:', cleanupError.message);
        }
        alert('Image upload failed: ' + uploadError.message);
        setLoading(false);
        return;
      }

      uploadedPaths.push(fileName);
      const { data: urlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName);
      imageUrls.push(urlData.publicUrl);
    }

    const { error: insertError } = await supabase.from('posts').insert([
      { title, content: subtitle, section: activeTab, images: imageUrls, location, year }
    ]);

    if (insertError) {
      if (uploadedPaths.length > 0) {
        const { error: cleanupError } = await supabase.storage
          .from('portfolio-images')
          .remove(uploadedPaths);
        if (cleanupError) console.error('Error cleaning up uploaded images:', cleanupError.message);
      }
      alert('Error adding project: ' + insertError.message);
    } else {
      setTitle('');
      setSubtitle('');
      setFiles([]);
      setShowModal(false);
      fetchProjects();
    }
    setLoading(false);
  };

  // Delete Project Handler
  const handleDelete = async (id, imageUrls) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const filePaths = imageUrls
      .map((imageUrl) => imageUrl.split('/portfolio-images/')[1])
      .filter(Boolean);
    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('portfolio-images')
        .remove(filePaths);
      if (storageError) console.error('Error removing images:', storageError.message);
    }

    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) alert('Delete failed: ' + error.message);
    else fetchProjects();
  };

  // --- 1. LOGIN SCREEN ---
  if (!session) {
    return (
      <div className="admin-login" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fff8f2', fontFamily: '"Montserrat", "Noto Sans Bengali", sans-serif' }}>
        <form className="admin-login-form" onSubmit={handleLogin} style={{ background: '#faf9f7', padding: '40px', borderRadius: '8px', border: '1px solid #efdccf', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '20px', margin: '0 0 10px 0' }}>Admin Login</h2>
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
            style={{ padding: '14px', background: '#c65f20', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', letterSpacing: '1px', marginTop: '10px' }}
          >
            {authLoading ? 'LOGGING IN...' : 'LOG IN'}
          </button>
        </form>
      </div>
    );
  }

  // --- 2. DASHBOARD SCREEN WITH SIDEBAR ---
  const menuItems = ['Overview', 'Projects', 'Collections', 'People', 'Journal', 'Inbox', 'Analytics', 'Services', 'FAQs', 'Settings'];
  const visibleProjects = projects.filter((item) => {
    const matchesSection = activeTab === 'overview'
      || (item.section || '').toLowerCase() === activeTab;
    const searchText = `${item.title || ''} ${item.content || ''} ${item.location || ''} ${item.year || ''}`.toLowerCase();
    return matchesSection && searchText.includes(searchQuery.trim().toLowerCase());
  });

  return (
    <div className="admin-dashboard" style={{ display: 'flex', height: '100vh', background: '#fff8f2', fontFamily: '"Montserrat", "Noto Sans Bengali", sans-serif', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <div className="admin-sidebar" style={{ width: '240px', borderRight: '1px solid #efdccf', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '30px 20px', background: '#faf9f7' }}>
        <div>
          <div className="admin-brand" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', letterSpacing: '2px', margin: '0 0 5px 0', fontWeight: '900' }}>Akkhorekha Architects</h2>
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
                    color: isActive ? '#fff' : '#333',
                    border: 'none',
                    padding: '10px 14px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    borderRadius: '5px'
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Info & Sign Out */}
        <div className="admin-user" style={{ borderTop: '1px solid #efdccf', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.user.email}</span>
          <button 
            onClick={handleLogout}
            style={{ background: 'transparent', color: '#e53935', border: 'none', textAlign: 'left', padding: '0', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px' }}
          >
            SIGN OUT
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-main" style={{ flex: 1, padding: '40px 50px', overflowY: 'auto', background: '#fff8f2' }}>
        <div className="admin-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#888', letterSpacing: '1px' }}>{visibleProjects.length} SHOWN / {projects.length} TOTAL</span>
            <h1 style={{ fontSize: '28px', textTransform: 'capitalize', margin: '5px 0 0 0', fontWeight: '600' }}>{activeTab}</h1>
          </div>
          <div className="admin-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, location..."
              aria-label="Search content"
              style={{ width: '230px', maxWidth: '100%', padding: '11px 14px', border: '1px solid #e8d6c8', borderRadius: '5px', fontSize: '13px' }}
            />
            <button
              type="button"
              onClick={fetchProjects}
              disabled={fetchLoading}
              style={{ background: '#faf9f7', color: '#74401f', border: '1px solid #efdccf', padding: '11px 16px', fontWeight: 'bold', fontSize: '13px', cursor: fetchLoading ? 'wait' : 'pointer', borderRadius: '5px' }}
            >
              {fetchLoading ? 'LOADING...' : 'REFRESH'}
            </button>
            <button
              onClick={() => setShowModal(true)}
              style={{ background: '#c65f20', color: '#fff', border: 'none', padding: '12px 24px', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px', cursor: 'pointer', borderRadius: '5px' }}
            >
              NEW {activeTab.slice(0, -1).toUpperCase()}
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="admin-table" style={{ background: '#faf9f7', border: '1px solid #efdccf', borderRadius: '6px' }}>
          <div className="admin-table-row" style={{ display: 'grid', gridTemplateColumns: '50px 1.5fr 2fr 1.2fr 1fr 1fr 100px', padding: '15px 20px', borderBottom: '1px solid #efdccf', fontSize: '12px', fontWeight: 'bold', color: '#888', letterSpacing: '1px' }}>
            <span>#</span>
            <span>COVER</span>
            <span>PROJECT</span>
            <span>LOCATION</span>
            <span>YEAR</span>
            <span>STATUS</span>
            <span style={{ textAlign: 'right' }}>ACTIONS</span>
          </div>

          {fetchError && (
            <div role="alert" style={{ padding: '18px 20px', color: '#a33b2f', background: '#fff4f1', borderBottom: '1px solid #f5d6cd' }}>
              {fetchError}
              <button type="button" onClick={fetchProjects} style={{ marginLeft: '10px', border: 'none', background: 'transparent', color: '#a33b2f', textDecoration: 'underline', cursor: 'pointer' }}>Retry</button>
            </div>
          )}

          {fetchLoading && projects.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading content...</div>
          ) : visibleProjects.map((item, index) => (
            <div key={item.id} className="admin-table-row" style={{ display: 'grid', gridTemplateColumns: '50px 1.5fr 2fr 1.2fr 1fr 1fr 100px', padding: '15px 20px', borderBottom: '1px solid #f5ebe3', alignItems: 'center', fontSize: '14px' }}>
              <span style={{ color: '#888' }}>{String(index + 1).padStart(2, '0')}</span>
              <div>
                {(Array.isArray(item.images) ? item.images[0] : item.image_url) ? (
                  <img src={Array.isArray(item.images) ? item.images[0] : item.image_url} alt="" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '2px' }} />
                ) : (
                  <span style={{ fontSize: '12px', color: '#ccc' }}>No Image</span>
                )}
              </div>
              <div>
                <strong style={{ display: 'block' }}>{item.title}</strong>
                <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>{item.content}</span>
              </div>
              <span style={{ color: '#555' }}>{item.location || 'Dhaka'}</span>
              <span style={{ color: '#555' }}>{item.year || '2026'}</span>
              <div>
                <span style={{ background: '#c65f20', color: '#fff', padding: '4px 10px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', borderRadius: '3px' }}>LIVE</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button 
                  onClick={() => handleDelete(item.id, Array.isArray(item.images) ? item.images : item.image_url ? [item.image_url] : [])} 
                  style={{ background: 'transparent', color: '#e53935', border: '1px solid #ffcdd2', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '2px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!fetchLoading && visibleProjects.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              {searchQuery.trim()
                ? `No content matches "${searchQuery.trim()}".`
                : activeTab === 'overview'
                  ? 'No content found. Click "New" to add one.'
                  : `No content found in ${activeTab}. Click "New" to add one.`}
            </div>
          )}
        </div>
      </div>

      {/* Add New Modal */}
      {showModal && (
        <div className="admin-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form className="admin-modal-form" onSubmit={handleAddProject} style={{ background: '#faf9f7', padding: '40px', width: '100%', maxWidth: '500px', borderRadius: '8px', border: '1px solid #efdccf', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ margin: '0', fontSize: '20px', letterSpacing: '1px' }}>Add New {activeTab.slice(0, -1)}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>TITLE</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: '10px', border: '1px solid #e8d6c8', borderRadius: '4px', fontSize: '14px' }} placeholder="e.g. Mosque" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>SUBTITLE / CODE</label>
              <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={{ padding: '10px', border: '1px solid #e8d6c8', borderRadius: '4px', fontSize: '14px' }} placeholder="e.g. MOS" />
            </div>

            <div className="admin-modal-fields" style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>LOCATION</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={{ padding: '10px', border: '1px solid #e8d6c8', borderRadius: '4px', fontSize: '14px' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>YEAR</label>
                <input type="text" value={year} onChange={(e) => setYear(e.target.value)} style={{ padding: '10px', border: '1px solid #e8d6c8', borderRadius: '4px', fontSize: '14px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>PROJECT IMAGES</label>
              <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} style={{ fontSize: '14px' }} />
              {files.length > 0 && (
                <span style={{ fontSize: '12px', color: '#888' }}>{files.length} image{files.length === 1 ? '' : 's'} selected</span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#f6e8dc', color: '#74401f', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#c65f20', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}