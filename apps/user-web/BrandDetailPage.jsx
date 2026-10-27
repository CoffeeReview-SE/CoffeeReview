import React, { useEffect, useRef, useState } from "react";
import BrandLogo from "../BrandLogo.jsx";

/* Dữ liệu mẫu — thay bằng kết quả API theo brandId khi backend sẵn sàng. */
const demo = {
  id: 2, name: "Phúc Long", type: "Trà, cà phê", branchCount: 18,
  description: "Phúc Long là thương hiệu trà và cà phê nổi tiếng tại Việt Nam, với hơn 50 năm phát triển. Từ những năm 1968, Phúc Long đã mang đến những sản phẩm chất lượng cao, kết hợp giữa hương vị truyền thống và hiện đại.",
  website: "phuclong.com.vn", hotline: "1800 6779", menuCaption: "Menu 2024",
  badge: "#1F6B45", mark: ["PHÚC", "LONG"],
  cover: "", logo: "", audio: "", menuImages: [],
  branches: [
    { name: "Phúc Long - Quận 1", address: "42 Nguyễn Huệ, Quận 1" },
    { name: "Phúc Long - Quận 7", address: "Riverside, Quận 7" },
    { name: "Phúc Long - Bình Thạnh", address: "360 Điện Biên Phủ, Bình Thạnh" },
  ],
};
const TILE_BG = ["linear-gradient(135deg,#F3E3CC,#E4C7A0)", "linear-gradient(135deg,#FBE7A8,#F0B84F)", "linear-gradient(135deg,#F6E1CB,#C98B5A)"];

const paths = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
  pause: <path d="M8 5v14M16 5v14" strokeWidth="3.2" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  tag: <><path d="M3 12V4h8l10 10-8 8z" /><circle cx="7.5" cy="8.5" r="1.2" /></>,
  repeat: <><path d="M17 2l4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></>,
  cup: <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2M3 21h16M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4" />,
  left: <path d="m15 6-6 6 6 6" />,
  right: <path d="m9 6 6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
};
const Icon = ({ n, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[n]}</svg>
);

function Header({ go, goBrands }) {
  const [lang, setLang] = useState("VI");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: "VI", label: "Tiếng Việt" },
    { code: "EN", label: "English" },
    { code: "KO", label: "한국어" }
  ];

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

  // Cấu hình menu: "brands" được đánh dấu active để hiển thị nổi bật và gạch chân giống trang chủ
  const items = [
    ["home", "Trang chủ", () => go("home")], 
    ["brands", "Thương hiệu", () => goBrands()], 
    ["map", "Bản đồ", () => go("map")], 
    ["suggestions", "Đề xuất", () => go("suggestions")]
  ];
  
  return <header className="bd-bar">
    <button className="bd-logo" onClick={() => go("home")}>
      <BrandLogo size={34} tone="light" /><span><b>SaigonCoffee</b><small>Khám phá cà phê Sài Gòn</small></span>
    </button>
    <nav className="bd-nav" aria-label="Điều hướng chính">
      {items.map(([k, label, fn]) => (
        <button 
          key={k} 
          aria-current={k === "brands" ? "page" : undefined} 
          onClick={fn}
        >
          {label}
        </button>
      ))}
    </nav>
    <div className="bd-tools">
      {/* Custom Dropdown Ngôn Ngữ */}
      <div className="bd-lang-dropdown" ref={dropdownRef}>
        <button 
          className="bd-lang-btn" 
          onClick={() => setIsOpen(!isOpen)} 
          aria-expanded={isOpen}
          aria-label="Chọn ngôn ngữ"
        >
          <span>{lang}</span>
          <span className={`bd-chevron-icon ${isOpen ? "open" : ""}`}>
            <Icon n="chevron" size={12} />
          </span>
        </button>
        
        {isOpen && (
          <div className="bd-lang-menu">
            {languages.map((item) => (
              <button
                key={item.code}
                className={`bd-lang-item ${lang === item.code ? "active" : ""}`}
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
  </header>;
}

function Logo({ item, size }) {
  if (item.logo) return <img src={item.logo} alt={`Logo ${item.name}`} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  const big = size > 60;
  const text = big ? (item.mark || [item.name]) : [item.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()];
  return <span className="bd-mark" style={{ width: size, height: size, background: item.badge || "#1F6B45", fontSize: big ? size * 0.13 : size * 0.34, boxShadow: big ? "inset 0 0 0 4px rgba(255,255,255,.85)" : "none" }}>
    {text.map(l => <span key={l}>{l}</span>)}
  </span>;
}

function AudioCard({ audio }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [t, setT] = useState({ cur: 0, dur: 0 });
  
  const src = audio && typeof audio === "object" ? Object.values(audio)[0] : audio;

  useEffect(() => { setPlaying(false); setT({ cur: 0, dur: 0 }); }, [src]);
  const toggle = () => {
    const a = ref.current;
    if (!a || !src) return;
    if (a.paused) a.play().catch(() => setPlaying(false)); else a.pause();
  };
  const seek = e => { const v = +e.target.value; ref.current.currentTime = v; setT(x => ({ ...x, cur: v })); };
  const pct = t.dur ? (t.cur / t.dur) * 100 : 0;
  return <div className="bd-audio">
    <audio ref={ref} src={src || undefined} loop={loop} preload="metadata"
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
      onTimeUpdate={e => setT(x => ({ ...x, cur: e.target.currentTime }))}
      onLoadedMetadata={e => setT({ cur: 0, dur: e.target.duration })} />
    <button className="bd-play" onClick={toggle} title={src ? undefined : "Chưa có file audio"} aria-label={playing ? "Tạm dừng" : "Nghe giới thiệu thương hiệu"}>
      <Icon n={playing ? "pause" : "play"} size={20} />
    </button>
    <div className="bd-track">
      <span>Nghe giới thiệu thương hiệu</span>
      <input className="bd-range" type="range" min="0" max={t.dur || 1} step="0.1" value={t.cur} disabled={!src} onChange={seek} aria-label="Tua audio" style={{ "--p": `${pct}%` }} />
    </div>
    <div className="bd-audio-r">
      <button onClick={() => setLoop(v => !v)} aria-pressed={loop} aria-label="Lặp lại" className={loop ? "on" : ""}><Icon n="repeat" size={16} /></button>
    </div>
  </div>;
}

const Tile = ({ src, i, alt }) => src
  ? <img src={src} alt={alt} loading="lazy" />
  : <div className="bd-tile" style={{ background: TILE_BG[i % 3] }}><Icon n="cup" size={44} /></div>;

export default function BrandDetailPage({ brandId, brand, onBack, onNavigate, onOpenBranch }) {
  const item = brand || { ...demo, id: brandId || demo.id };
  const type = item.type || item.category || "";
  const branches = item.branches || [];
  const count = item.branchCount ?? branches.length;
  const images = item.menuImages?.length ? item.menuImages : [null, null, null];
  const [view, setView] = useState(null);
  const go = key => onNavigate && onNavigate(key);
  const goBrands = () => (onBack ? onBack() : go("brands"));

  useEffect(() => {
    if (view === null) return;
    const n = images.length;
    const k = e => {
      if (e.key === "Escape") setView(null);
      if (e.key === "ArrowRight") setView(v => (v + 1) % n);
      if (e.key === "ArrowLeft") setView(v => (v - 1 + n) % n);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [view, images.length]);

  const info = [
    ["pin", `${count} chi nhánh tại TP.HCM`],
    ["globe", item.website && <>Website: <a href={`https://${item.website.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer">{item.website}</a></>],
    ["phone", item.hotline && `Hotline: ${item.hotline}`],
    ["tag", type && `Loại hình: ${type}`],
  ].filter(r => r[1]);

  return <div className="bd">
    <style>{css}</style>
    <Header go={go} goBrands={goBrands} />
    <div className="bd-wrap">
      <div className="bd-cover" style={item.cover ? { backgroundImage: `url(${item.cover})` } : undefined}>
        <div className="bd-logo-big"><Logo item={item} size={104} /></div>
      </div>

      <div className="bd-cols">
        <div className="bd-left">
          <h1>{item.name || `Thương hiệu #${item.id}`}</h1>
          <p className="bd-type">{type}</p>
          <p className="bd-where"><Icon n="pin" size={15} /> {count} chi nhánh tại TP.HCM</p>

          <AudioCard audio={item.audio} />

          <p className="bd-desc">{item.description || "Thông tin thương hiệu sẽ được tải từ hệ thống."}</p>

          <section className="bd-card">
            <div className="bd-card-h"><h2>Hình ảnh thực đơn</h2><button onClick={() => setView(0)}>Xem tất cả <Icon n="arrow" size={12} /></button></div>
            <div className="bd-gal">
              <button className="bd-big" onClick={() => setView(0)} aria-label="Phóng to hình thực đơn 1"><Tile src={images[0]} i={0} alt="Hình thực đơn 1" /></button>
              <div className="bd-side">
                <div className="bd-pair">
                  {[1, 2].map(i => <button key={i} onClick={() => setView(i)} aria-label={`Phóng to hình thực đơn ${i + 1}`}><Tile src={images[i]} i={i} alt={`Hình thực đơn ${i + 1}`} /></button>)}
                </div>
                <div className="bd-cap"><span>{item.menuCaption || "Menu 2024"}</span><button onClick={() => setView(0)} aria-label="Phóng to"><Icon n="search" size={16} /></button></div>
              </div>
            </div>
          </section>
        </div>

        <aside className="bd-right">
          <section className="bd-card">
            <h2>Thông tin nhanh</h2>
            <ul className="bd-info">{info.map(([ic, text]) => <li key={ic}><span><Icon n={ic} size={15} /></span><div>{text}</div></li>)}</ul>
          </section>
          <section className="bd-card">
            <h2>Chi nhánh nổi bật</h2>
            {branches.length ? <ul className="bd-br">
              {branches.map((b, i) => <li key={b.id || b.name || i}>
                <Logo item={item} size={36} />
                <div><strong>{b.name}</strong><span>{b.address || "Chưa cập nhật địa chỉ"}</span></div>
                <button onClick={() => onOpenBranch ? onOpenBranch(b) : window.alert(`Mở chi tiết ${b.name}; cần kết nối router/API.`)}>Xem chi tiết</button>
              </li>)}
            </ul> : <p className="bd-muted">Chưa có chi nhánh nổi bật.</p>}
          </section>
        </aside>
      </div>
    </div>

    {view !== null && <div className="bd-lb" role="dialog" aria-modal="true" aria-label="Xem hình thực đơn" onClick={() => setView(null)}>
      <div className="bd-lb-in" onClick={e => e.stopPropagation()}><Tile src={images[view]} i={view} alt={`Hình thực đơn ${view + 1}`} /></div>
      <button className="bd-lb-x" onClick={() => setView(null)} aria-label="Đóng"><Icon n="close" /></button>
      {images.length > 1 && <>
        <button className="bd-lb-n l" onClick={e => { e.stopPropagation(); setView((view - 1 + images.length) % images.length); }} aria-label="Ảnh trước"><Icon n="left" /></button>
        <button className="bd-lb-n r" onClick={e => { e.stopPropagation(); setView((view + 1 + images.length) % images.length); }} aria-label="Ảnh sau"><Icon n="right" /></button>
      </>}
    </div>}
  </div>;
}

const css = `
.bd{--brown:#4B2817;--brown-3:#6B3A22;--accent:#C8672B;--ink:#2A1810;--muted:#8B7A6C;--line:#EFE5DA;min-height:100vh;background:#FAF7F3;color:var(--ink);font-family:Inter,system-ui,"Segoe UI",sans-serif}
.bd *{box-sizing:border-box}
.bd :where(button,input,select){font:inherit}
.bd button:focus-visible,.bd input:focus-visible,.bd select:focus-visible,.bd a:focus-visible{outline:2px solid #E9A24B;outline-offset:2px}

.bd-bar{display:flex;align-items:center;gap:28px;height:60px;padding:0 6vw;color:#fff;background:linear-gradient(180deg,#5A3220,#442211)}
.bd-logo{display:flex;align-items:center;gap:10px;padding:0;border:0;background:none;color:#fff;text-align:left;cursor:pointer}
.bd-logo b{display:block;font-size:15px;line-height:1.15}
.bd-logo small{display:block;font-size:9px;opacity:.65}

.bd-nav{display:flex;flex:1;gap:26px}
.bd-nav button{padding:21px 0 17px;border:0;border-bottom:2px solid transparent;background:none;color:rgba(255,255,255,.82);font-size:13px;cursor:pointer}
.bd-nav button:hover{color:#fff}
/* Đồng bộ kiểu gạch chân và làm nổi bật chữ khi đang ở trang đó (giống trang chủ) */
.bd-nav button[aria-current=page]{color:#fff;font-weight:600;border-color:#E9A24B}

.bd-tools{display:flex;align-items:center;gap:14px}

/* Custom Dropdown Ngôn Ngữ */
.bd-lang-dropdown{position:relative}
.bd-lang-btn{display:flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid rgba(255,255,255,0.2);border-radius:8px;background:rgba(255,255,255,0.08);color:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s ease}
.bd-lang-btn:hover{background:rgba(255,255,255,0.15);border-color:rgba(255,255,255,0.4)}
.bd-chevron-icon{display:flex;align-items:center;transition:transform 0.25s ease}
.bd-chevron-icon.open{transform:rotate(180deg)}
.bd-lang-menu{position:absolute;right:0;top:calc(100% + 6px);min-width:110px;padding:6px;border-radius:8px;background:#fff;box-shadow:0 8px 20px rgba(42,24,16,0.18);border:1px solid var(--line);z-index:100;display:flex;flex-direction:column;gap:2px;animation:fadeInDown 0.2s ease}
.bd-lang-item{display:block;width:100%;padding:8px 12px;border:0;border-radius:6px;background:transparent;color:var(--ink);font-size:12px;font-weight:500;text-align:left;cursor:pointer;transition:background 0.15s ease, color 0.15s ease}
.bd-lang-item:hover{background:#F6EFE7;color:var(--brown-3)}
.bd-lang-item.active{background:var(--brown-3);color:#fff;font-weight:600}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.bd-wrap{max-width:1160px;margin:0 auto;padding:22px 5vw 64px}
.bd-cover{position:relative;height:170px;border-radius:12px;background:radial-gradient(circle at 15% 40%,rgba(233,168,90,.55),transparent 30%),radial-gradient(circle at 60% 30%,rgba(255,220,150,.4),transparent 22%),radial-gradient(circle at 88% 60%,rgba(110,150,80,.6),transparent 34%),linear-gradient(120deg,#3A2A18,#4F4A26 55%,#2F3A22);background-size:cover;background-position:center}
.bd-logo-big{position:absolute;left:28px;bottom:-52px;display:grid;place-items:center;width:128px;height:128px;border-radius:50%;background:#fff;box-shadow:0 6px 18px rgba(75,40,23,.2)}
.bd-mark{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;border-radius:50%;color:#fff;font-weight:800;line-height:1.12;letter-spacing:.4px;text-align:center}
.bd-cols{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(300px,1fr);gap:22px;margin-top:18px}
.bd-left{padding-top:46px}
.bd-left h1{margin:0 0 4px;color:var(--brown);font-size:26px;font-weight:700}
.bd-type{margin:0 0 8px;color:var(--muted);font-size:13.5px}
.bd-where{display:flex;align-items:center;gap:6px;margin:0 0 18px;color:var(--brown-3);font-size:13px}

.bd-audio{display:flex;align-items:center;gap:14px;padding:12px 16px;border:1px solid var(--line);border-radius:12px;background:#fff;box-shadow:0 2px 10px rgba(75,40,23,.05)}
.bd-play{display:grid;place-items:center;flex:none;width:44px;height:44px;padding:0 0 0 2px;border:0;border-radius:50%;background:var(--brown-3);color:#fff;cursor:pointer}
.bd-track{display:flex;flex:1;flex-direction:column;gap:9px;min-width:0;font-size:12.5px}
.bd-range{appearance:none;-webkit-appearance:none;width:100%;height:6px;margin:0;border-radius:6px;background:linear-gradient(to right,var(--brown-3) var(--p),#EADFD3 var(--p))}
.bd-range::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border:0;border-radius:50%;background:var(--brown-3)}
.bd-range::-moz-range-thumb{width:12px;height:12px;border:0;border-radius:50%;background:var(--brown-3)}
.bd-audio-r{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:12.5px}
.bd-audio-r button{display:grid;place-items:center;padding:4px;border:0;background:none;color:var(--muted);cursor:pointer}
.bd-audio-r button.on{color:var(--brown-3)}
.bd-desc{margin:18px 0 20px;color:#5C4B3F;font-size:13.5px;line-height:1.75}

.bd-card{padding:18px;border:1px solid var(--line);border-radius:12px;background:#fff;box-shadow:0 2px 10px rgba(75,40,23,.05)}
.bd-card h2{margin:0 0 16px;font-size:15px;font-weight:700}
.bd-card-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.bd-card-h h2{margin:0;font-size:13.5px}
.bd-card-h button{display:flex;align-items:center;gap:4px;padding:0;border:0;background:none;color:var(--accent);font-size:12px;cursor:pointer}
.bd-gal{display:grid;grid-template-columns:1.05fr 1fr;gap:12px}
.bd-gal button{padding:0;border:0;background:none;cursor:zoom-in}
.bd-gal img,.bd-tile{display:block;width:100%;height:100%;object-fit:cover}
.bd-tile{display:grid;place-items:center;color:rgba(75,40,23,.55)}
.bd-big{aspect-ratio:1/1.04;overflow:hidden;border-radius:10px}
.bd-side{display:flex;flex-direction:column;padding:8px;border:1px solid var(--line);border-radius:10px}
.bd-pair{display:grid;flex:1;grid-template-columns:1fr 1fr;gap:8px}
.bd-pair button{min-height:120px;overflow:hidden;border-radius:8px}
.bd-cap{display:flex;align-items:center;justify-content:space-between;padding-top:10px;font-size:12.5px}
.bd-gal .bd-cap button{display:grid;place-items:center;width:30px;height:30px;border-radius:8px;background:var(--brown-3);color:#fff;cursor:pointer}

.bd-right{display:flex;flex-direction:column;gap:18px}
.bd-info,.bd-br{margin:0;padding:0;list-style:none}
.bd-info li{display:flex;align-items:center;gap:12px;padding:8px 0;font-size:13px}
.bd-info li>span{display:grid;place-items:center;flex:none;width:30px;height:30px;border-radius:50%;background:#F6EFE7;color:var(--brown-3)}
.bd-info li:first-child{color:var(--brown-3)}
.bd-info a{color:var(--brown-3);text-decoration:none}
.bd-info a:hover{text-decoration:underline}
.bd-br li{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid #F3ECE3}
.bd-br li:last-child{padding-bottom:0;border:0}
.bd-br div{flex:1;min-width:0}
.bd-br strong{display:block;font-size:13px;font-weight:600}
.bd-br div span{display:block;margin-top:2px;color:var(--muted);font-size:12px}
.bd-br button{flex:none;padding:7px 12px;border:0;border-radius:8px;background:var(--brown-3);color:#fff;font-size:11.5px;cursor:pointer}
.bd-br button:hover{background:var(--brown)}
.bd-muted{margin:0;color:var(--muted);font-size:13px}

.bd-lb{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:24px;background:rgba(30,14,6,.82)}
.bd-lb-in{width:min(560px,92vw);aspect-ratio:1;overflow:hidden;border-radius:12px;background:#fff}
.bd-lb button{position:absolute;display:grid;place-items:center;width:40px;height:40px;border:0;border-radius:50%;background:rgba(255,255,255,.92);color:var(--brown);cursor:pointer}
.bd-lb-x{top:18px;right:18px}
.bd-lb-n{top:50%;transform:translateY(-50%)}
.bd-lb-n.l{left:18px}.bd-lb-n.r{right:18px}

@media (max-width:900px){
  .bd-cols{grid-template-columns:1fr}
}
@media (max-width:760px){
  .bd-bar{gap:12px;flex-wrap:wrap;height:auto;padding:10px 5vw 0}
  .bd-nav{order:3;flex-basis:100%;gap:20px;overflow-x:auto}
  .bd-nav button{padding:10px 0;white-space:nowrap}
  .bd-logo small{display:none}
  .bd-tools{margin-left:auto}
  .bd-audio{flex-wrap:wrap}
  .bd-track{flex-basis:calc(100% - 70px)}
  .bd-gal{grid-template-columns:1fr}
}`;
