export const branchStatuses = { ACTIVE: "Đang hoạt động", TEMPORARILY_CLOSED: "Tạm ngưng hoạt động" };
export const branchStatus = isActive => isActive ? "ACTIVE" : "TEMPORARILY_CLOSED";
export const branchFields = [["name", "Tên chi nhánh", 180], ["address", "Địa chỉ đầy đủ", 2000], ["phone", "Điện thoại", 30], ["latitude", "Vĩ độ"], ["longitude", "Kinh độ"], ["openingHours", "Giờ mở cửa", 4000]];

export function normalizeBranchText(value) {
  return String(value ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll("đ", "d").replace(/[^a-z0-9]/g, "");
}

export function hoursText(value) {
  return value == null ? "" : typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

export function branchForm(row, defaultBrandId = "") {
  row = row || {};
  return {
    brandId: String(row.brandId ?? defaultBrandId), name: row.name || "", address: row.address || "", phone: row.phone || "",
    latitude: row.latitude == null ? "" : String(row.latitude), longitude: row.longitude == null ? "" : String(row.longitude),
    openingHours: hoursText(row.openingHours), status: branchStatus(row.isActive ?? (row.status !== "TEMPORARILY_CLOSED" && row.status !== "CLOSED")),
    images: { logoUrl: row.images?.logoUrl || "", coverUrl: row.images?.coverUrl || "", menuImageUrl: row.images?.menuImageUrl || "" },
  };
}

export function validBranchPosition(row) {
  return ["latitude", "longitude"].every(key => row[key] != null && String(row[key]).trim() && Number.isFinite(Number(row[key]))) && Math.abs(Number(row.latitude)) <= 90 && Math.abs(Number(row.longitude)) <= 180;
}

export function incompleteBranch(row) {
  return !row.name?.trim() || !row.address?.trim() || !row.phone?.trim() || !validBranchPosition(row) || !hoursText(row.openingHours).trim();
}

export function validateBranch(form) {
  const errors = {};
  for (const [name, , limit] of branchFields) {
    const value = String(form[name] ?? "").trim();
    if (!value) errors[name] = "Vui lòng điền thông tin này.";
    else if (limit && value.length > limit) errors[name] = `Tối đa ${limit} ký tự.`;
  }
  if (!Number.isSafeInteger(Number(form.brandId)) || Number(form.brandId) <= 0) errors.brandId = "Vui lòng chọn thương hiệu.";
  if (form.phone && (!/^\+?[0-9 ()\-.]+$/.test(form.phone.trim()) || !/^[0-9]{8,15}$/.test(form.phone.replace(/\D/g, "")))) errors.phone = "Số điện thoại cần có 8–15 chữ số.";
  for (const [key, max] of [["latitude", 90], ["longitude", 180]])
    if (!String(form[key]).trim() || !Number.isFinite(Number(form[key])) || Math.abs(Number(form[key])) > max) errors[key] = `Nhập giá trị từ -${max} đến ${max}.`;
  if (!branchStatuses[form.status]) errors.status = "Trạng thái không hợp lệ.";
  return errors;
}

export function branchPayload(form, row) {
  let hours = form.openingHours.trim();
  if (row && hours === hoursText(row.openingHours)) hours = row.openingHours;
  else if (/^[{[]/.test(hours)) {
    try { hours = JSON.parse(hours); } catch { /* Descriptive opening hours can be entered as text. */ }
  }
  return { brandId: Number(form.brandId), name: form.name.trim(), address: form.address.trim(), phone: form.phone.trim(),
    latitude: Number(form.latitude), longitude: Number(form.longitude), openingHours: hours,
    isActive: form.status === "ACTIVE", expectedUpdatedAt: row?.updatedAt };
}

export function sameBranchData(a, b) {
  if (!a || !b) return false;
  const fields = ["brandId", "name", "address", "phone", "latitude", "longitude", "openingHours", "isActive"];
  return fields.every(key => JSON.stringify(a[key]) === JSON.stringify(b[key]));
}

export function duplicateBranches(form, rows, currentId) {
  const address = normalizeBranchText(form.address);
  return rows.filter(row => {
    if (String(row.id) === String(currentId) || Number(row.brandId) !== Number(form.brandId)) return false;
    if (address && normalizeBranchText(row.address) === address) return true;
    if (!validBranchPosition(form) || !validBranchPosition(row)) return false;
    const rad = value => value * Math.PI / 180;
    const dLat = rad(Number(row.latitude) - Number(form.latitude));
    const dLng = rad(Number(row.longitude) - Number(form.longitude));
    const distance = Math.sin(dLat / 2) ** 2 + Math.cos(rad(Number(form.latitude))) * Math.cos(rad(Number(row.latitude))) * Math.sin(dLng / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(distance), Math.sqrt(1 - distance)) <= 50;
  });
}

const historyKey = id => `sgcoffee.branch-history.v1.${id}`;
export function readBranchHistory(id) {
  try {
    const entries = JSON.parse(localStorage.getItem(historyKey(id)) || "[]");
    return Array.isArray(entries) ? entries.filter(entry => entry && typeof entry.id === "string" && entry.after && typeof entry.after === "object") : [];
  } catch { return []; }
}

export function recordBranchHistory(id, before, after, actor) {
  try {
    const entry = { id: crypto.randomUUID(), changedAt: new Date().toISOString(), actor: actor.trim() || "Quản trị viên", before, after };
    localStorage.setItem(historyKey(id), JSON.stringify([entry, ...readBranchHistory(id)].slice(0, 30)));
    localStorage.setItem("sgcoffee.branch-editor-name", entry.actor);
    return true;
  } catch { return false; }
}

export function readEditorName() {
  try { return localStorage.getItem("sgcoffee.branch-editor-name") || ""; } catch { return ""; }
}
