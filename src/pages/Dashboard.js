import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const { user } = useAuth();
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${user.token}` };

  useEffect(() => {
    axios.get('/api/reports', { headers }).then(r => { setMyReports(r.data); setLoading(false); });
  }, []);

  const pending   = myReports.filter(r => r.status === 'pending').length;
  const collected = myReports.filter(r => r.status === 'collected').length;
  const resolved  = myReports.filter(r => r.status === 'resolved').length;

  const statusClass = { pending:'badge-pending', assigned:'badge-assigned', collected:'badge-collected', resolved:'badge-resolved' };

  return (
    <div className="page" style={{ maxWidth: 860 }}>
      {/* Hero Banner */}
      <div className="hero-banner">
        <h1>Welcome back, {user.name} 👋</h1>
        <p>Help keep your city clean — every report makes a difference.</p>
        <div className="hero-stats">
          <div className="hero-stat"><div className="hero-stat-val">{user.points}</div><div className="hero-stat-label">Green Points</div></div>
          <div className="hero-stat"><div className="hero-stat-val">{myReports.length}</div><div className="hero-stat-label">Total Reports</div></div>
          <div className="hero-stat"><div className="hero-stat-val">{collected + resolved}</div><div className="hero-stat-label">Resolved</div></div>
          <div className="hero-stat"><div className="hero-stat-val">{pending}</div><div className="hero-stat-label">Pending</div></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-title">Quick Actions</div>
      <div className="action-grid">
        {[
          { icon: '🗑️', title: 'Report a Bin', desc: 'Flag overflowing or hazardous waste near you', path: '/reports', color: 'var(--green-main)' },
          { icon: '📋', title: 'My Reports',   desc: 'Track status of your submitted reports',       path: '/reports', color: 'var(--blue-main)' },
          { icon: '🏆', title: 'Leaderboard',  desc: 'See top recyclers and check your city rank',   path: '/leaderboard', color: 'var(--amber-main)' },
          { icon: '👤', title: 'My Profile',   desc: 'View your level, badges, and activity stats',  path: '/profile', color: 'var(--purple-main)' },
        ].map(item => (
          <Link to={item.path} className="action-card" key={item.title}
            style={{ borderTop: `3px solid ${item.color}` }}>
            <span className="action-icon">{item.icon}</span>
            <p className="action-title">{item.title}</p>
            <p className="action-desc">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="section-title" style={{ marginTop: 8 }}>
        Recent Reports
        <span className="section-badge">{myReports.length}</span>
      </div>
      {loading ? (
        <div className="spinner-wrapper"><div className="spinner"></div></div>
      ) : myReports.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p className="empty-title">No reports submitted yet</p>
          <p className="empty-desc">Start reporting waste to earn green points!</p>
          <Link to="/reports"><button className="btn btn-primary">Submit First Report</button></Link>
        </div>
      ) : (
        myReports.slice(0, 4).map(r => (
          <div className="report-card" key={r._id}>
            <div style={{ flex: 1 }}>
              <p className="report-title">{r.title}</p>
              <p className="report-location">📍 {r.location?.address}</p>
              <p className="report-date">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="report-badges">
              <span className={`badge ${statusClass[r.status]}`}>{r.status}</span>
            </div>
          </div>
        ))
      )}
      {myReports.length > 4 && (
        <Link to="/reports" style={{ fontSize: 14, color: 'var(--green-main)', fontWeight: 500 }}>
          View all {myReports.length} reports →
        </Link>
      )}
    </div>
  );
}