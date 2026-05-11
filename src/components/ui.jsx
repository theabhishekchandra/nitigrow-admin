import React from 'react';

/* ── Badge ── */
const COLOR_MAP = {
  active: 'green', trial: 'yellow', past_due: 'red', suspended: 'gray', cancelled: 'gray',
  starter: 'blue', growth: 'blue', pro: 'purple', enterprise: 'purple',
  healthy: 'green', at_risk: 'yellow', churning: 'red',
  pending: 'yellow', approved: 'green', rejected: 'red', paused: 'gray',
  open: 'blue', resolved: 'green', urgent: 'red', low: 'gray', normal: 'blue', high: 'yellow',
  online: 'green', away: 'yellow', offline: 'gray',
  green: 'green', yellow: 'yellow', red: 'red', gray: 'gray', blue: 'blue', purple: 'purple', cyan: 'cyan',
};

export const Badge = ({ children, color, dot }) => {
  const c = color || COLOR_MAP[String(children).toLowerCase().replace(' ', '_')] || 'gray';
  return (
    <span className={`badge badge-${c}`}>
      {dot && <span className={`dot dot-${c}`} />}
      {children}
    </span>
  );
};

/* ── StatCard ── */
export const StatCard = ({ label, value, change, color = 'var(--brand)', icon, sub }) => (
  <div className="card card-sm" style={{ borderLeft: `3px solid ${color}` }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
      {icon && (
        typeof icon === 'string'
          ? <span style={{ fontSize: 18, opacity: 0.65 }}>{icon}</span>
          : <span style={{ opacity: 0.75, color }}>{icon}</span>
      )}
    </div>
    <div style={{ fontSize: 28, fontWeight: 500, color, lineHeight: 1.1, marginBottom: 4, fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', letterSpacing: '-0.01em' }}>{value ?? '—'}</div>
    {(change !== undefined || sub) && (
      <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
        {change !== undefined && (
          <span style={{ color: change >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
        {sub && <span>{sub}</span>}
      </div>
    )}
  </div>
);

/* ── Spinner ── */
export const Spinner = ({ size = 16 }) => (
  <svg className="spin-anim" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

/* ── EmptyState ── */
export const EmptyState = ({ message = 'No data found', icon }) => (
  <div style={{ padding: '48px 24px', textAlign: 'center' }}>
    <div style={{
      width: 56, height: 56, borderRadius: 16, marginBottom: 16, margin: '0 auto 16px',
      background: 'var(--accent-soft, var(--brand-bg))', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--brand)',
    }}>
      {icon || (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )}
    </div>
    <div style={{ color: 'var(--muted)', fontSize: 14 }}>{message}</div>
  </div>
);

/* ── Modal ── */
export const Modal = ({ open, onClose, title, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in" style={{ maxWidth: width, margin: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'transparent', fontSize: 22, color: 'var(--muted)', padding: '0 4px', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

/* ── ProgressBar ── */
export const ProgressBar = ({ value = 0, max = 100, color, showLabel = false }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const c = color || (pct > 85 ? 'var(--danger)' : pct > 65 ? 'var(--warn)' : 'var(--brand)');
  return (
    <div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: c }} />
      </div>
      {showLabel && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, display: 'flex', justifyContent: 'space-between' }}>
          <span>{value?.toLocaleString('en-IN')}</span>
          <span>{max?.toLocaleString('en-IN')}</span>
        </div>
      )}
    </div>
  );
};

/* ── Mini bar chart (CSS) ── */
export const MiniBarChart = ({ data = [], color = 'var(--brand)', height = 56 }) => {
  const max = Math.max(...data.map(d => (typeof d === 'object' ? d.value : d) || 0), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {data.map((d, i) => {
        const v = typeof d === 'object' ? d.value : d;
        return (
          <div key={i} style={{ flex: 1, height: `${Math.max(4, (v / max) * (height - 4))}px`, background: color, borderRadius: '3px 3px 0 0', opacity: 0.35 + (i / Math.max(data.length - 1, 1)) * 0.65, transition: 'height .3s' }} />
        );
      })}
    </div>
  );
};

/* ── Sparkline SVG ── */
export const Sparkline = ({ data = [], color = 'var(--brand)', width = 120, height = 36, fill = false }) => {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pad = 2;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const fillPath = fill
    ? `M ${pts[0]} L ${pts.join(' L ')} L ${width},${height} L 0,${height} Z`
    : null;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      {fill && <path d={fillPath} fill={color} fillOpacity={0.12} />}
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ── Health dot ── */
export const HealthDot = ({ status = 'gray', size = 10 }) => {
  const c = { green: '#22c55e', yellow: '#f59e0b', red: '#ef4444', gray: '#94a3b8' }[status] || '#94a3b8';
  return (
    <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', background: c, boxShadow: `0 0 0 3px ${c}33`, flexShrink: 0 }} />
  );
};

/* ── Page header ── */
export const PageHeader = ({ title, subtitle, actions }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 500, marginBottom: 2, fontFamily: 'var(--f-display, "Fraunces", Georgia, serif)', letterSpacing: '-0.01em', lineHeight: 1.15 }}>{title}</h1>
      {subtitle && <p style={{ color: 'var(--muted)', fontSize: 13 }}>{subtitle}</p>}
    </div>
    {actions && <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{actions}</div>}
  </div>
);

/* ── Section card with optional header ── */
export const Section = ({ title, children, action, style: s }) => (
  <div className="card" style={{ marginBottom: 20, ...s }}>
    {title && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--hair, var(--border))' }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{title}</div>
        {action}
      </div>
    )}
    {children}
  </div>
);

/* ── Confirm dialog helper ── */
export const ConfirmModal = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) => (
  <Modal open={open} onClose={onClose} title={title} width={420}>
    <p style={{ color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.7 }}>{message}</p>
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
      <button className="btn-ghost btn-sm" onClick={onClose}>Cancel</button>
      <button className={danger ? 'btn-danger btn-sm' : 'btn-primary btn-sm'} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
    </div>
  </Modal>
);

/* ── Form field ── */
export const Field = ({ label, children, required, error }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>
      {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{error}</div>}
  </div>
);

/* ── Timeline item ── */
export const TimelineItem = ({ icon, title, sub, time, last }) => (
  <div style={{ display: 'flex', gap: 12, paddingBottom: last ? 0 : 16 }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-bg)', border: '2px solid var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{icon}</div>
      {!last && <div style={{ flex: 1, width: 2, background: 'var(--border)', margin: '4px 0' }} />}
    </div>
    <div style={{ flex: 1, paddingTop: 4, paddingBottom: last ? 0 : 8 }}>
      <div style={{ fontWeight: 600, fontSize: 13 }}>{title}</div>
      {sub && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{sub}</div>}
      {time && <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 4 }}>{time}</div>}
    </div>
  </div>
);
