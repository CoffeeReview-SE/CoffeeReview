let sessionId = crypto.randomUUID();
let visitorId;
let ready = Promise.resolve();
let currentPath = '/';
let enabled = false;
let ended = false;
let pageEvent;
try {
  visitorId = localStorage.getItem('sgcoffee_visitor_id');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(visitorId || '')) {
    visitorId = crypto.randomUUID();
    localStorage.setItem('sgcoffee_visitor_id', visitorId);
  }
} catch { visitorId = crypto.randomUUID(); }

// Send the same event ID on retries so a lost response cannot count twice.
async function send(endpoint, payload, retry = true) {
  for (let attempt = 0; attempt < (retry ? 3 : 1); attempt++) {
    try {
      const response = await fetch(`/api/analytics/${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), keepalive: true, signal: AbortSignal.timeout(8000),
      });
      if (response.ok || response.status < 500 && response.status !== 429) return response;
    } catch { /* Retry transient network failures with the original event ID. */ }
    if (attempt < 2 && retry) await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
  }
  return null;
}

// A fresh document gets its own session, including duplicated tabs and reloads.
export function trackPage(path, navigationKey) {
  const isPublic = path !== '/admin' && !path.startsWith('/admin/');
  if (!isPublic) { endSession(); enabled = false; return ready; }
  if (ended) { sessionId = crypto.randomUUID(); ended = false; pageEvent = null; }
  enabled = true;
  currentPath = path;
  if (pageEvent?.key === navigationKey && pageEvent?.path === path) return ready;
  pageEvent = { key: navigationKey, path, id: crypto.randomUUID() };
  const payload = { visitorId, sessionId, pagePath: path, eventId: pageEvent.id };
  ready = ready.catch(() => null).then(() => send('track', payload));
  return ready;
}

export async function heartbeat() {
  if (!enabled || ended) return;
  const id = sessionId;
  await ready;
  if (id !== sessionId || ended || !enabled) return;
  const response = await send('heartbeat', { visitorId, sessionId }, false);
  if (id !== sessionId || ended || !enabled) return;
  if (response?.status === 404) {
    pageEvent = null;
    trackPage(currentPath, crypto.randomUUID());
  }
}

export function endSession() {
  if (!enabled || ended) return;
  ended = true;
  const payload = JSON.stringify({ visitorId, sessionId });
  const url = '/api/analytics/end-session';
  let queued = false;
  try { queued = navigator.sendBeacon?.(url, new Blob([payload], { type: 'application/json' })); } catch { /* Use keepalive when beacon is unavailable. */ }
  if (!queued) fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
}

export async function trackAudio({ brandId, languageCode, eventId, branchId = null }) {
  if (!enabled || ended || !Number.isSafeInteger(brandId) || brandId <= 0 || !languageCode) return;
  const id = sessionId;
  await ready;
  if (id !== sessionId || ended) return;
  await send('audio-play', { visitorId, sessionId: id, brandId, languageCode, eventId, branchId });
}
