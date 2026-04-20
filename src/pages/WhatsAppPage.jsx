import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Badge, PageHeader, HealthDot, Section, EmptyState } from '../components/ui';

const MOCK_QUALITY = [
  { _id: '1', businessName: 'EduFirst Academy', waNumber: '+91 99887 76655', quality: 'GREEN', messagesDay: 580, trend: 'stable', lastChanged: '7 days ago' },
  { _id: '2', businessName: 'TechBridge Solutions', waNumber: '+91 91234 56789', quality: 'GREEN', messagesDay: 230, trend: 'improving', lastChanged: '3 days ago' },
  { _id: '3', businessName: 'CloudStore India', waNumber: '+91 97654 32100', quality: 'YELLOW', messagesDay: 45, trend: 'declining', lastChanged: '2 days ago' },
  { _id: '4', businessName: 'FoodieHub Kitchen', waNumber: '+91 94321 09876', quality: 'YELLOW', messagesDay: 18, trend: 'declining', lastChanged: '1 day ago' },
  { _id: '5', businessName: 'AutoDrive Motors', waNumber: '+91 93210 98765', quality: 'RED', messagesDay: 0, trend: 'declining', lastChanged: '5 days ago' },
  { _id: '6', businessName: 'SwiftDeliver Logistics', waNumber: '+91 98765 43210', quality: 'GREEN', messagesDay: 1840, trend: 'improving', lastChanged: '14 days ago' },
];

const MOCK_TEMPLATES = [
  { businessName: 'EduFirst Academy', name: 'course_reminder', category: 'Utility', status: 'approved', submittedAt: '3 days ago' },
  { businessName: 'CloudStore India', name: 'flash_sale_promo', category: 'Marketing', status: 'rejected', reason: 'Contains promotional language without opt-in disclosure', submittedAt: '1 day ago' },
  { businessName: 'TechBridge Solutions', name: 'support_followup', category: 'Utility', status: 'pending', submittedAt: '12 hrs ago' },
  { businessName: 'FoodieHub Kitchen', name: 'menu_offer', category: 'Marketing', status: 'paused', reason: 'Low engagement rate (12%)', submittedAt: '5 days ago' },
  { businessName: 'Riya Fashions', name: 'new_collection', category: 'Marketing', status: 'approved', submittedAt: '6 days ago' },
];

const MOCK_API_ERRORS = [
  { time: '14:32', client: 'CloudStore India', code: '131026', type: 'Template rejected', message: 'Template not found or not approved' },
  { time: '13:15', client: 'FoodieHub Kitchen', code: '131047', type: 'Rate limit', message: 'Message limit reached for this phone number' },
  { time: '11:50', client: 'AutoDrive Motors', code: '130429', type: 'Account suspended', message: 'WhatsApp account temporarily restricted' },
  { time: '10:22', client: 'TechBridge Solutions', code: '131021', type: 'Token invalid', message: 'Provided access token is expired' },
];

const qColor = { GREEN: 'var(--success)', YELLOW: 'var(--warn)', RED: 'var(--danger)' };
const qStatus = { GREEN: 'green', YELLOW: 'yellow', RED: 'red' };

export default function WhatsAppPage() {
  const [tab, setTab] = useState('quality');
  const [quality, setQuality] = useState([]);
  const [filterQ, setFilterQ] = useState('all');

  useEffect(() => {
    api.get('/whatsapp/quality').then(r => setQuality(r.data)).catch(() => setQuality(MOCK_QUALITY));
  }, []);

  const filtered = filterQ === 'all' ? quality : quality.filter(q => q.quality === filterQ);

  const stats = { green: quality.filter(q => q.quality === 'GREEN').length, yellow: quality.filter(q => q.quality === 'YELLOW').length, red: quality.filter(q => q.quality === 'RED').length };

  return (
    <div className="animate-in">
      <PageHeader title="WhatsApp Monitoring" subtitle="Quality ratings, template approvals, Meta API health" />

      {/* Summary cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: 'Green (Healthy)', count: stats.green, color: 'var(--success)', cls: 'badge-green' },
          { label: 'Yellow (Warning)', count: stats.yellow, color: 'var(--warn)', cls: 'badge-yellow' },
          { label: 'Red (Action needed)', count: stats.red, color: 'var(--danger)', cls: 'badge-red' },
        ].map(({ label, count, color, cls }) => (
          <div key={label} className="card card-sm" style={{ borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color }}>{count}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>client{count !== 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-list">
        {[['quality', '📊 Quality Alerts'], ['templates', '📋 Template Monitor'], ['meta', '📡 Meta API Health']].map(([k, label]) => (
          <button key={k} className={`tab-btn${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {/* Quality Alerts */}
      {tab === 'quality' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['all', 'GREEN', 'YELLOW', 'RED'].map(f => (
              <button key={f} onClick={() => setFilterQ(f)}
                style={{ padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, border: '1px solid var(--border)', background: filterQ === f ? 'var(--brand)' : 'var(--card)', color: filterQ === f ? '#fff' : 'var(--muted)', cursor: 'pointer' }}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {['Business', 'WA Number', 'Quality', 'Msgs Today', 'Trend', 'Changed', 'Actions'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}><EmptyState message="No clients match filter" /></td></tr>
                ) : filtered.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.businessName}</td>
                    <td style={{ color: 'var(--muted)', fontFamily: 'monospace', fontSize: 12 }}>{c.waNumber}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <HealthDot status={qStatus[c.quality]} />
                        <span style={{ fontWeight: 700, color: qColor[c.quality] }}>{c.quality}</span>
                      </div>
                    </td>
                    <td>{c.messagesDay.toLocaleString('en-IN')}</td>
                    <td>
                      <span style={{ color: c.trend === 'improving' ? 'var(--success)' : c.trend === 'declining' ? 'var(--danger)' : 'var(--muted)', fontSize: 12 }}>
                        {c.trend === 'improving' ? '↑ Improving' : c.trend === 'declining' ? '↓ Declining' : '→ Stable'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{c.lastChanged}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {c.quality !== 'GREEN' && <button className="btn-warn btn-xs">Pause Campaigns</button>}
                        {c.quality !== 'GREEN' && <button className="btn-ghost btn-xs">Notify Client</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Template Monitor */}
      {tab === 'templates' && (
        <div>
          <div className="grid-4" style={{ marginBottom: 20 }}>
            {[
              { label: 'Approved', count: MOCK_TEMPLATES.filter(t => t.status === 'approved').length, color: 'var(--success)' },
              { label: 'Pending', count: MOCK_TEMPLATES.filter(t => t.status === 'pending').length, color: 'var(--warn)' },
              { label: 'Rejected', count: MOCK_TEMPLATES.filter(t => t.status === 'rejected').length, color: 'var(--danger)' },
              { label: 'Paused', count: MOCK_TEMPLATES.filter(t => t.status === 'paused').length, color: 'var(--muted)' },
            ].map(({ label, count, color }) => (
              <div key={label} className="card card-sm" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr>{['Business', 'Template Name', 'Category', 'Status', 'Reason', 'Submitted'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {MOCK_TEMPLATES.map((t, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{t.businessName}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.name}</td>
                    <td><Badge color={{ Utility: 'blue', Marketing: 'purple', Authentication: 'green' }[t.category]}>{t.category}</Badge></td>
                    <td><Badge>{t.status}</Badge></td>
                    <td style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 240 }}>{t.reason || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{t.submittedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Meta API Health */}
      {tab === 'meta' && (
        <div>
          <div className="grid-3" style={{ marginBottom: 20 }}>
            <div className="card card-sm">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Errors (last 24h)</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--danger)' }}>{MOCK_API_ERRORS.length}</div>
            </div>
            <div className="card card-sm">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Rate Limit Remaining</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)' }}>87%</div>
            </div>
            <div className="card card-sm">
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Last Webhook</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)' }}>2 min ago ✅</div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr>{['Time', 'Client', 'Error Code', 'Type', 'Message'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {MOCK_API_ERRORS.map((e, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' }}>{e.time}</td>
                    <td style={{ fontWeight: 600 }}>{e.client}</td>
                    <td><code style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{e.code}</code></td>
                    <td><Badge color="red">{e.type}</Badge></td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
