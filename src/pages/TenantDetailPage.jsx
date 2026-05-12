import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Badge, ProgressBar, Modal, ConfirmModal, Field, TimelineItem, Section, Spinner, EmptyState } from '../components/ui';

const PLANS = ['trial', 'starter', 'growth', 'pro', 'enterprise'];

const PLAN_BADGE_COLOR = { starter: 'blue', growth: 'green', pro: 'purple', enterprise: 'cyan', trial: 'yellow' };

// Hero quick-stat tile — Variant B language.
const HeroTile = ({ label, value, sub }) => (
  <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6, minHeight: 100 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
    <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.01em' }}>
      {value ?? '—'}
    </div>
    {sub && <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{sub}</div>}
  </div>
);

const DetailRow = ({ label, value, mono }) => (
  <div style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid var(--border-2, var(--border))', fontSize: 12.5 }}>
    <div style={{ width: 130, color: 'var(--muted)', flexShrink: 0 }}>{label}</div>
    <div style={{ fontWeight: 500, fontFamily: mono ? 'var(--f-mono, ui-monospace, monospace)' : 'inherit', fontSize: mono ? 12 : 12.5, wordBreak: 'break-all' }}>
      {value || '—'}
    </div>
  </div>
);

export default function TenantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modals, setModals] = useState({ plan: false, suspend: false, limits: false, impersonate: false });
  const [planForm, setPlanForm] = useState({ plan: '' });
  const [limitsForm, setLimitsForm] = useState({ messages: 0, ai: 0, contacts: 0 });
  const [submitting, setSubmitting] = useState(false);

  const openModal = (k) => setModals(m => ({ ...m, [k]: true }));
  const closeModal = (k) => setModals(m => ({ ...m, [k]: false }));

  const loadData = useCallback(async () => {
    try {
      const { data: d } = await api.get(`/tenants/${id}`);
      setData(d);
      setPlanForm({ plan: d.tenant.plan });
      setLimitsForm({
        messages: d.tenant.customLimits?.messages || 0,
        ai: d.tenant.customLimits?.ai || 0,
        contacts: d.tenant.customLimits?.contacts || 0
      });
    } catch (err) {
      console.error('Failed to load tenant:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleImpersonate = async () => {
    try {
      const { data: d } = await api.post(`/tenants/${id}/impersonate`);
      const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
      window.open(`${appUrl}?token=${d.accessToken}`, '_blank');
    } catch { alert('Impersonation failed'); }
  };

  const updateStatus = async (status) => {
    try {
      await api.patch(`/tenants/${id}/status`, { status });
      await loadData();
      closeModal('suspend');
    } catch { alert('Failed to update status'); }
  };

  const handleUpdateLimits = async () => {
    setSubmitting(true);
    try {
      await api.patch(`/tenants/${id}/limits`, limitsForm);
      await loadData();
      closeModal('limits');
    } catch { alert('Failed to update limits'); }
    finally { setSubmitting(false); }
  };

  const handlePlanChange = async () => {
    try {
      await api.patch(`/tenants/${id}/status`, { plan: planForm.plan }); // Assuming logic exists or status update handles plan
      await loadData();
      closeModal('plan');
    } catch { alert('Failed to change plan'); }
  };

  if (loading) return (
    <div style={{ padding: 64, textAlign: 'center' }}>
      <Spinner size={22} />
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>Loading client…</div>
    </div>
  );
  if (!data) return (
    <div className="animate-in">
      <EmptyState message="Tenant not found — it may have been deleted or you don't have access." />
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button className="btn-ghost btn-sm" onClick={() => navigate('/tenants')}>← Back to clients</button>
      </div>
    </div>
  );

  const { tenant: t, stats } = data;
  const TABS = ['overview', 'usage', 'billing', 'activity'];

  const statusDotColor = t.status === 'active' ? 'green' : t.status === 'trial' ? 'yellow' : t.status === 'suspended' ? 'red' : 'gray';

  return (
    <div className="animate-in">
      {/* ── Sticky page header ─────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 5,
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        margin: '-24px -24px 18px', padding: '18px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0, flex: 1 }}>
            <button
              onClick={() => navigate('/tenants')}
              className="btn-ghost btn-sm"
              title="Back to clients"
              style={{ marginTop: 2, padding: '4px 10px', fontSize: 14, lineHeight: 1 }}
            >
              ←
            </button>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 28, letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: 6 }}>
                {t.businessName}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', fontSize: 12.5, color: 'var(--muted)' }}>
                <Badge color={PLAN_BADGE_COLOR[t.plan]}>{t.plan}</Badge>
                <Badge dot color={statusDotColor}>{t.status}</Badge>
                {t.wabaId && <span className="chip chip-brand">WhatsApp linked</span>}
                {t.vip && <span className="chip chip-turmeric">⭐ VIP</span>}
                {t.email && <><span>·</span><span>{t.email}</span></>}
                {t.phone && <><span>·</span><span>{t.phone}</span></>}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button className="btn-secondary btn-sm" onClick={() => openModal('limits')}>Manage quotas</button>
            <button className={`btn-sm ${t.status === 'suspended' ? 'btn-success' : 'btn-danger'}`} onClick={() => openModal('suspend')}>
              {t.status === 'suspended' ? 'Reactivate' : 'Suspend'}
            </button>
            <button className="btn-primary btn-sm" onClick={() => openModal('impersonate')}>🔍 Impersonate</button>
          </div>
        </div>
      </div>

      {/* ── Hero quick-stat strip ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <HeroTile label="Contacts"  value={stats?.contacts?.toLocaleString('en-IN')}  sub="total stored" />
        <HeroTile label="Messages"  value={stats?.messages?.toLocaleString('en-IN')}  sub="lifetime sent" />
        <HeroTile label="Templates" value={stats?.templates?.toLocaleString('en-IN')} sub="approved + draft" />
        <HeroTile label="Campaigns" value={stats?.campaigns?.toLocaleString('en-IN')} sub="created to date" />
      </div>

      {/* ── Tabs (TenantDetailPanel idiom) ─────────────────────────────── */}
      <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: activeTab === tab ? 600 : 500,
                color: activeTab === tab ? 'var(--text)' : 'var(--muted)',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--brand)' : 'transparent'}`,
                marginBottom: -1,
                background: 'transparent',
                borderRadius: 0,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Overview tab ───────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid-2">
          <Section title="Business details">
            <DetailRow label="Tenant ID" value={t._id} mono />
            <DetailRow label="Email"     value={t.email} />
            <DetailRow label="Phone"     value={t.phone} />
            <DetailRow label="WABA ID"   value={t.wabaId} mono />
            <DetailRow label="Phone ID"  value={t.phoneNumberId} mono />
            <DetailRow label="Display no." value={t.displayPhoneNumber} mono />
            <DetailRow label="Industry"  value={t.industry} />
            <DetailRow label="Joined"    value={t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
          </Section>

          <div>
            <Section title="Account quotas" action={<Badge color={PLAN_BADGE_COLOR[t.plan]}>{t.plan.toUpperCase()}</Badge>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Bonus credits</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-2, var(--border))', fontSize: 12.5 }}>
                    <span>Messages bonus</span>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}>+{t.customLimits?.messages || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-2, var(--border))', fontSize: 12.5 }}>
                    <span>AI ops bonus</span>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}>+{t.customLimits?.ai || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12.5 }}>
                    <span>Contacts bonus</span>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}>+{t.customLimits?.contacts || 0}</span>
                  </div>
                </div>
                <button className="btn-secondary btn-sm" onClick={() => openModal('limits')}>Manage quotas</button>
              </div>
            </Section>

            <Section title="WhatsApp health">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-2, var(--border))', fontSize: 12.5 }}>
                <span style={{ color: 'var(--muted)' }}>Quality rating</span>
                <Badge color={t.qualityRating === 'GREEN' ? 'green' : t.qualityRating === 'YELLOW' ? 'yellow' : t.qualityRating === 'RED' ? 'red' : 'gray'}>
                  {t.qualityRating || 'UNKNOWN'}
                </Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-2, var(--border))', fontSize: 12.5 }}>
                <span style={{ color: 'var(--muted)' }}>Messaging tier</span>
                <span style={{ fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}>{t.messagingTier || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12.5 }}>
                <span style={{ color: 'var(--muted)' }}>Daily usage</span>
                <span style={{ fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}>{t.dailyMsgCount || 0} / {t.dailyLimit || '—'}</span>
              </div>
            </Section>
          </div>
        </div>
      )}

      {/* ── Usage tab ──────────────────────────────────────────────────── */}
      {activeTab === 'usage' && (
        <Section title="Monthly usage" action={<span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Billing month: {t.usage?.month || 'current'}</span>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {[
              { label: 'Messages sent',  val: t.usage?.messagesSent || 0, bonus: t.customLimits?.messages || 0, key: 'messagesSent' },
              { label: 'AI operations',  val: t.usage?.aiOperations || 0, bonus: t.customLimits?.ai || 0, key: 'aiOperations' },
              { label: 'Contacts stored', val: stats?.contacts || 0, bonus: t.customLimits?.contacts || 0, key: 'contactsCount' },
            ].map(u => (
              <div key={u.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{u.label}</span>
                  <span style={{ fontFamily: 'var(--f-mono, ui-monospace, monospace)', fontSize: 12, color: 'var(--muted)' }}>
                    {u.val.toLocaleString('en-IN')} used
                  </span>
                </div>
                <ProgressBar value={u.val} max={1000 + u.bonus} showLabel />
                {u.bonus > 0 && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Bonus credits active: +{u.bonus}</div>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Billing tab ────────────────────────────────────────────────── */}
      {activeTab === 'billing' && (
        <div className="grid-2">
          <Section title="Subscription">
            <DetailRow label="Razorpay ID" value={t.subscription?.razorpaySubscriptionId} mono />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-2, var(--border))', fontSize: 12.5 }}>
              <span style={{ width: 130, color: 'var(--muted)' }}>Status</span>
              <Badge dot color={t.subscription?.status === 'active' ? 'green' : 'red'}>{t.subscription?.status || 'trial'}</Badge>
            </div>
            <DetailRow label="Period start" value={t.subscription?.currentPeriodStart ? new Date(t.subscription.currentPeriodStart).toLocaleDateString('en-IN') : null} />
            <DetailRow label="Period end"   value={t.subscription?.currentPeriodEnd   ? new Date(t.subscription.currentPeriodEnd).toLocaleDateString('en-IN')   : null} />
          </Section>
          <Section title="Plan management">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Current plan</div>
                <Badge color={PLAN_BADGE_COLOR[t.plan]}>{t.plan.toUpperCase()}</Badge>
              </div>
              <button className="btn-secondary btn-sm" onClick={() => openModal('plan')}>Change plan</button>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                Plan changes are billed pro-rata via Razorpay. The client receives an email with the new invoice.
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* ── Activity tab ───────────────────────────────────────────────── */}
      {activeTab === 'activity' && (
        <Section title="Activity timeline" action={<a href="/audit" className="btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Open audit log →</a>}>
          <EmptyState message="Audit timeline for this tenant — open Audit Log for full history" />
        </Section>
      )}

      {/* ── Modals (preserved) ─────────────────────────────────────────── */}
      <Modal open={modals.limits} onClose={() => closeModal('limits')} title="Manage account quotas">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Field label="Bonus messages (monthly)">
            <input type="number" value={limitsForm.messages} onChange={e => setLimitsForm({...limitsForm, messages: e.target.value})} />
          </Field>
          <Field label="Bonus AI operations (monthly)">
            <input type="number" value={limitsForm.ai} onChange={e => setLimitsForm({...limitsForm, ai: e.target.value})} />
          </Field>
          <Field label="Bonus contacts">
            <input type="number" value={limitsForm.contacts} onChange={e => setLimitsForm({...limitsForm, contacts: e.target.value})} />
          </Field>
          <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
            <button className="btn-ghost btn-sm" onClick={() => closeModal('limits')}>Cancel</button>
            <button className="btn-primary btn-sm" onClick={handleUpdateLimits} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save quotas'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={modals.plan} onClose={() => closeModal('plan')} title="Change plan">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Field label="New plan">
            <select value={planForm.plan} onChange={e => setPlanForm({ plan: e.target.value })}>
              {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </Field>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            Billing adjustments are pro-rated. The client receives an email confirmation.
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
            <button className="btn-ghost btn-sm" onClick={() => closeModal('plan')}>Cancel</button>
            <button className="btn-primary btn-sm" onClick={handlePlanChange}>Update plan</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={modals.suspend}
        onClose={() => closeModal('suspend')}
        onConfirm={() => updateStatus(t.status === 'suspended' ? 'active' : 'suspended')}
        title={t.status === 'suspended' ? 'Reactivate account' : 'Suspend account'}
        message={`Are you sure you want to ${t.status === 'suspended' ? 'reactivate' : 'suspend'} ${t.businessName}? ${t.status === 'suspended' ? 'They will regain full access immediately.' : 'They will lose access to send messages and use the dashboard until reactivated.'}`}
        danger={t.status !== 'suspended'}
        confirmLabel={t.status === 'suspended' ? 'Reactivate' : 'Suspend'}
      />

      <ConfirmModal
        open={modals.impersonate}
        onClose={() => closeModal('impersonate')}
        onConfirm={handleImpersonate}
        title="Impersonate client"
        message={`This opens ${t.businessName}'s dashboard in a new tab with a red banner. Every action you take is recorded in the audit log under your admin account.`}
        confirmLabel="Continue"
      />
    </div>
  );
}
