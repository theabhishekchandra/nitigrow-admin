import React, { useState } from 'react';
import { PageHeader, StatCard, MiniBarChart, Sparkline, Section } from '../components/ui';

const SIGNUP_DATA = [2, 4, 3, 6, 5, 8, 7, 9, 6, 11, 8, 12, 10, 14, 11, 9, 13, 16, 12, 18, 14, 17, 15, 20, 18, 22, 19, 24, 21, 26];
const MSG_DATA    = [28400, 31200, 29800, 35100, 33600, 38900, 37200, 42100, 40300, 46800, 44200, 51300, 48700, 55200, 52400, 49800, 57100, 63400, 59800, 68200, 64500, 71900, 68300, 76100, 72400, 81200, 77600, 85900, 82100, 91400];
const MRR_DATA    = [142000, 155000, 163000, 171000, 178000, 185000, 187400];

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

const adoptionColor = (pct) => pct >= 60 ? 'var(--success)' : pct >= 30 ? 'var(--warn)' : 'var(--danger)';

const cohortBg = (val) => {
  if (val === '—') return 'transparent';
  const n = parseInt(val);
  if (n >= 80) return 'rgba(34,197,94,0.25)';
  if (n >= 60) return 'rgba(245,158,11,0.2)';
  return 'rgba(239,68,68,0.15)';
};

export default function AnalyticsPage() {
  const [tab, setTab] = useState('growth');

  return (
    <div className="animate-in">
      <PageHeader title="Analytics & Reporting" subtitle="Platform growth, feature adoption, message volume, cohort retention" />

      <div className="tab-list">
        {[['growth', '📈 Growth'], ['features', '🧩 Feature Adoption'], ['messages', '💬 Message Volume'], ['cohort', '🔄 Cohort Retention']].map(([k, l]) => (
          <button key={k} className={`tab-btn${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* Growth */}
      {tab === 'growth' && (
        <div>
          <div className="grid-auto" style={{ marginBottom: 24 }}>
            <StatCard label="Total Clients" value="55" color="var(--brand)" change={12} sub="vs last month"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} />
            <StatCard label="MRR" value="₹1,87,400" color="var(--success)" change={8}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
            <StatCard label="Churn Rate" value="3.6%" color="var(--danger)" change={-18} sub="vs last month"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>} />
            <StatCard label="Trial Conversion" value="68%" color="var(--purple)" change={5}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>} />
            <StatCard label="Avg. Revenue/Client" value="₹3,407" color="var(--info)"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} />
            <StatCard label="NPS Score" value="72" color="var(--warn)" change={4}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>} />
          </div>

          <div className="grid-2">
            <Section title="New Signups (Last 30 days)">
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand)', marginBottom: 4 }}>26 <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>this month</span></div>
              <div style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600, marginBottom: 16 }}>↑ 8 more vs last month</div>
              <MiniBarChart data={SIGNUP_DATA.map((v, i) => ({ label: i, value: v }))} color="var(--brand)" height={72} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}><span>30 days ago</span><span>Today</span></div>
            </Section>

            <Section title="MRR Trend (7 months)">
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)', marginBottom: 4 }}>₹1,87,400 <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>this month</span></div>
              <div style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600, marginBottom: 16 }}>↑ ₹2,400 vs last month (+1.3%)</div>
              <Sparkline data={MRR_DATA} color="var(--success)" width={360} height={72} fill />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}><span>Jul 2024</span><span>Jan 2025</span></div>
            </Section>
          </div>

          <Section title="Geographic Distribution">
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
        </div>
      )}

      {/* Feature Adoption */}
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

      {/* Message Volume */}
      {tab === 'messages' && (
        <div>
          <div className="grid-auto" style={{ marginBottom: 24 }}>
            <StatCard label="Messages This Month" value="91,400" color="var(--brand)" change={9}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} />
            <StatCard label="Delivery Success Rate" value="96.4%" color="var(--success)"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>} />
            <StatCard label="Marketing Messages" value="61%" color="var(--purple)"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>} />
            <StatCard label="Utility Messages" value="39%" color="var(--info)"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>} />
          </div>
          <Section title="Daily Message Volume (Last 30 days)">
            <MiniBarChart data={MSG_DATA.map((v, i) => ({ label: i, value: v }))} color="var(--brand)" height={100} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}><span>30 days ago</span><span>Today</span></div>
          </Section>
          <div className="grid-2">
            <Section title="By Category">
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
            <Section title="Peak Hours">
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

      {/* Cohort Retention */}
      {tab === 'cohort' && (
        <div>
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>📊</span>
            <div>
              <div style={{ fontWeight: 600 }}>Retention is improving</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Oct 2024 cohort has 84% retention at Month 3 — up from 68% for Jul cohort. Onboarding improvements are working.</div>
            </div>
          </div>
          <div className="card" style={{ overflow: 'auto' }}>
            <div style={{ fontWeight: 700, marginBottom: 16 }}>Client Retention by Signup Cohort</div>
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
            <div style={{ marginTop: 16, display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, background: 'rgba(34,197,94,0.25)', borderRadius: 2, display: 'inline-block' }} /> ≥80% retained</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, background: 'rgba(245,158,11,0.2)', borderRadius: 2, display: 'inline-block' }} /> 60–79%</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, background: 'rgba(239,68,68,0.15)', borderRadius: 2, display: 'inline-block' }} /> &lt;60%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
