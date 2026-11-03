# Ghép giao diện web mobile vào sườn dự án

**Người phụ trách:** Triết
**Trạng thái:** Xong
**Cập nhật lần cuối:** 03/11/2026

## Việc cần làm

- [x] Đưa giao diện cũ vào SmartShop.GUI, giữ bố cục đen–đỏ và responsive.
- [x] Tạo solution 4 project GUI–BUS–DAO–DTO và tham chiếu đúng lớp.
- [x] Tách trang chủ, sản phẩm, giỏ hàng, thanh toán, đơn hàng và Admin thành các trang có URL riêng.
- [x] Chuyển model sang DTO, dữ liệu mẫu sang DAO, nghiệp vụ demo sang BUS.
- [x] Cập nhật tài liệu điểm khởi chạy và hướng web/mobile.
- [x] Kiểm tra build và luồng đặt hàng, tồn kho, quản trị sau tích hợp.
- [x] Kiểm tra hiển thị desktop/mobile và lưu ảnh giao diện.

## Nhật ký tiến độ

| Ngày | Người | Đã làm | Công cụ AI | Ghi chú |
|---|---|---|---|---|
| 03/11/2026 | Triết | Ghép giao diện Blazor cũ vào sườn đã pull, tách 4 project và các trang | Codex | Dữ liệu demo theo phiên, chưa SQL/xác thực; không đánh dấu hoàn thành các chức năng backend của nhóm |

## Kết quả kiểm tra

- Build đủ 4 project thành công, 0 lỗi. Có cảnh báo NU1900 do không truy cập được dịch vụ kiểm tra gói NuGet.
- 14 kiểm tra nghiệp vụ console đã qua.
- Trình duyệt: thêm 2 sản phẩm, tổng 69.980.000 đ, đặt đơn thành công, tồn từ 24 xuống 22, Admin xác nhận và lịch sử đơn hiển thị đúng.
- Responsive 390 × 844: lưới hai cột, menu dưới, điều hướng trang sản phẩm chạy được.
- Ảnh: docs/images/04-form-chinh/web-desktop.png và web-mobile.png.
