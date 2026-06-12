import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch { setError('Invalid email or password'); setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🌱</div>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your CleanCity account</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input className="form-input" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}
          style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          No account? <Link to="/register" style={{ color: 'var(--green-main)', fontWeight: 500 }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}