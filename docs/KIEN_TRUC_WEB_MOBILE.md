# Giao diện web mobile trên develop

Bản giao diện được gộp từ `feature/web-mobile-gui` vào `develop`, giữ nguyên toàn bộ các file và thư mục đã pull từ `origin/develop`. Chỉ bổ sung mã ứng dụng vào sườn `User`, `Admin`, `Database/src` và các tài liệu mới. Không sửa nội dung README, phân công hoặc checklist gốc của nhóm.

## Chạy ứng dụng

Yêu cầu .NET 10 SDK. Mở `SmartShop.slnx`, chọn `SmartShop.User` làm startup project, hoặc chạy:

```powershell
dotnet run --project User/SmartShop.User.csproj --launch-profile http --urls http://localhost:5190
```

Mở http://localhost:5190. Admin ở `/admin`; khung xem điện thoại ở `/mobile-preview.html`. Admin được nạp vào cùng ứng dụng, không cần chạy máy chủ thứ hai.

## File bổ sung theo sườn mới

| Vị trí | Nội dung |
|---|---|
| User/Components/Pages | Trang chủ, sản phẩm, giỏ hàng, thanh toán, đơn, tài khoản, trợ giúp |
| User/Components/Layout | Header, menu trái, thanh điều hướng mobile và popup |
| User/wwwroot | CSS, minh họa thiết bị và tài nguyên giao diện |
| User/Shared | State và lớp điều khiển UI dùng chung cho User và Admin |
| Admin/Components/Pages/Admin.razor | Quản trị sản phẩm, đơn hàng, thống kê demo |
| Admin/SmartShop.Admin.csproj | Thư viện Razor chứa màn hình quản trị |
| Database/src/SmartShop.DTO | Model Product, Order, OrderLine |
| Database/src/SmartShop.BUS | Tìm kiếm ArrayList, tính tiền, giỏ hàng, kiểm tra dữ liệu |
| Database/src/SmartShop.DAO | Kho dữ liệu demo theo phiên |
| Database/src/SmartShop.SmokeTests | Kiểm tra nghiệp vụ không cần thư viện test ngoài |

GUI gọi BUS; BUS gọi DAO; DTO dùng để trao đổi dữ liệu. User và Admin dùng chung service scoped trong phiên Blazor. Router và endpoint máy chủ khai báo thêm assembly Admin để `/admin` hoạt động khi truy cập trực tiếp và khi chuyển trang.

## Kiểm tra

```powershell
dotnet build SmartShop.slnx
dotnet run --project Database/src/SmartShop.SmokeTests
```

## Phạm vi

Giao diện vẫn dùng dữ liệu demo trong bộ nhớ. Tải lại hoặc mở phiên mới có thể mất giỏ và đơn; Admin chưa có xác thực. Chưa kết nối SQL Server, thanh toán thật hoặc app MAUI riêng. Hình thiết bị là minh họa CSS. Tài liệu gốc có thể còn nhắc WinForms; tài liệu này ghi riêng phần web/mobile đã được người dùng yêu cầu, không ghi đè tài liệu gốc.

## Git

Làm việc và push trên `develop`. Lệnh push dùng đích rõ ràng `HEAD:develop`; không push `main`.
