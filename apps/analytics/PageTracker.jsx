import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const VISITOR_KEY = 'sgcoffee_visitor_id';
const SESSION_KEY = 'sgcoffee_session';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function getOrCreateVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getOrCreateSessionId() {
  const now = Date.now();
  let session = null;
  try {
    session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    // Recover from invalid stored data.
  }

  if (!session?.id || !session?.lastActivity || now - session.lastActivity > SESSION_TIMEOUT_MS) {
    session = { id: crypto.randomUUID(), lastActivity: now };
  } else {
    session.lastActivity = now;
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session.id;
}

export default function PageTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === '/admin' || pathname.startsWith('/admin/')) return;

    const payload = {
      visitorId: getOrCreateVisitorId(),
      sessionId: getOrCreateSessionId(),
      pagePath: pathname,
    };

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).then((response) => {
      if (!response.ok) console.warn('Analytics tracking failed:', response.status);
    }).catch((error) => console.warn('Analytics tracking failed:', error));
  }, [pathname]);

  return null;
}
