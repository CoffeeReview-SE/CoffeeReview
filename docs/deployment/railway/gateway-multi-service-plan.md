# Kế hoạch API Gateway và triển khai Railway

**Cập nhật:** 27/10/2026  
**Mục tiêu:** Sau khi commit/push, Railway tự build và deploy ứng dụng; frontend gọi API qua gateway, gateway chuyển tiếp tới backend services.

## Tóm tắt quyết định

- Phát triển backend theo từng service, bắt đầu với **Catalog**.
- Chạy local bằng Docker Compose: gateway và backend ở **các container riêng**, kết nối cùng network.
- Trên Railway, tạo các Railway service riêng trong cùng project/environment. Gateway là điểm vào public; backend và database chỉ cần kết nối qua private network.
- Hoàn thiện một luồng đầu cuối qua gateway trước khi triển khai các service tiếp theo.
- Chưa bật API quản trị cho tới khi có xác thực và phân quyền.

## Hiện trạng đã kiểm tra

- `services/gateway/src/SGCoffee.Gateway` là project ASP.NET Core nhắm `.NET 10`, dùng YARP làm reverse proxy.
- Gateway đọc cổng từ biến `PORT`, mặc định local là `5100`; Dockerfile đặt `PORT=8080`.
- Có endpoint `GET /health`, cấu hình CORS, rate limit cho một số route ghi/tracking, và cờ `Admin:Enabled` mặc định `false`.
- Các route đã khai báo cho catalog, localization, reviews, submissions, analytics và admin.
- Hiện chỉ tìm thấy project gateway trong `services`; các thư mục backend khác chưa có mã nguồn/service chạy được.
- `appsettings.json` hiện trỏ backend về `localhost:5101`–`5105`. Những địa chỉ này chưa thể gọi các container/service riêng khi deploy.
- `infrastructure/docker/docker-compose.yml` hiện chỉ là placeholder, chưa định nghĩa các service ứng dụng.

## Sơ đồ dự kiến

```text
Trình duyệt
    |
    | HTTPS, public domain
    v
API Gateway (Railway service public)
    |
    | Private network trong cùng Railway project/environment
    +--> Catalog service
    +--> Review service
    +--> Submission service
    +--> Localization service
    +--> Analytics service
    +--> Database
```

Chỉ gateway cần public domain. Backend giao tiếp nội bộ bằng private hostname; không dùng `localhost` giữa các Railway service. Trên Railway, private networking hoạt động giữa các service trong cùng project và environment. Tham khảo [Private Domains của Railway](https://docs.railway.com/networking/domains/working-with-domains).

## Các việc cần xử lý ở gateway

### Trước khi tích hợp Railway

1. **Chuyển upstream address sang cấu hình theo môi trường.** Giữ địa chỉ local cho phát triển, nhưng cấu hình hostname private của Railway ở môi trường production. .NET có thể override cấu hình lồng nhau bằng biến môi trường, ví dụ:

   ```text
   ReverseProxy__Clusters__catalog__Destinations__d1__Address=http://<catalog-private-host>:<port>
   ```

2. **Sửa khóa phân vùng rate limit.** `Program.cs` hiện ưu tiên header `X-Client-Ip` do request gửi (`ClientKey`). Client có thể tự đặt header để né phân vùng giới hạn. Chỉ dùng IP được xác định từ proxy tin cậy hoặc danh tính/API key đã xác thực.

3. **Giới hạn forwarded headers vào proxy tin cậy.** Cấu hình hiện xóa danh sách `KnownIPNetworks` và `KnownProxies`, tức chấp nhận forwarded headers rộng hơn mức an toàn. Khi triển khai, chỉ tin proxy/network phù hợp với topology thực tế. Microsoft cảnh báo việc xóa danh sách cho phép mọi nguồn được xem như proxy tin cậy: [Tài liệu forwarded headers](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/8/forwarded-headers-unknown-proxies?view=aspnetcore-10.0).

4. **Giữ admin tắt và bổ sung xác thực trước khi mở.** `Admin:Enabled=true` chỉ bỏ chặn route `/api/admin`; hiện gateway chưa có authentication/authorization.

5. **Quản lý khóa bằng Railway Variables.** `Gateway:SharedKey` và `Gateway:EdgeSecret` đang để rỗng trong `appsettings.json`. Nếu thiết kế production yêu cầu các khóa này, cần cấu hình secret trong Railway và cân nhắc fail-fast khi thiếu. Không commit secret thật vào Git.

6. **Thêm readiness check khi service backend sẵn sàng.** `/health` hiện chỉ trả trạng thái gateway đang chạy; chưa kiểm tra upstream. Railway có thể dùng healthcheck path để đợi deployment trả về 2xx trước khi chuyển traffic; healthcheck không phải giám sát liên tục sau deploy. Xem [Railway Healthchecks](https://docs.railway.com/deployments/healthchecks).

## Lộ trình triển khai

### 1. Làm Catalog trước

- Tạo ASP.NET Core API chạy được cho Catalog.
- Xác định contract: endpoint, HTTP methods, request/response và lỗi.
- Chạy local cùng gateway; đổi upstream local sang hostname của Compose, ví dụ `http://catalog:5101`.
- Gọi một endpoint trực tiếp vào Catalog và cùng endpoint qua gateway, ví dụ `/api/catalog/...`.
- Kiểm tra path transform hiện tại: gateway xóa prefix `/api/catalog` trước khi chuyển tiếp.

### 2. Thiết lập chạy local

- Hoàn thiện Docker Compose với các container riêng cho gateway, Catalog và database khi cần.
- Chỉ publish cổng gateway ra host; backend/database chỉ expose trong network nội bộ trừ khi có lý do phát triển cụ thể.
- Thêm healthcheck/retry phù hợp; không phụ thuộc vào thứ tự khởi động cố định.

### 3. Thiết lập Railway

- Tạo Railway service cho gateway và mỗi backend deployable từ cùng Git repository, dùng Root Directory hoặc Dockerfile path phù hợp.
- Cấu hình build/deploy cho đúng project; kết nối các service trong cùng Railway project/environment.
- Đặt private host/port của backend vào Railway Variables của gateway.
- Chỉ tạo public domain cho gateway; không để frontend gọi trực tiếp private network (trình duyệt không truy cập được Railway private network).
- Thiết lập `/health` làm deploy healthcheck và xác nhận gateway bind vào `PORT` Railway cấp.
- Railway triển khai mỗi thành phần Compose như service riêng; không chạy nguyên `docker-compose.yml` trực tiếp. Tham khảo [Railway Docker Compose guide](https://docs.railway.com/guides/docker-compose) và [Monorepo guide](https://docs.railway.com/deployments/monorepo).

### 4. Mở rộng từng bước

Sau khi Catalog chạy đầu cuối ổn định, thêm Review, Submission, Localization và Analytics lần lượt; mỗi lần xác nhận route qua gateway, healthcheck và cấu hình Railway trước khi thêm service khác.

## Ghi chú frontend từ quá trình xử lý deploy

- Vite dev server local được cấu hình cổng `8080` trong `vite.config.js`; mặc định Vite nếu bỏ cấu hình là `5173`.
- Lệnh production `npm start` phục vụ thư mục `dist`; cần chạy `npm run build` trước. Railway nên dùng build command `npm run build` và start command `npm start`, đồng thời service phải dùng biến `PORT`.
- Đã khóa `react` và `react-dom` cùng phiên bản `19.1.0` để tránh React error #527 do mismatch phiên bản; khi deploy nên cài dependency sạch từ lockfile và xóa build cache cũ nếu cần.
- Log `Serving!` của static server là thông báo trong terminal. Truy cập URL localhost/port hiển thị để xem giao diện; `0.0.0.0` là địa chỉ bind của server, không thường dùng làm địa chỉ mở trong trình duyệt.

## Tiêu chí hoàn thành giai đoạn đầu

- Catalog chạy độc lập trong môi trường local.
- Gateway định tuyến thành công ít nhất một request tới Catalog trong local Compose.
- Production config của gateway không còn phụ thuộc vào `localhost` cho backend.
- Gateway và Catalog deploy được từ commit mới trên Railway, healthcheck thành công.
- Client gọi API qua public gateway domain; backend không cần public domain.
- Rate limit không tin header client tùy ý, và các route admin vẫn đóng cho tới khi có auth.
