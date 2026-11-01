# Chạy Admin Dashboard local

Vào trực tiếp `http://localhost:8080/admin`, không cần đăng nhập. Đã bỏ màn hình đăng nhập, cookie, đăng xuất và cấu hình tài khoản. Gateway cho truy cập trực tiếp các API Admin khi `Admin:Enabled=true`; môi trường Development đã bật sẵn. Khi tắt cờ này, API Admin trả 404.

Theo yêu cầu hiện tại, bất kỳ ai truy cập được Gateway cũng dùng được API Admin khi bật cờ, gồm các thao tác quản lý dữ liệu. SharedKey vẫn chỉ nằm ở server để xác thực Gateway với service nội bộ. Chưa deploy Railway.

## Chạy dịch vụ

Từ `C:\test\SGCoffee`, mở từng terminal. Dừng dịch vụ cũ bằng Ctrl+C trước khi khởi động lại:

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet run --project .\services\analytics\src\SGCoffee.Analytics
```

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet run --project .\services\catalog\src\SGCoffee.Catalog
```

```powershell
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet run --project .\services\gateway\src\SGCoffee.Gateway
```

```powershell
npm.cmd run dev
```

Mặc định: frontend 8080, Gateway 5100, Catalog 5101, Analytics 5105. Không đặt PORT dùng chung cho tất cả terminal. Giữ cấu hình Supabase hiện có và SharedKey giống nhau ở Gateway/Analytics/Catalog. Không đưa key vào frontend.

Không cần chạy script tạo tài khoản cũ. Các giá trị Admin:Username/PasswordHash trong User Secrets cũ không còn được dùng. Nếu API Admin trả 404, kiểm tra môi trường Development và cấu hình Admin:Enabled bị biến môi trường hoặc User Secrets ghi đè. Nếu API trả 503, kiểm tra kết nối Supabase. Nếu service trả 401, kiểm tra SharedKey giữa Gateway và service.

## Hành vi Dashboard

- Session riêng cho từng document/tab, kể cả duplicate tab; reload tạo phiên mới.
- Heartbeat 15 giây; Active khi chưa kết thúc và heartbeat trong 45 giây. Đóng tab dùng beacon/keepalive. Đổi tab không kết thúc phiên; trình duyệt treo tab nền vẫn có thể gây timeout.
- Dashboard lấy số liệu thật, tự cập nhật sau mỗi 10 giây, có loading/error/empty và ghi rõ dữ liệu cũ khi refresh lỗi. Hiển thị giờ Việt Nam; timestamp lưu UTC.
- Active xanh, Inactive xám; hai bảng audio theo thương hiệu/ngôn ngữ, không có biểu đồ audio.
- Trang thương hiệu lấy mô tả SQL; khi chưa có file audio, dùng giọng đọc trình duyệt theo ngôn ngữ mô tả. Ghi lượt nghe khi bắt đầu đọc/phát thật, không tính pause/resume hay loop tự động. Retry dùng cùng event ID để chống trùng.
- Public tracking vẫn giới hạn 120 request/phút/IP. API Admin ghi dữ liệu vẫn yêu cầu header X-Admin-Request; helper frontend đã gửi sẵn. Header này không phải xác thực đăng nhập.

## Kiểm tra

```powershell
node --test .\infrastructure\tests\tracking.test.cjs
npm.cmd run build
dotnet build .\services\analytics\src\SGCoffee.Analytics --no-restore
dotnet build .\services\gateway\src\SGCoffee.Gateway --no-restore
dotnet build .\services\catalog\src\SGCoffee.Catalog --no-restore -o .tmp/catalog-check -p:UseAppHost=false
dotnet run --project .\infrastructure\tests\ApiSmoke
```

Smoke test chạy dịch vụ riêng trên cổng tạm, đọc Supabase thật, kiểm tra truy cập Admin trực tiếp, tắt Admin, SharedKey và đối chiếu tổng số. Không tạo phiên hoặc lượt nghe giả, tự dừng tiến trình test.

Cần kiểm tra thêm trên trình duyệt: mở hai tab, đóng một tab, tab nền/mất mạng, Back/Forward và giọng đọc mô tả. Thời gian chuyển Inactive có thể tới 45 giây cộng chu kỳ refresh nếu beacon không đến server.
