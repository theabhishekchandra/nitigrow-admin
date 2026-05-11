import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Badge, PageHeader, Spinner, EmptyState, ProgressBar } from '../components/ui';

const PLANS = ['all', 'starter', 'growth', 'pro', 'enterprise'];
const STATUSES = ['all', 'active', 'trial', 'past_due', 'suspended', 'cancelled'];

const healthColor = (s) => s >= 70 ? 'var(--success)' : s >= 40 ? 'var(--warn)' : 'var(--danger)';
const healthLabel = (s) => s >= 70 ? '●' : s >= 40 ? '●' : '●';

function exportCSV(data) {
  const cols = ['Business Name', 'Email', 'Phone', 'Plan', 'Status', 'Messages Usage', 'AI Usage', 'Health', 'Joined'];
  const rows = data.map(t => [
    t.businessName, t.email, t.phone, t.plan, t.status,
    `${t.usage?.messagesSent || 0} / ${t.limits?.messages || 0}`,
    `${t.usage?.aiOperations || 0} / ${t.limits?.aiOperations || 0}`,
    t.healthScore || 0,
    new Date(t.createdAt).toLocaleDateString('en-IN'),
  ]);
  const csv = [cols, ...rows].map(r => r.join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `clients-${Date.now()}.csv`; a.click();
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState({ col: 'createdAt', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const PER_PAGE = 10;

  const loadTenants = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tenants', { params: { search, plan: plan !== 'all' ? plan : undefined, status: status !== 'all' ? status : undefined } });
      setTenants(Array.isArray(data) ? data : data.tenants || []);
    } catch {
      setTenants([]);
    }
    setLoading(false);
  }, [search, plan, status]);

  useEffect(() => { loadTenants(); setPage(1); }, [loadTenants]);

  const handleSuspend = async (id, cur) => {
    const action = cur === 'suspended' ? 'active' : 'suspended';
    if (!confirm(`${action === 'suspended' ? 'Suspend' : 'Reactivate'} this client?`)) return;
    try { await api.patch(`/tenants/${id}/status`, { status: action }); } catch {}
    setTenants(prev => prev.map(t => t._id === id ? { ...t, status: action } : t));
  };

  const toggleSort = (col) => setSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }));

  const filtered = tenants
    .filter(t => {
      const q = search.toLowerCase();
      return !q || t.businessName?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q) || t.phone?.includes(q);
    })
    .filter(t => plan === 'all' || t.plan === plan)
    .filter(t => status === 'all' || t.status === status)
    .sort((a, b) => {
      let va = a[sort.col], vb = b[sort.col];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return sort.dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(total / PER_PAGE);

  const SortIcon = ({ col }) => sort.col === col ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ' ↕';

  return (
    <div className="animate-in">
      <PageHeader
        title="Clients"
        subtitle={`${total} client${total !== 1 ? 's' : ''} ${plan !== 'all' || status !== 'all' ? '(filtered)' : 'total'}`}
        actions={<>
          <button className="btn-ghost btn-sm" onClick={() => exportCSV(filtered)}>⬇ Export CSV</button>
        </>}
      />

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Search name, email, phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input"
          style={{ maxWidth: 280 }}
        />
        <select value={plan} onChange={e => setPlan(e.target.value)} className="select" style={{ width: 140 }}>
          {PLANS.map(p => <option key={p} value={p}>{p === 'all' ? 'All Plans' : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="select" style={{ width: 150 }}>
          {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
        </select>
        {(plan !== 'all' || status !== 'all' || search) && (
          <button className="btn-ghost btn-sm" onClick={() => { setSearch(''); setPlan('all'); setStatus('all'); }}>✕ Clear</button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {[
                { col: 'businessName', label: 'Business' },
                { col: 'plan', label: 'Plan' },
                { col: 'status', label: 'Status' },
                { col: 'usage.messagesSent', label: 'Messages' },
                { col: 'usage.aiOperations', label: 'AI Ops' },
                { col: 'healthScore', label: 'Health' },
                { col: 'createdAt', label: 'Joined' },
                { col: null, label: 'Actions' },
              ].map(({ col, label }) => (
                <th key={label} className={col ? 'sortable' : ''} onClick={() => col && toggleSort(col)}>
                  {label}{col && <SortIcon col={col} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center' }}><Spinner size={20} /></td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={8}><EmptyState message="No clients match your filters" /></td></tr>
            ) : paged.map(t => (
              <tr key={t._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => navigate(`/tenants/${t._id}`)} style={{ background: 'none', color: 'var(--brand)', fontWeight: 600, fontSize: 13, padding: 0, border: 'none', cursor: 'pointer' }}>
                      {t.businessName}
                    </button>
                    {t.vip && <span title="VIP Client">⭐</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{t.email}</div>
                </td>
                <td><Badge color={{ starter: 'blue', growth: 'green', pro: 'purple', enterprise: 'cyan' }[t.plan]}>{t.plan}</Badge></td>
                <td><Badge dot>{t.status}</Badge></td>
                <td style={{ width: 140 }}>
                  <ProgressBar value={t.usage?.messagesSent || 0} max={t.limits?.messages || 1000} showLabel />
                </td>
                <td style={{ width: 140 }}>
                  <ProgressBar value={t.usage?.aiOperations || 0} max={t.limits?.aiOperations || 50} showLabel />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700, color: healthColor(t.healthScore || 0) }}>{healthLabel(t.healthScore || 0)} {t.healthScore || 0}</span>
                  </div>
                </td>
                <td style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-ghost btn-xs" onClick={() => navigate(`/tenants/${t._id}`)}>View</button>
                    <button
                      className={`btn-xs ${t.status === 'suspended' ? 'btn-success' : 'btn-danger'}`}
                      onClick={() => handleSuspend(t._id, t.status)}
                    >
                      {t.status === 'suspended' ? 'Activate' : 'Suspend'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>
            Showing {Math.min((page - 1) * PER_PAGE + 1, total)}–{Math.min(page * PER_PAGE, total)} of {total}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                style={{ padding: '5px 10px', borderRadius: 6, fontSize: 13, fontWeight: page === i + 1 ? 700 : 400, background: page === i + 1 ? 'var(--brand)' : 'var(--card)', color: page === i + 1 ? '#FBF8F3' : 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                {i + 1}
              </button>
            ))}
            <button className="btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
