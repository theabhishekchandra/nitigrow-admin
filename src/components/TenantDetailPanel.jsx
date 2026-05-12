import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Badge, ProgressBar, Section, Spinner } from './ui';

// Inline tenant detail for the two-pane Clients view.
// Fetches the same /tenants/:id endpoint TenantDetailPage uses; never mutates anything
// beyond its own local state. Heavy actions (limits, suspend, plan change) deep-link
// to the full /tenants/:id page where the modal flows live.
export default function TenantDetailPanel({ tenantId }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('overview');

  const load = useCallback(async () => {
    if (!tenantId) { setData(null); return; }
    setLoading(true);
    try {
      const { data: d } = await api.get(`/tenants/${tenantId}`);
      setData(d);
    } catch {
      setData(null);
    }
    setLoading(false);
  }, [tenantId]);

  useEffect(() => { setTab('overview'); load(); }, [load]);

  if (!tenantId) {
    return (
      <div style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, marginBottom: 14, background: 'var(--accent-soft, var(--brand-bg))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-2, var(--text))' }}>Select a client</div>
        <div style={{ fontSize: 12.5, marginTop: 6, textAlign: 'center', maxWidth: 280 }}>Pick a row from the list to see plan, usage, billing, and activity at a glance.</div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div style={{ padding: 64, textAlign: 'center' }}>
        <Spinner size={20} />
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>Loading client…</div>
      </div>
    );
  }

  const { tenant: t, stats } = data;
  const TABS = ['overview', 'usage', 'billing', 'activity'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sticky header */}
      <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 24, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              {t.businessName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span>{t.email}</span>
              {t.phone && <><span>·</span><span>{t.phone}</span></>}
              <span>·</span>
              <span>Joined {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
          <button
            className="btn-ghost btn-sm"
            onClick={() => navigate(`/tenants/${tenantId}`)}
            title="Open full detail page"
            style={{ flexShrink: 0 }}
          >
            Open ↗
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <Badge color={{ starter: 'blue', growth: 'green', pro: 'purple', enterprise: 'cyan', trial: 'yellow' }[t.plan]}>{t.plan}</Badge>
          <Badge dot>{t.status}</Badge>
          {t.wabaId && <span className="chip chip-brand">WhatsApp linked</span>}
          {t.vip && <span className="chip chip-turmeric">⭐ VIP</span>}
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, flexShrink: 0 }}>
        {[
          { label: 'Contacts',  value: stats?.contacts },
          { label: 'Messages',  value: stats?.messages },
          { label: 'Templates', value: stats?.templates },
          { label: 'Campaigns', value: stats?.campaigns },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 22, letterSpacing: '-0.01em', marginTop: 2 }}>
              {s.value ?? '—'}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map(x => (
            <button
              key={x}
              onClick={() => setTab(x)}
              style={{
                padding: '10px 12px',
                fontSize: 12.5,
                fontWeight: tab === x ? 600 : 500,
                color: tab === x ? 'var(--text)' : 'var(--muted)',
                borderBottom: `2px solid ${tab === x ? 'var(--brand)' : 'transparent'}`,
                marginBottom: -1,
                background: 'transparent',
                borderRadius: 0,
              }}
            >
              {x.charAt(0).toUpperCase() + x.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Business</div>
              {[
                ['ID',           t._id],
                ['WABA ID',      t.wabaId],
                ['Phone Number', t.phoneNumberId],
                ['Display No.',  t.displayPhoneNumber],
                ['Industry',     t.industry],
              ].map(([l, v]) => v ? (
                <div key={l} style={{ display: 'flex', padding: '6px 0', borderBottom: '1px solid var(--border-2, var(--border))', fontSize: 12.5 }}>
                  <div style={{ width: 110, color: 'var(--muted)' }}>{l}</div>
                  <div style={{ fontFamily: 'var(--f-mono, ui-monospace, monospace)', fontSize: 12 }}>{v}</div>
                </div>
              ) : null)}
            </div>

            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>WhatsApp health</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-2, var(--border))', fontSize: 12.5 }}>
                <div style={{ color: 'var(--muted)' }}>Quality rating</div>
                <Badge color={t.qualityRating === 'GREEN' ? 'green' : t.qualityRating === 'YELLOW' ? 'yellow' : t.qualityRating === 'RED' ? 'red' : 'gray'}>
                  {t.qualityRating || 'UNKNOWN'}
                </Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-2, var(--border))', fontSize: 12.5 }}>
                <div style={{ color: 'var(--muted)' }}>Messaging tier</div>
                <div style={{ fontFamily: 'var(--f-mono, ui-monospace, monospace)', fontSize: 12 }}>{t.messagingTier || '—'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', fontSize: 12.5 }}>
                <div style={{ color: 'var(--muted)' }}>Daily limit</div>
                <div style={{ fontFamily: 'var(--f-mono, ui-monospace, monospace)', fontSize: 12 }}>{t.dailyMsgCount || 0} / {t.dailyLimit || '—'}</div>
              </div>
            </div>

            <button
              className="btn-primary btn-sm"
              onClick={() => navigate(`/tenants/${tenantId}`)}
              style={{ alignSelf: 'flex-start' }}
            >
              Impersonate / manage →
            </button>
          </div>
        )}

        {tab === 'usage' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>Billing month: {t.usage?.month || 'current'}</div>
            {[
              { label: 'Messages sent',  val: t.usage?.messagesSent  || 0, bonus: t.customLimits?.messages || 0 },
              { label: 'AI operations',  val: t.usage?.aiOperations  || 0, bonus: t.customLimits?.ai       || 0 },
              { label: 'Contacts stored', val: stats?.contacts        || 0, bonus: t.customLimits?.contacts || 0 },
            ].map(u => (
              <div key={u.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12.5 }}>
                  <span style={{ fontWeight: 600 }}>{u.label}</span>
                  <span style={{ fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}>{u.val.toLocaleString('en-IN')}</span>
                </div>
                <ProgressBar value={u.val} max={1000 + u.bonus} showLabel />
                {u.bonus > 0 && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Bonus credits: +{u.bonus}</div>}
              </div>
            ))}
          </div>
        )}

        {tab === 'billing' && (
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 12.5 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Razorpay ID</div>
                <div style={{ fontFamily: 'var(--f-mono, ui-monospace, monospace)', fontSize: 12, wordBreak: 'break-all' }}>{t.subscription?.razorpaySubscriptionId || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Status</div>
                <Badge dot color={t.subscription?.status === 'active' ? 'green' : 'red'}>{t.subscription?.status || 'trial'}</Badge>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Period start</div>
                <div>{t.subscription?.currentPeriodStart ? new Date(t.subscription.currentPeriodStart).toLocaleDateString('en-IN') : '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Period end</div>
                <div>{t.subscription?.currentPeriodEnd ? new Date(t.subscription.currentPeriodEnd).toLocaleDateString('en-IN') : '—'}</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'activity' && (
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
            Activity timeline coming from the full detail page. <a onClick={() => navigate(`/tenants/${tenantId}`)} style={{ color: 'var(--brand)', cursor: 'pointer' }}>Open detail →</a>
          </div>
        )}
      </div>
    </div>
  );
}
