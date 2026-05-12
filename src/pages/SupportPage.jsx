import React, { useState } from 'react';
import { Badge, PageHeader, EmptyState } from '../components/ui';

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

const CH_LABEL = { chat: 'Live chat', whatsapp: 'WhatsApp', email: 'Email' };
const PRI_COLOR = { urgent: 'red', high: 'yellow', normal: 'blue', low: 'gray' };
const PLAN_COLOR = { Starter: 'blue', Growth: 'green', Pro: 'purple', Enterprise: 'cyan' };

const PALETTE = ['var(--brand)', 'var(--accent, #C55A2B)', 'var(--accent-2, #E8A94A)', '#7C5BC6', '#3E8EDB', '#0F7F5E', '#C03B3B'];
const colorFor = (name) => PALETTE[(name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
const initials = (name) => (name || '?').split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

const Avatar = ({ name, size = 36 }) => (
  <span style={{
    width: size, height: size, borderRadius: '50%',
    background: colorFor(name), color: 'var(--paper, #FBF8F3)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600, fontSize: Math.round(size * 0.38), flexShrink: 0,
    fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', letterSpacing: '.02em',
  }}>{initials(name)}</span>
);

const ChannelChip = ({ channel }) => (
  <span style={{
    fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
    background: 'var(--paper-2, var(--bg))', color: 'var(--muted)',
    border: '1px solid var(--hair, var(--border))',
  }}>{CH_LABEL[channel]}</span>
);

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
    if (filter === 'pending') return c.status === 'open' && c.agent;
    if (filter === 'mine') return c.agent === 'You' || c.agent === 'Me';
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

  const FILTERS = [
    ['all', 'All'],
    ['open', 'Open'],
    ['pending', 'Pending'],
    ['resolved', 'Resolved'],
    ['urgent', 'Urgent'],
    ['mine', 'Mine'],
  ];

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px - 24px - 24px)', minHeight: 520 }}>
      <PageHeader
        title="Support Inbox"
        subtitle="All channels — live chat, WhatsApp, email"
        actions={
          <>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
              <span className="dot dot-green pulse-anim" /> Online
            </span>
            <button className="btn-ghost btn-sm">Canned responses</button>
          </>
        }
      />

      {/* Two-pane split */}
      <div style={{
        display: 'grid', gridTemplateColumns: '360px 1fr', gap: 14,
        flex: 1, minHeight: 0,
      }}>
        {/* ── Left: filter rail + conversation list ─────────────────────── */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: 12, borderBottom: '1px solid var(--hair, var(--border))', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              placeholder="Search tickets…"
              className="input"
              style={{ width: '100%', fontSize: 13 }}
            />
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {FILTERS.map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)}
                  style={{
                    padding: '4px 11px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                    border: '1px solid var(--hair, var(--border))',
                    background: filter === k ? 'var(--brand)' : 'transparent',
                    color: filter === k ? 'var(--paper, #FBF8F3)' : 'var(--muted)',
                    cursor: 'pointer',
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map(c => {
              const sel = selected?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '12px 14px',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    background: sel ? 'var(--brand-bg)' : c.unread ? 'var(--accent-2-soft, transparent)' : 'transparent',
                    borderLeft: `3px solid ${sel ? 'var(--brand)' : 'transparent'}`,
                    borderBottom: '1px solid var(--hair-2, var(--border))',
                    borderRadius: 0, cursor: 'pointer', transition: 'background .12s',
                  }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--bg-2, var(--paper-2, transparent))'; }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = c.unread ? 'var(--accent-2-soft, transparent)' : 'transparent'; }}
                >
                  <Avatar name={c.client} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span style={{ fontWeight: c.unread ? 700 : 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.client}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{c.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3 }}>
                      {c.lastMsg}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      <ChannelChip channel={c.channel} />
                      <Badge color={PRI_COLOR[c.priority]}>{c.priority}</Badge>
                      {c.agent && <span style={{ fontSize: 11, color: 'var(--muted)' }}>· {c.agent}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && <EmptyState message="No conversations match this filter" />}
          </div>
        </div>

        {/* ── Right: ticket detail ──────────────────────────────────────── */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState message="Select a conversation to view the thread" />
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--hair, var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <Avatar name={selected.client} size={42} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 18, letterSpacing: '-0.01em' }}>
                      {selected.client}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <ChannelChip channel={selected.channel} />
                      <Badge color={PRI_COLOR[selected.priority]}>{selected.priority}</Badge>
                      <Badge color={selected.status === 'resolved' ? 'green' : 'blue'}>{selected.status}</Badge>
                      <Badge color={PLAN_COLOR[selected.plan]}>{selected.plan}</Badge>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {selected.agent ? `· assigned to ${selected.agent}` : '· unassigned'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <select style={{ width: 140, fontSize: 12, padding: '5px 10px' }}>
                    <option>Assign agent…</option>
                    <option>Rahul</option>
                    <option>Priya</option>
                    <option>Me</option>
                  </select>
                  <button className="btn-success btn-sm">✓ Resolve</button>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--paper-2, var(--bg))' }}>
                {msgs.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 40, fontSize: 13 }}>No messages yet</div>
                ) : msgs.map((m, i) => {
                  const isIn = m.from === 'client';
                  const isBot = m.from === 'bot';
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: isIn ? 'flex-start' : 'flex-end', gap: 8, alignItems: 'flex-end' }}>
                      {isIn && <Avatar name={selected.client} size={26} />}
                      <div style={{
                        maxWidth: '70%',
                        padding: '10px 14px',
                        borderRadius: isIn ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                        background: isIn ? 'var(--paper, var(--card))' : isBot ? 'var(--accent-2-soft, rgba(232,169,74,0.14))' : 'var(--brand)',
                        color: isIn ? 'var(--ink, var(--text))' : isBot ? 'var(--ink, var(--text))' : 'var(--paper, #FBF8F3)',
                        border: isIn ? '1px solid var(--hair, var(--border))' : 'none',
                        fontSize: 13, lineHeight: 1.5,
                        boxShadow: isIn ? 'none' : '0 1px 2px rgba(26,23,20,0.06)',
                      }}>
                        {!isIn && (
                          <div style={{ fontSize: 10.5, fontWeight: 700, marginBottom: 4, opacity: 0.78, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                            {isBot ? 'NitiGrow bot' : (m.agent || 'Agent')}
                          </div>
                        )}
                        <div>{m.text}</div>
                        <div style={{ fontSize: 10, opacity: 0.65, marginTop: 5, textAlign: 'right', fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}>{m.time}</div>
                      </div>
                      {!isIn && !isBot && <Avatar name={m.agent || 'Agent'} size={26} />}
                    </div>
                  );
                })}
              </div>

              {/* Canned responses picker */}
              {showCanned && (
                <div style={{
                  margin: '0 22px',
                  background: 'var(--paper, var(--card))',
                  border: '1px solid var(--hair, var(--border))', borderRadius: 8,
                  maxHeight: 180, overflowY: 'auto',
                  boxShadow: '0 4px 14px rgba(26,23,20,0.08)',
                }}>
                  {CANNED.filter(c => c.key.includes(reply.toLowerCase())).map((c, i) => (
                    <div key={i} onClick={() => insertCanned(c.text)}
                      style={{
                        padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                        borderBottom: '1px solid var(--hair-2, var(--border))',
                      }}>
                      <span style={{ color: 'var(--brand)', fontWeight: 700, fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}>{c.key}</span>
                      <span style={{ color: 'var(--muted)', marginLeft: 10 }}>{c.text.slice(0, 70)}…</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Composer */}
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--hair, var(--border))', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  value={reply}
                  onChange={handleReplyChange}
                  placeholder="Type your reply…  · / for canned responses · Shift+↵ for newline"
                  rows={2}
                  style={{ resize: 'none', flex: 1, fontSize: 13, padding: '10px 14px' }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button className="btn-primary btn-sm" onClick={sendReply}>Send ↵</button>
                  <button className="btn-ghost btn-xs">Attach</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
