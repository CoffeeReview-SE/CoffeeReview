import { createContext, useContext, useState } from "react";

export const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];

const messages = {
  vi: {
    "brand.tagline": "Khám phá cà phê Sài Gòn", "a11y.mainNavigation": "Điều hướng chính", "a11y.chooseLanguage": "Chọn ngôn ngữ",
    "nav.home": "Trang chủ", "nav.brands": "Thương hiệu", "nav.map": "Bản đồ", "nav.suggestions": "Đề xuất",
    "home.title": "Khám phá những thương hiệu cà phê đặc sắc tại Sài Gòn",
    "home.intro": "Từ những quán cà phê lâu đời đến những thương hiệu hiện đại, chúng tôi mang đến cho bạn hành trình vị cà phê độc đáo.",
    "home.search": "Tìm kiếm", "home.searchPlaceholder": "Tìm kiếm thương hiệu, khu vực, loại hình...",
    "home.featured": "Thương hiệu nổi bật", "home.seeAll": "Xem tất cả", "home.viewBrand": "Xem thương hiệu {name}",
    "home.pauseAudio": "Dừng audio {name}", "home.listen": "Nghe giới thiệu {name}", "home.brandLogo": "Logo thương hiệu {name}", "home.branches": "{count} chi nhánh",
    "home.noResults": "Không tìm thấy thương hiệu phù hợp. Hãy thử từ khóa khác.",
    "map.eyebrow": "KHÁM PHÁ SÀI GÒN", "map.title": "Tìm quán cà phê trên bản đồ",
    "map.loadBrandsError": "Không tải được danh sách từ máy chủ. Vui lòng thử tải lại trang.",
    "map.measureStart": "Điểm đầu", "map.measureEnd": "Điểm đến", "map.measureDistance": "Đo khoảng cách",
    "map.measureChoosePoints": "Chọn hai điểm trên bản đồ", "map.measureNextPoint": "Chạm bản đồ để chọn điểm tiếp theo",
    "map.clear": "Xóa", "map.measureUseGps": "Từ vị trí của tôi", "map.measureFromGpsToPlace": "Đo từ vị trí của tôi đến đây",
    "map.directionsHeading": "Chỉ đường", "map.motorcycle": "Xe máy", "map.walking": "Đi bộ",
    "map.stopNavigation": "Dừng theo dõi", "map.startNavigation": "Bắt đầu di chuyển", "map.followLocation": "Bám vị trí",
    "map.navigationWaiting": "Đang lấy GPS…", "map.navigationActive": "Đang theo dõi · tự tìm lại đường khi lệch tuyến",
    "map.navigationWeakGps": "GPS chưa chính xác · tạm ngừng tìm lại đường", "map.navigationGpsError": "Không lấy được GPS. Kiểm tra quyền vị trí.",
    "map.directionsHint": "Chọn quán → Chỉ đường từ vị trí của tôi, hoặc chọn hai điểm trên bản đồ.",
    "map.routeSearching": "Đang tìm đường…", "map.calculatedRoute": "Tuyến đã tính: ", "map.estimatedMinutes": "phút (ước tính)",
    "map.routingNotConfigured": "Tính năng chỉ đường chưa được cấu hình.",
    "map.routeUnavailable": "Chưa tìm được đường. Dịch vụ có thể đang bận hoặc hết hạn mức.",
    "map.retry": "Thử lại", "map.noRoute": "Chưa có tuyến đường",
    "map.description": "Dữ liệu địa điểm mẫu để bạn trải nghiệm giao diện bản đồ và tìm kiếm.",
    "map.searchLabel": "Tìm theo tên quán hoặc địa chỉ", "map.searchPlaceholder": "Ví dụ: Quận 1, Highlands...",
    "map.locate": "Vị trí của tôi", "map.listenNearest": "Nghe audio quán gần nhất", "map.showAllBranches": "Hiện tất cả cửa hàng", "map.showNearbyBranches": "Chỉ hiện cửa hàng gần đây", "map.locating": "Đang định vị...",
    "map.controls": "Điều khiển bản đồ", "map.zoomControls": "Thu phóng bản đồ", "map.zoomIn": "Phóng to", "map.zoomOut": "Thu nhỏ",
    "map.requesting": "Đang yêu cầu quyền truy cập vị trí...", "map.unsupported": "Trình duyệt này không hỗ trợ định vị vị trí.",
    "map.locatingStatus": "Đang lấy vị trí hiện tại...", "map.located": "Đã xác định vị trí (sai số khoảng {accuracy} m).",
    "map.denied": "Bạn đã từ chối quyền truy cập vị trí. Hãy cấp quyền trong cài đặt trình duyệt rồi thử lại.",
    "map.unavailable": "Thiết bị chưa cung cấp được vị trí. Hãy bật GPS/Wi-Fi rồi thử lại.",
    "map.timeout": "Đã hết thời gian chờ lấy vị trí. Hãy thử lại ở nơi có tín hiệu tốt hơn.",
    "map.count": "{count} địa điểm", "map.results": "Địa điểm tìm thấy", "map.empty": "Không tìm thấy địa điểm phù hợp.",
    "map.current": "Vị trí của tôi", "map.userCurrent": "Vị trí hiện tại của bạn",
    "map.directions": "Chỉ đường", "map.directionsGoogle": "Chỉ đường trên Google Maps", "map.directionsInApp": "Chỉ đường trong ứng dụng", "map.routeFromMyLocation": "Chỉ đường từ vị trí của tôi",
    "map.translatingDescription": "Đang dịch mô tả...", "map.descriptionTranslationUnavailable": "Không thể dịch lúc này.",
    "map.translatingAddress": "Đang dịch địa chỉ...", "map.addressTranslationUnavailable": "Không thể dịch địa chỉ lúc này.",
    "map.radiusLabel": "Bán kính tìm kiếm", "map.applyRadius": "Áp dụng",
    "map.radiusErrorTitle": "Bán kính không hợp lệ", "map.dismiss": "Đóng",
    "map.invalidRadius": "Bán kính không hợp lệ. Hệ thống đã đặt lại mặc định {radius} km.", "map.appliedRadius": "Đã áp dụng bán kính {radius} km.", "map.tapToPlay": "Bấm loa để nghe audio quán gần bạn.",
    "map.totalBranches": "Tổng số chi nhánh đang có", "map.allLocations": "Tất cả địa điểm", "map.allBranches": "Tất cả chi nhánh ({count})",
    "map.nearbyBranches": "Chi nhánh trong bán kính {radius} km · gần đến xa ({count})", "map.branch": "Chi nhánh", "map.distance": "Khoảng cách",
    "map.waitingGps": "Đang chờ vị trí GPS.", "map.noBranchesWithinRadius": "Không có chi nhánh phù hợp trong bán kính {radius} km.", "map.autoPlayAudio": "Tự phát audio",
    "map.unverified": "Vị trí trên bản đồ chưa được xác minh", "map.tilesLoading": "Đang tải bản đồ…",
    "map.tilesError": "Một số ô bản đồ không tải được.", "map.tilesRetry": "Thử tải lại",
    "map.note": "Địa điểm hiện là dữ liệu mẫu trong frontend; chưa kết nối backend hoặc database."
  },
  en: {
    "brand.tagline": "Explore Saigon coffee", "a11y.mainNavigation": "Main navigation", "a11y.chooseLanguage": "Choose language",
    "nav.home": "Home", "nav.brands": "Brands", "nav.map": "Map", "nav.suggestions": "Suggestions",
    "home.title": "Discover distinctive coffee brands in Saigon",
    "home.intro": "From long-established cafés to modern brands, discover a unique coffee journey with us.",
    "home.search": "Search", "home.searchPlaceholder": "Search brands, areas, or categories...",
    "home.featured": "Featured brands", "home.seeAll": "View all", "home.viewBrand": "View {name}",
    "home.pauseAudio": "Stop audio for {name}", "home.listen": "Listen to {name}'s introduction", "home.brandLogo": "{name} brand logo", "home.branches": "{count} branches",
    "home.noResults": "No matching brands found. Try another search.",
    "map.eyebrow": "EXPLORE SAIGON", "map.title": "Find cafés on the map",
    "map.loadBrandsError": "Could not load the list from the server. Please refresh the page.",
    "map.measureStart": "Start", "map.measureEnd": "Destination", "map.measureDistance": "Measure distance",
    "map.measureChoosePoints": "Choose two points on the map", "map.measureNextPoint": "Tap the map to choose the next point",
    "map.clear": "Clear", "map.measureUseGps": "From my location", "map.measureFromGpsToPlace": "Measure from my location to here",
    "map.directionsHeading": "Directions", "map.motorcycle": "Motorcycle", "map.walking": "Walking",
    "map.stopNavigation": "Stop navigation", "map.startNavigation": "Start navigation", "map.followLocation": "Follow location",
    "map.navigationWaiting": "Getting GPS…", "map.navigationActive": "Tracking · automatic rerouting",
    "map.navigationWeakGps": "Weak GPS · rerouting paused", "map.navigationGpsError": "GPS unavailable. Check location permission.",
    "map.directionsHint": "Select a store for directions, or pick two points on the map.",
    "map.routeSearching": "Finding route…", "map.calculatedRoute": "Calculated route: ", "map.estimatedMinutes": "min (estimated)",
    "map.routingNotConfigured": "Routing is not configured yet.",
    "map.routeUnavailable": "Route unavailable. The service may be busy or out of quota.",
    "map.retry": "Retry", "map.noRoute": "No route yet",
    "map.description": "Sample locations let you explore the map and search interface.",
    "map.searchLabel": "Search by café name or address", "map.searchPlaceholder": "For example: District 1, Highlands...",
    "map.locate": "My location", "map.listenNearest": "Play nearest café audio", "map.showAllBranches": "Show all stores", "map.showNearbyBranches": "Show nearby stores", "map.locating": "Locating...", "map.requesting": "Requesting location access...",
    "map.controls": "Map controls", "map.zoomControls": "Map zoom", "map.zoomIn": "Zoom in", "map.zoomOut": "Zoom out",
    "map.unsupported": "This browser does not support geolocation.", "map.locatingStatus": "Getting your current location...",
    "map.located": "Location found (accuracy about {accuracy} m).", "map.denied": "Location access was denied. Allow it in your browser settings and try again.",
    "map.unavailable": "Your device could not provide a location. Turn on GPS or Wi-Fi and try again.",
    "map.timeout": "Location request timed out. Try again where the signal is stronger.",
    "map.count": "{count} locations", "map.results": "Locations found", "map.empty": "No matching locations found.",
    "map.current": "My location", "map.userCurrent": "Your current location",
    "map.directions": "Get directions", "map.directionsGoogle": "Directions on Google Maps", "map.directionsInApp": "Directions in app", "map.routeFromMyLocation": "Route from my location",
    "map.translatingDescription": "Translating description...", "map.descriptionTranslationUnavailable": "Translation is unavailable right now.",
    "map.translatingAddress": "Translating address...", "map.addressTranslationUnavailable": "Address translation is unavailable right now.",
    "map.radiusLabel": "Search radius", "map.applyRadius": "Apply",
    "map.radiusErrorTitle": "Invalid search radius", "map.dismiss": "Close",
    "map.invalidRadius": "Invalid radius. The system reset it to the default {radius} km.", "map.appliedRadius": "Search radius set to {radius} km.", "map.tapToPlay": "Tap the speaker to play nearby café audio.",
    "map.totalBranches": "Total branches available", "map.allLocations": "All locations", "map.allBranches": "All branches ({count})",
    "map.nearbyBranches": "Branches within {radius} km · nearest first ({count})", "map.branch": "Branch", "map.distance": "Distance",
    "map.waitingGps": "Waiting for GPS location.", "map.noBranchesWithinRadius": "No matching branches within {radius} km.", "map.autoPlayAudio": "Auto-playing audio",
    "map.unverified": "This location has not been verified on the map", "map.tilesLoading": "Loading map…",
    "map.tilesError": "Some map tiles could not be loaded.", "map.tilesRetry": "Retry",
    "map.note": "Locations are currently sample frontend data and are not connected to a backend or database."
  },
  ja: {
    "brand.tagline": "サイゴンのコーヒーを探す", "a11y.mainNavigation": "メインナビゲーション", "a11y.chooseLanguage": "言語を選択",
    "nav.home": "ホーム", "nav.brands": "ブランド", "nav.map": "地図", "nav.suggestions": "おすすめ",
    "home.title": "サイゴンの個性豊かなコーヒーブランドを見つけよう",
    "home.intro": "老舗カフェから現代的なブランドまで、個性的なコーヒーの旅をご案内します。",
    "home.search": "検索", "home.searchPlaceholder": "ブランド、エリア、種類を検索...",
    "home.featured": "注目のブランド", "home.seeAll": "すべて見る", "home.viewBrand": "{name}を見る",
    "home.pauseAudio": "{name}の音声を停止", "home.listen": "{name}の紹介を聞く", "home.brandLogo": "{name}のブランドロゴ", "home.branches": "支店 {count} 店",
    "home.noResults": "該当するブランドがありません。別のキーワードをお試しください。",
    "map.eyebrow": "サイゴンを探す", "map.title": "地図でカフェを探す",
    "map.loadBrandsError": "サーバーから一覧を読み込めませんでした。ページを再読み込みしてください。",
    "map.measureStart": "出発地点", "map.measureEnd": "目的地", "map.measureDistance": "距離を測定",
    "map.measureChoosePoints": "地図上で2点を選択", "map.measureNextPoint": "地図をタップして次の地点を選択",
    "map.clear": "クリア", "map.measureUseGps": "現在地から", "map.measureFromGpsToPlace": "現在地からここまで測定",
    "map.directionsHeading": "道順", "map.motorcycle": "バイク", "map.walking": "徒歩",
    "map.stopNavigation": "ナビを停止", "map.startNavigation": "ナビを開始", "map.followLocation": "現在地を追跡",
    "map.navigationWaiting": "GPSを取得中…", "map.navigationActive": "追跡中・自動でルートを再検索",
    "map.navigationWeakGps": "GPSの精度が低いため、再検索を一時停止しています", "map.navigationGpsError": "GPSを取得できません。位置情報の権限を確認してください。",
    "map.directionsHint": "店舗を選んで現在地からの道順を表示するか、地図上で2点を選択してください。",
    "map.routeSearching": "ルートを検索中…", "map.calculatedRoute": "計算したルート：", "map.estimatedMinutes": "分（目安）",
    "map.routingNotConfigured": "ルート検索が設定されていません。",
    "map.routeUnavailable": "ルートを取得できません。サービスが混雑しているか、利用上限に達した可能性があります。",
    "map.retry": "再試行", "map.noRoute": "ルートがありません",
    "map.description": "サンプルの場所データで地図と検索機能をお試しいただけます。",
    "map.searchLabel": "店名または住所で検索", "map.searchPlaceholder": "例：1区、Highlands...",
    "map.locate": "現在地", "map.listenNearest": "最寄りのカフェの音声を再生", "map.showAllBranches": "すべての店舗を表示", "map.showNearbyBranches": "近くの店舗を表示", "map.locating": "位置を特定中...", "map.requesting": "位置情報へのアクセスを確認中...",
    "map.controls": "地図の操作", "map.zoomControls": "地図のズーム", "map.zoomIn": "拡大", "map.zoomOut": "縮小",
    "map.unsupported": "このブラウザーは位置情報に対応していません。", "map.locatingStatus": "現在地を取得中...",
    "map.located": "位置を確認しました（誤差約 {accuracy} m）。", "map.denied": "位置情報へのアクセスが拒否されました。ブラウザーの設定で許可して再試行してください。",
    "map.unavailable": "位置情報を取得できません。GPSまたはWi-Fiを有効にして再試行してください。", "map.timeout": "位置情報の取得がタイムアウトしました。電波の良い場所で再試行してください。",
    "map.count": "場所 {count} 件", "map.results": "検索結果", "map.empty": "該当する場所がありません。",
    "map.directions": "道順", "map.directionsGoogle": "Google マップで道順を表示", "map.directionsInApp": "アプリ内で道順を表示", "map.routeFromMyLocation": "現在地からルートを表示",
    "map.translatingDescription": "説明を翻訳中...", "map.descriptionTranslationUnavailable": "現在、翻訳を利用できません。",
    "map.translatingAddress": "住所を翻訳中...", "map.addressTranslationUnavailable": "現在、住所を翻訳できません。",
    "map.radiusLabel": "検索半径", "map.applyRadius": "適用",
    "map.radiusErrorTitle": "検索半径が無効です", "map.dismiss": "閉じる",
    "map.invalidRadius": "半径が無効です。既定値の {radius} km に戻しました。", "map.appliedRadius": "検索半径を {radius} km に設定しました。", "map.tapToPlay": "スピーカーをタップして近くのカフェの音声を再生します。",
    "map.totalBranches": "登録済み店舗数", "map.allLocations": "すべての場所", "map.allBranches": "すべての店舗（{count}）",
    "map.nearbyBranches": "半径 {radius} km 以内の店舗・近い順（{count}）", "map.branch": "店舗", "map.distance": "距離",
    "map.waitingGps": "GPS 位置情報を待っています。", "map.noBranchesWithinRadius": "半径 {radius} km 以内に該当する店舗はありません。", "map.autoPlayAudio": "音声を自動再生",
    "map.unverified": "地図上の位置は未確認です", "map.tilesLoading": "地図を読み込み中…",
    "map.tilesError": "一部の地図タイルを読み込めませんでした。", "map.tilesRetry": "再試行",
    "map.current": "現在地", "map.userCurrent": "あなたの現在地", "map.note": "場所はフロントエンドのサンプルデータで、バックエンドやデータベースには未接続です。"
  },
  zh: {
    "brand.tagline": "探索西贡咖啡", "a11y.mainNavigation": "主导航", "a11y.chooseLanguage": "选择语言",
    "nav.home": "首页", "nav.brands": "品牌", "nav.map": "地图", "nav.suggestions": "推荐",
    "home.title": "探索西贡特色咖啡品牌",
    "home.intro": "从历史悠久的咖啡馆到现代品牌，开启独特的咖啡之旅。",
    "home.search": "搜索", "home.searchPlaceholder": "搜索品牌、地区或类型...",
    "home.featured": "精选品牌", "home.seeAll": "查看全部", "home.viewBrand": "查看{name}",
    "home.pauseAudio": "停止{name}的音频", "home.listen": "收听{name}介绍", "home.brandLogo": "{name}品牌标志", "home.branches": "{count}家分店",
    "home.noResults": "没有找到符合条件的品牌，请尝试其他关键词。",
    "map.eyebrow": "探索西贡", "map.title": "在地图上寻找咖啡馆",
    "map.loadBrandsError": "无法从服务器加载列表，请刷新页面重试。",
    "map.measureStart": "起点", "map.measureEnd": "终点", "map.measureDistance": "测量距离",
    "map.measureChoosePoints": "在地图上选择两个点", "map.measureNextPoint": "点击地图选择下一个点",
    "map.clear": "清除", "map.measureUseGps": "从我的位置开始", "map.measureFromGpsToPlace": "测量从我的位置到此处的距离",
    "map.directionsHeading": "路线导航", "map.motorcycle": "骑摩托车", "map.walking": "步行",
    "map.stopNavigation": "停止导航", "map.startNavigation": "开始导航", "map.followLocation": "跟随当前位置",
    "map.navigationWaiting": "正在获取 GPS…", "map.navigationActive": "正在跟踪 · 自动重新规划路线",
    "map.navigationWeakGps": "GPS 信号较弱 · 暂停重新规划路线", "map.navigationGpsError": "无法获取 GPS，请检查浏览器的位置权限。",
    "map.directionsHint": "选择门店查看路线，或在地图上选择两个点。",
    "map.routeSearching": "正在查找路线…", "map.calculatedRoute": "已计算路线：", "map.estimatedMinutes": "分钟（预计）",
    "map.routingNotConfigured": "路线导航功能尚未配置。",
    "map.routeUnavailable": "暂时无法规划路线，服务可能繁忙或已达到使用限额。",
    "map.retry": "重试", "map.noRoute": "暂无路线",
    "map.description": "使用示例地点体验地图界面和搜索功能。",
    "map.searchLabel": "按店名或地址搜索", "map.searchPlaceholder": "例如：第一郡、Highlands...",
    "map.locate": "我的位置", "map.listenNearest": "播放最近咖啡店语音", "map.showAllBranches": "显示所有门店", "map.showNearbyBranches": "显示附近门店", "map.locating": "正在定位...", "map.requesting": "正在请求位置权限...",
    "map.controls": "地图控件", "map.zoomControls": "地图缩放", "map.zoomIn": "放大", "map.zoomOut": "缩小",
    "map.unsupported": "此浏览器不支持定位功能。", "map.locatingStatus": "正在获取当前位置...",
    "map.located": "已定位（误差约{accuracy}米）。", "map.denied": "您拒绝了位置访问权限。请在浏览器设置中允许后重试。",
    "map.unavailable": "设备暂时无法提供位置。请开启GPS或Wi-Fi后重试。", "map.timeout": "定位超时，请在信号较好的地方重试。",
    "map.count": "{count}个地点", "map.results": "搜索到的地点", "map.empty": "没有找到符合条件的地点。",
    "map.directions": "路线导航", "map.directionsGoogle": "在 Google 地图中导航", "map.directionsInApp": "在应用内导航", "map.routeFromMyLocation": "从我的位置导航",
    "map.translatingDescription": "正在翻译介绍...", "map.descriptionTranslationUnavailable": "暂时无法翻译。",
    "map.translatingAddress": "正在翻译地址...", "map.addressTranslationUnavailable": "暂时无法翻译地址。",
    "map.radiusLabel": "搜索半径", "map.applyRadius": "应用",
    "map.radiusErrorTitle": "搜索半径无效", "map.dismiss": "关闭",
    "map.invalidRadius": "半径无效，系统已恢复默认值 {radius} 公里。", "map.appliedRadius": "搜索半径已设为 {radius} 公里。", "map.tapToPlay": "点击扬声器播放附近咖啡店的语音。",
    "map.totalBranches": "当前分店总数", "map.allLocations": "所有地点", "map.allBranches": "所有分店（{count}）",
    "map.nearbyBranches": "{radius} 公里范围内的分店 · 由近到远（{count}）", "map.branch": "分店", "map.distance": "距离",
    "map.waitingGps": "正在等待 GPS 定位。", "map.noBranchesWithinRadius": "{radius} 公里范围内没有符合条件的分店。", "map.autoPlayAudio": "自动播放语音",
    "map.unverified": "地图上的位置尚未验证", "map.tilesLoading": "正在加载地图…",
    "map.tilesError": "部分地图图块无法加载。", "map.tilesRetry": "重试",
    "map.current": "我的位置", "map.userCurrent": "您的当前位置", "map.note": "地点目前是前端示例数据，尚未连接后端或数据库。"
  }
};

const LanguageContext = createContext(null);

function initialLanguageCode() {
  if (typeof window === "undefined") return "vi";
  try {
    const saved = window.localStorage.getItem("saigoncoffee-language");
    if (messages[saved]) return saved;
  } catch { /* Storage can be unavailable in private browsing. */ }
  const browserLanguages = [...(navigator.languages || []), navigator.language].filter(Boolean);
  for (const preference of browserLanguages) {
    const code = preference.toLowerCase().split("-")[0];
    if (messages[code]) return code;
  }
  return "vi";
}

export function LanguageProvider({ children }) {
  const [languageCode, setCurrentLanguageCode] = useState(initialLanguageCode);
  const setLanguageCode = code => {
    if (!messages[code]) return;
    setCurrentLanguageCode(code);
    try { window.localStorage.setItem("saigoncoffee-language", code); } catch { /* Keep the selection for this page session. */ }
  };
  return <LanguageContext.Provider value={{ languageCode, setLanguageCode }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  const dictionary = messages[context.languageCode] || messages.vi;
  const t = (key, values = {}) => {
    const gpsWaitingMessages = {
      vi: "\u0110\u00e3 c\u00f3 v\u1ecb tr\u00ed (sai s\u1ed1 kho\u1ea3ng {accuracy} m). \u0110ang ch\u1edd th\u00eam 3 gi\u00e2y \u0111\u1ec3 c\u1ea3i thi\u1ec7n n\u1ebfu c\u00f3.",
      en: "Location found (accuracy about {accuracy} m). Waiting 3 seconds for a better fix if available.",
      ja: "\u4f4d\u7f6e\u3092\u53d6\u5f97\u3057\u307e\u3057\u305f\uff08\u7cbe\u5ea6\u7d04 {accuracy} m\uff09\u3002\u7cbe\u5ea6\u5411\u4e0a\u306e\u305f\u3081 3 \u79d2\u9593\u5f85\u6a5f\u3057\u307e\u3059\u3002",
      zh: "\u5df2\u83b7\u53d6\u4f4d\u7f6e\uff08\u7cbe\u5ea6\u7ea6 {accuracy} \u7c73\uff09\u3002\u6b63\u5728\u7b49\u5f853\u79d2\u4ee5\u5c1d\u8bd5\u63d0\u9ad8\u7cbe\u5ea6\u3002",
    };
    let value = key === "map.waitingForBetterFix"
      ? gpsWaitingMessages[context.languageCode] || gpsWaitingMessages.en
      : dictionary[key] ?? messages.vi[key] ?? key;
    for (const [name, replacement] of Object.entries(values)) value = value.replaceAll(`{${name}}`, String(replacement));
    return value;
  };
  return { ...context, t };
}
