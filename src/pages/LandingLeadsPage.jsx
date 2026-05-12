import React, { useEffect, useMemo, useState } from 'react';
import { Badge, PageHeader, EmptyState, Spinner, Field } from '../components/ui';
import api from '../services/api';
import { useAdminStore } from '../store/adminStore';
import { connectAdminSocket } from '../services/socket';

const STATUS_COLOR = { new: 'yellow', replied: 'blue', closed: 'green' };
const TOPIC_LABEL = {
  trial: 'Free trial',
  demo: 'Demo request',
  pricing: 'Pricing',
  migration: 'BSP migration',
  enterprise: 'Enterprise',
  partnership: 'Partnership',
  support: 'Support',
  other: 'General',
};
const TOPIC_COLOR = {
  trial: 'green', demo: 'blue', pricing: 'purple',
  migration: 'cyan', enterprise: 'purple', partnership: 'yellow',
  support: 'red', other: 'gray',
};

const PALETTE = ['var(--brand)', 'var(--accent, #C55A2B)', 'var(--accent-2, #E8A94A)', '#7C5BC6', '#3E8EDB', '#0F7F5E'];
const colorFor = (s) => PALETTE[(s || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
const initials = (s) => (s || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();

const Avatar = ({ name, size = 36 }) => (
  <span style={{
    width: size, height: size, borderRadius: '50%',
    background: colorFor(name), color: 'var(--paper, #FBF8F3)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600, fontSize: Math.round(size * 0.38), flexShrink: 0,
    fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', letterSpacing: '.02em',
  }}>{initials(name)}</span>
);

const fmtTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function LandingLeadsPage() {
  const token = useAdminStore((s) => s.token);
  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/contact-submissions', { params: { limit: 200 } });
      setSubmissions(data.data || []);
      setTotal(data.total ?? (data.data?.length || 0));
      setErr(null);
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  // Live updates — a new submission arrives, or another admin tab flips
  // status. Just re-pull the list; the page is small enough that a full
  // refetch is simpler than reconciling a stream.
  useEffect(() => {
    if (!token) return undefined;
    const sock = connectAdminSocket(token);
    const refetch = () => fetchList();
    sock.on('lead.new', refetch);
    sock.on('lead.updated', refetch);
    return () => {
      sock.off('lead.new', refetch);
      sock.off('lead.updated', refetch);
    };
  }, [token]);

  // Count duplicates by email (lower-cased). Shown as a "+N more" badge in the
  // detail header so an admin can see at a glance this lead has been bothering
  // them before.
  const dupCountByEmail = useMemo(() => {
    const m = new Map();
    submissions.forEach((s) => {
      const k = s.email?.toLowerCase();
      if (!k) return;
      m.set(k, (m.get(k) || 0) + 1);
    });
    return m;
  }, [submissions]);

  const filtered = useMemo(() => {
    if (filter === 'all') return submissions;
    return submissions.filter(s => s.status === filter);
  }, [submissions, filter]);

  const selected = useMemo(
    () => filtered.find(s => s._id === selectedId) || filtered[0] || null,
    [filtered, selectedId],
  );

  useEffect(() => { setNotesDraft(selected?.notes || ''); }, [selected?._id]);

  const counts = useMemo(() => ({
    all: submissions.length,
    new: submissions.filter(s => s.status === 'new').length,
    replied: submissions.filter(s => s.status === 'replied').length,
    closed: submissions.filter(s => s.status === 'closed').length,
  }), [submissions]);

  const updateSubmission = async (patch) => {
    if (!selected) return;
    try {
      setSaving(true);
      const { data } = await api.patch(`/contact-submissions/${selected._id}`, patch);
      setSubmissions(prev => prev.map(s => s._id === selected._id ? data.data : s));
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  };

  // When an admin clicks "Reply by email" or WhatsApp, auto-flip the status
  // from `new` to `replied` so the inbox doesn't keep nagging them. Fire-and-
  // forget — the mailto/wa link fires on its own and we don't want to block it.
  const markReplied = () => {
    if (!selected || selected.status !== 'new') return;
    updateSubmission({ status: 'replied' });
  };

  const FILTERS = [
    ['all',     `All · ${counts.all}`],
    ['new',     `New · ${counts.new}`],
    ['replied', `Replied · ${counts.replied}`],
    ['closed',  `Closed · ${counts.closed}`],
  ];

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px - 24px - 24px)', minHeight: 520 }}>
      <PageHeader
        title="Landing leads"
        subtitle="Form submissions from nitigrow.in"
        actions={
          <>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{total} total</span>
            <button className="btn-ghost btn-sm" onClick={fetchList} disabled={loading}>
              {loading ? <Spinner size={12} /> : 'Refresh'}
            </button>
          </>
        }
      />

      {err && (
        <div className="card" style={{ marginBottom: 14, padding: '10px 14px', borderLeft: '3px solid var(--danger)', color: 'var(--danger)', fontSize: 13 }}>
          {err}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 14, flex: 1, minHeight: 0 }}>

        {/* ── Left: filters + list ── */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: 12, borderBottom: '1px solid var(--hair, var(--border))', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {FILTERS.map(([k, label]) => (
              <button key={k} onClick={() => setFilter(k)}
                style={{
                  padding: '4px 11px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                  border: '1px solid var(--hair, var(--border))',
                  background: filter === k ? 'var(--brand)' : 'transparent',
                  color: filter === k ? 'var(--paper, #FBF8F3)' : 'var(--muted)',
                  cursor: 'pointer',
                }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading && submissions.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center' }}><Spinner size={20} /></div>
            ) : filtered.length === 0 ? (
              <EmptyState message="No leads in this view yet" />
            ) : filtered.map(s => {
              const sel = selected?._id === s._id;
              const unread = s.status === 'new';
              return (
                <button
                  key={s._id}
                  onClick={() => setSelectedId(s._id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '12px 14px',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    background: sel ? 'var(--brand-bg)' : unread ? 'var(--accent-2-soft, transparent)' : 'transparent',
                    borderLeft: `3px solid ${sel ? 'var(--brand)' : 'transparent'}`,
                    borderBottom: '1px solid var(--hair-2, var(--border))',
                    borderRadius: 0, cursor: 'pointer', transition: 'background .12s',
                  }}
                >
                  <Avatar name={s.businessName || s.name} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span style={{ fontWeight: unread ? 700 : 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.businessName || s.name}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{fmtTime(s.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3 }}>
                      {s.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      <Badge color={TOPIC_COLOR[s.topic] || 'gray'}>{TOPIC_LABEL[s.topic] || s.topic}</Badge>
                      <Badge color={STATUS_COLOR[s.status] || 'gray'}>{s.status}</Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: detail ── */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmptyState message="Select a lead to view details" />
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--hair, var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <Avatar name={selected.businessName || selected.name} size={44} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontWeight: 500, fontSize: 18, letterSpacing: '-0.01em' }}>
                      {selected.businessName || selected.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                      <Badge color={TOPIC_COLOR[selected.topic] || 'gray'}>{TOPIC_LABEL[selected.topic] || selected.topic}</Badge>
                      <Badge color={STATUS_COLOR[selected.status] || 'gray'}>{selected.status}</Badge>
                      {dupCountByEmail.get(selected.email?.toLowerCase()) > 1 && (
                        <Badge color="yellow">
                          {dupCountByEmail.get(selected.email.toLowerCase())} from this email
                        </Badge>
                      )}
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>· {fmtTime(selected.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <select
                    value={selected.status}
                    onChange={(e) => updateSubmission({ status: e.target.value })}
                    disabled={saving}
                    style={{ width: 130, fontSize: 12, padding: '5px 10px' }}
                  >
                    <option value="new">New</option>
                    <option value="replied">Replied</option>
                    <option value="closed">Closed</option>
                  </select>
                  <a className="btn-primary btn-sm" href={`mailto:${selected.email}?subject=Re: NitiGrow ${TOPIC_LABEL[selected.topic] || ''}`} onClick={markReplied} style={{ textDecoration: 'none' }}>
                    Reply by email
                  </a>
                  {selected.phone && (
                    <a className="btn-ghost btn-sm" href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" onClick={markReplied} style={{ textDecoration: 'none' }}>
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <KV label="Name"           value={selected.name} />
                  <KV label="Business"       value={selected.businessName || '—'} />
                  <KV label="Email"          value={<a href={`mailto:${selected.email}`} style={{ color: 'var(--brand)' }}>{selected.email}</a>} />
                  <KV label="Phone"          value={selected.phone || '—'} />
                  <KV label="Topic"          value={TOPIC_LABEL[selected.topic] || selected.topic} />
                  <KV label="Source"         value={selected.source || 'landing'} />
                  <KV label="IP"             value={selected.ip || '—'} mono />
                  <KV label="Received"       value={new Date(selected.createdAt).toLocaleString('en-IN')} />
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                    Message
                  </div>
                  <div style={{
                    background: 'var(--paper-2, var(--bg))',
                    border: '1px solid var(--hair, var(--border))',
                    borderRadius: 8, padding: '14px 16px',
                    fontSize: 13.5, lineHeight: 1.65,
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text)',
                  }}>
                    {selected.message || <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>(no message)</span>}
                  </div>
                </div>

                {selected.ua && (
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--f-mono, ui-monospace, monospace)', wordBreak: 'break-all' }}>
                    UA · {selected.ua}
                  </div>
                )}

                <div>
                  <Field label="Internal notes">
                    <textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      placeholder="Anything the team should know about this lead…"
                      rows={4}
                      style={{ width: '100%', resize: 'vertical', fontSize: 13, padding: '10px 12px' }}
                    />
                  </Field>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => updateSubmission({ notes: notesDraft })}
                      disabled={saving || notesDraft === (selected.notes || '')}
                    >
                      {saving ? <Spinner size={12} /> : 'Save notes'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const KV = ({ label, value, mono }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
      {label}
    </div>
    <div style={{ fontSize: 13.5, fontFamily: mono ? 'var(--f-mono, ui-monospace, monospace)' : undefined, wordBreak: 'break-word' }}>
      {value}
    </div>
  </div>
);
