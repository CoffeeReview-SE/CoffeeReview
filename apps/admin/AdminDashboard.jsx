import React, { useEffect, useState } from 'react';
import { adminRequest } from './adminApi.js';
import './AdminDashboard.css';

const NAV = [['dashboard', 'Dashboard'], ['brands', 'Quản lý thương hiệu'], ['branches', 'Quản lý chi nhánh'], ['suggestions', 'Quản lý đề xuất'], ['approvals', 'Duyệt đề xuất']];
const fmt = value => value.toLocaleString('vi-VN');
const date = value => new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

function AudioTable({ title, label, rows }) {
  return <section className="ad-panel"><h2>{title}</h2><div className="ad-scroll"><table>
    <thead><tr><th>{label}</th><th>Lượt nghe</th></tr></thead>
    <tbody>{rows.length ? rows.map((row, i) => <tr key={row.code || `${row.name}-${i}`}><td>{row.name}</td><td>{fmt(row.plays)}</td></tr>)
      : <tr><td colSpan={2}>Chưa có lượt nghe audio.</td></tr>}</tbody>
  </table></div></section>;
}

export default function AdminDashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let timer;
    const load = async () => {
      try {
        const result = await adminRequest('analytics/summary', { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) });
        if (!['sessions', 'active', 'inactive', 'visitors', 'pageViews', 'audioPlays'].every(key => Number.isFinite(result[key])) ||
            !['audioByBrand', 'audioByLanguage', 'recentSessions'].every(key => Array.isArray(result[key])))
          throw new Error('Dữ liệu Analytics không hợp lệ.');
        if (!controller.signal.aborted) { setData(result); setError(''); }
      } catch (err) {
        if (!controller.signal.aborted) setError(`Không tải được thống kê: ${err.message}`);
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(load, 10000);
      }
    };
    load();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [refresh]);
  const stats = data && [
    ['Tổng lượt truy cập / phiên', data.sessions], ['Active', data.active, true],
    ['Inactive', data.inactive, false], ['Tổng lượt nghe audio', data.audioPlays],
    ['Khách duy nhất', data.visitors], ['Lượt xem trang', data.pageViews],
  ];
  return <div className="ad">
    <aside className="ad-side"><div className="ad-brand"><span><b>SaigonCoffee</b><small>Quản trị hệ thống</small></span></div>
      <nav className="ad-nav" aria-label="Menu quản trị">{NAV.map(([key, label]) => <button key={key} aria-current={key === 'dashboard' ? 'page' : undefined} onClick={() => onNavigate?.(key)}>{label}</button>)}</nav>
    </aside>
    <main className="ad-main"><header className="ad-head"><h1>Dashboard</h1><button className="ad-range" onClick={() => setRefresh(value => value + 1)}>Làm mới</button></header>
      <p>Toàn bộ thời gian · Tự cập nhật sau mỗi 10 giây · Giờ Việt Nam</p>
      {error && <p role="alert" style={{ color: '#B42318' }}>{error}{data && ' Các số liệu bên dưới là dữ liệu lần tải thành công gần nhất.'}</p>}
      {!data && !error && <p role="status">Đang tải thống kê…</p>}
      {data && <>
        <p>Cập nhật: {date(data.updatedAt)}</p>
        <section className="ad-kpis" aria-label="Chỉ số tổng quan">{stats.map(([label, value, active]) => <article key={label} className="ad-kpi"><div><p>{typeof active === 'boolean' && <StatusDot active={active} />}{label}</p><strong>{fmt(value)}</strong></div></article>)}</section>
        <div className="ad-row r2"><AudioTable title="Lượt nghe theo thương hiệu" label="Thương hiệu" rows={data.audioByBrand} /><AudioTable title="Lượt nghe theo ngôn ngữ" label="Ngôn ngữ" rows={data.audioByLanguage} /></div>
        <section className="ad-panel" style={{ marginTop: 14 }}><h2>50 phiên hoạt động gần nhất</h2><p>Active khi heartbeat trong 45 giây gần nhất và phiên chưa kết thúc.</p>
          <div className="ad-scroll"><table><thead><tr><th>Trạng thái</th><th>Bắt đầu</th><th>Hoạt động gần nhất</th></tr></thead><tbody>
            {data.recentSessions.length ? data.recentSessions.map((session, i) => <tr key={i}><td><StatusDot active={session.isActive} />{session.isActive ? 'Active' : 'Inactive'}</td><td>{date(session.startedAt)}</td><td>{date(session.lastActivityAt)}</td></tr>) : <tr><td colSpan={3}>Chưa có phiên truy cập.</td></tr>}
          </tbody></table></div>
        </section>
      </>}
    </main>
  </div>;
}

function StatusDot({ active }) {
  return <span aria-hidden="true" style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', marginRight: 8, background: active ? '#24A148' : '#98A2B3' }} />;
}
