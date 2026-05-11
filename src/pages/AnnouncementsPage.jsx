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

export default function AnnouncementsPage() {
  const [tab, setTab] = useState('create');
  const [form, setForm] = useState({ title: '', message: '', type: 'info', audience: 'all', schedule: 'now', scheduledAt: '' });
  const [preview, setPreview] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: typeof e === 'string' ? e : e.target.value }));

  const estimatedCount = { all: 55, starter: 19, growth: 18, pro: 12, trial: 6, at_risk: 4, custom: '?' }[form.audience] || 55;

  const handleSend = () => {
    setSent(true);
    setConfirm(false);
    setForm({ title: '', message: '', type: 'info', audience: 'all', schedule: 'now', scheduledAt: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="animate-in">
      <PageHeader title="Announcements" subtitle="Send in-app messages and WhatsApp blasts to all clients or specific groups" />

      {sent && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>✅</span>
          <div style={{ fontWeight: 600 }}>Announcement sent successfully!</div>
        </div>
      )}

      <div className="tab-list">
        {[['create', '✏️ Create Announcement'], ['history', '📜 History']].map(([k, l]) => (
          <button key={k} className={`tab-btn${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* Create */}
      {tab === 'create' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Form */}
          <Section title="Compose Announcement">
            <Field label="Title" required>
              <input placeholder="e.g. Scheduled Maintenance Notice" value={form.title} onChange={set('title')} />
            </Field>
            <Field label="Message" required>
              <textarea rows={4} placeholder="Write your announcement…" value={form.message} onChange={set('message')} />
            </Field>
            <div className="grid-2">
              <Field label="Type">
                <select value={form.type} onChange={set('type')}>
                  {TYPE_OPTIONS.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </Field>
              <Field label="Audience">
                <select value={form.audience} onChange={set('audience')}>
                  {AUDIENCE_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Schedule">
              <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                {[['now', 'Send Now'], ['scheduled', 'Schedule for Later']].map(([v, l]) => (
                  <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input type="radio" name="schedule" value={v} checked={form.schedule === v} onChange={set('schedule')} style={{ width: 'auto' }} />
                    {l}
                  </label>
                ))}
              </div>
              {form.schedule === 'scheduled' && <input type="datetime-local" value={form.scheduledAt} onChange={set('scheduledAt')} />}
            </Field>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn-secondary btn-sm" onClick={() => setPreview(true)} disabled={!form.title}>👁 Preview</button>
              <button className="btn-primary btn-sm" onClick={() => setConfirm(true)} disabled={!form.title || !form.message}>
                {form.schedule === 'now' ? '📢 Send Now' : '⏰ Schedule'}
              </button>
            </div>
          </Section>

          {/* Live preview */}
          <Section title="Preview" style={{ background: 'var(--bg)' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
              This is how clients will see your announcement in their dashboard.
            </div>
            <div style={{
              borderRadius: 12, padding: '14px 16px', border: '1px solid',
              borderColor: form.type === 'warning' ? 'rgba(232,169,74,.4)' : form.type === 'feature' ? 'rgba(15,127,94,.4)' : 'rgba(76,110,245,.4)',
              background: form.type === 'warning' ? 'var(--accent-2-soft, rgba(232,169,74,0.12))' : form.type === 'feature' ? 'var(--brand-soft)' : 'rgba(76,110,245,0.10)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{TYPE_ICONS[form.type]}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{form.title || 'Announcement Title'}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{form.message || 'Your announcement message will appear here.'}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>From NitiGrow · Just now</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Audience summary</div>
              <div style={{ color: 'var(--muted)' }}>
                Sending to: <strong style={{ color: 'var(--text)' }}>{AUDIENCE_OPTIONS.find(a => a.value === form.audience)?.label}</strong>
              </div>
              <div style={{ color: 'var(--muted)', marginTop: 2 }}>
                Estimated recipients: <strong style={{ color: 'var(--brand)' }}>{estimatedCount} clients</strong>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>{['Title', 'Type', 'Audience', 'Sent / Scheduled', 'Open Rate', 'Status'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {MOCK_HISTORY.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{TYPE_ICONS[a.type]}</span>
                      {a.title}
                    </div>
                  </td>
                  <td><Badge color={TYPE_COLORS[a.type]}>{a.type}</Badge></td>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>{a.audience}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{a.sentAt || a.scheduledFor}</td>
                  <td>
                    {a.opens != null
                      ? <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-track" style={{ width: 80 }}>
                            <div className="progress-fill" style={{ width: `${Math.round((a.opens / a.total) * 100)}%`, background: 'var(--brand)' }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{Math.round((a.opens / a.total) * 100)}%</span>
                        </div>
                      : <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>
                    }
                  </td>
                  <td><Badge color={a.status === 'sent' ? 'green' : 'yellow'}>{a.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
