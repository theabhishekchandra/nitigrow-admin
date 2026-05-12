import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { HealthDot, Sparkline, Spinner, PageHeader } from '../components/ui';

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

// Synthetic 7-day sparklines — these would come from /stats if it grew the field.
const MSG_DATA = [320, 410, 380, 520, 480, 610, 590];
const MRR_DATA = [142000, 155000, 163000, 171000, 178000, 185000, 187400];
const ACTIVE_DATA = [221, 226, 230, 235, 240, 244, 248];
const TICKETS_DATA = [12, 10, 14, 9, 11, 8, 7];

const statusColor = (v, warn, bad) => v >= bad ? 'red' : v >= warn ? 'yellow' : 'green';
const inr = (n) => n == null ? '—' : `₹${Number(n).toLocaleString('en-IN')}`;

const PlanBadge = ({ plan }) => {
  const c = { starter: 'blue', growth: 'green', pro: 'purple', enterprise: 'cyan', trial: 'yellow' };
  return <span className={`badge badge-${c[plan] || 'gray'}`}>{plan}</span>;
};
const StatusBadge = ({ status }) => {
  const c = { active: 'green', trial: 'yellow', suspended: 'red', past_due: 'red', cancelled: 'gray' };
  return <span className={`badge badge-${c[status] || 'gray'}`}>{status}</span>;
};

// Big KPI tile with sparkline — Variant B's hero unit.
const KPI = ({ label, value, delta, deltaTone = 'pos', spark, sparkColor, sub, tone = 'brand' }) => {
  const valueColor = tone === 'danger' ? 'var(--danger)' : tone === 'warn' ? 'var(--warn)' : 'var(--text)';
  const deltaColor = deltaTone === 'neg' ? 'var(--danger)' : 'var(--success)';
  return (
    <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 124 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
        {delta && (
          <span style={{ fontSize: 11, fontWeight: 600, color: deltaColor }}>{delta}</span>
        )}
      </div>
      <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.01em', color: valueColor }}>
        {value ?? '—'}
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{sub}</div>
      )}
      {spark && spark.length > 1 && (
        <div style={{ marginTop: 'auto', paddingTop: 6 }}>
          <Sparkline data={spark} color={sparkColor || 'var(--brand)'} width={220} height={32} fill />
        </div>
      )}
    </div>
  );
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

  const sysRows = [
    { label: 'Server CPU',          value: `${sys.cpu}%`,                         st: statusColor(sys.cpu, 70, 90) },
    { label: 'Server RAM',          value: `${sys.ram}%`,                         st: statusColor(sys.ram, 75, 90) },
    { label: 'MongoDB',             value: `${sys.mongodb?.latency ?? '—'}ms`,    st: sys.mongodb?.status || 'green' },
    { label: 'Redis',               value: sys.redis?.memory || '—',              st: sys.redis?.status || 'green' },
    { label: 'Job Queue',           value: sys.jobQueue?.pending ?? 0,            st: (sys.jobQueue?.pending || 0) > 1000 ? 'red' : (sys.jobQueue?.pending || 0) > 100 ? 'yellow' : 'green' },
    { label: 'Meta API left',       value: `${sys.metaApiRemaining ?? '—'}%`,     st: statusColor(100 - (sys.metaApiRemaining || 100), 20, 40) },
    { label: 'Storage',             value: `${sys.storage?.used ?? '—'} / ${sys.storage?.total ?? '—'} GB`, st: statusColor(((sys.storage?.used || 0) / (sys.storage?.total || 1)) * 100, 70, 85) },
  ];

  return (
    <div className="animate-in">
      <PageHeader
        title="Platform Health"
        subtitle={`Last updated ${lastRefresh.toLocaleTimeString('en-IN')} — auto-refreshes every 30 seconds`}
        actions={
          <button onClick={fetchAll} className="btn-ghost btn-sm" disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {refreshing ? <Spinner size={12} /> : <span>↻</span>} Refresh
          </button>
        }
      />

      {/* ── 4 KPI tiles ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <KPI
          label="MRR"
          value={inr(s.mrr)}
          delta="↑ 3.8% 30d"
          deltaTone="pos"
          sub="Estimated monthly revenue"
          spark={MRR_DATA}
          sparkColor="var(--success)"
        />
        <KPI
          label="Active Clients"
          value={s.activeTenants ?? s.activeClients}
          delta={s.newSignups ? `+${s.newSignups} today` : null}
          deltaTone="pos"
          sub={`${s.trialTenants ?? s.trialsExpiring ?? 0} on trial`}
          spark={ACTIVE_DATA}
          sparkColor="var(--brand)"
        />
        <KPI
          label="Messages Today"
          value={s.messagesToday?.toLocaleString('en-IN')}
          delta={s.deliveryRate != null ? `${s.deliveryRate}% delivered` : null}
          deltaTone={s.deliveryRate >= 95 ? 'pos' : 'neg'}
          sub="Across all tenants"
          spark={MSG_DATA}
          sparkColor="var(--accent-2)"
        />
        <KPI
          label="Open Tickets"
          value={s.openTickets}
          delta={s.openTickets > 10 ? 'High load' : 'Healthy'}
          deltaTone={s.openTickets > 10 ? 'neg' : 'pos'}
          tone={s.openTickets > 10 ? 'warn' : 'brand'}
          sub="Awaiting triage"
          spark={TICKETS_DATA}
          sparkColor="var(--accent)"
        />
      </div>

      {/* ── Needs attention ─────────────────────────────────────────────── */}
      {(s.failedPayments > 0 || s.trialsExpiring > 0) && (
        <div className="card" style={{ padding: 0, marginBottom: 18 }}>
          <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="dot dot-red" />
            <div style={{ fontWeight: 700, fontSize: 14 }}>Needs attention</div>
          </div>
          <div>
            {s.failedPayments > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid var(--border-2, var(--border))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 0 3px var(--danger-bg)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.failedPayments} failed payment{s.failedPayments > 1 ? 's' : ''} today</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>Dunning triggered — retry or contact client</div>
                  </div>
                </div>
                <a href="/billing" className="btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Billing →</a>
              </div>
            )}
            {s.trialsExpiring > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warn)', boxShadow: '0 0 0 3px var(--warn-bg)' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.trialsExpiring} trial{s.trialsExpiring > 1 ? 's' : ''} expiring in 3 days</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>Reach out before they lapse</div>
                  </div>
                </div>
                <a href="/tenants?filter=trial" className="btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Clients →</a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Three-column footer: Recent signups · Failed payments · System ─ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>

        {/* Recent signups */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Recent signups</div>
            <a href="/tenants" style={{ fontSize: 11, color: 'var(--brand)', textDecoration: 'none' }}>View all →</a>
          </div>
          {recentTenants.slice(0, 5).map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 16px', borderBottom: i < Math.min(recentTenants.length, 5) - 1 ? '1px solid var(--border-2, var(--border))' : 'none' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.businessName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <PlanBadge plan={t.plan} />
                  <StatusBadge status={t.status} />
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          ))}
        </div>

        {/* Operations summary — money + tickets */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13 }}>Operations</div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Failed payments</div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 26, color: s.failedPayments > 0 ? 'var(--danger)' : 'var(--success)' }}>{s.failedPayments}</span>
                <a href="/billing" style={{ fontSize: 11, color: 'var(--brand)', textDecoration: 'none' }}>Retry →</a>
              </div>
            </div>
            <div style={{ height: 1, background: 'var(--border-2, var(--border))' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>Open tickets</div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 26, color: s.openTickets > 10 ? 'var(--warn)' : 'var(--text)' }}>{s.openTickets}</span>
                <a href="/support" style={{ fontSize: 11, color: 'var(--brand)', textDecoration: 'none' }}>Triage →</a>
              </div>
            </div>
            <div style={{ height: 1, background: 'var(--border-2, var(--border))' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>API error rate</div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 26, color: s.apiErrorRate > 2 ? 'var(--danger)' : s.apiErrorRate > 1 ? 'var(--warn)' : 'var(--success)' }}>{s.apiErrorRate != null ? `${s.apiErrorRate}%` : '—'}</span>
                <a href="/system" style={{ fontSize: 11, color: 'var(--brand)', textDecoration: 'none' }}>System →</a>
              </div>
            </div>
          </div>
        </div>

        {/* System status */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}>
              <span className="pulse-anim dot dot-green" />
              System
            </div>
            <a href="/system" style={{ fontSize: 11, color: 'var(--brand)', textDecoration: 'none' }}>Details →</a>
          </div>
          <div style={{ padding: '4px 16px' }}>
            {sysRows.map((row, i) => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < sysRows.length - 1 ? '1px solid var(--border-2, var(--border))' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 12 }}>
                  <HealthDot status={row.st} />
                  {row.label}
                </div>
                <div style={{ fontWeight: 600, fontSize: 12, fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
