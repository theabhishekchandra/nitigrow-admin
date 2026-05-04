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
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>All Users</h2>
        <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 280 }} />
      </div>
      <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
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
                  <span style={{ background: 'var(--brand)22', color: 'var(--brand)', padding: '2px 8px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{u.role}</span>
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
