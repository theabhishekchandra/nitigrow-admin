import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAdminStore } from '../store/adminStore';
import { Spinner } from '../components/ui';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [lockedInfo, setLockedInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const setAuth = useAdminStore(s => s.setAuth);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const idleReason = searchParams.get('reason') === 'idle';
  const [idleBannerDismissed, setIdleBannerDismissed] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const dismissIdleBanner = () => {
    setIdleBannerDismissed(true);
    const next = new URLSearchParams(searchParams);
    next.delete('reason');
    setSearchParams(next, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLockedInfo(null);
    setLoading(true);
    try {
      const { data } = await axios.post('/api/admin/login', form, { withCredentials: true });
      setAuth(data);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 423) {
        const retryAfter = err.response.data?.retryAfter;
        const seconds = Number(retryAfter) || 0;
        const minutes = Math.max(1, Math.ceil(seconds / 60));
        setLockedInfo({ minutes });
        setError('');
      } else {
        setLockedInfo(null);
        setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'grid', gridTemplateColumns: '1.1fr 1fr',
      background: 'var(--paper, var(--bg))',
      zIndex: 100,
    }}>
      {/* ── Hero pane ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #063527 0%, #0F7F5E 55%, #1F1A14 115%)',
        color: '#F5EFDF',
        display: 'flex', flexDirection: 'column',
        padding: '44px 56px',
      }}>
        {/* Rangoli motif — large */}
        <svg width="520" height="520" viewBox="0 0 520 520" style={{ position: 'absolute', right: -110, bottom: -110, opacity: .22 }}>
          <g stroke="#F5D78C" strokeWidth=".8" fill="none">
            {[80, 140, 200, 260].map(r => <circle key={r} cx="260" cy="260" r={r} />)}
            {[...Array(24)].map((_, i) => (
              <line key={i} x1="260" y1="260"
                x2={260 + Math.cos(i * 15 * Math.PI / 180) * 260}
                y2={260 + Math.sin(i * 15 * Math.PI / 180) * 260} />
            ))}
            {[...Array(12)].map((_, i) => {
              const a = i * 30 * Math.PI / 180;
              return <path key={i}
                d={`M ${260 + Math.cos(a) * 140} ${260 + Math.sin(a) * 140}
                    Q 260 260, ${260 + Math.cos(a + Math.PI / 6) * 140} ${260 + Math.sin(a + Math.PI / 6) * 140}`}
                fill="rgba(245,215,140,.1)" stroke="#F5D78C" strokeWidth=".6" />;
            })}
          </g>
        </svg>

        {/* Rangoli motif — small corner */}
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', left: -40, top: -40, opacity: .15 }}>
          <g stroke="#E8A94A" strokeWidth="1" fill="none">
            <circle cx="90" cy="90" r="40" />
            <circle cx="90" cy="90" r="60" />
            <circle cx="90" cy="90" r="80" strokeDasharray="2 4" />
          </g>
        </svg>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #16A37A 0%, #0F7F5E 60%, #063527 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.2)',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2 C 13 5, 13 8, 10 10 C 7 8, 7 5, 10 2 Z" fill="#F5EFDF"/>
              <path d="M10 18 C 7 15, 7 12, 10 10 C 13 12, 13 15, 10 18 Z" fill="#E8A94A"/>
              <circle cx="10" cy="10" r="1.4" fill="#F5EFDF"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>NitiGrow</div>
            <div style={{ fontSize: 9.5, color: 'rgba(245,215,140,.7)', marginTop: 3, letterSpacing: '.18em', fontWeight: 600 }}>व्यापार · ADMIN</div>
          </div>
        </div>

        {/* Main copy */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1, maxWidth: 540 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#F5D78C', textTransform: 'uppercase', marginBottom: 18 }}>
            ● Internal operations console
          </div>
          <h1 style={{
            fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 400,
            fontSize: 54, lineHeight: 1.05, letterSpacing: '-0.03em',
            marginBottom: 20,
          }}>
            Every signal,<br/>
            <span style={{ color: '#F5D78C', fontStyle: 'italic' }}>under watch</span>.
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(245,239,223,.75)', maxWidth: 460 }}>
            The control room behind NitiGrow.{' '}
            <span style={{ color: '#F5EFDF', fontWeight: 600 }}>Clients, billing, support, and platform health</span>,{' '}
            all in one warm place — only for the team at ARDYM.
          </p>

          <div style={{ display: 'flex', gap: 32, marginTop: 44 }}>
            {[
              { n: '12,400+', l: 'Businesses we power' },
              { n: '99.9%',   l: 'Platform uptime' },
              { n: '24 × 7',  l: 'On-call coverage' },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontSize: 28, letterSpacing: '-0.02em', color: '#F5D78C' }}>{s.n}</div>
                <div style={{ fontSize: 11, color: 'rgba(245,239,223,.55)', marginTop: 3, letterSpacing: '.04em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Security pillars card (replaces customer testimonial) */}
        <div style={{
          position: 'relative', zIndex: 1,
          padding: '14px 18px', borderRadius: 13,
          background: 'rgba(12,10,7,.3)',
          border: '1px solid rgba(245,215,140,.18)',
          backdropFilter: 'blur(6px)',
          display: 'flex', gap: 22, alignItems: 'center',
          maxWidth: 520,
        }}>
          {[
            { ico: '🔐', label: '2FA required' },
            { ico: '📋', label: 'Audit logged' },
            { ico: '⏱️', label: '30 min sessions' },
          ].map(p => (
            <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>{p.ico}</span>
              <span style={{ fontSize: 11.5, color: 'rgba(245,239,223,.85)', fontWeight: 500, letterSpacing: '.02em' }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form pane ────────────────────────────────────────────────── */}
      <div style={{
        padding: '44px 56px',
        display: 'flex', flexDirection: 'column',
        maxHeight: '100vh', overflowY: 'auto',
      }}>
        <div style={{ textAlign: 'right', fontSize: 12.5, color: 'var(--muted, var(--mute))' }}>
          Need access? <a href="mailto:ops@ardym.in" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Talk to ops →</a>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 400, margin: '0 auto', width: '100%' }}>
          <h2 style={{
            fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)',
            fontWeight: 500,
            fontSize: 34, color: 'var(--ink, var(--text))',
            letterSpacing: '-0.02em', lineHeight: 1.1,
            marginBottom: 8,
          }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--muted, var(--mute))', marginBottom: 24, lineHeight: 1.5 }}>
            Sign in to the operations console to continue.
          </p>

          {idleReason && !idleBannerDismissed && (
            <div style={{
              background: 'var(--accent-2-soft, rgba(232,169,74,.14))',
              border: '1px solid rgba(232,169,74,.35)',
              borderRadius: 10, padding: '10px 14px',
              color: 'var(--muted, #6B4A0F)', fontSize: 12.5, lineHeight: 1.5,
              marginBottom: 18,
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <span style={{ flex: 1 }}>
                You were signed out for inactivity. Sign in again to continue.
              </span>
              <button
                onClick={dismissIdleBanner}
                aria-label="Dismiss"
                style={{ background: 'transparent', border: 'none', color: 'var(--muted, #6B4A0F)', fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: '0 2px', flexShrink: 0 }}
              >×</button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', marginBottom: 14 }}>
              <div style={{ color: 'var(--muted, var(--mute))', marginBottom: 6, fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase' }}>Email</div>
              <input
                type="email" required
                autoComplete="username"
                value={form.email}
                onChange={set('email')}
                placeholder="you@ardym.in"
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1px solid var(--hair, var(--border))', borderRadius: 9,
                  background: 'var(--card)', fontSize: 14, outline: 'none',
                  color: 'var(--ink, var(--text))',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px var(--brand-ring, rgba(15,127,94,.16))'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--hair, var(--border))'; e.target.style.boxShadow = 'none'; }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--muted, var(--mute))', fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase' }}>Password</span>
              </div>
              <input
                type="password" required
                autoComplete="current-password"
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '11px 14px',
                  border: '1px solid var(--hair, var(--border))', borderRadius: 9,
                  background: 'var(--card)', fontSize: 14, outline: 'none',
                  color: 'var(--ink, var(--text))',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px var(--brand-ring, rgba(15,127,94,.16))'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--hair, var(--border))'; e.target.style.boxShadow = 'none'; }}
              />
            </label>

            {lockedInfo && (
              <div style={{
                background: 'rgba(192,59,59,0.08)',
                border: '1px solid rgba(192,59,59,0.28)',
                borderRadius: 8, padding: '12px 14px',
                color: 'var(--danger, #C03B3B)', fontSize: 13,
                marginBottom: 14,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Account locked</div>
                <div style={{ lineHeight: 1.5 }}>
                  Too many failed attempts. Try again in {lockedInfo.minutes} {lockedInfo.minutes === 1 ? 'minute' : 'minutes'}.
                </div>
              </div>
            )}

            {error && !lockedInfo && (
              <div style={{
                background: 'rgba(192,59,59,0.08)',
                border: '1px solid rgba(192,59,59,0.2)',
                borderRadius: 8, padding: '10px 14px',
                color: 'var(--danger, #C03B3B)', fontSize: 13,
                marginBottom: 14,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', opacity: loading ? .7 : 1 }}
            >
              {loading ? <><Spinner size={16} /> Authenticating…</> : 'Sign in'}
            </button>
          </form>

          <div style={{
            marginTop: 28, padding: '12px 14px',
            background: 'var(--accent-2-soft, rgba(232,169,74,.14))',
            border: '1px dashed var(--accent-2, #E8A94A)',
            borderRadius: 10, fontSize: 11.5, color: '#6B4A0F', lineHeight: 1.5,
          }}>
            <b>Monitored access.</b> Every action you take is recorded to the audit log. Sessions expire after 30 minutes idle.
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted-2, var(--muted))', marginTop: 20 }}>
          NitiGrow · An <b>ARDYM</b> product · Internal use only
        </div>
      </div>
    </div>
  );
}
