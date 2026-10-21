# TÀI LIỆU USER STORIES – MÀN HÌNH QUẢN LÝ KHÁCH HÀNG (BVP SHOP)

## 1. Tổng quan

Màn hình Quản lý khách hàng cho phép quản trị viên theo dõi danh sách khách hàng, tìm kiếm và lọc tài khoản, xem thông tin chi tiết, theo dõi lịch sử mua hàng, cập nhật hồ sơ và khóa hoặc mở khóa tài khoản.

**Actor:** Admin (Quản trị viên).

**Nguồn dữ liệu hiện tại:** Mảng dữ liệu mẫu `initialCustomers` được khai báo trực tiếp trong source code.

## 2. Danh sách User Stories

### US01 – Xem danh sách khách hàng

**Là** quản trị viên, **tôi muốn** xem danh sách khách hàng đã đăng ký, **để** quản lý và theo dõi thông tin khách hàng.

**Tiêu chí chấp nhận:**

- Hệ thống hiển thị danh sách khách hàng với mã khách hàng, họ tên, email, số điện thoại và ngày đăng ký.
- Hiển thị số đơn hàng, tổng chi tiêu thành công và trạng thái tài khoản.
- Trên màn hình lớn, khách hàng được trình bày theo dạng bảng.
- Trên màn hình nhỏ, khách hàng được trình bày theo dạng thẻ.
- Nếu không có khách hàng phù hợp, hệ thống hiển thị thông báo không tìm thấy khách hàng.

### US02 – Xem thống kê khách hàng

**Là** quản trị viên, **tôi muốn** xem các số liệu tổng quan về khách hàng, **để** nắm bắt tình hình tài khoản và hoạt động mua hàng.

**Tiêu chí chấp nhận:**

- Hiển thị tổng số khách hàng.
- Hiển thị số khách hàng mới có ngày đăng ký trong tháng 09/2025.
- Hiển thị số khách hàng có ít nhất một đơn hàng hoàn thành.
- Hiển thị số tài khoản đang bị khóa.
- Các số liệu được tính toán từ danh sách `customers` hiện tại.

### US03 – Tìm kiếm khách hàng

**Là** quản trị viên, **tôi muốn** tìm kiếm khách hàng theo mã, tên, email hoặc số điện thoại, **để** nhanh chóng xác định tài khoản cần quản lý.

**Tiêu chí chấp nhận:**

- Có ô nhập từ khóa tìm kiếm.
- Hệ thống tìm kiếm trên các trường mã khách hàng, họ tên, email và số điện thoại.
- Từ khóa được chuyển về chữ thường để so sánh không phân biệt chữ hoa, chữ thường.
- Kết quả được cập nhật khi người dùng thay đổi nội dung nhập.
- Khi tìm kiếm, hệ thống đưa trang hiện tại về trang 1.

### US04 – Lọc khách hàng theo trạng thái

**Là** quản trị viên, **tôi muốn** lọc khách hàng theo trạng thái, **để** dễ dàng theo dõi từng nhóm tài khoản.

**Tiêu chí chấp nhận:**

- Có bộ lọc trạng thái với các lựa chọn:
  - Tất cả trạng thái.
  - Hoạt động.
  - Chưa mua hàng.
  - Đã khóa.
- Khi chọn một trạng thái, danh sách được cập nhật tương ứng.
- Trạng thái “Chưa mua hàng” được xác định bằng điều kiện `customer.orders.length === 0`.
- Bộ lọc có thể kết hợp với từ khóa tìm kiếm.
- Sau khi thay đổi bộ lọc, hệ thống quay về trang 1.

### US05 – Phân trang danh sách khách hàng

**Là** quản trị viên, **tôi muốn** chuyển đổi giữa các trang danh sách khách hàng, **để** theo dõi dữ liệu thuận tiện hơn.

**Tiêu chí chấp nhận:**

- Mỗi trang hiển thị tối đa 5 khách hàng.
- Hiển thị số lượng kết quả và thông tin phạm vi khách hàng đang xem.
- Có nút chuyển đến trang trước và trang sau.
- Không cho phép chuyển về trước trang 1 hoặc vượt quá trang cuối.
- Khi tìm kiếm hoặc lọc trạng thái, hệ thống đưa trang về trang 1.

### US06 – Xem chi tiết khách hàng

**Là** quản trị viên, **tôi muốn** xem hồ sơ chi tiết của một khách hàng, **để** kiểm tra thông tin cá nhân và hoạt động mua sắm.

**Tiêu chí chấp nhận:**

- Nhấn “Chi tiết” hoặc thẻ khách hàng để mở màn hình chi tiết.
- Hiển thị mã khách hàng, họ tên, email và trạng thái.
- Hiển thị số điện thoại, ngày đăng ký và địa chỉ giao hàng.
- Hiển thị tổng số đơn hàng, chi tiêu thành công và số đơn hoàn thành.
- Hiển thị lịch sử tài khoản và lịch sử mua hàng.
- Có nút quay lại danh sách khách hàng.

### US07 – Xem lịch sử mua hàng

**Là** quản trị viên, **tôi muốn** xem các đơn hàng của khách hàng, **để** theo dõi lịch sử giao dịch và tình trạng đơn hàng.

**Tiêu chí chấp nhận:**

- Hiển thị mã đơn hàng, ngày đặt, phương thức thanh toán, tổng tiền và trạng thái.
- Các trạng thái đơn hàng được thể hiện bằng nhãn trực quan.
- Nếu khách hàng chưa có đơn hàng, hệ thống hiển thị thông báo phù hợp.
- Chi tiêu thành công chỉ cộng các đơn hàng có trạng thái “Hoàn thành”.

### US08 – Chỉnh sửa hồ sơ khách hàng

**Là** quản trị viên, **tôi muốn** chỉnh sửa họ tên và số điện thoại của khách hàng, **để** cập nhật thông tin liên hệ khi cần thiết.

**Tiêu chí chấp nhận:**

- Nhấn “Sửa hồ sơ” để mở hộp thoại chỉnh sửa.
- Họ tên và số điện thoại được điền sẵn theo dữ liệu hiện tại.
- Không cho phép lưu nếu họ tên hoặc số điện thoại chỉ chứa khoảng trắng hoặc không được nhập.
- Khi lưu thành công, hệ thống cập nhật thông tin khách hàng trong state `customers`.
- Hiển thị thông báo cập nhật thành công.
- Có thể hủy thao tác chỉnh sửa mà không lưu thay đổi.

### US09 – Khóa tài khoản khách hàng

**Là** quản trị viên, **tôi muốn** khóa tài khoản khách hàng và ghi nhận lý do, **để** quản lý những tài khoản cần hạn chế hoạt động.

**Tiêu chí chấp nhận:**

- Nhấn “Khóa tài khoản” để mở hộp thoại xác nhận.
- Hệ thống yêu cầu nhập lý do trước khi xác nhận.
- Không cho phép xác nhận nếu lý do bị bỏ trống hoặc chỉ chứa khoảng trắng.
- Khi xác nhận, trạng thái khách hàng chuyển thành “Đã khóa”.
- Lý do và sự kiện khóa được thêm vào đầu danh sách lịch sử tài khoản.
- Hiển thị thông báo kết quả cập nhật.

### US10 – Mở khóa tài khoản khách hàng

**Là** quản trị viên, **tôi muốn** mở khóa tài khoản đã bị khóa, **để** khôi phục trạng thái hoạt động khi phù hợp.

**Tiêu chí chấp nhận:**

- Với tài khoản đã khóa, hệ thống hiển thị nút “Mở khóa”.
- Khi nhấn nút, hệ thống mở hộp thoại yêu cầu lý do.
- Không cho phép xác nhận nếu lý do chưa được nhập hợp lệ.
- Khi xác nhận, trạng thái khách hàng chuyển thành “Hoạt động”.
- Lịch sử tài khoản được bổ sung sự kiện mở khóa và lý do.
- Lịch sử đơn hàng được giữ nguyên.

### US11 – Theo dõi lịch sử tài khoản

**Là** quản trị viên, **tôi muốn** xem các sự kiện liên quan đến tài khoản khách hàng, **để** theo dõi quá trình tạo và thay đổi trạng thái tài khoản.

**Tiêu chí chấp nhận:**

- Hiển thị lịch sử tài khoản có sẵn trong dữ liệu mẫu.
- Khi khóa hoặc mở khóa tài khoản, sự kiện mới được thêm vào đầu danh sách.
- Nội dung sự kiện ghi nhận loại thao tác, ngày được gán trong source code và lý do thay đổi.

### US12 – Truy cập các chức năng quản trị

**Là** quản trị viên, **tôi muốn** điều hướng giữa các chức năng quản lý trong hệ thống, **để** thực hiện công việc quản trị thuận tiện.

**Tiêu chí chấp nhận:**

- Sidebar hiển thị các mục Tổng quan, Quản lý đơn hàng, Quản lý sản phẩm, Quản lý danh mục, Tồn kho, Nhập xuất kho và Quản lý khách hàng.
- Các mục được cấu hình điều hướng đến route tương ứng.
- Mục Quản lý khách hàng được đánh dấu là mục hiện tại.
- Nhấn logo BVP Shop sẽ điều hướng đến `/main_Admin`.

### US13 – Ghi nhận yêu cầu hỗ trợ khách hàng

**Là** quản trị viên, **tôi muốn** thao tác ghi nhận yêu cầu hỗ trợ khách hàng, **để** thuận tiện cho việc theo dõi và chăm sóc khách hàng.

**Tiêu chí chấp nhận:**

- Màn hình chi tiết hiển thị khu vực Hỗ trợ khách hàng.
- Khi nhấn “Ghi nhận”, hệ thống hiển thị thông báo chức năng chưa khả dụng do cần kết nối Backend.

**Lưu ý:** Đây mới là thông báo placeholder, chưa có chức năng tạo hoặc lưu yêu cầu hỗ trợ.

### US14 – Đăng xuất khỏi hệ thống quản trị

**Là** quản trị viên, **tôi muốn** chọn chức năng đăng xuất, **để** kết thúc phiên làm việc quản trị.

**Tiêu chí chấp nhận:**

- Sidebar hiển thị mục “Đăng xuất”.
- Khi nhấn, hệ thống hiển thị thông báo yêu cầu kết nối chức năng đăng xuất với hệ thống.

**Lưu ý:** Chức năng đăng xuất thực tế chưa được triển khai trong source code này.

## 3. Các ràng buộc và giới hạn của phiên bản hiện tại

- Dữ liệu khách hàng và đơn hàng được khai báo bằng `initialCustomers`, chưa lấy từ Backend hoặc SQL Server.
- Các thao tác sửa hồ sơ, khóa và mở khóa chỉ cập nhật state trong phiên sử dụng hiện tại; chưa có lưu trữ lâu dài.
- Ngày ghi nhận thao tác khóa/mở khóa đang được gán cố định là `13/10/2026` trong source code.
- Thống kê khách hàng mới đang cố định theo tháng 09/2025, không tự động chuyển sang tháng hiện tại.
- Trạng thái “Hoạt động” trong huy hiệu danh sách được suy ra từ trạng thái tài khoản và số đơn hàng: khách hàng chưa có đơn được hiển thị là “Chưa mua hàng”, kể cả khi tài khoản không bị khóa.
- Chức năng ghi nhận hỗ trợ và đăng xuất mới hiển thị thông báo, chưa thực hiện nghiệp vụ thực tế.

## 4. Kết luận

Màn hình Quản lý khách hàng đã có các chức năng giao diện và xử lý state phía ứng dụng cho việc xem danh sách, tìm kiếm, lọc, phân trang, xem chi tiết, chỉnh sửa thông tin liên hệ, khóa và mở khóa tài khoản.

Để hoàn thiện hệ thống, cần tích hợp Backend và cơ sở dữ liệu nhằm lưu trữ thay đổi lâu dài, lấy dữ liệu khách hàng thực tế, xác thực quyền quản trị và triển khai đầy đủ các chức năng hỗ trợ khách hàng, đăng xuất.
