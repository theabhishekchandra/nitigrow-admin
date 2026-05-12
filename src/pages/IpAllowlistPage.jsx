import React, { useState, useEffect, useCallback } from 'react';
import { Badge, PageHeader, Section, Spinner, Modal, ConfirmModal, EmptyState } from '../components/ui';
import api from '../services/api';

const errMessage = (err, fallback = 'Something went wrong.') => {
  if (!err) return fallback;
  const status = err.response?.status;
  if (status === 404) return 'Endpoint not yet available.';
  if (status === 403) return err.response?.data?.error || 'Forbidden.';
  return err.response?.data?.message || err.response?.data?.error || err.message || fallback;
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return '—'; }
};

// Light-touch client-side check — server is the source of truth.
const looksLikeCidr = (s) => /^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2})?$/.test(String(s || '').trim());

export default function IpAllowlistPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageMsg, setPageMsg] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ label: '', cidr: '' });
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState(null);

  const [confirmRemove, setConfirmRemove] = useState(null); // { _id, label, cidr }

  const load = useCallback(async () => {
    setLoading(true); setPageMsg(null);
    try {
      const { data } = await api.get('/allowlist');
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      setPageMsg({ kind: 'err', text: errMessage(err, 'Could not load allowlist.') });
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setForm({ label: '', cidr: '' });
    setAddMsg(null);
    setShowAdd(true);
  };

  const submitAdd = async (e) => {
    e?.preventDefault?.();
    setAddMsg(null);
    const label = form.label.trim();
    const cidr  = form.cidr.trim();
    if (!label) { setAddMsg({ kind: 'err', text: 'Label is required.' }); return; }
    if (!looksLikeCidr(cidr)) { setAddMsg({ kind: 'err', text: 'Enter a valid IPv4 or CIDR (e.g. 203.0.113.5 or 203.0.113.0/24).' }); return; }

    setAdding(true);
    try {
      await api.post('/allowlist', { label, cidr });
      setShowAdd(false);
      await load();
    } catch (err) {
      setAddMsg({ kind: 'err', text: errMessage(err, 'Could not add entry.') });
    } finally {
      setAdding(false);
    }
  };

  const removeEntry = async (id) => {
    try {
      await api.delete(`/allowlist/${id}`);
      setEntries((xs) => xs.filter((x) => x._id !== id));
    } catch (err) {
      setPageMsg({ kind: 'err', text: errMessage(err, 'Could not remove entry.') });
    }
  };

  const isOpen = !loading && entries.length === 0;

  return (
    <div className="animate-in">
      <PageHeader
        title="IP allowlist"
        subtitle="Restrict admin sign-in to specific networks. Empty = open to any IP."
        actions={(
          <button className="btn-primary btn-sm" onClick={openAdd}>+ Add IP range</button>
        )}
      />

      {isOpen && (
        <div style={{
          background: 'var(--accent-2-soft, var(--brand-bg))',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Allowlist is currently OPEN</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Add at least one trusted IP or CIDR to enforce restrictions. Once any entry exists, only matching IPs can use this admin session.
            </div>
          </div>
          <Badge color="yellow">Open</Badge>
        </div>
      )}

      {!isOpen && !loading && (
        <div style={{
          background: 'var(--accent-2-soft, var(--brand-bg))',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Allowlist is active</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              Removing all entries reverts this account to open access.
            </div>
          </div>
          <Badge color="green">Enforced</Badge>
        </div>
      )}

      <Section
        title="Allowlisted networks"
        action={loading ? <Spinner size={14} /> : <span style={{ fontSize: 12, color: 'var(--muted)' }}>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>}
      >
        {pageMsg && (
          <div style={{ fontSize: 12, color: pageMsg.kind === 'ok' ? 'var(--success)' : 'var(--danger)', marginBottom: 10 }}>{pageMsg.text}</div>
        )}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 13, padding: '12px 0' }}>
            <Spinner size={14} /> Loading…
          </div>
        )}

        {!loading && entries.length === 0 && (
          <EmptyState
            message="No IPs allowlisted yet. Your admin session is reachable from any IP."
          />
        )}

        {!loading && entries.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>Label</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>CIDR</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>Added by</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>Added</th>
                  <th style={{ padding: '10px 12px', width: 1 }} />
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e._id} style={{ borderBottom: '1px solid var(--border-2, var(--border))' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{e.label}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--f-mono, ui-monospace, monospace)', fontSize: 12.5 }}>{e.cidr}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{e.addedBy?.name || e.addedBy?.email || '—'}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{fmtDate(e.addedAt)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => setConfirmRemove(e)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Modal open={showAdd} onClose={() => !adding && setShowAdd(false)} title="Add IP range" width={460}>
        <form onSubmit={submitAdd}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>
              Label
            </label>
            <input
              type="text"
              placeholder="e.g. Office Wi-Fi"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              disabled={adding}
              maxLength={80}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6 }}>
              IPv4 or CIDR
            </label>
            <input
              type="text"
              placeholder="203.0.113.5 or 203.0.113.0/24"
              value={form.cidr}
              onChange={(e) => setForm((f) => ({ ...f, cidr: e.target.value }))}
              disabled={adding}
              style={{ fontFamily: 'var(--f-mono, ui-monospace, monospace)' }}
            />
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>
              A bare IPv4 is treated as /32 (a single host). Use CIDR notation for a range.
            </div>
          </div>

          {addMsg && (
            <div style={{ fontSize: 12, color: addMsg.kind === 'ok' ? 'var(--success)' : 'var(--danger)', marginBottom: 12 }}>{addMsg.text}</div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setShowAdd(false)} disabled={adding}>Cancel</button>
            <button type="submit" className="btn-primary btn-sm" disabled={adding || !form.label.trim() || !form.cidr.trim()}>
              {adding ? <><Spinner size={12} /> Adding…</> : 'Add entry'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => removeEntry(confirmRemove._id)}
        title="Remove allowlist entry?"
        message={confirmRemove ? `"${confirmRemove.label}" (${confirmRemove.cidr}) will no longer be allowed. If this is your last entry, the allowlist becomes open.` : ''}
        confirmLabel="Remove"
        danger
      />
    </div>
  );
}
