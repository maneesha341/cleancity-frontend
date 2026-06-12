import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const medals = ['🥇', '🥈', '🥉'];
const rankColors = ['#EF9F27', '#888', '#CD7F32'];

export default function Leaderboard() {
  const { user, refreshUser } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    const load = async () => {
      // Refresh points from server first
      await refreshUser(user.token);
      const { data } = await axios.get('/api/leaderboard', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setLeaders(data);
      const rank = data.findIndex(l => l._id === user._id);
      setMyRank(rank >= 0 ? rank + 1 : null);
      setLoading(false);
    };
    load();
  }, []);

  const medals = ['🥇', '🥈', '🥉'];
  const rankColors = ['#EF9F27', '#888', '#CD7F32'];

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 24px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1D9E75, #0F6E56)', borderRadius: 16, padding: '32px', color: '#fff', marginBottom: 32, textAlign: 'center' }}>
        <p style={{ fontSize: 48, marginBottom: 8 }}>🏆</p>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Green Leaderboard</h1>
        <p style={{ opacity: 0.85, marginBottom: 20 }}>Top recyclers in your city — earn points by reporting waste!</p>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px 32px' }}>
          <p style={{ fontSize: 32, fontWeight: 700 }}>{user.points}</p>
          <p style={{ fontSize: 13, opacity: 0.85 }}>Your Points</p>
        </div>
        {myRank && (
          <p style={{ marginTop: 12, fontSize: 14, opacity: 0.85 }}>
            Your rank: <strong>#{myRank}</strong> out of {leaders.length} citizens
          </p>
        )}
      </div>

      {/* How to earn points */}
      <div style={{ background: '#EAF3DE', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {[
          { action: 'Report a bin', points: '+10 pts' },
          { action: 'Report recyclable waste', points: '+10 pts' },
          { action: 'Report hazardous waste', points: '+10 pts' },
        ].map(item => (
          <div key={item.action} style={{ flex: 1, minWidth: 140, textAlign: 'center' }}>
            <p style={{ fontWeight: 600, color: '#1D9E75', fontSize: 16 }}>{item.points}</p>
            <p style={{ fontSize: 13, color: '#3B6D11' }}>{item.action}</p>
          </div>
        ))}
      </div>

      {/* Leaderboard List */}
      <h2 style={{ marginBottom: 16, fontSize: 18 }}>Top Citizens</h2>

      {loading ? (
        <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>Loading leaderboard...</p>
      ) : leaders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: '#f9f9f9', borderRadius: 12 }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>📭</p>
          <p style={{ color: '#888' }}>No citizens on the leaderboard yet.</p>
        </div>
      ) : (
        leaders.map((leader, index) => {
          const isMe = leader._id === user._id;
          const isMedal = index < 3;
          return (
            <div key={leader._id} style={{
              background: isMe ? '#EAF3DE' : '#fff',
              border: isMe ? '2px solid #1D9E75' : '1px solid #eee',
              borderRadius: 12, padding: '16px 20px', marginBottom: 10,
              display: 'flex', alignItems: 'center', gap: 16
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: isMedal ? rankColors[index] + '22' : '#f5f5f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isMedal ? 22 : 15, fontWeight: 600,
                color: isMedal ? rankColors[index] : '#888', flexShrink: 0
              }}>
                {isMedal ? medals[index] : `#${index + 1}`}
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: isMe ? '#1D9E75' : '#378ADD',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 600, fontSize: 16, flexShrink: 0
              }}>
                {leader.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                  {leader.name}
                  {isMe && <span style={{ fontSize: 12, background: '#1D9E75', color: '#fff', padding: '1px 8px', borderRadius: 10, marginLeft: 6 }}>You</span>}
                </p>
                <p style={{ fontSize: 12, color: '#888' }}>
                  Member since {new Date(leader.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: isMedal ? rankColors[index] : '#1D9E75' }}>
                  {leader.points}
                </p>
                <p style={{ fontSize: 12, color: '#888' }}>points</p>
              </div>
            </div>
          );
        })
      )}

      <div style={{ textAlign: 'center', padding: '24px 0', color: '#888', fontSize: 14 }}>
        <p>Keep reporting waste to climb the leaderboard! 🌱</p>
      </div>
    </div>
  );
}