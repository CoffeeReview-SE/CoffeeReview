import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPage, heartbeat, endSession } from './tracking.js';

export default function PageTracker() {
  const { pathname, key } = useLocation();
  useEffect(() => { trackPage(pathname, key); }, [pathname, key]);
  useEffect(() => {
    const timer = setInterval(heartbeat, 15000);
    const resume = event => { if (event.persisted) trackPage(window.location.pathname, crypto.randomUUID()); };
    const visible = () => { if (document.visibilityState === 'visible') heartbeat(); };
    window.addEventListener('pagehide', endSession);
    window.addEventListener('pageshow', resume);
    window.addEventListener('online', heartbeat);
    document.addEventListener('visibilitychange', visible);
    return () => {
      clearInterval(timer);
      window.removeEventListener('pagehide', endSession);
      window.removeEventListener('pageshow', resume);
      window.removeEventListener('online', heartbeat);
      document.removeEventListener('visibilitychange', visible);
    };
  }, []);
  return null;
}
