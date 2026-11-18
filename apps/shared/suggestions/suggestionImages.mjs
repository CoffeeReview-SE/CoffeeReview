export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const imageFields = ["logoUrl", "coverUrl", "menuImageUrl"];

function matchesImage(bytes, type) {
  if (type === "image/png") return [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  if (type === "image/jpeg") return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  return type === "image/webp" && bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
}

export function imageDataError(value) {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) return "imageType";
  if (match[2].length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4) return "imageSize";
  try {
    const bytes = Uint8Array.from(atob(match[2]), char => char.charCodeAt(0));
    if (bytes.length > MAX_IMAGE_BYTES) return "imageSize";
    return matchesImage(bytes, match[1]) ? null : "imageType";
  } catch { return "imageType"; }
}

export async function readImageFile(file) {
  if (file.size > MAX_IMAGE_BYTES) throw new Error("imageSize");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesImage(bytes, file.type)) throw new Error("imageType");
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("imageReadError"));
    reader.readAsDataURL(file);
  });
}

const messages = {
  vi: { chooseImage: "Chọn ảnh từ máy", imageOrUrl: "Hoặc nhập đường dẫn ảnh", imageHint: "JPG, PNG hoặc WebP, tối đa 2 MB mỗi ảnh.", imageSize: "Ảnh vượt quá 2 MB. Vui lòng chọn ảnh nhỏ hơn.", imageType: "Vui lòng chọn ảnh JPG, PNG hoặc WebP hợp lệ.", imageReadError: "Không đọc được ảnh. Vui lòng chọn lại.", imageReading: "Đang đọc ảnh…", removeImage: "Xóa ảnh đã chọn" },
  en: { chooseImage: "Choose an image", imageOrUrl: "Or enter an image URL", imageHint: "JPG, PNG or WebP, up to 2 MB per image.", imageSize: "This image exceeds 2 MB. Choose a smaller image.", imageType: "Choose a valid JPG, PNG or WebP image.", imageReadError: "Could not read this image. Try again.", imageReading: "Reading image…", removeImage: "Remove selected image" },
  ja: { chooseImage: "画像を選択", imageOrUrl: "または画像URLを入力", imageHint: "JPG・PNG・WebP、各画像2 MBまで。", imageSize: "2 MB以下の画像を選択してください。", imageType: "有効なJPG・PNG・WebP画像を選択してください。", imageReadError: "画像を読み込めません。再選択してください。", imageReading: "画像を読み込み中…", removeImage: "選択した画像を削除" },
  zh: { chooseImage: "从设备选择图片", imageOrUrl: "或输入图片链接", imageHint: "JPG、PNG或WebP，每张不超过2 MB。", imageSize: "图片超过2 MB，请选择较小的图片。", imageType: "请选择有效的JPG、PNG或WebP图片。", imageReadError: "无法读取图片，请重新选择。", imageReading: "正在读取图片…", removeImage: "删除所选图片" },
};

export function imageText(language, key) {
  const imageLabels = {
    vi: { logoUrl: "Ảnh logo", coverUrl: "Ảnh bìa", menuImageUrl: "Ảnh thực đơn" },
    en: { logoUrl: "Logo image", coverUrl: "Cover image", menuImageUrl: "Menu image" },
    ja: { logoUrl: "ロゴ画像", coverUrl: "カバー画像", menuImageUrl: "メニュー画像" },
    zh: { logoUrl: "标志图片", coverUrl: "封面图片", menuImageUrl: "菜单图片" },
  };
  if ((imageLabels[language] || imageLabels.vi)[key]) return (imageLabels[language] || imageLabels.vi)[key];
  return (messages[language] || messages.vi)[key];
}
