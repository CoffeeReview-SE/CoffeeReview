const labels = {
  vi: {
    quickInfo: "Thông tin nhanh", branchesAt: "{count} chi nhánh tại TP.HCM", website: "Website", hotline: "Hotline", category: "Loại hình: {type}",
    featured: "Chi nhánh nổi bật", noFeatured: "Chưa có chi nhánh nổi bật.", noAddress: "Chưa cập nhật địa chỉ", branchDetails: "Xem chi tiết",
    menu: "Hình ảnh thực đơn", viewAll: "Xem tất cả", zoomMenu: "Phóng to hình thực đơn {number}", menuImage: "Hình thực đơn {number}", zoom: "Phóng to", close: "Đóng", previous: "Ảnh trước", next: "Ảnh sau",
    backendFallback: "Backend chưa kết nối; đang hiển thị thông tin thương hiệu mẫu.", back: "Quay lại", loading: "Đang tải thương hiệu…", translating: "Đang dịch mô tả…", translationFailed: "Chưa dịch được, đang hiển thị mô tả gốc.", noSampleDescription: "Mô tả chưa có trong dữ liệu mẫu.", loadingBrand: "Thông tin thương hiệu sẽ được tải từ hệ thống.",
    noAudio: "Chưa có nội dung audio.", stopReading: "Dừng đọc", readDescription: "Đọc mô tả", readIn: "Đọc mô tả · {language}", unsupportedSpeech: "Trình duyệt chưa hỗ trợ đọc mô tả.", speechError: "Trình duyệt chưa đọc được mô tả bằng ngôn ngữ này."
  },
  en: {
    quickInfo: "Quick info", branchesAt: "{count} branches in Ho Chi Minh City", website: "Website", hotline: "Phone", category: "Category: {type}",
    featured: "Featured branches", noFeatured: "No featured branches yet.", noAddress: "Address not available", branchDetails: "View details",
    menu: "Menu images", viewAll: "View all", zoomMenu: "Enlarge menu image {number}", menuImage: "Menu image {number}", zoom: "Enlarge", close: "Close", previous: "Previous image", next: "Next image",
    backendFallback: "Backend is unavailable; showing sample brand information.", back: "Back", loading: "Loading brand…", translating: "Translating description…", translationFailed: "Could not translate; showing the original description.", noSampleDescription: "No description is available in the sample data.", loadingBrand: "Brand information will load from the system.",
    noAudio: "No audio content is available.", stopReading: "Stop reading", readDescription: "Read description", readIn: "Read description · {language}", unsupportedSpeech: "This browser does not support speech playback.", speechError: "This browser could not read the description in this language."
  },
  ja: {
    quickInfo: "基本情報", branchesAt: "ホーチミン市内の店舗 {count} 店", website: "ウェブサイト", hotline: "電話番号", category: "カテゴリ：{type}",
    featured: "おすすめ店舗", noFeatured: "おすすめ店舗はまだありません。", noAddress: "住所情報がありません", branchDetails: "詳細を見る",
    menu: "メニュー画像", viewAll: "すべて表示", zoomMenu: "メニュー画像 {number} を拡大", menuImage: "メニュー画像 {number}", zoom: "拡大", close: "閉じる", previous: "前の画像", next: "次の画像",
    backendFallback: "バックエンドに接続できません。サンプルのブランド情報を表示しています。", back: "戻る", loading: "ブランドを読み込み中…", translating: "説明を翻訳中…", translationFailed: "翻訳できませんでした。原文を表示しています。", noSampleDescription: "サンプルデータに説明はありません。", loadingBrand: "ブランド情報をシステムから読み込みます。",
    noAudio: "音声コンテンツはありません。", stopReading: "読み上げを停止", readDescription: "説明を読み上げる", readIn: "読み上げ · {language}", unsupportedSpeech: "このブラウザーは音声読み上げに対応していません。", speechError: "この言語で説明を読み上げできませんでした。"
  },
  zh: {
    quickInfo: "基本信息", branchesAt: "胡志明市 {count} 家分店", website: "网站", hotline: "电话", category: "类别：{type}",
    featured: "精选分店", noFeatured: "暂无精选分店。", noAddress: "暂无地址", branchDetails: "查看详情",
    menu: "菜单图片", viewAll: "查看全部", zoomMenu: "放大菜单图片 {number}", menuImage: "菜单图片 {number}", zoom: "放大", close: "关闭", previous: "上一张", next: "下一张",
    backendFallback: "无法连接后端，正在显示品牌示例信息。", back: "返回", loading: "正在加载品牌…", translating: "正在翻译介绍…", translationFailed: "翻译失败，正在显示原文。", noSampleDescription: "示例数据中没有品牌介绍。", loadingBrand: "品牌信息将从系统加载。",
    noAudio: "暂无音频内容。", stopReading: "停止朗读", readDescription: "朗读介绍", readIn: "朗读介绍 · {language}", unsupportedSpeech: "此浏览器不支持语音播放。", speechError: "此浏览器无法使用此语言朗读介绍。"
  }
};

const screenLabels = {
  vi: {
    brandTitle: "Khám phá những thương hiệu cà phê đặc sắc tại Sài Gòn", brandIntro: "Từ những quán cà phê lâu đời đến những thương hiệu hiện đại, chúng tôi mang đến cho bạn hành trình vị cà phê độc đáo.", searchPlaceholder: "Tìm kiếm thương hiệu, khu vực, loại hình...", search: "Tìm kiếm", allBrands: "Tất cả thương hiệu ({count})", branchCount: "{count} chi nhánh", all: "Tất cả", teaCoffee: "Trà & Cà phê", coffeeCake: "Cà phê & Bánh", noBrands: "Không tìm thấy thương hiệu phù hợp với từ khóa \"{query}\"", viewBrand: "Xem thông tin {name}",
    suggestTitle: "Đề xuất Thương hiệu & Địa điểm", suggestIntro: "Bạn biết một quán cà phê tuyệt vời hoặc thương hiệu chưa có trên SaigonCoffee? Hãy chia sẻ ngay với chúng tôi để cùng lan tỏa văn hóa cà phê Sài Gòn!", recentBrands: "Các thương hiệu bạn đã xem / chọn trước đó", clickBrand: "Bấm vào thương hiệu bên dưới để tự động điền vào mẫu đề xuất", formTitle: "Biểu mẫu gửi đề xuất", formIntro: "Vui lòng điền thông tin chi tiết dưới đây", fullName: "Họ và tên", fullNamePlaceholder: "Nhập họ và tên của bạn", phone: "Số điện thoại", phonePlaceholder: "Nhập số điện thoại liên hệ", brandToSuggest: "Thương hiệu muốn đề xuất", brandPlaceholder: "Tên quán hoặc thương hiệu cà phê", address: "Địa chỉ chi tiết", addressPlaceholder: "Số nhà, tên đường, Quận/Huyện tại TP.HCM", notes: "Ghi chú / Mới có gì đặc biệt?", notesPlaceholder: "Chia sẻ lý do bạn thích hoặc thông tin chi tiết thêm về thương hiệu này...", submit: "Gửi đề xuất", validation: "Vui lòng điền đầy đủ Họ tên, Số điện thoại và Thương hiệu!", success: "Gửi đề xuất thành công!", thanks: "Cảm ơn {name} đã đóng góp thông tin về {brand}. Chúng tôi sẽ xác minh và cập nhật sớm nhất.", submitAnother: "Gửi đề xuất khác"
  },
  en: {
    brandTitle: "Discover distinctive coffee brands in Saigon", brandIntro: "From long-established cafés to modern brands, discover a unique coffee journey with us.", searchPlaceholder: "Search brands, areas, or categories...", search: "Search", allBrands: "All brands ({count})", branchCount: "{count} branches", all: "All", teaCoffee: "Tea & Coffee", coffeeCake: "Coffee & Pastries", noBrands: "No brands found for \"{query}\"", viewBrand: "View {name}",
    suggestTitle: "Suggest a Brand or Location", suggestIntro: "Know a great café or a brand missing from SaigonCoffee? Share it with us and help spread Saigon's coffee culture!", recentBrands: "Brands you recently viewed or selected", clickBrand: "Select a brand below to fill in the suggestion form", formTitle: "Suggestion form", formIntro: "Please provide the details below", fullName: "Full name", fullNamePlaceholder: "Enter your full name", phone: "Phone number", phonePlaceholder: "Enter a contact phone number", brandToSuggest: "Brand to suggest", brandPlaceholder: "Café or coffee brand name", address: "Full address", addressPlaceholder: "Street number, street, district in Ho Chi Minh City", notes: "Notes / What makes it special?", notesPlaceholder: "Tell us why you like it or share more details about this brand...", submit: "Submit suggestion", validation: "Please enter your name, phone number, and brand!", success: "Suggestion submitted!", thanks: "Thank you, {name}, for sharing information about {brand}. We will verify and update it soon.", submitAnother: "Submit another suggestion"
  },
  ja: {
    brandTitle: "サイゴンの個性豊かなコーヒーブランドを見つけよう", brandIntro: "老舗カフェから現代的なブランドまで、個性豊かなコーヒーの旅をご案内します。", searchPlaceholder: "ブランド、エリア、カテゴリを検索...", search: "検索", allBrands: "すべてのブランド（{count}）", branchCount: "店舗 {count} 店", all: "すべて", teaCoffee: "お茶・コーヒー", coffeeCake: "コーヒー・ペストリー", noBrands: "「{query}」に一致するブランドはありません", viewBrand: "{name}の情報を見る",
    suggestTitle: "ブランド・店舗を提案", suggestIntro: "SaigonCoffeeに掲載されていない素敵なカフェをご存じですか？ぜひ共有して、サイゴンのコーヒー文化を広めましょう！", recentBrands: "最近閲覧・選択したブランド", clickBrand: "下のブランドを選ぶと提案フォームに入力されます", formTitle: "提案フォーム", formIntro: "以下の詳細を入力してください", fullName: "氏名", fullNamePlaceholder: "氏名を入力", phone: "電話番号", phonePlaceholder: "連絡先の電話番号を入力", brandToSuggest: "提案するブランド", brandPlaceholder: "店舗またはコーヒーブランド名", address: "住所", addressPlaceholder: "ホーチミン市の番地、通り、区", notes: "メモ・おすすめポイント", notesPlaceholder: "好きな理由やブランドの詳細を入力してください...", submit: "提案を送信", validation: "氏名、電話番号、ブランドを入力してください。", success: "提案を送信しました！", thanks: "{name}さん、{brand}の情報をありがとうございます。確認後、掲載します。", submitAnother: "別の提案を送信"
  },
  zh: {
    brandTitle: "探索西贡特色咖啡品牌", brandIntro: "从历史悠久的咖啡馆到现代品牌，开启独特的咖啡之旅。", searchPlaceholder: "搜索品牌、地区或类别...", search: "搜索", allBrands: "全部品牌（{count}）", branchCount: "{count}家分店", all: "全部", teaCoffee: "茶与咖啡", coffeeCake: "咖啡与糕点", noBrands: "没有找到与“{query}”匹配的品牌", viewBrand: "查看{name}信息",
    suggestTitle: "推荐品牌与地点", suggestIntro: "发现了尚未收录在 SaigonCoffee 的好咖啡馆吗？欢迎分享，一起传播西贡咖啡文化！", recentBrands: "最近浏览或选择的品牌", clickBrand: "点击下方品牌可自动填写推荐表单", formTitle: "品牌推荐表单", formIntro: "请填写以下详细信息", fullName: "姓名", fullNamePlaceholder: "请输入姓名", phone: "电话号码", phonePlaceholder: "请输入联系电话", brandToSuggest: "推荐品牌", brandPlaceholder: "咖啡馆或品牌名称", address: "详细地址", addressPlaceholder: "胡志明市的门牌号、街道和区县", notes: "备注 / 特别之处", notesPlaceholder: "分享您喜欢它的原因或品牌的更多信息...", submit: "提交推荐", validation: "请填写姓名、电话号码和品牌名称！", success: "推荐已提交！", thanks: "感谢{name}分享关于{brand}的信息。我们会尽快核实并更新。", submitAnother: "再推荐一个"
  }
};

const categories = {
  "tra": { en: "Tea", ja: "??", zh: "?" },
  "ca phe": { en: "Coffee", ja: "????", zh: "??" },
  "banh": { en: "Pastries", ja: "?????", zh: "??" },
  "tra, ca phe": { en: "Tea, coffee", ja: "お茶、コーヒー", zh: "茶、咖啡" },
  "ca phe, tra, banh": { en: "Coffee, tea, pastries", ja: "コーヒー、お茶、ペストリー", zh: "咖啡、茶、糕点" },
  "ca phe, do uong": { en: "Coffee, beverages", ja: "コーヒー、ドリンク", zh: "咖啡、饮品" },
  "ca phe nang luong, sach": { en: "Coffee, energy drinks, books", ja: "コーヒー、エナジードリンク、本", zh: "咖啡、能量饮料、书籍" },
  "tra sua, ca phe": { en: "Milk tea, coffee", ja: "ミルクティー、コーヒー", zh: "奶茶、咖啡" },
  "ca phe specialty, banh": { en: "Specialty coffee, pastries", ja: "スペシャルティコーヒー、ペストリー", zh: "精品咖啡、糕点" },
  "ca phe specialty, banh pastry": { en: "Specialty coffee, pastries", ja: "スペシャルティコーヒー、ペストリー", zh: "精品咖啡、糕点" }
};

function normalize(value) {
  return String(value).toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll("đ", "d").trim();
}

export function detailText(languageCode, key, values = {}) {
  let value = labels[languageCode]?.[key] ?? screenLabels[languageCode]?.[key] ?? labels.vi[key] ?? screenLabels.vi[key] ?? key;
  for (const [name, replacement] of Object.entries(values)) value = value.replaceAll(`{${name}}`, String(replacement));
  return value;
}

export function screenText(languageCode, key, values = {}) {
  let value = screenLabels[languageCode]?.[key] ?? screenLabels.vi[key] ?? key;
  for (const [name, replacement] of Object.entries(values)) value = value.replaceAll(`{${name}}`, String(replacement));
  return value;
}

export function localizedCategory(value, languageCode) {
  if (!value || languageCode === "vi") return value;
  const normalized = normalize(value);
  if (categories[normalized]?.[languageCode]) return categories[normalized][languageCode];
  return String(value).split(/\s*[,;]\s*/).map(part => categories[normalize(part)]?.[languageCode] ?? part).join(", ");
}
