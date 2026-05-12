import React, { useState } from 'react';
import { Badge, PageHeader, EmptyState } from '../components/ui';

const MOCK_AUDIT = [
  { id: 1, admin: 'Rahul Sharma', action: 'plan_change', target: 'TechBridge Solutions', details: 'Starter → Growth', ip: '103.21.xx.xx', timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 2, admin: 'Priya Nair', action: 'impersonation_start', target: 'EduFirst Academy', details: 'Duration: 8 minutes', ip: '103.21.xx.xx', timestamp: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: 3, admin: 'Rahul Sharma', action: 'trial_extended', target: 'Riya Fashions', details: '14 Jan → 28 Jan 2025', ip: '103.21.xx.xx', timestamp: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: 4, admin: 'Priya Nair', action: 'refund_issued', target: 'AutoDrive Motors', details: '₹2,499 — Service disruption', ip: '103.21.xx.xx', timestamp: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 5, admin: 'Rahul Sharma', action: 'account_suspended', target: 'AutoDrive Motors', details: 'Reason: Non-payment (12 days overdue)', ip: '103.21.xx.xx', timestamp: new Date(Date.now() - 26 * 3600000).toISOString() },
  { id: 6, admin: 'Admin', action: 'admin_login', target: 'System', details: 'Successful login', ip: '103.21.xx.xx', timestamp: new Date(Date.now() - 28 * 3600000).toISOString() },
  { id: 7, admin: 'Rahul Sharma', action: 'coupon_created', target: 'LAUNCH50', details: '50% discount — 50 uses max', ip: '103.21.xx.xx', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 8, admin: 'Priya Nair', action: 'feature_flag', target: 'chatbot_flows', details: 'Disabled globally', ip: '103.21.xx.xx', timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 9, admin: 'Rahul Sharma', action: 'data_export', target: 'All Tenants', details: 'CSV export — 55 records', ip: '103.21.xx.xx', timestamp: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 10, admin: 'Priya Nair', action: 'announcement_sent', target: 'All clients', details: 'Maintenance window notice', ip: '103.21.xx.xx', timestamp: new Date(Date.now() - 5 * 86400000).toISOString() },
];

const ACTION_COLORS = {
  plan_change: 'blue', impersonation_start: 'yellow', impersonation_end: 'gray',
  trial_extended: 'cyan', refund_issued: 'red', account_suspended: 'red',
  account_reactivated: 'green', coupon_created: 'purple', coupon_deactivated: 'gray',
  feature_flag: 'yellow', admin_login: 'gray', admin_logout: 'gray',
  data_export: 'blue', data_deleted: 'red', announcement_sent: 'cyan',
};

const ACTION_VERB = {
  plan_change: 'changed plan for',
  impersonation_start: 'started impersonating',
  impersonation_end: 'stopped impersonating',
  trial_extended: 'extended trial for',
  refund_issued: 'issued refund to',
  account_suspended: 'suspended account',
  account_reactivated: 'reactivated account',
  coupon_created: 'created coupon',
  coupon_deactivated: 'deactivated coupon',
  feature_flag: 'toggled feature flag',
  admin_login: 'signed in to',
  admin_logout: 'signed out of',
  data_export: 'exported data from',
  data_deleted: 'deleted data from',
  announcement_sent: 'sent announcement to',
};

const ACTION_CATEGORY = {
  plan_change: 'Billing', refund_issued: 'Billing', coupon_created: 'Billing', coupon_deactivated: 'Billing',
  impersonation_start: 'Access', impersonation_end: 'Access', admin_login: 'Access', admin_logout: 'Access',
  trial_extended: 'Lifecycle', account_suspended: 'Lifecycle', account_reactivated: 'Lifecycle',
  feature_flag: 'Platform', data_export: 'Data', data_deleted: 'Data',
  announcement_sent: 'Comms',
};

const ACTION_TYPES = ['all', ...Object.keys(ACTION_COLORS)];
const CATEGORIES = ['all', ...Array.from(new Set(Object.values(ACTION_CATEGORY)))];

const PALETTE = ['var(--brand)', 'var(--accent, #C55A2B)', 'var(--accent-2, #E8A94A)', '#7C5BC6', '#3E8EDB', '#0F7F5E', '#C03B3B'];
const colorFor = (name) => PALETTE[(name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
const initials = (name) => (name || '?').split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

const Avatar = ({ name, size = 36 }) => (
  <span style={{
    width: size, height: size, borderRadius: '50%',
    background: colorFor(name), color: 'var(--paper, #FBF8F3)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600, fontSize: Math.round(size * 0.38), flexShrink: 0,
    fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', letterSpacing: '.02em',
  }}>{initials(name)}</span>
);

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };
const todayMs = startOfDay(Date.now());

const dayLabel = (ts) => {
  const dayMs = startOfDay(ts);
  const diffDays = Math.round((todayMs - dayMs) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: dayMs < startOfDay(Date.now() - 300 * 86400000) ? 'numeric' : undefined });
};

const inRange = (ts, range) => {
  const t = new Date(ts).getTime();
  if (range === 'today') return t >= todayMs;
  if (range === '7d') return t >= todayMs - 7 * 86400000;
  if (range === '30d') return t >= todayMs - 30 * 86400000;
  return true;
};

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const admins = ['all', ...new Set(MOCK_AUDIT.map(a => a.admin))];

  const filtered = MOCK_AUDIT.filter(entry => {
    const q = search.toLowerCase();
    const cat = ACTION_CATEGORY[entry.action] || 'Other';
    return (
      (actionFilter === 'all' || entry.action === actionFilter) &&
      (adminFilter === 'all' || entry.admin === adminFilter) &&
      (categoryFilter === 'all' || cat === categoryFilter) &&
      inRange(entry.timestamp, dateRange) &&
      (!q || entry.admin.toLowerCase().includes(q) || entry.target.toLowerCase().includes(q) || entry.details.toLowerCase().includes(q))
    );
  });

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  // Group paged entries by day for sticky date headers.
  const grouped = paged.reduce((acc, e) => {
    const key = dayLabel(e.timestamp);
    if (!acc.length || acc[acc.length - 1].label !== key) acc.push({ label: key, entries: [] });
    acc[acc.length - 1].entries.push(e);
    return acc;
  }, []);

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const exportCSV = () => {
    const rows = filtered.map(e => [e.admin, e.action, e.target, e.details, e.ip, new Date(e.timestamp).toISOString()]);
    const csv = [['Admin', 'Action', 'Target', 'Details', 'IP', 'Timestamp'], ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `audit-log-${Date.now()}.csv`; a.click();
  };

  const Chip = ({ active, onClick, children }) => (
    <button onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
        border: '1px solid var(--hair, var(--border))',
        background: active ? 'var(--brand)' : 'transparent',
        color: active ? 'var(--paper, #FBF8F3)' : 'var(--muted)',
        cursor: 'pointer', whiteSpace: 'nowrap',
      }}>
      {children}
    </button>
  );

  return (
    <div className="animate-in">
      <PageHeader
        title="Audit Log"
        subtitle="Append-only chronological record of every admin action"
        actions={<button className="btn-ghost btn-sm" onClick={exportCSV}>⬇ Export CSV</button>}
      />

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 14, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            placeholder="Search admin, target, details…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ flex: '1 1 240px', maxWidth: 320, fontSize: 13 }}
          />
          <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} style={{ width: 180, fontSize: 12, padding: '6px 10px' }}>
            {ACTION_TYPES.map(a => <option key={a} value={a}>{a === 'all' ? 'All actions' : a.replace(/_/g, ' ')}</option>)}
          </select>
          {(search || actionFilter !== 'all' || adminFilter !== 'all' || categoryFilter !== 'all' || dateRange !== 'all') && (
            <button className="btn-ghost btn-sm" onClick={() => { setSearch(''); setActionFilter('all'); setAdminFilter('all'); setCategoryFilter('all'); setDateRange('all'); setPage(1); }}>
              ✕ Clear all
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Actor</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {admins.map(a => (
                <Chip key={a} active={adminFilter === a} onClick={() => { setAdminFilter(a); setPage(1); }}>
                  {a === 'all' ? 'All admins' : a}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Category</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <Chip key={c} active={categoryFilter === c} onClick={() => { setCategoryFilter(c); setPage(1); }}>
                  {c === 'all' ? 'All categories' : c}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Date</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[['all', 'All time'], ['today', 'Today'], ['7d', '7 days'], ['30d', '30 days']].map(([k, l]) => (
                <Chip key={k} active={dateRange === k} onClick={() => { setDateRange(k); setPage(1); }}>{l}</Chip>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="dot dot-green" />
        Showing <span style={{ fontWeight: 600, color: 'var(--text)' }}>{filtered.length}</span> of {MOCK_AUDIT.length} entries — read-only, cannot be edited
      </div>

      {/* ── Timeline ────────────────────────────────────────────────────── */}
      {paged.length === 0 ? (
        <div className="card">
          <EmptyState message="No audit entries match your filters"
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>} />
        </div>
      ) : (
        <div>
          {grouped.map((group) => (
            <div key={group.label} style={{ marginBottom: 12 }}>
              {/* Sticky day header */}
              <div style={{
                position: 'sticky', top: 0, zIndex: 2,
                padding: '8px 4px 8px 4px',
                background: 'var(--paper, var(--bg))',
                fontSize: 11, fontWeight: 700, color: 'var(--muted)',
                textTransform: 'uppercase', letterSpacing: '.1em',
                borderBottom: '1px solid var(--hair, var(--border))',
                marginBottom: 8,
              }}>
                {group.label}
              </div>

              {group.entries.map((entry, idx) => {
                const verb = ACTION_VERB[entry.action] || entry.action.replace(/_/g, ' ');
                const cat = ACTION_CATEGORY[entry.action] || 'Other';
                const last = idx === group.entries.length - 1;
                return (
                  <div key={entry.id} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                    {/* Avatar + line */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 14 }}>
                      <Avatar name={entry.admin} size={36} />
                      {!last && <div style={{ flex: 1, width: 2, background: 'var(--hair, var(--border))', marginTop: 6, marginBottom: -6 }} />}
                    </div>

                    {/* Content card */}
                    <div className="card card-sm" style={{ flex: 1, marginBottom: 10, padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                            <span style={{ fontWeight: 600 }}>{entry.admin}</span>
                            <span style={{ color: 'var(--muted)' }}> {verb} </span>
                            <span style={{ fontWeight: 600 }}>{entry.target}</span>
                          </div>
                          {entry.details && (
                            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
                              {entry.details}
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            <Badge color={ACTION_COLORS[entry.action] || 'gray'}>{entry.action.replace(/_/g, ' ')}</Badge>
                            <span style={{
                              fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                              background: 'var(--paper-2, var(--bg))', color: 'var(--muted)',
                              border: '1px solid var(--hair, var(--border))', textTransform: 'uppercase', letterSpacing: '.06em',
                            }}>{cat}</span>
                            <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}>
                              {entry.ip}
                            </span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}>
                            {formatTime(entry.timestamp)}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                            {new Date(entry.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>Page {page} of {totalPages}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <button className="btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
