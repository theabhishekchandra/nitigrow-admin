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

const ACTION_ICONS = {
  plan_change: '🔄', impersonation_start: '👁', impersonation_end: '👁',
  trial_extended: '⏳', refund_issued: '↩', account_suspended: '🚫',
  account_reactivated: '✅', coupon_created: '🎟', coupon_deactivated: '🚫',
  feature_flag: '🚩', admin_login: '🔓', admin_logout: '🔒',
  data_export: '📥', data_deleted: '🗑', announcement_sent: '📢',
};

const ACTION_TYPES = ['all', ...Object.keys(ACTION_COLORS)];

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const admins = ['all', ...new Set(MOCK_AUDIT.map(a => a.admin))];

  const filtered = MOCK_AUDIT.filter(entry => {
    const q = search.toLowerCase();
    return (
      (actionFilter === 'all' || entry.action === actionFilter) &&
      (adminFilter === 'all' || entry.admin === adminFilter) &&
      (!q || entry.admin.toLowerCase().includes(q) || entry.target.toLowerCase().includes(q) || entry.details.toLowerCase().includes(q))
    );
  });

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const formatTs = (ts) => new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  const exportCSV = () => {
    const rows = filtered.map(e => [e.admin, e.action, e.target, e.details, e.ip, new Date(e.timestamp).toISOString()]);
    const csv = [['Admin', 'Action', 'Target', 'Details', 'IP', 'Timestamp'], ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `audit-log-${Date.now()}.csv`; a.click();
  };

  return (
    <div className="animate-in">
      <PageHeader
        title="Audit Log"
        subtitle="Append-only record of all admin actions"
        actions={<button className="btn-ghost btn-sm" onClick={exportCSV}>⬇ Export CSV</button>}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input placeholder="Search admin, target, details…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }} style={{ width: 180 }}>
          {ACTION_TYPES.map(a => <option key={a} value={a}>{a === 'all' ? 'All Actions' : a.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={adminFilter} onChange={e => { setAdminFilter(e.target.value); setPage(1); }} style={{ width: 160 }}>
          {admins.map(a => <option key={a} value={a}>{a === 'all' ? 'All Admins' : a}</option>)}
        </select>
        {(search || actionFilter !== 'all' || adminFilter !== 'all') && (
          <button className="btn-ghost btn-sm" onClick={() => { setSearch(''); setActionFilter('all'); setAdminFilter('all'); }}>✕ Clear</button>
        )}
      </div>

      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
        Showing {filtered.length} of {MOCK_AUDIT.length} entries — read-only, cannot be edited
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {['Timestamp', 'Admin', 'Action', 'Target', 'Details', 'IP Address'].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={6}><EmptyState message="No audit entries match your filters" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>} /></td></tr>
            ) : paged.map(entry => (
              <tr key={entry.id}>
                <td style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{formatTs(entry.timestamp)}</td>
                <td style={{ fontWeight: 600 }}>{entry.admin}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{ACTION_ICONS[entry.action] || '⚡'}</span>
                    <Badge color={ACTION_COLORS[entry.action] || 'gray'}>{entry.action.replace(/_/g, ' ')}</Badge>
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{entry.target}</td>
                <td style={{ color: 'var(--muted)', fontSize: 13 }}>{entry.details}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' }}>{entry.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
