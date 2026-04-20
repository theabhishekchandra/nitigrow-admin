import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Badge, StatCard, Modal, Field, PageHeader, Section, Sparkline } from '../components/ui';

const MOCK_OVERVIEW = { mrr: 187400, arr: 2248800, activeSubscriptions: 42, trialConversions: 8, churned: 2, failedPayments: 3 };
const MRR_DATA = [142000, 155000, 163000, 171000, 178000, 185000, 187400];

const MOCK_FAILED = [
  { id: 'f1', client: 'CloudStore India', amount: 999, daysOverdue: 4, retryCount: 2, nextRetry: 'Tomorrow', email: 'ops@cloudstore.in' },
  { id: 'f2', client: 'FoodieHub Kitchen', amount: 999, daysOverdue: 1, retryCount: 1, nextRetry: 'In 2 days', email: 'hello@foodiehub.in' },
  { id: 'f3', client: 'AutoDrive Motors', amount: 2499, daysOverdue: 12, retryCount: 4, nextRetry: 'Manual', email: 'sales@autodrive.in' },
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

  return (
    <div className="animate-in">
      <PageHeader title="Billing & Revenue" subtitle="MRR, failed payments, coupons, refunds" />

      <div className="tab-list">
        {[['overview', 'Revenue Overview'], ['failed', 'Failed Payments'], ['coupons', 'Coupons'], ['refunds', 'Refunds']].map(([k, l]) => (
          <button key={k} className={`tab-btn${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ── Revenue Overview ── */}
      {tab === 'overview' && (
        <div>
          <div className="grid-auto" style={{ marginBottom: 24 }}>
            <StatCard label="MRR" value={`₹${(data.mrr || 0).toLocaleString('en-IN')}`} color="var(--success)" change={8} sub="vs last month"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
            <StatCard label="ARR" value={`₹${((data.arr || 0) / 100000).toFixed(1)}L`} color="var(--brand)"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>} />
            <StatCard label="Active Subscriptions" value={data.activeSubscriptions} color="var(--info)"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>} />
            <StatCard label="Trial Conversions (30d)" value={data.trialConversions} color="var(--purple)" change={14}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>} />
            <StatCard label="Churned (30d)" value={data.churned} color="var(--danger)" change={-25}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>} />
            <StatCard label="Failed Payments" value={data.failedPayments} color="var(--warn)"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 22 21 2 21"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} />
          </div>

          <div className="grid-2">
            <Section title="MRR Trend (7 months)">
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)', marginBottom: 4 }}>₹{(data.mrr || 0).toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 12, color: 'var(--success)', marginBottom: 16, fontWeight: 600 }}>↑ 8.1% vs last month</div>
              <Sparkline data={MRR_DATA} color="var(--success)" width={340} height={72} fill />
            </Section>

            <Section title="Revenue by Plan">
              {[
                { plan: 'Starter (₹999)', amount: 18981, pct: 10 },
                { plan: 'Growth (₹2,499)', amount: 74970, pct: 40 },
                { plan: 'Pro (₹4,999)', amount: 59988, pct: 32 },
                { plan: 'Enterprise (₹9,999)', amount: 33461, pct: 18 },
              ].map(({ plan, amount, pct }) => (
                <div key={plan} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span>{plan}</span>
                    <span style={{ fontWeight: 600 }}>₹{amount.toLocaleString('en-IN')} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({pct}%)</span></span>
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

      {/* ── Failed Payments ── */}
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
              <thead><tr>{['Client', 'Amount', 'Days Overdue', 'Retries', 'Next Retry', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {MOCK_FAILED.map(f => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{f.client}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{f.email}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--danger)' }}>₹{f.amount.toLocaleString('en-IN')}</td>
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

      {/* ── Coupons ── */}
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

      {/* ── Refunds ── */}
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
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.invoice}</td>
                    <td style={{ fontWeight: 700, color: 'var(--danger)' }}>₹{r.amount.toLocaleString('en-IN')}</td>
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
