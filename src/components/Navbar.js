import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { user, logout }                        = useAuth();
  const { notifications, unreadCount, markAllRead, clearAll } = useSocket();
  const navigate                                = useNavigate();
  const [showNotif, setShowNotif]               = useState(false);
  const notifRef                                = useRef();

  const handleLogout = () => { logout(); navigate('/login'); };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleNotif = () => {
    setShowNotif(prev => !prev);
    if (!showNotif) markAllRead();
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    return `${Math.floor(diff/3600)}h ago`;
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🌱 CleanCity</Link>

      {user ? (
        <div className="navbar-links">
          {user.role === 'citizen' && <>
            <Link to="/reports"     className="nav-link">Reports</Link>
            <Link to="/leaderboard" className="nav-link">🏆 Leaderboard</Link>
            <Link to="/profile"     className="nav-link">My Profile</Link>
          </>}
          {user.role === 'admin' &&
            <Link to="/admin" className="nav-admin-btn">Admin Panel</Link>}
          {user.role === 'driver' &&
            <Link to="/driver" className="nav-link">My Tasks</Link>}

          <span className="nav-badge">⭐ {user.points} pts</span>
          <span className="nav-badge">{user.role}</span>

          {/* Notification Bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={toggleNotif}
              style={{
                background:   'rgba(255,255,255,0.15)',
                border:       '1px solid rgba(255,255,255,0.3)',
                color:        '#fff',
                width:        36,
                height:       36,
                borderRadius: '50%',
                cursor:       'pointer',
                fontSize:     16,
                position:     'relative',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center'
              }}>
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position:   'absolute',
                  top:        -4,
                  right:      -4,
                  background: '#ef4444',
                  color:      '#fff',
                  fontSize:   10,
                  fontWeight: 700,
                  width:      18,
                  height:     18,
                  borderRadius: '50%',
                  display:    'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border:     '2px solid #1D9E75'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotif && (
              <div style={{
                position:     'absolute',
                top:          44,
                right:        0,
                width:        320,
                background:   '#fff',
                borderRadius: 14,
                boxShadow:    '0 8px 32px rgba(0,0,0,0.18)',
                border:       '1px solid #eee',
                zIndex:       1000,
                overflow:     'hidden'
              }}>
                {/* Header */}
                <div style={{
                  padding:        '14px 16px',
                  borderBottom:   '1px solid #f0f0f0',
                  display:        'flex',
                  justifyContent: 'space-between',
                  alignItems:     'center',
                  background:     '#f9fafb'
                }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>
                    Notifications
                  </span>
                  {notifications.length > 0 && (
                    <button onClick={clearAll} style={{
                      background: 'none', border: 'none',
                      fontSize: 12, color: '#1D9E75',
                      cursor: 'pointer', fontWeight: 500
                    }}>Clear all</button>
                  )}
                </div>

                {/* List */}
                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                      <p style={{ fontSize: 28, marginBottom: 8 }}>🔕</p>
                      <p style={{ fontSize: 14, color: '#888' }}>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{
                        padding:      '12px 16px',
                        borderBottom: '1px solid #f5f5f5',
                        display:      'flex',
                        gap:          12,
                        alignItems:   'flex-start',
                        background:   n.read ? '#fff' : '#f0faf5',
                        transition:   'background 0.2s'
                      }}>
                        <span style={{
                          fontSize:       20,
                          width:          36,
                          height:         36,
                          background:     '#edfaf4',
                          borderRadius:   '50%',
                          display:        'flex',
                          alignItems:     'center',
                          justifyContent: 'center',
                          flexShrink:     0
                        }}>{n.icon}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, color: '#111', marginBottom: 3, lineHeight: 1.5 }}>
                            {n.message}
                          </p>
                          <p style={{ fontSize: 11, color: '#aaa' }}>{timeAgo(n.time)}</p>
                        </div>
                        {!n.read && (
                          <span style={{
                            width: 8, height: 8,
                            background: '#1D9E75',
                            borderRadius: '50%',
                            flexShrink: 0,
                            marginTop: 4
                          }} />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="nav-btn">Logout</button>
        </div>
      ) : (
        <div className="navbar-links">
          <Link to="/login"    className="nav-link">Login</Link>
          <Link to="/register" className="nav-admin-btn">Register</Link>
        </div>
      )}
    </nav>
  );
}