import { useEffect, useRef } from 'react';

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];

export function useIdleTimeout({
  timeoutMs = 30 * 60 * 1000,
  warningMs = 60 * 1000,
  onIdle,
  onWarn,
} = {}) {
  const idleTimerRef = useRef(null);
  const warnTimerRef = useRef(null);
  const warnedRef = useRef(false);
  const onIdleRef = useRef(onIdle);
  const onWarnRef = useRef(onWarn);

  useEffect(() => { onIdleRef.current = onIdle; }, [onIdle]);
  useEffect(() => { onWarnRef.current = onWarn; }, [onWarn]);

  useEffect(() => {
    const clearTimers = () => {
      if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
      if (warnTimerRef.current) { clearTimeout(warnTimerRef.current); warnTimerRef.current = null; }
    };

    const scheduleTimers = () => {
      clearTimers();
      const warnDelay = Math.max(0, timeoutMs - warningMs);
      warnTimerRef.current = setTimeout(() => {
        warnedRef.current = true;
        if (typeof onWarnRef.current === 'function') onWarnRef.current();
      }, warnDelay);
      idleTimerRef.current = setTimeout(() => {
        if (typeof onIdleRef.current === 'function') onIdleRef.current();
      }, timeoutMs);
    };

    const resetTimer = () => {
      if (document.visibilityState === 'hidden') return;
      warnedRef.current = false;
      scheduleTimers();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        clearTimers();
      } else {
        resetTimer();
      }
    };

    ACTIVITY_EVENTS.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibility);

    if (document.visibilityState !== 'hidden') scheduleTimers();

    return () => {
      ACTIVITY_EVENTS.forEach(ev => window.removeEventListener(ev, resetTimer));
      document.removeEventListener('visibilitychange', handleVisibility);
      clearTimers();
    };
  }, [timeoutMs, warningMs]);
}

export default useIdleTimeout;
