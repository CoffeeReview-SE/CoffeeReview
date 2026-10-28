import React, { useEffect, useState } from 'react';
import { adminRequest, adminJson } from './adminApi.js';

export default function AdminAccess({ children }) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    adminRequest('auth/session').then(() => { if (active) setStatus('ready'); })
      .catch(() => { if (active) setStatus('login'); });
    const expired = () => setStatus('login');
    window.addEventListener('admin-session-expired', expired);
    return () => { active = false; window.removeEventListener('admin-session-expired', expired); };
  }, []);
  const login = async event => {
    event.preventDefault(); setError(''); setBusy(true);
    const fields = new FormData(event.currentTarget);
    try {
      await adminRequest('auth/login', adminJson('POST', { username: fields.get('username'), password: fields.get('password') }));
      setStatus('ready');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const logout = async () => {
    try { await adminRequest('auth/logout', adminJson('POST', {})); setStatus('login'); }
    catch (err) { setError(err.message); }
  };
  if (status === 'ready') return <>{children}<div style={{ position: 'fixed', bottom: 12, left: 14, zIndex: 20 }}><button onClick={logout}>Đăng xuất</button>{error && <p role="alert">{error}</p>}</div></>;
  return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#FBF8F4', color: '#4B2817' }}>
    {status === 'loading' ? <p role="status">Đang kiểm tra phiên đăng nhập…</p> :
      <form onSubmit={login} style={{ display: 'grid', gap: 16, padding: 32, width: 'min(420px, 95vw)', background: '#fff', borderRadius: 16 }}>
        <h1>Quản trị SGCoffee</h1>
        <label>Tài khoản<input name="username" autoComplete="username" required style={{ display: 'block', width: '100%', padding: 10 }} /></label>
        <label>Mật khẩu<input name="password" type="password" autoComplete="current-password" maxLength={1024} required style={{ display: 'block', width: '100%', padding: 10 }} /></label>
        {error && <p role="alert">{error}</p>}
        <button disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
      </form>}
  </main>;
}
