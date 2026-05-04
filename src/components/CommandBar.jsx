import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../store/adminStore';
import api from '../services/api';

const SHORTCUTS = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊', sub: 'Platform health overview' },
  { label: 'Clients', path: '/tenants', icon: '🏢', sub: 'All tenants + management' },
  { label: 'WhatsApp Monitoring', path: '/whatsapp', icon: '📱', sub: 'Quality ratings + Meta API' },
  { label: 'Support Inbox', path: '/support', icon: '💬', sub: 'All channels — chat, WA, email' },
  { label: 'Billing', path: '/billing', icon: '💳', sub: 'Revenue, refunds, coupons' },
  { label: 'Analytics', path: '/analytics', icon: '📈', sub: 'Growth, cohorts, adoption' },
  { label: 'System Ops', path: '/system', icon: '⚙️', sub: 'Jobs, logs, feature flags' },
  { label: 'Announcements', path: '/announcements', icon: '📢', sub: 'Send to clients' },
  { label: 'Audit Log', path: '/audit', icon: '🔒', sub: 'All admin actions' },
];

export default function CommandBar() {
  const open = useAdminStore(s => s.commandBarOpen);
  const close = useAdminStore(s => s.closeCommandBar);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(SHORTCUTS);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery(''); setResults(SHORTCUTS); setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  const search = useCallback((q) => {
    clearTimeout(timerRef.current);
    if (!q.trim()) { setResults(SHORTCUTS); setLoading(false); return; }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/search', { params: { q } });
        setResults(data?.length ? data : SHORTCUTS.filter(s => s.label.toLowerCase().includes(q.toLowerCase())));
      } catch {
        setResults(SHORTCUTS.filter(s => s.label.toLowerCase().includes(q.toLowerCase())));
      }
      setLoading(false);
      setSelected(0);
    }, 200);
  }, []);

  useEffect(() => { search(query); }, [query, search]);

  useEffect(() => {
    const handler = (e) => {
      if (!open) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && results[selected]) handleSelect(results[selected]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, selected, results]);

  const handleSelect = (item) => {
    if (item.path) navigate(item.path);
    close();
  };

  if (!open) return null;

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal animate-in" style={{ maxWidth: 560, width: '100%', margin: '0 16px', padding: 0, borderRadius: 16 }}>
        {/* Search input */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, opacity: 0.5, flexShrink: 0 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search clients, invoices, or navigate…"
            style={{ border: 'none', background: 'transparent', boxShadow: 'none', fontSize: 15, padding: 0 }}
          />
          {loading
            ? <div className="spin-anim" style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--brand)', flexShrink: 0 }} />
            : <kbd style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 7px', fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>ESC</kbd>
          }
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No results for "{query}"</div>
          ) : results.map((item, i) => (
            <div
              key={i}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelected(i)}
              style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: i === selected ? 'var(--bg)' : 'transparent', transition: 'background .1s' }}
            >
              <span style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>{item.icon || '→'}</span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</div>
                {item.sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.sub}</div>}
              </div>
              {item.badge && <span className={`badge badge-${item.badge}`}>{item.badge}</span>}
              {i === selected && (
                <kbd style={{ background: 'var(--brand-bg)', border: '1px solid var(--brand)', borderRadius: 4, padding: '1px 7px', fontSize: 11, color: 'var(--brand)', flexShrink: 0 }}>↵</kbd>
              )}
            </div>
          ))}
        </div>

        {/* Footer hints */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 20, fontSize: 11, color: 'var(--muted)' }}>
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}
