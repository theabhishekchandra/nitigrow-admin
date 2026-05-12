import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Badge, StatCard, Modal, Field, PageHeader, Section, Sparkline, EmptyState } from '../components/ui';

const MOCK_OVERVIEW = { mrr: 187400, arr: 2248800, activeSubscriptions: 42, trialConversions: 8, churned: 2, failedPayments: 3 };
const MRR_DATA = [142000, 155000, 163000, 171000, 178000, 185000, 187400];
const ARR_DATA = [1704000, 1860000, 1956000, 2052000, 2136000, 2220000, 2248800];
const NETNEW_DATA = [1800, 3200, 2400, 4100, 3600, 5200, 2400];
const FAILED_DATA = [1, 0, 2, 1, 3, 2, 3];

const MOCK_FAILED = [
  { id: 'f1', client: 'CloudStore India', amount: 999, daysOverdue: 4, retryCount: 2, nextRetry: 'Tomorrow', email: 'ops@cloudstore.in', reason: 'Card declined' },
  { id: 'f2', client: 'FoodieHub Kitchen', amount: 999, daysOverdue: 1, retryCount: 1, nextRetry: 'In 2 days', email: 'hello@foodiehub.in', reason: 'Insufficient funds' },
  { id: 'f3', client: 'AutoDrive Motors', amount: 2499, daysOverdue: 12, retryCount: 4, nextRetry: 'Manual', email: 'sales@autodrive.in', reason: 'Card expired' },
];

const MOCK_COUPONS = [
  { code: 'LAUNCH50', type: 'percent', value: 50, uses: 14, limit: 50, valid: '31 Mar 2025', active: true },
  { code: 'FLAT500', type: 'flat', value: 500, uses: 31, limit: 100, valid: '28 Feb 2025', active: true },
  { code: 'TRIAL30', type: 'days', value: 30, uses: 88, limit: 200, valid: '31 Dec 2024', active: false },
];

const MOCK_REFUNDS = [
  { date: '12 Jan 2025', client: 'AutoDrive Motors', amount: 2499, reason: 'Service disruption — 3 days downtime', admin: 'Rahul', invoice: 'INV-089' },
  { date: '28 Dec 2024', client: 'CloudStore India', amount: 500, reason: 'Partial refund — billing error', admin: 'Priya', invoice: 'INV-075' },
];

const MOCK_INVOICES = [
  { date: '14 Jan 2025', tenant: 'TechBridge Solutions', invoice: 'INV-102', amount: 2499, status: 'paid' },
  { date: '13 Jan 2025', tenant: 'Riya Fashions',        invoice: 'INV-101', amount: 999,  status: 'paid' },
  { date: '12 Jan 2025', tenant: 'EduFirst Academy',     invoice: 'INV-100', amount: 4999, status: 'paid' },
  { date: '11 Jan 2025', tenant: 'CloudStore India',     invoice: 'INV-099', amount: 999,  status: 'failed' },
  { date: '10 Jan 2025', tenant: 'HealthPlus Clinic',    invoice: 'INV-098', amount: 2499, status: 'paid' },
  { date: '09 Jan 2025', tenant: 'AutoDrive Motors',     invoice: 'INV-097', amount: 2499, status: 'failed' },
  { date: '08 Jan 2025', tenant: 'FoodieHub Kitchen',    invoice: 'INV-096', amount: 999,  status: 'failed' },
  { date: '07 Jan 2025', tenant: 'BookMyTutor',          invoice: 'INV-095', amount: 999,  status: 'paid' },
  { date: '06 Jan 2025', tenant: 'GreenLeaf Organics',   invoice: 'INV-094', amount: 4999, status: 'paid' },
  { date: '05 Jan 2025', tenant: 'StyleHub Boutique',    invoice: 'INV-093', amount: 2499, status: 'paid' },
];

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// Money KPI tile — Fraunces display value, brand-coloured, with sparkline.
const KPI = ({ label, value, delta, deltaTone = 'pos', spark, sparkColor, sub, tone = 'brand' }) => {
  const valueColor = tone === 'danger' ? 'var(--danger)' : tone === 'warn' ? 'var(--warn)' : tone === 'success' ? 'var(--success)' : 'var(--text)';
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

export default function BillingPage() {
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(MOCK_OVERVIEW);
  const [refundModal, setRefundModal] = useState({ open: false, client: null });
  const [couponModal, setCouponModal] = useState(false);
  const [refundForm, setRefundForm] = useState({ amount: '', reason: '' });
  const [couponForm, setCouponForm] = useState({ code: '', type: 'percent', value: '', limit: '' });
  const [coupons, setCoupons] = useState(MOCK_COUPONS);

  useEffect(() => {
    api.get('/billing').then(r => setData(r.data)).catch(() => setData(MOCK_OVERVIEW));
  }, []);

  const deactivateCoupon = (code) => setCoupons(prev => prev.map(c => c.code === code ? { ...c, active: false } : c));

  const createCoupon = () => {
    if (!couponForm.code) return;
    setCoupons(prev => [...prev, { ...couponForm, uses: 0, valid: 'No expiry', active: true }]);
    setCouponForm({ code: '', type: 'percent', value: '', limit: '' });
    setCouponModal(false);
  };

  const netNewMRR = 2400;
  const activeCoupons = coupons.filter(c => c.active);

  return (
    <div className="animate-in">
      <PageHeader
        title="Billing & Revenue"
        subtitle="Money cockpit — MRR, ARR, failed charges, coupons and invoices"
        actions={
          <button className="btn-ghost btn-sm" onClick={() => setCouponModal(true)}>+ New coupon</button>
        }
      />

      {/* ── 4 KPI hero tiles ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <KPI
          label="MRR"
          value={inr(data.mrr)}
          delta="↑ 8.1% 30d"
          deltaTone="pos"
          sub="Monthly recurring revenue"
          tone="success"
          spark={MRR_DATA}
          sparkColor="var(--success)"
        />
        <KPI
          label="ARR projected"
          value={`₹${((data.arr || 0) / 100000).toFixed(1)}L`}
          delta="↑ 31.9% YoY"
          deltaTone="pos"
          sub="MRR × 12 — annualised run rate"
          spark={ARR_DATA}
          sparkColor="var(--brand)"
        />
        <KPI
          label="Net new MRR"
          value={inr(netNewMRR)}
          delta="this month"
          deltaTone="pos"
          sub="Expansion minus churn"
          spark={NETNEW_DATA}
          sparkColor="var(--accent-2)"
        />
        <KPI
          label="Failed charges"
          value={data.failedPayments}
          delta={data.failedPayments > 0 ? 'Needs attention' : 'All clear'}
          deltaTone={data.failedPayments > 0 ? 'neg' : 'pos'}
          tone={data.failedPayments > 0 ? 'danger' : 'success'}
          sub="Razorpay reported last 7 days"
          spark={FAILED_DATA}
          sparkColor="var(--danger)"
        />
      </div>

      <div className="tab-list">
        {[['overview', 'Revenue Overview'], ['failed', 'Failed Payments'], ['coupons', 'Coupons'], ['refunds', 'Refunds']].map(([k, l]) => (
          <button key={k} className={`tab-btn${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ── Overview ────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div>
          {/* Failed payments preview card — money cockpit's red-dot row */}
          <Section
            title="Failed payments"
            action={<a href="#failed" onClick={(e) => { e.preventDefault(); setTab('failed'); }} style={{ fontSize: 12, color: 'var(--brand)', textDecoration: 'none' }}>View all →</a>}
          >
            {MOCK_FAILED.length === 0 ? (
              <EmptyState message="No failed charges in the last 7 days" />
            ) : (
              <div>
                {MOCK_FAILED.map((f, i) => (
                  <div
                    key={f.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      padding: '12px 14px',
                      background: 'var(--warn-bg)',
                      borderRadius: 8,
                      marginBottom: i < MOCK_FAILED.length - 1 ? 8 : 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 0 3px var(--danger-bg)', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{f.client}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{f.reason} · retry {f.retryCount}/4 · {f.nextRetry}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 18, color: 'var(--danger)' }}>{inr(f.amount)}</div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button className="btn-primary btn-xs">Retry</button>
                      <button className="btn-ghost btn-xs" onClick={() => setRefundModal({ open: true, client: f.client })}>Mark paid</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* 2-col: Coupons + Invoices */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <Section
              title="Coupon codes"
              action={<button className="btn-ghost btn-xs" onClick={() => setCouponModal(true)}>+ New</button>}
            >
              {activeCoupons.length === 0 ? (
                <EmptyState message="No active coupons yet" />
              ) : (
                <div>
                  {activeCoupons.map((c, i) => {
                    const pct = c.limit ? Math.min(100, Math.round((c.uses / c.limit) * 100)) : 0;
                    return (
                      <div key={c.code} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: i < activeCoupons.length - 1 ? '1px solid var(--hair-2, var(--border))' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <code style={{ background: 'var(--brand-bg)', color: 'var(--brand)', padding: '3px 8px', borderRadius: 4, fontWeight: 700, fontSize: 12 }}>{c.code}</code>
                          <span style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 18 }}>
                            {c.type === 'percent' ? `${c.value}%` : c.type === 'flat' ? `₹${c.value}` : `${c.value}d`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="progress-track" style={{ flex: 1 }}>
                            <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--brand)' }} />
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', minWidth: 70, textAlign: 'right' }}>{c.uses}/{c.limit}</div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Expires {c.valid}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>

            <Section
              title="Recent invoices"
              action={<span style={{ fontSize: 12, color: 'var(--muted)' }}>Last 10</span>}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {MOCK_INVOICES.map((inv, i) => (
                  <div
                    key={inv.invoice}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                      padding: '9px 0',
                      borderBottom: i < MOCK_INVOICES.length - 1 ? '1px solid var(--hair-2, var(--border))' : 'none',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inv.tenant}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1, fontFamily: 'var(--f-mono, monospace)' }}>{inv.invoice} · {inv.date}</div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: inv.status === 'failed' ? 'var(--danger)' : 'var(--text)', whiteSpace: 'nowrap' }}>{inr(inv.amount)}</div>
                    <Badge color={inv.status === 'paid' ? 'green' : 'red'}>{inv.status}</Badge>
                    <a href="#" style={{ fontSize: 11, color: 'var(--brand)', textDecoration: 'none', whiteSpace: 'nowrap' }}>↓ PDF</a>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* MRR trend + revenue-by-plan */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Section title="MRR trend (7 months)">
              <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 30, color: 'var(--success)', marginBottom: 4, letterSpacing: '-0.01em' }}>{inr(data.mrr)}</div>
              <div style={{ fontSize: 12, color: 'var(--success)', marginBottom: 14, fontWeight: 600 }}>↑ 8.1% vs last month</div>
              <Sparkline data={MRR_DATA} color="var(--success)" width={340} height={72} fill />
            </Section>

            <Section title="Revenue by plan">
              {[
                { plan: 'Starter (₹999)', amount: 18981, pct: 10 },
                { plan: 'Growth (₹2,499)', amount: 74970, pct: 40 },
                { plan: 'Pro (₹4,999)', amount: 59988, pct: 32 },
                { plan: 'Enterprise (₹9,999)', amount: 33461, pct: 18 },
              ].map(({ plan, amount, pct }) => (
                <div key={plan} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span>{plan}</span>
                    <span style={{ fontWeight: 600 }}>{inr(amount)} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({pct}%)</span></span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--brand)' }} />
                  </div>
                </div>
              ))}
            </Section>
          </div>
        </div>
      )}

      {/* ── Failed payments tab ─────────────────────────────────────────── */}
      {tab === 'failed' && (
        <div>
          <div className="alert alert-warn" style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--warn)' }}>{MOCK_FAILED.length} clients have failed payments</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Dunning is active — automatic retries scheduled</div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr>{['Client', 'Amount', 'Reason', 'Days Overdue', 'Retries', 'Next Retry', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {MOCK_FAILED.map(f => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{f.client}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{f.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--danger)' }}>{inr(f.amount)}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{f.reason}</td>
                    <td>
                      <span style={{ color: f.daysOverdue > 7 ? 'var(--danger)' : 'var(--warn)', fontWeight: 600 }}>{f.daysOverdue}d</span>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{f.retryCount} / 4</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{f.nextRetry}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-primary btn-xs">↻ Retry Now</button>
                        <button className="btn-ghost btn-xs" onClick={() => setRefundModal({ open: true, client: f.client })}>Mark Paid</button>
                        <button className="btn-ghost btn-xs">📱 Contact</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Coupons tab ─────────────────────────────────────────────────── */}
      {tab === 'coupons' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn-primary btn-sm" onClick={() => setCouponModal(true)}>+ Create Coupon</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr>{['Code', 'Type', 'Value', 'Uses', 'Valid Until', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.code}>
                    <td><code style={{ background: 'var(--brand-bg)', color: 'var(--brand)', padding: '3px 8px', borderRadius: 4, fontWeight: 700, fontSize: 13 }}>{c.code}</code></td>
                    <td style={{ color: 'var(--muted)' }}>{c.type}</td>
                    <td style={{ fontWeight: 700 }}>{c.type === 'percent' ? `${c.value}%` : c.type === 'flat' ? `₹${c.value}` : `${c.value} days`}</td>
                    <td style={{ color: 'var(--muted)' }}>{c.uses} / {c.limit}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{c.valid}</td>
                    <td><Badge color={c.active ? 'green' : 'gray'}>{c.active ? 'Active' : 'Inactive'}</Badge></td>
                    <td>
                      {c.active && <button className="btn-danger btn-xs" onClick={() => deactivateCoupon(c.code)}>Deactivate</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Refunds tab ─────────────────────────────────────────────────── */}
      {tab === 'refunds' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn-danger btn-sm" onClick={() => setRefundModal({ open: true, client: null })}>Issue Refund</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr>{['Date', 'Client', 'Invoice', 'Amount', 'Reason', 'Approved By'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {MOCK_REFUNDS.map((r, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{r.date}</td>
                    <td style={{ fontWeight: 600 }}>{r.client}</td>
                    <td style={{ fontFamily: 'var(--f-mono, monospace)', fontSize: 12 }}>{r.invoice}</td>
                    <td style={{ fontWeight: 700, color: 'var(--danger)' }}>{inr(r.amount)}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{r.reason}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{r.admin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Refund modal */}
      <Modal open={refundModal.open} onClose={() => setRefundModal({ open: false })} title="Issue Refund" width={440}>
        <Field label="Client">{refundModal.client ? <input value={refundModal.client} readOnly /> : <input placeholder="Client name…" />}</Field>
        <Field label="Refund Amount (₹)"><input type="number" placeholder="0" value={refundForm.amount} onChange={e => setRefundForm(r => ({ ...r, amount: e.target.value }))} /></Field>
        <Field label="Reason"><textarea rows={3} placeholder="Reason for refund…" value={refundForm.reason} onChange={e => setRefundForm(r => ({ ...r, reason: e.target.value }))} /></Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn-ghost btn-sm" onClick={() => setRefundModal({ open: false })}>Cancel</button>
          <button className="btn-danger btn-sm" onClick={() => { setRefundModal({ open: false }); setRefundForm({ amount: '', reason: '' }); }}>Process Refund</button>
        </div>
      </Modal>

      {/* Create coupon modal */}
      <Modal open={couponModal} onClose={() => setCouponModal(false)} title="Create Coupon" width={400}>
        <Field label="Coupon Code"><input placeholder="e.g. LAUNCH50" value={couponForm.code} onChange={e => setCouponForm(c => ({ ...c, code: e.target.value.toUpperCase() }))} /></Field>
        <div className="grid-2">
          <Field label="Type">
            <select value={couponForm.type} onChange={e => setCouponForm(c => ({ ...c, type: e.target.value }))}>
              <option value="percent">Percent (%)</option>
              <option value="flat">Flat (₹)</option>
              <option value="days">Trial Days</option>
            </select>
          </Field>
          <Field label="Value"><input type="number" placeholder="50" value={couponForm.value} onChange={e => setCouponForm(c => ({ ...c, value: e.target.value }))} /></Field>
        </div>
        <Field label="Max Uses"><input type="number" placeholder="100" value={couponForm.limit} onChange={e => setCouponForm(c => ({ ...c, limit: e.target.value }))} /></Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn-ghost btn-sm" onClick={() => setCouponModal(false)}>Cancel</button>
          <button className="btn-primary btn-sm" onClick={createCoupon}>Create</button>
        </div>
      </Modal>
    </div>
  );
}
