import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${user.token}` };

  useEffect(() => {
    axios.get('/api/reports', { headers }).then(({ data }) => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  const total = reports.length;
  const pending = reports.filter(r => r.status === 'pending').length;
  const collected = reports.filter(r => r.status === 'collected').length;
  const resolved = reports.filter(r => r.status === 'resolved').length;

  const wasteBreakdown = {
    general: reports.filter(r => r.wasteType === 'general').length,
    recyclable: reports.filter(r => r.wasteType === 'recyclable').length,
    hazardous: reports.filter(r => r.wasteType === 'hazardous').length,
    organic: reports.filter(r => r.wasteType === 'organic').length,
  };

  const wasteColors = {
    general: '#888', recyclable: '#1D9E75', hazardous: '#E24B4A', organic: '#639922'
  };

  const levelInfo = () => {
    if (user.points >= 200) return { label: 'Eco Champion', color: '#EF9F27', icon: '🏆', next: null };
    if (user.points >= 100) return { label: 'Green Hero', color: '#1D9E75', icon: '🌟', next: 200 };
    if (user.points >= 50) return { label: 'Eco Warrior', color: '#378ADD', icon: '♻️', next: 100 };
    return { label: 'New Member', color: '#888', icon: '🌱', next: 50 };
  };
  const level = levelInfo();

  return (
    <div style={{ maxWidth: 750, margin: '40px auto', padding: '0 24px' }}>

      {/* Profile Card */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: 28, marginBottom: 24, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 32, fontWeight: 700, flexShrink: 0 }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>{user.name}</h1>
          <p style={{ color: '#666', marginBottom: 8 }}>{user.email}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ background: '#1D9E7522', color: '#1D9E75', fontSize: 13, padding: '3px 12px', borderRadius: 20, fontWeight: 500 }}>{user.role}</span>
            <span style={{ background: level.color + '22', color: level.color, fontSize: 13, padding: '3px 12px', borderRadius: 20 }}>{level.icon} {level.label}</span>
            <span style={{ background: '#EF9F2722', color: '#EF9F27', fontSize: 13, padding: '3px 12px', borderRadius: 20 }}>⭐ {user.points} pts</span>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 12, fontSize: 15 }}>Level Progress</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: '#666' }}>{level.icon} {level.label}</span>
          {level.next && <span style={{ fontSize: 13, color: '#888' }}>{user.points} / {level.next} pts to next level</span>}
          {!level.next && <span style={{ fontSize: 13, color: '#EF9F27' }}>🏆 Max Level!</span>}
        </div>
        {level.next && (
          <div style={{ background: '#f0f0f0', borderRadius: 20, height: 10, overflow: 'hidden' }}>
            <div style={{
              background: level.color,
              height: '100%',
              width: `${Math.min((user.points / level.next) * 100, 100)}%`,
              borderRadius: 20,
              transition: 'width 0.5s ease'
            }} />
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { icon: '🌱', label: 'New Member', pts: '0 pts' },
            { icon: '♻️', label: 'Eco Warrior', pts: '50 pts' },
            { icon: '🌟', label: 'Green Hero', pts: '100 pts' },
            { icon: '🏆', label: 'Eco Champion', pts: '200 pts' },
          ].map(l => (
            <div key={l.label} style={{ flex: 1, minWidth: 80, textAlign: 'center', padding: 8, background: '#f9f9f9', borderRadius: 8 }}>
              <p style={{ fontSize: 20, marginBottom: 2 }}>{l.icon}</p>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#444' }}>{l.label}</p>
              <p style={{ fontSize: 11, color: '#888' }}>{l.pts}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <h2 style={{ marginBottom: 14, fontSize: 17 }}>My Activity</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Reports', value: total, color: '#534AB7' },
          { label: 'Pending', value: pending, color: '#EF9F27' },
          { label: 'Collected', value: collected, color: '#1D9E75' },
          { label: 'Resolved', value: resolved, color: '#888' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: `2px solid ${s.color}22`, borderTop: `4px solid ${s.color}`, borderRadius: 10, padding: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 13, color: '#666' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Waste Type Breakdown */}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: 15 }}>Waste Type Breakdown</h3>
        {Object.entries(wasteBreakdown).map(([type, count]) => (
          <div key={type} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: '#444', textTransform: 'capitalize' }}>{type}</span>
              <span style={{ fontSize: 13, color: wasteColors[type], fontWeight: 600 }}>{count} reports</span>
            </div>
            <div style={{ background: '#f0f0f0', borderRadius: 20, height: 8, overflow: 'hidden' }}>
              <div style={{
                background: wasteColors[type],
                height: '100%',
                width: total > 0 ? `${(count / total) * 100}%` : '0%',
                borderRadius: 20
              }} />
            </div>
          </div>
        ))}
        {total === 0 && <p style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>No reports yet to analyze.</p>}
      </div>
    </div>
  );
}