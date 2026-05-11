import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/users', { params: { search } }).then(({ data }) => { setUsers(data); setLoading(false); }).catch(() => setLoading(false));
  }, [search]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', fontSize: 30, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--text)' }}>All Users</h1>
        <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} className="input" style={{ width: 280 }} />
      </div>
      <div style={{ background: 'var(--card)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Email', 'Role', 'Tenant', 'Joined'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>No users found</td></tr>
            ) : users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{u.email}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span className="badge badge-green">{u.role}</span>
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{u.tenantId?.businessName || u.tenantId}</td>
                <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
