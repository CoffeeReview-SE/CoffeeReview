import React, { useState } from 'react';
import BrandLogo from '../BrandLogo.jsx';

/* Dữ liệu danh sách đề xuất tích hợp từ Dashboard & mở rộng */
const INITIAL_SUGGESTIONS = [
  {
    id: 1,
    title: 'Cập nhật menu Highlands Coffee - Quận 7',
    brand: 'Highlands Coffee',
    branch: 'Quận 7',
    type: 'Thực đơn',
    date: '22/04/2025',
    author: 'Nguyễn Văn A',
    status: 'Chờ duyệt',
  },
  {
    id: 2,
    title: 'Chi nhánh mới: Phúc Long - Bình Thạnh',
    brand: 'Phúc Long',
    branch: 'Bình Thạnh',
    type: 'Chi nhánh',
    date: '20/04/2025',
    author: 'Trần Thị B',
    status: 'Chờ duyệt',
  },
  {
    id: 3,
    title: 'Thêm ngôn ngữ Tiếng Hàn cho The Coffee House - Quận 1',
    brand: 'The Coffee House',
    branch: 'Quận 1',
    type: 'Audio & Ngôn ngữ',
    date: '18/04/2025',
    author: 'Lê Văn C',
    status: 'Đã duyệt',
  },
  {
    id: 4,
    title: 'Menu mới: Trà sen vàng',
    brand: 'Highlands Coffee',
    branch: 'Toàn hệ thống',
    type: 'Thực đơn',
    date: '15/04/2025',
    author: 'Nguyễn Văn A',
    status: 'Chờ duyệt',
  },
  {
    id: 5,
    title: 'Cập nhật địa chỉ Phúc Long - Quận 3',
    brand: 'Phúc Long',
    branch: 'Quận 3',
    type: 'Thông tin chi nhánh',
    date: '12/04/2025',
    author: 'Phạm Văn D',
    status: 'Từ chối',
  },
  {
    id: 6,
    title: 'Thêm Audio thuyết minh Starbucks - New World',
    brand: 'Starbucks',
    branch: 'Quận 1',
    type: 'Audio & Ngôn ngữ',
    date: '10/04/2025',
    author: 'Hoàng Minh E',
    status: 'Đã duyệt',
  },
  {
    id: 7,
    title: 'Cập nhật hình ảnh nhận diện Cộng Cà Phê - Hà Nội',
    brand: 'Cộng Cà Phê',
    branch: 'Hoàn Kiếm',
    type: 'Thương hiệu',
    date: '08/04/2025',
    author: 'Đỗ Thị F',
    status: 'Đã duyệt',
  },
];

const NAV = [
  ['dashboard', 'Dashboard', 'home'],
  ['brands', 'Quản lý thương hiệu', 'store'],
  ['branches', 'Quản lý chi nhánh', 'pin'],
  ['menu', 'Quản lý thực đơn', 'menu'],
  ['suggestions', 'Quản lý đề xuất', 'bulb'],
  ['approvals', 'Duyệt đề xuất', 'check'],
];

const badge = { 'Chờ duyệt': 'wait', 'Đã duyệt': 'ok', 'Từ chối': 'no' };

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
  filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

export default function SuggestionsManagement({ onNavigate }) {
  const [items, setItems] = useState(INITIAL_SUGGESTIONS);
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');

  const go = (key) => {
    if (onNavigate) {
      onNavigate(key);
    } else {
      window.alert(`Chuyển hướng liên kết tới mục ${key}`);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesStatus = filterStatus === 'Tất cả' || item.status === filterStatus;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đề xuất này?')) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="ad">
      <style>{css}</style>

      {/* Thanh điều hướng dùng chung với Admin Dashboard */}
      <aside className="ad-side">
        <div className="ad-brand">
          <BrandLogo size={36} tone="light" />
          <span>
            <b>SaigonCoffee</b>
            <small>Quản trị hệ thống</small>
          </span>
        </div>
        <nav className="ad-nav" aria-label="Menu quản trị">
          {NAV.map(([key, label, icon]) => (
            <button
              key={key}
              aria-current={key === 'suggestions' ? 'page' : undefined}
              onClick={() => go(key)}
            >
              <Icon n={icon} size={17} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Nội dung chính trang Quản lý đề xuất */}
      <main className="ad-main">
        <header className="ad-head">
          <div>
            <h1>Quản lý đề xuất</h1>
            <p className="ad-sub">
              Danh sách các đề xuất thay đổi thông tin, thực đơn và chi nhánh
            </p>
          </div>
          <div className="ad-tools">
            <button
              className="ad-btn-primary"
              onClick={() => window.alert('Mở form tạo đề xuất mới')}
            >
              <Icon n="plus" size={16} /> Tạo đề xuất mới
            </button>
          </div>
        </header>

        {/* Các thẻ tổng quan chỉ số đề xuất */}
        <section className="ad-kpis" aria-label="Chỉ số đề xuất">
          <article className="ad-kpi">
            <span className="ad-ico">
              <Icon n="bulb" size={22} />
            </span>
            <div>
              <p>Tổng số đề xuất</p>
              <strong>{items.length}</strong>
            </div>
          </article>
          <article className="ad-kpi">
            <span className="ad-ico wait-bg">
              <Icon n="bulb" size={22} />
            </span>
            <div>
              <p>Chờ duyệt</p>
              <strong>{items.filter((i) => i.status === 'Chờ duyệt').length}</strong>
            </div>
          </article>
          <article className="ad-kpi">
            <span className="ad-ico ok-bg">
              <Icon n="check" size={22} />
            </span>
            <div>
              <p>Đã duyệt</p>
              <strong>{items.filter((i) => i.status === 'Đã duyệt').length}</strong>
            </div>
          </article>
          <article className="ad-kpi">
            <span className="ad-ico no-bg">
              <Icon n="trash" size={22} />
            </span>
            <div>
              <p>Từ chối</p>
              <strong>{items.filter((i) => i.status === 'Từ chối').length}</strong>
            </div>
          </article>
        </section>

        {/* Bảng danh sách đề xuất */}
        <section className="ad-panel margin-top">
          <div className="ad-filter-bar">
            <div className="ad-search-box">
              <Icon n="search" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm đề xuất, thương hiệu, người gửi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="ad-filter-group">
              <Icon n="filter" size={15} />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Chờ duyệt">Chờ duyệt</option>
                <option value="Đã duyệt">Đã duyệt</option>
                <option value="Từ chối">Từ chối</option>
              </select>
            </div>
          </div>

          <div className="ad-scroll">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nội dung đề xuất</th>
                  <th>Phân loại</th>
                  <th>Thương hiệu / Chi nhánh</th>
                  <th>Người gửi</th>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{item.title}</strong>
                      </td>
                      <td>
                        <span className="ad-tag">{item.type}</span>
                      </td>
                      <td>
                        {item.brand} ({item.branch})
                      </td>
                      <td>{item.author}</td>
                      <td>{item.date}</td>
                      <td>
                        <span className={`ad-badge ${badge[item.status]}`}>{item.status}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="ad-actions">
                          <button
                            className="ad-icon-btn"
                            title="Xem chi tiết / Duyệt"
                            onClick={() => go('approvals')}
                          >
                            <Icon n="eye" size={16} />
                          </button>
                          <button
                            className="ad-icon-btn danger"
                            title="Xóa đề xuất"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Icon n="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}
                    >
                      Không tìm thấy đề xuất phù hợp.
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

const css = `
.ad{--brown:#4B2817;--brown-3:#6B3A22;--accent:#C8672B;--ink:#2A1810;--muted:#8B7A6C;--line:#EFE5DA;display:grid;grid-template-columns:240px minmax(0,1fr);grid-template-rows:1fr;grid-template-areas:"side main";min-height:100vh;background:linear-gradient(180deg,#4B2817,#38190D);color:var(--ink);font-family:Inter,system-ui,"Segoe UI",sans-serif}
.ad *{box-sizing:border-box}
.ad :where(button, input, select){font:inherit}
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

.ad-btn-primary{display:flex;align-items:center;gap:8px;padding:0 16px;height:38px;border:0;border-radius:10px;background:var(--accent);color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:background .2s}
.ad-btn-primary:hover{background:#B35820}

.ad-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
.ad-kpi{display:flex;align-items:center;gap:12px;padding:16px;border:1px solid var(--line);border-radius:12px;background:#fff}
.ad-ico{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:12px;background:#FBEAD7;color:var(--brown)}
.ad-ico.wait-bg{background:#FDEBD3;color:#B25E14}
.ad-ico.ok-bg{background:#E1F3E5;color:#2D7D46}
.ad-ico.no-bg{background:#FDE4E1;color:#C0392B}
.ad-kpi p{margin:0 0 3px;color:var(--muted);font-size:12px}
.ad-kpi strong{display:block;font-size:22px;font-weight:700;line-height:1.15}

.ad-panel{min-width:0;padding:18px;border:1px solid var(--line);border-radius:12px;background:#fff}
.ad-panel.margin-top{margin-top:20px}

.ad-filter-bar{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;margin-bottom:16px}
.ad-search-box{display:flex;align-items:center;gap:8px;flex:1;min-width:240px;padding:0 12px;border:1px solid var(--line);border-radius:8px;background:#FAF5EF;color:var(--muted)}
.ad-search-box input{border:0;background:transparent;outline:none;width:100%;font-size:13px;color:var(--ink)}
.ad-filter-group{display:flex;align-items:center;gap:6px;padding:0 10px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--muted)}
.ad-filter-group select{border:0;background:transparent;outline:none;font-size:12.5px;color:var(--ink);cursor:pointer}

.ad-scroll{overflow-x:auto}
.ad table{width:100%;min-width:700px;border-collapse:collapse;font-size:12.5px;text-align:left}
.ad th{padding:10px;background:#FAF5EF;color:var(--muted);font-size:11.5px;font-weight:600;white-space:nowrap}
.ad td{padding:12px 10px;border-bottom:1px solid #F3ECE3}
.ad tr:last-child td{border:0}

.ad-tag{display:inline-block;padding:2px 8px;border-radius:6px;background:#F0E7DD;color:var(--brown-3);font-size:11px;font-weight:500}
.ad-badge{display:inline-block;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:600;white-space:nowrap}
.ad-badge.wait{background:#FDEBD3;color:#B25E14}
.ad-badge.ok{background:#E1F3E5;color:#2D7D46}
.ad-badge.no{background:#FDE4E1;color:#C0392B}

.ad-actions{display:flex;justify-content:flex-end;gap:6px}
.ad-icon-btn{display:grid;place-items:center;width:30px;height:30px;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--brown);cursor:pointer;transition:all .15s}
.ad-icon-btn:hover{background:#FAF5EF;border-color:#D0C0B0}
.ad-icon-btn.danger{color:#C0392B}
.ad-icon-btn.danger:hover{background:#FDE4E1;border-color:#E8B4B0}

@media (max-width:900px){
  .ad{grid-template-columns:minmax(0,1fr);grid-template-rows:auto 1fr;grid-template-areas:"side" "main"}
  .ad-side{padding:12px 12px 4px}
  .ad-brand{padding-bottom:12px}
  .ad-nav{display:flex;gap:6px;overflow-x:auto}
  .ad-nav button{width:auto;margin:0;white-space:nowrap}
  .ad-main{border-radius:18px 18px 0 0}
}
`;
