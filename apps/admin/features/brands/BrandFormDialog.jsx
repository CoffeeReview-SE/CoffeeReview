import React, { useEffect, useRef, useState } from "react";
import SuggestionImageField from "../../../shared/suggestions/SuggestionImageField.jsx";
import { imageDataError, imageText } from "../../../shared/suggestions/suggestionImages.mjs";
import { adminJson, adminRequest } from "../../api/adminApi.js";

const emptyBrand = { name: "", description: "", logoUrl: "", websiteUrl: "" };

export default function BrandFormDialog({ brand, onClose, onSave }) {
  const dialogRef = useRef(null);
  const [form, setForm] = useState(() => ({
    ...emptyBrand,
    name: brand?.name || "",
    description: brand?.description || "",
    logoUrl: brand?.logoUrl || "",
    websiteUrl: brand?.websiteUrl || "",
  }));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [readingImage, setReadingImage] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const change = event => {
    setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
    setError("");
  };

  const submit = async event => {
    event.preventDefault();
    if (saving || readingImage) return;
    const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
    if (!payload.name) {
      setError("Vui lòng nhập tên thương hiệu.");
      dialogRef.current.elements.namedItem("name").focus();
      return;
    }
    if (payload.websiteUrl) {
      try {
        const website = new URL(payload.websiteUrl);
        if (!["http:", "https:"].includes(website.protocol)) throw new Error();
      } catch {
        setError("Website phải là đường dẫn đầy đủ bắt đầu bằng http:// hoặc https://.");
        dialogRef.current.elements.namedItem("websiteUrl").focus();
        return;
      }
    }

    setSaving(true);
    setError("");
    try {
      if (payload.logoUrl.startsWith("data:")) {
        const imageError = imageDataError(payload.logoUrl);
        if (imageError) throw new Error(imageText("vi", imageError));
        const uploaded = await adminRequest("submissions/images", adminJson("POST", {
          brandName: payload.name, kind: "logo", value: payload.logoUrl,
        }));
        payload.logoUrl = uploaded.url;
        setForm(previous => ({ ...previous, logoUrl: uploaded.url }));
      }
      await onSave(payload);
    } catch (saveError) {
      setError(saveError.message || "Chưa lưu được thương hiệu. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return <dialog ref={dialogRef} className="brand-form" aria-labelledby="brand-form-title"
    onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}
    onClick={event => { if (event.target === event.currentTarget && !saving) onClose(); }}>
    <header className="brand-form__header">
      <div>
        <span className="brand-form__eyebrow">QUẢN TRỊ DANH MỤC</span>
        <h2 id="brand-form-title">Chỉnh sửa thương hiệu</h2>
        <p>Cập nhật thông tin thương hiệu trong danh mục.</p>
      </div>
      <button type="button" className="brand-form__close" onClick={onClose} disabled={saving} aria-label="Đóng">×</button>
    </header>
    <form onSubmit={submit} noValidate>
      <label className="brand-form__field">
        <span>Tên thương hiệu <b>*</b></span>
        <input autoFocus name="name" maxLength={160} value={form.name} onChange={change} required disabled={saving} />
      </label>
      <label className="brand-form__field">
        <span>Mô tả</span>
        <textarea name="description" rows={4} value={form.description} onChange={change} disabled={saving} />
      </label>
      <div className="brand-form__grid">
        <div className="brand-form__field">
          <label htmlFor="logoUrl-file">Logo thương hiệu</label>
          {form.logoUrl && !form.logoUrl.startsWith("data:") && <img className="brand-form__logo-preview" src={form.logoUrl} alt="Logo thương hiệu" />}
          <SuggestionImageField name="logoUrl" value={form.logoUrl} language="vi" disabled={saving}
            onChange={value => { setForm(previous => ({ ...previous, logoUrl: value })); setError(""); }}
            onError={code => setError(imageText("vi", code))}
            onReadingChange={setReadingImage} />
        </div>
        <label className="brand-form__field">
          <span>Website</span>
          <input name="websiteUrl" type="url" placeholder="https://..." value={form.websiteUrl} onChange={change} disabled={saving} />
        </label>
      </div>
      {error && <p className="brand-form__error" role="alert">{error}</p>}
      <footer>
        <button type="button" className="brand-form__cancel" onClick={onClose} disabled={saving}>Hủy</button>
        <button type="submit" className="brand-form__save" disabled={saving || readingImage}>{saving ? "Đang lưu…" : "Lưu thay đổi"}</button>
      </footer>
    </form>
    <style>{`
      .brand-form{box-sizing:border-box;width:min(620px,calc(100vw - 28px));max-height:90dvh;padding:24px;border:1px solid #e6d9cd;border-radius:18px;background:#fffefa;color:#2a1810;font:14px/1.5 Inter,system-ui,sans-serif;box-shadow:0 24px 70px #170e0838}
      .brand-form::backdrop{background:#21150db0;backdrop-filter:blur(3px)}
      .brand-form__header{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:22px}
      .brand-form__eyebrow{color:#a45a2a;font-size:10px;font-weight:700;letter-spacing:.1em}
      .brand-form h2{margin:5px 0;font-size:21px}
      .brand-form__header p{margin:0;color:#796b60;font-size:13px}
      .brand-form__close{width:32px;height:32px;border:0;border-radius:9px;background:#f5eee7;color:#6b3a22;font-size:24px;line-height:1;cursor:pointer}
      .brand-form__field{display:grid;gap:6px;margin-bottom:16px}
      .brand-form__field>span{font-size:13px;font-weight:600}
      .brand-form__field b{color:#b42318}
      .brand-form__field input,.brand-form__field textarea{box-sizing:border-box;width:100%;padding:10px 12px;border:1px solid #dfd3c7;border-radius:9px;background:white;color:inherit;font:inherit}
      .brand-form__field input:focus,.brand-form__field textarea:focus{border-color:#b87b4c;outline:3px solid #c18b482b}
      .brand-form__field>label{font-size:13px;font-weight:600}
      .brand-form .sg-image-field{display:grid;gap:8px;min-width:0}
      .brand-form .sg-image-field small{color:#796b60}
      .brand-form .sg-image-field button{justify-self:start;padding:7px 10px;border:1px solid #dfd3c7;border-radius:8px;background:#fff;color:#6b3a22;font:inherit;cursor:pointer}
      .brand-form__logo-preview,.brand-form .sg-image-preview{display:block;max-width:100%;width:150px;height:120px;object-fit:contain;border:1px solid #e6d9cd;border-radius:9px;background:#fff}
      .brand-form__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      .brand-form__error{margin:0;color:#b42318;font-size:13px}
      .brand-form footer{display:flex;justify-content:flex-end;gap:10px;margin-top:22px}
      .brand-form footer button{min-height:40px;padding:0 15px;border:1px solid #dfd3c7;border-radius:9px;background:#fff;color:#54311d;font:inherit;font-weight:600;cursor:pointer}
      .brand-form footer .brand-form__save{border-color:#bd5e25;background:#bd5e25;color:#fff}
      .brand-form footer button:disabled,.brand-form__close:disabled{opacity:.6;cursor:not-allowed}
      @media(max-width:620px){.brand-form{padding:18px}.brand-form__grid{grid-template-columns:1fr;gap:0}}
    `}</style>
  </dialog>;
}
