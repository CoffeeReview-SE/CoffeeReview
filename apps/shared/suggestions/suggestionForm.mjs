import { imageDataError, imageFields, imageText } from "./suggestionImages.mjs";

export const suggestionFields = [
  { name: "name", maxLength: 160 },
  { name: "phone", type: "tel", maxLength: 30 },
  { name: "brandName", maxLength: 160 },
  { name: "type", maxLength: 80, brandOnly: true },
  { name: "description", multiline: true, maxLength: 10000, brandOnly: true },
  { name: "websiteUrl", type: "url", maxLength: 2000, brandOnly: true },
  { name: "logoUrl", type: "url", maxLength: 2000, brandOnly: true, optionalForExisting: true },
  { name: "coverUrl", type: "url", maxLength: 2000, brandOnly: true, optionalForExisting: true },
  { name: "menuImageUrl", type: "url", maxLength: 2000, brandOnly: true, optionalForExisting: true },
  { name: "branchName", maxLength: 180 },
  { name: "address", maxLength: 2000 },
  { name: "branchPhone", type: "tel", maxLength: 30 },
  { name: "latitude", type: "number", min: -90, max: 90 },
  { name: "longitude", type: "number", min: -180, max: 180 },
  { name: "openingHours", maxLength: 1000 },
];

export const emptySuggestion = Object.fromEntries([...suggestionFields.map(field => [field.name, ""]), ["note", ""]]);

export function getBrandSuggestionValues(brand) {
  if (!brand) return {};
  return {
    brandName: brand.name || "",
    branchName: brand.branchName || brand.branch || brand.name || "",
    type: brand.type || "",
    description: brand.description || "",
    websiteUrl: brand.websiteUrl || brand.website || "",
    logoUrl: brand.logoUrl || brand.logo || "",
    coverUrl: brand.coverUrl || "",
    menuImageUrl: brand.menuImageUrl || "",
  };
}

export function isExistingBrandFieldReadOnly(field, brand) {
  if (!brand || (!field.brandOnly && field.name !== "brandName" && field.name !== "branchName")) return false;
  const value = getBrandSuggestionValues(brand)[field.name];
  return typeof value === "string" && value.trim() !== "";
}

const labels = {
  vi: ["Họ và tên", "Số điện thoại liên hệ", "Thương hiệu muốn đề xuất", "Loại hình (ví dụ Cà phê, Trà, Bánh)", "Mô tả thương hiệu", "Website thương hiệu", "Đường dẫn ảnh logo", "Đường dẫn ảnh bìa", "Đường dẫn ảnh thực đơn", "Tên chi nhánh", "Địa chỉ chi nhánh đầy đủ", "Số điện thoại chi nhánh", "Vĩ độ", "Kinh độ", "Giờ mở cửa (ví dụ Thứ 2–Chủ nhật, 07:00–22:00)"],
  en: ["Full name", "Contact phone", "Brand to suggest", "Category (e.g. Coffee, Tea, Pastries)", "Brand description", "Brand website", "Logo image URL", "Cover image URL", "Menu image URL", "Branch name", "Full branch address", "Branch phone", "Latitude", "Longitude", "Opening hours (e.g. Mon–Sun, 07:00–22:00)"],
  ja: ["氏名", "連絡先電話番号", "提案するブランド", "カテゴリ（コーヒー、お茶、パンなど）", "ブランドの紹介", "ブランドのウェブサイト", "ロゴ画像のURL", "カバー画像のURL", "メニュー画像のURL", "店舗名", "店舗の住所", "店舗の電話番号", "緯度", "経度", "営業時間（例 月〜日 07:00〜22:00）"],
  zh: ["姓名", "联系电话", "推荐品牌", "类别（例如咖啡、茶、糕点）", "品牌介绍", "品牌网站", "标志图片链接", "封面图片链接", "菜单图片链接", "分店名称", "分店完整地址", "分店电话", "纬度", "经度", "营业时间（例如周一至周日 07:00–22:00）"],
};

const messages = {
  vi: { required: "Vui lòng điền thông tin này.", invalid: "Thông tin không hợp lệ.", tooLong: "Thông tin vượt quá độ dài cho phép.", url: "Nhập đường dẫn đầy đủ bắt đầu bằng http:// hoặc https://.", phone: "Nhập số điện thoại hợp lệ gồm 8–15 chữ số.", coordinates: "Nhập tọa độ trong phạm vi cho phép.", newBrand: "Thương hiệu mới cần đầy đủ thông tin thương hiệu và ít nhất một chi nhánh. Các trường có dấu * là bắt buộc.", existingBrand: "Thương hiệu đã có trong danh mục. Vui lòng cung cấp đầy đủ thông tin chi nhánh đề xuất.", catalogError: "Chưa tải được danh mục thương hiệu. Bạn có thể điền đầy đủ thông tin để gửi đề xuất.", incomplete: "Vui lòng kiểm tra các trường được đánh dấu trước khi gửi." },
  en: { required: "Please fill in this field.", invalid: "Invalid value.", tooLong: "This value is too long.", url: "Enter a full http:// or https:// URL.", phone: "Enter a valid phone number with 8–15 digits.", coordinates: "Enter coordinates within the allowed range.", newBrand: "A new brand requires complete brand details and at least one branch. Fields marked * are required.", existingBrand: "This brand is in the catalog. Provide complete details for the suggested branch.", catalogError: "Could not load the brand catalog. You can still submit by providing complete details.", incomplete: "Check the marked fields before submitting." },
  ja: { required: "この項目を入力してください。", invalid: "入力内容が無効です。", tooLong: "文字数が上限を超えています。", url: "http:// または https:// で始まるURLを入力してください。", phone: "8〜15桁の電話番号を入力してください。", coordinates: "有効範囲内の座標を入力してください。", newBrand: "新しいブランドにはブランド情報と少なくとも1店舗の情報が必要です。* は必須です。", existingBrand: "登録済みのブランドです。提案する店舗の情報をすべて入力してください。", catalogError: "ブランド一覧を読み込めません。ページを再読み込みしてください。", incomplete: "送信前にマークされた項目を確認してください。" },
  zh: { required: "请填写此项。", invalid: "信息无效。", tooLong: "内容超过长度限制。", url: "请输入以 http:// 或 https:// 开头的完整链接。", phone: "请输入包含8至15位数字的有效电话号码。", coordinates: "请输入有效范围内的坐标。", newBrand: "新品牌需要完整品牌资料和至少一家分店的信息。标有 * 的项目为必填。", existingBrand: "此品牌已在目录中。请填写推荐分店的完整信息。", catalogError: "无法加载品牌目录，请刷新页面后继续。", incomplete: "提交前请检查标记的字段。" },
};

export function suggestionText(language, key) {
  if (imageText(language, key)) return imageText(language, key);
  const index = suggestionFields.findIndex(field => field.name === key);
  return index >= 0 ? (labels[language] || labels.vi)[index] : (messages[language] || messages.vi)[key] || messages.vi.invalid;
}

export function validateSuggestion(data, isNewBrand) {
  const errors = {};
  for (const field of suggestionFields) {
    const value = String(data[field.name] ?? "").trim();
    if (!isNewBrand && field.brandOnly && !value) continue;
    if (!value) errors[field.name] = "required";
    else if (imageFields.includes(field.name) && value.startsWith("data:")) {
      const error = imageDataError(value);
      if (error) errors[field.name] = error;
    }
    else if (field.maxLength && value.length > field.maxLength) errors[field.name] = "tooLong";
    else if (field.type === "url") {
      try {
        const url = new URL(value);
        if (!/^https?:\/\//i.test(value) || !["http:", "https:"].includes(url.protocol) || !url.hostname || /\s/.test(value)) errors[field.name] = "url";
      } catch { errors[field.name] = "url"; }
    } else if (field.type === "tel" && (!/^\+?[0-9 ()\-.]+$/.test(value) || !/^[0-9]{8,15}$/.test(value.replace(/\D/g, "")))) errors[field.name] = "phone";
    else if (field.type === "number" && (!Number.isFinite(Number(value)) || Number(value) < field.min || Number(value) > field.max)) errors[field.name] = "coordinates";
  }
  if (String(data.note || "").trim().length > 2000) errors.note = "tooLong";
  return errors;
}
