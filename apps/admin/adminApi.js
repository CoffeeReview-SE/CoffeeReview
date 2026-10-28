// Keep API same-origin in production; configure Railway reverse proxy for /api.
export async function adminRequest(path, options = {}) {
  const response = await fetch(`/api/admin/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Request': '1', ...options.headers },
    credentials: 'same-origin',
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`API ${response.status}${detail ? `: ${detail.slice(0, 160)}` : ''}`);
  }
  if (response.status === 204) return null;
  return response.json();
}
export const adminJson = (method, body) => ({ method, body: JSON.stringify(body) });
