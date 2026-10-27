import React, { useMemo, useState } from "react";

const configs = {
  brands: { title: "Thương hiệu", col1: "Tên thương hiệu", col2: "Loại", add: "Thêm thương hiệu", rows: [["Highlands Coffee", "Cà phê"], ["Phúc Long", "Trà & cà phê"], ["The Coffee House", "Cà phê"], ["Katinat", "Trà & cà phê"]] },
  branches: { title: "Chi nhánh", col1: "Tên chi nhánh", col2: "Khu vực", add: "Thêm chi nhánh", rows: [["Highlands — Nguyễn Huệ", "Quận 1"], ["Phúc Long — Crescent Mall", "Quận 7"]] },
  menu: { title: "Đồ uống", col1: "Tên đồ uống", col2: "Danh mục", add: "Thêm đồ uống", rows: [["Phin sữa đá", "Cà phê"], ["Trà sen vàng", "Trà"]] },
  reviews: { title: "Đánh giá", col1: "Mã / nội dung", col2: "Đối tượng", add: "Tạo mới", rows: [["Đánh giá #1001", "Highlands Coffee · 5/5"], ["Đánh giá #1002", "Phúc Long · 3/5"]] },
  users: { title: "Người dùng", col1: "Tên người dùng", col2: "Email", add: "Thêm người dùng", rows: [["Nguyễn Minh Anh", "minhanh@example.com"], ["Trần Quốc Bảo", "quocbao@example.com"]] },
  languages: { title: "Ngôn ngữ", col1: "Tên ngôn ngữ", col2: "Mã", add: "Thêm ngôn ngữ", rows: [["Tiếng Việt", "vi"], ["English", "en"], ["日本語", "ja"], ["中文", "zh"]] }
};
const btn = { border: 0, borderRadius: 10, padding: "10px 13px", background: "#315C43", color: "#fff", fontWeight: 700, cursor: "pointer" };
const input = { boxSizing: "border-box", width: "100%", border: "1px solid #dfe3da", borderRadius: 10, padding: "11px 13px", fontSize: 14 };

export default function ManagementPage({ section = "brands", onNavigate }) {
  const config = configs[section] || configs.brands;
  const [rows, setRows] = useState(() => config.rows.map((r, i) => ({ id: i + 1, name: r[0], detail: r[1], status: section === "reviews" ? (i ? "Chờ duyệt" : "Đã duyệt") : "Hoạt động" })));
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const visible = useMemo(() => rows.filter(r => `${r.name} ${r.detail} ${r.status}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const add = e => { e.preventDefault(); if (!name.trim()) return; setRows(old => [{ id: Date.now(), name: name.trim(), detail: detail.trim() || "Chưa cập nhật", status: "Hoạt động" }, ...old]); setName(""); setDetail(""); setShowForm(false); };
  const nav = [["Tổng quan", "dashboard"], ...Object.keys(configs).map(k => [configs[k].title, k])];
  return <div style={{ minHeight: "100vh", display: "flex", background: "#F5F6F3", color: "#252820", fontFamily: "Inter,system-ui,sans-serif" }}>
    <aside style={{ width: 240, flexShrink: 0, boxSizing: "border-box", padding: 22, background: "#203F30", color: "#fff" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 28 }}>☕ SaigonCoffee<br /><small style={{ color: "#C4D5C7", fontWeight: 400 }}>QUẢN TRỊ HỆ THỐNG</small></div>
      {nav.map(([label, key]) => <button key={key} onClick={() => onNavigate ? onNavigate(key) : window.alert(`Cần cấu hình điều hướng đến ${key}.`)} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 13px", marginBottom: 5, border: 0, borderRadius: 10, background: key === section ? "#47785A" : "transparent", color: "#fff", cursor: "pointer" }}>{key === "dashboard" ? "▦" : "›"}　{label}</button>)}
    </aside>
    <main style={{ minWidth: 0, flex: 1, padding: "28px clamp(18px,4vw,48px)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, flexWrap: "wrap", marginBottom: 24 }}><div><h1 style={{ margin: "0 0 7px", fontSize: 30 }}>Quản lý {config.title.toLowerCase()}</h1><span style={{ color: "#77796f", fontSize: 14 }}>Quản lý dữ liệu trong hệ thống SaigonCoffee.</span></div><button style={btn} onClick={() => setShowForm(v => !v)}>＋ {config.add}</button></header>
      {showForm && <section style={{ background: "#fff", border: "1px solid #e6e9e2", borderRadius: 16, padding: 22, marginBottom: 18 }}><h2 style={{ marginTop: 0, fontSize: 18 }}>Thông tin {config.title.toLowerCase()}</h2><form onSubmit={add} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}><label style={{ fontSize: 13 }}>Tên<input required value={name} onChange={e => setName(e.target.value)} placeholder="Nhập tên" style={{ ...input, display: "block", marginTop: 7 }} /></label><label style={{ fontSize: 13 }}>{config.col2}<input value={detail} onChange={e => setDetail(e.target.value)} placeholder="Nhập thông tin" style={{ ...input, display: "block", marginTop: 7 }} /></label><div style={{ display: "flex", alignItems: "end", gap: 8 }}><button style={btn} type="submit">Lưu mẫu</button><button style={{ ...btn, background: "#EEF0EA", color: "#444" }} type="button" onClick={() => setShowForm(false)}>Hủy</button></div></form><p style={{ color: "#77796f", fontSize: 12 }}>Nút lưu hiện chỉ thay đổi dữ liệu tạm trong giao diện, chưa ghi vào PostgreSQL.</p></section>}
      <section style={{ background: "#fff", border: "1px solid #e6e9e2", borderRadius: 16, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, flexWrap: "wrap", marginBottom: 18 }}><div><h2 style={{ margin: "0 0 5px", fontSize: 19 }}>Danh sách {config.title.toLowerCase()}</h2><span style={{ color: "#77796f", fontSize: 14 }}>{visible.length} mục hiển thị</span></div><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm kiếm..." style={{ ...input, maxWidth: 280 }} /></div>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}><thead><tr>{["ID", config.col1, config.col2, "Trạng thái", "Thao tác"].map(h => <th key={h} style={{ padding: 12, color: "#77796f", borderBottom: "1px solid #e8eae4", fontSize: 12 }}>{h}</th>)}</tr></thead><tbody>{visible.map(r => <tr key={r.id}><td style={{ padding: 14, borderBottom: "1px solid #f0f1ed" }}>#{r.id}</td><td style={{ padding: 14, borderBottom: "1px solid #f0f1ed" }}><strong>{r.name}</strong></td><td style={{ padding: 14, borderBottom: "1px solid #f0f1ed" }}>{r.detail}</td><td style={{ padding: 14, borderBottom: "1px solid #f0f1ed" }}><span style={{ borderRadius: 20, padding: "5px 9px", background: "#E8F4E9", color: "#26713A", fontSize: 11 }}>{r.status}</span></td><td style={{ padding: 14, borderBottom: "1px solid #f0f1ed", whiteSpace: "nowrap" }}><button style={{ ...btn, padding: "7px 10px", background: "#EEF0EA", color: "#315C43" }} onClick={() => window.alert("Chức năng sửa sẽ được kết nối backend sau.")}>Sửa</button> <button style={{ ...btn, padding: "7px 10px", background: "#FBEAE7", color: "#A13B2A" }} onClick={() => setRows(old => old.filter(x => x.id !== r.id))}>Xóa mẫu</button></td></tr>)}{visible.length === 0 && <tr><td colSpan={5} style={{ padding: 20, textAlign: "center", color: "#77796f" }}>Không tìm thấy dữ liệu.</td></tr>}</tbody></table></div>
      </section>
      <p style={{ color: "#77796f", fontSize: 12, marginTop: 14 }}>Dữ liệu hiện là minh họa trong React state; chưa gọi API và chưa lưu database.</p>
    </main>
  </div>;
}
