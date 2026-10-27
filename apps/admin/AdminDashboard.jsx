import React from "react";

const stats = [
  ["☕", "Thương hiệu", "10"], ["⌖", "Chi nhánh", "128"],
  ["★", "Đánh giá", "1.284"], ["♙", "Người dùng", "856"]
];
const recent = [
  ["Nguyễn Minh Anh", "Highlands Coffee", 5, "Đã duyệt"],
  ["Trần Quốc Bảo", "Phúc Long", 4, "Đã duyệt"],
  ["Lê Thu Hà", "Katinat", 3, "Chờ duyệt"]
];
const btn = { border: 0, borderRadius: 10, padding: "10px 13px", background: "#315C43", color: "#fff", fontWeight: 700, cursor: "pointer" };

export default function AdminDashboard({ onNavigate }) {
  const nav = [["Tổng quan", "dashboard"], ["Thương hiệu", "brands"], ["Chi nhánh", "branches"], ["Đồ uống", "menu"], ["Đánh giá", "reviews"], ["Người dùng", "users"], ["Ngôn ngữ", "languages"]];
  const go = key => onNavigate ? onNavigate(key) : window.alert(`Cần cấu hình điều hướng đến mục ${key}.`);
  return <div style={{ minHeight: "100vh", display: "flex", background: "#F5F6F3", color: "#252820", fontFamily: "Inter,system-ui,sans-serif" }}>
    <aside style={{ width: 240, flexShrink: 0, boxSizing: "border-box", padding: 22, background: "#203F30", color: "#fff" }}>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 28 }}>☕ SaigonCoffee<br /><small style={{ color: "#C4D5C7", fontWeight: 400 }}>QUẢN TRỊ HỆ THỐNG</small></div>
      {nav.map(([label, key]) => <button key={key} onClick={() => key !== "dashboard" && go(key)} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 13px", marginBottom: 5, border: 0, borderRadius: 10, background: key === "dashboard" ? "#47785A" : "transparent", color: "#fff", cursor: "pointer", fontWeight: key === "dashboard" ? 700 : 400 }}>{key === "dashboard" ? "▦" : "›"}　{label}</button>)}
      <div style={{ marginTop: 35, color: "#C4D5C7", fontSize: 12 }}>SaigonCoffee Admin · v1.0</div>
    </aside>
    <main style={{ minWidth: 0, flex: 1, padding: "28px clamp(18px,4vw,48px)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 15, flexWrap: "wrap", marginBottom: 28 }}><div><h1 style={{ margin: "0 0 7px", fontSize: 30 }}>Tổng quan</h1><span style={{ color: "#77796f", fontSize: 14 }}>Chào mừng bạn quay lại khu vực quản trị.</span></div><div style={{ textAlign: "right" }}><strong>Quản trị viên</strong><div style={{ color: "#77796f", fontSize: 12 }}>admin@saigoncoffee.vn</div></div></header>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 22 }}>{stats.map(([icon, label, value]) => <article key={label} style={{ background: "#fff", border: "1px solid #e6e9e2", borderRadius: 16, padding: 20 }}><div style={{ width: 42, height: 42, borderRadius: 13, background: "#EDF3ED", color: "#315C43", display: "grid", placeItems: "center", fontSize: 20 }}>{icon}</div><p style={{ color: "#77796f", fontSize: 14 }}>{label}</p><strong style={{ fontSize: 30 }}>{value}</strong><div style={{ color: "#77796f", fontSize: 12 }}>Số liệu minh họa</div></article>)}</section>
      <section style={{ background: "#fff", border: "1px solid #e6e9e2", borderRadius: 16, padding: 22, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}><div><h2 style={{ margin: "0 0 5px", fontSize: 20 }}>Đánh giá gần đây</h2><p style={{ color: "#77796f", fontSize: 14 }}>Theo dõi nội dung cộng đồng gửi lên hệ thống.</p></div><button style={btn} onClick={() => go("reviews")}>Quản lý đánh giá →</button></div>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}><thead><tr>{["Người dùng", "Thương hiệu", "Điểm", "Trạng thái", "Thao tác"].map(x => <th key={x} style={{ padding: 12, color: "#77796f", borderBottom: "1px solid #e8eae4", fontSize: 12 }}>{x}</th>)}</tr></thead><tbody>{recent.map(r => <tr key={r[0]}>{r.map((v, i) => <td key={i} style={{ padding: 14, borderBottom: "1px solid #f0f1ed" }}>{i === 2 ? `★ ${v}/5` : i === 3 ? <span style={{ borderRadius: 20, padding: "5px 9px", background: v === "Chờ duyệt" ? "#FFF1D8" : "#E8F4E9", color: v === "Chờ duyệt" ? "#98651A" : "#26713A", fontSize: 11 }}>{v}</span> : v}</td>)}<td style={{ padding: 14, borderBottom: "1px solid #f0f1ed" }}><button style={{ ...btn, padding: "7px 10px" }} onClick={() => go("reviews")}>Xem</button></td></tr>)}</tbody></table></div>
      </section>
      <section style={{ background: "#fff", border: "1px solid #e6e9e2", borderRadius: 16, padding: 22 }}><h2 style={{ marginTop: 0, fontSize: 20 }}>Truy cập nhanh</h2><div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>{[["Quản lý thương hiệu", "brands"], ["Quản lý chi nhánh", "branches"], ["Quản lý đồ uống", "menu"], ["Quản lý người dùng", "users"]].map(([label, key]) => <button key={key} style={{ ...btn, background: "#EDF3ED", color: "#315C43" }} onClick={() => go(key)}>{label} →</button>)}</div></section>
    </main>
  </div>;
}
