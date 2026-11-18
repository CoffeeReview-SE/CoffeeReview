const brandImageAssets = [
  { slug: "phuc-long", aliases: ["phuclong"], logo: "jpg", menu: "jpg" },
  { slug: "highlands-coffee", aliases: ["highlands"], logo: "jpg", menu: "jpg" },
  { slug: "trung-nguyen", aliases: ["trungnguyen"], logo: "png", menu: "jpg" },
  { slug: "katinat", aliases: ["katinat"], logo: "png", menu: "jpg" },
  { slug: "koi-the", aliases: ["koithe", "koi"], logo: "jpg", menu: "jpg" },
  { slug: "phe-la", aliases: ["phela"], logo: "jpg", menu: "jpg" },
  { slug: "milano-coffee", aliases: ["milano"], logo: "png", menu: "png" },
  { slug: "viva-star-coffee", aliases: ["vivastar"], logo: "png", menu: "jpg" },
  { slug: "the-coffee-house", aliases: ["thecoffeehouse", "tch"], logo: "jpg", menu: "jpg" },
  { slug: "starbucks", aliases: ["starbucks"], logo: "png", menu: "jpg" },
];

function normalizeBrandName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("đ", "d")
    .replace(/[^a-z0-9]/g, "");
}

export function getBrandFallbackImage(brandName, imageName) {
  const name = normalizeBrandName(brandName);
  const brand = brandImageAssets.find(item => item.aliases.some(alias => name.includes(alias)));
  if (!brand || !["logo", "cover", "menu"].includes(imageName)) return "";
  const extension = imageName === "cover" ? "jpg" : brand[imageName];
  return `/image/${brand.slug}/${imageName}.${extension}`;
}
