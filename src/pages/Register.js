import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ name: '', email: '', password: '', role: 'citizen' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/');
    } catch { setError('Registration failed. Email may already be in use.'); setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🌿</div>
          <h2 className="auth-title">Join CleanCity</h2>
          <p className="auth-subtitle">Create your account and start making a difference</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Full name</label>
          <input className="form-input" placeholder="Your full name"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input className="form-input" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Min. 6 characters"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-select" value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="citizen">🏠 Citizen</option>
            <option value="driver">🚛 Driver</option>
            <option value="admin">🛡️ Admin</option>
          </select>
        </div>
        <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}
          style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--green-main)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}