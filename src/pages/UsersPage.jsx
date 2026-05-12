import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { Badge, PageHeader, Spinner, EmptyState } from '../components/ui';

const ROLE_FILTERS = [
  { key: 'all',     label: 'All' },
  { key: 'owner',   label: 'Owner' },
  { key: 'manager', label: 'Manager' },
  { key: 'sales',   label: 'Sales agent' },
  { key: 'support', label: 'Support agent' },
  { key: 'viewer',  label: 'Viewer' },
];

const ROLE_COLOR = {
  owner: 'purple', manager: 'blue', sales: 'green',
  support: 'cyan', viewer: 'gray', admin: 'purple',
};

// Stable warm-palette avatar colour from the user's name.
const AVATAR_PALETTE = [
  { bg: 'var(--brand-bg)',    fg: 'var(--brand)' },
  { bg: 'var(--warn-bg)',     fg: '#8A5D17' },
  { bg: 'var(--danger-bg)',   fg: 'var(--danger)' },
  { bg: 'rgba(99,102,241,0.12)', fg: '#4F46E5' },
  { bg: 'rgba(15,127,94,0.10)',  fg: 'var(--brand-dark, var(--brand))' },
];
const avatarFor = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
};

const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?';

const lastSeen = (u) => {
  const t = u.lastSeenAt || u.lastLoginAt || u.updatedAt;
  if (!t) return null;
  const d = new Date(t);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

function exportCSV(rows) {
  const cols = ['Name', 'Email', 'Role', 'Tenant', 'Joined'];
  const out = rows.map(u => [
    u.name || '',
    u.email || '',
    u.role || '',
    u.tenantId?.businessName || u.tenantId || '',
    u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '',
  ]);
  const csv = [cols, ...out].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `users-${Date.now()}.csv`;
  a.click();
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Local-only filter chips & tenant filter — no backend wiring required, just narrows the rendered list.
  const [roleFilter, setRoleFilter] = useState('all');
  const [tenantFilter, setTenantFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/users', { params: { search } }).then(({ data }) => { setUsers(data); setLoading(false); }).catch(() => setLoading(false));
  }, [search]);

  const tenantOptions = useMemo(() => {
    const seen = new Set();
    const opts = [];
    (users || []).forEach(u => {
      const name = u.tenantId?.businessName || (typeof u.tenantId === 'string' ? u.tenantId : null);
      if (name && !seen.has(name)) { seen.add(name); opts.push(name); }
    });
    return opts.sort();
  }, [users]);

  const filtered = useMemo(() => {
    return (users || []).filter(u => {
      if (roleFilter !== 'all') {
        const r = (u.role || '').toLowerCase();
        if (roleFilter === 'sales'   && !r.includes('sales'))   return false;
        if (roleFilter === 'support' && !r.includes('support')) return false;
        if (!['sales', 'support'].includes(roleFilter) && r !== roleFilter) return false;
      }
      if (tenantFilter) {
        const tn = u.tenantId?.businessName || (typeof u.tenantId === 'string' ? u.tenantId : '');
        if (!tn.toLowerCase().includes(tenantFilter.toLowerCase())) return false;
      }
      return true;
    });
  }, [users, roleFilter, tenantFilter]);

  return (
    <div className="animate-in">
      <PageHeader
        title="Users"
        subtitle="Search and inspect users across every client"
        actions={
          <button className="btn-ghost btn-sm" onClick={() => exportCSV(filtered)} disabled={!filtered.length}>
            ⬇ Export CSV
          </button>
        }
      />

      {/* ── Filter bar ──────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 14, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input"
            style={{ flex: 1, minWidth: 220, maxWidth: 360 }}
          />
          {tenantOptions.length > 0 ? (
            <select
              value={tenantFilter}
              onChange={e => setTenantFilter(e.target.value)}
              className="select"
              style={{ minWidth: 200, padding: '8px 10px', fontSize: 13 }}
            >
              <option value="">All tenants</option>
              {tenantOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input
              placeholder="Filter by tenant…"
              value={tenantFilter}
              onChange={e => setTenantFilter(e.target.value)}
              className="input"
              style={{ maxWidth: 220 }}
            />
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {ROLE_FILTERS.map(r => {
            const active = roleFilter === r.key;
            return (
              <button
                key={r.key}
                onClick={() => setRoleFilter(r.key)}
                style={{
                  padding: '4px 12px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
                  border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                  background: active ? 'var(--brand)' : 'transparent',
                  color: active ? '#FBF8F3' : 'var(--muted)',
                  cursor: 'pointer',
                }}
              >
                {r.label}
              </button>
            );
          })}
          <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--muted)' }}>
            {loading ? 'Loading…' : `${filtered.length} of ${users.length} user${users.length === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>

      {/* ── Results ─────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><Spinner size={20} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState message="No users match your filters" />
        ) : (
          filtered.map((u, i) => {
            const av = avatarFor(u.name || u.email || '?');
            const tenantName = u.tenantId?.businessName || (typeof u.tenantId === 'string' ? u.tenantId : '');
            const role = (u.role || '').toLowerCase();
            const roleKey = role.includes('sales') ? 'sales' : role.includes('support') ? 'support' : role;
            const seen = lastSeen(u);
            return (
              <div
                key={u._id || i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 16px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border-2, var(--border))' : 'none',
                  transition: 'background .12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-2, var(--bg))'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                  background: av.bg, color: av.fg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 15, letterSpacing: '-0.01em',
                }}>
                  {initials(u.name || u.email)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.name || '—'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.email || '—'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  {u.role && <Badge color={ROLE_COLOR[roleKey] || 'gray'}>{u.role.replace('_', ' ')}</Badge>}
                  {tenantName && (
                    <div style={{ fontSize: 12, color: 'var(--text)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>
                      {tenantName}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--f-mono, ui-monospace, monospace)', minWidth: 72, textAlign: 'right' }}>
                    {seen || (u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
