import React, { useEffect, useState } from "react";
import { adminJson, adminRequest } from "../../api/adminApi.js";

const languages = { en: "Tiếng Anh", ja: "Tiếng Nhật", zh: "Tiếng Trung" };
const statuses = { missing: "Chưa dịch", saved: "Đã lưu", stale: "Cần cập nhật", draft: "Bản nháp chưa lưu" };

export default function BrandTranslations({ brandId, description, disabled }) {
  const [data, setData] = useState(null);
  const [language, setLanguage] = useState("en");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const path = `localization/brands/${brandId}/translations`;
  const load = async () => {
    setBusy(true); setError(""); setNotice("");
    try { setData(await adminRequest(path)); }
    catch (error) { setError(error.message); }
    finally { setBusy(false); }
  };
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    adminRequest(path, { signal: controller.signal }).then(setData)
      .catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [path]);
  const sourceChanged = data && description !== data.sourceDescription;
  const blocked = busy || disabled || !data || sourceChanged || !data.sourceDescription.trim();
  const entry = data?.translations[language];
  const update = (code, changes) => setData(previous => ({ ...previous,
    translations: { ...previous.translations, [code]: { ...previous.translations[code], ...changes } },
  }));
  const generate = async codes => {
    if (blocked) return;
    setBusy(true); setError(""); setNotice("");
    const failed = [];
    for (const code of codes) {
      try {
        const result = await adminRequest(`${path}/${code}`, adminJson("POST", {}));
        update(code, { description: result.description, status: "draft" });
      } catch (error) { failed.push(`${languages[code]}: ${error.message}`); }
    }
    setError(failed.join("; "));
    setNotice("Bản dịch tạo tự động là bản nháp. Kiểm tra và lưu từng ngôn ngữ.");
    setBusy(false);
  };
  const save = async () => {
    if (blocked || !entry?.description.trim()) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const saved = await adminRequest(`${path}/${language}`, adminJson("PUT", {
        description: entry.description, sourceDescription: data.sourceDescription, expectedRevision: entry.revision,
      }));
      update(language, { ...saved, status: "saved" });
      setNotice(`Đã lưu bản dịch ${languages[language]}.`);
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  };
  return <fieldset disabled={disabled || busy} style={{ border: "1px solid #dfd3c7", borderRadius: 10, margin: "18px 0", padding: 14 }}>
    <legend>Bản dịch mô tả thương hiệu</legend>
    <p>Bản dịch lưu riêng với thông tin thương hiệu. Bản nháp chưa lưu sẽ mất khi đóng cửa sổ.</p>
    {sourceChanged && <p role="status">Mô tả gốc đang thay đổi. Lưu thương hiệu rồi mở lại để cập nhật bản dịch.</p>}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {Object.entries(languages).map(([code, name]) => <button type="button" key={code} aria-pressed={language === code} onClick={() => { setLanguage(code); setNotice(""); }}>{name}{data ? ` · ${statuses[data.translations[code].status]}` : ""}</button>)}
    </div>
    {data && <>
      <details><summary>Mô tả gốc đã lưu</summary><p style={{ whiteSpace: "pre-wrap" }}>{data.sourceDescription || "Chưa có mô tả gốc."}</p></details>
      <label className="brand-form__field" style={{ marginTop: 12 }}>
        <span>{languages[language]} · {statuses[entry.status]}</span>
        <textarea rows={6} maxLength={20000} value={entry.description} disabled={Boolean(sourceChanged)} onChange={event => { update(language, { description: event.target.value, status: "draft" }); setNotice(""); }} />
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" disabled={blocked} onClick={() => generate([language])}>Dịch tự động</button>
        <button type="button" disabled={blocked} onClick={() => generate(Object.keys(languages))}>Tạo bản dịch cả 3 ngôn ngữ</button>
        <button type="button" disabled={blocked || !entry.description.trim()} onClick={save}>Lưu bản dịch</button>
      </div>
    </>}
    <button type="button" style={{ marginTop: 10 }} onClick={load}>Tải lại bản đã lưu (bỏ bản nháp)</button>
    {busy && <p role="status">Đang xử lý bản dịch…</p>}
    {notice && <p role="status">{notice}</p>}
    {error && <p className="brand-form__error" role="alert">{error}</p>}
  </fieldset>;
}
