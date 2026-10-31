import React, { useEffect, useRef, useState } from "react";
import StoreMap from "./StoreMap.jsx";
import { LANGUAGES, useLanguage } from "./LanguageContext.jsx";
import { localizedCategory } from "./brandDetailTranslations.js";
import { getUserApi, toBrandCard } from "./api.js";
import BrandDescriptionAudio from "./BrandDescriptionAudio.jsx";

const HERO_IMAGE = "";

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

const fold = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

const paths = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
  pause: <path d="M8 5v14M16 5v14" strokeWidth="3.2" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  cup: <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2M3 21h16M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4" />,
};
const Icon = ({ n, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[n]}</svg>
);

function Header({ active, go }) {
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
  
  return <header className="hp-bar">
    <button className="hp-logo" onClick={() => go("home")}>
      <Icon n="cup" size={30} /><span><b>SaigonCoffee</b><small>{t("brand.tagline")}</small></span>
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
  </header>;
}

function Cup() {
  return <svg className="hp-cup" viewBox="0 0 340 230" aria-hidden="true">
    <defs><linearGradient id="hp-cupg" x1="0" x2="1"><stop offset="0" stopColor="#9A7C5C" /><stop offset=".55" stopColor="#6A503A" /><stop offset="1" stopColor="#3E2B1D" /></linearGradient></defs>
    <ellipse cx="170" cy="196" rx="160" ry="22" fill="#1B0E07" opacity=".5" />
    <ellipse cx="170" cy="184" rx="150" ry="22" fill="#3B2617" />
    <ellipse cx="170" cy="179" rx="122" ry="14" fill="#54392A" />
    <path d="M232 70c58-8 66 50 10 72" fill="none" stroke="#6A503A" strokeWidth="13" strokeLinecap="round" />
    <path d="M92 58c0 78 26 124 78 124s78-46 78-124z" fill="url(#hp-cupg)" />
    <ellipse cx="170" cy="58" rx="78" ry="15" fill="#B39674" />
    <ellipse cx="170" cy="60" rx="68" ry="11" fill="#24120A" />
  </svg>;
}

function Mark({ b }) {
  const dbBrandImgs = getDatabaseBrandImages(b.id, b.name);
  const resolvedLogo = b.logo || b.image || dbBrandImgs?.image;

  if (resolvedLogo) {
    // Xử lý tối ưu logo tròn đặc thù cho KOI Thé và Trung Nguyên
    const isKoiOrTrungNguyen = String(b.id || "").toLowerCase().includes("koi") || 
                               String(b.name || "").toLowerCase().includes("koi") ||
                               String(b.id || "").toLowerCase().includes("trung") || 
                               String(b.name || "").toLowerCase().includes("trung");

    const logoStyle = isKoiOrTrungNguyen
      ? { width: "84px", height: "84px", borderRadius: "50%", objectFit: "contain", background: "#fff", padding: "4px", boxShadow: "0 0 0 3px rgba(255,255,255,.9),0 6px 16px rgba(0,0,0,.35)" }
      : { width: "84px", height: "84px", borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 3px rgba(255,255,255,.9),0 6px 16px rgba(0,0,0,.35)" };

    return <img src={resolvedLogo} alt={`Logo ${b.name}`} style={logoStyle} />;
  }

  const lines = b.mark ? b.mark.map(l => <span key={l}>{l}</span>) : [b.name];
  return b.badge
    ? <span className="hp-badge" style={{ background: b.badge }}>{lines}</span>
    : <span className={`hp-word${b.mark?.length === 1 ? " one" : ""}`} style={{ color: b.ink || "#fff" }}>{lines}</span>;
}

export default function HomePage({ onOpenBrand, onNavigate }) {
  const { languageCode, t } = useLanguage();
  const [query, setQuery] = useState("");
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
    if (key === "home") window.dispatchEvent(new Event("saigoncoffee:show-all-stores"));
    if (onNavigate) {
      onNavigate(key);
    }
  };

  const shown = brands.filter(b => fold(`${b.name}${b.type}`).includes(fold(query.trim())));
  const open = b => onOpenBrand && onOpenBrand(b.id, b);

  return <div className="hp"> <style>{css}</style> <Header active="home" go={go} /> <section className="hp-hero" style={HERO_IMAGE ? { backgroundImage: `linear-gradient(90deg,rgba(30,14,6,.88),rgba(30,14,6,.25)),url(${HERO_IMAGE})` } : undefined}>
      <div className="hp-hero-in">
        <h1>{t("home.title")}</h1>
        <p>{t("home.intro")}</p>
        <form className="hp-search" role="search" onSubmit={e => e.preventDefault()}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t("home.searchPlaceholder")} aria-label={t("home.search")} />
          <button aria-label={t("home.search")}><Icon n="search" size={18} /></button>
        </form>
      </div>
      {!HERO_IMAGE && <Cup />}
    </section>

    <StoreMap />

    <main className="hp-main">
      <div className="hp-head">
        <h2>{t("home.featured")}</h2>
        <button className="hp-link" onClick={() => go("brands")}>
          {t("home.seeAll")} <Icon n="arrow" size={14} />
        </button>
      </div>
      {shown.length ? <div className="hp-grid">
        {shown.map(b => {
          const dbImgs = getDatabaseBrandImages(b.id, b.name);
          const resolvedCover = b.cover || dbImgs?.cover;

          return <article key={b.id} className="hp-card">
            <button 
              className="hp-cover" 
              onClick={() => open(b)} 
              aria-label={t("home.viewBrand", { name: b.name })} 
              style={resolvedCover ? { backgroundImage: `linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.25)),url(${resolvedCover})` } : undefined}
            >
              <Mark b={b} />
            </button>
            <BrandDescriptionAudio
              brand={b}
              className="hp-play"
              playLabel={t("home.listen", { name: b.name })}
              stopLabel={t("home.pauseAudio", { name: b.name })}
              renderIcon={speaking => <Icon n={speaking ? "pause" : "play"} size={13} />}
            />
            <div className="hp-body">
              <h3><button onClick={() => open(b)}>{b.name}</button></h3>
              <p>{localizedCategory(b.type, languageCode)}</p>
              <span><Icon n="pin" size={13} /> {t("home.branches", { count: b.branches })}</span>
            </div>
          </article>;
        })}
      </div> : <p className="hp-empty">{loadError ? "Không tải được danh sách từ máy chủ. Vui lòng thử tải lại trang." : t("home.noResults")}</p>}
    </main>
  </div>;
}

const css = `
.hp{--brown:#4B2817;--brown-3:#6B3A22;--accent:#C8672B;--ink:#2A1810;--muted:#8B7A6C;--line:#EFE5DA;min-height:100vh;background:#fff;color:var(--ink);font-family:Inter,system-ui,"Segoe UI",sans-serif}
.hp *{box-sizing:border-box}
.hp :where(button,input,select){font:inherit}
.hp button:focus-visible{outline:2px solid #fff;outline-offset:2px}
.hp input:focus-visible,.hp select:focus-visible{outline:none}

.hp-bar{display:flex;align-items:center;gap:28px;height:60px;padding:0 6vw;color:#fff;background:linear-gradient(180deg,#5A3220,#442211)}
.hp-logo{display:flex;align-items:center;gap:10px;padding:0;border:0;background:none;color:#fff;text-align:left;cursor:pointer}
.hp-logo b{display:block;font-size:15px;line-height:1.15}
.hp-logo small{display:block;font-size:9px;opacity:.65}
.hp-nav{display:flex;flex:1;gap:26px}
.hp-nav button{padding:21px 0 17px;border:0;border-bottom:2px solid transparent;background:none;color:rgba(255,255,255,.82);font-size:13px;cursor:pointer}
.hp-nav button:hover{color:#fff}
.hp-nav button[aria-current=page]{color:#fff;font-weight:600;border-color:#E9A24B}

.hp-tools{display:flex;align-items:center;gap:14px}
.hp-tools>button{display:grid;place-items:center;padding:4px;border:0;background:none;color:#fff;cursor:pointer}

/* Custom Dropdown Ngôn Ngữ */
.hp-lang-dropdown{position:relative}
.hp-lang-btn{display:flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid rgba(255,255,255,0.2);border-radius:8px;background:rgba(255,255,255,0.08);color:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s ease}
.hp-lang-btn:hover{background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.4)}
.hp-chevron-icon{display:flex;align-items:center;transition:transform 0.25s ease}
.hp-chevron-icon.open{transform:rotate(180deg)}
.hp-lang-menu{position:absolute;right:0;top:calc(100% + 6px);min-width:110px;padding:6px;border-radius:8px;background:#fff;box-shadow:0 8px 20px rgba(42,24,16,0.18);border:1px solid var(--line);z-index:100;display:flex;flex-direction:column;gap:2px;animation:fadeInDown 0.2s ease}
.hp-lang-item{display:block;width:100%;padding:8px 12px;border:0;border-radius:6px;background:transparent;color:var(--ink);font-size:12px;font-weight:500;text-align:left;cursor:pointer;transition:background 0.15s ease, color 0.15s ease}
.hp-lang-item:hover{background:#F6EFE7;color:var(--brown-3)}
.hp-lang-item.active{background:var(--brown-3);color:#fff;font-weight:600}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.hp-hero{position:relative;display:flex;align-items:center;min-height:330px;padding:48px 6vw;overflow:hidden;color:#fff;background:radial-gradient(circle at 78% 28%,rgba(233,168,90,.38),transparent 26%),radial-gradient(circle at 94% 62%,rgba(120,150,90,.28),transparent 24%),linear-gradient(100deg,#2B160B 0%,#4A2A18 55%,#3A2415 100%);background-size:cover;background-position:center}
.hp-hero-in{position:relative;z-index:1;max-width:660px}
.hp-hero h1{margin:0 0 14px;font-size:clamp(24px,3.2vw,36px);font-weight:700;line-height:1.22}
.hp-hero p{max-width:520px;margin:0 0 24px;color:rgba(255,255,255,.86);font-size:14.5px;line-height:1.65}
.hp-search{display:flex;gap:8px;padding:6px;border-radius:10px;background:#fff;box-shadow:0 6px 20px rgba(0,0,0,.28)}
.hp-search input{flex:1;min-width:0;padding:0 12px;border:0;background:none;color:var(--ink);font-size:13.5px}
.hp-search input:focus-visible{outline:none}
.hp-search:focus-within{outline:none}
.hp-search button{display:grid;place-items:center;width:42px;height:38px;border:0;border-radius:8px;background:var(--brown-3);color:#fff;cursor:pointer}
.hp-cup{position:absolute;right:4%;bottom:-6px;width:min(38vw,380px);filter:drop-shadow(0 18px 24px rgba(0,0,0,.4))}

.hp-main{max-width:1240px;margin:0 auto;padding:14px 6vw 64px}
.hp-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.hp-head h2{margin:0;font-size:19px;font-weight:700}
.hp-link{display:flex;align-items:center;gap:6px;padding:0;border:0;background:none;color:var(--accent);font-size:13px;cursor:pointer}
.hp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:20px}
.hp-empty{padding:40px 0;color:var(--muted);text-align:center}
.hp-card{position:relative;overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fff;box-shadow:0 4px 14px rgba(75,40,23,.07)}
.hp-cover{display:grid;place-items:center;width:100%;height:150px;padding:0;border:0;cursor:pointer;background:radial-gradient(circle at 18% 25%,rgba(233,168,90,.45),transparent 38%),radial-gradient(circle at 85% 70%,rgba(110,150,80,.5),transparent 40%),linear-gradient(160deg,#2F3A22,#4A3520);background-size:cover;background-position:center}
.hp-badge{display:flex;flex-direction:column;align-items:center;justify-content:center;width:84px;height:84px;border-radius:50%;color:#fff;font-size:11px;font-weight:800;line-height:1.15;letter-spacing:.5px;box-shadow:0 0 0 3px rgba(255,255,255,.9),0 6px 16px rgba(0,0,0,.35)}
.hp-word{display:flex;flex-direction:column;align-items:center;font-size:22px;font-weight:800;line-height:1.05;letter-spacing:1px;text-shadow:0 2px 8px rgba(0,0,0,.5)}
.hp-word.one{font-size:32px}
.hp-play{position:absolute;top:132px;right:14px;display:grid;place-items:center;width:36px;height:36px;padding:0 0 0 2px;border:0;border-radius:50%;background:#fff;color:var(--brown-3);box-shadow:0 2px 8px rgba(0,0,0,.25);cursor:pointer}
.hp-play[aria-pressed=true]{padding:0;background:var(--brown-3);color:#fff}
.hp-body{padding:14px 16px 16px}
.hp-body h3{margin:0 0 5px;font-size:14.5px;font-weight:600}
.hp-body h3 button{padding:0;border:0;background:none;color:inherit;font-weight:inherit;cursor:pointer}
.hp-body p{margin:0 0 14px;color:var(--muted);font-size:12.5px}
.hp-body span{display:flex;align-items:center;gap:5px;color:var(--muted);font-size:12px}
.hp-body span svg{color:var(--accent)}

@media (max-width:760px){
  .hp-bar{gap:12px;flex-wrap:wrap;height:auto;padding:10px 5vw 0}
  .hp-nav{order:3;flex-basis:100%;gap:20px;overflow-x:auto}
  .hp-nav button{padding:10px 0;white-space:nowrap}
  .hp-logo small{display:none}
  .hp-tools{margin-left:auto}
  .hp-cup{display:none}
  .hp-hero{min-height:0;padding:36px 5vw}
}`;
