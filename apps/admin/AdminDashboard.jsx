import React from "react";

/* Dữ liệu mẫu — thay bằng API/PostgreSQL. */
const RANGE = "01/04/2025 - 30/04/2025";

const NAV = [
  ["dashboard", "Dashboard", "home"],
  ["brands", "Quản lý thương hiệu", "store"],
  ["branches", "Quản lý chi nhánh", "pin"],
  ["menu", "Quản lý thực đơn", "menu"],
  ["languages", "Quản lý audio & ngôn ngữ", "audio"],
  ["suggestions", "Quản lý đề xuất", "bulb"],
  ["approvals", "Duyệt đề xuất", "check"],
  ["stats", "Thống kê", "chart"],
  ["settings", "Cài đặt", "settings"],
];
const stats = [
  { icon: "eye", label: "Tổng lượt truy cập", value: "125,430", delta: 12 },
  { icon: "audio", label: "Lượt nghe audio", value: "8,732", delta: 18 },
  { icon: "store", label: "Tổng thương hiệu", value: "28", delta: 3 },
  { icon: "pin", label: "Tổng chi nhánh", value: "156", delta: 5 },
  { icon: "bulb", label: "Đề xuất chờ duyệt", value: "12", delta: -2 },
];
const visits = [290, 330, 520, 610, 680, 620, 830, 920, 1000, 840, 910, 1010, 1090, 1160, 1060, 970, 880, 800, 860, 900, 800, 930, 1070, 1130, 1210, 1150, 1090, 1250, 1400, 1730];
const langs = [
  { label: "Tiếng Việt", pct: 62, color: "#4B2817" },
  { label: "Tiếng Anh", pct: 24, color: "#8B4A24" },
  { label: "Tiếng Hàn", pct: 8, color: "#D07A2E" },
  { label: "Khác", pct: 6, color: "#8E98A5" },
];
const topBrands = [
  { name: "The Coffee House", views: 12542, audio: 4321, rating: 4.6, color: "#4A2C1E" },
  { name: "Phúc Long", views: 10231, audio: 3872, rating: 4.3, color: "#1F6B45" },
  { name: "Highlands Coffee", views: 8765, audio: 2901, rating: 4.2, color: "#B3282D" },
  { name: "Cộng Cà Phê", views: 6542, audio: 2384, rating: 4.1, color: "#6F7B3F" },
  { name: "Starbucks", views: 5321, audio: 1982, rating: 3.9, color: "#00704A" },
];
const latest = [
  ["Highlands Coffee - Quận 7", "22/04/2025", "Chờ duyệt"],
  ["Chi nhánh mới: Phúc Long - Bình Thạnh", "20/04/2025", "Chờ duyệt"],
  ["The Coffee House - Quận 1", "18/04/2025", "Đã duyệt"],
  ["Menu mới: Trà sen vàng", "15/04/2025", "Chờ duyệt"],
  ["Phúc Long - Quận 3", "12/04/2025", "Từ chối"],
];
const badge = { "Chờ duyệt": "wait", "Đã duyệt": "ok", "Từ chối": "no" };
const fmt = n => n.toLocaleString("en-US");

const paths = {
  cup: <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2M3 21h16M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4" />,
  home: <path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z" />,
  store: <path d="M4 9l1-5h14l1 5M4 9v11h16V9M4 9a3 3 0 0 0 5.3 2 3 3 0 0 0 5.4 0A3 3 0 0 0 20 9M10 20v-5h4v5" />,
  pin: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  menu: <path d="M5 3v8a2 2 0 0 0 2 2v8M9 3v8a2 2 0 0 1-2 2M17 21V3c-2 1-3 4-3 8h3" />,
  audio: <><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /></>,
  bulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z" />,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  download: <path d="M12 4v11M7 11l5 5 5-5M4 20h16" />,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};
const Icon = ({ n, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[n]}</svg>
);

// Biểu đồ vùng: lượt truy cập theo ngày (trục Y 0–2.000)
function AreaChart({ values }) {
  const W = 640, H = 260, L = 46, R = 24, T = 12, B = 30, MAX = 2000;
  const x = i => L + (i * (W - L - R)) / (values.length - 1);
  const y = v => T + (1 - v / MAX) * (H - T - B);
  const day = i => `${String(i + 1).padStart(2, "0")}/04`;
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join("");
  const area = `${line}L${x(values.length - 1).toFixed(1)} ${y(0)}L${x(0)} ${y(0)}Z`;
  return <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Biểu đồ lượt truy cập theo ngày trong tháng 4" className="ad-svg">
    <defs><linearGradient id="ad-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D9722F" stopOpacity=".34" /><stop offset="1" stopColor="#D9722F" stopOpacity="0" /></linearGradient></defs>
    {[0, 500, 1000, 1500, 2000].map(t => <g key={t}>
      <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#EFE5DA" strokeDasharray="3 4" />
      <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#8B7A6C">{fmt(t)}</text>
    </g>)}
    <path d={area} fill="url(#ad-fill)" />
    <path d={line} fill="none" stroke="#D9722F" strokeWidth="2" strokeLinejoin="round" />
    {values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="#D9722F"><title>{`${day(i)}: ${fmt(v)} lượt`}</title></circle>)}
    {[0, 4, 9, 14, 19, 24, 29].map(i => <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#8B7A6C">{day(i)}</text>)}
  </svg>;
}

// Biểu đồ vòng: lượt nghe theo ngôn ngữ
function Donut({ data, total }) {
  const r = 58, c = 2 * Math.PI * r;
  let offset = 0;
  return <svg viewBox="0 0 160 160" role="img" aria-label="Lượt nghe theo ngôn ngữ" className="ad-donut">
    <g transform="rotate(-90 80 80)" fill="none" strokeWidth="22">
      {data.map(d => {
        const len = (d.pct / 100) * c;
        const el = <circle key={d.label} cx="80" cy="80" r={r} stroke={d.color} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
        offset += len;
        return el;
      })}
    </g>
    <text x="80" y="78" textAnchor="middle" fontSize="19" fontWeight="700" fill="#2A1810">{fmt(total)}</text>
    <text x="80" y="95" textAnchor="middle" fontSize="11" fill="#8B7A6C">lượt nghe</text>
  </svg>;
}

export default function AdminDashboard({ onNavigate }) {
  const go = key => onNavigate ? onNavigate(key) : window.alert(`Cần cấu hình điều hướng đến mục ${key}.`);
  return <div className="ad">
    <style>{css}</style>

    <aside className="ad-side">
      <div className="ad-brand"><Icon n="cup" size={32} /><span><b>SaigonCoffee</b><small>Quản trị hệ thống</small></span></div>
      <nav className="ad-nav" aria-label="Menu quản trị">
        {NAV.map(([key, label, icon]) => <button key={key} aria-current={key === "dashboard" ? "page" : undefined} onClick={() => key !== "dashboard" && go(key)}>
          <Icon n={icon} size={17} />{label}
        </button>)}
      </nav>
    </aside>

    <main className="ad-main">
      <header className="ad-head">
        <h1>Dashboard</h1>
        <div className="ad-tools">
          <button className="ad-range" onClick={() => window.alert("Chọn khoảng thời gian sẽ kết nối API sau.")}><Icon n="calendar" size={15} />{RANGE}<Icon n="chevron" size={14} /></button>
          <button className="ad-sq" onClick={() => window.alert("Xuất báo cáo sẽ kết nối API sau.")} aria-label="Xuất báo cáo"><Icon n="download" size={16} /></button>
        </div>
      </header>

      <section className="ad-kpis" aria-label="Chỉ số tổng quan">
        {stats.map(s => <article key={s.label} className="ad-kpi">
          <span className="ad-ico"><Icon n={s.icon} size={22} /></span>
          <div>
            <p>{s.label}</p>
            <strong>{s.value}</strong>
            <small className={s.delta >= 0 ? "up" : "down"}>{s.delta >= 0 ? "↑" : "↓"} {Math.abs(s.delta)}% <em>so với tháng trước</em></small>
          </div>
        </article>)}
      </section>

      <div className="ad-row r1">
        <section className="ad-panel"><h2>Lượt truy cập theo thời gian</h2><AreaChart values={visits} /></section>
        <section className="ad-panel"><h2>Lượt nghe theo ngôn ngữ</h2>
          <div className="ad-lang">
            <Donut data={langs} total={8732} />
            <ul>{langs.map(l => <li key={l.label}><i style={{ background: l.color }} /><span>{l.label}</span><b>{l.pct}%</b></li>)}</ul>
          </div>
        </section>
      </div>

      <div className="ad-row r2">
        <section className="ad-panel"><h2>Thương hiệu có lượt xem cao nhất</h2>
          <div className="ad-scroll"><table>
            <thead><tr><th>#</th><th>Thương hiệu</th><th>Lượt xem</th><th>Lượt nghe audio</th><th>Đánh giá TB</th></tr></thead>
            <tbody>{topBrands.map((b, i) => <tr key={b.name}>
              <td>{i + 1}</td>
              <td><span className="ad-who"><i style={{ background: b.color }}>{b.name[0]}</i>{b.name}</span></td>
              <td>{fmt(b.views)}</td><td>{fmt(b.audio)}</td><td>{b.rating.toFixed(1)}</td>
            </tr>)}</tbody>
          </table></div>
        </section>
        <section className="ad-panel">
          <div className="ad-ph"><h2>Đề xuất mới nhất</h2><button onClick={() => go("approvals")}>Xem tất cả <Icon n="arrow" size={12} /></button></div>
          <div className="ad-scroll"><table>
            <thead><tr><th>#</th><th>Nội dung đề xuất</th><th>Ngày gửi</th><th>Trạng thái</th></tr></thead>
            <tbody>{latest.map(([text, date, status], i) => <tr key={text}>
              <td>{i + 1}</td><td>{text}</td><td>{date}</td><td><span className={`ad-badge ${badge[status]}`}>{status}</span></td>
            </tr>)}</tbody>
          </table></div>
        </section>
      </div>
    </main>
  </div>;
}

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
.ad-tools{display:flex;gap:10px}
.ad-range,.ad-sq{display:flex;align-items:center;gap:8px;height:38px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);font-size:12.5px;cursor:pointer}
.ad-range{padding:0 14px}
.ad-range svg:first-child{color:var(--muted)}
.ad-sq{justify-content:center;width:38px;color:var(--brown-3)}

.ad-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px}
.ad-kpi{display:flex;align-items:center;gap:12px;padding:16px;border:1px solid var(--line);border-radius:12px;background:#fff}
.ad-ico{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:12px;background:#FBEAD7;color:var(--brown)}
.ad-kpi p{margin:0 0 3px;color:var(--muted);font-size:12px}
.ad-kpi strong{display:block;font-size:22px;font-weight:700;line-height:1.15}
.ad-kpi small{display:block;margin-top:5px;font-size:10.5px;font-weight:600}
.ad-kpi small em{color:var(--muted);font-style:normal;font-weight:400}
.up{color:#2E9B55}.down{color:#D2402F}

.ad-row{display:grid;gap:14px;margin-top:14px}
.ad-row.r1{grid-template-columns:minmax(0,1.65fr) minmax(0,1fr)}
.ad-row.r2{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)}
.ad-panel{min-width:0;padding:18px;border:1px solid var(--line);border-radius:12px;background:#fff}
.ad-panel h2{margin:0 0 14px;font-size:14.5px;font-weight:700}
.ad-ph{display:flex;align-items:flex-start;justify-content:space-between}
.ad-ph button{display:flex;align-items:center;gap:4px;padding:0;border:0;background:none;color:var(--accent);font-size:12px;cursor:pointer}
.ad-svg{display:block;width:100%;height:auto}
.ad-lang{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:14px 18px;padding-top:6px}
.ad-donut{width:132px;flex:none}
.ad-lang ul{flex:1;min-width:128px;margin:0;padding:0;list-style:none}
.ad-lang li{display:flex;align-items:center;gap:10px;padding:7px 0;font-size:12.5px}
.ad-lang li i{width:8px;height:8px;border-radius:50%}
.ad-lang li span{flex:1;color:#5C4B3F}

.ad-scroll{overflow-x:auto}
.ad table{width:100%;min-width:430px;border-collapse:collapse;font-size:12.5px;text-align:left}
.ad th{padding:10px;background:#FAF5EF;color:var(--muted);font-size:11.5px;font-weight:600;white-space:nowrap}
.ad td{padding:11px 10px;border-bottom:1px solid #F3ECE3}
.ad tr:last-child td{border:0}
.ad-who{display:flex;align-items:center;gap:10px;white-space:nowrap}
.ad-who i{display:grid;place-items:center;flex:none;width:26px;height:26px;border-radius:50%;color:#fff;font-size:11px;font-style:normal;font-weight:700}
.ad-badge{display:inline-block;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:600;white-space:nowrap}
.ad-badge.wait{background:#FDEBD3;color:#B25E14}
.ad-badge.ok{background:#E1F3E5;color:#2D7D46}
.ad-badge.no{background:#FDE4E1;color:#C0392B}

@media (max-width:1100px){
  .ad-row.r1,.ad-row.r2{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:900px){
  .ad{grid-template-columns:minmax(0,1fr);grid-template-rows:auto 1fr;grid-template-areas:"side" "main"}
  .ad-side{padding:12px 12px 4px}
  .ad-brand{padding-bottom:12px}
  .ad-nav{display:flex;gap:6px;overflow-x:auto}
  .ad-nav button{width:auto;margin:0;white-space:nowrap}
  .ad-main{border-radius:18px 18px 0 0}
}`;