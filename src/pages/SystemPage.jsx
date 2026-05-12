import React, { useState, useEffect, useRef } from 'react';
import { Badge, HealthDot, PageHeader, Section, Sparkline } from '../components/ui';

const MOCK_QUEUES = [
  { name: 'Message Queue', pending: 12, processing: 3, completed: 8420, failed: 0 },
  { name: 'Campaign Queue', pending: 2, processing: 1, completed: 341, failed: 1 },
  { name: 'AI Queue', pending: 5, processing: 2, completed: 1205, failed: 0 },
  { name: 'Notification Queue', pending: 0, processing: 0, completed: 4812, failed: 0 },
  { name: 'Webhook Queue', pending: 1, processing: 0, completed: 9102, failed: 2 },
];

const MOCK_FAILED_JOBS = [
  { id: 'job_001', type: 'campaign', client: 'CloudStore India', error: 'Template not found: flash_sale_v2', ts: '14:32 today' },
  { id: 'job_002', type: 'webhook', client: 'System', error: 'Connection timeout after 30s', ts: '11:15 today' },
  { id: 'job_003', type: 'campaign', client: 'FoodieHub Kitchen', error: 'Rate limit exceeded for phone number', ts: '09:48 today' },
];

const MOCK_LOGS = [
  { level: 'ERROR', ts: '14:32:01', service: 'campaign', msg: 'Template flash_sale_v2 not found for tenant cloudstore_01', tenant: 'cloudstore_01' },
  { level: 'WARN',  ts: '14:20:18', service: 'webhook',  msg: 'Webhook retry 3/5 for tenant edufirst_01', tenant: 'edufirst_01' },
  { level: 'INFO',  ts: '14:18:44', service: 'api',      msg: 'POST /api/messages — 200 OK — 142ms', tenant: null },
  { level: 'WARN',  ts: '13:55:22', service: 'rate-limit',msg: 'Meta API rate limit at 72% — throttling enabled', tenant: null },
  { level: 'ERROR', ts: '11:15:30', service: 'webhook',  msg: 'Connection timeout to Meta webhook endpoint after 30s', tenant: null },
  { level: 'INFO',  ts: '11:10:05', service: 'auth',     msg: 'Admin login: rahul@nitigrow.in from 103.21.xx.xx', tenant: null },
  { level: 'INFO',  ts: '11:02:18', service: 'campaign', msg: 'Campaign diwali_offer_q4 completed — 480 sent, 468 delivered', tenant: 'techbridge_02' },
];

const MOCK_FLAGS = [
  { key: 'chatbot_flows', label: 'Chatbot Flows', desc: 'Enable drag-and-drop chatbot builder', enabled: true, global: true },
  { key: 'ai_suggestions', label: 'AI Reply Suggestions', desc: 'Show AI-generated reply suggestions in inbox', enabled: true, global: true },
  { key: 'payment_links', label: 'Payment Links', desc: 'Send Razorpay payment links via WhatsApp', enabled: true, global: true },
  { key: 'bulk_import', label: 'Bulk Contact Import', desc: 'Import contacts from CSV (>5000 rows)', enabled: false, global: true },
  { key: 'maintenance_mode', label: 'Maintenance Mode', desc: 'Show maintenance banner to all clients', enabled: false, global: true },
  { key: 'beta_new_dashboard', label: 'New Dashboard (Beta)', desc: 'Opt-in to redesigned client dashboard', enabled: false, global: false },
];

// Synthetic data for sparklines + uptime calendar — purely visual, no backend dependency.
const API_LATENCY = [128, 142, 138, 156, 144, 132, 142];
const QUEUE_DEPTH = [8, 14, 22, 18, 15, 19, 20];
const ERROR_RATE  = [0.6, 0.9, 1.1, 0.8, 0.7, 1.0, 0.8];
const FAILED_JOBS_TREND = [2, 1, 4, 2, 3, 1, 3];

const SERVICES = [
  { key: 'api',       name: 'API gateway',        status: 'green',  stat: '142 ms',   sub: 'p95 latency',     spark: API_LATENCY,  color: 'var(--brand)' },
  { key: 'mongo',     name: 'MongoDB primary',    status: 'green',  stat: '4 ms',     sub: 'avg query',       spark: [3, 5, 4, 6, 4, 3, 4], color: 'var(--success)' },
  { key: 'redis',     name: 'Redis cache',        status: 'green',  stat: '234 MB',   sub: 'used memory',     spark: [210, 220, 225, 228, 230, 232, 234], color: 'var(--accent)' },
  { key: 'bullmq',    name: 'BullMQ workers',     status: 'yellow', stat: '20 jobs',  sub: 'queue depth',     spark: QUEUE_DEPTH,  color: 'var(--warn)' },
  { key: 'meta',      name: 'Meta WhatsApp API',  status: 'green',  stat: '87%',      sub: 'rate budget left', spark: [92, 90, 89, 88, 88, 87, 87], color: 'var(--success)' },
  { key: 'razorpay',  name: 'Razorpay',           status: 'green',  stat: '0 fails',  sub: 'last 24h',        spark: [0, 0, 1, 0, 0, 0, 0], color: 'var(--success)' },
  { key: 'anthropic', name: 'Anthropic Claude',   status: 'green',  stat: '94%',      sub: 'token budget',    spark: [98, 97, 96, 95, 95, 94, 94], color: 'var(--brand)' },
];

// 30-day uptime — synthetic. Each entry is a status colour.
const UPTIME_30 = (() => {
  const out = [];
  for (let i = 0; i < 30; i++) {
    const r = (i * 7 + 3) % 19;
    out.push(r === 11 ? 'red' : r === 4 || r === 17 ? 'yellow' : 'green');
  }
  return out;
})();

const levelColor = { ERROR: 'var(--danger)', WARN: 'var(--warn)', INFO: 'var(--muted)' };

// KPI tile mirroring DashboardPage's Variant B language.
const KPI = ({ label, value, sub, spark, sparkColor, tone = 'brand', delta, deltaTone = 'pos' }) => {
  const valueColor = tone === 'danger' ? 'var(--danger)' : tone === 'warn' ? 'var(--warn)' : 'var(--text)';
  const deltaColor = deltaTone === 'neg' ? 'var(--danger)' : 'var(--success)';
  return (
    <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 124 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
        {delta && <span style={{ fontSize: 11, fontWeight: 600, color: deltaColor }}>{delta}</span>}
      </div>
      <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.01em', color: valueColor }}>
        {value ?? '—'}
      </div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{sub}</div>}
      {spark && spark.length > 1 && (
        <div style={{ marginTop: 'auto', paddingTop: 6 }}>
          <Sparkline data={spark} color={sparkColor || 'var(--brand)'} width={220} height={32} fill />
        </div>
      )}
    </div>
  );
};

const ServiceCard = ({ s }) => (
  <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 110 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <HealthDot status={s.status} />
        <span style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
      </div>
      <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: s.status === 'green' ? 'var(--success)' : s.status === 'yellow' ? 'var(--warn)' : 'var(--danger)' }}>
        {s.status === 'green' ? 'Healthy' : s.status === 'yellow' ? 'Degraded' : 'Down'}
      </span>
    </div>
    <div>
      <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 22, letterSpacing: '-0.01em' }}>{s.stat}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.sub}</div>
    </div>
    {s.spark && s.spark.length > 1 && (
      <div style={{ marginTop: 'auto' }}>
        <Sparkline data={s.spark} color={s.color} width={220} height={26} fill />
      </div>
    )}
  </div>
);

export default function SystemPage() {
  const [tab, setTab] = useState('jobs');
  const [flags, setFlags] = useState(MOCK_FLAGS);
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [liveLog, setLiveLog] = useState(MOCK_LOGS);
  const logEndRef = useRef(null);

  const toggleFlag = (key) => {
    if (!confirm('Toggle this feature flag? It will take effect immediately for all clients.')) return;
    setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  const filteredLogs = liveLog.filter(l => {
    return (logFilter === 'all' || l.level === logFilter) &&
      (!logSearch || l.msg.toLowerCase().includes(logSearch.toLowerCase()) || (l.tenant || '').includes(logSearch));
  });

  // Derive a single overall banner status from service grid.
  const worst = SERVICES.reduce((acc, s) => s.status === 'red' ? 'red' : (s.status === 'yellow' && acc !== 'red') ? 'yellow' : acc, 'green');
  const banner = worst === 'green'
    ? { bg: 'var(--brand-bg)',  border: 'rgba(15,127,94,0.30)',  color: 'var(--brand)',  dot: 'green',  label: 'All systems operational' }
    : worst === 'yellow'
    ? { bg: 'var(--warn-bg)',   border: 'rgba(232,169,74,0.30)', color: 'var(--warn)',   dot: 'yellow', label: 'Degraded performance — investigating' }
    : { bg: 'var(--danger-bg)', border: 'rgba(192,59,59,0.30)',  color: 'var(--danger)', dot: 'red',    label: 'Major outage — incident in progress' };

  const totalPending = MOCK_QUEUES.reduce((a, q) => a + q.pending, 0);
  const totalFailed  = MOCK_QUEUES.reduce((a, q) => a + q.failed, 0);

  return (
    <div className="animate-in">
      <PageHeader title="System Operations" subtitle="Live service health, job queues, logs, feature flags" />

      {/* ── Live status banner ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: banner.bg, border: `1px solid ${banner.border}`, borderRadius: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`pulse-anim dot dot-${banner.dot}`} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: banner.color }}>{banner.label}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
              {SERVICES.length} services monitored · auto-refreshes every 30 seconds
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <a href="https://status.nitigrow.in" target="_blank" rel="noopener" className="btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Public status ↗</a>
        </div>
      </div>

      {/* ── KPI strip ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <KPI
          label="API uptime"
          value="99.97%"
          delta="↑ 0.02% 7d"
          deltaTone="pos"
          sub="rolling 30-day window"
          spark={[99.95, 99.96, 99.97, 99.97, 99.98, 99.97, 99.97]}
          sparkColor="var(--success)"
        />
        <KPI
          label="Queue depth"
          value={totalPending.toLocaleString('en-IN')}
          delta={totalPending > 100 ? 'High' : 'Healthy'}
          deltaTone={totalPending > 100 ? 'neg' : 'pos'}
          tone={totalPending > 100 ? 'warn' : 'brand'}
          sub="pending across BullMQ"
          spark={QUEUE_DEPTH}
          sparkColor="var(--brand)"
        />
        <KPI
          label="Failed jobs"
          value={totalFailed}
          delta={totalFailed > 0 ? 'Needs retry' : 'Clean'}
          deltaTone={totalFailed > 0 ? 'neg' : 'pos'}
          tone={totalFailed > 0 ? 'danger' : 'brand'}
          sub="last 24h"
          spark={FAILED_JOBS_TREND}
          sparkColor="var(--danger)"
        />
        <KPI
          label="Error rate"
          value="0.8%"
          delta="↓ 0.2% 24h"
          deltaTone="pos"
          sub="5xx + handler crashes"
          spark={ERROR_RATE}
          sparkColor="var(--accent)"
        />
      </div>

      {/* ── Service health grid ────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, marginBottom: 18 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Service health</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{SERVICES.filter(s => s.status === 'green').length} healthy · {SERVICES.filter(s => s.status === 'yellow').length} degraded · {SERVICES.filter(s => s.status === 'red').length} down</div>
        </div>
        <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {SERVICES.map(s => <ServiceCard key={s.key} s={s} />)}
        </div>
      </div>

      {/* ── 30-day uptime calendar ────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, marginBottom: 18 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>30-day uptime</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--success)' }} /> Operational</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--warn)' }} /> Degraded</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--danger)' }} /> Outage</span>
          </div>
        </div>
        <div style={{ padding: '16px 18px', display: 'flex', gap: 4, alignItems: 'flex-end' }}>
          {UPTIME_30.map((st, i) => {
            const color = st === 'green' ? 'var(--success)' : st === 'yellow' ? 'var(--warn)' : 'var(--danger)';
            return (
              <div key={i}
                title={`Day ${i + 1} — ${st === 'green' ? 'Operational' : st === 'yellow' ? 'Degraded' : 'Outage'}`}
                style={{
                  flex: 1, height: 28, borderRadius: 3,
                  background: color, opacity: 0.85,
                  boxShadow: `inset 0 -2px 0 ${color}`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ── Sub-tabs (preserved) ───────────────────────────────────────── */}
      <div className="tab-list">
        {[['jobs', 'Job Monitor'], ['logs', 'Log Viewer'], ['flags', 'Feature Flags'], ['db', 'Database']].map(([k, l]) => (
          <button key={k} className={`tab-btn${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* Job Monitor */}
      {tab === 'jobs' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
            {MOCK_QUEUES.map(q => {
              const queueStatus = q.failed > 0 ? 'red' : q.pending > 100 ? 'yellow' : 'green';
              return (
                <div key={q.name} className="card" style={{ padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <HealthDot status={queueStatus} />
                      <span style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.name}</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      { label: 'Pending', value: q.pending, color: q.pending > 100 ? 'var(--warn)' : 'var(--text)' },
                      { label: 'Processing', value: q.processing, color: 'var(--brand)' },
                      { label: 'Completed', value: q.completed, color: 'var(--success)' },
                      { label: 'Failed', value: q.failed, color: q.failed > 0 ? 'var(--danger)' : 'var(--muted)' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: 'var(--bg)', borderRadius: 6, padding: '6px 10px' }}>
                        <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
                        <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 18, letterSpacing: '-0.01em', color }}>{value.toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {MOCK_FAILED_JOBS.length > 0 && (
            <Section
              title={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><HealthDot status="red" /> Failed jobs · {MOCK_FAILED_JOBS.length}</span>}
              action={<button className="btn-ghost btn-sm">Retry all</button>}
            >
              <div className="table-wrap">
                <table>
                  <thead><tr>{['Job ID', 'Type', 'Client', 'Error', 'Time', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {MOCK_FAILED_JOBS.map(job => (
                      <tr key={job.id}>
                        <td style={{ fontFamily: 'var(--f-mono, ui-monospace, monospace)', fontSize: 12, color: 'var(--muted)' }}>{job.id}</td>
                        <td><Badge color="blue">{job.type}</Badge></td>
                        <td style={{ fontWeight: 600 }}>{job.client}</td>
                        <td style={{ color: 'var(--danger)', fontSize: 13 }}>{job.error}</td>
                        <td style={{ fontSize: 12, color: 'var(--muted)' }}>{job.ts}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-primary btn-xs">↻ Retry</button>
                            <button className="btn-ghost btn-xs">Dismiss</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
        </div>
      )}

      {/* Log Viewer */}
      {tab === 'logs' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input placeholder="Search logs…" value={logSearch} onChange={e => setLogSearch(e.target.value)} className="input" style={{ maxWidth: 240, flex: 1, minWidth: 180 }} />
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'ERROR', 'WARN', 'INFO'].map(l => {
                const active = logFilter === l;
                const accent = l === 'all' ? 'var(--brand)' : levelColor[l];
                return (
                  <button key={l} onClick={() => setLogFilter(l)}
                    style={{
                      padding: '4px 12px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
                      border: `1px solid ${active ? accent : 'var(--border)'}`,
                      background: active ? accent : 'transparent',
                      color: active ? '#FBF8F3' : 'var(--muted)',
                      cursor: 'pointer',
                    }}>
                    {l === 'all' ? 'All' : l}
                  </button>
                );
              })}
            </div>
            <button className="btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>⬇ Download</button>
          </div>
          <div style={{ background: '#1F1A14', padding: 0, overflow: 'hidden', fontFamily: 'var(--f-mono, ui-monospace, monospace)', fontSize: 12 }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="pulse-anim dot dot-green" />
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Live log stream — {filteredLogs.length} entries</span>
            </div>
            <div style={{ maxHeight: 440, overflowY: 'auto', padding: '8px 0' }} ref={logEndRef}>
              {filteredLogs.map((log, i) => (
                <div key={i} style={{ padding: '4px 16px', background: log.level === 'ERROR' ? 'rgba(239,68,68,0.08)' : log.level === 'WARN' ? 'rgba(232,169,74,0.06)' : 'transparent', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{log.ts}</span>
                  <span style={{ color: levelColor[log.level], fontWeight: 700, width: 44, flexShrink: 0 }}>{log.level}</span>
                  <span style={{ color: 'rgba(245,158,11,0.75)', width: 90, flexShrink: 0 }}>[{log.service}]</span>
                  <span style={{ color: 'rgba(243,236,217,0.85)', flex: 1 }}>{log.msg}</span>
                  {log.tenant && <span style={{ color: 'rgba(99,102,241,0.85)', flexShrink: 0 }}>{log.tenant}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feature Flags */}
      {tab === 'flags' && (
        <div>
          <div className="alert alert-warn" style={{ marginBottom: 18 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🚩</span>
            <div>
              <div style={{ fontWeight: 600 }}>Global feature toggles</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Changes take effect within 30 seconds for all clients. Every change is logged to the audit trail.</div>
            </div>
          </div>
          <div className="card" style={{ padding: 0 }}>
            {flags.map((flag, i) => (
              <div key={flag.key} style={{ padding: '14px 16px', borderBottom: i < flags.length - 1 ? '1px solid var(--border-2, var(--border))' : 'none', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{flag.label}</span>
                    <Badge color={flag.global ? 'blue' : 'gray'}>{flag.global ? 'Global' : 'Beta'}</Badge>
                    {flag.key === 'maintenance_mode' && <Badge color="red">Kill switch</Badge>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{flag.desc}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}>key: {flag.key}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: flag.enabled ? 'var(--success)' : 'var(--muted)' }}>
                    {flag.enabled ? 'On' : 'Off'}
                  </span>
                  <button
                    onClick={() => toggleFlag(flag.key)}
                    role="switch"
                    aria-checked={flag.enabled}
                    style={{
                      width: 38, height: 22, borderRadius: 99, border: 'none', cursor: 'pointer', transition: 'background .15s',
                      background: flag.enabled ? 'var(--brand)' : 'var(--border-3, var(--border))', position: 'relative', flexShrink: 0, padding: 0,
                    }}
                  >
                    <span style={{ position: 'absolute', top: 2, left: flag.enabled ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#FBF8F3', transition: 'left .15s' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Database */}
      {tab === 'db' && (
        <div>
          <div className="grid-2" style={{ marginBottom: 20 }}>
            <Section title="Collection sizes">
              {[
                { name: 'messages', docs: '1.24M', size: '4.8 GB' },
                { name: 'contacts', docs: '84,200', size: '820 MB' },
                { name: 'tenants', docs: '55', size: '2.1 MB' },
                { name: 'templates', docs: '420', size: '18 MB' },
                { name: 'campaigns', docs: '1,840', size: '240 MB' },
                { name: 'audit_logs', docs: '12,400', size: '95 MB' },
              ].map((c, i, arr) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-2, var(--border))' : 'none', fontSize: 13 }}>
                  <code style={{ color: 'var(--brand)', fontSize: 12, fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}>{c.name}</code>
                  <div style={{ display: 'flex', gap: 16, color: 'var(--muted)' }}>
                    <span>{c.docs} docs</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{c.size}</span>
                  </div>
                </div>
              ))}
            </Section>
            <Section title="Slow queries (>100ms)">
              {[
                { query: 'find messages where tenantId + createdAt', ms: 320, hint: 'Missing compound index on (tenantId, createdAt)' },
                { query: 'aggregate campaigns by deliveryRate', ms: 180, hint: 'Consider caching this result' },
              ].map((q, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'var(--danger-bg)', borderRadius: 8, marginBottom: 10, fontSize: 13, border: '1px solid rgba(192,59,59,0.18)' }}>
                  <div style={{ fontFamily: 'var(--f-mono, ui-monospace, monospace)', fontSize: 12, color: 'var(--text)', marginBottom: 4 }}>{q.query}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{q.ms}ms</span>
                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>{q.hint}</span>
                  </div>
                </div>
              ))}
            </Section>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary btn-sm">Export tenant data (JSON)</button>
            <button className="btn-danger btn-sm">Delete tenant data (GDPR)</button>
          </div>
        </div>
      )}
    </div>
  );
}
