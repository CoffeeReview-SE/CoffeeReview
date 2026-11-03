# SmartShop

SmartShop phát triển theo hướng **web/mobile bằng C# Blazor**, dùng giao diện responsive cho máy tính, tablet và trình duyệt điện thoại. Giao diện đen–đỏ cũ đã được ghép vào sườn GUI–BUS–DAO–DTO của repo.

## Chạy thử

Yêu cầu .NET 10 SDK. Mở `SmartShop.slnx` trong Visual Studio hỗ trợ .NET 10, chọn **SmartShop.GUI** làm startup project, hoặc chạy:

```powershell
dotnet run --project SmartShop.GUI --launch-profile http --urls http://localhost:5188
```

Mở http://localhost:5188. Khung xem điện thoại: http://localhost:5188/mobile-preview.html.
Để thử bằng điện thoại cùng mạng, dùng `--urls http://0.0.0.0:5188` và mở `http://<IP-LAN-máy-tính>:5188` trên điện thoại.

## Cấu trúc đang sử dụng

```text
SmartShop.GUI/        Blazor Web App, Razor components, CSS, UI state
SmartShop.BUS/        Tìm kiếm ArrayList, giỏ hàng, kiểm tra dữ liệu, tính tiền
SmartShop.DAO/        DemoShopDao, lưu dữ liệu mẫu theo phiên
SmartShop.DTO/        Product, Order, OrderLine
Database/            Sườn script SQL và ERD do nhóm tiếp tục hoàn thiện
docs/                Tài liệu, báo cáo và hình ảnh
progress/            Tiến độ từng chức năng
SmartShop.slnx       Solution chứa đủ 4 project
```

GUI gọi BUS; BUS gọi DAO; các lớp trao đổi model DTO. GUI không dùng SQL hoặc gọi DAO trực tiếp. DTO là các record bất biến; cập nhật dữ liệu đi qua BUS. Các thư mục `Forms/` và `Resources/` cũ được giữ làm tài liệu/sườn tham chiếu, không phải điểm khởi chạy.

## Các màn hình

| Đường dẫn | Màn hình |
|---|---|
| `/` | Trang chủ |
| `/products`, `/favorites` | Sản phẩm, lọc giá, yêu thích |
| `/cart`, `/checkout` | Giỏ hàng và thông tin đặt hàng |
| `/success`, `/orders` | Xác nhận và lịch sử đơn |
| `/admin` | Sản phẩm, trạng thái đơn, thống kê demo |
| `/account`, `/support` | Thông tin tài khoản demo và trợ giúp |

Xem [phân chia file giao diện](SmartShop.GUI/README.md) và [kiến trúc web/mobile](docs/KIEN_TRUC_WEB_MOBILE.md).

## Phạm vi hiện tại

Các luồng giao diện và nghiệp vụ demo chạy được, dữ liệu giữ theo phiên Blazor trong bộ nhớ. Mỗi phiên có sản phẩm, giỏ và đơn riêng; tải lại trang hoặc khởi động lại có thể mất dữ liệu. Admin là trang demo chưa có xác thực. Chưa kết nối SQL Server; hai script trong `Database/scripts/` hiện chỉ là sườn. Chưa có thanh toán thật, xuất Excel/PDF hay ứng dụng MAUI Android/iOS riêng. Hình sản phẩm là minh họa CSS.

## Kiểm tra và tiến độ

```powershell
dotnet build SmartShop.slnx
dotnet run --project tests/SmartShop.SmokeTests
```

Theo dõi việc ghép giao diện trong `progress/23-web-mobile-gui.md`. Tài liệu phân công cũ được giữ làm tham chiếu; quyết định web/mobile ngày 03/11/2026 được ghi rõ trong tài liệu kiến trúc. Khi cập nhật checklist, chạy `node tools/cap-nhat-tien-do.js` để tổng hợp tiến độ.
