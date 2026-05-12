import React, { useState } from 'react';
import { PageHeader, MiniBarChart, Sparkline, Section } from '../components/ui';

const SIGNUP_DATA = [2, 4, 3, 6, 5, 8, 7, 9, 6, 11, 8, 12, 10, 14, 11, 9, 13, 16, 12, 18, 14, 17, 15, 20, 18, 22, 19, 24, 21, 26];
const MSG_DATA    = [28400, 31200, 29800, 35100, 33600, 38900, 37200, 42100, 40300, 46800, 44200, 51300, 48700, 55200, 52400, 49800, 57100, 63400, 59800, 68200, 64500, 71900, 68300, 76100, 72400, 81200, 77600, 85900, 82100, 91400];
const MRR_DATA    = [142000, 155000, 163000, 171000, 178000, 185000, 187400];
const TENANTS_DATA = [29, 31, 33, 35, 38, 41, 43, 45, 47, 49, 51, 53, 54, 55];
const CSAT_DATA = [88, 90, 91, 89, 92, 93, 92, 94];

const COHORT = [
  { month: 'Jul 2024', m0: '100%', m1: '82%', m2: '74%', m3: '68%', m4: '62%', m5: '58%' },
  { month: 'Aug 2024', m0: '100%', m1: '86%', m2: '79%', m3: '73%', m4: '67%', m5: '—' },
  { month: 'Sep 2024', m0: '100%', m1: '88%', m2: '81%', m3: '76%', m4: '—',   m5: '—' },
  { month: 'Oct 2024', m0: '100%', m1: '91%', m2: '84%', m3: '—',   m4: '—',   m5: '—' },
  { month: 'Nov 2024', m0: '100%', m1: '89%', m2: '—',   m3: '—',   m4: '—',   m5: '—' },
  { month: 'Dec 2024', m0: '100%', m1: '—',   m2: '—',   m3: '—',   m4: '—',   m5: '—' },
];

const FEATURES = [
  { name: 'Broadcast Campaigns', using: 38, total: 55, avgUses: 8.2, lastUsed: 'Today' },
  { name: 'WhatsApp Templates', using: 48, total: 55, avgUses: 14.1, lastUsed: 'Today' },
  { name: 'Chatbot Flows', using: 18, total: 55, avgUses: 3.1, lastUsed: '2 days ago' },
  { name: 'Payment Links', using: 11, total: 55, avgUses: 5.4, lastUsed: 'Today' },
  { name: 'AI Reply Suggestions', using: 6, total: 55, avgUses: 14.2, lastUsed: 'Today' },
  { name: 'Team Inbox (Agents)', using: 29, total: 55, avgUses: 21.7, lastUsed: 'Today' },
  { name: 'Knowledge Base Bot', using: 3, total: 55, avgUses: 2.1, lastUsed: '5 days ago' },
  { name: 'Scheduled Campaigns', using: 22, total: 55, avgUses: 4.3, lastUsed: 'Today' },
];

const TOP_PLANS = [
  { plan: 'Growth',     mrr: 74970, color: 'var(--brand)' },
  { plan: 'Pro',        mrr: 59988, color: 'var(--accent)' },
  { plan: 'Enterprise', mrr: 33461, color: 'var(--purple)' },
  { plan: 'Starter',    mrr: 18981, color: 'var(--accent-2)' },
];

const AGENT_LEADERBOARD = [
  { name: 'Priya Sharma',  role: 'Support Lead', resolved: 87, csat: 96 },
  { name: 'Rahul Mehta',   role: 'Support',      resolved: 64, csat: 92 },
  { name: 'Ananya Iyer',   role: 'Support',      resolved: 51, csat: 94 },
];

const adoptionColor = (pct) => pct >= 60 ? 'var(--success)' : pct >= 30 ? 'var(--warn)' : 'var(--danger)';

const cohortBg = (val) => {
  if (val === '—') return 'transparent';
  const n = parseInt(val);
  if (n >= 80) return 'rgba(15,127,94,0.18)';
  if (n >= 60) return 'rgba(232,169,74,0.20)';
  return 'rgba(192,59,59,0.14)';
};

// Display KPI tile shared with Dashboard / Billing.
const KPI = ({ label, value, delta, deltaTone = 'pos', sub, tone = 'brand', spark, sparkColor }) => {
  const valueColor = tone === 'danger' ? 'var(--danger)' : tone === 'warn' ? 'var(--warn)' : tone === 'success' ? 'var(--success)' : 'var(--text)';
  const deltaColor = deltaTone === 'neg' ? 'var(--danger)' : 'var(--success)';
  return (
    <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 124 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
        {delta && <span style={{ fontSize: 11, fontWeight: 600, color: deltaColor }}>{delta}</span>}
      </div>
      <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.01em', color: valueColor }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{sub}</div>}
      {spark && spark.length > 1 && (
        <div style={{ marginTop: 'auto', paddingTop: 6 }}>
          <Sparkline data={spark} color={sparkColor || 'var(--brand)'} width={220} height={32} fill />
        </div>
      )}
    </div>
  );
};

const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '7d',    label: '7d' },
  { value: '30d',   label: '30d' },
  { value: '90d',   label: '90d' },
  { value: 'custom', label: 'Custom' },
];

export default function AnalyticsPage() {
  const [tab, setTab] = useState('growth');
  const [range, setRange] = useState('30d');

  const maxPlanMRR = Math.max(...TOP_PLANS.map(p => p.mrr));

  return (
    <div className="animate-in">
      <PageHeader
        title="Analytics & Reporting"
        subtitle="Growth cockpit — tenants, MRR, retention, feature adoption"
        actions={
          <>
            <button className="btn-ghost btn-sm">↓ CSV</button>
            <button className="btn-ghost btn-sm">↓ PDF</button>
          </>
        }
      />

      {/* ── Date range chip group ─────────────────────────────────────────── */}
      <div style={{ display: 'inline-flex', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 999, padding: 3, marginBottom: 18 }}>
        {RANGE_OPTIONS.map(r => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: range === r.value ? 600 : 500,
              background: range === r.value ? 'var(--card)' : 'transparent',
              color: range === r.value ? 'var(--text)' : 'var(--muted)',
              boxShadow: range === r.value ? 'var(--shadow-sm)' : 'none',
              border: 'none',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* ── 4 KPI hero tiles ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <KPI label="Active tenants" value="55" delta="↑ 12% 30d" deltaTone="pos" sub="Paid + trial" spark={TENANTS_DATA} sparkColor="var(--brand)" />
        <KPI label="Signups (period)" value="26" delta="↑ 8 vs last" deltaTone="pos" sub="New onboards" spark={SIGNUP_DATA.slice(-14)} sparkColor="var(--accent-2)" />
        <KPI label="Churn %" value="3.6%" delta="↓ 0.8pt" deltaTone="pos" sub="30-day rolling" tone="danger" />
        <KPI label="CSAT" value="94%" delta="↑ 2pt" deltaTone="pos" sub="Trailing 8 weeks" tone="success" spark={CSAT_DATA} sparkColor="var(--success)" />
      </div>

      <div className="tab-list">
        {[['growth', 'Growth'], ['features', 'Feature Adoption'], ['messages', 'Message Volume'], ['cohort', 'Cohort Retention']].map(([k, l]) => (
          <button key={k} className={`tab-btn${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ── Growth tab ──────────────────────────────────────────────────── */}
      {tab === 'growth' && (
        <div>
          {/* 2-col charts grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Section title="Tenants over time">
              <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 30, color: 'var(--brand)', marginBottom: 4, letterSpacing: '-0.01em' }}>
                55 <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)', fontFamily: 'var(--f-sans)' }}>total</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginBottom: 14 }}>↑ 12 added in last 30 days</div>
              <Sparkline data={TENANTS_DATA} color="var(--brand)" width={420} height={72} fill />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
                <span>30 days ago</span><span>Today</span>
              </div>
            </Section>

            <Section title="Top plans by MRR">
              {TOP_PLANS.map(({ plan, mrr, color }) => {
                const pct = (mrr / maxPlanMRR) * 100;
                return (
                  <div key={plan} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                      <span style={{ fontWeight: 600 }}>{plan}</span>
                      <span style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 16 }}>₹{mrr.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </Section>
          </div>

          {/* Signups + MRR */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Section title="New signups (last 30 days)">
              <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 30, color: 'var(--brand)', marginBottom: 4, letterSpacing: '-0.01em' }}>26 <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)', fontFamily: 'var(--f-sans)' }}>this month</span></div>
              <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginBottom: 14 }}>↑ 8 more vs last month</div>
              <MiniBarChart data={SIGNUP_DATA.map((v, i) => ({ label: i, value: v }))} color="var(--brand)" height={72} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}><span>30 days ago</span><span>Today</span></div>
            </Section>

            <Section title="MRR trend (7 months)">
              <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 30, color: 'var(--success)', marginBottom: 4, letterSpacing: '-0.01em' }}>₹1,87,400 <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)', fontFamily: 'var(--f-sans)' }}>this month</span></div>
              <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginBottom: 14 }}>↑ ₹2,400 vs last month (+1.3%)</div>
              <Sparkline data={MRR_DATA} color="var(--success)" width={360} height={72} fill />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}><span>Jul 2024</span><span>Jan 2025</span></div>
            </Section>
          </div>

          {/* Geography + Agent leaderboard */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
            <Section title="Geographic distribution">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                {[
                  { city: 'Mumbai', count: 14, pct: 25 },
                  { city: 'Delhi NCR', count: 11, pct: 20 },
                  { city: 'Bangalore', count: 9, pct: 16 },
                  { city: 'Pune', count: 7, pct: 13 },
                  { city: 'Hyderabad', count: 5, pct: 9 },
                  { city: 'Chennai', count: 4, pct: 7 },
                  { city: 'Others', count: 5, pct: 9 },
                ].map(({ city, count, pct }) => (
                  <div key={city} style={{ padding: '10px 14px', background: 'var(--bg)', borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{city}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{count} clients · {pct}%</div>
                    <div className="progress-track" style={{ height: 4 }}>
                      <div className="progress-fill" style={{ width: `${pct * 3}%`, background: 'var(--brand)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Agent leaderboard" action={<span style={{ fontSize: 11, color: 'var(--muted)' }}>30d</span>}>
              {AGENT_LEADERBOARD.map((a, i) => (
                <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < AGENT_LEADERBOARD.length - 1 ? '1px solid var(--hair-2, var(--border))' : 'none' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: i === 0 ? 'var(--accent-2-soft)' : 'var(--brand-bg)',
                    color: i === 0 ? 'var(--accent)' : 'var(--brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 600, fontSize: 14,
                    flexShrink: 0,
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.role}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 16 }}>{a.resolved}</div>
                    <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>{a.csat}% CSAT</div>
                  </div>
                </div>
              ))}
            </Section>
          </div>
        </div>
      )}

      {/* ── Feature adoption tab ────────────────────────────────────────── */}
      {tab === 'features' && (
        <div>
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, color: 'var(--info)' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <div>
              <div style={{ fontWeight: 600 }}>Low adoption alert</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Knowledge Base Bot (5%) and AI Reply (11%) are underused — consider better onboarding for these features.</div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>{['Feature', 'Clients Using', 'Adoption %', 'Avg Uses/Month', 'Last Used'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {FEATURES.map((f, i) => {
                  const pct = Math.round((f.using / f.total) * 100);
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{f.name}</td>
                      <td style={{ color: 'var(--muted)' }}>{f.using} / {f.total}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="progress-track" style={{ width: 100 }}>
                            <div className="progress-fill" style={{ width: `${pct}%`, background: adoptionColor(pct) }} />
                          </div>
                          <span style={{ fontWeight: 700, color: adoptionColor(pct), fontSize: 13, minWidth: 36 }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-2)' }}>{f.avgUses}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 12 }}>{f.lastUsed}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Message volume tab ──────────────────────────────────────────── */}
      {tab === 'messages' && (
        <div>
          <Section title="Daily message volume (last 30 days)">
            <MiniBarChart data={MSG_DATA.map((v, i) => ({ label: i, value: v }))} color="var(--brand)" height={100} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}><span>30 days ago</span><span>Today</span></div>
          </Section>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Section title="By category">
              {[
                { label: 'Marketing', pct: 61, color: 'var(--purple)' },
                { label: 'Utility', pct: 31, color: 'var(--info)' },
                { label: 'Authentication', pct: 8, color: 'var(--success)' },
              ].map(({ label, pct, color }) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}><span>{label}</span><span style={{ fontWeight: 700 }}>{pct}%</span></div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%`, background: color }} /></div>
                </div>
              ))}
            </Section>
            <Section title="Peak hours">
              {[
                { label: '10am–12pm', msgs: 18200, pct: 85 },
                { label: '12pm–2pm',  msgs: 14400, pct: 67 },
                { label: '2pm–4pm',   msgs: 9200,  pct: 43 },
                { label: '4pm–6pm',   msgs: 21400, pct: 100 },
                { label: '6pm–8pm',   msgs: 16800, pct: 78 },
                { label: '8pm–10pm',  msgs: 11400, pct: 53 },
              ].map(({ label, msgs, pct }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, fontSize: 13 }}>
                  <div style={{ width: 80, color: 'var(--muted)', flexShrink: 0 }}>{label}</div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--brand)' }} /></div>
                  <div style={{ width: 56, textAlign: 'right', fontWeight: 600, flexShrink: 0 }}>{(msgs / 1000).toFixed(1)}k</div>
                </div>
              ))}
            </Section>
          </div>
        </div>
      )}

      {/* ── Cohort retention tab ────────────────────────────────────────── */}
      {tab === 'cohort' && (
        <div>
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>📊</span>
            <div>
              <div style={{ fontWeight: 600 }}>Retention is improving</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Oct 2024 cohort has 84% retention at Month 3 — up from 68% for Jul cohort. Onboarding improvements are working.</div>
            </div>
          </div>
          <Section title="Client retention by signup cohort">
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['Cohort', 'Month 0', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COHORT.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: 13 }}>{row.month}</td>
                      {[row.m0, row.m1, row.m2, row.m3, row.m4, row.m5].map((val, j) => (
                        <td key={j} style={{ padding: '10px 12px', background: cohortBg(val), fontWeight: val !== '—' ? 700 : 400, color: val !== '—' ? 'var(--text)' : 'var(--muted)', fontSize: 13 }}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, background: 'rgba(15,127,94,0.18)', borderRadius: 2, display: 'inline-block' }} /> ≥80% retained</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, background: 'rgba(232,169,74,0.20)', borderRadius: 2, display: 'inline-block' }} /> 60–79%</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, background: 'rgba(192,59,59,0.14)', borderRadius: 2, display: 'inline-block' }} /> &lt;60%</span>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
