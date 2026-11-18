import React, { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { divIcon } from "leaflet";
import { adminRequest, adminJson } from "./adminApi.js";
import { branchFields, branchForm, branchPayload, branchStatuses, duplicateBranches, hoursText, readBranchHistory, readEditorName, recordBranchHistory, sameBranchData, validBranchPosition, validateBranch } from "./branchForm.mjs";
import { getBrandFallbackImage } from "./branchBrandImages.mjs";
import SuggestionImageField from "../user-web/SuggestionImageField.jsx";
import { imageFields, imageText } from "../user-web/suggestionImages.mjs";
import "./BranchEditor.css";

const pin = divIcon({ className: "branch-editor__pin", html: '<span aria-hidden="true">●</span>', iconSize: [28, 28], iconAnchor: [14, 14] });
function PositionPicker({ position, disabled, onPick }) {
  const map = useMapEvents({ click: event => { if (!disabled) onPick([event.latlng.lat, event.latlng.lng]); } });
  useEffect(() => { if (position) map.panTo(position); }, [position?.[0], position?.[1], map]);
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return position && <Marker position={position} icon={pin} draggable={!disabled} eventHandlers={{ dragend: event => { const point = event.target.getLatLng(); onPick([point.lat, point.lng]); } }} />;
}

function historyValue(name, snapshot) {
  if (name === "status") return branchStatuses[snapshot.status] || snapshot.status;
  if (name === "brandId") return snapshot.brand || snapshot.brandId;
  return hoursText(snapshot[name]) || "Chưa cung cấp";
}

export default function BranchEditor({ row, brands, readOnly, onClose, onSaved }) {
  const dialogRef = useRef(null);
  const [currentRow, setCurrentRow] = useState(row);
  const [form, setForm] = useState(() => branchForm(row, brands[0]?.id));
  const [actor, setActor] = useState(readEditorName);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [readingImages, setReadingImages] = useState({});
  const [duplicates, setDuplicates] = useState([]);
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [history, setHistory] = useState(() => row?.id ? readBranchHistory(row.id) : []);
  const imagePending = Object.values(readingImages).some(Boolean);
  const position = validBranchPosition(form) ? [Number(form.latitude), Number(form.longitude)] : null;
  const selectedBrand = brands.find(brand => String(brand.id) === form.brandId);
  useEffect(() => {
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => { dialog.close(); document.body.style.overflow = overflow; };
  }, []);

  const change = (name, value) => {
    setForm(previous => ({ ...previous, [name]: value }));
    setErrors(previous => ({ ...previous, [name]: undefined }));
    setDuplicates([]); setAllowDuplicate(false); setNotice("");
  };
  const submit = async event => {
    event.preventDefault();
    if (readOnly || saving || imagePending) return;
    const nextErrors = validateBranch(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { dialogRef.current.querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus(); return; }
    setSaving(true); setError("");
    let savedRow = currentRow;
    let historyFailed = false;
    let coreSaved = false;
    try {
      const latest = await adminRequest("catalog/branches");
      const matches = duplicateBranches(form, latest, currentRow?.id);
      const acknowledged = allowDuplicate && matches.map(item => item.id).join(",") === duplicates.map(item => item.id).join(",");
      if (matches.length && !acknowledged) { setDuplicates(matches); setAllowDuplicate(false); return; }
      const payload = branchPayload(form, currentRow);
      if (currentRow?.id && !currentRow.updatedAt) {
        const fresh = latest.find(item => item.id === currentRow.id);
        if (!sameBranchData(fresh, currentRow)) throw new Error("Chi nhánh đã thay đổi. Đóng biểu mẫu và tải lại danh sách để kiểm tra.");
        payload.expectedUpdatedAt = fresh.updatedAt;
      }
      if (!sameBranchData(payload, currentRow)) {
        const result = await adminRequest(currentRow?.id ? `catalog/branches/${currentRow.id}` : "catalog/branches", adminJson(currentRow?.id ? "PUT" : "POST", payload));
        // Retain the created ID immediately so retrying an image save cannot create another branch.
        savedRow = { ...currentRow, ...payload, id: currentRow?.id || result.id, updatedAt: undefined, brand: brands.find(brand => Number(brand.id) === payload.brandId)?.name,
          status: payload.isActive ? "ACTIVE" : "TEMPORARILY_CLOSED", images: currentRow?.images || {} };
        setCurrentRow(savedRow); coreSaved = true;
        historyFailed = !recordBranchHistory(savedRow.id, currentRow || null, savedRow, actor);
        const refreshed = await adminRequest("catalog/branches");
        const fresh = refreshed.find(item => item.id === savedRow.id);
        if (!fresh) throw new Error("Không tải lại được chi nhánh vừa lưu.");
        savedRow = { ...savedRow, ...fresh };
        setCurrentRow(savedRow);
      }
      const media = await adminRequest(`submissions/branch-media/${savedRow.id}`, adminJson("PUT", { status: form.status, images: form.images, version: savedRow.mediaVersion }));
      const complete = { ...savedRow, status: media.status, images: media.images, mediaVersion: media.version };
      if (savedRow.status !== complete.status || JSON.stringify(savedRow.images || {}) !== JSON.stringify(complete.images || {}))
        historyFailed = !recordBranchHistory(complete.id, savedRow, complete, actor) || historyFailed;
      await onSaved(historyFailed ? "Đã lưu chi nhánh. Trình duyệt chưa lưu được lịch sử chỉnh sửa." : "Đã lưu chi nhánh.");
      onClose();
    } catch (error) {
      setError(`${coreSaved ? "Thông tin chi nhánh đã lưu. Hãy thử lưu lại để hoàn tất ảnh và trạng thái. " : ""}${error.message}`);
      if (savedRow?.id) setHistory(readBranchHistory(savedRow.id));
    } finally { setSaving(false); }
  };

  return <dialog ref={dialogRef} className="branch-editor" aria-labelledby="branch-editor-title" onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}>
    <form onSubmit={submit} noValidate>
      <header><h2 id="branch-editor-title">{readOnly ? "Thông tin chi nhánh" : currentRow?.id ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh"}</h2><button type="button" autoFocus disabled={saving} onClick={onClose}>Đóng</button></header>
      {notice && <p role="status">{notice}</p>}
      <fieldset disabled={readOnly || saving}>
        <div className="branch-editor__grid">
          <label>Thương hiệu *<select name="brandId" value={form.brandId} onChange={event => change("brandId", event.target.value)} aria-invalid={Boolean(errors.brandId)}><option value="">Chọn thương hiệu</option>{brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select>{errors.brandId && <small>{errors.brandId}</small>}</label>
          <label>Trạng thái<select name="status" value={form.status} onChange={event => change("status", event.target.value)}>{Object.entries(branchStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          {branchFields.map(([name, label, maxLength]) => {
            const Field = name === "openingHours" ? "textarea" : "input";
            return <label key={name}>{label} *<Field name={name} type={name === "phone" ? "tel" : ["latitude", "longitude"].includes(name) ? "number" : "text"} step="any" rows={name === "openingHours" ? 3 : undefined} maxLength={maxLength} value={form[name]} onChange={event => change(name, event.target.value)} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} />{errors[name] && <small id={`${name}-error`}>{errors[name]}</small>}</label>;
          })}
        </div>
      </fieldset>
      <section><h3>Vị trí trên bản đồ</h3>{!readOnly && <p>Nhấn trên bản đồ hoặc kéo ghim để chọn tọa độ.</p>}
        <MapContainer center={position || [10.7769, 106.7009]} zoom={position ? 16 : 12} className="branch-editor__map"><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' /><PositionPicker position={position} disabled={readOnly || saving} onPick={point => { change("latitude", point[0].toFixed(6)); change("longitude", point[1].toFixed(6)); }} /></MapContainer>
        {position && <a href={`https://www.google.com/maps/dir/?api=1&destination=${position.join(",")}`} target="_blank" rel="noopener noreferrer">Thử chỉ đường đến chi nhánh</a>}
      </section>
      <fieldset disabled={readOnly || saving}><legend>Hình ảnh chi nhánh</legend><div className="branch-editor__images">
        {imageFields.map(name => {
          const branchImage = form.images[name];
          const imageKind = { logoUrl: "logo", coverUrl: "cover", menuImageUrl: "menu" }[name];
          const brandImage = !branchImage && selectedBrand
            ? getBrandFallbackImage(selectedBrand.name, imageKind)
            : "";
          return <div key={name}><h4>{imageText("vi", name)}</h4>{readOnly ? (branchImage
            ? <img src={branchImage} alt={imageText("vi", name)} />
            : brandImage ? <><img src={brandImage} alt={`${imageText("vi", name)} thương hiệu`} /><p>Ảnh thương hiệu</p></> : <p>Chưa cung cấp</p>) : <>
          {!branchImage && brandImage && <><img src={brandImage} alt={`${imageText("vi", name)} thương hiệu`} /><p>Ảnh thương hiệu (chỉ hiển thị thay thế)</p></>}
          {branchImage && !branchImage.startsWith("data:") && <img src={branchImage} alt={imageText("vi", name)} />}
          <SuggestionImageField name={name} value={form.images[name]} language="vi" invalid={Boolean(errors[name])}
            onChange={value => { change("images", { ...form.images, [name]: value }); setErrors(previous => ({ ...previous, [name]: undefined })); }}
            onError={code => setErrors(previous => ({ ...previous, [name]: imageText("vi", code) }))}
            onReadingChange={reading => setReadingImages(previous => ({ ...previous, [name]: reading }))} />{errors[name] && <small>{errors[name]}</small>}
        </>}</div>;
        })}
      </div></fieldset>
      {!readOnly && <label>Tên người chỉnh sửa trong lịch sử trình duyệt<input maxLength={100} value={actor} onChange={event => setActor(event.target.value)} placeholder="Quản trị viên" disabled={saving} /></label>}
      {duplicates.length > 0 && <section className="branch-editor__duplicates"><h3>Chi nhánh có thể trùng</h3><p>Cùng thương hiệu, trùng địa chỉ hoặc cách nhau tối đa 50 m.</p><ul>{duplicates.map(item => <li key={item.id}>#{item.id} · {item.name} · {item.address}</li>)}</ul><label><input type="checkbox" checked={allowDuplicate} onChange={event => setAllowDuplicate(event.target.checked)} /> Tôi đã đối chiếu và xác nhận đây là chi nhánh riêng.</label></section>}
      {error && <p role="alert" className="branch-editor__error">{error}</p>}
      {!readOnly && <footer><button type="submit" disabled={saving || imagePending}>{saving ? "Đang lưu…" : "Lưu chi nhánh"}</button></footer>}
      <section className="branch-editor__history"><h3>Lịch sử trên trình duyệt này</h3><p>Lưu tối đa 30 lần chỉnh sửa mỗi chi nhánh. Xóa dữ liệu trình duyệt sẽ xóa lịch sử này.</p>
        {!history.length && <p>Chưa có lịch sử chỉnh sửa trên trình duyệt này.</p>}
        {history.map(entry => <article key={entry.id}><strong>{entry.before ? "Cập nhật chi nhánh" : "Tạo chi nhánh"}</strong><p>{new Date(entry.changedAt).toLocaleString("vi-VN")} · {entry.actor}</p>
          {entry.before && <dl>{[...branchFields, ["brandId", "Thương hiệu"], ["status", "Trạng thái"]].filter(([name]) => JSON.stringify(entry.before[name]) !== JSON.stringify(entry.after[name])).map(([name, label]) => <div key={name}><dt>{label}</dt><dd>{historyValue(name, entry.before)} → {historyValue(name, entry.after)}</dd></div>)}{JSON.stringify(entry.before.images) !== JSON.stringify(entry.after.images) && <div><dt>Hình ảnh</dt><dd>Đã cập nhật</dd></div>}</dl>}
          {!readOnly && entry.before && <button type="button" disabled={saving || imagePending} onClick={() => { setForm(branchForm(entry.before)); setErrors({}); setDuplicates([]); setAllowDuplicate(false); setNotice("Đã nạp phiên bản trước. Kiểm tra và nhấn Lưu chi nhánh để khôi phục."); }}>Nạp phiên bản trước</button>}
        </article>)}
      </section>
    </form>
  </dialog>;
}
