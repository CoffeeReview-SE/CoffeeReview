const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { webcrypto } = require('node:crypto');
const source = fs.readFileSync('apps/analytics/tracking.js', 'utf8').replaceAll('export ', '');

function tab(responses = []) {
  const requests = [], beacons = [];
  const context = vm.createContext({
    crypto: webcrypto, AbortSignal, Blob,
    localStorage: { getItem: () => 'd9d78d59-50c2-4b90-834b-91b05c032b73', setItem() {} },
    navigator: { sendBeacon: (url, body) => { beacons.push({ url, body }); return true; } },
    fetch: async (url, options) => {
      requests.push({ url, body: JSON.parse(options.body) });
      const status = responses.shift() ?? 200;
      return { status, ok: status >= 200 && status < 300 };
    },
    setTimeout: callback => { callback(); },
  });
  vm.runInContext(source, context);
  return { requests, beacons, run: code => vm.runInContext(code, context) };
}

test('duplicated documents keep visitor identity but have distinct sessions', async () => {
  const a = tab(), b = tab();
  await a.run("trackPage('/brands', 'a')"); await b.run("trackPage('/brands', 'a')");
  assert.equal(a.requests[0].body.visitorId, b.requests[0].body.visitorId);
  assert.notEqual(a.requests[0].body.sessionId, b.requests[0].body.sessionId);
});
test('effect replay is deduplicated while separate navigations count', async () => {
  const a = tab();
  await a.run("trackPage('/brands', 'a')"); await a.run("trackPage('/brands', 'a')");
  await a.run("trackPage('/brands', 'b')");
  assert.equal(a.requests.length, 2);
  assert.notEqual(a.requests[0].body.eventId, a.requests[1].body.eventId);
});
test('transient retry preserves page event ID', async () => {
  const a = tab([503, 200]); await a.run("trackPage('/', 'a')");
  assert.equal(a.requests.length, 2);
  assert.deepEqual(a.requests[0].body, a.requests[1].body);
});
test('end sends beacon, stops heartbeats and restore creates a fresh session', async () => {
  const a = tab(); await a.run("trackPage('/', 'a')");
  a.run('endSession()'); await a.run('heartbeat()');
  assert.equal(a.beacons.length, 1); assert.equal(a.requests.length, 1);
  await a.run("trackPage('/', 'restore')");
  assert.notEqual(a.requests[0].body.sessionId, a.requests[1].body.sessionId);
});
test('admin navigation ends public session without tracking admin pages', async () => {
  const a = tab(); await a.run("trackPage('/', 'a')");
  await a.run("trackPage('/admin', 'b')"); await a.run('heartbeat()');
  assert.equal(a.requests.length, 1); assert.equal(a.beacons.length, 1);
});
test('audio waits for page tracking and keeps explicit brand and language', async () => {
  const a = tab(); a.run("trackPage('/brand/2', 'a')");
  await a.run("trackAudio({brandId: 2, languageCode: 'vi', eventId: crypto.randomUUID()})");
  assert.equal(a.requests[0].url, '/api/analytics/track');
  assert.equal(a.requests[1].url, '/api/analytics/audio-play');
  assert.equal(a.requests[1].body.sessionId, a.requests[0].body.sessionId);
  assert.equal(a.requests[1].body.languageCode, 'vi');
});
