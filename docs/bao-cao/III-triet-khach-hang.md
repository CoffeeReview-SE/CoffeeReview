# Phần 05 quản lý khách hàng trên web

Module demo nằm tại `/admin/customers`, dùng bố cục và menu quản trị riêng. Giao diện User không có mục quản lý khách hàng hoặc popup tra cứu danh sách khách hàng. Dữ liệu mẫu chỉ tồn tại trong phiên kết nối; chưa kết nối database và hệ thống đăng nhập.

## 1 Giới thiệu chức năng

Quản trị viên xem danh sách/hồ sơ, thêm, sửa, xóa khách hàng, khóa/mở trạng thái hồ sơ, tìm theo mã/tên/điện thoại/email/địa chỉ và lọc trạng thái. Tìm kiếm hỗ trợ tên tiếng Việt có dấu hoặc không dấu.

Popup tìm/chọn có thể dùng lại trong các nghiệp vụ Admin. `CustomerSelector` nhận `Value` và phát `ValueChanged`; giá trị được điền vào ô chỉ đọc sau khi chọn. `OnlyActive=true` dùng để giới hạn lựa chọn khách hàng đang hoạt động; trang quản lý có thể tra cứu cả hồ sơ bị khóa.

## 2 Giao diện và hình minh họa

- [Danh sách khách hàng](../images/05-khach-hang/01-danh-sach-khach-hang.png): menu Admin bên trái, tổng số/hoạt động/đã khóa, ô tìm kiếm và bộ lọc, bảng thao tác.
- [Form chỉnh sửa](../images/05-khach-hang/02-sua-khach-hang.png): mã chỉ đọc khi sửa; họ tên, điện thoại, email tùy chọn, địa chỉ và trạng thái có thể chỉnh.
- [Popup chọn khách hàng](../images/05-khach-hang/03-popup-chon-khach-hang.png): nhập từ khóa, xem kết quả và chọn để trả dữ liệu qua callback.
- [Danh sách mobile](../images/05-khach-hang/04-mobile-danh-sach.png) và [form mobile](../images/05-khach-hang/05-mobile-form.png): bố cục một cột; bảng có vùng cuộn ngang riêng.

## 3 Quy tắc và công thức

- Mã gồm 2–20 ký tự, bắt đầu bằng chữ; chỉ chứa chữ, số, dấu gạch dưới hoặc gạch ngang. BUS chuẩn hóa mã thành chữ hoa và kiểm tra duy nhất không phân biệt hoa/thường.
- ID do DAO sinh. Khi sửa không được thay mã hoặc ngày tạo, kể cả khi bỏ thuộc tính readonly trên trình duyệt.
- Họ tên 2–120 ký tự; điện thoại 10 số bắt đầu bằng 0; địa chỉ 10–250 ký tự. Email không bắt buộc nhưng phải đúng định dạng khi nhập.
- Tổng khách hàng = số phần tử của danh sách; đang hoạt động = số hồ sơ IsActive=true; đã khóa = tổng trừ đang hoạt động.
- Không có công thức tính tiền trong module này.

## 4 Đầu vào

`CustomerDraft`: mã, họ tên, điện thoại, email, địa chỉ và IsActive. Tìm kiếm nhận từ khóa và trạng thái tùy chọn. Sửa/xóa/đổi trạng thái nhận ID nội bộ, không dựa vào tên hiển thị.

## 5 Đầu ra

DTO Customer bất biến, danh sách kết quả tìm kiếm và thông báo thành công/lỗi. Popup phát Customer qua EventCallback. Hủy form không tác động dữ liệu; lỗi DAO không làm thay đổi cache BUS.

## 6 Xử lý theo mô hình ba lớp

```text
Admin/Components/Pages/Customers.razor và Components/Customers
    -> ICustomerService / CustomerService trong SmartShop.BUS
    -> ICustomerRepository / DemoCustomerRepository trong SmartShop.DAO
    -> Dữ liệu demo theo phiên
```

Hợp đồng và DTO ở `Database/src/SmartShop.DTO`. BUS nạp danh sách một lần vào ArrayList; tìm kiếm/lọc thực hiện trên ArrayList, không gọi lại DAO khi gõ. BUS kiểm tra đầu vào và mã trùng trước khi gọi DAO. DAO cũng kiểm tra mã duy nhất. Khi thao tác DAO thành công, BUS mới cập nhật ArrayList. Component không viết SQL và không tự tạo DAO.

`User/Program.cs` là composition root đăng ký ICustomerService/ICustomerRepository với lifetime scoped, vì ứng dụng User là máy chủ Blazor nạp thư viện màn hình Admin. Việc đăng ký này không đặt trang quản lý trong giao diện User. Các component, layout và CSS chuyên biệt của module nằm trong Admin.

Đối chiếu hai PDF giảng viên cung cấp: giữ luồng GUI–BUS–DAO, DTO riêng, tìm kiếm ArrayList tại BUS, kiểm tra duy nhất và field bị khóa. Mẫu desktop dùng biến static để trả kết quả tìm kiếm; bản web dùng callback theo phiên để không chia sẻ lựa chọn của các người dùng. Chưa đánh dấu hoàn tất yêu cầu MyConnection/CSDL của toàn đồ án.

## Kiểm tra

29 kiểm tra riêng của Khách hàng và 19 kiểm tra nghiệp vụ/DI trước đó đã qua. Các trường hợp gồm tạo/sửa/xóa, tìm tên không dấu, từ chối mã trùng và mã bị sửa, lọc trạng thái, lỗi lưu, giữ cache khi DAO thất bại và cách ly phiên.

Đã thử trên trình duyệt: form trống, mã trùng kh001/KH001, lưu email trống, hủy sửa, sửa thông tin, khóa/lọc, xem hồ sơ, hủy/xác nhận xóa, popup điền ô khách hàng đã chọn, bố cục Admin riêng và mobile 390 × 844.

## Phần còn chờ tích hợp

- Schema và DAO database thật với MyConnection; ràng buộc UNIQUE ở database do nhóm phối hợp với Vinh.
- Xác thực và phân quyền phía server; cờ IsActive hiện chỉ là trạng thái hồ sơ, chưa khóa được tài khoản đăng nhập thật của Phúc.
- Liên kết khách hàng với đơn/hóa đơn bằng khóa ngoại và quy tắc không xóa khách đã có giao dịch.
- Lưu dữ liệu vĩnh viễn; bản demo không lưu qua các phiên mới.
