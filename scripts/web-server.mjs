import http from 'node:http';
import https from 'node:https';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };

function json(response, status, error) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify({ error }));
}

function cleanHeaders(headers) {
  const result = { ...headers };
  const nominated = String(headers.connection || '').split(',').map(value => value.trim().toLowerCase());
  for (const header of ['connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailer', 'transfer-encoding', 'upgrade', ...nominated]) delete result[header];
  return result;
}

// Serve the React build and proxy same-origin API requests to the backend Gateway.
export function createWebServer({ distDir = root, gatewayUrl = process.env.API_GATEWAY_URL || '', edgeSecret = process.env.API_EDGE_SECRET || '' } = {}) {
  const directory = resolve(distDir);
  let gateway;
  if (gatewayUrl) {
    gateway = new URL(gatewayUrl);
    if (!['http:', 'https:'].includes(gateway.protocol) || gateway.username || gateway.password || gateway.pathname !== '/' || gateway.search || gateway.hash)
      throw new Error('API_GATEWAY_URL must be an HTTP(S) Gateway origin without credentials or path');
  }
  return http.createServer(async (request, response) => {
    const rawPath = (request.url || '/').split('?')[0];
    if (rawPath === '/api' || rawPath.startsWith('/api/')) {
      if (!gateway) { json(response, 503, 'Chưa cấu hình API_GATEWAY_URL trên service frontend Railway.'); return; }
      const headers = cleanHeaders(request.headers);
      for (const name of ['x-gateway-key', 'x-edge-secret', 'forwarded', 'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto']) delete headers[name];
      headers.host = gateway.host;
      if (edgeSecret) headers['x-edge-secret'] = edgeSecret;
      const transport = gateway.protocol === 'https:' ? https : http;
      const upstream = transport.request({ protocol: gateway.protocol, hostname: gateway.hostname.replace(/^\[|\]$/g, ''), port: gateway.port || undefined, method: request.method, path: request.url, headers }, incoming => {
        if (String(incoming.headers['content-type']).includes('text/html')) {
          incoming.resume();
          json(response, 502, 'Gateway trả HTML thay vì API. Kiểm tra API_GATEWAY_URL có trỏ đúng backend Gateway.');
          return;
        }
        response.writeHead(incoming.statusCode || 502, cleanHeaders(incoming.headers));
        incoming.pipe(response);
        incoming.on('error', () => response.destroy());
      });
      upstream.setTimeout(15000, () => upstream.destroy(new Error('Gateway timeout')));
      upstream.on('error', () => {
        if (!response.headersSent) json(response, 502, 'Không kết nối được Gateway. Kiểm tra backend và API_GATEWAY_URL trên Railway.');
        else response.destroy();
      });
      request.on('aborted', () => upstream.destroy());
      response.on('close', () => { if (!response.writableFinished) upstream.destroy(); });
      request.pipe(upstream);
      return;
    }
    if (!['GET', 'HEAD'].includes(request.method)) { json(response, 405, 'Method not allowed'); return; }
    try {
      const decoded = decodeURIComponent(rawPath);
      let file = resolve(directory, `.${decoded}`);
      if (file !== directory && !file.startsWith(directory + sep)) { json(response, 403, 'Forbidden'); return; }
      let info = await stat(file).catch(() => null);
      if (!info?.isFile()) {
        if (extname(decoded)) { json(response, 404, 'File not found'); return; }
        file = resolve(directory, 'index.html');
        info = await stat(file);
      }
      response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Length': info.size,
        'Cache-Control': file.includes(`${sep}assets${sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache' });
      if (request.method === 'HEAD') response.end();
      else createReadStream(file).on('error', () => response.destroy()).pipe(response);
    } catch {
      json(response, 404, 'Frontend build unavailable. Run npm run build before npm start.');
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const server = createWebServer();
  server.listen(Number(process.env.PORT || 8080), '0.0.0.0', () => console.log('SGCoffee web server started'));
}
