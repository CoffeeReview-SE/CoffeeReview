import React, { useEffect, useRef, useState } from "react";
import { getUserApi, toBrandCard } from "../../../shared/api/userApi.js";
import SuggestionImageField from "../../../shared/suggestions/SuggestionImageField.jsx";
import { imageFields } from "../../../shared/suggestions/suggestionImages.mjs";
import { emptySuggestion, getBrandSuggestionValues, suggestionFields, suggestionText, validateSuggestion } from "../../../shared/suggestions/suggestionForm.mjs";
import "./CreateSuggestionDialog.css";

const fieldGroups = [
  { title: "Thông tin người gửi", fields: ["name", "phone"] },
  { title: "Thông tin thương hiệu", fields: ["brandName", "type", "description", "websiteUrl", "logoUrl", "coverUrl", "menuImageUrl"] },
  { title: "Thông tin chi nhánh đề xuất", fields: ["branchName", "address", "branchPhone", "latitude", "longitude", "openingHours"] },
];

export default function CreateSuggestionDialog({ onClose, onCreated }) {
  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const [brands, setBrands] = useState([]);
  const [catalogStatus, setCatalogStatus] = useState("loading");
  const [mode, setMode] = useState("existing");
  const [brandId, setBrandId] = useState("");
  const [formData, setFormData] = useState({ ...emptySuggestion });
  const [errors, setErrors] = useState({});
  const [readingImages, setReadingImages] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const imagePending = Object.values(readingImages).some(Boolean);
  const selectedBrand = brands.find(brand => String(brand.id) === brandId);
  const isNewBrand = mode === "new";

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

  useEffect(() => {
    const controller = new AbortController();
    getUserApi("/api/catalog/brands", { signal: controller.signal })
      .then(rows => {
        if (!Array.isArray(rows)) throw new Error("Không tải được danh mục thương hiệu.");
        setBrands(rows.map(toBrandCard));
        setCatalogStatus("ready");
      })
      .catch(loadError => {
        if (!controller.signal.aborted) {
          setCatalogStatus("error");
          setError(loadError.message || "Không tải được danh mục thương hiệu.");
        }
      });
    return () => controller.abort();
  }, []);

  const updateField = (name, value) => {
    setFormData(previous => ({ ...previous, [name]: value }));
    setErrors(previous => ({ ...previous, [name]: undefined }));
  };

  const chooseMode = value => {
    setMode(value);
    setBrandId("");
    setFormData({ ...emptySuggestion });
    setErrors({});
    setError("");
  };

  const chooseBrand = event => {
    const id = event.target.value;
    const brand = brands.find(item => String(item.id) === id);
    setBrandId(id);
    setFormData(previous => ({
      ...previous,
      brandName: "",
      type: "",
      description: "",
      websiteUrl: "",
      logoUrl: "",
      coverUrl: "",
      menuImageUrl: "",
      ...(brand ? getBrandSuggestionValues(brand) : {}),
      branchName: "",
    }));
    setErrors({});
    setError("");
  };

  const submit = async event => {
    event.preventDefault();
    if (busy || imagePending) return;
    const validationErrors = validateSuggestion(formData, isNewBrand);
    if (!isNewBrand && !selectedBrand) validationErrors.brandName = "required";
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      setError("Vui lòng kiểm tra các trường được đánh dấu.");
      const firstInvalid = Object.keys(validationErrors).find(name => name !== "brandName" || isNewBrand);
      if (firstInvalid) formRef.current?.elements.namedItem(firstInvalid)?.focus();
      else if (!isNewBrand) formRef.current?.elements.namedItem("brandId")?.focus();
      return;
    }
    if (isNewBrand && brands.some(brand =>
      brand.name.trim().toLocaleLowerCase() === formData.brandName.trim().toLocaleLowerCase()
    )) {
      setErrors(previous => ({ ...previous, brandName: "invalid" }));
      setError("Thương hiệu này đã có trong hệ thống. Hãy chọn loại đề xuất thêm chi nhánh.");
      formRef.current?.elements.namedItem("brandName")?.focus();
      return;
    }

    setBusy(true);
    setError("");
    try {
      await getUserApi("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(Object.entries(formData)
            .map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])),
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
        }),
      });
      await onCreated();
      onClose();
    } catch (submitError) {
      if (submitError.errors) setErrors(submitError.errors);
      setError(submitError.errors
        ? "Vui lòng kiểm tra các trường được đánh dấu."
        : submitError.message || "Không gửi được đề xuất. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  const renderField = name => {
    const field = suggestionFields.find(item => item.name === name);
    if (!field) return null;
    const value = formData[name];
    const Field = field.multiline ? "textarea" : "input";
    const optionalForExisting = !isNewBrand && field.brandOnly;
    const fieldRequired = !optionalForExisting;
    const disabled = !isNewBrand && Boolean(selectedBrand) &&
      (field.brandOnly || name === "brandName") &&
      typeof value === "string" && value.trim() !== "";

    return <div className="create-suggestion__field" key={name}>
      <label htmlFor={imageFields.includes(name) ? `${name}-file` : name}>
        <span>{suggestionText("vi", name)}{fieldRequired && <b aria-hidden="true"> *</b>}</span>
      </label>
      {imageFields.includes(name) ? <SuggestionImageField
        name={name}
        value={value}
        language="vi"
        invalid={Boolean(errors[name])}
        disabled={disabled}
        onChange={next => updateField(name, next)}
        onError={code => setErrors(previous => ({ ...previous, [name]: code }))}
        onReadingChange={reading => setReadingImages(previous => ({ ...previous, [name]: reading }))}
      /> : <Field
        id={name}
        name={name}
        type={field.multiline ? undefined : field.type || "text"}
        rows={field.multiline ? 4 : undefined}
        step={field.type === "number" ? "any" : undefined}
        min={field.min}
        max={field.max}
        maxLength={field.maxLength}
        placeholder={field.type === "url" ? "https://..." : undefined}
        value={value}
        onChange={event => updateField(name, event.target.value)}
        readOnly={disabled}
        required={fieldRequired}
        aria-invalid={Boolean(errors[name])}
      />}
      {errors[name] && <small className="create-suggestion__error">{suggestionText("vi", errors[name])}</small>}
    </div>;
  };

  return <dialog ref={dialogRef} className="create-suggestion" aria-labelledby="create-suggestion-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <header className="create-suggestion__header">
      <div><h2 id="create-suggestion-title">Tạo đề xuất mới</h2><p>Thông tin sẽ được lưu vào danh sách chờ duyệt.</p></div>
      <button type="button" onClick={onClose} disabled={busy} aria-label="Đóng form">Đóng</button>
    </header>
    <form ref={formRef} onSubmit={submit} noValidate>
      <label className="create-suggestion__field">
        <span>Loại đề xuất</span>
        <select value={mode} onChange={event => chooseMode(event.target.value)} disabled={busy}>
          <option value="existing">Thêm chi nhánh cho thương hiệu có sẵn</option>
          <option value="new">Thêm thương hiệu mới và chi nhánh đầu tiên</option>
        </select>
      </label>

      {!isNewBrand && <label className="create-suggestion__field">
        <span>Chọn thương hiệu trong hệ thống <b aria-hidden="true">*</b></span>
        <select value={brandId} onChange={chooseBrand} disabled={busy || catalogStatus !== "ready"} required aria-invalid={Boolean(errors.brandName)}>
          <option value="">{catalogStatus === "loading" ? "Đang tải thương hiệu…" : "Chọn thương hiệu"}</option>
          {brands.filter(brand => brand.isActive !== false).map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
        </select>
        {errors.brandName && <small className="create-suggestion__error">Vui lòng chọn thương hiệu.</small>}
      </label>}
      {catalogStatus === "error" && !isNewBrand && <p className="create-suggestion__error" role="alert">Không tải được danh mục. Vui lòng tải lại trang rồi thử lại.</p>}

      {fieldGroups.map(group => <section key={group.title}>
        <h3>{group.title}</h3>
        <div className="create-suggestion__grid">
          {group.fields.map(renderField)}
        </div>
      </section>)}

      <label className="create-suggestion__field" htmlFor="note">
        <span>Ghi chú</span>
        <textarea id="note" name="note" rows={3} maxLength={2000} value={formData.note}
          onChange={event => updateField("note", event.target.value)} aria-invalid={Boolean(errors.note)} />
        {errors.note && <small className="create-suggestion__error">{suggestionText("vi", errors.note)}</small>}
      </label>
      {error && <p className="create-suggestion__error" role="alert">{error}</p>}
      <footer>
        <button type="button" onClick={onClose} disabled={busy}>Hủy</button>
        <button type="submit" className="create-suggestion__submit" disabled={busy || imagePending || (!isNewBrand && catalogStatus !== "ready")}>
          {busy ? "Đang gửi…" : imagePending ? "Đang đọc ảnh…" : "Gửi đề xuất"}
        </button>
      </footer>
    </form>
  </dialog>;
}
