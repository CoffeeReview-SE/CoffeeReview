# Rà soát Admin Dashboard — 28/10/2026

**Cập nhật sau bước 1–2:** đã triển khai backend/tracking/Dashboard và đăng nhập Admin local. Xem `docs/Admin-Dashboard-Local.md` để cấu hình, chạy và kiểm thử; phần bên dưới lưu kết quả rà soát ban đầu. Không deploy Railway.

Đã thực hiện bước 1–2 theo phần yêu cầu bắt đầu trong tài liệu bàn giao. Dùng source đang có tại `C:\test\SGCoffee`, không giải nén. Chưa triển khai các bước 3–8 và chưa deploy Railway.

## Bước 1 — Source và schema thực tế

| Phần | File | Kết quả |
| --- | --- | --- |
| Dashboard | `apps/admin/AdminDashboard.jsx` | Đang dùng số mẫu, biểu đồ mẫu; chưa gọi Analytics API |
| Tracking | `apps/analytics/PageTracker.jsx` | Có visitor ID, sessionStorage, ghi page view; chưa heartbeat/end-session; tab được nhân bản có thể sao chép sessionStorage |
| Audio | `apps/user-web/BrandDetailPage.jsx` | AudioCard có play/pause/loop; chưa tracking, lấy nguồn đầu tiên nếu audio là object, dữ liệu demo chưa có URL audio |
| Analytics | `services/analytics/src/SGCoffee.Analytics/Program.cs` | Có `/track`, `/admin/summary`, kiểm tra gateway key và rate limit; chưa có API vòng đời phiên/audio/aggregation |
| Gateway | `services/gateway/src/SGCoffee.Gateway/Gateway.cs` | YARP đã chuyển tiếp cả nhóm analytics; summary được miễn chặn khi Admin tắt; chưa có xác thực Admin |
| Routes | `services/gateway/src/SGCoffee.Gateway/appsettings.json` | Public POST và admin route đã có wildcard; không cần thêm route trùng |
| SQL gốc | `infrastructure/Database/SGCoffeeData.sql` | Có session/page/audio/brand/branch/language; SQL gốc thiếu visitor_id nhưng DB thật đã có |
| Migration cũ | `infrastructure/Database/analytics_migration.sql` | Bổ sung visitor_id và index; đã phản ánh trong DB thật |

Đã kết nối Supabase bằng cấu hình Analytics hiện có, chỉ đọc metadata trước khi viết migration. Không in connection string, IP hoặc bản ghi người dùng.

Schema xác nhận trước migration:

- `visit_session`: session_id UUID PK; visitor_id UUID nullable; started_at và last_activity_at TIMESTAMPTZ NOT NULL; is_admin_session BOOLEAN NOT NULL; chưa có ended_at.
- `page_view`: khóa chính BIGINT identity; session_id UUID FK; page_path TEXT NOT NULL; viewed_at TIMESTAMPTZ; chưa có event_id.
- `audio_play`: khóa chính BIGINT identity; brand_id/branch_id BIGINT nullable FK; session_id UUID nullable FK; language_code VARCHAR NOT NULL FK; played_at TIMESTAMPTZ; chưa có event_id.
- `brand` và `branch` dùng khóa BIGINT; `language` dùng language_code VARCHAR. Các khóa ngoại audio đã tồn tại.
- Đã có index thời gian và page-view/session. Có hai index visitor và hai index page-view/session tương đương; giữ nguyên, không xóa trong công việc này.

## Bước 2 — Migration đã áp dụng

File: `infrastructure/Database/analytics_dashboard_migration.sql`.

- Thêm `visit_session.ended_at` TIMESTAMPTZ nullable.
- Thêm `page_view.event_id`, `audio_play.event_id` UUID nullable, unique index cho event mới; dữ liệu cũ giữ NULL.
- Thêm index phiên đang mở theo last_activity_at, audio theo brand/thời gian, language/thời gian và session.
- Có transaction, kiểm tra schema đầu vào, lock timeout 5 giây và statement timeout 60 giây.
- Không DROP, TRUNCATE, UPDATE hoặc DELETE dữ liệu; không tạo event mẫu.

Đã áp dụng thành công lên Supabase và đọc lại metadata: đủ ba cột mới, sáu index mới, các khóa ngoại cũ giữ nguyên. Tool .NET build thành công, 0 warning và 0 error. Chưa kiểm thử nghiệp vụ Active/Inactive hoặc lượt nghe vì backend/frontend tương ứng chưa được triển khai.

## Lệnh PowerShell

Chạy từ `C:\test\SGCoffee` để kiểm tra schema, không ghi dữ liệu:

```powershell
dotnet run --project infrastructure/tools/AnalyticsDatabase/AnalyticsDatabase.csproj
```

Kết quả mong đợi: danh sách cột, index và constraint; có ended_at và hai event_id. Tool đọc `ConnectionStrings:Supabase` từ Analytics User Secrets hoặc biến môi trường, không lưu secret vào source.

Lệnh áp dụng migration (đã chạy thành công trong phiên này):

```powershell
dotnet run --project infrastructure/tools/AnalyticsDatabase/AnalyticsDatabase.csproj -- --apply-dashboard-migration
```

Kết quả mong đợi: `Dashboard migration applied successfully` rồi in schema. Script dùng IF NOT EXISTS nên hỗ trợ chạy lại; không tự sửa cột cùng tên nếu kiểu không khớp.

Nếu báo `Missing ConnectionStrings:Supabase`, kiểm tra cấu hình Analytics User Secrets hoặc biến môi trường. Nếu báo `NpgsqlException`, kiểm tra mạng, quyền truy cập Supabase và thông tin kết nối tại máy; tool cố ý không in exception chi tiết chứa endpoint. Nếu migration báo schema khác hoặc lock timeout, kiểm tra lại schema/transaction đang giữ khóa trước khi chạy lại.

## Công việc tiếp theo

1. Backend: heartbeat 15 giây, timeout Active 45 giây, end-session; chỉ phiên chưa kết thúc và còn trong timeout được tính Active. Dùng UTC khi lưu và lọc.
2. Event: dùng event_id chống retry đếm trùng; xác thực session/visitor, brand/language/branch; đếm khi phát thành công, không đếm pause/resume hay loop tự động.
3. Bảo mật: bỏ ngoại lệ summary; bảo vệ toàn bộ admin API bằng xác thực/phân quyền, giữ SharedKey ở server. Rate limit ở Gateway dựa trên nguồn client đáng tin cậy.
4. Frontend: phiên riêng cho từng tab kể cả duplicate tab; heartbeat, pagehide/beacon, khôi phục khi pageshow/BFCache. Tab nền có thể bị trình duyệt treo nên cần kiểm thử thực tế.
5. Kết nối nguồn audio thật và mã ngôn ngữ đúng; thay Dashboard bằng số liệu thật, refresh 10–15 giây, chấm xanh/xám, hai bảng lượt nghe, loading/error/empty rõ ràng.
6. Kiểm thử local qua Gateway với Supabase; chỉ xem xét Railway sau khi xác thực Admin và các tiêu chí nghiệm thu đạt.
