# Chạy Admin Dashboard local

Backend và Dashboard đã nối dữ liệu thật từ Supabase. Migration của bước 2 đã chạy, không cần import lại SQL gốc. Chưa deploy Railway.

## Cấu hình đăng nhập một lần

Từ PowerShell tại `C:\test\SGCoffee`:

```powershell
powershell -ExecutionPolicy Bypass -File .\infrastructure\scripts\setup-admin.ps1
```

Script hỏi tên tài khoản và mật khẩu tối thiểu 16 ký tự, không hiện mật khẩu. Chỉ hash mật khẩu được lưu vào User Secrets của Gateway cùng `Admin:Username` và `Admin:Enabled=true`. Không có tài khoản/mật khẩu mặc định. Script không ghi secret vào source. Nó thay cấu hình tài khoản Admin local nếu đã tồn tại.

Giữ nguyên `ConnectionStrings:Supabase` hiện có ở Analytics và Catalog. `Gateway:SharedKey` ở Gateway/Analytics/Catalog phải giống nhau; không đưa key vào Vite hoặc trình duyệt. Smoke test dùng key/tài khoản tạm riêng trong tiến trình nên không thay cấu hình này.

## Chạy dịch vụ

Nếu dịch vụ cũ đang chạy, dừng bằng Ctrl+C ở terminal của dịch vụ rồi khởi động lại. Mở từng terminal tại thư mục dự án:

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

Mặc định: frontend `http://localhost:8080`, Gateway `5100`, Catalog `5101`, Analytics `5105`. Không đặt PORT dùng chung cho tất cả terminal. Vào `http://localhost:8080/admin` và đăng nhập.

Nếu build báo MSB3027/file đang được sử dụng, dừng đúng tiến trình dịch vụ trước khi build lại. Nếu Admin trả 404, kiểm tra Admin:Enabled và môi trường Development. Nếu trả 503 khi đăng nhập, kiểm tra Admin:Username/PasswordHash. Nếu summary trả 503, kiểm tra mạng/kết nối Supabase; nếu 401, kiểm tra cookie đăng nhập và SharedKey phía server.

## Hành vi đã triển khai

- Mỗi document/tab có session ID mới trong bộ nhớ; duplicate tab không sao chép ID. Reload tạo phiên mới và kết thúc phiên cũ qua pagehide khi có thể. Visitor ID ẩn danh giữ trong localStorage; khi storage bị chặn sẽ dùng ID trong bộ nhớ.
- Heartbeat 15 giây, Active khi chưa kết thúc và heartbeat không quá 45 giây. Đóng tab gửi beacon, fallback keepalive. Không tắt phiên khi chỉ đổi tab. Browser treo tab nền/mất mạng vẫn có thể gây timeout; trở lại tab sẽ gửi heartbeat.
- Dashboard chỉ đọc số thật, tự cập nhật mỗi 10 giây sau lần tải trước; có timeout request, báo lỗi, ghi rõ dữ liệu cũ khi refresh lỗi. Không biến lỗi thành số 0. Toàn bộ thời gian; ngày hiển thị theo giờ Việt Nam, timestamp lưu UTC.
- Hai bảng lượt nghe theo thương hiệu/ngôn ngữ, không có biểu đồ audio. Danh sách 50 phiên không hiển thị ID hoặc thông tin cá nhân.
- Trang `/brand/{id}` đọc mô tả thật từ Catalog. Khi chưa có file audio, nút Đọc mô tả dùng speechSynthesis của trình duyệt theo description_language_code trong SQL. Không tự dịch. Không có mô tả/ngôn ngữ thì để trống chức năng nghe.
- Ghi lượt nghe TTS ở onstart; file audio ở playing sau thao tác Play. Pause/resume cùng lượt không tăng; replay sau ended hoặc đọc lại từ đầu tăng một lượt mới. Loop file audio tự động không tăng. Mỗi event có UUID, retry dùng cùng UUID và unique index chống trùng.
- Admin dùng cookie HttpOnly/SameSite=Strict, giới hạn 8 giờ. Mọi admin API cần cookie; POST cần X-Admin-Request để chống CSRF. Login giới hạn 5 lần/phút/IP. Public tracking giới hạn 120 request/phút/IP ở Gateway, không tin header X-Client-Ip tự khai báo.

## Kiểm tra tự động

```powershell
node --test .\infrastructure\tests\tracking.test.cjs
npm.cmd run build
dotnet build .\services\analytics\src\SGCoffee.Analytics --no-restore
dotnet build .\services\gateway\src\SGCoffee.Gateway --no-restore
dotnet build .\services\catalog\src\SGCoffee.Catalog --no-restore -o .tmp/catalog-check -p:UseAppHost=false
dotnet run --project .\infrastructure\tests\ApiSmoke
```

Smoke test chạy dịch vụ riêng trên cổng tạm, dùng tài khoản tạm, đọc Supabase thật để kiểm tra API và đối chiếu tổng số; không tạo phiên hoặc lượt nghe giả và tự dừng các tiến trình test. Cần quyền kết nối mạng và Data Protection cho cookie. Sáu test tracking kiểm tra riêng tab, retry, StrictMode, kết thúc/khôi phục, loại trừ Admin và thứ tự gửi audio.

## Kiểm thử trình duyệt còn cần thực hiện

1. Mở Dashboard và hai tab website; xác nhận Active tăng hai, kể cả duplicate tab.
2. Đóng một tab; chờ Dashboard cập nhật hoặc timeout 45 giây cộng chu kỳ refresh. Tab còn lại vẫn Active.
3. Để tab nền, mất mạng, nối lại và Back/Forward để kiểm tra hành vi browser thực tế.
4. Mở thương hiệu có description và description_language_code trong SQL, bấm Đọc mô tả. Khi nghe thực sự bắt đầu, hai bảng audio tăng đúng thương hiệu/ngôn ngữ. Không bấm thì không tăng. Trình duyệt cần có hỗ trợ giọng đọc phù hợp.
5. Khi có file audio thật, kiểm tra phát lỗi, pause/resume, replay và loop; không thêm URL giả để test trên dữ liệu thật.

Railway vẫn cần reverse proxy `/api` cùng origin, backend riêng, HTTPS, cấu hình proxy tin cậy và lưu Data Protection keys bền vững cho cookie. Chưa xác nhận các điều kiện này và chưa triển khai production.
