# Railway: frontend và bốn backend trong một service

Dockerfile tại gốc repo build React và publish Gateway/Analytics/Catalog/Submission. Node khởi động bốn tiến trình .NET, chờ health check rồi mở frontend trên PORT của Railway. Backend dùng cổng nội bộ 5100/5101/5104/5105. Nếu một backend dừng, launcher dừng toàn bộ ứng dụng để Railway có thể restart.

## Cấu hình service Railway hiện có

1. Push các thay đổi lên repo đang liên kết với Railway.
2. Mở service frontend hiện tại, không tạo service mới.
3. Settings → Source → Root Directory: `/` (gốc repo).
4. Variables: `RAILWAY_DOCKERFILE_PATH=Dockerfile` (Dockerfile mới tại gốc).
5. Xóa Build Command và Start Command tùy chỉnh cũ. Để Railway dùng Dockerfile và CMD `node scripts/start-all.mjs`, không chạy `npm start` cho bản gộp.
6. Healthcheck Path: `/health`. Có thể đặt timeout khởi động 120 giây.
7. Giữ domain công khai hiện có trỏ tới port 8080, cùng PORT bên dưới.

## Variables → Raw Editor

```text
PORT=8080
RAILWAY_DOCKERFILE_PATH=Dockerfile
Admin__Enabled=true
Gateway__SharedKey=THAY_BANG_SHARED_KEY_HIEN_TAI
ConnectionStrings__Supabase=THAY_BANG_CONNECTION_STRING_HIEN_TAI
```

Thay hai giá trị mẫu bằng cấu hình thật trước khi Deploy. Không commit secret. Không cần API_GATEWAY_URL: launcher tự nối frontend tới Gateway nội bộ và tự đặt địa chỉ ba backend. Các biến API_GATEWAY_URL/ReverseProxy cũ có thể xóa để tránh nhầm; launcher ghi đè các địa chỉ mà bản gộp sử dụng. Không đặt PORT bằng các cổng nội bộ 5100/5101/5104/5105.

Gateway__EdgeSecret không bắt buộc. Nếu giữ biến này, launcher dùng cùng giá trị cho proxy frontend. Không cần API_EDGE_SECRET riêng trong bản gộp.

Admin không có đăng nhập theo yêu cầu hiện tại. Database Supabase giữ nguyên; không cần import lại SQL nếu vẫn dùng database đã áp dụng migration.

## Sau khi deploy

Log thành công có dòng:

```text
SGCoffee frontend and four backend services are ready
```

Kiểm tra trên domain frontend:

- `/health`: JSON `status: ok` khi cả bốn backend trả health thành công. Đây là kiểm tra tiến trình HTTP, không xác nhận kết nối database.
- `/api/admin/analytics/summary`: số liệu thật từ Supabase.
- `/api/admin/catalog/brands`: danh sách thương hiệu.
- `/api/admin/submissions`: dữ liệu Submission.
- `/admin`: Dashboard.

Nếu thiếu biến bắt buộc, log chỉ nêu tên biến, không in giá trị. Nếu API Analytics trả 503, kiểm tra kết nối Supabase. Nếu một backend không khởi động, xem log service đó; launcher không mở frontend khi backend chưa sẵn sàng.

## Kiểm tra local

```powershell
node --test infrastructure/tests/start-all.test.mjs infrastructure/tests/web-server.test.mjs
npm.cmd run build
docker build -t sgcoffee-all .
```

Để chạy container, truyền hai biến bí mật bằng môi trường hoặc file env local không commit. Image chỉ nhận secret lúc chạy, không cần secret để build. `.dockerignore` loại node_modules, bin/obj, .env và secrets.json khỏi build context.

Các dịch vụ dùng chung RAM/CPU và cùng restart/deploy. Bản gộp xử lý giới hạn số service, không làm mất chi phí tài nguyên của các tiến trình backend.

## Kết quả kiểm tra trong phiên triển khai source

- Build React và publish Release của cả bốn project .NET thành công.
- 11 test launcher/proxy/health thành công.
- Chạy launcher thật trên cổng thử riêng, kiểm tra frontend, health và ba API đọc Analytics/Catalog/Submission với Supabase thật: thành công; không tạo dữ liệu tracking/audio thử.
- Đã sửa PathPrefix của route submission-admin thành `/admin/submissions` để khớp endpoint backend hiện có.
- Máy làm việc chưa có Docker nên chưa chạy docker build hoặc kiểm tra image Linux hoàn chỉnh; chưa deploy Railway.
