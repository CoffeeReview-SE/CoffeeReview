# Module và API

API công khai từ frontend đi qua Gateway và dùng prefix `/api`. Các đường dẫn bên dưới là public URL; Gateway biến đổi prefix trước khi chuyển tiếp.

## Giao diện

| Khu vực | Đường dẫn UI | Trách nhiệm |
| --- | --- | --- |
| Trang chủ | `/` | Khám phá và truy cập nội dung thương hiệu |
| Thương hiệu | `/brands`, `/brand/:id` | Danh sách và chi tiết thương hiệu |
| Đề xuất | `/suggestions` | Gửi/duyệt đề xuất thương hiệu |
| Bản đồ | `/map` | Tìm chi nhánh trên bản đồ |
| Quản trị | `/admin`, `/admin/:section` | Dashboard và quản lý dữ liệu |

## Backend

| Module | Public API qua Gateway | Admin API qua Gateway | Trạng thái mã nguồn |
| --- | --- | --- | --- |
| Catalog | `GET /api/catalog/brands`, `GET /api/catalog/brands/{id}`, `GET /api/catalog/branches` | `/api/admin/catalog/brands`, `/api/admin/catalog/branches` (GET/POST/PUT/DELETE) | Đã có service và truy vấn PostgreSQL |
| Localization | `GET /api/localization/brands/{brandId}`, `POST /api/localization/brands/{brandId}/translations/{languageCode}` | `POST /api/admin/localization/brands/{brandId}/translations/{languageCode}` | Đã có service; dịch theo yêu cầu qua provider ngoài |
| Submission | `POST /api/submissions` | `GET /api/admin/submissions`, `POST /api/admin/submissions/{id}/decision` | Đã có service và truy vấn PostgreSQL |
| Analytics | `POST /api/analytics/track`, `/heartbeat`, `/end-session`, `/audio-play` | `GET /api/admin/analytics/summary`, `/active-sessions`, `/audio-by-brand`, `/audio-by-language` | Đã có service và schema migration |
| Assistant | `GET /api/assistant/status`, `POST /api/assistant/chat` | — | Endpoint nằm trực tiếp trong Gateway; cần cấu hình Groq để chat hoạt động |
| Review | `/api/reviews/**` | `/api/admin/reviews/**` | Route được cấu hình trong Gateway, nhưng không tìm thấy service/project review tương ứng trong repository hiện tại |

Catalog public endpoints và trường dữ liệu cụ thể có thể xem tại `services/catalog/src/SGCoffee.Catalog/Catalog.cs`. Chi tiết chat và dịch thuật xem [Groq chat](../backend/groq-chat.md) và [Translation](../backend/translation.md).

## Bảo vệ API và giới hạn

- Gateway áp rate limit cho một số endpoint chat, ghi dữ liệu, tracking và dịch thuật.
- `Admin__Enabled` điều khiển việc bật các route admin ở Gateway; mặc định mẫu là `false`.
- Hiện chưa thấy luồng xác thực/đăng nhập admin đầy đủ. Không xem header `X-Admin-Request` hoặc shared key nội bộ là đăng nhập admin.
- Không đưa connection string, Groq key hoặc secret server-side vào biến `VITE_*` hay bundle frontend.
