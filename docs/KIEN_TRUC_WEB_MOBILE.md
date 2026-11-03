# Kiến trúc web mobile SmartShop

Ngày 03/11/2026, người dùng chọn hướng web/mobile và yêu cầu ghép giao diện cũ vào source vừa kéo từ GitHub. Triển khai hiện tại dùng Blazor responsive và giữ cấu trúc GUI–BUS–DAO–DTO.

## Luồng hiện tại

```text
Trình duyệt desktop / mobile
    -> SmartShop.GUI (Blazor Interactive Server)
    -> SmartShop.BUS (ShopState)
    -> SmartShop.DAO (DemoShopDao)
    -> Dữ liệu trong bộ nhớ của phiên
```

`SmartShop.DTO` chứa các record Product, Order và OrderLine dùng để trao đổi dữ liệu. GUI chứa thông báo, điều hướng, form và trạng thái hiển thị. BUS thực hiện tìm kiếm trên ArrayList, kiểm tra tồn kho và thông tin nhận hàng, tính tiền, tạo đơn và kiểm tra trạng thái. DAO giữ dữ liệu mẫu, áp dụng cập nhật đơn và tồn kho cùng nhau sau khi kiểm tra trên bản sao.

DAO hiện dùng bộ nhớ và cơ chế đồng bộ trong một phiên; chưa phải transaction SQL. GUI chỉ tham chiếu trực tiếp BUS và DTO. BUS tạo DemoShopDao riêng nên dữ liệu của các phiên không dùng chung. Giá và tồn kho được cập nhật qua BUS trong màn hình Admin demo; cần tách nhập kho/điều chỉnh kho thành nghiệp vụ riêng khi làm backend thật.

## Giữ sườn của nhóm

- Dùng đúng các project SmartShop.GUI, SmartShop.BUS, SmartShop.DAO và SmartShop.DTO.
- Giữ nguyên Database, các thư mục Forms cũ, tài liệu phân công và báo cáo của nhóm.
- Không có project SmartShop.Web thứ hai chạy song song.
- Điểm khởi chạy là SmartShop.GUI; solution chung là SmartShop.slnx.
- Schema SQL chưa có nội dung, nên model demo chưa được coi là hợp đồng database chính thức.

## Việc phát triển tiếp

1. Phúc và Vinh chốt schema SQL Server, DTO và các chữ ký BUS; ghi thay đổi để cả nhóm cùng dùng.
2. Thêm MyConnection và DAO SQL theo schema đã thống nhất; giữ tính tiền và kiểm tra nghiệp vụ ở BUS.
3. Dùng transaction database để lưu đơn/chi tiết/trừ tồn, thêm xác thực và phân quyền phía server.
4. Hoàn thiện quản lý khách hàng, nhân viên, nhà cung cấp, nhập kho và thống kê chi phí/lợi nhuận.
5. Nếu cần app Android/iOS riêng, thêm ASP.NET Core Web API dùng chung BUS/DAO và client .NET MAUI. Web responsive hiện có vẫn là client trình duyệt.

Các tài liệu yêu cầu môn học ban đầu nhắc WinForms được giữ làm nguồn tham chiếu. Chọn web/mobile trong phiên làm việc này không đồng nghĩa đã được giảng viên phê duyệt thay đổi yêu cầu môn học.
