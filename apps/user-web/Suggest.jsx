import React, { useEffect, useRef, useState } from "react";
import BrandLogo from "../BrandLogo.jsx";

// Dữ liệu mẫu thương hiệu đã chọn trước đó (nếu không được truyền qua props)
const DEFAULT_SELECTED_BRANDS = [
  { id: 2, name: "Phúc Long", type: "Trà, cà phê", branchCount: 18, badge: "#1F6B45", mark: ["PHÚC", "LONG"] },
  { id: 3, name: "Highlands Coffee", type: "Cà phê, trà, bánh", branchCount: 25, badge: "#B22222", mark: ["HIGHLANDS", "COFFEE"] },
  { id: 1, name: "The Coffee House", type: "Cà phê, trà, bánh", branchCount: 12, badge: "#1A2518", mark: ["THE", "COFFEE", "HOUSE"] }
];

const paths = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  chevron: <path d="m6 9 6 6 6-6" />,
  cup: <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2M3 21h16M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4" />,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
  check: <path d="M20 6L9 17l-5-5" />,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
  store: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
};

const Icon = ({ n, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[n]}</svg>
);

function Header({ currentNav = "suggestions", onNavigate }) {
  const [lang, setLang] = useState("VI");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: "VI", label: "Tiếng Việt" },
    { code: "EN", label: "English" },
    { code: "KO", label: "한국어" }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = [["home", "Trang chủ"], ["brands", "Thương hiệu"], ["map", "Bản đồ"], ["suggestions", "Đề xuất"]];

  const handleNavClick = (key) => {
    if (onNavigate) {
      onNavigate(key);
    }
  };

  return (
    <header className="sg-bar">
      <button className="sg-logo" onClick={() => handleNavClick("home")}>
        <BrandLogo size={34} tone="light" />
        <span>
          <b>SaigonCoffee</b>
          <small>Khám phá cà phê Sài Gòn</small>
        </span>
      </button>

      <nav className="sg-nav" aria-label="Điều hướng chính">
        {items.map(([k, label]) => (
          <button
            key={k}
            aria-current={k === currentNav ? "page" : undefined}
            onClick={() => handleNavClick(k)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="sg-tools">
        {/* Dropdown Ngôn Ngữ */}
        <div className="sg-lang-dropdown" ref={dropdownRef}>
          <button 
            className="sg-lang-btn" 
            onClick={() => setIsOpen(!isOpen)} 
            aria-expanded={isOpen}
            aria-label="Chọn ngôn ngữ"
          >
            <span>{lang}</span>
            <span className={`sg-chevron-icon ${isOpen ? "open" : ""}`}>
              <Icon n="chevron" size={12} />
            </span>
          </button>
          
          {isOpen && (
            <div className="sg-lang-menu">
              {languages.map((item) => (
                <button
                  key={item.code}
                  className={`sg-lang-item ${lang === item.code ? "active" : ""}`}
                  onClick={() => {
                    setLang(item.code);
                    setIsOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function BrandBadge({ item }) {
  if (item.logo) {
    return <img src={item.logo} alt={`Logo ${item.name}`} className="sg-badge-img" />;
  }
  const lines = item.mark || [item.name];
  return (
    <div className="sg-badge-circle" style={{ backgroundColor: item.badge || "#1F6B45" }}>
      {lines.map((line, idx) => (
        <span key={idx}>{line}</span>
      ))}
    </div>
  );
}

export default function SuggestionsPage({ recentBrands = [], onSelectBrand, onNavigate }) {
  // Sử dụng danh sách truyền vào hoặc dùng danh sách mặc định
  const displayBrands = recentBrands.length > 0 ? recentBrands : DEFAULT_SELECTED_BRANDS;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    brandName: "",
    address: "",
    note: ""
  });

  const [submitted, setSubmitted] = useState(false);

  // Nếu người dùng bấm chọn từ danh sách "Thương hiệu đã chọn trước đó"
  const handleSelectPreBrand = (brand) => {
    setFormData(prev => ({
      ...prev,
      brandName: brand.name
    }));
    if (onSelectBrand) {
      onSelectBrand(brand);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.brandName.trim()) {
      alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Thương hiệu!");
      return;
    }
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({ name: "", phone: "", brandName: "", address: "", note: "" });
  };

  return (
    <div className="sg-page">
      <style>{styles}</style>

      <Header currentNav="suggestions" onNavigate={onNavigate} />

      {/* Hero Header Banner */}
      <section className="sg-hero">
        <div className="sg-hero-in">
          <h1>Đề xuất Thương hiệu & Địa điểm</h1>
          <p>
            Bạn biết một quán cà phê tuyệt vời hoặc thương hiệu chưa có trên SaigonCoffee? 
            Hãy chia sẻ ngay với chúng tôi để cùng lan tỏa văn hóa cà phê Sài Gòn!
          </p>
        </div>
      </section>

      <main className="sg-main">
        {/* Danh sách các thương hiệu người dùng đã quan tâm/chọn trước đó */}
        {displayBrands.length > 0 && (
          <section className="sg-selected-section">
            <div className="sg-section-title">
              <h2>Các thương hiệu bạn đã xem / chọn trước đó</h2>
              <p>Bấm vào thương hiệu bên dưới để tự động điền vào mẫu đề xuất</p>
            </div>
            <div className="sg-selected-grid">
              {displayBrands.map((b) => (
                <div 
                  key={b.id} 
                  className={`sg-selected-card ${formData.brandName === b.name ? "active" : ""}`}
                  onClick={() => handleSelectPreBrand(b)}
                >
                  <BrandBadge item={b} />
                  <div className="sg-card-info">
                    <h4>{b.name}</h4>
                    <p>{b.type}</p>
                    <span><Icon n="pin" size={12} /> {b.branchCount || b.branches || 0} chi nhánh</span>
                  </div>
                  {formData.brandName === b.name && (
                    <span className="sg-card-check"><Icon n="check" size={14} /></span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Khung Form đề xuất nằm ở giữa */}
        <section className="sg-form-container">
          <div className="sg-form-card">
            {submitted ? (
              <div className="sg-success-state">
                <div className="sg-success-icon">
                  <Icon n="check" size={36} />
                </div>
                <h3>Gửi đề xuất thành công!</h3>
                <p>Cảm ơn <strong>{formData.name}</strong> đã đóng góp thông tin về <strong>{formData.brandName}</strong>. Chúng tôi sẽ xác minh và cập nhật sớm nhất.</p>
                <button className="sg-btn-primary" onClick={handleReset}>
                  Gửi đề xuất khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="sg-form">
                <div className="sg-form-header">
                  <h3>Biểu mẫu gửi đề xuất</h3>
                  <p>Vui lòng điền thông tin chi tiết dưới đây</p>
                </div>

                <div className="sg-field-group">
                  <label htmlFor="name">
                    <Icon n="user" size={15} /> Họ và tên <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Nhập họ và tên của bạn"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="sg-field-group">
                  <label htmlFor="phone">
                    <Icon n="phone" size={15} /> Số điện thoại <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Nhập số điện thoại liên hệ"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="sg-field-group">
                  <label htmlFor="brandName">
                    <Icon n="store" size={15} /> Thương hiệu muốn đề xuất <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="brandName"
                    name="brandName"
                    placeholder="Tên quán hoặc thương hiệu cà phê"
                    value={formData.brandName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="sg-field-group">
                  <label htmlFor="address">
                    <Icon n="pin" size={15} /> Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="Số nhà, tên đường, Quận/Huyện tại TP.HCM"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="sg-field-group">
                  <label htmlFor="note">Ghi chú / Mới có gì đặc biệt?</label>
                  <textarea
                    id="note"
                    name="note"
                    rows="3"
                    placeholder="Chia sẻ lý do bạn thích hoặc thông tin chi tiết thêm về thương hiệu này..."
                    value={formData.note}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <button type="submit" className="sg-btn-submit">
                  <Icon n="send" size={16} /> Gửi đề xuất
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = `
.sg-page {
  --brown-dark: #3A2012;
  --brown-mid: #6B3A22;
  --brown-light: #8B7A6C;
  --accent-gold: #E9A24B;
  --bg-color: #FAF7F3;
  --text-dark: #2A1810;
  --text-muted: #7E6E65;
  --card-bg: #FFFFFF;
  --border-color: #EFE6DD;

  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-dark);
  font-family: Inter, system-ui, -apple-system, sans-serif;
}

.sg-page * { box-sizing: border-box; }
.sg-page :where(button,input,textarea){font:inherit}
.sg-page button:focus-visible,.sg-page input:focus-visible,.sg-page textarea:focus-visible{outline:2px solid var(--accent-gold);outline-offset:2px}

/* Header Component */
.sg-bar {
  display: flex;
  align-items: center;
  gap: 28px;
  height: 60px;
  padding: 0 6vw;
  color: #fff;
  background: linear-gradient(180deg,#5A3220,#442211);
}

.sg-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  border: 0;
  background: none;
  color: #fff;
  text-align: left;
  cursor: pointer;
}

.sg-logo b { display: block; font-size: 15px; line-height: 1.15; }
.sg-logo small { display: block; font-size: 9px; opacity: .65; }

.sg-nav { display: flex; flex: 1; gap: 26px; }

.sg-nav button {
  padding: 21px 0 17px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: none;
  color: rgba(255,255,255,.82);
  font-size: 13px;
  cursor: pointer;
}

.sg-nav button:hover { color: #fff; }
.sg-nav button[aria-current=page] { color: #fff; font-weight: 600; border-color: var(--accent-gold); }

.sg-tools { display: flex; align-items: center; gap: 14px; }

/* Custom Dropdown Ngôn Ngữ */
.sg-lang-dropdown { position: relative; }
.sg-lang-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  background: rgba(255,255,255,0.08);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.sg-lang-btn:hover {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.4);
}
.sg-chevron-icon {
  display: flex;
  align-items: center;
  transition: transform 0.25s ease;
}
.sg-chevron-icon.open { transform: rotate(180deg); }

.sg-lang-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  min-width: 110px;
  padding: 6px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(42,24,16,0.18);
  border: 1px solid var(--border-color);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: fadeInDown 0.2s ease;
}
.sg-lang-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--text-dark);
  font-size: 12px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.sg-lang-item:hover {
  background: #F6EFE7;
  color: var(--brown-mid);
}
.sg-lang-item.active {
  background: var(--brown-mid);
  color: #fff;
  font-weight: 600;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hero Section */
.sg-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 6vw;
  text-align: center;
  color: #fff;
  background: radial-gradient(circle at 50% 30%, rgba(233,168,90,.3), transparent 60%),
              linear-gradient(100deg, #2B160B 0%, #4A2A18 55%, #3A2415 100%);
}
.sg-hero-in { max-width: 620px; }
.sg-hero h1 { margin: 0 0 12px; font-size: 28px; font-weight: 700; }
.sg-hero p { margin: 0; font-size: 14px; opacity: 0.85; line-height: 1.6; }

/* Main Content */
.sg-main { max-width: 1000px; margin: 0 auto; padding: 36px 5vw 60px; }

/* Selected Brands Section */
.sg-selected-section { margin-bottom: 36px; }
.sg-section-title { margin-bottom: 16px; text-align: center; }
.sg-section-title h2 { margin: 0 0 4px; font-size: 18px; font-weight: 700; color: var(--brown-dark); }
.sg-section-title p { margin: 0; font-size: 12.5px; color: var(--text-muted); }

.sg-selected-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.sg-selected-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1.5px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.sg-selected-card:hover {
  border-color: var(--accent-gold);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(42, 24, 16, 0.08);
}
.sg-selected-card.active {
  border-color: var(--brown-mid);
  background: #FAF3EC;
}

.sg-badge-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 8px;
  font-weight: 800;
  line-height: 1.1;
  text-align: center;
  flex-shrink: 0;
}
.sg-badge-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.sg-card-info { flex: 1; min-width: 0; }
.sg-card-info h4 { margin: 0 0 2px; font-size: 13.5px; font-weight: 700; color: var(--text-dark); }
.sg-card-info p { margin: 0 0 4px; font-size: 11.5px; color: var(--text-muted); }
.sg-card-info span { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--brown-mid); }
.sg-card-check {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--brown-mid);
  color: #fff;
}

/* Form Container */
.sg-form-container {
  display: flex;
  justify-content: center;
}

.sg-form-card {
  width: 100%;
  max-width: 580px;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 32px 36px;
  box-shadow: 0 8px 30px rgba(42, 24, 16, 0.06);
}

.sg-form-header { margin-bottom: 24px; text-align: center; }
.sg-form-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; color: var(--brown-dark); }
.sg-form-header p { margin: 0; font-size: 13px; color: var(--text-muted); }

.sg-form { display: flex; flex-direction: column; gap: 18px; }

.sg-field-group { display: flex; flex-direction: column; gap: 6px; }
.sg-field-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dark);
}
.sg-field-group label .req { color: #D32F2F; margin-left: 2px; }

.sg-field-group input, .sg-field-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 13.5px;
  color: var(--text-dark);
  background: #FAF9F7;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.sg-field-group input:focus, .sg-field-group textarea:focus {
  background: #fff;
  border-color: var(--brown-mid);
}

.sg-btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  padding: 12px;
  border: 0;
  border-radius: 8px;
  background: var(--brown-mid);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}
.sg-btn-submit:hover { background: var(--brown-dark); }

/* Success State */
.sg-success-state { text-align: center; padding: 20px 10px; }
.sg-success-icon {
  display: inline-grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #E8F5E9;
  color: #2E7D32;
  margin-bottom: 16px;
}
.sg-success-state h3 { margin: 0 0 8px; font-size: 20px; color: var(--text-dark); }
.sg-success-state p { margin: 0 0 24px; font-size: 13.5px; color: var(--text-muted); line-height: 1.6; }
.sg-btn-primary {
  padding: 10px 24px;
  border: 0;
  border-radius: 8px;
  background: var(--brown-mid);
  color: #fff;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 640px) {
  .sg-bar { gap: 12px; flex-wrap: wrap; height: auto; padding: 10px 5vw 0; }
  .sg-nav { order: 3; flex-basis: 100%; gap: 16px; overflow-x: auto; }
  .sg-nav button { padding: 10px 0; white-space: nowrap; }
  .sg-logo small { display: none; }
  .sg-tools { margin-left: auto; }
  .sg-form-card { padding: 24px 20px; }
}
`;
