# Sửa API trả HTML trên Railway

Lỗi `Unexpected token '<', '<!doctype' ... is not valid JSON` xuất hiện vì `/api/...` nhận trang frontend. Import SQL không sửa được lỗi routing này.

Lệnh start cũ `serve -s dist` trả `index.html` cho các đường dẫn không tồn tại, bao gồm `/api`. Proxy Vite chỉ được cấu hình cho dev. Lệnh start mới `node scripts/web-server.mjs` phục vụ frontend và chuyển `/api/...` tới Gateway, giữ cùng origin để tất cả màn hình Admin, trang thương hiệu và tracking cùng hoạt động.

## Cấu hình service frontend

- Build: `npm run build`.
- Start: `npm start`. Nếu Railway đã đặt Start Command riêng là `serve -s dist ...`, thay bằng `npm start` để dùng server mới.
- Biến runtime `API_GATEWAY_URL`: origin thực tế của backend Gateway, gồm protocol và port nếu cần. Không thêm `/api`, không trỏ về frontend, không dùng `localhost` để gọi service khác trên Railway.
- Nếu Gateway có `Gateway:EdgeSecret`, đặt `API_EDGE_SECRET` bằng giá trị đó tại server frontend. Không đặt secret với tiền tố VITE_.

Ví dụ khi Gateway thực sự có hostname `gateway.railway.internal` và lắng nghe port 8080:

```text
API_GATEWAY_URL=http://gateway.railway.internal:8080
```

Hostname/port phải khớp service thật, ví dụ trên không tự tạo ra backend. Biến `VITE_API_BASE_URL` cũ không được code dùng và không thay thế được proxy này.

## Backend phải được chạy riêng

Push repo để Railway tự deploy service frontend không tự khởi động các project .NET trong repo. Cần các service Gateway, Analytics, Catalog và Submission để các nhóm API hiện tại hoạt động. Mỗi service có Dockerfile trong thư mục tương ứng tại `services/`.

Trên Gateway:

- `Admin__Enabled=true` để vào Admin trực tiếp theo yêu cầu hiện tại.
- `Gateway__SharedKey` trùng với các service nội bộ.
- `ReverseProxy__Clusters__analytics__Destinations__d1__Address`, `ReverseProxy__Clusters__catalog__Destinations__d1__Address`, `ReverseProxy__Clusters__submission__Destinations__d1__Address` trỏ đến hostname/port thật của từng service Railway.

Trên Analytics, Catalog và Submission:

- `ConnectionStrings__Supabase` là connection string Supabase của từng service; giữ bí mật.
- `Gateway__SharedKey` trùng với Gateway.
- Mỗi project đã đọc PORT của Railway; hostname/port cấu hình phía gọi phải khớp.

Không đưa SharedKey hoặc connection string vào frontend bundle. Admin hiện không có đăng nhập theo yêu cầu người dùng; bật Admin đồng nghĩa truy cập trực tiếp API quản lý.

## Kiểm tra sau khi tự deploy

Mở cùng domain frontend tại `/api/admin/analytics/summary`. Kết quả đúng là JSON.

- `503` có thông báo API_GATEWAY_URL: chưa cấu hình biến runtime frontend.
- `502` báo không kết nối Gateway: Gateway chưa chạy hoặc hostname/port sai.
- `502` báo Gateway trả HTML: đang trỏ nhầm về frontend hoặc service tĩnh.
- `404`: kiểm tra Admin__Enabled trên Gateway và route/service tương ứng.
- `401`: kiểm tra SharedKey giữa Gateway và service, không thêm key vào trình duyệt.
- `503` từ Analytics: kiểm tra kết nối/database phía backend.

## Supabase SQL

Migration `infrastructure/Database/analytics_dashboard_migration.sql` đã áp dụng thành công vào Supabase được cấu hình ở môi trường local trong phiên làm việc trước. Nó thêm ended_at, event_id và index. Không cần import lại vào cùng database; chỉ chạy migration bổ sung nếu backend Railway trỏ tới một database/project Supabase khác chưa có các cột này. Không import lại file SQL dữ liệu gốc để sửa lỗi API.

Chỉ đọc metadata để kiểm tra database local đang cấu hình:

```powershell
dotnet run --project infrastructure/tools/AnalyticsDatabase/AnalyticsDatabase.csproj
```

## Kiểm tra bản sửa local

```powershell
npm.cmd run build
node --test infrastructure/tests/web-server.test.mjs
$env:API_GATEWAY_URL = 'http://127.0.0.1:5100'
npm.cmd start
```

Chạy Gateway và các backend local riêng như `docs/Admin-Dashboard-Local.md`. Việc sửa source chưa thay đổi cấu hình hay triển khai Railway.
