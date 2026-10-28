// Read JSON from the same-origin API and report proxy configuration failures clearly.
export async function adminRequest(path, options = {}) {
  const response = await fetch(`/api/admin/${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Request': '1', ...options.headers },
    credentials: 'same-origin',
  });
  if (!response.ok) {
    let detail = '';
    if (response.headers.get('content-type')?.includes('application/json')) {
      const body = await response.json().catch(() => null);
      detail = body?.error || body?.detail || body?.title || '';
    }
    throw new Error(`API ${response.status}${detail ? `: ${detail}` : ''}`);
  }
  if (response.status === 204) return null;
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('API trả HTML hoặc nội dung không phải JSON. Kiểm tra proxy /api và API_GATEWAY_URL trên Railway.');
  }
  return response.json();
}
export const adminJson = (method, body) => ({ method, body: JSON.stringify(body) });
