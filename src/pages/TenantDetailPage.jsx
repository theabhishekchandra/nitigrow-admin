import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Badge, ProgressBar, Modal, ConfirmModal, Field, TimelineItem, Section, Spinner, PageHeader } from '../components/ui';

const PLANS = ['trial', 'starter', 'growth', 'pro', 'enterprise'];

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

  if (loading) return <div style={{ padding: 48, textAlign: 'center' }}><Spinner size={24} /></div>;
  if (!data) return <div style={{ padding: 48, textAlign: 'center' }}>Tenant not found</div>;

  const { tenant: t, stats } = data;
  const TABS = ['overview', 'usage', 'billing', 'activity'];

  return (
    <div className="animate-in">
      <PageHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/tenants')}>←</button>
            <span>{t.businessName}</span>
          </div>
        }
        actions={<>
          <Badge dot>{t.status}</Badge>
          <Badge color="blue">{t.plan}</Badge>
          <button className="btn-primary btn-sm" onClick={() => openModal('impersonate')}>🔍 Impersonate</button>
        </>}
      />

      {/* Quick stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Contacts', value: stats?.contacts, color: 'var(--brand)' },
          { label: 'Total Messages', value: stats?.messages, color: 'var(--info)' },
          { label: 'Templates', value: stats?.templates, color: 'var(--purple)' },
          { label: 'Campaigns', value: stats?.campaigns, color: 'var(--success)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card card-sm" style={{ borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color }}>{value ?? '—'}</div>
          </div>
        ))}
      </div>

      <div className="tab-list">
        {TABS.map(tab => (
          <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid-2">
          <Section title="Business Details">
            {[
              ['ID', t._id],
              ['Email', t.email],
              ['Phone', t.phone],
              ['WABA ID', t.wabaId],
              ['Phone ID', t.phoneNumberId],
              ['Joined', new Date(t.createdAt).toLocaleDateString()],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <div style={{ width: 120, color: 'var(--muted)' }}>{l}</div>
                <div style={{ fontWeight: 600 }}>{v || '—'}</div>
              </div>
            ))}
          </Section>

          <Section title="Account Quotas">
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>CURRENT PLAN</div>
              <Badge color="blue" lg>{t.plan.toUpperCase()}</Badge>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>Messages Bonus</span>
                  <span style={{ fontWeight: 700 }}>+{t.customLimits?.messages || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>AI Ops Bonus</span>
                  <span style={{ fontWeight: 700 }}>+{t.customLimits?.ai || 0}</span>
                </div>
              </div>
              <button className="btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => openModal('limits')}>⚙️ Manage Quotas</button>
              <button className={`btn-sm ${t.status === 'suspended' ? 'btn-success' : 'btn-danger'}`} onClick={() => openModal('suspend')}>
                {t.status === 'suspended' ? 'Reactivate Client' : 'Suspend Client'}
              </button>
            </div>
          </Section>
        </div>
      )}

      {activeTab === 'usage' && (
        <Section title="Monthly Usage Tracking">
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>Month: {t.usage?.month || 'Current'}</div>
          {[
            { label: 'Messages Sent', val: t.usage?.messagesSent || 0, bonus: t.customLimits?.messages || 0, key: 'messagesSent' },
            { label: 'AI Operations', val: t.usage?.aiOperations || 0, bonus: t.customLimits?.ai || 0, key: 'aiOperations' },
            { label: 'Contacts Stored', val: stats?.contacts || 0, bonus: t.customLimits?.contacts || 0, key: 'contactsCount' },
          ].map(u => (
            <div key={u.label} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{u.label}</span>
                <span>{u.val.toLocaleString()} used</span>
              </div>
              <ProgressBar value={u.val} max={1000 + u.bonus} showLabel />
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Bonus credits active: +{u.bonus}</div>
            </div>
          ))}
        </Section>
      )}

      {activeTab === 'billing' && (
        <Section title="Subscription Details">
          <div style={{ padding: 20, background: 'var(--card-bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>RAZORPAY ID</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.subscription?.razorpaySubscriptionId || 'No active subscription'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>BILLING STATUS</div>
                <Badge dot color={t.subscription?.status === 'active' ? 'green' : 'red'}>{t.subscription?.status || 'trial'}</Badge>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Modals */}
      <Modal open={modals.limits} onClose={() => closeModal('limits')} title="Manage Account Quotas">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Bonus Messages (Monthly)">
            <input type="number" value={limitsForm.messages} onChange={e => setLimitsForm({...limitsForm, messages: e.target.value})} />
          </Field>
          <Field label="Bonus AI Operations (Monthly)">
            <input type="number" value={limitsForm.ai} onChange={e => setLimitsForm({...limitsForm, ai: e.target.value})} />
          </Field>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleUpdateLimits} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Limits'}
            </button>
            <button className="btn-ghost" onClick={() => closeModal('limits')}>Cancel</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal 
        open={modals.suspend} 
        onClose={() => closeModal('suspend')} 
        onConfirm={() => updateStatus(t.status === 'suspended' ? 'active' : 'suspended')}
        title={t.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
        message={`Are you sure you want to ${t.status === 'suspended' ? 'reactivate' : 'suspend'} ${t.businessName}?`}
        danger={t.status !== 'suspended'}
      />

      <ConfirmModal
        open={modals.impersonate}
        onClose={() => closeModal('impersonate')}
        onConfirm={handleImpersonate}
        title="Impersonate Client"
        message={`This will log you into ${t.businessName}'s dashboard. All your actions will be recorded in the audit log.`}
      />
    </div>
  );
}
