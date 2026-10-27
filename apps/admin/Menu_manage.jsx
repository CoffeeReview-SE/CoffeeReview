import React, { useState } from 'react';

/* Danh mục điều hướng - Đồng bộ với AdminDashboard & BranchManagement */
const NAV = [
  ['dashboard', 'Dashboard', 'home'],
  ['brands', 'Quản lý thương hiệu', 'store'],
  ['branches', 'Quản lý chi nhánh', 'pin'],
  ['menu', 'Quản lý thực đơn', 'menu'],
  ['suggestions', 'Quản lý đề xuất', 'bulb'],
  ['approvals', 'Duyệt đề xuất', 'check'],
];

/* KPIs cho Quản lý thực đơn */
const menuStats = [
  { icon: 'menu', label: 'Tổng số món ăn/uống', value: '1,248', delta: 8 },
  { icon: 'store', label: 'Thương hiệu sở hữu', value: '28', delta: 3 },
  { icon: 'audio', label: 'Món có thuyết minh audio', value: '982', delta: 12 },
  { icon: 'bulb', label: 'Món mới chờ duyệt', value: '15', delta: -4 },
];

/* Danh sách món ăn mẫu */
const INITIAL_MENU = [
  {
    id: 1,
    name: 'Cà Phê Sữa Đá',
    brand: 'The Coffee House',
    brandColor: '#4A2C1E',
    category: 'Cà Phê',
    price: 39000,
    orders: 12450,
    audioStatus: 'Đã có audio',
    status: 'Đang kinh doanh',
  },
  {
    id: 2,
    name: 'Trà Sen Vàng',
    brand: 'Highlands Coffee',
    brandColor: '#B3282D',
    category: 'Trà Trái Cây',
    price: 45000,
    orders: 18920,
    audioStatus: 'Đã có audio',
    status: 'Đang kinh doanh',
  },
  {
    id: 3,
    name: 'Trà Đào Cam Sả',
    brand: 'The Coffee House',
    brandColor: '#4A2C1E',
    category: 'Trà Trái Cây',
    price: 49000,
    orders: 15300,
    audioStatus: 'Đã có audio',
    status: 'Đang kinh doanh',
  },
  {
    id: 4,
    name: 'Trà Sữa Phúc Long',
    brand: 'Phúc Long',
    brandColor: '#1F6B45',
    category: 'Trà Sữa',
    price: 55000,
    orders: 21400,
    audioStatus: 'Chờ cập nhật',
    status: 'Đang kinh doanh',
  },
  {
    id: 5,
    name: 'Bạc Xỉu Sài Gòn',
    brand: 'Cộng Cà Phê',
    brandColor: '#6F7B3F',
    category: 'Cà Phê',
    price: 35000,
    orders: 8720,
    audioStatus: 'Đã có audio',
    status: 'Đang kinh doanh',
  },
  {
    id: 6,
    name: 'Caramel Macchiato',
    brand: 'Starbucks',
    brandColor: '#00704A',
    category: 'Cà Phê Ý',
    price: 75000,
    orders: 6410,
    audioStatus: 'Chờ cập nhật',
    status: 'Tạm ngưng',
  },
];

const fmt = (n) => n.toLocaleString('en-US');

/* Hệ thống Icons SVG đồng bộ từ AdminDashboard */
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
  menu: <path d="M5 3v8a2 2 0 0 0 2 2v8M9 3v8a2 2 0 0 1-2 2M17 21V3c-2 1-3 4-3 8h3" />,
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
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

export default function MenuManagement({ onNavigate }) {
  const [menuList, setMenuList] = useState(INITIAL_MENU);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const go = (key) => {
    if (onNavigate) {
      onNavigate(key);
    } else {
      window.alert(`Chuyển sang trang: ${key}`);
    }
  };

  const filteredMenu = menuList.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = brandFilter === 'All' || item.brand === brandFilter;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesBrand && matchesCategory;
  });

  const handleAddItem = () => {
    window.alert('Mở form thêm món mới vào thực đơn (Tính năng kết nối API sau).');
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Bạn có chắc muốn xóa món "${name}" khỏi thực đơn?`)) {
      setMenuList(menuList.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="ad">
      <style>{css}</style>

      {/* Navigation Sidebar */}
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
              aria-current={key === 'menu' ? 'page' : undefined}
              onClick={() => key !== 'menu' && go(key)}
            >
              <Icon n={icon} size={17} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="ad-main">
        <header className="ad-head">
          <div>
            <h1>Quản lý thực đơn</h1>
            <p className="ad-sub">Danh sách món ăn, thức uống, giá bán và thuyết minh audio</p>
          </div>
          <div className="ad-tools">
            <button className="ad-btn-primary" onClick={handleAddItem}>
              <Icon n="plus" size={16} /> Thêm món mới
            </button>
          </div>
        </header>

        {/* KPIs */}
        <section className="ad-kpis" aria-label="Chỉ số thực đơn">
          {menuStats.map((s) => (
            <article key={s.label} className="ad-kpi">
              <span className="ad-ico">
                <Icon n={s.icon} size={22} />
              </span>
              <div>
                <p>{s.label}</p>
                <strong>{s.value}</strong>
                <small className={s.delta >= 0 ? 'up' : 'down'}>
                  {s.delta >= 0 ? '↑' : '↓'} {Math.abs(s.delta)}% <em>so với tháng trước</em>
                </small>
              </div>
            </article>
          ))}
        </section>

        {/* Tìm kiếm & Bộ lọc */}
        <section className="ad-panel ad-filter-bar" style={{ marginTop: '14px' }}>
          <div className="ad-search-box">
            <Icon n="search" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm tên món ăn, thức uống..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="ad-filter-group">
            <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
              <option value="All">Tất cả thương hiệu</option>
              <option value="The Coffee House">The Coffee House</option>
              <option value="Phúc Long">Phúc Long</option>
              <option value="Highlands Coffee">Highlands Coffee</option>
              <option value="Cộng Cà Phê">Cộng Cà Phê</option>
              <option value="Starbucks">Starbucks</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">Tất cả danh mục</option>
              <option value="Cà Phê">Cà Phê</option>
              <option value="Trà Trái Cây">Trà Trái Cây</option>
              <option value="Trà Sữa">Trà Sữa</option>
              <option value="Cà Phê Ý">Cà Phê Ý</option>
            </select>
          </div>
        </section>

        {/* Bảng thực đơn */}
        <section className="ad-panel" style={{ marginTop: '14px' }}>
          <div className="ad-scroll">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Món ăn / Thức uống</th>
                  <th>Thương hiệu</th>
                  <th>Danh mục</th>
                  <th>Giá bán</th>
                  <th>Lượt gọi món</th>
                  <th>Audio</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMenu.length > 0 ? (
                  filteredMenu.map((item, i) => (
                    <tr key={item.id}>
                      <td>{i + 1}</td>
                      <td>
                        <b>{item.name}</b>
                      </td>
                      <td>
                        <span className="ad-who">
                          <i style={{ background: item.brandColor }}>{item.brand[0]}</i>
                          {item.brand}
                        </span>
                      </td>
                      <td>
                        <span className="ad-cat-tag">{item.category}</span>
                      </td>
                      <td>
                        <b>{fmt(item.price)} đ</b>
                      </td>
                      <td>{fmt(item.orders)}</td>
                      <td>
                        <span
                          className={`ad-badge ${item.audioStatus === 'Đã có audio' ? 'ok' : 'wait'}`}
                        >
                          {item.audioStatus}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`ad-badge ${item.status === 'Đang kinh doanh' ? 'ok' : 'no'}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="ad-actions">
                          <button
                            title="Xem chi tiết"
                            onClick={() => window.alert(`Xem món: ${item.name}`)}
                          >
                            <Icon n="eye" size={15} />
                          </button>
                          <button
                            title="Chỉnh sửa"
                            onClick={() => window.alert(`Chỉnh sửa món: ${item.name}`)}
                          >
                            <Icon n="edit" size={15} />
                          </button>
                          <button
                            title="Xóa"
                            className="danger"
                            onClick={() => handleDelete(item.id, item.name)}
                          >
                            <Icon n="trash" size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}
                    >
                      Không tìm thấy món phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

/* Style CSS dùng chung từ AdminDashboard */
const css = `
.ad{--brown:#4B2817;--brown-3:#6B3A22;--accent:#C8672B;--ink:#2A1810;--muted:#8B7A6C;--line:#EFE5DA;display:grid;grid-template-columns:240px minmax(0,1fr);grid-template-rows:1fr;grid-template-areas:"side main";min-height:100vh;background:linear-gradient(180deg,#4B2817,#38190D);color:var(--ink);font-family:Inter,system-ui,"Segoe UI",sans-serif}
.ad *{box-sizing:border-box}
.ad :where(button){font:inherit}
.ad button:focus-visible{outline:2px solid #E9A24B;outline-offset:2px}

.ad-side{grid-area:side;padding:14px 14px 24px;color:#fff}
.ad-brand{display:flex;align-items:center;gap:10px;padding:2px 6px 22px}
.ad-brand b{display:block;font-size:16px;line-height:1.15}
.ad-brand small{display:block;margin-top:2px;font-size:10px;opacity:.65}
.ad-nav button{display:flex;align-items:center;gap:11px;width:100%;margin-bottom:6px;padding:12px;border:0;border-radius:10px;background:transparent;color:rgba(255,255,255,.82);font-size:13px;text-align:left;cursor:pointer}
.ad-nav button:hover{background:rgba(255,255,255,.07);color:#fff}
.ad-nav button[aria-current=page]{background:linear-gradient(90deg,#7A4A2E,#6A3C26);color:#fff;font-weight:600;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}

.ad-main{grid-area:main;min-width:0;padding:24px clamp(16px,2.4vw,32px) 40px;border-top-left-radius:18px;background:#FBF8F4}
.ad-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px}
.ad-head h1{margin:0;font-size:24px;font-weight:700}
.ad-sub{margin:4px 0 0;font-size:13px;color:var(--muted)}
.ad-tools{display:flex;gap:10px}

.ad-btn-primary{display:flex;align-items:center;gap:8px;height:38px;padding:0 16px;border:0;border-radius:10px;background:var(--accent);color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:background .2s}
.ad-btn-primary:hover{background:#B25720}

.ad-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px}
.ad-kpi{display:flex;align-items:center;gap:12px;padding:16px;border:1px solid var(--line);border-radius:12px;background:#fff}
.ad-ico{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:12px;background:#FBEAD7;color:var(--brown)}
.ad-kpi p{margin:0 0 3px;color:var(--muted);font-size:12px}
.ad-kpi strong{display:block;font-size:22px;font-weight:700;line-height:1.15}
.ad-kpi small{display:block;margin-top:5px;font-size:10.5px;font-weight:600}
.ad-kpi small em{color:var(--muted);font-style:normal;font-weight:400}
.up{color:#2E9B55}.down{color:#D2402F}

.ad-panel{min-width:0;padding:18px;border:1px solid var(--line);border-radius:12px;background:#fff}
.ad-filter-bar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between}
.ad-search-box{display:flex;align-items:center;gap:8px;padding:0 12px;height:38px;border:1px solid var(--line);border-radius:8px;background:#FAF5EF;flex:1;min-width:220px}
.ad-search-box input{border:0;background:transparent;outline:none;width:100%;font-size:13px;color:var(--ink)}
.ad-filter-group{display:flex;gap:10px;flex-wrap:wrap}
.ad-filter-group select{height:38px;padding:0 12px;border:1px solid var(--line);border-radius:8px;background:#FAF5EF;color:var(--ink);font-size:13px;outline:none;cursor:pointer}

.ad-scroll{overflow-x:auto}
.ad table{width:100%;min-width:750px;border-collapse:collapse;font-size:12.5px;text-align:left}
.ad th{padding:10px;background:#FAF5EF;color:var(--muted);font-size:11.5px;font-weight:600;white-space:nowrap}
.ad td{padding:11px 10px;border-bottom:1px solid #F3ECE3}
.ad tr:last-child td{border:0}

.ad-who{display:flex;align-items:center;gap:8px;white-space:nowrap}
.ad-who i{display:grid;place-items:center;flex:none;width:22px;height:22px;border-radius:50%;color:#fff;font-size:10px;font-style:normal;font-weight:700}
.ad-cat-tag{display:inline-block;padding:3px 8px;border-radius:6px;background:#F3ECE3;color:var(--brown-3);font-size:11px;font-weight:500}

.ad-badge{display:inline-block;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:600;white-space:nowrap}
.ad-badge.ok{background:#E1F3E5;color:#2D7D46}
.ad-badge.wait{background:#FDEBD3;color:#B25E14}
.ad-badge.no{background:#FDE4E1;color:#C0392B}

.ad-actions{display:flex;gap:6px;justify-content:flex-end}
.ad-actions button{display:grid;place-items:center;width:30px;height:30px;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--brown-3);cursor:pointer}
.ad-actions button:hover{background:#FAF5EF}
.ad-actions button.danger{color:#C0392B}
.ad-actions button.danger:hover{background:#FDE4E1}

@media (max-width:900px){
  .ad{grid-template-columns:minmax(0,1fr);grid-template-rows:auto 1fr;grid-template-areas:"side" "main"}
  .ad-side{padding:12px 12px 4px}
  .ad-brand{padding-bottom:12px}
  .ad-nav{display:flex;gap:6px;overflow-x:auto}
  .ad-nav button{width:auto;margin:0;white-space:nowrap}
  .ad-main{border-radius:18px 18px 0 0}
}
`;
