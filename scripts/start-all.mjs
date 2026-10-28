import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { createWebServer } from './web-server.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const definitions = [['catalog', 'SGCoffee.Catalog', 5101], ['analytics', 'SGCoffee.Analytics', 5105],
  ['submission', 'SGCoffee.Submission', 5104], ['gateway', 'SGCoffee.Gateway', 5100]];

// Keep all backend ports inside one container and use Railway PORT only for the frontend.
export function servicePlan(environment = process.env, servicesRoot = resolve(root, 'services'), portOffset = 0) {
  if (!Number.isInteger(portOffset) || portOffset < 0 || portOffset > 60000) throw new Error('Invalid internal port offset');
  return definitions.map(([name, assembly, basePort]) => {
    const port = basePort + portOffset;
    const env = { ...environment, PORT: String(port), ASPNETCORE_ENVIRONMENT: 'Production' };
    if (name === 'gateway') {
      env.Admin__Enabled = environment.Admin__Enabled ?? 'true';
      for (const [service, target] of [['catalog', 5101], ['analytics', 5105], ['submission', 5104]])
        env[`ReverseProxy__Clusters__${service}__Destinations__d1__Address`] = `http://127.0.0.1:${target + portOffset}`;
    }
    return { name, port, env, cwd: resolve(servicesRoot, name), dll: resolve(servicesRoot, name, `${assembly}.dll`) };
  });
}

export async function healthy(port) {
  try { return (await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(2000) })).ok; }
  catch { return false; }
}

// Stop the entire container if a backend fails so Railway can restart a complete application.
export async function startAll(environment = process.env, servicesRoot = resolve(root, 'services'), portOffset = 0) {
  for (const key of ['Gateway__SharedKey', 'ConnectionStrings__Supabase'])
    if (!environment[key]?.trim()) throw new Error(`Missing required runtime variable: ${key}`);
  const publicPort = Number(environment.PORT || 8080);
  const plan = servicePlan(environment, servicesRoot, portOffset);
  if (!Number.isInteger(publicPort) || publicPort < 1 || publicPort > 65535 || plan.some(service => service.port === publicPort))
    throw new Error('PORT must be a valid public port different from 5100, 5101, 5104 and 5105');
  const children = [];
  let stopping = false;
  let server;
  const stop = async (code, message) => {
    if (stopping) return;
    stopping = true;
    if (message) console.error(message);
    const closed = children.map(child => child.exitCode !== null || child.signalCode !== null
      ? Promise.resolve() : once(child, 'close').catch(() => {}));
    server?.close();
    server?.closeAllConnections();
    for (const child of children) if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
    await Promise.race([Promise.all(closed), delay(8000)]);
    for (const child of children) if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    process.exit(code);
  };
  process.once('SIGTERM', () => stop(0));
  process.once('SIGINT', () => stop(0));
  if (process.connected) {
    process.on('message', message => { if (message === 'shutdown') stop(0); });
    process.once('disconnect', () => stop(0));
  }
  for (const service of plan) {
    const child = spawn('dotnet', [service.dll], { cwd: service.cwd, env: service.env, stdio: 'inherit', windowsHide: true });
    children.push(child);
    child.once('error', () => stop(1, `Cannot start ${service.name}`));
    child.once('exit', () => { if (!stopping) stop(1, `${service.name} stopped unexpectedly`); });
  }
  const deadline = Date.now() + 90000;
  while (!stopping) {
    if ((await Promise.all(plan.map(service => healthy(service.port)))).every(Boolean)) break;
    if (Date.now() >= deadline) { await stop(1, 'Backend startup health checks timed out'); return; }
    await delay(500);
  }
  if (stopping) return;
  server = createWebServer({ gatewayUrl: `http://127.0.0.1:${5100 + portOffset}`, edgeSecret: environment.Gateway__EdgeSecret || '',
    healthCheck: async () => (await Promise.all(plan.map(service => healthy(service.port)))).every(Boolean) });
  server.once('error', () => stop(1, 'Cannot start frontend listener'));
  server.listen(publicPort, '0.0.0.0', () => console.log('SGCoffee frontend and four backend services are ready'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  startAll().catch(error => { console.error(error.message); process.exitCode = 1; });
}
