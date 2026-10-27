import React from "react";

const demo = {
  id: 1, name: "Highlands Coffee", category: "Cà phê Việt Nam",
  description: "Điểm hẹn quen thuộc dành cho người yêu cà phê, với cà phê phin, trà và thức uống hiện đại.",
  rating: "4.6",
  branches: [
    { name: "Chi nhánh Nguyễn Huệ", address: "Khu vực phố đi bộ Nguyễn Huệ, Quận 1", hours: "07:00–22:00", rating: "4.7" },
    { name: "Chi nhánh Thảo Điền", address: "Khu vực Thảo Điền, TP. Thủ Đức", hours: "07:00–22:00", rating: "4.5" },
    { name: "Chi nhánh Phú Nhuận", address: "Khu vực Phú Nhuận, TP. Hồ Chí Minh", hours: "07:00–22:00", rating: "4.4" }
  ],
  menu: [{ name: "Phin sữa đá", type: "Cà phê", price: "35.000đ" }, { name: "Phin đen đá", type: "Cà phê", price: "29.000đ" }, { name: "Trà sen vàng", type: "Trà", price: "45.000đ" }],
  reviews: [{ name: "Minh Anh", score: 5, text: "Không gian dễ tìm, phù hợp gặp bạn bè. Cà phê đậm vị." }, { name: "Quốc Bảo", score: 4, text: "Menu quen thuộc, phục vụ khá nhanh vào ngày thường." }]
};
const panel = { background: "#fff", border: "1px solid #eae7df", borderRadius: 18, padding: 22, marginBottom: 18 };
const muted = { color: "#77796f", fontSize: 14, lineHeight: 1.6 };

export default function BrandDetailPage({ brandId, brand, onBack }) {
  // Thay dữ liệu demo bằng kết quả API theo brandId khi backend sẵn sàng.
  const item = brand || { ...demo, id: brandId || demo.id };
  return <div style={{ minHeight: "100vh", background: "#F7F5F0", color: "#252820", fontFamily: "Inter,system-ui,sans-serif" }}>
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 6vw", background: "#fff", borderBottom: "1px solid #e9e5dc" }}><strong style={{ color: "#315C43", fontSize: 21 }}>☕ SaigonCoffee</strong><button onClick={onBack || (() => window.history.back())} style={{ border: "1px solid #d9dfd7", borderRadius: 10, padding: "10px 13px", background: "#fff", color: "#315C43", cursor: "pointer" }}>← Quay lại</button></header>
    <section style={{ margin: "28px 6vw", padding: "clamp(25px,4vw,48px)", borderRadius: 25, background: "linear-gradient(120deg,#214A36,#47785A)", color: "#fff", display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(130px,.5fr)", gap: 24, alignItems: "center" }}>
      <div><div style={{ color: "#D7E6D9", fontSize: 12, letterSpacing: 1.5 }}>{item.category || "THƯƠNG HIỆU"}</div><h1 style={{ fontSize: "clamp(32px,4vw,48px)", margin: "12px 0" }}>{item.name || `Thương hiệu #${item.id}`}</h1><p style={{ color: "#E1EAE1", lineHeight: 1.7 }}>{item.description || "Thông tin thương hiệu sẽ được tải từ hệ thống."}</p><div style={{ marginTop: 18 }}>★ {item.rating || "—"} điểm　·　{item.branches?.length || 0} chi nhánh mẫu</div></div>
      <div style={{ width: 140, height: 140, borderRadius: 38, background: "#ffffff20", border: "1px solid #ffffff50", display: "grid", placeItems: "center", fontSize: 48, fontWeight: 800, justifySelf: "center" }}>☕</div>
    </section>
    <main style={{ padding: "8px 6vw 60px", display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(250px,.8fr)", gap: 22 }}>
      <div>
        <section style={panel}><h2 style={{ marginTop: 0 }}>Chi nhánh</h2><p style={muted}>Thông tin các địa điểm thuộc thương hiệu.</p>{(item.branches || demo.branches).map((b, i) => <div key={b.id || b.name || i} style={{ padding: "14px 0", borderBottom: "1px solid #f0eee8" }}><strong>{b.name}</strong><p style={{ ...muted, margin: "6px 0" }}>{b.address || "Chưa cập nhật địa chỉ"}</p><span style={{ fontSize: 13 }}>★ {b.rating || "—"}　·　{b.hours || "Chưa cập nhật giờ mở cửa"}</span></div>)}</section>
        <section style={panel}><h2 style={{ marginTop: 0 }}>Đánh giá gần đây</h2>{demo.reviews.map(r => <div key={r.name} style={{ padding: "13px 0", borderBottom: "1px solid #f0eee8" }}><strong>{r.name}</strong><span style={{ float: "right" }}>★ {r.score}/5</span><p style={muted}>{r.text}</p></div>)}</section>
      </div>
      <aside>
        <section style={panel}><h2 style={{ marginTop: 0 }}>Menu nổi bật</h2><p style={muted}>Giá minh họa.</p>{demo.menu.map(m => <div key={m.name} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "13px 0", borderBottom: "1px solid #f0eee8" }}><div><strong>{m.name}</strong><div style={muted}>{m.type}</div></div><strong>{m.price}</strong></div>)}</section>
        <section style={panel}><h3 style={{ marginTop: 0 }}>Bạn đã ghé quán?</h3><p style={muted}>Đăng nhập để chia sẻ trải nghiệm của bạn.</p><button onClick={() => window.alert("Chức năng đăng nhập/đánh giá sẽ tích hợp sau.")} style={{ width: "100%", border: 0, borderRadius: 10, padding: 12, background: "#315C43", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Viết đánh giá</button></section>
      </aside>
    </main>
  </div>;
}
