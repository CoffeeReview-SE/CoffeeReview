import React, { useEffect, useRef, useState } from "react";
import { LANGUAGES, useLanguage } from "./LanguageContext.jsx";
import { localizedCategory, screenText } from "./brandDetailTranslations.js";
import { getUserApi, toBrandCard } from "./api.js";
import { emptySuggestion, getBrandSuggestionValues, isExistingBrandFieldReadOnly, suggestionFields, suggestionText, validateSuggestion } from "./suggestionForm.mjs";
import SuggestionImageField from "./SuggestionImageField.jsx";
import { imageFields } from "./suggestionImages.mjs";

// 2. Ảnh Logo (image logo/)
import logoHighlands from "../../public/image/highlands-coffee/logo.jpg";
import logoKatinat from "../../public/image/katinat/logo.png";
import logoKoi from "../../public/image/koi-the/logo.jpg";
import logoMilano from "../../public/image/milano-coffee/logo.png";
import logoPheLa from "../../public/image/phe-la/logo.jpg";
import logoPhucLong from "../../public/image/phuc-long/logo.jpg";
import logoStarbucks from "../../public/image/starbucks/logo.png";
import logoTheCoffeeHouse from "../../public/image/the-coffee-house/logo.jpg";
import logoTrungNguyen from "../../public/image/trung-nguyen/logo.png";
import logoVivaStar from "../../public/image/viva-star-coffee/logo.png";

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

      <nav className="sg-nav" aria-label={t("a11y.mainNavigation")}>
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
            aria-label={t("a11y.chooseLanguage")}
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
  const { languageCode } = useLanguage();
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

    return <img src={resolvedLogo} alt={screenText(languageCode, "brandLogo", { name: item.name })} style={extraLogoStyle} />;
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

  const [formData, setFormData] = useState({ ...emptySuggestion });
  const [fieldErrors, setFieldErrors] = useState({});
  const [readingImages, setReadingImages] = useState({});
  const imagesPending = Object.values(readingImages).some(Boolean);
  const [catalogStatus, setCatalogStatus] = useState("loading");
  const formRef = useRef(null);
  const normalizedBrandName = formData.brandName.trim().toLocaleLowerCase();
  const existingBrand = [...catalogBrands, ...recentBrands].find(brand =>
    brand.name.trim().toLocaleLowerCase() === normalizedBrandName
  );
  const isNewBrand = !existingBrand;
  const ft = key => suggestionText(languageCode, key);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getUserApi("/api/catalog/brands", { signal: controller.signal })
      .then(rows => {
        if (!Array.isArray(rows)) throw new Error("Invalid catalog");
        setCatalogBrands(rows.map(toBrandCard));
        setCatalogStatus("ready");
      })
      .catch(() => { if (!controller.signal.aborted) setCatalogStatus("error"); });
    return () => controller.abort();
  }, []);

  const handleSelectPreBrand = (brand) => {
    setFieldErrors({});
    setFormData(prev => {
      const selectedBrand = prev.brandName === brand.name ? null : brand;
      const clearedBrandFields = Object.fromEntries(
        suggestionFields
          .filter(field => field.brandOnly || field.name === "brandName" || field.name === "branchName")
          .map(field => [field.name, ""])
      );
      return { ...prev, ...clearedBrandFields, ...getBrandSuggestionValues(selectedBrand) };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(previous => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || imagesPending) return;
    const errors = validateSuggestion(formData, isNewBrand);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitError("incomplete");
      formRef.current?.elements.namedItem(Object.keys(errors)[0])?.focus();
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await getUserApi("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(Object.entries(formData)
            .map(([key, value]) => [key, value.trim()])),
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
        }),
      });
      setSubmitted(true);
    } catch (error) {
      setFieldErrors(error.errors || {});
      setSubmitError(error.errors ? "incomplete" : "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmitError("");
    setFieldErrors({});
    setFormData({ ...emptySuggestion });
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
                <button
                  key={b.id} 
                  type="button"
                  className={`sg-selected-card ${formData.brandName === b.name ? "active" : ""}`}
                  onClick={() => handleSelectPreBrand(b)}
                  aria-pressed={formData.brandName === b.name}
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
                </button>
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
              <form ref={formRef} onSubmit={handleSubmit} className="sg-form" noValidate>
                <div className="sg-form-header">
                  <h3>{st("formTitle")}</h3>
                  <p>{ft(isNewBrand ? "newBrand" : "existingBrand")}</p>
                </div>

                {suggestionFields.map(field => {
                  const Field = field.multiline ? "textarea" : "input";
                  const value = formData[field.name];
                  const readOnly = isExistingBrandFieldReadOnly(field, existingBrand);
                  const required = isNewBrand || !field.brandOnly;
                  return <div className="sg-field-group" key={field.name}>
                    <label htmlFor={imageFields.includes(field.name) ? `${field.name}-file` : field.name}>{ft(field.name)} {required && <span className="req">*</span>}</label>
                    {imageFields.includes(field.name) ? <SuggestionImageField
                      name={field.name}
                      value={value}
                      language={languageCode}
                      invalid={Boolean(fieldErrors[field.name])}
                      disabled={readOnly}
                      onChange={value => handleChange({ target: { name: field.name, value } })}
                      onError={error => setFieldErrors(previous => ({ ...previous, [field.name]: error }))}
                      onReadingChange={reading => setReadingImages(previous => ({ ...previous, [field.name]: reading }))}
                    /> : <Field
                      id={field.name}
                      name={field.name}
                      type={field.multiline ? undefined : field.type || "text"}
                      rows={field.multiline ? 4 : undefined}
                      step={field.type === "number" ? "any" : undefined}
                      min={field.min}
                      max={field.max}
                      maxLength={field.maxLength}
                      placeholder={field.type === "url" ? "https://..." : undefined}
                      value={value}
                      onChange={handleChange}
                      readOnly={readOnly}
                      required={required}
                      aria-invalid={Boolean(fieldErrors[field.name])}
                      aria-readonly={readOnly || undefined}
                      aria-describedby={fieldErrors[field.name] ? `${field.name}-error` : undefined}
                    />}
                    {fieldErrors[field.name] && <small id={`${field.name}-error`} className="sg-field-error">{ft(fieldErrors[field.name])}</small>}
                  </div>;
                })}

                <div className="sg-field-group">
                  <label htmlFor="note">{st("notes")}</label>
                  <textarea
                    id="note"
                    name="note"
                    rows="3"
                    maxLength={2000}
                    aria-invalid={Boolean(fieldErrors.note)}
                    aria-describedby={fieldErrors.note ? "note-error" : undefined}
                    placeholder={st("notesPlaceholder")}
                    value={formData.note}
                    onChange={handleChange}
                  ></textarea>
                  {fieldErrors.note && <small id="note-error" className="sg-field-error">{ft(fieldErrors.note)}</small>}
                </div>

                {catalogStatus === "error" && <p role="alert" className="sg-submit-error">{ft("catalogError")}</p>}
                {submitError && <p role="alert" className="sg-submit-error">{submitError === "incomplete" ? ft("incomplete") : st("submitError")}</p>}
                <button type="submit" className="sg-btn-submit" disabled={submitting || imagesPending}>
                  <Icon n="send" size={16} /> {submitting ? st("submitting") : st("submit")}
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
  font: inherit;
  color: inherit;
  text-align: left;
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
.sg-field-group input:read-only, .sg-field-group textarea:read-only {
  background: #F1EEE9;
  color: var(--text-muted);
  cursor: not-allowed;
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
.sg-field-error, .sg-submit-error { color: #a12424; font-size: 13px; }
.sg-image-field { display: grid; gap: 8px; min-width: 0; }
.sg-image-field small { color: var(--text-muted); }
.sg-image-field .sg-image-choose { color: var(--brown-mid); }
.sg-image-field input[type="file"] { background: #fff; padding: 10px; }
.sg-image-preview { width: 100%; max-height: 220px; object-fit: contain; border: 1px solid var(--border-color); border-radius: 8px; }
.sg-image-field button { justify-self: start; padding: 7px 12px; border: 1px solid var(--border-color); border-radius: 8px; background: #fff; color: var(--brown-mid); cursor: pointer; }
.sg-field-group [aria-invalid="true"] { border-color: #a12424; }
.sg-btn-submit:disabled { opacity: .6; cursor: not-allowed; }
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

/* Keep navigation usable at tablet widths and with translated labels. */
.sg-bar { min-width: 0; }
.sg-logo { flex-shrink: 0; }
.sg-nav { min-width: 0; }
.sg-nav button { flex-shrink: 0; white-space: nowrap; }
@media (max-width: 1024px) {
  .sg-bar { height: auto; flex-wrap: wrap; gap: 12px; padding: 10px 5vw 0; }
  .sg-tools { margin-left: auto; }
  .sg-nav { order: 3; flex-basis: 100%; gap: 18px; overflow-x: auto; }
  .sg-nav button { min-height: 44px; padding: 10px 0; }
}
@media (max-width: 760px) {
  .sg-bar input, .sg-bar select { font-size: 16px; }
}

.sg-form-card, .sg-field-group { min-width: 0; }
.sg-field-group label { flex-wrap: wrap; }
@media (max-width: 760px) {
  .sg-field-group input, .sg-field-group textarea { font-size: 16px; }
}
`;
