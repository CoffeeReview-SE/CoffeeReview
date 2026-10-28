import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, sep } from 'node:path';
import { createWebServer } from '../../scripts/web-server.mjs';

async function listen(server, t) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return `http://127.0.0.1:${server.address().port}`;
}

test('SPA routes serve HTML while unconfigured APIs return JSON 503', async t => {
  const directory = await mkdtemp(resolve(tmpdir(), 'sgcoffee-web-test-'));
  t.after(async () => {
    assert.ok(directory.startsWith(resolve(tmpdir()) + sep));
    await rm(directory, { recursive: true, force: true });
  });
  await writeFile(resolve(directory, 'index.html'), '<!doctype html><h1>SGCoffee</h1>');
  const url = await listen(createWebServer({ distDir: directory, gatewayUrl: '' }), t);
  assert.match(await (await fetch(`${url}/admin`)).text(), /SGCoffee/);
  const api = await fetch(`${url}/api/admin/analytics/summary`);
  assert.equal(api.status, 503);
  assert.match(api.headers.get('content-type'), /application\/json/);
  assert.match((await api.json()).error, /API_GATEWAY_URL/);
  assert.equal((await fetch(`${url}/missing.js`)).status, 404);
});

test('proxy preserves API path, query and POST body and strips spoofed internal keys', async t => {
  const gateway = await listen(http.createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ path: req.url, body, method: req.method, key: req.headers['x-gateway-key'] || null,
      edge: req.headers['x-edge-secret'], adminHeader: req.headers['x-admin-request'] }));
  }), t);
  const url = await listen(createWebServer({ gatewayUrl: gateway, edgeSecret: 'server-only-edge' }), t);
  const response = await fetch(`${url}/api/admin/catalog/brands?q=coffee`, { method: 'POST', headers: {
    'Content-Type': 'application/json', 'X-Admin-Request': '1', 'X-Gateway-Key': 'spoofed', 'X-Edge-Secret': 'spoofed',
  }, body: '{"name":"coffee"}' });
  assert.deepEqual(await response.json(), { path: '/api/admin/catalog/brands?q=coffee', body: '{"name":"coffee"}', method: 'POST', key: null, edge: 'server-only-edge', adminHeader: '1' });
});

test('proxy preserves backend error codes and 204 responses', async t => {
  const gateway = await listen(http.createServer((req, res) => {
    if (req.url === '/api/end') { res.writeHead(204); res.end(); return; }
    res.writeHead(404, { 'Content-Type': 'application/json' }); res.end('{"error":"not found"}');
  }), t);
  const url = await listen(createWebServer({ gatewayUrl: gateway }), t);
  const missing = await fetch(`${url}/api/missing`);
  assert.equal(missing.status, 404); assert.equal((await missing.json()).error, 'not found');
  const ended = await fetch(`${url}/api/end`, { method: 'POST' });
  assert.equal(ended.status, 204); assert.equal(await ended.text(), '');
});

test('a wrong upstream returning HTML produces a diagnostic JSON error', async t => {
  const gateway = await listen(http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html>');
  }), t);
  const url = await listen(createWebServer({ gatewayUrl: gateway }), t);
  const response = await fetch(`${url}/api/admin/analytics/summary`);
  assert.equal(response.status, 502); assert.match((await response.json()).error, /HTML/);
});

test('unreachable gateway produces JSON 502 instead of a frontend document', async t => {
  const url = await listen(createWebServer({ gatewayUrl: 'http://127.0.0.1:1' }), t);
  const response = await fetch(`${url}/api/admin/analytics/summary`);
  assert.equal(response.status, 502); assert.match((await response.json()).error, /Gateway/);
});

test('gateway configuration rejects credentials and API path suffixes', () => {
  assert.throws(() => createWebServer({ gatewayUrl: 'https://name:password@example.com' }));
  assert.throws(() => createWebServer({ gatewayUrl: 'https://example.com/api' }));
});

test('container health endpoint reflects backend readiness', async t => {
  let ready = true;
  const url = await listen(createWebServer({ healthCheck: async () => ready }), t);
  assert.equal((await fetch(`${url}/health`)).status, 200);
  ready = false;
  const unhealthy = await fetch(`${url}/health`);
  assert.equal(unhealthy.status, 503);
  assert.equal((await unhealthy.json()).status, 'unavailable');
});
