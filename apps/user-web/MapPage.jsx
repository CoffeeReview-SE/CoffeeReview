import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LANGUAGES, useLanguage } from "./LanguageContext.jsx";
import StoreMap from "./StoreMap.jsx";

export default function MapPage() {
  const navigate = useNavigate();
  const { languageCode, setLanguageCode, t } = useLanguage();
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = event => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setLanguageMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const navItems = [
    ["home", t("nav.home"), "/"],
    ["brands", t("nav.brands"), "/brands"],
    ["map", t("nav.map"), "/map"],
    ["suggestions", t("nav.suggestions"), "/suggestions"],
  ];

  return (
    <div className="store-map-page">
      <header className="store-map-page__bar">
        <button className="store-map-page__brand" onClick={() => {
          window.dispatchEvent(new Event("saigoncoffee:show-all-stores"));
          navigate("/");
        }} type="button">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2M3 21h16M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4" />
          </svg>
          <span><b>SaigonCoffee</b><small>{t("brand.tagline")}</small></span>
        </button>
        <nav className="store-map-page__nav" aria-label="Điều hướng chính">
          {navItems.map(([key, label, path]) => (
            <button key={key} type="button" aria-current={key === "map" ? "page" : undefined} onClick={() => {
              if (key === "home") window.dispatchEvent(new Event("saigoncoffee:show-all-stores"));
              navigate(path);
            }}>
              {label}
            </button>
          ))}
        </nav>
        <div className="hp-lang-dropdown" ref={languageMenuRef}>
          <button type="button" className="hp-lang-btn" aria-label="Chọn ngôn ngữ" aria-haspopup="true" aria-expanded={languageMenuOpen} onClick={() => setLanguageMenuOpen(open => !open)}>
            {languageCode.toUpperCase()}
            <span className={`hp-chevron-icon ${languageMenuOpen ? "open" : ""}`} aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </span>
          </button>
          {languageMenuOpen && (
            <div className="hp-lang-menu">
              {LANGUAGES.map(language => (
                <button key={language.code} type="button" className={`hp-lang-item ${language.code === languageCode ? "active" : ""}`} aria-current={language.code === languageCode ? "true" : undefined} onClick={() => {
                  setLanguageCode(language.code);
                  setLanguageMenuOpen(false);
                }}>
                  {language.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
      <StoreMap fullScreen enableRouting />
    </div>
  );
}
