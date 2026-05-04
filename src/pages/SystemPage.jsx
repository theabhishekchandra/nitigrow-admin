import React, { useState, useEffect, useRef } from 'react';
import { Badge, HealthDot, PageHeader, Section } from '../components/ui';

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

const levelColor = { ERROR: 'var(--danger)', WARN: 'var(--warn)', INFO: 'var(--muted)' };
const levelBg = { ERROR: 'var(--danger-bg)', WARN: 'var(--warn-bg)', INFO: 'transparent' };

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

  return (
    <div className="animate-in">
      <PageHeader title="System Operations" subtitle="Job queues, live logs, feature flags, database health" />

      <div className="tab-list">
        {[['jobs', '⚙️ Job Monitor'], ['logs', '📋 Log Viewer'], ['flags', '🚩 Feature Flags'], ['db', '🗄 Database']].map(([k, l]) => (
          <button key={k} className={`tab-btn${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* Job Monitor */}
      {tab === 'jobs' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {MOCK_QUEUES.map(q => (
              <div key={q.name} className="card card-sm">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{q.name}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Pending', value: q.pending, color: q.pending > 100 ? 'var(--warn)' : 'var(--text)' },
                    { label: 'Processing', value: q.processing, color: 'var(--info)' },
                    { label: 'Completed', value: q.completed, color: 'var(--success)' },
                    { label: 'Failed', value: q.failed, color: q.failed > 0 ? 'var(--danger)' : 'var(--muted)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: 'var(--bg)', borderRadius: 6, padding: '6px 10px' }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value.toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {MOCK_FAILED_JOBS.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <HealthDot status="red" /> {MOCK_FAILED_JOBS.length} Failed Jobs
                </div>
                <button className="btn-ghost btn-sm">Retry All</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr>{['Job ID', 'Type', 'Client', 'Error', 'Time', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {MOCK_FAILED_JOBS.map(job => (
                      <tr key={job.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' }}>{job.id}</td>
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
            </div>
          )}
        </div>
      )}

      {/* Log Viewer */}
      {tab === 'logs' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <input placeholder="Search logs…" value={logSearch} onChange={e => setLogSearch(e.target.value)} style={{ maxWidth: 240 }} />
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'ERROR', 'WARN', 'INFO'].map(l => (
                <button key={l} onClick={() => setLogFilter(l)}
                  style={{ padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, border: '1px solid var(--border)', background: logFilter === l ? levelColor[l] || 'var(--brand)' : 'var(--card)', color: logFilter === l ? '#fff' : 'var(--muted)', cursor: 'pointer' }}>
                  {l}
                </button>
              ))}
            </div>
            <button className="btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>⬇ Download Logs</button>
          </div>
          <div style={{ background: '#0f172a', borderRadius: 12, padding: 0, overflow: 'hidden', fontFamily: 'monospace', fontSize: 12 }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="pulse-anim dot dot-green" />
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Live log stream — {filteredLogs.length} entries</span>
            </div>
            <div style={{ maxHeight: 440, overflowY: 'auto', padding: '8px 0' }} ref={logEndRef}>
              {filteredLogs.map((log, i) => (
                <div key={i} style={{ padding: '4px 16px', background: log.level === 'ERROR' ? 'rgba(239,68,68,0.08)' : 'transparent', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{log.ts}</span>
                  <span style={{ color: levelColor[log.level], fontWeight: 700, width: 44, flexShrink: 0 }}>{log.level}</span>
                  <span style={{ color: 'rgba(99,102,241,0.8)', width: 80, flexShrink: 0 }}>[{log.service}]</span>
                  <span style={{ color: 'rgba(255,255,255,0.75)', flex: 1 }}>{log.msg}</span>
                  {log.tenant && <span style={{ color: 'rgba(245,158,11,0.7)', flexShrink: 0 }}>{log.tenant}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feature Flags */}
      {tab === 'flags' && (
        <div>
          <div className="alert alert-warn" style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>🚩</span>
            <div>
              <div style={{ fontWeight: 600 }}>Global feature toggles</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Changes take effect within 30 seconds for all clients. Every change is logged to the audit trail.</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {flags.map(flag => (
              <div key={flag.key} className="card card-sm" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{flag.label}</span>
                    <Badge color={flag.global ? 'blue' : 'gray'}>{flag.global ? 'Global' : 'Beta'}</Badge>
                    {flag.key === 'maintenance_mode' && <Badge color="red">Emergency Kill Switch</Badge>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{flag.desc}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, fontFamily: 'monospace' }}>key: {flag.key}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: flag.enabled ? 'var(--success)' : 'var(--muted)', fontWeight: 600 }}>
                    {flag.enabled ? 'ON' : 'OFF'}
                  </span>
                  <button
                    onClick={() => toggleFlag(flag.key)}
                    style={{
                      width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', transition: 'all .2s',
                      background: flag.enabled ? 'var(--success)' : 'var(--border)', position: 'relative', flexShrink: 0,
                    }}
                  >
                    <span style={{ position: 'absolute', top: 2, left: flag.enabled ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
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
            <Section title="Collection Sizes">
              {[
                { name: 'messages', docs: '1.24M', size: '4.8 GB' },
                { name: 'contacts', docs: '84,200', size: '820 MB' },
                { name: 'tenants', docs: '55', size: '2.1 MB' },
                { name: 'templates', docs: '420', size: '18 MB' },
                { name: 'campaigns', docs: '1,840', size: '240 MB' },
                { name: 'audit_logs', docs: '12,400', size: '95 MB' },
              ].map(c => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <code style={{ color: 'var(--brand)', fontSize: 12 }}>{c.name}</code>
                  <div style={{ display: 'flex', gap: 16, color: 'var(--muted)' }}>
                    <span>{c.docs} docs</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{c.size}</span>
                  </div>
                </div>
              ))}
            </Section>
            <Section title="Slow Queries (>100ms)">
              {[
                { query: 'find messages where tenantId + createdAt', ms: 320, hint: 'Missing compound index on (tenantId, createdAt)' },
                { query: 'aggregate campaigns by deliveryRate', ms: 180, hint: 'Consider caching this result' },
              ].map((q, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'var(--danger-bg)', borderRadius: 8, marginBottom: 10, fontSize: 13 }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text)', marginBottom: 4 }}>{q.query}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{q.ms}ms</span>
                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>{q.hint}</span>
                  </div>
                </div>
              ))}
            </Section>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-secondary btn-sm">📥 Export Tenant Data (JSON)</button>
            <button className="btn-danger btn-sm">🗑 Delete Tenant Data (GDPR)</button>
          </div>
        </div>
      )}
    </div>
  );
}
