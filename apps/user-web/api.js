const BRAND_COLORS = ["#273B2E", "#1F6B45", "#8A3E2F", "#594230", "#354A36", "#3C536B"];

export async function getUserApi(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { Accept: "application/json", ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || payload.error || `API ${response.status}`);
  return payload;
}

// KOI Thé and Starbucks descriptions in the current catalog have been entered in Vietnamese.
// Prefer that known source language while older API/database rows may still carry "en".
export function brandDescriptionLanguage(brand) {
  const name = `${brand?.name || ""} ${brand?.brand || ""}`.toLocaleLowerCase();
  if (name.includes("koi") || name.includes("starbucks")) return "vi";
  return (brand?.descriptionLanguageCode || "vi").toLowerCase();
}

export function toBrandCard(brand) {
  const name = brand.name || "";
  const initials = name.trim().split(/\s+/).slice(0, 3).map(word => word[0]).join("").toUpperCase();
  const colorIndex = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % BRAND_COLORS.length;
  return {
    ...brand,
    descriptionLanguageCode: brandDescriptionLanguage(brand),
    type: brand.type || "",
    branchCount: Number(brand.branchCount ?? brand.branches ?? 0),
    branches: Number(brand.branchCount ?? brand.branches ?? 0),
    logo: brand.logo || "",
    cover: brand.logo || "",
    audio: brand.audio || "",
    mark: [initials || name],
    badge: BRAND_COLORS[colorIndex],
  };
}
