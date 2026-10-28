import React, { useState, useEffect, useRef } from "react";
import { LANGUAGES, useLanguage } from "./LanguageContext.jsx";
import { localizedCategory, screenText } from "./brandDetailTranslations.js";
import { getUserApi, toBrandCard } from "./api.js";
import BrandDescriptionAudio from "./BrandDescriptionAudio.jsx";

/* ==========================================================================
   [PHẦN CHÈN THÊM - ĐỂ MÌNH CHÈN]: IMPORT HÌNH ẢNH TỪ 2 THƯ MỤC CỦA BẠN
   (Giống hệt cấu hình ở trang BrandDetailPage)
   ========================================================================== */

// 1. Ảnh Không gian (image coffee shop/)
import coverHighlands from "../../public/image/High land coffee.jpg";
import coverKatinat from "../../public/image/katinat.jpg";
import coverKoi from "../../public/image/KOI the.jpg";
import coverMilano from "../../public/image/milano.jpg";
import coverPheLa from "../../public/image/Phe la.jpg";
import coverPhucLong from "../../public/image/Phuc long.jpg";
import coverStarbucks from "../../public/image/Starbuck.jpg";
import coverTheCoffeeHouse from "../../public/image/The coffe house.jpg";
import coverTrungNguyen from "../../public/image/Trung nguyen.jpg";
import coverVivaStar from "../../public/image/viva star.jpg";

// 2. Ảnh Logo (image logo/)
import logoHighlands from "../../public/image/logo highlands coffee.jpg";
import logoKatinat from "../../public/image/logo katinat.png";
import logoKoi from "../../public/image/logo koi the.jpg";
import logoMilano from "../../public/image/logo milano.png";
import logoPheLa from "../../public/image/logo phe la.jpg";
import logoPhucLong from "../../public/image/logo phuc long.jpg";
import logoStarbucks from "../../public/image/logo starbuck.png";
import logoTheCoffeeHouse from "../../public/image/logo the coffee house.jpg";
import logoTrungNguyen from "../../public/image/logo Trung nguyen.png";
import logoVivaStar from "../../public/image/logo viva.png";

const DATABASE_BRANDS_IMAGES = {
  "phuc-long": { cover: coverPhucLong, image: logoPhucLong },
  "highlands-coffee": { cover: coverHighlands, image: logoHighlands },
  "trung-nguyen": { cover: coverTrungNguyen, image: logoTrungNguyen },
  "katinat": { cover: coverKatinat, image: logoKatinat },
  "koi-the": { cover: coverKoi, image: logoKoi },
  "phe-la": { cover: coverPheLa, image: logoPheLa },
  "milano-coffee": { cover: coverMilano, image: logoMilano },
  "viva-star-coffee": { cover: coverVivaStar, image: logoVivaStar },
  "the-coffee-house": { cover: coverTheCoffeeHouse, image: logoTheCoffeeHouse },
  "starbucks": { cover: coverStarbucks, image: logoStarbucks }
};

function getDatabaseBrandImages(brandId, brandName) {
  const idKey = String(brandId || "").toLowerCase().trim();
  if (DATABASE_BRANDS_IMAGES[idKey]) return DATABASE_BRANDS_IMAGES[idKey];

  const nameKey = String(brandName || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (DATABASE_BRANDS_IMAGES[nameKey]) return DATABASE_BRANDS_IMAGES[nameKey];

  if (nameKey.includes("phuc-long") || nameKey.includes("phuclong")) return DATABASE_BRANDS_IMAGES["phuc-long"];
  if (nameKey.includes("highland")) return DATABASE_BRANDS_IMAGES["highlands-coffee"];
  if (nameKey.includes("trung-nguyen")) return DATABASE_BRANDS_IMAGES["trung-nguyen"];
  if (nameKey.includes("katinat")) return DATABASE_BRANDS_IMAGES["katinat"];
  if (nameKey.includes("koi")) return DATABASE_BRANDS_IMAGES["koi-the"];
  if (nameKey.includes("phe-la")) return DATABASE_BRANDS_IMAGES["phe-la"];
  if (nameKey.includes("milano")) return DATABASE_BRANDS_IMAGES["milano-coffee"];
  if (nameKey.includes("viva")) return DATABASE_BRANDS_IMAGES["viva-star-coffee"];
  if (nameKey.includes("coffee-house") || nameKey.includes("tch")) return DATABASE_BRANDS_IMAGES["the-coffee-house"];
  if (nameKey.includes("starbuck")) return DATABASE_BRANDS_IMAGES["starbucks"];

  return null;
}

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

function Header({ active = "brands", go }) {
  const { languageCode, setLanguageCode, t } = useLanguage();
  const lang = languageCode.toUpperCase();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = LANGUAGES;

  // Đóng dropdown khi click ra bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = [["home", t("nav.home")], ["brands", t("nav.brands")], ["map", t("nav.map")], ["suggestions", t("nav.suggestions")]];
  
  return (
    <header className="hp-bar">
      <button className="hp-logo" onClick={() => go("home")}>
        <Icon n="cup" size={30} />
        <span>
          <b>SaigonCoffee</b>
          <small>{t("brand.tagline")}</small>
        </span>
      </button>

      <nav className="hp-nav" aria-label="Điều hướng chính">
        {items.map(([k, label]) => (
          <button 
            key={k} 
            aria-current={active === k ? "page" : undefined} 
            onClick={() => go(k)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="hp-tools">
        {/* Custom Dropdown Ngôn Ngữ */}
        <div className="hp-lang-dropdown" ref={dropdownRef}>
          <button 
            className="hp-lang-btn" 
            onClick={() => setIsOpen(!isOpen)} 
            aria-expanded={isOpen}
            aria-label="Chọn ngôn ngữ"
          >
            <span>{lang}</span>
            <span className={`hp-chevron-icon ${isOpen ? "open" : ""}`}>
              <Icon n="chevron" size={12} />
            </span>
          </button>
          
          {isOpen && (
            <div className="hp-lang-menu">
              {languages.map((item) => (
                <button
                  key={item.code}
                  className={`hp-lang-item ${lang === item.code.toUpperCase() ? "active" : ""}`}
                  onClick={() => {
                    setLanguageCode(item.code);
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

function Cup() {
  return (
    <svg className="hp-cup" viewBox="0 0 340 230" aria-hidden="true">
      <defs>
        <linearGradient id="hp-cupg" x1="0" x2="1">
          <stop offset="0" stopColor="#9A7C5C" />
          <stop offset=".55" stopColor="#6A503A" />
          <stop offset="1" stopColor="#3E2B1D" />
        </linearGradient>
      </defs>
      <ellipse cx="170" cy="196" rx="160" ry="22" fill="#1B0E07" opacity=".5" />
      <ellipse cx="170" cy="184" rx="150" ry="22" fill="#3B2617" />
      <ellipse cx="170" cy="179" rx="122" ry="14" fill="#54392A" />
      <path d="M232 70c58-8 66 50 10 72" fill="none" stroke="#6A503A" strokeWidth="13" strokeLinecap="round" />
      <path d="M92 58c0 78 26 124 78 124s78-46 78-124z" fill="url(#hp-cupg)" />
      <ellipse cx="170" cy="58" rx="78" ry="15" fill="#B39674" />
      <ellipse cx="170" cy="60" rx="68" ry="11" fill="#24120A" />
    </svg>
  );
}

function BrandBadge({ item }) {
  const dbBrandImgs = getDatabaseBrandImages(item.id, item.name);
  const resolvedLogo = item.logo || item.image || dbBrandImgs?.image;

  if (resolvedLogo) {
    const isKoiOrTrungNguyen = String(item.id || "").toLowerCase().includes("koi") || 
                               String(item.name || "").toLowerCase().includes("koi") ||
                               String(item.id || "").toLowerCase().includes("trung") || 
                               String(item.name || "").toLowerCase().includes("trung");

    const logoStyle = isKoiOrTrungNguyen
      ? { width: "78px", height: "78px", borderRadius: "50%", objectFit: "contain", background: "#fff", padding: "4px", border: "2px solid rgba(255, 255, 255, 0.85)" }
      : { width: "78px", height: "78px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255, 255, 255, 0.85)" };

    return <img src={resolvedLogo} alt={`Logo ${item.name}`} style={logoStyle} />;
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

function BrandCard({ brand, onSelect, languageCode }) {
  /* [PHẦN CHÈN THÊM - ĐỂ MÌNH CHÈN]: Lấy ảnh quán (cover) chuẩn theo thư mục */
  const dbImgs = getDatabaseBrandImages(brand.id, brand.name);
  const resolvedCover = brand.cover || dbImgs?.cover;

  const heroStyle = resolvedCover 
    ? { backgroundImage: `linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.25)),url(${resolvedCover})`, backgroundSize: "cover", backgroundPosition: "center" }
    : undefined;

  return (
    <div className="bl-card" onClick={() => onSelect && onSelect(brand)}>
      <div className="bl-card-hero" style={heroStyle}>
        <BrandBadge item={brand} />
        <BrandDescriptionAudio
          brand={brand}
          className="bl-play-btn"
          playLabel={`Nghe mô tả ${brand.name}`}
          stopLabel={`Dừng mô tả ${brand.name}`}
          renderIcon={speaking => <Icon n={speaking ? "pause" : "play"} size={14} />}
        />
      </div>
      <div className="bl-card-info">
        <h3>{brand.name}</h3>
        <p className="bl-card-type">{localizedCategory(brand.type, languageCode)}</p>
        <p className="bl-card-branch">
          <Icon n="pin" size={14} /> {screenText(languageCode, "branchCount", { count: brand.branchCount })}
        </p>
      </div>
    </div>
  );
}

export default function BrandListPage({ onSelectBrand, onNavigate }) {
  const { languageCode } = useLanguage();
  const st = (key, values) => screenText(languageCode, key, values);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [brands, setBrands] = useState([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getUserApi("/api/catalog/brands", { signal: controller.signal })
      .then(rows => { if (Array.isArray(rows)) setBrands(rows.map(toBrandCard)); })
      .catch(() => { if (!controller.signal.aborted) setLoadError(true); });
    return () => controller.abort();
  }, []);

  const go = key => {
    if (onNavigate) {
      onNavigate(key);
    }
  };

  const filteredBrands = brands.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.type.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedFilter === "all") return matchesSearch;
    return matchesSearch && b.type.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  return (
    <div className="bl-page">
      <style>{styles}</style>

      <Header active="brands" go={go} />

      <section className="hp-hero">
        <div className="hp-hero-in">
          <h1>{st("brandTitle")}</h1>
          <p>{st("brandIntro")}</p>

          <form className="hp-search" role="search" onSubmit={e => e.preventDefault()}>
            <input
              type="text"
              placeholder={st("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={st("search")}
            />
            <button aria-label={st("search")}>
              <Icon n="search" size={18} />
            </button>
          </form>
        </div>
        <Cup />
      </section>

      <main className="bl-main">
        <div className="bl-section-header">
          <h2>{st("allBrands", { count: filteredBrands.length })}</h2>

          <div className="bl-filter-tabs">
            <button 
              className={selectedFilter === "all" ? "active" : ""} 
              onClick={() => setSelectedFilter("all")}
            >
              {st("all")}
            </button>
            <button 
              className={selectedFilter === "trà" ? "active" : ""} 
              onClick={() => setSelectedFilter("trà")}
            >
              {st("teaCoffee")}
            </button>
            <button 
              className={selectedFilter === "bánh" ? "active" : ""} 
              onClick={() => setSelectedFilter("bánh")}
            >
              {st("coffeeCake")}
            </button>
          </div>
        </div>

        {filteredBrands.length > 0 ? (
          <div className="bl-grid">
            {filteredBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} onSelect={onSelectBrand} languageCode={languageCode} />
            ))}
          </div>
        ) : (
          <div className="bl-empty">
            <Icon n="cup" size={48} />
            <p>{loadError ? "Không tải được danh sách từ máy chủ. Vui lòng thử tải lại trang." : st("noBrands", { query: searchTerm })}</p>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = `
.bl-page {
  --brown: #4B2817;
  --brown-3: #6B3A22;
  --accent: #C8672B;
  --bg-color: #FAF7F3;
  --text-dark: #2A1810;
  --text-muted: #8B7A6C;
  --card-bg: #FFFFFF;
  --border-color: #EFE5DA;

  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-dark);
  font-family: Inter, system-ui, -apple-system, sans-serif;
}

.bl-page * { box-sizing: border-box; }
.bl-page :where(button,input,select){font:inherit}
.bl-page button:focus-visible{outline:2px solid #fff;outline-offset:2px}
.bl-page input:focus-visible,.bl-page select:focus-visible{outline:none}

/* Header Component (Đồng bộ hoàn toàn class .hp- của HomePage) */
.hp-bar {
  display: flex;
  align-items: center;
  gap: 28px;
  height: 60px;
  padding: 0 6vw;
  color: #fff;
  background: linear-gradient(180deg,#5A3220,#442211);
}

.hp-logo {
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

.hp-logo b { display: block; font-size: 15px; line-height: 1.15; }
.hp-logo small { display: block; font-size: 9px; opacity: .65; }

.hp-nav { display: flex; flex: 1; gap: 26px; }

.hp-nav button {
  padding: 21px 0 17px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: none;
  color: rgba(255,255,255,.82);
  font-size: 13px;
  cursor: pointer;
}

.hp-nav button:hover { color: #fff; }
.hp-nav button[aria-current=page] { color: #fff; font-weight: 600; border-color: #E9A24B; }

.hp-tools { display: flex; align-items: center; gap: 14px; }
.hp-tools>button { display: grid; place-items: center; padding: 4px; border: 0; background: none; color: #fff; cursor: pointer; }

/* Custom Dropdown Ngôn Ngữ */
.hp-lang-dropdown { position: relative; }
.hp-lang-btn {
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
.hp-lang-btn:hover {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.4);
}
.hp-chevron-icon {
  display: flex;
  align-items: center;
  transition: transform 0.25s ease;
}
.hp-chevron-icon.open { transform: rotate(180deg); }

.hp-lang-menu {
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
.hp-lang-item {
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
.hp-lang-item:hover {
  background: #F6EFE7;
  color: var(--brown-3);
}
.hp-lang-item.active {
  background: var(--brown-3);
  color: #fff;
  font-weight: 600;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hero Section & Search đồng bộ chuẩn HomePage */
.hp-hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 330px;
  padding: 48px 6vw;
  overflow: hidden;
  color: #fff;
  background: radial-gradient(circle at 78% 28%, rgba(233,168,90,.38), transparent 26%),
              radial-gradient(circle at 94% 62%, rgba(120,150,90,.28), transparent 24%),
              linear-gradient(100deg, #2B160B 0%, #4A2A18 55%, #3A2415 100%);
  background-size: cover;
  background-position: center;
}
.hp-hero-in {
  position: relative;
  z-index: 1;
  max-width: 660px;
}
.hp-hero h1 {
  margin: 0 0 14px;
  font-size: clamp(24px, 3.2vw, 36px);
  font-weight: 700;
  line-height: 1.22;
}
.hp-hero p {
  max-width: 520px;
  margin: 0 0 24px;
  color: rgba(255,255,255,.86);
  font-size: 14.5px;
  line-height: 1.65;
}
.hp-search {
  display: flex;
  gap: 8px;
  padding: 6px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(0,0,0,.28);
}
.hp-search input {
  flex: 1;
  min-width: 0;
  padding: 0 12px;
  border: 0;
  background: none;
  color: var(--text-dark);
  font-size: 13.5px;
}
.hp-search input:focus-visible { outline: none; }
.hp-search:focus-within { outline: none; }
.hp-search button {
  display: grid;
  place-items: center;
  width: 42px;
  height: 38px;
  border: 0;
  border-radius: 8px;
  background: var(--brown-3);
  color: #fff;
  cursor: pointer;
}
.hp-cup {
  position: absolute;
  right: 4%;
  bottom: -6px;
  width: min(38vw, 380px);
  filter: drop-shadow(0 18px 24px rgba(0,0,0,.4));
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
  background: var(--brown);
  color: #fff;
  border-color: var(--brown);
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
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,.2);
}
.bl-play-btn[aria-pressed="true"] { background: #536c54; color: #fff; }
.bl-play-btn:disabled { cursor: not-allowed; opacity: .5; }

.bl-card-info { padding: 14px 16px; }
.bl-card-info h3 { margin: 0 0 4px 0; font-size: 14px; font-weight: 700; }
.bl-card-type { margin: 0 0 10px 0; font-size: 12px; color: var(--text-muted); }
.bl-card-branch { margin: 0; font-size: 11.5px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
.bl-empty { text-align: center; padding: 60px 20px; color: var(--text-muted); }

@media (max-width: 1024px) { .bl-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) {
  .hp-bar { gap: 12px; flex-wrap: wrap; height: auto; padding: 10px 5vw 0; }
  .hp-nav { order: 3; flex-basis: 100%; gap: 20px; overflow-x: auto; }
  .hp-nav button { padding: 10px 0; white-space: nowrap; }
  .hp-logo small { display: none; }
  .hp-tools { margin-left: auto; }
  .hp-cup { display: none; }
  .hp-hero { flex-direction: column; text-align: center; padding: 30px 5vw; min-height: 0; }
  .bl-grid { grid-template-columns: repeat(2, 1fr); }
  .bl-section-header { flex-direction: column; align-items: flex-start; gap: 12px; }
}
@media (max-width: 480px) { .bl-grid { grid-template-columns: 1fr; } }
`;
