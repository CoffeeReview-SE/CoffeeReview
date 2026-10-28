import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';

// Exercise the actual multi-process launcher without creating tracking or audio records.
const port = process.env.SMOKE_PORT || '28080';
const code = `import { startAll } from './scripts/start-all.mjs'; startAll(process.env, '${resolve('.tmp/single-service/services').replaceAll('\\', '/')}', 20000).catch(e => { console.error(e.message); process.exitCode = 1; });`;
const child = spawn(process.execPath, ['--input-type=module', '--eval', code], {
  cwd: process.cwd(), env: { ...process.env, PORT: port }, stdio: ['ignore', 'ignore', 'ignore', 'ipc'], windowsHide: true,
});
try {
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error('Launcher exited before ready');
    try { ready = (await fetch(`${base}/health`, { signal: AbortSignal.timeout(2000) })).ok; } catch { }
    if (ready) break;
    await delay(300);
  }
  assert.ok(ready, 'all four backends and frontend become ready');
  for (const path of ['/api/admin/analytics/summary', '/api/admin/catalog/brands', '/api/admin/submissions']) {
    const response = await fetch(base + path, { signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 200, `${path} returns real backend data`);
    await response.json();
    console.log(`PASS ${path}`);
  }
  assert.match(await (await fetch(`${base}/admin`)).text(), /<html/);
  console.log('PASS single-service frontend, health and real Supabase read APIs');
} finally {
  // Ask the supervisor to stop its children before terminating the test process.
  if (child.exitCode === null) {
    child.send('shutdown');
    await Promise.race([once(child, 'exit'), delay(10000)]);
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
  }
}
