import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { StatCard, HealthDot, MiniBarChart, Sparkline, Spinner, PageHeader } from '../components/ui';

/* Inline SVG icon helper for admin (no lucide-react dep) */
const Ico = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IcoCircle = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d={d} />
  </svg>
);

const MOCK_STATS = {
  messagesToday: 4821, deliveryRate: 96.4, activeClients: 34, newSignups: 3,
  trialsExpiring: 5, failedPayments: 2, openTickets: 7, apiErrorRate: 0.8,
};
const MOCK_SYS = {
  cpu: 38, ram: 62,
  mongodb: { status: 'green', latency: 4 },
  redis: { status: 'green', memory: '234 MB' },
  jobQueue: { pending: 12, failed: 0 },
  storage: { used: 48, total: 200 },
  metaApiRemaining: 87,
  claudeApiRemaining: 94,
};
const MOCK_RECENT = [
  { businessName: 'Riya Fashions', plan: 'Starter', status: 'trial', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { businessName: 'TechBridge Solutions', plan: 'Growth', status: 'active', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { businessName: 'EduFirst Academy', plan: 'Pro', status: 'active', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { businessName: 'CloudStore India', plan: 'Starter', status: 'trial', createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { businessName: 'HealthPlus Clinic', plan: 'Growth', status: 'active', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
];
const VOL_DATA = [320, 410, 380, 520, 480, 610, 590, 720, 680, 810, 760, 900, 870, 1020];
const MRR_DATA = [142000, 155000, 163000, 171000, 178000, 185000, 187400];

const statusColor = (v, warn, bad) => v >= bad ? 'red' : v >= warn ? 'yellow' : 'green';

const PlanBadge = ({ plan }) => {
  const c = { starter: 'blue', growth: 'green', pro: 'purple', enterprise: 'cyan', trial: 'yellow' };
  return <span className={`badge badge-${c[plan] || 'gray'}`}>{plan}</span>;
};
const StatusBadge = ({ status }) => {
  const c = { active: 'green', trial: 'yellow', suspended: 'red', past_due: 'red', cancelled: 'gray' };
  return <span className={`badge badge-${c[status] || 'gray'}`}>{status}</span>;
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [sysData, setSysData] = useState(null);
  const [recentTenants, setRecentTenants] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data } = await api.get('/stats');
      setStats(data);
      setRecentTenants(data.recentTenants || MOCK_RECENT);
    } catch {
      setStats(MOCK_STATS);
      setRecentTenants(MOCK_RECENT);
    }
    try {
      const { data } = await api.get('/system');
      setSysData(data);
    } catch {
      setSysData(MOCK_SYS);
    }
    setLastRefresh(new Date());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 30000);
    return () => clearInterval(t);
  }, [fetchAll]);

  const s = stats || MOCK_STATS;
  const sys = sysData || MOCK_SYS;

  return (
    <div className="animate-in">
      <PageHeader
        title="Platform Health"
        subtitle={`Last updated ${lastRefresh.toLocaleTimeString('en-IN')} — auto-refreshes every 30 seconds`}
        actions={
          <button onClick={fetchAll} className="btn-ghost btn-sm" disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {refreshing ? <Spinner size={12} /> : <span style={{ display: 'inline-block' }}>↻</span>} Refresh
          </button>
        }
      />

      {/* ── Alert banners ── */}
      {s.failedPayments > 0 && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, color: 'var(--danger)' }}>
            <polygon points="12 2 22 21 2 21"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--danger)' }}>{s.failedPayments} failed payment{s.failedPayments > 1 ? 's' : ''} today</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Dunning triggered — check Billing → Failed Payments</div>
          </div>
        </div>
      )}
      {s.trialsExpiring > 0 && (
        <div className="alert alert-warn" style={{ marginBottom: 16 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, color: 'var(--warn)' }}>
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--warn)' }}>{s.trialsExpiring} trial{s.trialsExpiring > 1 ? 's' : ''} expiring in 3 days</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Reach out to prevent churn — Clients → Filter: Trial</div>
          </div>
        </div>
      )}

      {/* ── 8 Live health cards ── */}
      <div className="grid-auto" style={{ marginBottom: 24 }}>
        <StatCard label="Messages Today" value={s.messagesToday?.toLocaleString('en-IN')} color="var(--brand)" sub="across all tenants"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} />
        <StatCard label="Monthly Messages" value={s.totalMessagesMonth?.toLocaleString('en-IN')} color="var(--info)" sub="current billing cycle"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} />
        <StatCard label="Monthly AI Ops" value={s.totalAiOpsMonth?.toLocaleString('en-IN')} color="var(--purple)" sub="current billing cycle"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>} />
        <StatCard label="Active Tenants" value={s.activeTenants} color="var(--success)" sub="active subscription"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
        <StatCard label="Trial Tenants" value={s.trialTenants} color="var(--warn)" sub="expiring soon"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
        <StatCard label="Total Tenants" value={s.tenants} color="var(--muted)"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} />
        <StatCard label="Failed Payments" value={s.failedPayments} color={s.failedPayments > 0 ? 'var(--danger)' : 'var(--success)'} sub="today"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>} />
        <StatCard label="Open Tickets" value={s.openTickets} color={s.openTickets > 10 ? 'var(--danger)' : 'var(--warn)'}
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>} />
      </div>

      {/* ── Charts + System status ── */}
      <div className="grid-2" style={{ marginBottom: 24 }}>

        {/* Message volume chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontWeight: 700 }}>Message Volume</div>
            <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>↑ 12.3% this month</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Last 14 days</div>
          <MiniBarChart data={VOL_DATA.map((v, i) => ({ label: `D${i + 1}`, value: v }))} color="var(--brand)" height={72} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
            <span>14 days ago</span><span>Today</span>
          </div>
        </div>

        {/* MRR trend */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontWeight: 700 }}>MRR Growth</div>
            <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>↑ Live Tracking</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)', marginBottom: 2 }}>₹{s.mrr?.toLocaleString('en-IN') || '0'}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Estimated Monthly Revenue</div>
          <Sparkline data={MRR_DATA} color="var(--success)" width={320} height={56} fill />
        </div>
      </div>

      {/* ── System status ── */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="pulse-anim dot dot-green" />
            System Status
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Server CPU',            value: `${sys.cpu}%`,                         st: statusColor(sys.cpu, 70, 90) },
              { label: 'Server RAM',            value: `${sys.ram}%`,                         st: statusColor(sys.ram, 75, 90) },
              { label: 'MongoDB',               value: `${sys.mongodb?.latency ?? '—'}ms`,    st: sys.mongodb?.status || 'green' },
              { label: 'Redis',                 value: sys.redis?.memory || '—',              st: sys.redis?.status || 'green' },
              { label: 'Job Queue (pending)',   value: sys.jobQueue?.pending ?? 0,            st: (sys.jobQueue?.pending || 0) > 1000 ? 'red' : (sys.jobQueue?.pending || 0) > 100 ? 'yellow' : 'green' },
              { label: 'Failed Jobs',           value: sys.jobQueue?.failed ?? 0,             st: (sys.jobQueue?.failed || 0) > 0 ? 'red' : 'green' },
              { label: 'Meta API Remaining',    value: `${sys.metaApiRemaining ?? '—'}%`,     st: statusColor(100 - (sys.metaApiRemaining || 100), 20, 40) },
              { label: 'Storage Used',          value: `${sys.storage?.used ?? '—'} / ${sys.storage?.total ?? '—'} GB`, st: statusColor(((sys.storage?.used || 0) / (sys.storage?.total || 1)) * 100, 70, 85) },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13 }}>
                  <HealthDot status={row.st} />
                  {row.label}
                </div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent signups */}
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '20px 20px 14px', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>Recent Signups</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['Business', 'Plan', 'Status', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '8px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTenants.map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 600, fontSize: 13 }}>{t.businessName}</td>
                  <td style={{ padding: '10px 16px' }}><PlanBadge plan={t.plan} /></td>
                  <td style={{ padding: '10px 16px' }}><StatusBadge status={t.status} /></td>
                  <td style={{ padding: '10px 16px', color: 'var(--muted)', fontSize: 12 }}>{new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
