import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';
import { Badge, PageHeader, Section, Spinner, ConfirmModal } from '../components/ui';
import api from '../services/api';

const useLocalPref = (key, initial) => {
  const [v, setV] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw == null ? initial : JSON.parse(raw); }
    catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
};

const Toggle = ({ value, onChange, label, hint, disabled }) => (
  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-2, var(--border))', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1 }}>
    <button
      type="button"
      onClick={() => !disabled && onChange(!value)}
      role="switch"
      aria-checked={!!value}
      disabled={disabled}
      style={{
        flexShrink: 0, marginTop: 2,
        width: 34, height: 20, padding: 2,
        borderRadius: 999, border: 'none',
        background: value ? 'var(--brand)' : 'var(--border-3, var(--border))',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background .15s',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: value ? 16 : 2,
        width: 16, height: 16, borderRadius: '50%',
        background: '#FBF8F3',
        transition: 'left .15s',
      }} />
    </button>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</div>
      {hint && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>{hint}</div>}
    </div>
  </label>
);

const Segmented = ({ value, options, onChange }) => (
  <div style={{ display: 'inline-flex', background: 'var(--bg-2, var(--bg))', border: '1px solid var(--border)', borderRadius: 8, padding: 2 }}>
    {options.map(o => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        style={{
          padding: '4px 12px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: value === o.value ? 600 : 500,
          background: value === o.value ? 'var(--card)' : 'transparent',
          color: value === o.value ? 'var(--text)' : 'var(--muted)',
          boxShadow: value === o.value ? 'var(--shadow-sm)' : 'none',
        }}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const NAV_SECTIONS = [
  { id: 'profile',       label: 'Profile' },
  { id: 'security',      label: 'Security' },
  { id: 'preferences',   label: 'Preferences' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'sessions',      label: 'Sessions' },
];

const DEFAULT_NOTIFS = {
  newTicketUrgent: true,
  paymentFailed:   true,
  qualityDropped:  true,
  newSignup:       false,
  weeklyDigest:    true,
};

const parseUA = (ua = '') => {
  const s = String(ua);
  let browser = 'Browser';
  if (/Edg\//i.test(s)) browser = 'Edge';
  else if (/Chrome\//i.test(s) && !/Chromium/i.test(s)) browser = 'Chrome';
  else if (/Firefox\//i.test(s)) browser = 'Firefox';
  else if (/Safari\//i.test(s)) browser = 'Safari';
  else if (/Opera|OPR\//i.test(s)) browser = 'Opera';
  let os = 'device';
  if (/Mac OS X|Macintosh/i.test(s)) os = 'macOS';
  else if (/Windows NT/i.test(s)) os = 'Windows';
  else if (/Android/i.test(s)) os = 'Android';
  else if (/iPhone|iPad|iOS/i.test(s)) os = 'iOS';
  else if (/Linux/i.test(s)) os = 'Linux';
  return `${browser} on ${os}`;
};

const relTime = (iso) => {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (!t) return '—';
  const diff = Math.max(0, Date.now() - t);
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
};

const errMessage = (err, fallback = 'Something went wrong.') => {
  if (!err) return fallback;
  const status = err.response?.status;
  if (status === 404) return 'Endpoint not yet available.';
  if (status === 423) return 'Account is locked. Try again in a few minutes or contact a super-admin.';
  return err.response?.data?.message || err.response?.data?.error || err.message || fallback;
};

// Tiny inline QR — we don't ship a library, so render the otpauth:// URL as
// monospace text the user can copy into their authenticator app.
const OtpAuthBlock = ({ url, secret }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url || ''); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {}
  };
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, background: 'var(--bg-2, var(--bg))', marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>otpauth URL</div>
      <div style={{
        fontFamily: 'var(--f-mono, ui-monospace, monospace)',
        fontSize: 11.5, lineHeight: 1.5, color: 'var(--text)',
        wordBreak: 'break-all', userSelect: 'all',
        background: 'var(--card)', border: '1px solid var(--border-2, var(--border))',
        borderRadius: 6, padding: '8px 10px', marginBottom: 8,
      }}>
        {url || '—'}
      </div>
      {secret && (
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 8 }}>
          Or enter the secret manually: <span style={{ fontFamily: 'var(--f-mono, ui-monospace, monospace)', color: 'var(--text)', userSelect: 'all' }}>{secret}</span>
        </div>
      )}
      <button className="btn-secondary btn-sm" onClick={copy} type="button">{copied ? 'Copied ✓' : 'Copy URL'}</button>
    </div>
  );
};

export default function SettingsPage() {
  const { admin, theme, toggleTheme, logout, token, setAuth } = useAdminStore();
  const navigate = useNavigate();
  const [active, setActive] = useState('profile');

  const [density, setDensity] = useLocalPref('admin:density', 'compact');
  const [sidebarDefault, setSidebarDefault] = useLocalPref('admin:sidebar-default', 'expanded');
  const [lang, setLang] = useLocalPref('admin:language', 'en');

  useEffect(() => { document.documentElement.dataset.density = density; }, [density]);

  const handleLogout = () => { logout(); navigate('/login'); };

  /* ───────── Profile ───────── */
  const [name, setName] = useState(admin?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  useEffect(() => { setName(admin?.name || ''); }, [admin?.name]);

  const saveProfile = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === (admin?.name || '')) return;
    setProfileSaving(true); setProfileMsg(null);
    const prev = admin;
    setAuth({ accessToken: token, user: { ...prev, name: trimmed } });
    try {
      const { data } = await api.patch('/admin/profile', { name: trimmed });
      setAuth({ accessToken: token, user: data?.admin || { ...prev, name: trimmed } });
      setProfileMsg({ kind: 'ok', text: 'Saved.' });
      setTimeout(() => setProfileMsg(null), 1500);
    } catch (err) {
      setAuth({ accessToken: token, user: prev });
      setProfileMsg({ kind: 'err', text: errMessage(err, 'Could not save profile.') });
    } finally {
      setProfileSaving(false);
    }
  };

  /* ───────── Password ───────── */
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);

  const submitPassword = async (e) => {
    e?.preventDefault?.();
    setPwdMsg(null);
    if (pwd.next.length < 12) { setPwdMsg({ kind: 'err', text: 'New password must be at least 12 characters.' }); return; }
    if (pwd.next === pwd.current) { setPwdMsg({ kind: 'err', text: 'New password must differ from current.' }); return; }
    if (pwd.next !== pwd.confirm) { setPwdMsg({ kind: 'err', text: 'New password and confirmation do not match.' }); return; }
    setPwdSaving(true);
    try {
      await api.patch('/admin/password', { currentPassword: pwd.current, newPassword: pwd.next });
      setPwd({ current: '', next: '', confirm: '' });
      setPwdMsg({ kind: 'ok', text: 'Password updated.' });
    } catch (err) {
      setPwdMsg({ kind: 'err', text: errMessage(err, 'Could not update password.') });
    } finally {
      setPwdSaving(false);
    }
  };

  /* ───────── 2FA ───────── */
  const twoFAEnabled = !!admin?.twoFactorEnabled;
  const [setupData, setSetupData] = useState(null); // { otpauthUrl, secret }
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFABusy, setTwoFABusy] = useState(false);
  const [twoFAMsg, setTwoFAMsg] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [disablePwd, setDisablePwd] = useState('');
  const [showDisable, setShowDisable] = useState(false);

  const startSetup = async () => {
    setTwoFAMsg(null); setTwoFABusy(true);
    try {
      const { data } = await api.post('/admin/2fa/setup');
      setSetupData({ otpauthUrl: data?.otpauthUrl, secret: data?.secret });
    } catch (err) {
      setTwoFAMsg({ kind: 'err', text: errMessage(err, 'Could not start 2FA setup.') });
    } finally {
      setTwoFABusy(false);
    }
  };

  const verify2FA = async () => {
    if (!/^\d{6}$/.test(twoFACode)) { setTwoFAMsg({ kind: 'err', text: 'Enter the 6-digit code.' }); return; }
    setTwoFABusy(true); setTwoFAMsg(null);
    try {
      const { data } = await api.post('/admin/2fa/verify', { code: twoFACode });
      setRecoveryCodes(Array.isArray(data?.recoveryCodes) ? data.recoveryCodes : []);
      setSetupData(null);
      setTwoFACode('');
      setAuth({ accessToken: token, user: { ...admin, twoFactorEnabled: true } });
    } catch (err) {
      setTwoFAMsg({ kind: 'err', text: errMessage(err, 'Verification failed.') });
    } finally {
      setTwoFABusy(false);
    }
  };

  const disable2FA = async () => {
    if (!disablePwd) { setTwoFAMsg({ kind: 'err', text: 'Enter your password to disable 2FA.' }); return; }
    setTwoFABusy(true); setTwoFAMsg(null);
    try {
      await api.post('/admin/2fa/disable', { password: disablePwd });
      setAuth({ accessToken: token, user: { ...admin, twoFactorEnabled: false } });
      setDisablePwd(''); setShowDisable(false);
      setTwoFAMsg({ kind: 'ok', text: '2FA disabled.' });
    } catch (err) {
      setTwoFAMsg({ kind: 'err', text: errMessage(err, 'Could not disable 2FA.') });
    } finally {
      setTwoFABusy(false);
    }
  };

  const [codesCopied, setCodesCopied] = useState(false);
  const copyCodes = async () => {
    try { await navigator.clipboard.writeText((recoveryCodes || []).join('\n')); setCodesCopied(true); setTimeout(() => setCodesCopied(false), 1500); } catch {}
  };

  /* ───────── Notifications (preferences) ───────── */
  const [notif, setNotif] = useState(DEFAULT_NOTIFS);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifSavedAt, setNotifSavedAt] = useState(0);
  const [notifMsg, setNotifMsg] = useState(null);
  const notifTimer = useRef(null);
  const notifWired = useRef(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get('/admin/preferences');
        if (!alive) return;
        const n = data?.preferences?.notifications;
        setNotif({ ...DEFAULT_NOTIFS, ...(n || {}) });
      } catch (err) {
        if (!alive) return;
        if (err.response?.status === 404) {
          notifWired.current = false;
          setNotifMsg({ kind: 'err', text: 'Endpoint not yet available — changes will not persist.' });
        } else {
          setNotifMsg({ kind: 'err', text: errMessage(err, 'Could not load preferences.') });
        }
      } finally {
        if (alive) setNotifLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const queueNotifSave = useCallback((nextNotif) => {
    if (!notifWired.current) return;
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(async () => {
      try {
        await api.put('/admin/preferences', { notifications: nextNotif });
        setNotifSavedAt(Date.now());
      } catch (err) {
        if (err.response?.status === 404) {
          notifWired.current = false;
          setNotifMsg({ kind: 'err', text: 'Endpoint not yet available — changes will not persist.' });
        } else {
          setNotifMsg({ kind: 'err', text: errMessage(err, 'Could not save preference.') });
        }
      }
    }, 300);
  }, []);

  const updateNotif = (key, v) => {
    setNotif(prev => {
      const next = { ...prev, [key]: v };
      queueNotifSave(next);
      return next;
    });
  };

  useEffect(() => () => { if (notifTimer.current) clearTimeout(notifTimer.current); }, []);

  const notifSavedRecently = notifSavedAt && Date.now() - notifSavedAt < 1000;
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!notifSavedAt) return;
    const t = setTimeout(() => forceTick(x => x + 1), 1050);
    return () => clearTimeout(t);
  }, [notifSavedAt]);

  /* ───────── Sessions ───────── */
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsMsg, setSessionsMsg] = useState(null);
  const [confirmRevoke, setConfirmRevoke] = useState(null); // jti
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true); setSessionsMsg(null);
    try {
      const { data } = await api.get('/admin/sessions');
      setSessions(Array.isArray(data?.sessions) ? data.sessions : []);
    } catch (err) {
      setSessions([]);
      if (err.response?.status === 404) setSessionsMsg({ kind: 'err', text: 'Endpoint not yet available.' });
      else setSessionsMsg({ kind: 'err', text: errMessage(err, 'Could not load sessions.') });
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => { if (active === 'sessions') loadSessions(); }, [active, loadSessions]);

  const revokeSession = async (jti) => {
    try {
      await api.delete('/admin/sessions/' + jti);
      setSessions(s => s.filter(x => x.jti !== jti));
    } catch (err) {
      setSessionsMsg({ kind: 'err', text: errMessage(err, 'Could not revoke session.') });
    }
  };

  const revokeOthers = async () => {
    try {
      await api.post('/admin/sessions/revoke-others');
      setSessions(s => s.filter(x => x.current));
      setSessionsMsg({ kind: 'ok', text: 'All other sessions signed out.' });
      setTimeout(() => setSessionsMsg(null), 2000);
    } catch (err) {
      setSessionsMsg({ kind: 'err', text: errMessage(err, 'Could not revoke other sessions.') });
    }
  };

  /* ───────── Render ───────── */
  return (
    <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'flex-start' }}>
      <aside style={{ position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', padding: '8px 10px 6px' }}>Settings</div>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {NAV_SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              style={{
                textAlign: 'left',
                padding: '8px 10px',
                fontSize: 13,
                fontWeight: active === s.id ? 600 : 500,
                color: active === s.id ? 'var(--text)' : 'var(--muted)',
                background: active === s.id ? 'var(--bg-2, var(--bg))' : 'transparent',
                borderLeft: `2px solid ${active === s.id ? 'var(--brand)' : 'transparent'}`,
                borderRadius: 0,
                marginBottom: 1,
              }}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      <div style={{ minWidth: 0 }}>
        <PageHeader title="Settings" subtitle="Your admin account, security, and preferences" />

        {active === 'profile' && (
          <Section title="Profile">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'var(--brand)', color: '#FBF8F3',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 24, letterSpacing: '-0.01em',
              }}>
                {(admin?.name?.[0] || 'A').toUpperCase()}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 20 }}>{admin?.name || 'Admin'}</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{admin?.email || '—'}</div>
                <div style={{ marginTop: 6 }}>
                  <Badge color={admin?.role === 'super_admin' || admin?.role === 'superadmin' ? 'purple' : 'blue'}>
                    {(admin?.role || 'admin').replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={profileSaving}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>Email (read-only)</label>
                <input type="email" value={admin?.email || ''} readOnly disabled />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                className="btn-primary btn-sm"
                onClick={saveProfile}
                disabled={profileSaving || !name.trim() || name.trim() === (admin?.name || '')}
              >
                {profileSaving ? <><Spinner size={12} /> Saving…</> : 'Save'}
              </button>
              {profileMsg && (
                <span style={{ fontSize: 12, color: profileMsg.kind === 'ok' ? 'var(--success)' : 'var(--danger)' }}>{profileMsg.text}</span>
              )}
            </div>
          </Section>
        )}

        {active === 'security' && (
          <>
            <Section title="Password">
              <form onSubmit={submitPassword}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>Current password</label>
                    <input
                      type="password"
                      value={pwd.current}
                      onChange={e => setPwd(p => ({ ...p, current: e.target.value }))}
                      autoComplete="current-password"
                      disabled={pwdSaving}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>New password</label>
                    <input
                      type="password"
                      value={pwd.next}
                      onChange={e => setPwd(p => ({ ...p, next: e.target.value }))}
                      autoComplete="new-password"
                      disabled={pwdSaving}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>Confirm new</label>
                    <input
                      type="password"
                      value={pwd.confirm}
                      onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
                      autoComplete="new-password"
                      disabled={pwdSaving}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button type="submit" className="btn-primary btn-sm" disabled={pwdSaving || !pwd.current || !pwd.next || !pwd.confirm}>
                    {pwdSaving ? <><Spinner size={12} /> Updating…</> : 'Update password'}
                  </button>
                  {pwdMsg && (
                    <span style={{ fontSize: 12, color: pwdMsg.kind === 'ok' ? 'var(--success)' : 'var(--danger)' }}>{pwdMsg.text}</span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>Minimum 12 characters. Use a passphrase or a password manager.</div>
              </form>
            </Section>

            <Section
              title="Two-factor authentication"
              action={twoFAEnabled ? <Badge color="green">Enabled</Badge> : <Badge color="yellow">Required</Badge>}
            >
              {twoFAEnabled && !showDisable && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>TOTP is active on this account</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>You'll be prompted for a 6-digit code on every sign-in.</div>
                  </div>
                  <button className="btn-danger btn-sm" onClick={() => { setShowDisable(true); setTwoFAMsg(null); }}>Disable 2FA</button>
                </div>
              )}

              {twoFAEnabled && showDisable && (
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 10 }}>Confirm your password to disable two-factor authentication.</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="password"
                      placeholder="Current password"
                      value={disablePwd}
                      onChange={e => setDisablePwd(e.target.value)}
                      autoComplete="current-password"
                      style={{ maxWidth: 240 }}
                    />
                    <button className="btn-danger btn-sm" onClick={disable2FA} disabled={twoFABusy || !disablePwd}>
                      {twoFABusy ? <><Spinner size={12} /> Disabling…</> : 'Disable'}
                    </button>
                    <button className="btn-ghost btn-sm" onClick={() => { setShowDisable(false); setDisablePwd(''); setTwoFAMsg(null); }} disabled={twoFABusy}>Cancel</button>
                  </div>
                  {twoFAMsg && (
                    <div style={{ fontSize: 12, marginTop: 8, color: twoFAMsg.kind === 'ok' ? 'var(--success)' : 'var(--danger)' }}>{twoFAMsg.text}</div>
                  )}
                </div>
              )}

              {!twoFAEnabled && !setupData && !recoveryCodes && (
                <div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 10 }}>
                    Per admin policy, 2FA is mandatory. Use Google Authenticator, 1Password, or Authy.
                  </div>
                  <button className="btn-primary btn-sm" onClick={startSetup} disabled={twoFABusy}>
                    {twoFABusy ? <><Spinner size={12} /> Setting up…</> : 'Set up two-factor authentication'}
                  </button>
                  {twoFAMsg && (
                    <div style={{ fontSize: 12, marginTop: 8, color: twoFAMsg.kind === 'ok' ? 'var(--success)' : 'var(--danger)' }}>{twoFAMsg.text}</div>
                  )}
                </div>
              )}

              {!twoFAEnabled && setupData && !recoveryCodes && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>1. Add to your authenticator</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 10 }}>
                    Copy the otpauth URL below into your authenticator (or paste it into the app's "add account" → "manual" flow). The secret is also shown for manual entry.
                  </div>
                  <OtpAuthBlock url={setupData.otpauthUrl} secret={setupData.secret} />

                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 14, marginBottom: 6 }}>2. Verify the 6-digit code</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123 456"
                      value={twoFACode}
                      onChange={e => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      style={{ maxWidth: 140, fontFamily: 'var(--f-mono, ui-monospace, monospace)', letterSpacing: '.2em' }}
                      disabled={twoFABusy}
                    />
                    <button className="btn-primary btn-sm" onClick={verify2FA} disabled={twoFABusy || twoFACode.length !== 6}>
                      {twoFABusy ? <><Spinner size={12} /> Verifying…</> : 'Verify & enable'}
                    </button>
                    <button className="btn-ghost btn-sm" onClick={() => { setSetupData(null); setTwoFACode(''); setTwoFAMsg(null); }} disabled={twoFABusy}>Cancel</button>
                  </div>
                  {twoFAMsg && (
                    <div style={{ fontSize: 12, marginTop: 8, color: twoFAMsg.kind === 'ok' ? 'var(--success)' : 'var(--danger)' }}>{twoFAMsg.text}</div>
                  )}
                </div>
              )}

              {recoveryCodes && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Recovery codes</div>
                  <div style={{ fontSize: 12.5, color: 'var(--danger)', fontWeight: 600, marginBottom: 10 }}>
                    Save these now — they will not be shown again. Each code works once.
                  </div>
                  <div style={{
                    border: '1px solid var(--border)', borderRadius: 10, padding: 12,
                    background: 'var(--bg-2, var(--bg))',
                    fontFamily: 'var(--f-mono, ui-monospace, monospace)', fontSize: 12.5,
                    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px 24px',
                    userSelect: 'all',
                    marginBottom: 10,
                  }}>
                    {recoveryCodes.map((c, i) => <span key={i}>{c}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-secondary btn-sm" onClick={copyCodes}>{codesCopied ? 'Copied ✓' : 'Copy all codes'}</button>
                    <button className="btn-primary btn-sm" onClick={() => setRecoveryCodes(null)}>I've saved them</button>
                  </div>
                </div>
              )}
            </Section>
          </>
        )}

        {active === 'preferences' && (
          <Section title="Display">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '4px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Theme</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>Cream paper vs. warm dark</div>
                </div>
                <Segmented
                  value={theme || 'light'}
                  options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
                  onChange={(v) => { if (v !== theme) toggleTheme(); }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Density</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>Compact is the operational default</div>
                </div>
                <Segmented
                  value={density}
                  options={[
                    { value: 'compact',     label: 'Compact' },
                    { value: 'comfortable', label: 'Comfortable' },
                    { value: 'cozy',        label: 'Cozy' },
                  ]}
                  onChange={setDensity}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Sidebar default</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>Applied next session — current state remembered by the chevron</div>
                </div>
                <Segmented
                  value={sidebarDefault}
                  options={[{ value: 'expanded', label: 'Expanded' }, { value: 'collapsed', label: 'Icon-only' }]}
                  onChange={setSidebarDefault}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Language</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>Sidebar labels translate to हिन्दी when set</div>
                </div>
                <Segmented
                  value={lang}
                  options={[{ value: 'en', label: 'English' }, { value: 'hi', label: 'हिन्दी' }]}
                  onChange={setLang}
                />
              </div>
            </div>
          </Section>
        )}

        {active === 'notifications' && (
          <Section
            title="Notification preferences"
            action={
              notifLoading
                ? <Spinner size={14} />
                : notifSavedRecently
                  ? <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>Saved</span>
                  : null
            }
          >
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
              Pick the platform events you want to be pinged about. Channel routing (email / Slack / push) is wired in a future Settings → Channels surface.
            </div>
            {notifMsg && (
              <div style={{ fontSize: 12, color: notifMsg.kind === 'ok' ? 'var(--success)' : 'var(--danger)', marginBottom: 10 }}>{notifMsg.text}</div>
            )}
            <Toggle
              label="Urgent support ticket"
              hint="Any ticket marked urgent across all clients."
              value={notif.newTicketUrgent}
              onChange={(v) => updateNotif('newTicketUrgent', v)}
              disabled={notifLoading}
            />
            <Toggle
              label="Payment failed"
              hint="Razorpay reports a failed charge for any tenant."
              value={notif.paymentFailed}
              onChange={(v) => updateNotif('paymentFailed', v)}
              disabled={notifLoading}
            />
            <Toggle
              label="WhatsApp quality dropped"
              hint="Any client's phone moves to YELLOW or RED quality."
              value={notif.qualityDropped}
              onChange={(v) => updateNotif('qualityDropped', v)}
              disabled={notifLoading}
            />
            <Toggle
              label="New signup"
              hint="A new business completes onboarding."
              value={notif.newSignup}
              onChange={(v) => updateNotif('newSignup', v)}
              disabled={notifLoading}
            />
            <Toggle
              label="Weekly digest"
              hint="Monday morning summary — MRR, churn, top tickets."
              value={notif.weeklyDigest}
              onChange={(v) => updateNotif('weeklyDigest', v)}
              disabled={notifLoading}
            />
          </Section>
        )}

        {active === 'sessions' && (
          <>
            <Section
              title="Active sessions"
              action={
                sessions.length > 1
                  ? <button className="btn-secondary btn-sm" onClick={() => setConfirmRevokeAll(true)}>Sign out everywhere else</button>
                  : null
              }
            >
              {sessionsLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13, padding: '12px 0' }}>
                  <Spinner size={14} /> Loading sessions…
                </div>
              )}

              {!sessionsLoading && sessionsMsg && (
                <div style={{ fontSize: 12.5, color: sessionsMsg.kind === 'ok' ? 'var(--success)' : 'var(--muted)', padding: '8px 0' }}>{sessionsMsg.text}</div>
              )}

              {!sessionsLoading && sessions.length === 0 && !sessionsMsg && (
                <div style={{ fontSize: 12.5, color: 'var(--muted)', padding: '8px 0' }}>No active sessions reported.</div>
              )}

              {!sessionsLoading && sessions.map((s) => (
                <div key={s.jti} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-2, var(--border))' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span>{parseUA(s.ua)}</span>
                      {s.current && <Badge color="green">Current</Badge>}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>
                      {s.ip || '—'} · last seen {relTime(s.lastSeenAt || s.createdAt)} · started {relTime(s.createdAt)}
                    </div>
                  </div>
                  {s.current ? (
                    <button className="btn-danger btn-sm" onClick={handleLogout}>Sign out (this session)</button>
                  ) : (
                    <button className="btn-secondary btn-sm" onClick={() => setConfirmRevoke(s.jti)}>Sign out</button>
                  )}
                </div>
              ))}
            </Section>

            <Section title="Danger zone" action={<Badge color="red">Irreversible</Badge>}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Sign out everywhere else</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>Revokes all of your other active sessions on every device. This session stays signed in.</div>
                </div>
                <button className="btn-secondary btn-sm" onClick={() => setConfirmRevokeAll(true)} disabled={sessions.length <= 1}>Sign out others</button>
              </div>
            </Section>

            <ConfirmModal
              open={!!confirmRevoke}
              onClose={() => setConfirmRevoke(null)}
              onConfirm={() => revokeSession(confirmRevoke)}
              title="Sign out this session?"
              message="The selected session will be revoked immediately. The device will need to sign in again."
              confirmLabel="Sign out"
              danger
            />
            <ConfirmModal
              open={confirmRevokeAll}
              onClose={() => setConfirmRevokeAll(false)}
              onConfirm={revokeOthers}
              title="Sign out all other sessions?"
              message="All your sessions except this one will be revoked. Other devices will need to sign in again."
              confirmLabel="Sign out others"
              danger
            />
          </>
        )}
      </div>
    </div>
  );
}
