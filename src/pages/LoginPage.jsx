import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAdminStore } from '../store/adminStore';
import { Spinner } from '../components/ui';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAdminStore(s => s.setAuth);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/admin/login', form, { withCredentials: true });
      setAuth(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>

      <div style={{ width: 380, position: 'relative', zIndex: 1 }}>

        {/* Lock icon */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--muted)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' }}>Authorized Access Only</div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--card)', borderRadius: 16, padding: '32px 28px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 4, textAlign: 'center' }}>Sign in</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>Internal operations console</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, letterSpacing: '.06em', textTransform: 'uppercase' }}>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="username"
                className="input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, letterSpacing: '.06em', textTransform: 'uppercase' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="current-password"
                className="input"
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(192,59,59,0.08)', border: '1px solid rgba(192,59,59,0.2)', borderRadius: 8, padding: '10px 14px', color: 'var(--danger)', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: 4, padding: '11px', fontSize: 14 }}
            >
              {loading ? <><Spinner size={16} /> Authenticating…</> : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--muted-2)', fontSize: 11, marginTop: 20, letterSpacing: '.5px' }}>
          Monitored &amp; audited access
        </p>
      </div>
    </div>
  );
}
