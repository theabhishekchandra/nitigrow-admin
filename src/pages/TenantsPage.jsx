import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Badge, PageHeader, Spinner, EmptyState } from '../components/ui';
import TenantDetailPanel from '../components/TenantDetailPanel';

const PLANS = ['all', 'starter', 'growth', 'pro', 'enterprise'];
const STATUSES = ['all', 'active', 'trial', 'past_due', 'suspended', 'cancelled'];

const healthDotColor = (s) => s >= 70 ? 'var(--success)' : s >= 40 ? 'var(--warn)' : 'var(--danger)';

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

const PLAN_BADGE_COLOR = { starter: 'blue', growth: 'green', pro: 'purple', enterprise: 'cyan', trial: 'yellow' };

function TenantRow({ tenant, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(tenant._id)}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: selected ? 'var(--brand-bg)' : 'transparent',
        borderLeft: `3px solid ${selected ? 'var(--brand)' : 'transparent'}`,
        borderBottom: '1px solid var(--border-2, var(--border))',
        borderRadius: 0,
        transition: 'background .12s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--bg-2, var(--bg))'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {tenant.businessName}
          </div>
          {tenant.vip && <span title="VIP" style={{ fontSize: 11 }}>⭐</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <Badge color={PLAN_BADGE_COLOR[tenant.plan]}>{tenant.plan}</Badge>
          <Badge dot>{tenant.status}</Badge>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%',
          background: healthDotColor(tenant.healthScore || 0),
          boxShadow: `0 0 0 3px ${healthDotColor(tenant.healthScore || 0)}22`,
        }} />
        <span style={{ fontSize: 10.5, color: 'var(--muted)', fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}>
          {new Date(tenant.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </button>
  );
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState({ col: 'createdAt', dir: 'desc' });
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  useEffect(() => { loadTenants(); }, [loadTenants]);

  const filtered = useMemo(() => tenants
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
    }), [tenants, search, plan, status, sort]);

  // Auto-select first tenant when list arrives (only if nothing selected yet, or selection drops out of filter)
  useEffect(() => {
    if (!filtered.length) { setSelectedId(null); return; }
    if (!selectedId || !filtered.some(t => t._id === selectedId)) {
      setSelectedId(filtered[0]._id);
    }
  }, [filtered]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard navigation: j/k or arrow keys to cycle the list
  useEffect(() => {
    const handler = (e) => {
      if (!filtered.length) return;
      const tag = (e.target?.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;
      const idx = Math.max(0, filtered.findIndex(t => t._id === selectedId));
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        setSelectedId(filtered[Math.min(filtered.length - 1, idx + 1)]._id);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setSelectedId(filtered[Math.max(0, idx - 1)]._id);
      } else if (e.key === 'Enter' && selectedId) {
        navigate(`/tenants/${selectedId}`);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, selectedId, navigate]);

  const counts = useMemo(() => ({
    total:  tenants.length,
    green:  tenants.filter(t => (t.healthScore || 0) >= 70).length,
    yellow: tenants.filter(t => (t.healthScore || 0) >= 40 && (t.healthScore || 0) < 70).length,
    red:    tenants.filter(t => (t.healthScore || 0) < 40).length,
    trial:  tenants.filter(t => t.status === 'trial').length,
    past:   tenants.filter(t => t.status === 'past_due').length,
  }), [tenants]);

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px - 24px - 24px)', minHeight: 480 }}>
      <PageHeader
        title="Clients"
        subtitle={`${filtered.length} of ${tenants.length} ${filtered.length !== tenants.length ? '(filtered)' : ''}`}
        actions={<button className="btn-ghost btn-sm" onClick={() => exportCSV(filtered)}>⬇ Export CSV</button>}
      />

      {/* Two-pane split */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '420px 1fr',
        gap: 14,
        flex: 1,
        minHeight: 0,
      }}>
        {/* ── Left pane: list ───────────────────────────────────────────── */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Filters */}
          <div style={{ padding: 12, borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              placeholder="Search name, email, phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input"
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={plan} onChange={e => setPlan(e.target.value)} className="select" style={{ flex: 1, padding: '6px 8px', fontSize: 12 }}>
                {PLANS.map(p => <option key={p} value={p}>{p === 'all' ? 'All plans' : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
              <select value={status} onChange={e => setStatus(e.target.value)} className="select" style={{ flex: 1, padding: '6px 8px', fontSize: 12 }}>
                {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--muted)' }}>
              <span>
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>🔴 {counts.red}</span>
                {' · '}
                <span style={{ color: 'var(--warn)',  fontWeight: 600 }}>🟡 {counts.yellow}</span>
                {' · '}
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>🟢 {counts.green}</span>
              </span>
              <span>↑/↓ navigate · Enter to open</span>
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}><Spinner size={18} /></div>
            ) : filtered.length === 0 ? (
              <EmptyState message="No clients match your filters" />
            ) : (
              filtered.map(t => (
                <TenantRow key={t._id} tenant={t} selected={t._id === selectedId} onSelect={setSelectedId} />
              ))
            )}
          </div>

          {/* Footer sort + count */}
          {!loading && filtered.length > 0 && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--muted)' }}>
              <span>Sort:</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { col: 'createdAt',    label: 'Joined' },
                  { col: 'businessName', label: 'Name' },
                  { col: 'healthScore',  label: 'Health' },
                ].map(o => (
                  <button
                    key={o.col}
                    onClick={() => setSort(s => ({ col: o.col, dir: s.col === o.col && s.dir === 'asc' ? 'desc' : 'asc' }))}
                    style={{
                      padding: '2px 7px', borderRadius: 5, fontSize: 11,
                      background: sort.col === o.col ? 'var(--brand-bg)' : 'transparent',
                      color: sort.col === o.col ? 'var(--brand)' : 'var(--muted)',
                      fontWeight: sort.col === o.col ? 600 : 500,
                    }}
                  >
                    {o.label}{sort.col === o.col ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right pane: detail ────────────────────────────────────────── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <TenantDetailPanel tenantId={selectedId} />
        </div>
      </div>
    </div>
  );
}
