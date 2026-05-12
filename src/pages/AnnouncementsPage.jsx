import React, { useState } from 'react';
import { Badge, Modal, Field, PageHeader, Section } from '../components/ui';

const MOCK_HISTORY = [
  { id: 1, title: 'Scheduled Maintenance – Jan 20', type: 'warning', audience: 'All clients', sentAt: '18 Jan 2025', opens: 38, total: 55, status: 'sent' },
  { id: 2, title: 'New Feature: AI Reply Suggestions', type: 'feature', audience: 'Growth + Pro', sentAt: '10 Jan 2025', opens: 29, total: 34, status: 'sent' },
  { id: 3, title: 'Happy New Year from NitiGrow!', type: 'info', audience: 'All clients', sentAt: '1 Jan 2025', opens: 51, total: 55, status: 'sent' },
  { id: 4, title: 'Important: WhatsApp Policy Update', type: 'warning', audience: 'All clients', sentAt: '22 Dec 2024', opens: 47, total: 55, status: 'sent' },
  { id: 5, title: 'Quality Alert for Starter Clients', type: 'warning', audience: 'Starter plan only', sentAt: null, status: 'scheduled', scheduledFor: '25 Jan 2025' },
];

const TYPE_OPTIONS = ['info', 'warning', 'feature'];
const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All Clients' },
  { value: 'starter', label: 'Starter Plan Only' },
  { value: 'growth', label: 'Growth Plan Only' },
  { value: 'pro', label: 'Pro + Enterprise' },
  { value: 'trial', label: 'Clients on Trial' },
  { value: 'at_risk', label: 'At-Risk Clients (Yellow/Red health)' },
  { value: 'custom', label: 'Select Specific Clients' },
];

const TYPE_COLORS = { info: 'blue', warning: 'yellow', feature: 'green' };
const TYPE_ICONS  = { info: 'ℹ️', warning: '⚠️', feature: '✨' };

// Warm-token border / fill per priority — matches app/src/index.css .alert family.
const TYPE_TOKENS = {
  info:    { border: 'rgba(76,110,245,.4)',  bg: 'rgba(76,110,245,0.10)', dot: 'var(--info)' },
  warning: { border: 'rgba(232,169,74,.4)',  bg: 'var(--accent-2-soft, rgba(232,169,74,0.12))', dot: 'var(--warn)' },
  feature: { border: 'rgba(15,127,94,.4)',   bg: 'var(--brand-bg)', dot: 'var(--success)' },
};

export default function AnnouncementsPage() {
  const [tab, setTab] = useState('create');
  const [form, setForm] = useState({ title: '', message: '', type: 'info', audience: 'all', schedule: 'now', scheduledAt: '' });
  const [preview, setPreview] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [sent, setSent] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: typeof e === 'string' ? e : e.target.value }));

  const estimatedCount = { all: 55, starter: 19, growth: 18, pro: 12, trial: 6, at_risk: 4, custom: '?' }[form.audience] || 55;

  const handleSend = () => {
    setSent(true);
    setConfirm(false);
    setForm({ title: '', message: '', type: 'info', audience: 'all', schedule: 'now', scheduledAt: '' });
    setTimeout(() => setSent(false), 4000);
  };

  const filteredHistory = MOCK_HISTORY.filter(a => historyFilter === 'all' ? true : historyFilter === a.status);

  const priorityChips = [
    { value: 'info',    label: 'Info',     color: 'var(--info)' },
    { value: 'warning', label: 'Warning',  color: 'var(--warn)' },
    { value: 'feature', label: 'Critical', color: 'var(--success)' },
  ];

  return (
    <div className="animate-in">
      <PageHeader
        title="Announcements"
        subtitle="Compose, schedule and broadcast platform-wide messages"
        actions={
          <button
            className="btn-ghost btn-sm"
            onClick={() => setTab(tab === 'create' ? 'history' : 'create')}
          >
            {tab === 'create' ? '📜 View history' : '✏️ Compose new'}
          </button>
        }
      />

      {sent && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>✅</span>
          <div style={{ fontWeight: 600 }}>Announcement sent successfully!</div>
        </div>
      )}

      <div className="tab-list">
        {[['create', 'New announcement'], ['history', 'Past announcements']].map(([k, l]) => (
          <button key={k} className={`tab-btn${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ── Composer + live preview ─────────────────────────────────────── */}
      {tab === 'create' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 14, alignItems: 'start' }}>
          <Section title="New announcement">
            <Field label="Title" required>
              <input
                placeholder="e.g. Scheduled Maintenance Notice"
                value={form.title}
                onChange={set('title')}
                style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontSize: 16, letterSpacing: '-0.005em' }}
              />
            </Field>
            <Field label="Body" required>
              <textarea rows={5} placeholder="Write your announcement…" value={form.message} onChange={set('message')} />
            </Field>

            <Field label="Priority">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {priorityChips.map(p => {
                  const active = form.type === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => set('type')(p.value)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        border: `1px solid ${active ? p.color : 'var(--border)'}`,
                        background: active ? TYPE_TOKENS[p.value].bg : 'transparent',
                        color: active ? p.color : 'var(--muted)',
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Audience">
              <select value={form.audience} onChange={set('audience')}>
                {AUDIENCE_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </Field>

            <Field label="Schedule">
              <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                {[['now', 'Send now'], ['scheduled', 'Schedule for later']].map(([v, l]) => (
                  <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input type="radio" name="schedule" value={v} checked={form.schedule === v} onChange={set('schedule')} style={{ width: 'auto' }} />
                    {l}
                  </label>
                ))}
              </div>
              {form.schedule === 'scheduled' && <input type="datetime-local" value={form.scheduledAt} onChange={set('scheduledAt')} />}
            </Field>

            <div style={{ display: 'flex', gap: 10, marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--hair-2, var(--border))' }}>
              <button className="btn-secondary btn-sm" onClick={() => setPreview(true)} disabled={!form.title}>👁 Preview full</button>
              <button className="btn-primary btn-sm" onClick={() => setConfirm(true)} disabled={!form.title || !form.message}>
                {form.schedule === 'now' ? '📢 Send Now' : '⏰ Schedule'}
              </button>
              <div style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--muted)', alignSelf: 'center' }}>
                Reaches <strong style={{ color: 'var(--brand)' }}>{estimatedCount}</strong> clients
              </div>
            </div>
          </Section>

          <div style={{ position: 'sticky', top: 16 }}>
            <Section title="Live preview" action={<span style={{ fontSize: 11, color: 'var(--muted)' }}>How clients see it</span>} style={{ background: 'var(--bg)' }}>
              <div style={{
                borderRadius: 12,
                padding: '14px 16px',
                border: `1px solid ${TYPE_TOKENS[form.type].border}`,
                background: TYPE_TOKENS[form.type].bg,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{TYPE_ICONS[form.type]}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontWeight: 600, fontSize: 15, marginBottom: 4,
                      fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', letterSpacing: '-0.005em',
                    }}>{form.title || 'Announcement title'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{form.message || 'Your announcement message will appear here.'}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>From NitiGrow · Just now</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--card)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Send summary</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}>
                  <span style={{ color: 'var(--muted)' }}>Audience</span>
                  <span style={{ fontWeight: 600 }}>{AUDIENCE_OPTIONS.find(a => a.value === form.audience)?.label}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}>
                  <span style={{ color: 'var(--muted)' }}>Recipients</span>
                  <span style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 16, color: 'var(--brand)' }}>{estimatedCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}>
                  <span style={{ color: 'var(--muted)' }}>Priority</span>
                  <Badge color={TYPE_COLORS[form.type]}>{form.type}</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}>
                  <span style={{ color: 'var(--muted)' }}>Delivery</span>
                  <span style={{ fontWeight: 600 }}>{form.schedule === 'now' ? 'Immediate' : form.scheduledAt || 'Scheduled'}</span>
                </div>
              </div>
            </Section>
          </div>
        </div>
      )}

      {/* ── Past announcements ──────────────────────────────────────────── */}
      {tab === 'history' && (
        <Section
          title="Past announcements"
          action={
            <div style={{ display: 'inline-flex', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 999, padding: 3 }}>
              {[['all', 'All'], ['sent', 'Sent'], ['scheduled', 'Scheduled'], ['draft', 'Draft']].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setHistoryFilter(v)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 999,
                    fontSize: 11.5,
                    fontWeight: historyFilter === v ? 600 : 500,
                    background: historyFilter === v ? 'var(--card)' : 'transparent',
                    color: historyFilter === v ? 'var(--text)' : 'var(--muted)',
                    border: 'none',
                    boxShadow: historyFilter === v ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          }
        >
          <div>
            {filteredHistory.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No announcements match this filter.</div>
            ) : (
              filteredHistory.map((a, i) => {
                const rate = a.opens != null ? Math.round((a.opens / a.total) * 100) : null;
                return (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 0',
                      borderBottom: i < filteredHistory.length - 1 ? '1px solid var(--hair-2, var(--border))' : 'none',
                    }}
                  >
                    <span style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: TYPE_TOKENS[a.type].bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: 18,
                    }}>{TYPE_ICONS[a.type]}</span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 15, letterSpacing: '-0.005em', marginBottom: 3 }}>{a.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                        {a.audience} · {a.sentAt || `Scheduled ${a.scheduledFor}`}
                      </div>
                    </div>

                    {rate != null ? (
                      <div style={{ textAlign: 'right', minWidth: 90 }}>
                        <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 18, color: 'var(--brand)' }}>{rate}%</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.opens}/{a.total} opened</div>
                      </div>
                    ) : (
                      <div style={{ minWidth: 90, textAlign: 'right', fontSize: 12, color: 'var(--muted)' }}>—</div>
                    )}

                    <Badge color={a.status === 'sent' ? 'green' : 'yellow'}>{a.status}</Badge>
                  </div>
                );
              })
            )}
          </div>
        </Section>
      )}

      {/* Confirm modal */}
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Confirm Send" width={440}>
        <div style={{ padding: '12px 16px', background: 'var(--bg)', borderRadius: 10, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{form.title}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>{form.message}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            Audience: <strong style={{ color: 'var(--text)' }}>{AUDIENCE_OPTIONS.find(a => a.value === form.audience)?.label}</strong>
          </div>
        </div>
        <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 20 }}>
          You are about to send this announcement to <strong>{estimatedCount} clients</strong>.{' '}
          {form.schedule === 'now' ? 'This will be sent immediately.' : `Scheduled for ${form.scheduledAt}.`}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn-ghost btn-sm" onClick={() => setConfirm(false)}>Cancel</button>
          <button className="btn-primary btn-sm" onClick={handleSend}>✓ Confirm & Send</button>
        </div>
      </Modal>
    </div>
  );
}
