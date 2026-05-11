import React, { useState } from 'react';
import { Badge, PageHeader } from '../components/ui';

const CONVS = [
  { id: 1, client: 'TechBridge Solutions', channel: 'chat', lastMsg: 'Campaign is not delivering since morning', time: '5m', priority: 'urgent', status: 'open', agent: null, unread: true, plan: 'Growth', mrr: 2499, healthScore: 88 },
  { id: 2, client: 'EduFirst Academy', channel: 'whatsapp', lastMsg: 'Please help me create a new template', time: '18m', priority: 'normal', status: 'open', agent: 'Rahul', unread: false, plan: 'Pro', mrr: 4999, healthScore: 94 },
  { id: 3, client: 'CloudStore India', channel: 'email', lastMsg: 'Invoice dispute — charged twice', time: '1h', priority: 'high', status: 'open', agent: null, unread: true, plan: 'Starter', mrr: 999, healthScore: 28 },
  { id: 4, client: 'FoodieHub Kitchen', channel: 'chat', lastMsg: 'How do I add more contacts?', time: '2h', priority: 'low', status: 'open', agent: 'Priya', unread: false, plan: 'Starter', mrr: 0, healthScore: 45 },
  { id: 5, client: 'Riya Fashions', channel: 'whatsapp', lastMsg: 'Trial extension request', time: '3h', priority: 'normal', status: 'open', agent: 'Rahul', unread: false, plan: 'Starter', mrr: 0, healthScore: 72 },
  { id: 6, client: 'HealthPlus Clinic', channel: 'email', lastMsg: 'Thank you for the quick resolution!', time: '5h', priority: 'low', status: 'resolved', agent: 'Rahul', unread: false, plan: 'Growth', mrr: 2499, healthScore: 81 },
];

const MESSAGES = {
  1: [
    { from: 'client', text: 'Hi, my campaign has been failing since 9am. No messages going out.', time: '09:42' },
    { from: 'bot', text: 'Hi! I see you are having issues with your campaign. Let me check a few things. Is your WhatsApp number still connected?', time: '09:42' },
    { from: 'client', text: 'Yes it is connected. The status shows active.', time: '09:44' },
    { from: 'client', text: 'Campaign is not delivering since morning', time: '09:46' },
  ],
  2: [
    { from: 'client', text: 'Hello, I need help creating a new WhatsApp template for my course reminder.', time: '13:20' },
    { from: 'agent', text: 'Hi! Happy to help. Go to Templates → Create New → Choose category "Utility". What message do you want to send?', time: '13:22', agent: 'Rahul' },
  ],
  3: [
    { from: 'client', text: 'I was charged ₹999 twice this month. Please refund the duplicate.', time: '11:30' },
    { from: 'bot', text: 'I understand this is a billing issue. Let me connect you with our billing team immediately.', time: '11:30' },
  ],
};

const CANNED = [
  { key: '/billing', text: 'Hi {name}, I can see your billing details. Let me check the invoice right away.' },
  { key: '/template', text: 'To create a WhatsApp template, go to Templates → Create New → fill in the details and submit.' },
  { key: '/quality', text: 'Your WhatsApp quality rating dropped because some users marked your messages as spam. Pause marketing campaigns and check template content.' },
  { key: '/reset', text: 'To reset your password, click "Forgot Password" on the login page and follow the instructions.' },
  { key: '/trial', text: 'Your trial ends in {trial_end}. You can upgrade anytime under Settings → Billing → Choose Plan.' },
];

const CH_ICON = { chat: '💬', whatsapp: '📱', email: '📧' };
const PRI_COLOR = { urgent: 'red', high: 'yellow', normal: 'blue', low: 'gray' };

export default function SupportPage() {
  const [filter, setFilter] = useState('open');
  const [selected, setSelected] = useState(CONVS[0]);
  const [reply, setReply] = useState('');
  const [convMessages, setConvMessages] = useState(MESSAGES);
  const [showCanned, setShowCanned] = useState(false);

  const filtered = CONVS.filter(c => {
    if (filter === 'open') return c.status === 'open';
    if (filter === 'resolved') return c.status === 'resolved';
    if (filter === 'unassigned') return !c.agent;
    if (filter === 'urgent') return c.priority === 'urgent';
    return true;
  });

  const msgs = convMessages[selected?.id] || [];

  const sendReply = () => {
    if (!reply.trim()) return;
    const msg = { from: 'agent', text: reply, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), agent: 'You' };
    setConvMessages(prev => ({ ...prev, [selected.id]: [...(prev[selected.id] || []), msg] }));
    setReply('');
  };

  const handleReplyChange = (e) => {
    const v = e.target.value;
    setReply(v);
    setShowCanned(v.startsWith('/'));
  };

  const insertCanned = (text) => {
    setReply(text);
    setShowCanned(false);
  };

  return (
    <div className="animate-in">
      <PageHeader
        title="Support Inbox"
        subtitle="All channels — live chat, WhatsApp, email"
        actions={<>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>🟢 Online</span>
          <button className="btn-ghost btn-sm">Canned Responses</button>
        </>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 260px', gap: 16, height: 'calc(100vh - 180px)', overflow: 'hidden' }}>

        {/* ── Left: conversation list ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Filter tabs */}
          <div style={{ padding: '12px 12px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', paddingBottom: 10 }}>
              {[['all', 'All'], ['open', 'Open'], ['unassigned', 'Unassigned'], ['urgent', 'Urgent'], ['resolved', 'Resolved']].map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)}
                  style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, border: '1px solid var(--border)', background: filter === k ? 'var(--brand)' : 'transparent', color: filter === k ? '#FBF8F3' : 'var(--muted)', cursor: 'pointer' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map(c => (
              <div key={c.id} onClick={() => setSelected(c)}
                style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selected?.id === c.id ? 'var(--brand-bg)' : c.unread ? 'var(--accent-2-soft, rgba(232,169,74,0.10))' : 'transparent', transition: 'background .1s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{CH_ICON[c.channel]}</span>
                    <span style={{ fontWeight: c.unread ? 700 : 500, fontSize: 13 }}>{c.client}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{c.time}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>{c.lastMsg}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <Badge color={PRI_COLOR[c.priority]}>{c.priority}</Badge>
                  {c.agent && <span style={{ fontSize: 11, color: 'var(--muted)' }}>→ {c.agent}</span>}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No conversations</div>}
          </div>
        </div>

        {/* ── Centre: chat window ── */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selected && (
            <>
              {/* Header */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{CH_ICON[selected.channel]}</span>
                    {selected.client}
                    <Badge color={PRI_COLOR[selected.priority]}>{selected.priority}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    {selected.agent ? `Assigned to ${selected.agent}` : 'Unassigned'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select style={{ width: 130, fontSize: 12, padding: '4px 8px' }}>
                    <option>Assign agent…</option>
                    <option>Rahul</option>
                    <option>Priya</option>
                    <option>Me</option>
                  </select>
                  <button className="btn-success btn-sm">✓ Resolve</button>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {msgs.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.from === 'client' ? 'flex-start' : 'flex-end' }}>
                    <div style={{
                      maxWidth: '72%', padding: '10px 14px', borderRadius: m.from === 'client' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                      background: m.from === 'client' ? 'var(--bg-2)' : m.from === 'bot' ? 'rgba(76,110,245,0.10)' : 'var(--brand)',
                      color: m.from === 'agent' ? '#FBF8F3' : 'var(--text)', fontSize: 13,
                    }}>
                      {m.from !== 'client' && (
                        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, opacity: 0.7 }}>
                          {m.from === 'bot' ? '🤖 NitiGrow Bot' : `👤 ${m.agent || 'Agent'}`}
                        </div>
                      )}
                      {m.text}
                      <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>{m.time}</div>
                    </div>
                  </div>
                ))}
                {msgs.length === 0 && <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 40 }}>No messages yet</div>}
              </div>

              {/* Canned responses picker */}
              {showCanned && (
                <div style={{ margin: '0 18px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, maxHeight: 160, overflowY: 'auto' }}>
                  {CANNED.filter(c => c.key.includes(reply.toLowerCase())).map((c, i) => (
                    <div key={i} onClick={() => insertCanned(c.text)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--brand)', fontWeight: 700 }}>{c.key}</span>
                      <span style={{ color: 'var(--muted)', marginLeft: 8 }}>{c.text.slice(0, 60)}…</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply box */}
              <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <textarea
                    value={reply}
                    onChange={handleReplyChange}
                    placeholder="Type reply… or / for canned responses"
                    rows={2}
                    style={{ resize: 'none', paddingRight: 12 }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button className="btn-primary btn-sm" onClick={sendReply}>Send ↵</button>
                  <button className="btn-ghost btn-xs">📎 File</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Right: client info ── */}
        <div className="card" style={{ overflow: 'auto' }}>
          {selected && (
            <>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{selected.client}</div>
              {[
                ['Plan', <Badge color={{ starter: 'blue', growth: 'green', pro: 'purple', enterprise: 'cyan' }[selected.plan.toLowerCase()]}>{selected.plan}</Badge>],
                ['MRR', selected.mrr > 0 ? `₹${selected.mrr.toLocaleString('en-IN')}` : 'Trial'],
                ['Health', <span style={{ fontWeight: 700, color: selected.healthScore >= 70 ? 'var(--success)' : selected.healthScore >= 40 ? 'var(--warn)' : 'var(--danger)' }}>{selected.healthScore}/100</span>],
                ['Channel', CH_ICON[selected.channel] + ' ' + selected.channel],
                ['Priority', <Badge color={PRI_COLOR[selected.priority]}>{selected.priority}</Badge>],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{val}</span>
                </div>
              ))}
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button className="btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>→ View Client Profile</button>
                <button className="btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>🔍 Impersonate</button>
                <button className="btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>💳 View Billing</button>
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Tags</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['Billing', 'Campaign', 'Onboarding', 'Bug', 'Feature'].map(tag => (
                    <button key={tag} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer' }}>{tag}</button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
