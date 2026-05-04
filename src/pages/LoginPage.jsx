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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1e', position: 'relative', overflow: 'hidden' }}>

      {/* Background pattern */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.1) 0%, transparent 40%)', pointerEvents: 'none' }} />

      <div style={{ width: 380, position: 'relative', zIndex: 1 }}>

        {/* Lock icon */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 }}>🔐</div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase' }}>Authorized Access Only</div>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(30,27,75,0.8)', borderRadius: 18, padding: '36px 32px', border: '1px solid rgba(99,102,241,0.2)', backdropFilter: 'blur(16px)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6, textAlign: 'center' }}>Admin Sign In</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center', marginBottom: 28 }}>NitiGrow Internal Operations</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 6, letterSpacing: '.06em', textTransform: 'uppercase' }}>Email address</label>
              <input
                type="email"
                placeholder="admin@nitigrow.in"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="username"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 10 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 6, letterSpacing: '.06em', textTransform: 'uppercase' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="current-password"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 10 }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ background: 'var(--brand)', color: '#fff', padding: '12px', borderRadius: 10, fontSize: 15, fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .2s' }}
            >
              {loading ? <><Spinner size={16} /> Authenticating…</> : 'Sign In →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 11, marginTop: 20, letterSpacing: '.5px' }}>
          Monitored & audited access
        </p>
      </div>
    </div>
  );
}
