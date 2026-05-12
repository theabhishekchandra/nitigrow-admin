import React, { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';
import CommandBar from './CommandBar';
import PlatformStatus from './PlatformStatus';
import { Modal } from './ui';
import useIdleTimeout from '../hooks/useIdleTimeout';

/* ── Inline SVG icons (no external lib) ── */
const Icon = ({ d, size = 16, strokeWidth = 1.5, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  dashboard:     'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  tenants:       'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  whatsapp:      'M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.07-1.35A9.96 9.96 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z',
  support:       'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  billing:       ['M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'],
  analytics:     ['M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'],
  system:        'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  announcements: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  audit:         'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  shield:        'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  doc:           'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M9 13h6M9 17h6M9 9h2',
  menu:          'M4 6h16M4 12h16M4 18h16',
  close:         'M6 18L18 6M6 6l12 12',
  search:        'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  sun:           'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  moon:          'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
  bell:          'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  logout:        'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  signup:        'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  payment:       'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  warning:       'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  ticket:        'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  inbox:         ['M22 12h-6l-2 3h-4l-2-3H2', 'M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z'],
  chevron:       'M9 6l6 6-6 6',
  cog:           'M12 9a3 3 0 100 6 3 3 0 000-6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z',
};

const NAV_GROUPS = [
  {
    key: 'operate',
    label: null,
    items: [
      { to: '/dashboard', label: 'Dashboard', labelHi: 'डैशबोर्ड', iconKey: 'dashboard' },
      { to: '/tenants',   label: 'Clients',   labelHi: 'क्लाइंट्स', iconKey: 'tenants' },
      { to: '/whatsapp',  label: 'WhatsApp',  labelHi: 'व्हाट्सऐप', iconKey: 'whatsapp' },
      { to: '/support',   label: 'Support',   labelHi: 'सपोर्ट',   iconKey: 'support' },
      { to: '/leads',     label: 'Leads',     labelHi: 'लीड्स',     iconKey: 'inbox' },
    ],
  },
  {
    key: 'money',
    label: 'Money',
    items: [
      { to: '/billing',   label: 'Billing',   labelHi: 'बिलिंग',     iconKey: 'billing' },
      { to: '/analytics', label: 'Analytics', labelHi: 'एनालिटिक्स', iconKey: 'analytics' },
    ],
  },
  {
    key: 'platform',
    label: 'Platform',
    items: [
      { to: '/system',        label: 'System',        labelHi: 'सिस्टम',   iconKey: 'system' },
      { to: '/announcements', label: 'Announcements', labelHi: 'घोषणाएं', iconKey: 'announcements' },
    ],
  },
  {
    key: 'trust',
    label: 'Trust',
    items: [
      { to: '/audit',                  label: 'Audit Log',     labelHi: 'ऑडिट लॉग',     iconKey: 'audit' },
      { to: '/security/ip-allowlist',  label: 'IP Allowlist',  labelHi: 'IP अनुमति',    iconKey: 'shield' },
      { to: '/feature-spec',           label: 'Feature Spec',  labelHi: 'फीचर्स',       iconKey: 'doc' },
      { to: '/settings',               label: 'Settings',      labelHi: 'सेटिंग्स',      iconKey: 'cog' },
    ],
  },
];

const NOTIF_ICON_MAP = { signup: 'signup', payment: 'payment', quality: 'warning', ticket: 'ticket' };

const MOCK_NOTIFS = [
  { id: 1, title: 'New signup: Riya Fashions',        message: 'Starter plan — trial started',          time: '2 min ago',  read: false, type: 'signup' },
  { id: 2, title: 'Failed payment: TechBridge',       message: '₹2,499 — retry scheduled',             time: '18 min ago', read: false, type: 'payment' },
  { id: 3, title: 'WhatsApp quality dropped',         message: 'EduFirst dropped to Yellow',           time: '1 hr ago',   read: true,  type: 'quality' },
  { id: 4, title: 'Support ticket: Urgent',           message: 'Campaign not sending — CloudStore',    time: '2 hr ago',   read: true,  type: 'ticket' },
];

export default function Layout() {
  const store = useAdminStore();
  const { admin, logout, theme, toggleTheme, sidebarCollapsed, toggleSidebar, openCommandBar, notifications, unreadCount, setNotifications, markAllRead } = store;
  const language = store.language;
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [idleWarning, setIdleWarning] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (notifications.length === 0) setNotifications(MOCK_NOTIFS);
  }, []);

  useIdleTimeout({
    onWarn: () => setIdleWarning(true),
    onIdle: () => {
      setIdleWarning(false);
      logout();
      navigate('/login?reason=idle');
    },
  });

  const dismissIdleWarning = () => {
    setIdleWarning(false);
    window.dispatchEvent(new Event('mousemove'));
  };

  useEffect(() => {
    const h = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openCommandBar(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [openCommandBar]);

  useEffect(() => {
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const sw = sidebarCollapsed ? 64 : 240;
  const isHi = language === 'hi';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Sidebar wrapper (clips outer overflow only when needed) ── */}
      <div style={{ position: 'relative', flexShrink: 0, width: sw, transition: 'width .22s cubic-bezier(.4,0,.2,1)' }}>
        <aside style={{
          width: sw, height: '100%',
          background: 'var(--sidebar)', color: '#fff',
          display: 'flex', flexDirection: 'column',
          transition: 'width .22s cubic-bezier(.4,0,.2,1)',
          overflow: 'visible',
          position: 'relative',
        }}>

          {/* Logo */}
          <div style={{ padding: '18px 0', borderBottom: '1px solid var(--sidebar-border, rgba(245,239,223,0.08))', flexShrink: 0 }}>
            {sidebarCollapsed
              ? <div style={{ textAlign: 'center', fontWeight: 500, fontSize: 16, color: 'var(--accent-2)', fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', letterSpacing: '-0.01em' }}>NG</div>
              : <div style={{ padding: '0 20px' }}>
                  <div style={{ fontWeight: 500, fontSize: 22, color: 'var(--accent-2)', letterSpacing: '-0.01em', fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)' }}>NitiGrow</div>
                  <div style={{ fontSize: 9, color: 'var(--sidebar-text)', letterSpacing: '.18em', textTransform: 'uppercase', marginTop: 3, fontWeight: 600 }}>
                    <span style={{ fontFamily: 'var(--f-hindi)' }}>व्यापार</span>
                    <span> · ADMIN</span>
                  </div>
                </div>
            }
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
            {NAV_GROUPS.map((group, gi) => (
              <div key={group.key} style={{ marginTop: gi === 0 ? 0 : 12 }}>
                {!sidebarCollapsed && group.label && (
                  <div style={{
                    padding: '0 18px', marginTop: 6, marginBottom: 4,
                    fontSize: 9.5, fontWeight: 700,
                    letterSpacing: '.18em', textTransform: 'uppercase',
                    color: 'var(--sidebar-text)',
                  }}>
                    {group.label}
                  </div>
                )}
                {sidebarCollapsed && gi > 0 && (
                  <div style={{ height: 1, background: 'var(--sidebar-border, rgba(245,239,223,0.08))', margin: '8px 12px' }} />
                )}
                {group.items.map(({ to, label, labelHi, iconKey }) => {
                  const display = isHi && labelHi ? labelHi : label;
                  return (
                    <NavLink key={to} to={to} title={sidebarCollapsed ? display : undefined}
                      style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center',
                        gap: 10,
                        padding: sidebarCollapsed ? '11px 0' : '10px 14px',
                        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        color: isActive ? 'var(--sidebar-active-ink)' : 'var(--sidebar-text)',
                        background: isActive ? 'var(--sidebar-active)' : 'transparent',
                        borderLeft: isActive ? '3px solid var(--accent-2)' : '3px solid transparent',
                        borderRight: '3px solid transparent',
                        fontSize: 13.5,
                        fontWeight: isActive ? 600 : 400,
                        transition: 'all .14s',
                        borderRadius: '0 8px 8px 0',
                        marginRight: 8,
                        whiteSpace: 'nowrap',
                        textDecoration: 'none',
                      })}>
                      <Icon d={ICONS[iconKey]} size={16} style={{ flexShrink: 0 }} />
                      {!sidebarCollapsed && (
                        <span style={isHi ? { fontFamily: 'var(--f-hindi)' } : undefined}>{display}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Admin info + logout */}
          <div style={{ padding: sidebarCollapsed ? '12px 0' : '12px 14px', borderTop: '1px solid var(--sidebar-border, rgba(245,239,223,0.08))', flexShrink: 0 }}>
            {sidebarCollapsed
              ? <button onClick={() => { logout(); navigate('/login'); }} title="Sign Out"
                  style={{ width: '100%', background: 'rgba(239,68,68,0.12)', color: '#f87171', padding: 8, border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                  <Icon d={ICONS.logout} size={15} />
                </button>
              : <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, color: '#FBF8F3' }}>
                      {admin?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sidebar-active-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin?.name || 'Admin'}</div>
                      <div style={{ fontSize: 10, color: 'rgba(245,239,223,0.36)', textTransform: 'capitalize' }}>{(admin?.role || 'super_admin').replace('_', ' ')}</div>
                    </div>
                  </div>
                  <button onClick={() => { logout(); navigate('/login'); }}
                    style={{ width: '100%', background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '7px 0', borderRadius: 6, fontSize: 12, fontWeight: 600, border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Icon d={ICONS.logout} size={13} />
                    Sign Out
                  </button>
                </>
            }
          </div>

          {/* Collapse chevron — sits on sidebar's right edge */}
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              position: 'absolute', right: -11, top: 48,
              width: 22, height: 22, borderRadius: '50%',
              background: 'var(--sidebar)',
              border: '1px solid var(--sidebar-border, rgba(245,239,223,0.18))',
              color: 'var(--sidebar-text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
              zIndex: 30,
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-2)'; e.currentTarget.style.borderColor = 'var(--accent-2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--sidebar-text)'; e.currentTarget.style.borderColor = 'var(--sidebar-border, rgba(245,239,223,0.18))'; }}
          >
            <Icon d={ICONS.chevron} size={11} strokeWidth={2} style={{ transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform .2s' }} />
          </button>
        </aside>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{ height: 60, background: 'var(--topbar)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>

          {/* Sidebar toggle */}
          <button onClick={toggleSidebar} className="btn-icon btn-ghost" title="Toggle sidebar" style={{ flexShrink: 0, cursor: 'pointer' }}>
            <Icon d={sidebarCollapsed ? ICONS.menu : ICONS.close} size={18} />
          </button>

          {/* Platform status pill — before search */}
          <PlatformStatus />

          {/* Global search trigger */}
          <button onClick={openCommandBar}
            style={{ flex: 1, maxWidth: 380, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', color: 'var(--muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, cursor: 'text', textAlign: 'left' }}>
            <Icon d={ICONS.search} size={14} />
            <span style={{ flex: 1 }}>Search clients, invoices, tickets…</span>
            <kbd style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', fontSize: 11, flexShrink: 0, fontFamily: 'var(--f-mono, ui-monospace, "SF Mono", Menlo, monospace)' }}>⌘K</kbd>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>

            {/* Theme toggle */}
            <button onClick={toggleTheme} className="btn-icon btn-ghost" title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} style={{ cursor: 'pointer' }}>
              <Icon d={theme === 'dark' ? ICONS.sun : ICONS.moon} size={17} />
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button onClick={() => { setShowNotifs(v => !v); if (!showNotifs) markAllRead(); }} className="btn-icon btn-ghost" style={{ position: 'relative', cursor: 'pointer' }}>
                <Icon d={ICONS.bell} size={18} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: 1, right: 1, width: 16, height: 16, borderRadius: '50%', background: 'var(--danger)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="animate-in" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 320, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', zIndex: 200 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>Notifications</span>
                    <button onClick={markAllRead} style={{ background: 'transparent', border: 'none', fontSize: 11, color: 'var(--brand)', padding: '0 4px', cursor: 'pointer' }}>Mark all read</button>
                  </div>
                  <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                    {notifications.length === 0
                      ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>All caught up</div>
                      : notifications.map((n) => (
                          <div key={n.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: n.read ? 'transparent' : 'var(--accent-2-soft, var(--brand-bg))', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--brand)' }}>
                              <Icon d={ICONS[NOTIF_ICON_MAP[n.type]] || ICONS.bell} size={13} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                              <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 1 }}>{n.message}</div>
                              <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 3 }}>{n.time}</div>
                            </div>
                          </div>
                        ))
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Admin avatar */}
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#FBF8F3' }}>
              {admin?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <Outlet />
        </main>
      </div>

      <CommandBar />

      <Modal open={idleWarning} onClose={dismissIdleWarning} title="About to sign you out" width={460}>
        <p style={{ color: 'var(--text-2, var(--muted))', marginBottom: 22, lineHeight: 1.65, fontSize: 14 }}>
          For security, this session expires after 30 minutes of inactivity. You'll be signed out in 60 seconds.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            className="btn-ghost btn-sm"
            onClick={() => { setIdleWarning(false); logout(); navigate('/login'); }}
          >
            Sign out now
          </button>
          <button
            className="btn-primary btn-sm"
            onClick={dismissIdleWarning}
          >
            Stay signed in
          </button>
        </div>
      </Modal>
    </div>
  );
}
