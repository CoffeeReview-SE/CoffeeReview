import React, { useMemo, useState } from "react";

/* Dữ liệu mẫu — thay bằng API/PostgreSQL. Mỗi dòng: [tên, loại/khu vực/mã/ngày, số lượng, trạng thái].
   Nút Lưu / Xóa hiện chỉ đổi dữ liệu tạm trong state, chưa ghi vào database. */
const PAGE_SIZE = 6;
const COLORS = ["#4A2C1E", "#1F6B45", "#B3282D", "#6F7B3F", "#00704A", "#8B6F47", "#7A4A2E", "#2E6F8E"];
const SHOW = ["Hiển thị", "Ẩn"];
const SUGGEST = ["Chờ duyệt", "Đã duyệt", "Từ chối"];
const suggestions = [
  ["Highlands Coffee - Quận 7", "22/04/2025", null, "Chờ duyệt"],
  ["Chi nhánh mới: Phúc Long - Bình Thạnh", "20/04/2025", null, "Chờ duyệt"],
  ["The Coffee House - Quận 1", "18/04/2025", null, "Đã duyệt"],
  ["Menu mới: Trà sen vàng", "15/04/2025", null, "Chờ duyệt"],
  ["Phúc Long - Quận 3", "12/04/2025", null, "Từ chối"],
];
const moreBrands = [
  ["Katinat", "Trà, cà phê", 16], ["Phê La", "Trà, cà phê", 9], ["Gong Cha", "Trà sữa, đồ uống", 14], ["KOI Thé", "Trà sữa, đồ uống", 13],
  ["Tocotoco", "Trà sữa, đồ uống", 11], ["Passio Coffee", "Cà phê, bánh", 8], ["Milano Coffee", "Cà phê", 7], ["Cheese Coffee", "Cà phê, bánh", 6],
  ["Urban Station", "Cà phê, đồ uống", 5], ["Là Việt Coffee", "Cà phê", 6], ["Okkio Caffe", "Cà phê, bánh", 5], ["Mê Trang", "Cà phê", 4],
  ["Aha Cafe", "Cà phê, đồ uống", 9], ["Tous Les Jours", "Bánh, cà phê", 10], ["The Coffee Bean", "Cà phê, trà", 7], ["Ding Tea", "Trà sữa, đồ uống", 8],
  ["Royaltea", "Trà sữa, đồ uống", 6], ["Sunday Basic", "Cà phê, bánh", 4], ["Trung Nguyên E-Coffee", "Cà phê", 12], ["Cafe Amazon", "Cà phê, đồ uống", 3],
  ["Starbucks Reserve", "Cà phê", 2], ["Ông Bầu", "Cà phê", 3],
].map(r => [...r, "Hiển thị"]);

const configs = {
  brands: {
    heading: "Quản lý thương hiệu", add: "Thêm thương hiệu", search: "Tìm kiếm thương hiệu...", typeAll: "Tất cả loại hình",
    nameLabel: "Tên thương hiệu", typeLabel: "Loại hình", countLabel: "Số chi nhánh", logo: true, statuses: SHOW,
    rows: [
      ["The Coffee House", "Cà phê, trà, bánh", 25, "Hiển thị"], ["Phúc Long", "Trà, cà phê", 18, "Hiển thị"],
      ["Highlands Coffee", "Cà phê, trà, bánh", 22, "Hiển thị"], ["Cộng Cà Phê", "Cà phê, đồ uống", 15, "Hiển thị"],
      ["Starbucks", "Cà phê, trà, bánh", 12, "Ẩn"], ["Trung Nguyên Legend", "Cà phê", 10, "Hiển thị"], ...moreBrands,
    ],
  },
  branches: {
    heading: "Quản lý chi nhánh", add: "Thêm chi nhánh", search: "Tìm kiếm chi nhánh...", typeAll: "Tất cả khu vực",
    nameLabel: "Tên chi nhánh", typeLabel: "Khu vực", statuses: SHOW,
    rows: [["Highlands — Nguyễn Huệ", "Quận 1"], ["Phúc Long — Crescent Mall", "Quận 7"], ["Phúc Long — Quận 1", "Quận 1"], ["The Coffee House — Thủ Đức", "Thủ Đức"]],
  },
  menu: {
    heading: "Quản lý thực đơn", add: "Thêm món", search: "Tìm kiếm món...", typeAll: "Tất cả danh mục",
    nameLabel: "Tên món", typeLabel: "Danh mục", statuses: SHOW,
    rows: [["Phin sữa đá", "Cà phê"], ["Phin đen đá", "Cà phê"], ["Trà sen vàng", "Trà"]],
  },
  languages: {
    heading: "Quản lý audio & ngôn ngữ", add: "Thêm ngôn ngữ", search: "Tìm kiếm ngôn ngữ...",
    nameLabel: "Tên ngôn ngữ", typeLabel: "Mã", statuses: ["Hoạt động", "Tắt"],
    rows: [["Tiếng Việt", "vi"], ["English", "en"], ["한국어", "ko"], ["日本語", "ja"], ["中文", "zh"]],
  },
  suggestions: {
    heading: "Quản lý đề xuất", add: "Thêm đề xuất", search: "Tìm kiếm đề xuất...",
    nameLabel: "Nội dung đề xuất", typeLabel: "Ngày gửi", statuses: SUGGEST, rows: suggestions,
  },
  approvals: {
    heading: "Duyệt đề xuất", add: "Thêm đề xuất", search: "Tìm kiếm đề xuất...",
    nameLabel: "Nội dung đề xuất", typeLabel: "Ngày gửi", statuses: SUGGEST, rows: suggestions.filter(r => r[3] === "Chờ duyệt"),
  },
};
const tone = { "Hiển thị": "ok", "Hoạt động": "ok", "Đã duyệt": "ok", "Chờ duyệt": "wait", "Ẩn": "no", "Tắt": "no", "Từ chối": "no" };

const fold = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
const initials = n => n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
// Danh sách số trang có dấu "…" khi nhiều trang
function pageItems(p, n) {
  if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1);
  const keep = [...new Set([1, n, p - 1, p, p + 1])].filter(x => x >= 1 && x <= n).sort((a, b) => a - b);
  return keep.flatMap((x, i) => (i && x - keep[i - 1] > 1 ? ["…", x] : [x]));
}

const paths = {
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  edit: <path d="M4 20h4L19 9l-4-4L4 16z" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  left: <path d="m15 6-6 6 6 6" />,
  right: <path d="m9 6 6 6-6 6" />,
};
const Icon = ({ n, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[n]}</svg>
);

// Đổi `section` sẽ khởi tạo lại dữ liệu & bộ lọc của trang
export default function ManagementPage(props) {
  const section = configs[props.section] ? props.section : "brands";
  return <Page key={section} {...props} section={section} />;
}

function Page({ section, onNavigate }) {
  const config = configs[section];
  const [rows, setRows] = useState(() => config.rows.map((r, i) => ({ id: i + 1, name: r[0], type: r[1], count: r[2] ?? undefined, status: r[3] || config.statuses[0], color: COLORS[i % COLORS.length] })));
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); // null = đóng; có `id` = đang sửa

  const back = () => (onNavigate ? onNavigate("dashboard") : window.history.back());
  const filter = set => e => { set(e.target.value); setPage(1); };
  const types = useMemo(() => [...new Set(rows.map(r => r.type))], [rows]);
  const visible = useMemo(() => rows.filter(r => (!type || r.type === type) && (!status || r.status === status) && fold(`${r.name} ${r.type}`).includes(fold(q.trim()))), [rows, q, type, status]);
  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const start = (cur - 1) * PAGE_SIZE;
  const slice = visible.slice(start, start + PAGE_SIZE);

  const save = e => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    const data = { name, type: form.type.trim() || "Chưa cập nhật", count: form.count === "" || form.count == null ? undefined : Number(form.count), status: form.status };
    setRows(old => form.id ? old.map(r => (r.id === form.id ? { ...r, ...data } : r)) : [{ id: Date.now(), color: COLORS[old.length % COLORS.length], ...data }, ...old]);
    setForm(null);
  };
  const remove = r => { if (window.confirm(`Xóa "${r.name}"?`)) setRows(old => old.filter(x => x.id !== r.id)); };
  const field = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return <div className="mp">
    <style>{css}</style>
    <div className="mp-bar"><button onClick={back} aria-label="Quay lại Dashboard"><Icon n="back" size={18} /></button>{config.heading}</div>

    <div className="mp-body">
      <header className="mp-head">
        <h1>{config.heading}</h1>
        <button className="mp-add" onClick={() => setForm({ name: "", type: "", count: "", status: config.statuses[0] })}><Icon n="plus" size={16} />{config.add}</button>
      </header>

      {form && <form className="mp-form" onSubmit={save}>
        <h2>{form.id ? "Cập nhật thông tin" : config.add}</h2>
        <div className="mp-fields">
          <label>{config.nameLabel}<input required autoFocus value={form.name} onChange={field("name")} placeholder="Nhập tên" /></label>
          <label>{config.typeLabel}<input value={form.type} onChange={field("type")} placeholder="Nhập thông tin" /></label>
          {config.countLabel && <label>{config.countLabel}<input type="number" min="0" value={form.count ?? ""} onChange={field("count")} /></label>}
          <label>Trạng thái<select value={form.status} onChange={field("status")}>{config.statuses.map(s => <option key={s}>{s}</option>)}</select></label>
        </div>
        <div className="mp-form-act"><button className="mp-add" type="submit">Lưu</button><button type="button" onClick={() => setForm(null)}>Hủy</button></div>
      </form>}

      <div className="mp-filters">
        <label className="mp-search"><Icon n="search" size={16} /><input value={q} onChange={filter(setQ)} placeholder={config.search} aria-label={config.search} /></label>
        {config.typeAll && <select value={type} onChange={filter(setType)} aria-label={config.typeAll}><option value="">{config.typeAll}</option>{types.map(t => <option key={t}>{t}</option>)}</select>}
        <select value={status} onChange={filter(setStatus)} aria-label="Lọc theo trạng thái"><option value="">Tất cả trạng thái</option>{config.statuses.map(s => <option key={s}>{s}</option>)}</select>
      </div>

      <div className="mp-card"><div className="mp-scroll"><table>
        <thead><tr>
          <th>#</th>{config.logo && <th>Logo</th>}<th>{config.nameLabel}</th><th>{config.typeLabel}</th>{config.countLabel && <th>{config.countLabel}</th>}<th>Trạng thái</th><th>Thao tác</th>
        </tr></thead>
        <tbody>
          {slice.map((r, i) => <tr key={r.id}>
            <td>{start + i + 1}</td>
            {config.logo && <td><span className="mp-tile">{r.logo ? <img src={r.logo} alt={`Logo ${r.name}`} /> : <i style={{ background: r.color }}>{initials(r.name)}</i>}</span></td>}
            <td className="mp-name">{r.name}</td>
            <td>{r.type}</td>
            {config.countLabel && <td>{r.count ?? "—"}</td>}
            <td><span className={`mp-badge ${tone[r.status] || "ok"}`}>{r.status}</span></td>
            <td><span className="mp-act">
              <button onClick={() => setForm({ ...r })} aria-label={`Sửa ${r.name}`}><Icon n="edit" size={15} /></button>
              <button className="del" onClick={() => remove(r)} aria-label={`Xóa ${r.name}`}><Icon n="trash" size={15} /></button>
            </span></td>
          </tr>)}
          {!slice.length && <tr><td colSpan={7} className="mp-empty">Không tìm thấy dữ liệu.</td></tr>}
        </tbody>
      </table></div></div>

      {pages > 1 && <nav className="mp-pg" aria-label="Phân trang">
        <button disabled={cur === 1} onClick={() => setPage(cur - 1)} aria-label="Trang trước"><Icon n="left" size={15} /></button>
        {pageItems(cur, pages).map((p, i) => p === "…"
          ? <span key={`e${i}`}>…</span>
          : <button key={p} aria-current={p === cur ? "page" : undefined} onClick={() => setPage(p)}>{p}</button>)}
        <button disabled={cur === pages} onClick={() => setPage(cur + 1)} aria-label="Trang sau"><Icon n="right" size={15} /></button>
      </nav>}
    </div>
  </div>;
}

const css = `
.mp{--brown:#4B2817;--brown-3:#6B3A22;--ink:#2A1810;--muted:#8B7A6C;--line:#EFE5DA;min-height:100vh;background:#FBF8F4;color:var(--ink);font-family:Inter,system-ui,"Segoe UI",sans-serif}
.mp *{box-sizing:border-box}
.mp :where(button,input,select){font:inherit}
.mp button:focus-visible,.mp input:focus-visible,.mp select:focus-visible{outline:2px solid #E9A24B;outline-offset:2px}

.mp-bar{display:flex;align-items:center;gap:12px;height:48px;padding:0 20px;color:#fff;background:linear-gradient(180deg,#5A3220,#442211);font-size:13px;font-weight:500}
.mp-bar button{display:grid;place-items:center;padding:4px;border:0;background:none;color:#fff;cursor:pointer}
.mp-body{max-width:1040px;margin:0 auto;padding:26px clamp(16px,3vw,32px) 48px}
.mp-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}
.mp-head h1{margin:0;font-size:24px;font-weight:700}
.mp-add{display:flex;align-items:center;gap:7px;padding:10px 16px;border:0;border-radius:10px;background:var(--brown-3);color:#fff;font-size:13px;font-weight:600;cursor:pointer}
.mp-add:hover{background:var(--brown)}

.mp-form{margin-top:18px;padding:18px;border:1px solid var(--line);border-radius:12px;background:#fff}
.mp-form h2{margin:0 0 14px;font-size:15px;font-weight:700}
.mp-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px}
.mp-fields label{display:flex;flex-direction:column;gap:6px;font-size:12.5px;color:var(--muted)}
.mp-fields input,.mp-fields select{height:40px;padding:0 12px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);font-size:13.5px}
.mp-form-act{display:flex;gap:10px;margin-top:14px}
.mp-form-act button:not(.mp-add){padding:10px 16px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);font-size:13px;cursor:pointer}

.mp-filters{display:flex;flex-wrap:wrap;gap:12px;margin:20px 0}
.mp-search{position:relative;flex:1 1 260px}
.mp-search svg{position:absolute;top:50%;left:14px;transform:translateY(-50%);color:var(--muted)}
.mp-search input{width:100%;height:44px;padding:0 14px 0 40px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);font-size:13.5px}
.mp-filters>select{flex:0 1 190px;min-width:160px;height:44px;padding:0 12px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);font-size:13.5px}

.mp-card{border:1px solid var(--line);border-radius:12px;background:#fff;overflow:hidden}
.mp-scroll{overflow-x:auto}
.mp table{width:100%;min-width:680px;border-collapse:collapse;font-size:13px;text-align:left}
.mp th{padding:15px 12px;background:#FAF5EF;font-size:12.5px;font-weight:600;white-space:nowrap}
.mp td{padding:10px 12px;border-bottom:1px solid #F3ECE3}
.mp tr:last-child td{border:0}
.mp-name{font-weight:500}
.mp-empty{padding:28px;color:var(--muted);text-align:center}
.mp-tile{display:grid;place-items:center;width:44px;height:44px;border:1px solid #F3ECE3;border-radius:10px;background:#fff}
.mp-tile i{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;color:#fff;font-size:11px;font-style:normal;font-weight:700}
.mp-tile img{width:32px;height:32px;border-radius:50%;object-fit:cover}
.mp-badge{display:inline-block;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;white-space:nowrap}
.mp-badge.ok{background:#E1F3E5;color:#2D7D46}
.mp-badge.wait{background:#FDEBD3;color:#B25E14}
.mp-badge.no{background:#FDE4E1;color:#C0392B}
.mp-act{display:flex;gap:8px}
.mp-act button{display:grid;place-items:center;width:34px;height:34px;padding:0;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);cursor:pointer}
.mp-act button:hover{background:#FAF5EF}
.mp-act .del{color:#D2402F}

.mp-pg{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin-top:22px;color:var(--muted)}
.mp-pg button{display:grid;place-items:center;min-width:34px;height:34px;padding:0 8px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);font-size:13px;cursor:pointer}
.mp-pg button[aria-current=page]{border-color:var(--brown-3);background:var(--brown-3);color:#fff;font-weight:600}
.mp-pg button:disabled{opacity:.4;cursor:default}
`;
