import React, { useEffect, useRef, useState } from "react";
import "./SubmissionDetails.css";

export function readSubmissionData(value) {
  try {
    const data = typeof value === "string" ? JSON.parse(value) : value;
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch { return {}; }
}

function safeUrl(value) {
  if (typeof value !== "string" || !/^https?:\/\//i.test(value.trim())) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

function displayValue(value) {
  if (value == null || value === "") return "Chưa cung cấp";
  return typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
}

function DetailRows({ rows }) {
  return <dl className="submission-details__fields">
    {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{displayValue(value)}</dd></div>)}
  </dl>;
}

function ImagePreview({ label, value }) {
  const [failed, setFailed] = useState(false);
  const url = safeUrl(value);
  return <figure>
    <figcaption>{label}</figcaption>
    {url ? <>
      {!failed && <a href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt={label} referrerPolicy="no-referrer" onError={() => setFailed(true)} /></a>}
      {failed && <p>Không tải được ảnh.</p>}
      <a href={url} target="_blank" rel="noopener noreferrer">Mở ảnh gốc</a>
    </> : <p>{displayValue(value)}</p>}
  </figure>;
}

export default function SubmissionDetails({ item, onClose, onApprove, onReject, onReview, busy = false, error = "" }) {
  const dialogRef = useRef(null);
  const data = readSubmissionData(item.dataJson);
  const website = safeUrl(data.websiteUrl || data.website);
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

  return <dialog ref={dialogRef} className="submission-details" aria-labelledby="submission-details-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="submission-details__content">
      <header>
        <div><h2 id="submission-details-title">Chi tiết đề xuất #{item.id}</h2><p>{item.status} · {item.date}</p></div>
        <button type="button" onClick={onClose} autoFocus aria-label="Đóng chi tiết đề xuất">Đóng</button>
      </header>
      <section>
        <h3>Người gửi</h3>
        <DetailRows rows={[["Họ và tên", data.contactName || data.name || item.sender || item.author], ["Điện thoại liên hệ", data.phone]]} />
      </section>
      <section>
        <h3>Thương hiệu</h3>
        <DetailRows rows={[["Tên thương hiệu", data.brandName || item.title || item.name], ["Loại đề xuất", item.type], ["Loại hình", data.type], ["Mô tả", data.description]]} />
        <dl className="submission-details__fields"><div><dt>Website</dt><dd>{website ? <a href={website} target="_blank" rel="noopener noreferrer">{website}</a> : displayValue(data.websiteUrl || data.website)}</dd></div></dl>
      </section>
      <section>
        <h3>Chi nhánh</h3>
        <DetailRows rows={[["Tên chi nhánh", data.branchName], ["Địa chỉ", data.address || item.address], ["Điện thoại chi nhánh", data.branchPhone], ["Vĩ độ", data.latitude], ["Kinh độ", data.longitude], ["Giờ mở cửa", data.openingHours]]} />
      </section>
      <section>
        <h3>Hình ảnh</h3>
        <div className="submission-details__images">
          <ImagePreview label="Logo" value={data.logoUrl} />
          <ImagePreview label="Ảnh bìa" value={data.coverUrl} />
          <ImagePreview label="Thực đơn" value={data.menuImageUrl} />
        </div>
      </section>
      <section><h3>Ghi chú</h3><p className="submission-details__note">{displayValue(data.note)}</p></section>
      {error && <p className="submission-details__error" role="alert">{error}</p>}
      {(onApprove || onReject || onReview) && <footer>
        {onReject && <button type="button" disabled={busy} onClick={onReject}>Từ chối</button>}
        {onApprove && <button type="button" className="submission-details__approve" disabled={busy} onClick={onApprove}>{busy ? "Đang xử lý…" : "Phê duyệt"}</button>}
        {onReview && <button type="button" className="submission-details__approve" onClick={onReview}>Mở trang duyệt</button>}
      </footer>}
    </div>
  </dialog>;
}
