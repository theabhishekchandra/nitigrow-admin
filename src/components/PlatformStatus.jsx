import React, { useEffect, useRef, useState } from 'react';

const STATES = {
  checking: { dot: 'rgba(245,239,223,0.45)', ring: 'rgba(245,239,223,0.18)', label: 'Checking', ink: 'var(--muted)' },
  normal:   { dot: '#16A37A',                  ring: 'rgba(22,163,122,0.22)',  label: 'All systems normal', ink: 'var(--ink, currentColor)' },
  degraded: { dot: '#E8A94A',                  ring: 'rgba(232,169,74,0.25)',  label: 'Degraded',           ink: 'var(--ink, currentColor)' },
  outage:   { dot: '#EF4444',                  ring: 'rgba(239,68,68,0.25)',   label: 'Outage',             ink: 'var(--ink, currentColor)' },
};

export default function PlatformStatus() {
  const [status, setStatus] = useState('checking');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let timer;

    const check = async () => {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 5000);
      const start = Date.now();
      try {
        const res = await fetch('/health', { signal: ctrl.signal, credentials: 'omit' });
        const elapsed = Date.now() - start;
        if (!mountedRef.current) return;
        if (res && res.ok) {
          setStatus(elapsed > 1500 ? 'degraded' : 'normal');
        } else {
          setStatus('degraded');
        }
      } catch {
        if (mountedRef.current) setStatus('outage');
      } finally {
        clearTimeout(to);
      }
    };

    check();
    timer = setInterval(check, 60000);
    return () => { mountedRef.current = false; clearInterval(timer); };
  }, []);

  const s = STATES[status] || STATES.checking;

  return (
    <div
      title={`Platform: ${s.label}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '5px 10px 5px 9px',
        borderRadius: 999,
        background: 'var(--card, rgba(245,239,223,0.04))',
        border: '1px solid var(--border, rgba(0,0,0,0.08))',
        fontSize: 11.5, fontWeight: 500,
        color: s.ink,
        whiteSpace: 'nowrap',
        lineHeight: 1,
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: s.dot,
        boxShadow: `0 0 0 3px ${s.ring}`,
        flexShrink: 0,
      }} />
      <span>{s.label}</span>
    </div>
  );
}
