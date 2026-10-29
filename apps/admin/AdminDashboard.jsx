import React, { useEffect, useState } from 'react';
import { adminRequest } from './adminApi.js';
import './AdminDashboard.css';

const NAV = [
  ['dashboard', 'Dashboard', 'home'],
  ['brands', 'Quản lý thương hiệu', 'store'],
  ['branches', 'Quản lý chi nhánh', 'pin'],
  ['suggestions', 'Quản lý đề xuất', 'bulb'],
  ['approvals', 'Duyệt đề xuất', 'check'],
];

const fmt = (value) => value.toLocaleString('vi-VN');
const date = (value) => new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

const paths = {
  cup: (
    <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2M3 21h16M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4" />
  ),
  home: <path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z" />,
  store: (
    <path d="M4 9l1-5h14l1 5M4 9v11h16V9M4 9a3 3 0 0 0 5.3 2 3 3 0 0 0 5.4 0A3 3 0 0 0 20 9M10 20v-5h4v5" />
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  audio: (
    <>
      <path d="M4 9v6h4l5 4V5L8 9z" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  bulb: (
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z" />
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </>
  ),
  edit: (
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  ),
  trash: (
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  ),
  mapPin: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
};

const Icon = ({ n, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {paths[n]}
  </svg>
);

function AudioTable({ title, label, rows }) {
  return (
    <section className="ad-panel">
      <h2>{title}</h2>
      <div className="ad-scroll">
        <table>
          <thead>
            <tr>
              <th>{label}</th>
              <th>Lượt nghe</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, i) => (
                <tr key={row.code || `${row.name}-${i}`}>
                  <td>{row.name}</td>
                  <td>{fmt(row.plays)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2}>Chưa có lượt nghe audio.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
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
        const result = await adminRequest('analytics/summary', {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
        });
        if (
          !['sessions', 'active', 'inactive', 'visitors', 'pageViews', 'audioPlays'].every((key) =>
            Number.isFinite(result[key]),
          ) ||
          !['audioByBrand', 'audioByLanguage', 'recentSessions'].every((key) =>
            Array.isArray(result[key]),
          )
        )
          throw new Error('Dữ liệu Analytics không hợp lệ.');
        if (!controller.signal.aborted) {
          setData(result);
          setError('');
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(`Không tải được thống kê: ${err.message}`);
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(load, 30000);
      }
    };
    load();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [refresh]);
  const stats = data && [
    ['Tổng lượt truy cập / phiên', data.sessions],
    ['Active', data.active, true],
    ['Inactive', data.inactive, false],
    ['Tổng lượt nghe audio', data.audioPlays],
    ['Khách duy nhất', data.visitors],
    ['Lượt xem trang', data.pageViews],
  ];
  return (
    <div className="ad">
      <aside className="ad-side">
        <div className="ad-brand">
          <Icon n="cup" size={32} />
          <span>
            <b>SaigonCoffee</b>
            <small>Quản trị hệ thống</small>
          </span>
        </div>
        <nav className="ad-nav" aria-label="Menu quản trị">
          {NAV.map(([key, label, icon]) => (
            <button
              key={key}
              aria-current={key === 'dashboard' ? 'page' : undefined}
              onClick={() => onNavigate?.(key)}
            >
              <Icon n={icon} size={17} />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="ad-main">
        <header className="ad-head">
          <h1>Dashboard</h1>
          <button className="ad-range" onClick={() => setRefresh((value) => value + 1)}>
            Làm mới
          </button>
        </header>
        <p>Toàn bộ thời gian · Tự cập nhật sau mỗi 30 giây · Giờ Việt Nam</p>
        {error && (
          <p role="alert" style={{ color: '#B42318' }}>
            {error}
            {data && ' Các số liệu bên dưới là dữ liệu lần tải thành công gần nhất.'}
          </p>
        )}
        {!data && !error && <p role="status">Đang tải thống kê…</p>}
        {data && (
          <>
            <p>Cập nhật: {date(data.updatedAt)}</p>
            <section className="ad-kpis" aria-label="Chỉ số tổng quan">
              {stats.map(([label, value, active]) => (
                <article key={label} className="ad-kpi">
                  <div>
                    <p>
                      {typeof active === 'boolean' && <StatusDot active={active} />}
                      {label}
                    </p>
                    <strong>{fmt(value)}</strong>
                  </div>
                </article>
              ))}
            </section>
            <div className="ad-row r2">
              <AudioTable
                title="Lượt nghe theo thương hiệu"
                label="Thương hiệu"
                rows={data.audioByBrand}
              />
              <AudioTable
                title="Lượt nghe theo ngôn ngữ"
                label="Ngôn ngữ"
                rows={data.audioByLanguage}
              />
            </div>
            <section className="ad-panel" style={{ marginTop: 14 }}>
              <h2>50 phiên hoạt động gần nhất</h2>
              <p>Active khi heartbeat trong 45 giây gần nhất và phiên chưa kết thúc.</p>
              <div className="ad-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Trạng thái</th>
                      <th>Bắt đầu</th>
                      <th>Hoạt động gần nhất</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentSessions.length ? (
                      data.recentSessions.map((session, i) => (
                        <tr key={i}>
                          <td>
                            <StatusDot active={session.isActive} />
                            {session.isActive ? 'Active' : 'Inactive'}
                          </td>
                          <td>{date(session.startedAt)}</td>
                          <td>{date(session.lastActivityAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3}>Chưa có phiên truy cập.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function StatusDot({ active }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 9,
        height: 9,
        borderRadius: '50%',
        marginRight: 8,
        background: active ? '#24A148' : '#98A2B3',
      }}
    />
  );
}
