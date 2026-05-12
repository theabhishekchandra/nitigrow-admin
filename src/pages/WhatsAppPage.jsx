import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
const qStatus = { GREEN: 'green', YELLOW: 'yellow', RED: 'red', UNKNOWN: 'gray' };
const qTone = { GREEN: 'var(--success)', YELLOW: 'var(--warn)', RED: 'var(--danger)', UNKNOWN: 'var(--muted)' };

const tierFor = (msgs) => {
  if (msgs >= 1000) return 'Tier 3 · 100k/24h';
  if (msgs >= 250) return 'Tier 2 · 10k/24h';
  if (msgs >= 50) return 'Tier 1 · 1k/24h';
  return 'Tier 0 · 250/24h';
};

const QualityTile = ({ label, count, tone, hint }) => (
  <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 124, borderLeft: `3px solid ${tone}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
      <HealthDot status={qStatus[label] || 'gray'} />
    </div>
    <div style={{
      fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)',
      fontWeight: 500, fontSize: 38, lineHeight: 1.05, letterSpacing: '-0.01em', color: tone,
    }}>
      {count}
    </div>
    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 'auto' }}>{hint}</div>
  </div>
);

export default function WhatsAppPage() {
  const [tab, setTab] = useState('quality');
  const [quality, setQuality] = useState([]);
  const [filterQ, setFilterQ] = useState('all');

  useEffect(() => {
    api.get('/whatsapp/quality').then(r => setQuality(r.data)).catch(() => setQuality(MOCK_QUALITY));
  }, []);

  const filtered = filterQ === 'all' ? quality : quality.filter(q => q.quality === filterQ);

  const stats = {
    green: quality.filter(q => q.quality === 'GREEN').length,
    yellow: quality.filter(q => q.quality === 'YELLOW').length,
    red: quality.filter(q => q.quality === 'RED').length,
    unknown: quality.filter(q => !['GREEN', 'YELLOW', 'RED'].includes(q.quality)).length,
  };

  const needsAttention = quality.filter(q => q.quality === 'YELLOW' || q.quality === 'RED');

  return (
    <div className="animate-in">
      <PageHeader
        title="WhatsApp Monitoring"
        subtitle="Quality ratings, template approvals, Meta API health"
      />

      {/* ── 4 Quality KPI tiles ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <QualityTile label="GREEN" count={stats.green} tone="var(--success)" hint="Healthy numbers — no action" />
        <QualityTile label="YELLOW" count={stats.yellow} tone="var(--warn)"    hint="Watch closely — declining" />
        <QualityTile label="RED" count={stats.red} tone="var(--danger)"  hint="Action required immediately" />
        <QualityTile label="UNKNOWN" count={stats.unknown} tone="var(--muted)"   hint="Awaiting first quality signal" />
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="tab-list">
        {[['quality', 'Quality Radar'], ['templates', 'Template Monitor'], ['meta', 'Meta API Health']].map(([k, label]) => (
          <button key={k} className={`tab-btn${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {/* ── Quality Radar ───────────────────────────────────────────────── */}
      {tab === 'quality' && (
        <>
          {/* Needs attention */}
          {needsAttention.length > 0 && (
            <Section
              title="Needs attention"
              action={<span style={{ fontSize: 12, color: 'var(--muted)' }}>{needsAttention.length} number{needsAttention.length !== 1 ? 's' : ''} flagged</span>}
              style={{ padding: 0 }}
            >
              <div style={{ marginTop: -16, marginLeft: -20, marginRight: -20, marginBottom: -20 }}>
                {needsAttention.map((c, i) => (
                  <div key={c._id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 20px',
                    borderTop: i === 0 ? '1px solid var(--hair, var(--border))' : '1px solid var(--hair-2, var(--border))',
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: qColor[c.quality],
                      boxShadow: `0 0 0 4px ${c.quality === 'RED' ? 'var(--danger-bg)' : 'var(--warn-bg)'}`,
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.businessName}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--f-mono, ui-monospace, monospace)', marginTop: 2 }}>
                        {c.waNumber}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, fontSize: 11.5, color: 'var(--muted)' }}>
                      <span style={{ fontWeight: 700, color: qColor[c.quality], fontSize: 12, letterSpacing: '.04em' }}>{c.quality}</span>
                      <span>{tierFor(c.messagesDay)}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', minWidth: 100, textAlign: 'right' }}>
                      {c.lastChanged}
                    </div>
                    <Link
                      to={`/tenants/${c._id}`}
                      className="btn-ghost btn-sm"
                      style={{ textDecoration: 'none', flexShrink: 0 }}
                    >
                      Open client →
                    </Link>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* All monitored numbers */}
          <Section
            title="All monitored numbers"
            action={
              <div style={{ display: 'flex', gap: 6 }}>
                {['all', 'GREEN', 'YELLOW', 'RED'].map(f => (
                  <button key={f} onClick={() => setFilterQ(f)}
                    style={{
                      padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                      border: '1px solid var(--hair, var(--border))',
                      background: filterQ === f ? 'var(--brand)' : 'transparent',
                      color: filterQ === f ? 'var(--paper, #FBF8F3)' : 'var(--muted)',
                      cursor: 'pointer',
                    }}>
                    {f === 'all' ? 'All' : f}
                  </button>
                ))}
              </div>
            }
            style={{ padding: 0 }}
          >
            <div style={{ marginTop: -16, marginLeft: -20, marginRight: -20, marginBottom: -20 }}>
              {filtered.length === 0 ? (
                <EmptyState message="No numbers match this filter" />
              ) : filtered.map((c, i) => (
                <div key={c._id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 20px',
                  borderTop: i === 0 ? '1px solid var(--hair, var(--border))' : '1px solid var(--hair-2, var(--border))',
                  transition: 'background .12s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2, var(--paper-2, transparent))'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13.5 }}>{c.businessName}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>· {tierFor(c.messagesDay)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--f-mono, ui-monospace, monospace)', marginTop: 3 }}>
                      {c.waNumber}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HealthDot status={qStatus[c.quality]} />
                      <span style={{ fontWeight: 700, color: qColor[c.quality], fontSize: 12, letterSpacing: '.04em' }}>{c.quality}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>checked {c.lastChanged}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Meta API quota inline card */}
          <Section title="Meta API quota">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Rate limit left</div>
                <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 26, color: 'var(--success)' }}>87%</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>Resets in 47 min</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Errors · last 24h</div>
                <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 26, color: MOCK_API_ERRORS.length > 0 ? 'var(--warn)' : 'var(--success)' }}>{MOCK_API_ERRORS.length}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>Across all tenants</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Last webhook</div>
                <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 26, color: 'var(--success)' }}>2m</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>Healthy</div>
              </div>
            </div>
          </Section>
        </>
      )}

      {/* ── Template Monitor ────────────────────────────────────────────── */}
      {tab === 'templates' && (
        <>
          <div className="grid-4" style={{ marginBottom: 20 }}>
            {[
              { label: 'Approved', count: MOCK_TEMPLATES.filter(t => t.status === 'approved').length, color: 'var(--success)' },
              { label: 'Pending',  count: MOCK_TEMPLATES.filter(t => t.status === 'pending').length,  color: 'var(--warn)' },
              { label: 'Rejected', count: MOCK_TEMPLATES.filter(t => t.status === 'rejected').length, color: 'var(--danger)' },
              { label: 'Paused',   count: MOCK_TEMPLATES.filter(t => t.status === 'paused').length,   color: 'var(--muted)' },
            ].map(({ label, count, color }) => (
              <div key={label} className="card card-sm" style={{ borderLeft: `3px solid ${color}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>{label}</div>
                <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 28, color, lineHeight: 1.05 }}>{count}</div>
              </div>
            ))}
          </div>
          <Section title="Template submissions" style={{ padding: 0 }}>
            <div style={{ marginTop: -16, marginLeft: -20, marginRight: -20, marginBottom: -20 }}>
              {MOCK_TEMPLATES.map((t, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
                  borderTop: i === 0 ? '1px solid var(--hair, var(--border))' : '1px solid var(--hair-2, var(--border))',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{t.businessName}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--f-mono, ui-monospace, monospace)', marginTop: 2 }}>{t.name}</div>
                    {t.reason && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>{t.reason}</div>}
                  </div>
                  <Badge color={{ Utility: 'blue', Marketing: 'purple', Authentication: 'green' }[t.category]}>{t.category}</Badge>
                  <Badge>{t.status}</Badge>
                  <span style={{ fontSize: 11.5, color: 'var(--muted)', minWidth: 90, textAlign: 'right' }}>{t.submittedAt}</span>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* ── Meta API Health ─────────────────────────────────────────────── */}
      {tab === 'meta' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }}>
            <div className="card" style={{ padding: 18, borderLeft: '3px solid var(--danger)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Errors (last 24h)</div>
              <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 32, color: 'var(--danger)', lineHeight: 1.05 }}>{MOCK_API_ERRORS.length}</div>
            </div>
            <div className="card" style={{ padding: 18, borderLeft: '3px solid var(--success)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Rate limit remaining</div>
              <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 32, color: 'var(--success)', lineHeight: 1.05 }}>87%</div>
            </div>
            <div className="card" style={{ padding: 18, borderLeft: '3px solid var(--brand)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Last webhook</div>
              <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 32, color: 'var(--brand)', lineHeight: 1.05 }}>2m</div>
            </div>
          </div>
          <Section title="Recent API errors" style={{ padding: 0 }}>
            <div style={{ marginTop: -16, marginLeft: -20, marginRight: -20, marginBottom: -20 }}>
              {MOCK_API_ERRORS.map((e, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
                  borderTop: i === 0 ? '1px solid var(--hair, var(--border))' : '1px solid var(--hair-2, var(--border))',
                }}>
                  <span style={{ fontFamily: 'var(--f-mono, ui-monospace, monospace)', fontSize: 12, color: 'var(--muted)', minWidth: 50 }}>{e.time}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{e.client}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{e.message}</div>
                  </div>
                  <code style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '3px 8px', borderRadius: 5, fontSize: 11.5, fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}>{e.code}</code>
                  <Badge color="red">{e.type}</Badge>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}
