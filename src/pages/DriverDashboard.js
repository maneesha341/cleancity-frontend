import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [collected, setCollected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const headers = { Authorization: `Bearer ${user.token}` };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await axios.get('/api/reports', { headers });
      // Backend already filters by driver — just split by status
      const pending = data.filter(r => r.status === 'assigned');
      const done = data.filter(r => r.status === 'collected');
      setTasks(pending);
      setCollected(done);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const markCollected = async (reportId) => {
    try {
      await axios.post('/api/collections', {
        reportId,
        notes: 'Collected by driver'
      }, { headers });
      setMsg('Marked as collected successfully!');
      fetchTasks();
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Failed to mark as collected.');
    }
  };

  const wasteColors = {
    general: '#888',
    recyclable: '#1D9E75',
    hazardous: '#E24B4A',
    organic: '#639922'
  };

  const wasteIcons = {
    general: '🗑️',
    recyclable: '♻️',
    hazardous: '⚠️',
    organic: '🌿'
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>

      {/* Header Banner */}
      <div style={{ background: '#378ADD', borderRadius: 14, padding: '28px 32px', color: '#fff', marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, marginBottom: 6 }}>Driver Panel 🚛</h1>
        <p style={{ opacity: 0.85, marginBottom: 20 }}>Welcome, {user.name}. Here are your collection tasks.</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '12px 24px', textAlign: 'center', minWidth: 100 }}>
            <p style={{ fontSize: 28, fontWeight: 700 }}>{tasks.length}</p>
            <p style={{ fontSize: 12, opacity: 0.85 }}>Pending Tasks</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '12px 24px', textAlign: 'center', minWidth: 100 }}>
            <p style={{ fontSize: 28, fontWeight: 700 }}>{collected.length}</p>
            <p style={{ fontSize: 12, opacity: 0.85 }}>Collected</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '12px 24px', textAlign: 'center', minWidth: 100 }}>
            <p style={{ fontSize: 28, fontWeight: 700 }}>{tasks.length + collected.length}</p>
            <p style={{ fontSize: 12, opacity: 0.85 }}>Total Assigned</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {msg && (
        <div style={{ background: '#EAF3DE', color: '#3B6D11', padding: '10px 16px', borderRadius: 8, marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
          <span>{msg}</span>
          <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B6D11' }}>✕</button>
        </div>
      )}

      {/* Pending Tasks */}
      <h2 style={{ marginBottom: 14, fontSize: 17 }}>
        Pending Tasks
        <span style={{ marginLeft: 10, background: '#378ADD22', color: '#378ADD', fontSize: 13, padding: '2px 10px', borderRadius: 20 }}>
          {tasks.length}
        </span>
      </h2>

      {loading ? (
        <p style={{ color: '#888', padding: 20 }}>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f9f9f9', borderRadius: 12, marginBottom: 28 }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>No pending tasks</p>
          <p style={{ color: '#888', fontSize: 14 }}>Admin has not assigned any tasks yet.</p>
        </div>
      ) : (
        tasks.map(task => (
          <div key={task._id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 20, marginBottom: 14, borderLeft: '4px solid #378ADD' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{wasteIcons[task.wasteType]}</span>
                  <p style={{ fontWeight: 600, fontSize: 16 }}>{task.title}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span>📍</span>
                  <p style={{ fontSize: 14, color: '#444' }}>{task.location?.address}</p>
                </div>
                {task.citizen && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span>👤</span>
                    <p style={{ fontSize: 13, color: '#666' }}>Reported by: {task.citizen.name}</p>
                  </div>
                )}
                {task.description && (
                  <p style={{ fontSize: 13, color: '#777', marginTop: 6, fontStyle: 'italic' }}>
                    "{task.description}"
                  </p>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <span style={{ background: wasteColors[task.wasteType] + '22', color: wasteColors[task.wasteType], fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>
                    {wasteIcons[task.wasteType]} {task.wasteType}
                  </span>
                  <span style={{ background: '#f0f0f0', color: '#888', fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => markCollected(task._id)}
                style={{ background: '#1D9E75', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', alignSelf: 'center' }}>
                ✓ Mark Collected
              </button>
            </div>
          </div>
        ))
      )}

      {/* Collected Tasks */}
      {collected.length > 0 && (
        <>
          <h2 style={{ marginBottom: 14, fontSize: 17, marginTop: 32 }}>
            Completed
            <span style={{ marginLeft: 10, background: '#1D9E7522', color: '#1D9E75', fontSize: 13, padding: '2px 10px', borderRadius: 20 }}>
              {collected.length}
            </span>
          </h2>
          {collected.map(task => (
            <div key={task._id} style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 10, borderLeft: '4px solid #1D9E75', opacity: 0.8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span>{wasteIcons[task.wasteType]}</span>
                    <p style={{ fontWeight: 500, fontSize: 15, color: '#444' }}>{task.title}</p>
                  </div>
                  <p style={{ fontSize: 13, color: '#888' }}>📍 {task.location?.address}</p>
                </div>
                <span style={{ background: '#1D9E7522', color: '#1D9E75', fontSize: 13, padding: '4px 14px', borderRadius: 20, fontWeight: 500 }}>
                  ✓ Collected
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}