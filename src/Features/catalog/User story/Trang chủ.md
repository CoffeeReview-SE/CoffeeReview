# TÀI LIỆU USER STORIES – MÀN HÌNH TRANG CHỦ (HOME) BVP SHOP

## 1. Tổng quan

Màn hình Trang chủ (Home) của BVP Shop cho phép khách hàng xem các sản phẩm đang kinh doanh, tìm kiếm sản phẩm theo tên, lọc sản phẩm theo danh mục, xem thông tin sản phẩm, thêm sản phẩm vào giỏ hàng và điều hướng đến các màn hình chức năng khác.

Giao diện được thiết kế để hiển thị trên cả điện thoại và laptop, tự động thay đổi bố cục dựa trên chiều rộng màn hình.

## 2. Danh sách User Stories

### US01 – Xem giao diện trang chủ

**Là** khách hàng,  
**Tôi muốn** xem giao diện trang chủ của BVP Shop,  
**Để** dễ dàng tiếp cận các sản phẩm và chức năng mua sắm.

**Tiêu chí chấp nhận (Acceptance Criteria):**

- Hiển thị logo và tên cửa hàng BVP Shop.
- Hiển thị banner giới thiệu và nút “Mua ngay”.
- Hiển thị khu vực danh mục sản phẩm.
- Hiển thị danh sách sản phẩm nổi bật.
- Giao diện tự động chuyển đổi giữa bố cục điện thoại và laptop dựa trên chiều rộng màn hình.

### US02 – Tìm kiếm sản phẩm theo từ khóa

**Là** khách hàng,  
**Tôi muốn** nhập từ khóa vào thanh tìm kiếm,  
**Để** nhanh chóng tìm được sản phẩm mà mình quan tâm.

**Tiêu chí chấp nhận:**

- Hiển thị ô nhập từ khóa tìm kiếm.
- Cho phép khách hàng nhập và chỉnh sửa từ khóa.
- Danh sách sản phẩm được lọc theo tên sản phẩm khi từ khóa thay đổi.
- Việc tìm kiếm không phân biệt chữ hoa và chữ thường.
- Khi không có sản phẩm phù hợp, hệ thống hiển thị thông báo không tìm thấy sản phẩm.
- Cho phép xóa từ khóa và bỏ bộ lọc để hiển thị lại danh sách sản phẩm.

### US03 – Lọc sản phẩm theo danh mục

**Là** khách hàng,  
**Tôi muốn** lựa chọn danh mục sản phẩm,  
**Để** xem những sản phẩm thuộc danh mục mà mình quan tâm.

**Tiêu chí chấp nhận:**

- Hiển thị danh mục thông qua thành phần ProductCategoryPicker.
- Cho phép chọn danh mục sản phẩm.
- Danh sách sản phẩm chỉ hiển thị những sản phẩm thuộc danh mục đã chọn.
- Có thể kết hợp lọc danh mục với tìm kiếm từ khóa.
- Có thể bỏ bộ lọc danh mục thông qua chức năng xóa tìm kiếm và bộ lọc.

### US04 – Xem danh sách sản phẩm nổi bật

**Là** khách hàng,  
**Tôi muốn** xem danh sách sản phẩm nổi bật trên trang chủ,  
**Để** tham khảo sản phẩm và giá bán trước khi mua hàng.

**Tiêu chí chấp nhận:**

- Hiển thị tên sản phẩm.
- Hiển thị biểu tượng đại diện theo danh mục hoặc tên sản phẩm.
- Hiển thị giá bán được định dạng theo đơn vị tiền Việt Nam.
- Hiển thị số lượng tồn kho hoặc trạng thái hết hàng.
- Chỉ hiển thị sản phẩm có giá lớn hơn 0.
- Khi nhấn vào một sản phẩm, hệ thống chuyển đến trang chi tiết sản phẩm tương ứng.

### US05 – Xem tất cả sản phẩm

**Là** khách hàng,  
**Tôi muốn** nhấn vào nút “Xem tất cả”,  
**Để** chuyển đến màn hình danh sách sản phẩm và tiếp tục khám phá sản phẩm.

**Tiêu chí chấp nhận:**

- Hiển thị nút “Xem tất cả” trong khu vực sản phẩm nổi bật.
- Khi nhấn nút, hệ thống điều hướng đến màn hình `/products`.

### US06 – Thêm sản phẩm vào giỏ hàng

**Là** khách hàng,  
**Tôi muốn** thêm sản phẩm vào giỏ hàng ngay từ trang chủ,  
**Để** thuận tiện chuẩn bị các sản phẩm cần mua.

**Tiêu chí chấp nhận:**

- Mỗi thẻ sản phẩm có nút “Thêm vào giỏ”.
- Khi nhấn nút, hệ thống gọi chức năng thêm sản phẩm vào giỏ hàng.
- Sau khi thêm, hệ thống hiển thị thông báo “Đã thêm vào giỏ hàng”.
- Thông báo có thể được đóng bằng cách nhấn vào thông báo.
- Biểu tượng giỏ hàng hiển thị số lượng sản phẩm theo dữ liệu từ Cart Context.

### US07 – Truy cập giỏ hàng

**Là** khách hàng,  
**Tôi muốn** mở màn hình giỏ hàng từ trang chủ,  
**Để** xem các sản phẩm đã thêm vào giỏ hàng.

**Tiêu chí chấp nhận:**

- Hiển thị biểu tượng giỏ hàng trên giao diện.
- Hiển thị số lượng sản phẩm trên biểu tượng khi giỏ hàng có sản phẩm.
- Khi nhấn biểu tượng giỏ hàng, hệ thống điều hướng đến màn hình `/cart`.

### US08 – Xem đơn hàng

**Là** khách hàng,  
**Tôi muốn** truy cập màn hình đơn hàng từ trang chủ,  
**Để** tiếp tục theo dõi và quản lý các đơn hàng của mình.

**Tiêu chí chấp nhận:**

- Hiển thị biểu tượng và nhãn “Đơn hàng”.
- Khi nhấn vào chức năng này, hệ thống điều hướng đến màn hình `/orders`.

### US09 – Truy cập tài khoản

**Là** khách hàng,  
**Tôi muốn** mở màn hình tài khoản từ trang chủ,  
**Để** truy cập các chức năng liên quan đến tài khoản cá nhân.

**Tiêu chí chấp nhận:**

- Hiển thị biểu tượng và nhãn “Tài khoản”.
- Khi nhấn vào chức năng này, hệ thống điều hướng đến màn hình `/account`.

### US10 – Thay đổi ngôn ngữ giao diện

**Là** khách hàng,  
**Tôi muốn** lựa chọn ngôn ngữ hiển thị,  
**Để** sử dụng cửa hàng thuận tiện hơn.

**Tiêu chí chấp nhận:**

- Hiển thị thành phần LanguageSelector trên trang chủ.
- Cho phép khách hàng thao tác lựa chọn ngôn ngữ theo chức năng được triển khai trong thành phần.
- Nội dung trang chủ sử dụng hàm dịch `t()` và ngôn ngữ hiện tại từ Language Context.
- Danh sách sản phẩm được tải với thông tin ngôn ngữ hiện tại.

### US11 – Sử dụng chức năng tư vấn AI

**Là** khách hàng,  
**Tôi muốn** mở tiện ích tư vấn AI từ trang chủ,  
**Để** tiếp cận chức năng hỗ trợ tư vấn trong quá trình mua sắm.

**Tiêu chí chấp nhận:**

- Hiển thị tiện ích AiConsultationWidget trên trang chủ.
- Khi nhấn tiện ích, hệ thống điều hướng đến màn hình `/chat`.

### US12 – Xử lý lỗi tải sản phẩm

**Là** khách hàng,  
**Tôi muốn** nhận được thông báo khi hệ thống không tải được sản phẩm,  
**Để** biết rằng dữ liệu sản phẩm chưa thể hiển thị và có thể kiểm tra kết nối.

**Tiêu chí chấp nhận:**

- Khi có lỗi tải sản phẩm và danh sách sản phẩm rỗng, hệ thống hiển thị thông báo lỗi.
- Nội dung thông báo hướng dẫn khách hàng kiểm tra kết nối máy chủ.
- Khi không có sản phẩm phù hợp với điều kiện tìm kiếm hoặc lọc, hệ thống hiển thị trạng thái trống và nút xóa tìm kiếm.

## 3. Ghi chú triển khai

- Các User Stories trên được xây dựng dựa trên source code của màn hình Home.
- Chức năng tìm kiếm hiện lọc theo tên sản phẩm ở phía giao diện, không phải tìm kiếm trên máy chủ.
- Bộ lọc danh mục và từ khóa có thể hoạt động đồng thời.
- Nút “Mua ngay” hiện mới hiển thị giao diện, chưa có xử lý điều hướng được thể hiện trong source code.
- Nút tìm kiếm hiện chưa có xử lý riêng khi nhấn; việc lọc sản phẩm được thực hiện thông qua `onChangeText`.
- Source code sử dụng biểu tượng đại diện sản phẩm thay vì hiển thị ảnh riêng của từng sản phẩm.
- Chức năng tư vấn AI được gọi thông qua màn hình `/chat`; chi tiết hoạt động nằm trong thành phần và màn hình tương ứng.
