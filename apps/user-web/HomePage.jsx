import React, { useState } from "react";

const brands = [
  { id: 1, name: "Highlands Coffee", category: "Cà phê Việt Nam", description: "Cà phê phin và thức uống hiện đại.", rating: "4.6", mark: "H", color: "#7B3428" },
  { id: 2, name: "Phúc Long", category: "Trà & cà phê", description: "Trà, trà sữa và cà phê đặc trưng.", rating: "4.5", mark: "PL", color: "#176B45" },
  { id: 3, name: "The Coffee House", category: "Cà phê & không gian", description: "Không gian gặp gỡ, học tập và làm việc.", rating: "4.4", mark: "TCH", color: "#C66A35" },
  { id: 4, name: "Katinat", category: "Trà & cà phê", description: "Thực đơn sáng tạo, phong cách hiện đại.", rating: "4.5", mark: "K", color: "#6C4938" },
  { id: 5, name: "Phê La", category: "Trà đặc sản", description: "Thức uống lấy cảm hứng từ trà đặc sản.", rating: "4.5", mark: "PL", color: "#8C6A42" },
  { id: 6, name: "Trung Nguyên", category: "Cà phê Việt Nam", description: "Thương hiệu cà phê Việt với hương vị đặc trưng.", rating: "4.3", mark: "TN", color: "#9B6A24" },
];

const button = { border: 0, borderRadius: 10, background: "#315C43", color: "#fff", padding: "11px 14px", fontWeight: 700, cursor: "pointer" };

export default function HomePage({ onOpenBrand }) {
  const [query, setQuery] = useState("");
  const shown = brands.filter(b => (b.name + b.category).toLowerCase().includes(query.toLowerCase()));
  return <div style={{ minHeight: "100vh", background: "#F7F5F0", color: "#252820", fontFamily: "Inter, system-ui, sans-serif" }}>
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap", padding: "18px 6vw", background: "#fff", borderBottom: "1px solid #e9e5dc" }}>
      <strong style={{ color: "#315C43", fontSize: 22 }}>☕ SaigonCoffee</strong>
      <nav style={{ display: "flex", gap: 20, alignItems: "center", color: "#65685f", fontSize: 14 }}><span>Khám phá</span><span>Đánh giá</span><span>Về chúng tôi</span><button style={button}>Đăng nhập</button></nav>
    </header>
    <section style={{ margin: "28px 6vw", padding: "clamp(28px, 5vw, 60px)", borderRadius: 26, background: "linear-gradient(120deg,#214A36,#47785A)", color: "#fff", display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(130px,.5fr)", gap: 24, alignItems: "center" }}>
      <div><div style={{ color: "#D7E6D9", textTransform: "uppercase", letterSpacing: 2, fontSize: 11, fontWeight: 800 }}>Khám phá cà phê Sài Gòn</div><h1 style={{ fontSize: "clamp(36px,5vw,58px)", lineHeight: 1.06, letterSpacing: -2, margin: "14px 0" }}>Tìm góc cà phê<br />hợp gu của bạn.</h1><p style={{ color: "#E1EAE1", lineHeight: 1.7, maxWidth: 560 }}>Khám phá thương hiệu, tìm chi nhánh phù hợp và đọc đánh giá từ cộng đồng yêu đồ uống tại TP. Hồ Chí Minh.</p><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm thương hiệu cà phê, trà..." style={{ width: "100%", maxWidth: 500, boxSizing: "border-box", padding: 15, borderRadius: 12, border: "1px solid #e2dfd5", marginTop: 12 }} /></div>
      <div style={{ display: "grid", placeItems: "center", fontSize: 100, background: "#F1E8D8", color: "#315C43", borderRadius: "50%", width: 150, height: 150, justifySelf: "center" }}>☕</div>
    </section>
    <main style={{ padding: "8px 6vw 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: 12, marginBottom: 22 }}><div><h2 style={{ margin: "0 0 8px", fontSize: 28 }}>Thương hiệu nổi bật</h2><span style={{ color: "#77796f", fontSize: 14 }}>Chọn thương hiệu để xem chi tiết, chi nhánh và đánh giá.</span></div><span style={{ color: "#77796f", fontSize: 14 }}>{shown.length} thương hiệu</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18 }}>
        {shown.map(b => <article key={b.id} style={{ background: "#fff", border: "1px solid #eae7df", borderRadius: 18, overflow: "hidden" }}>
          <div style={{ minHeight: 110, display: "grid", placeItems: "center", background: `linear-gradient(135deg,${b.color},${b.color}bb)` }}><div style={{ width: 64, height: 64, display: "grid", placeItems: "center", borderRadius: 20, color: "#fff", fontWeight: 800, fontSize: 23, background: "#ffffff20", border: "1px solid #ffffff55" }}>{b.mark}</div></div>
          <div style={{ padding: 18 }}><span style={{ background: "#EDF3ED", color: "#315C43", borderRadius: 20, padding: "5px 9px", fontSize: 11 }}>{b.category}</span><h3 style={{ margin: "14px 0 7px" }}>{b.name}</h3><p style={{ color: "#77796f", fontSize: 14, minHeight: 40, lineHeight: 1.5 }}>{b.description}</p><p>★ {b.rating} <span style={{ color: "#888", fontSize: 12 }}>điểm minh họa</span></p><button style={{ ...button, width: "100%" }} onClick={() => onOpenBrand ? onOpenBrand(b.id) : window.alert(`Mở chi tiết thương hiệu ID ${b.id}; cần kết nối router/API.`)}>Xem thương hiệu →</button></div>
        </article>)}
      </div>
      <p style={{ color: "#77796f", fontSize: 12, marginTop: 18 }}>Dữ liệu hiện tại là dữ liệu minh họa, sẽ thay bằng dữ liệu từ API/PostgreSQL.</p>
    </main>
    <footer style={{ padding: "24px 6vw", borderTop: "1px solid #e9e5dc", color: "#77796f", fontSize: 13, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}> <strong>SaigonCoffee</strong><span>Khám phá • Chia sẻ • Đánh giá</span><span>© 2026 SaigonCoffee</span></footer>
  </div>;
}
