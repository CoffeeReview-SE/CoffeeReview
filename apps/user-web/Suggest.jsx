import React, { useEffect, useRef, useState } from "react";
import { LANGUAGES, useLanguage } from "./LanguageContext.jsx";
import { localizedCategory, screenText } from "./brandDetailTranslations.js";
import { getUserApi, toBrandCard } from "./api.js";

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
  "phuc-long": { image: logoPhucLong },
  "highlands-coffee": { image: logoHighlands },
  "trung-nguyen": { image: logoTrungNguyen },
  "katinat": { image: logoKatinat },
  "koi-the": { image: logoKoi },
  "phe-la": { image: logoPheLa },
  "milano-coffee": { image: logoMilano },
  "viva-star-coffee": { image: logoVivaStar },
  "the-coffee-house": { image: logoTheCoffeeHouse },
  "starbucks": { image: logoStarbucks }
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
  const { languageCode, setLanguageCode, t } = useLanguage();
  const lang = languageCode.toUpperCase();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = LANGUAGES;

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

  const handleNavClick = (key) => {
    if (onNavigate) {
      onNavigate(key);
    }
  };

  return (
    <header className="sg-bar">
      <button className="sg-logo" onClick={() => handleNavClick("home")}>
        <Icon n="cup" size={30} />
        <span>
          <b>SaigonCoffee</b>
          <small>{t("brand.tagline")}</small>
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
                  className={`sg-lang-item ${lang === item.code.toUpperCase() ? "active" : ""}`}
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

function Logo({ item, size }) {
  const dbBrandImgs = getDatabaseBrandImages(item.id, item.name);
  const resolvedLogo = item.logo || item.image || dbBrandImgs?.image;

  if (resolvedLogo) {
    const isKoiOrTrungNguyen = String(item.id || "").toLowerCase().includes("koi") || 
                               String(item.name || "").toLowerCase().includes("koi") ||
                               String(item.id || "").toLowerCase().includes("trung") || 
                               String(item.name || "").toLowerCase().includes("trung");

    const extraLogoStyle = isKoiOrTrungNguyen
      ? { width: size, height: size, borderRadius: "50%", objectFit: "contain", background: "#fff", padding: "4px" }
      : { width: size, height: size, borderRadius: "50%", objectFit: "cover" };

    return <img src={resolvedLogo} alt={`Logo ${item.name}`} style={extraLogoStyle} />;
  }

  const big = size > 60;
  const text = big ? (item.mark || [item.name]) : [item.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || ""];
  return <span className="bd-mark" style={{ width: size, height: size, background: item.badge || "#1F6B45", fontSize: big ? size * 0.13 : size * 0.34, boxShadow: big ? "inset 0 0 0 4px rgba(255,255,255,.85)" : "none" }}>
    {text.map(l => <span key={l}>{l}</span>)}
  </span>;
}

function BrandBadge({ item }) {
  return <Logo item={item} size={48} />;
}

export default function SuggestionsPage({ recentBrands = [], onNavigate }) {
  const { languageCode } = useLanguage();
  const st = (key, values) => screenText(languageCode, key, values);
  const [catalogBrands, setCatalogBrands] = useState([]);
  const displayBrands = recentBrands.length > 0 ? recentBrands : catalogBrands;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    brandName: "",
    address: "",
    note: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getUserApi("/api/catalog/brands", { signal: controller.signal })
      .then(rows => { if (Array.isArray(rows)) setCatalogBrands(rows.map(toBrandCard)); })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const handleSelectPreBrand = (brand) => {
    setFormData(prev => ({
      ...prev,
      brandName: brand.name
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.brandName.trim()) {
      alert(st("validation"));
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await getUserApi("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
    } catch {
      setSubmitError("Không gửi được đề xuất. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmitError("");
    setFormData({ name: "", phone: "", brandName: "", address: "", note: "" });
  };

  return (
    <div className="sg-page">
      <style>{styles}</style>

      <Header currentNav="suggestions" onNavigate={onNavigate} />

      <section className="sg-hero">
        <div className="sg-hero-in">
          <h1>{st("suggestTitle")}</h1>
          <p>{st("suggestIntro")}</p>
        </div>
      </section>

      <main className="sg-main">
        {displayBrands.length > 0 && (
          <section className="sg-selected-section">
            <div className="sg-section-title">
              <h2>{st("recentBrands")}</h2>
              <p>{st("clickBrand")}</p>
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
                    <p>{localizedCategory(b.type, languageCode)}</p>
                    <span><Icon n="pin" size={12} /> {st("branchCount", { count: b.branchCount || b.branches || 0 })}</span>
                  </div>
                  {formData.brandName === b.name && (
                    <span className="sg-card-check"><Icon n="check" size={14} /></span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="sg-form-container">
          <div className="sg-form-card">
            {submitted ? (
              <div className="sg-success-state">
                <div className="sg-success-icon">
                  <Icon n="check" size={36} />
                </div>
                <h3>{st("success")}</h3>
                <p>{st("thanks", { name: formData.name, brand: formData.brandName })}</p>
                <button className="sg-btn-primary" onClick={handleReset}>
                  {st("submitAnother")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="sg-form">
                <div className="sg-form-header">
                  <h3>{st("formTitle")}</h3>
                  <p>{st("formIntro")}</p>
                </div>

                <div className="sg-field-group">
                  <label htmlFor="name">
                    <Icon n="user" size={15} /> {st("fullName")} <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder={st("fullNamePlaceholder")}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="sg-field-group">
                  <label htmlFor="phone">
                    <Icon n="phone" size={15} /> {st("phone")} <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder={st("phonePlaceholder")}
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="sg-field-group">
                  <label htmlFor="brandName">
                    <Icon n="store" size={15} /> {st("brandToSuggest")} <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="brandName"
                    name="brandName"
                    placeholder={st("brandPlaceholder")}
                    value={formData.brandName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="sg-field-group">
                  <label htmlFor="address">
                    <Icon n="pin" size={15} /> {st("address")}
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder={st("addressPlaceholder")}
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="sg-field-group">
                  <label htmlFor="note">{st("notes")}</label>
                  <textarea
                    id="note"
                    name="note"
                    rows="3"
                    placeholder={st("notesPlaceholder")}
                    value={formData.note}
                    onChange={handleChange}
                  ></textarea>
                </div>

                {submitError && <p role="alert" className="sg-submit-error">{submitError}</p>}
                <button type="submit" className="sg-btn-submit" disabled={submitting}>
                  <Icon n="send" size={16} /> {submitting ? "Đang gửi…" : st("submit")}
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
.bd-mark{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;border-radius:50%;color:#fff;font-weight:800;line-height:1.12;letter-spacing:.4px;text-align:center}

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

.sg-page input:focus-visible,
.sg-page textarea:focus-visible,
.sg-page input:focus,
.sg-page textarea:focus {
  outline: none !important;
}

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

.sg-main { max-width: 1000px; margin: 0 auto; padding: 36px 5vw 60px; }

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
  outline: none !important;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.sg-field-group input:focus, .sg-field-group textarea:focus {
  background: #fff;
  border-color: var(--brown-mid);
  outline: none !important;
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
