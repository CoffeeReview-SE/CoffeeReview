import React, { useState, useEffect, useRef } from "react";

const INITIAL_BRANDS = [
  { id: 1, name: "The Coffee House", type: "Cà phê, trà, bánh", branchCount: 12, badge: "#1A2518", mark: ["THE", "COFFEE", "HOUSE"], logo: "" },
  { id: 2, name: "Phúc Long", type: "Trà, cà phê", branchCount: 18, badge: "#1F6B45", mark: ["PHÚC", "LONG"], logo: "" },
  { id: 3, name: "Highlands Coffee", type: "Cà phê, trà, bánh", branchCount: 25, badge: "#B22222", mark: ["HIGHLANDS", "COFFEE"], logo: "" },
  { id: 4, name: "Cộng Cà Phê", type: "Cà phê, đồ uống", branchCount: 14, badge: "#2B3A2A", mark: ["CỘNG"], logo: "" },
  { id: 5, name: "Trung Nguyên Legend", type: "Cà phê năng lượng, sách", branchCount: 20, badge: "#1C1C1C", mark: ["TRUNG", "NGUYÊN"], logo: "" },
  { id: 6, name: "Katinat Saigon Kafe", type: "Trà sữa, cà phê", branchCount: 16, badge: "#354A36", mark: ["KATINAT"], logo: "" },
  { id: 7, name: "Cheese Coffee", type: "Cà phê, trà, bánh pastry", branchCount: 10, badge: "#1E2A38", mark: ["CHEESE", "COFFEE"], logo: "" },
  { id: 8, name: "Mellower Coffee", type: "Cà phê specialty, bánh", branchCount: 5, badge: "#4A3B32", mark: ["MELLOWER"], logo: "" }
];

const paths = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  cup: <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2M3 21h16M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4" />,
  filter: <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
};

const Icon = ({ n, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[n]}</svg>
);

function Header({ currentNav = "brands", onNavigate }) {
  const [lang, setLang] = useState("VI");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: "VI", label: "Tiếng Việt" },
    { code: "EN", label: "English" },
    { code: "KO", label: "한국어" }
  ];

  // Đóng dropdown khi click ra ngoài
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
    <header className="bl-bar">
      <button className="bl-logo" onClick={() => handleNavClick("home")}>
        <Icon n="cup" size={30} />
        <span>
          <b>SaigonCoffee</b>
          <small>Khám phá cà phê Sài Gòn</small>
        </span>
      </button>

      <nav className="bl-nav" aria-label="Điều hướng chính">
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

      <div className="bl-tools">
        {/* Custom Language Dropdown (giống BrandDetailPage) */}
        <div className="bl-lang-dropdown" ref={dropdownRef}>
          <button 
            className="bl-lang-btn" 
            onClick={() => setIsOpen(!isOpen)} 
            aria-expanded={isOpen}
            aria-label="Chọn ngôn ngữ"
          >
            <span>{lang}</span>
            <span className={`bl-chevron-icon ${isOpen ? "open" : ""}`}>
              <Icon n="chevron" size={12} />
            </span>
          </button>
          
          {isOpen && (
            <div className="bl-lang-menu">
              {languages.map((item) => (
                <button
                  key={item.code}
                  className={`bl-lang-item ${lang === item.code ? "active" : ""}`}
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
    return <img src={item.logo} alt={`Logo ${item.name}`} className="bl-badge-img" />;
  }
  const lines = item.mark || [item.name];
  return (
    <div className="bl-badge-circle" style={{ backgroundColor: item.badge || "#2B3A2A" }}>
      {lines.map((line, idx) => (
        <span key={idx}>{line}</span>
      ))}
    </div>
  );
}

function BrandCard({ brand, onSelect }) {
  return (
    <div className="bl-card" onClick={() => onSelect && onSelect(brand)}>
      <div className="bl-card-hero">
        <BrandBadge item={brand} />
        <button className="bl-play-btn" aria-label={`Xem thông tin ${brand.name}`}>
          <Icon n="play" size={14} />
        </button>
      </div>
      <div className="bl-card-info">
        <h3>{brand.name}</h3>
        <p className="bl-card-type">{brand.type}</p>
        <p className="bl-card-branch">
          <Icon n="pin" size={14} /> {brand.branchCount} chi nhánh
        </p>
      </div>
    </div>
  );
}

export default function BrandListPage({ onSelectBrand, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredBrands = INITIAL_BRANDS.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.type.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedFilter === "all") return matchesSearch;
    return matchesSearch && b.type.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  return (
    <div className="bl-page">
      <style>{styles}</style>

      <Header currentNav="brands" onNavigate={onNavigate} />

      <section className="bl-hero">
        <div className="bl-hero-content">
          <h1>Khám phá những thương hiệu<br />cà phê đặc sắc tại Sài Gòn</h1>
          <p>
            Từ những quán cà phê lâu đời đến những thương hiệu hiện đại, chúng tôi mang
            đến cho bạn hành trình vị cà phê độc đáo.
          </p>

          <div className="bl-search-box">
            <input
              type="text"
              placeholder="Tìm kiếm thương hiệu, khu vực, loại hình..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="bl-search-btn" aria-label="Tìm kiếm">
              <Icon n="search" size={18} />
            </button>
          </div>
        </div>

        <div className="bl-hero-illustration">
          <div className="bl-cup-shadow"></div>
          <div className="bl-cup-graphic">
            <svg viewBox="0 0 200 160" width="220" height="170" fill="none">
              <ellipse cx="100" cy="140" rx="90" ry="15" fill="#2E1B11" opacity="0.3" />
              <path d="M 30 40 L 45 120 Q 100 135 155 120 L 170 40 Z" fill="#6E473B" />
              <ellipse cx="100" cy="40" rx="70" ry="18" fill="#4B2D24" />
              <ellipse cx="100" cy="40" rx="60" ry="14" fill="#2E1810" />
              <path d="M 160 55 C 195 55 195 95 152 105" stroke="#6E473B" strokeWidth="12" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>
      </section>

      <main className="bl-main">
        <div className="bl-section-header">
          <h2>Tất cả thương hiệu ({filteredBrands.length})</h2>

          <div className="bl-filter-tabs">
            <button 
              className={selectedFilter === "all" ? "active" : ""} 
              onClick={() => setSelectedFilter("all")}
            >
              Tất cả
            </button>
            <button 
              className={selectedFilter === "trà" ? "active" : ""} 
              onClick={() => setSelectedFilter("trà")}
            >
              Trà & Cà phê
            </button>
            <button 
              className={selectedFilter === "bánh" ? "active" : ""} 
              onClick={() => setSelectedFilter("bánh")}
            >
              Cà phê & Bánh
            </button>
          </div>
        </div>

        {filteredBrands.length > 0 ? (
          <div className="bl-grid">
            {filteredBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} onSelect={onSelectBrand} />
            ))}
          </div>
        ) : (
          <div className="bl-empty">
            <Icon n="cup" size={48} />
            <p>Không tìm thấy thương hiệu phù hợp với từ khóa "{searchTerm}"</p>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = `
.bl-page {
  --brown-dark: #3A2012;
  --brown-mid: #52311E;
  --brown-light: #704732;
  --accent-gold: #D4A359;
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

.bl-page * { box-sizing: border-box; }

/* Header Component */
.bl-bar {
  display: flex;
  align-items: center;
  gap: 28px;
  height: 60px;
  padding: 0 6vw;
  color: #fff;
  background: linear-gradient(180deg,#5A3220,#442211);
}

.bl-logo {
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

.bl-logo b { display: block; font-size: 15px; line-height: 1.15; }
.bl-logo small { display: block; font-size: 9px; opacity: .65; }

.bl-nav { display: flex; flex: 1; gap: 26px; }

.bl-nav button {
  padding: 21px 0 17px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: none;
  color: rgba(255,255,255,.82);
  font-size: 13px;
  cursor: pointer;
}

.bl-nav button:hover { color: #fff; }
.bl-nav button[aria-current=page] { color: #fff; font-weight: 600; border-color: #E9A24B; }

.bl-tools { display: flex; align-items: center; gap: 14px; }

/* Custom Dropdown Ngôn Ngữ - Giống hệt BrandDetailPage */
.bl-lang-dropdown { position: relative; }
.bl-lang-btn {
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
.bl-lang-btn:hover {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.4);
}
.bl-chevron-icon {
  display: flex;
  align-items: center;
  transition: transform 0.25s ease;
}
.bl-chevron-icon.open { transform: rotate(180deg); }

.bl-lang-menu {
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
.bl-lang-item {
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
.bl-lang-item:hover {
  background: #F6EFE7;
  color: #6B3A22;
}
.bl-lang-item.active {
  background: #6B3A22;
  color: #fff;
  font-weight: 600;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.bl-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 5vw 50px;
  background: linear-gradient(135deg, #3D2214 0%, #593722 50%, #2A160C 100%);
  color: #fff;
  overflow: hidden;
}

.bl-hero-content { max-width: 580px; z-index: 2; }
.bl-hero-content h1 { font-size: 32px; font-weight: 700; line-height: 1.3; margin: 0 0 14px 0; }
.bl-hero-content p { font-size: 13.5px; line-height: 1.6; opacity: 0.82; margin: 0 0 24px 0; }

.bl-search-box {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 30px;
  padding: 4px 6px 4px 18px;
  max-width: 440px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.bl-search-box input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--text-dark);
  background: transparent;
}

.bl-search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #6E442B;
  color: #fff;
  cursor: pointer;
}

.bl-hero-illustration {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 40px;
  z-index: 1;
}

.bl-main { max-width: 1200px; margin: 0 auto; padding: 36px 5vw 60px; }
.bl-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.bl-section-header h2 { font-size: 18px; font-weight: 700; margin: 0; }
.bl-filter-tabs { display: flex; gap: 8px; }

.bl-filter-tabs button {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: #fff;
  font-size: 12.5px;
  color: var(--text-muted);
  cursor: pointer;
}

.bl-filter-tabs button.active {
  background: var(--brown-dark);
  color: #fff;
  border-color: var(--brown-dark);
}

.bl-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.bl-card {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(42, 24, 16, 0.04);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.bl-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(42, 24, 16, 0.1);
}

.bl-card-hero {
  position: relative;
  height: 140px;
  background: linear-gradient(140deg, #3C4A3A 0%, #20291F 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bl-badge-circle {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  text-align: center;
  line-height: 1.15;
  padding: 4px;
}

.bl-play-btn {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #fff;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bl-card-info { padding: 14px 16px; }
.bl-card-info h3 { margin: 0 0 4px 0; font-size: 14px; font-weight: 700; }
.bl-card-type { margin: 0 0 10px 0; font-size: 12px; color: var(--text-muted); }
.bl-card-branch { margin: 0; font-size: 11.5px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
.bl-empty { text-align: center; padding: 60px 20px; color: var(--text-muted); }

@media (max-width: 1024px) { .bl-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) {
  .bl-hero { flex-direction: column; text-align: center; padding: 30px 5vw; }
  .bl-hero-illustration { margin: 20px 0 0 0; }
  .bl-grid { grid-template-columns: repeat(2, 1fr); }
  .bl-section-header { flex-direction: column; align-items: flex-start; gap: 12px; }
}
@media (max-width: 480px) { .bl-grid { grid-template-columns: 1fr; } }
`;
