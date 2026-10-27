import React, { useState } from 'react';

/* Danh mục điều hướng liên kết đồng bộ với AdminDashboard */
const NAV = [
  ['dashboard', 'Dashboard', 'home'],
  ['brands', 'Quản lý thương hiệu', 'store'],
  ['branches', 'Quản lý chi nhánh', 'pin'],
  ['menu', 'Quản lý thực đơn', 'menu'],
  ['suggestions', 'Quản lý đề xuất', 'bulb'],
  ['approvals', 'Duyệt đề xuất', 'check'],
];

/* Dữ liệu mẫu danh sách đề xuất cần duyệt */
const INITIAL_APPROVALS = [
  {
    id: 1,
    title: 'Highlands Coffee - Chi nhánh Quận 7',
    brand: 'Highlands Coffee',
    type: 'Chi nhánh mới',
    sender: 'Nguyễn Văn A',
    date: '22/04/2025',
    priority: 'Cao',
    status: 'Chờ duyệt',
  },
  {
    id: 2,
    title: 'Chi nhánh mới: Phúc Long - Bình Thạnh',
    brand: 'Phúc Long',
    type: 'Chi nhánh mới',
    sender: 'Trần Thị B',
    date: '20/04/2025',
    priority: 'Trung bình',
    status: 'Chờ duyệt',
  },
  {
    id: 3,
    title: 'The Coffee House - Quận 1 (Cập nhật địa chỉ)',
    brand: 'The Coffee House',
    type: 'Cập nhật thông tin',
    sender: 'Lê Văn C',
    date: '18/04/2025',
    priority: 'Thấp',
    status: 'Đã duyệt',
  },
  {
    id: 4,
    title: 'Menu mới: Trà sen vàng hạt chia',
    brand: 'Phúc Long',
    type: 'Thực đơn mới',
    sender: 'Phạm Minh D',
    date: '15/04/2025',
    priority: 'Cao',
    status: 'Chờ duyệt',
  },
  {
    id: 5,
    title: 'Thêm Audio Tiếng Hàn - Phúc Long Quận 3',
    brand: 'Phúc Long',
    type: 'Audio & Ngôn ngữ',
    sender: 'Hoàng Anh E',
    date: '12/04/2025',
    priority: 'Trung bình',
    status: 'Từ chối',
  },
  {
    id: 6,
    title: 'Cộng Cà Phê - Bổ sung danh mục Bánh mì',
    brand: 'Cộng Cà Phê',
    type: 'Thực đơn mới',
    sender: 'Đỗ Văn F',
    date: '10/04/2025',
    priority: 'Cao',
    status: 'Chờ duyệt',
  },
];

const badge = { 'Chờ duyệt': 'wait', 'Đã duyệt': 'ok', 'Từ chối': 'no' };

/* Bộ icon SVG kế thừa từ AdminDashboard */
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
  xCircle: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </>
  ),
  filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
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

export default function ApprovalsManagement({ onNavigate }) {
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [typeFilter, setTypeFilter] = useState('Tất cả');

  const go = (key) => (onNavigate ? onNavigate(key) : window.alert(`Chuyển đến trang: ${key}`));

  /* Thao tác Duyệt hoặc Từ chối */
  const handleStatusChange = (id, newStatus) => {
    setApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)),
    );
  };

  /* Lọc danh sách đề xuất */
  const filteredList = approvals.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase()) ||
      item.sender.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || item.status === statusFilter;
    const matchType = typeFilter === 'Tất cả' || item.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const pendingCount = approvals.filter((i) => i.status === 'Chờ duyệt').length;
  const approvedCount = approvals.filter((i) => i.status === 'Đã duyệt').length;
  const rejectedCount = approvals.filter((i) => i.status === 'Từ chối').length;

  return (
    <div className="ad">
      <style>{css}</style>

      {/* Thanh điều hướng Side Navigation - Kế thừa 100% từ AdminDashboard */}
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
              aria-current={key === 'approvals' ? 'page' : undefined}
              onClick={() => key !== 'approvals' && go(key)}
            >
              <Icon n={icon} size={17} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Nội dung chính */}
      <main className="ad-main">
        <header className="ad-head">
          <div>
            <h1>Duyệt đề xuất</h1>
            <p className="ad-sub">
              Xem xét và phê duyệt các yêu cầu thay đổi từ hệ thống chi nhánh
            </p>
          </div>
        </header>

        {/* Các thẻ chỉ số tổng quan nhanh */}
        <section className="ad-kpis" aria-label="Thống kê đề xuất">
          <article className="ad-kpi">
            <span className="ad-ico">
              <Icon n="bulb" size={22} />
            </span>
            <div>
              <p>Chờ phê duyệt</p>
              <strong>{pendingCount}</strong>
              <small className="down">Cần xử lý ngay</small>
            </div>
          </article>
          <article className="ad-kpi">
            <span className="ad-ico" style={{ background: '#E1F3E5', color: '#2D7D46' }}>
              <Icon n="check" size={22} />
            </span>
            <div>
              <p>Đã phê duyệt</p>
              <strong>{approvedCount}</strong>
              <small className="up">Hoàn thành</small>
            </div>
          </article>
          <article className="ad-kpi">
            <span className="ad-ico" style={{ background: '#FDE4E1', color: '#C0392B' }}>
              <Icon n="xCircle" size={22} />
            </span>
            <div>
              <p>Đã từ chối</p>
              <strong>{rejectedCount}</strong>
              <small style={{ color: 'var(--muted)', fontWeight: 600 }}>Đã phản hồi</small>
            </div>
          </article>
        </section>

        {/* Thanh tìm kiếm và bộ lọc */}
        <div className="ad-panel" style={{ marginTop: '14px', padding: '12px 18px' }}>
          <div className="ad-tools-bar">
            <div className="ad-search">
              <Icon n="search" size={16} />
              <input
                type="text"
                placeholder="Tìm tên đề xuất, thương hiệu, người gửi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="ad-filters">
              <div className="ad-select-wrap">
                <Icon n="filter" size={14} />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="Tất cả">Tất cả trạng thái</option>
                  <option value="Chờ duyệt">Chờ duyệt</option>
                  <option value="Đã duyệt">Đã duyệt</option>
                  <option value="Từ chối">Từ chối</option>
                </select>
              </div>
              <div className="ad-select-wrap">
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="Tất cả">Tất cả loại đề xuất</option>
                  <option value="Chi nhánh mới">Chi nhánh mới</option>
                  <option value="Thực đơn mới">Thực đơn mới</option>
                  <option value="Audio & Ngôn ngữ">Audio & Ngôn ngữ</option>
                  <option value="Cập nhật thông tin">Cập nhật thông tin</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bảng danh sách phê duyệt */}
        <div className="ad-panel" style={{ marginTop: '14px' }}>
          <h2>Danh sách đề xuất ({filteredList.length})</h2>
          <div className="ad-scroll">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nội dung đề xuất</th>
                  <th>Thương hiệu</th>
                  <th>Loại</th>
                  <th>Người gửi</th>
                  <th>Ngày gửi</th>
                  <th>Độ ưu tiên</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length > 0 ? (
                  filteredList.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>
                        <b>{item.title}</b>
                      </td>
                      <td>{item.brand}</td>
                      <td>
                        <span className="ad-tag">{item.type}</span>
                      </td>
                      <td>{item.sender}</td>
                      <td>{item.date}</td>
                      <td>
                        <span
                          className={`ad-prio ${item.priority === 'Cao' ? 'high' : item.priority === 'Trung bình' ? 'mid' : 'low'}`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`ad-badge ${badge[item.status]}`}>{item.status}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="ad-actions">
                          <button
                            className="ad-btn-icon"
                            title="Xem chi tiết"
                            onClick={() => window.alert(`Chi tiết đề xuất: ${item.title}`)}
                          >
                            <Icon n="eye" size={15} />
                          </button>
                          {item.status === 'Chờ duyệt' && (
                            <>
                              <button
                                className="ad-btn-icon ok"
                                title="Phe duyệt"
                                onClick={() => handleStatusChange(item.id, 'Đã duyệt')}
                              >
                                <Icon n="check" size={15} />
                              </button>
                              <button
                                className="ad-btn-icon no"
                                title="Từ chối"
                                onClick={() => handleStatusChange(item.id, 'Từ chối')}
                              >
                                <Icon n="xCircle" size={15} />
                              </button>
                            </>
                          )}
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
                      Không tìm thấy đề xuất nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

/* Hệ thống CSS Kế thừa từ AdminDashboard & Tối ưu cho Trang Phê Duyệt */
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

.ad-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px}
.ad-kpi{display:flex;align-items:center;gap:12px;padding:16px;border:1px solid var(--line);border-radius:12px;background:#fff}
.ad-ico{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:12px;background:#FBEAD7;color:var(--brown)}
.ad-kpi p{margin:0 0 3px;color:var(--muted);font-size:12px}
.ad-kpi strong{display:block;font-size:22px;font-weight:700;line-height:1.15}
.ad-kpi small{display:block;margin-top:5px;font-size:10.5px;font-weight:600}
.up{color:#2E9B55}.down{color:#D2402F}

.ad-panel{min-width:0;padding:18px;border:1px solid var(--line);border-radius:12px;background:#fff}
.ad-panel h2{margin:0 0 14px;font-size:14.5px;font-weight:700}

.ad-tools-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}
.ad-search{display:flex;align-items:center;gap:8px;padding:0 12px;height:38px;border:1px solid var(--line);border-radius:10px;background:#FAF5EF;flex:1;min-width:240px}
.ad-search input{border:0;background:transparent;outline:none;width:100%;font-size:12.5px;color:var(--ink)}
.ad-filters{display:flex;gap:10px;flex-wrap:wrap}
.ad-select-wrap{display:flex;align-items:center;gap:6px;padding:0 10px;height:38px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--muted)}
.ad-select-wrap select{border:0;background:transparent;outline:none;font-size:12.5px;color:var(--ink);cursor:pointer}

.ad-scroll{overflow-x:auto}
.ad table{width:100%;min-width:720px;border-collapse:collapse;font-size:12.5px;text-align:left}
.ad th{padding:10px;background:#FAF5EF;color:var(--muted);font-size:11.5px;font-weight:600;white-space:nowrap}
.ad td{padding:11px 10px;border-bottom:1px solid #F3ECE3}
.ad tr:last-child td{border:0}

.ad-tag{display:inline-block;padding:2px 8px;border-radius:6px;background:#FAF5EF;border:1px solid var(--line);font-size:11px;color:var(--brown-3)}
.ad-prio{display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600}
.ad-prio.high{background:#FDE4E1;color:#C0392B}
.ad-prio.mid{background:#FDEBD3;color:#B25E14}
.ad-prio.low{background:#E1F3E5;color:#2D7D46}

.ad-badge{display:inline-block;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:600;white-space:nowrap}
.ad-badge.wait{background:#FDEBD3;color:#B25E14}
.ad-badge.ok{background:#E1F3E5;color:#2D7D46}
.ad-badge.no{background:#FDE4E1;color:#C0392B}

.ad-actions{display:flex;gap:6px;justify-content:flex-end}
.ad-btn-icon{display:grid;place-items:center;width:30px;height:30px;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--brown-3);cursor:pointer;transition:all .15s}
.ad-btn-icon:hover{background:#FAF5EF}
.ad-btn-icon.ok{color:#2D7D46;border-color:#C1E7C7}
.ad-btn-icon.ok:hover{background:#E1F3E5}
.ad-btn-icon.no{color:#C0392B;border-color:#F8C4C0}
.ad-btn-icon.no:hover{background:#FDE4E1}

@media (max-width:900px){
  .ad{grid-template-columns:minmax(0,1fr);grid-template-rows:auto 1fr;grid-template-areas:"side" "main"}
  .ad-side{padding:12px 12px 4px}
  .ad-brand{padding-bottom:12px}
  .ad-nav{display:flex;gap:6px;overflow-x:auto}
  .ad-nav button{width:auto;margin:0;white-space:nowrap}
  .ad-main{border-radius:18px 18px 0 0}
}
`;
