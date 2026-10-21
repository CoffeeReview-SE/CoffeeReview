# TÀI LIỆU USER STORIES – QUẢN LÝ SẢN PHẨM VÀ DANH MỤC (BVP SHOP)

## 1. Tổng quan

Tài liệu này mô tả các User Stories cho chức năng Quản lý sản phẩm và Quản lý danh mục trong hệ thống BVP Shop. Chức năng cho phép Admin theo dõi thông tin sản phẩm, tìm kiếm, lọc trạng thái, thêm mới, chỉnh sửa và ngừng bán sản phẩm; đồng thời quản lý danh mục thông qua các thao tác thêm, chỉnh sửa, tìm kiếm và ẩn danh mục.

## 2. Tác nhân

- **Admin:** Người quản trị cửa hàng, có quyền quản lý thông tin sản phẩm và danh mục.
- **Hệ thống:** Tiếp nhận yêu cầu, kiểm tra dữ liệu, thực hiện thao tác thông qua các hàm API và cập nhật lại danh sách.

## 3. Danh sách User Stories

### US01 – Xem danh sách sản phẩm

**Là** Admin,  
**Tôi muốn** xem danh sách sản phẩm của cửa hàng,  
**Để** theo dõi thông tin và tình trạng kinh doanh của từng sản phẩm.

**Tiêu chí chấp nhận:**

- Hiển thị tên sản phẩm, mã sản phẩm, danh mục, giá bán, số lượng tồn kho và trạng thái.
- Hiển thị tổng số sản phẩm.
- Hiển thị số sản phẩm đang bán và số sản phẩm hết hàng.
- Cho phép Admin chuyển sang chức năng quản lý danh mục.
- Hiển thị thông báo khi không tìm thấy sản phẩm phù hợp.

### US02 – Tìm kiếm sản phẩm

**Là** Admin,  
**Tôi muốn** tìm kiếm sản phẩm theo tên hoặc mã sản phẩm,  
**Để** nhanh chóng tìm được sản phẩm cần quản lý.

**Tiêu chí chấp nhận:**

- Có ô nhập từ khóa tìm kiếm.
- Kết quả được lọc theo mã sản phẩm, tên sản phẩm hoặc tên danh mục.
- Không phân biệt chữ hoa và chữ thường.
- Tự động cập nhật danh sách khi từ khóa thay đổi.
- Hiển thị thông báo nếu không có sản phẩm phù hợp.

### US03 – Lọc sản phẩm theo trạng thái

**Là** Admin,  
**Tôi muốn** lọc sản phẩm theo trạng thái đang bán hoặc hết hàng,  
**Để** dễ dàng kiểm tra tình hình kinh doanh của cửa hàng.

**Tiêu chí chấp nhận:**

- Có các lựa chọn: Tất cả trạng thái, Đang bán và Hết hàng.
- Khi chọn một trạng thái, danh sách chỉ hiển thị sản phẩm tương ứng.
- Có thể quay lại trạng thái Tất cả trạng thái để xem toàn bộ sản phẩm.
- Có thể kết hợp tìm kiếm từ khóa với lọc trạng thái.

### US04 – Thêm sản phẩm mới

**Là** Admin,  
**Tôi muốn** thêm sản phẩm mới vào hệ thống,  
**Để** cập nhật các mặt hàng mà cửa hàng kinh doanh.

**Tiêu chí chấp nhận:**

- Có nút Thêm sản phẩm để mở biểu mẫu.
- Biểu mẫu gồm tên sản phẩm, danh mục, giá bán và tồn kho.
- Không cho phép lưu khi thiếu tên, danh mục, giá hoặc khi tồn kho không hợp lệ.
- Khi dữ liệu hợp lệ, hệ thống gọi chức năng tạo sản phẩm.
- Sau khi lưu thành công, tải lại danh sách sản phẩm và đóng biểu mẫu.
- Nếu lưu thất bại, hiển thị thông báo lỗi.

### US05 – Chỉnh sửa thông tin sản phẩm

**Là** Admin,  
**Tôi muốn** chỉnh sửa thông tin của một sản phẩm,  
**Để** cập nhật thông tin khi giá bán, tên, danh mục hoặc số lượng tồn kho thay đổi.

**Tiêu chí chấp nhận:**

- Có nút chỉnh sửa tại từng sản phẩm.
- Biểu mẫu hiển thị sẵn thông tin hiện tại của sản phẩm.
- Admin có thể thay đổi tên, danh mục, giá bán và tồn kho.
- Hệ thống kiểm tra dữ liệu trước khi lưu.
- Khi cập nhật thành công, danh sách sản phẩm được tải lại.
- Khi cập nhật thất bại, hiển thị thông báo lỗi.

### US06 – Ngừng bán sản phẩm

**Là** Admin,  
**Tôi muốn** ngừng bán một sản phẩm,  
**Để** quản lý những mặt hàng không còn được kinh doanh.

**Tiêu chí chấp nhận:**

- Có nút ngừng bán tại mỗi sản phẩm.
- Hệ thống hiển thị hộp thoại xác nhận trước khi thực hiện.
- Admin có thể chọn Hủy để không thực hiện thao tác.
- Nếu xác nhận, hệ thống gọi chức năng ngừng bán sản phẩm.
- Sau khi thao tác thành công, tải lại danh sách sản phẩm.
- Nếu thao tác thất bại, hiển thị thông báo lỗi.

### US07 – Xem danh sách danh mục

**Là** Admin,  
**Tôi muốn** xem danh sách danh mục sản phẩm,  
**Để** theo dõi cách phân loại hàng hóa của cửa hàng.

**Tiêu chí chấp nhận:**

- Có tab Danh mục để chuyển sang giao diện quản lý danh mục.
- Hiển thị tên danh mục, mã danh mục, mô tả và số lượng sản phẩm thuộc danh mục.
- Hiển thị tổng số danh mục thông qua số lượng trên tab.
- Có các thao tác chỉnh sửa và ẩn danh mục.
- Hiển thị thông báo lỗi nếu không tải được dữ liệu danh mục.

### US08 – Tìm kiếm danh mục

**Là** Admin,  
**Tôi muốn** tìm kiếm danh mục theo mã, tên hoặc mô tả,  
**Để** nhanh chóng xác định danh mục cần chỉnh sửa.

**Tiêu chí chấp nhận:**

- Có ô nhập từ khóa tìm kiếm danh mục.
- Kết quả được lọc theo mã, tên hoặc mô tả danh mục.
- Không phân biệt chữ hoa và chữ thường.
- Danh sách tự cập nhật theo từ khóa được nhập.

### US09 – Thêm danh mục mới

**Là** Admin,  
**Tôi muốn** thêm danh mục mới,  
**Để** phân loại các sản phẩm theo nhóm phù hợp.

**Tiêu chí chấp nhận:**

- Có nút Thêm danh mục để mở biểu mẫu.
- Biểu mẫu gồm tên danh mục và mô tả.
- Không cho phép lưu nếu thiếu tên hoặc mô tả.
- Khi dữ liệu hợp lệ, hệ thống gọi chức năng lưu danh mục mới.
- Sau khi lưu thành công, tải lại danh sách danh mục và đóng biểu mẫu.
- Nếu lưu thất bại, hiển thị thông báo lỗi.

### US10 – Chỉnh sửa danh mục

**Là** Admin,  
**Tôi muốn** chỉnh sửa tên và mô tả danh mục,  
**Để** cập nhật thông tin phân loại hàng hóa.

**Tiêu chí chấp nhận:**

- Có nút chỉnh sửa tại mỗi danh mục.
- Biểu mẫu hiển thị tên và mô tả hiện tại.
- Admin có thể thay đổi các thông tin này.
- Hệ thống kiểm tra dữ liệu trước khi lưu.
- Sau khi cập nhật thành công, tải lại danh sách danh mục.
- Nếu cập nhật thất bại, hiển thị thông báo lỗi.

### US11 – Ẩn danh mục

**Là** Admin,  
**Tôi muốn** ẩn một danh mục không còn sử dụng,  
**Để** quản lý danh mục gọn gàng và phù hợp với nhu cầu kinh doanh.

**Tiêu chí chấp nhận:**

- Có nút ẩn danh mục tại mỗi danh mục.
- Hệ thống hiển thị hộp thoại xác nhận trước khi thực hiện.
- Admin có thể chọn Hủy để giữ nguyên danh mục.
- Khi xác nhận, hệ thống gọi chức năng ẩn danh mục.
- Sau khi thao tác thành công, tải lại danh sách danh mục.
- Nếu thao tác thất bại, hiển thị thông báo lỗi.

### US12 – Điều hướng trong trang quản trị

**Là** Admin,  
**Tôi muốn** chuyển đổi giữa các chức năng quản trị thông qua thanh điều hướng,  
**Để** truy cập nhanh các khu vực quản lý của cửa hàng.

**Tiêu chí chấp nhận:**

- Thanh điều hướng hiển thị Tổng quan, Quản lý đơn hàng, Quản lý sản phẩm, Quản lý danh mục, Tồn kho, Nhập xuất kho và Quản lý khách hàng.
- Khi chọn một mục, hệ thống điều hướng đến màn hình tương ứng.
- Mục Quản lý sản phẩm hoặc Quản lý danh mục được đánh dấu là đang chọn tùy theo màn hình hiện tại.
- Logo BVP Shop cho phép quay về trang Tổng quan.

### US13 – Xem thông tin tài khoản Admin

**Là** Admin,  
**Tôi muốn** xem thông tin vai trò tài khoản đang sử dụng,  
**Để** xác nhận mình đang thao tác bằng quyền quản trị.

**Tiêu chí chấp nhận:**

- Hiển thị biểu tượng và tên tài khoản Admin.
- Khi nhấn vào khu vực tài khoản, hệ thống hiển thị thông báo xác nhận quyền Admin.

### US14 – Thực hiện thao tác đăng xuất

**Là** Admin,  
**Tôi muốn** đăng xuất khỏi hệ thống,  
**Để** kết thúc phiên làm việc và bảo vệ tài khoản quản trị.

**Tiêu chí chấp nhận:**

- Có mục Đăng xuất trên thanh điều hướng.
- Khi nhấn, hệ thống hiển thị thông báo yêu cầu kết nối chức năng đăng xuất với hệ thống.

**Lưu ý:** Theo source code hiện tại, chức năng đăng xuất thực tế chưa được triển khai; hệ thống chỉ hiển thị thông báo.

## 4. Quy tắc và giới hạn được thể hiện trong source code

- Giá bán và tồn kho của sản phẩm được nhập thông qua biểu mẫu riêng.
- Giá bán và tồn kho được chuyển đổi sang kiểu số trước khi gửi yêu cầu lưu.
- Tên sản phẩm, danh mục, giá bán và tồn kho phải đáp ứng điều kiện kiểm tra trong hàm lưu sản phẩm.
- Tên và mô tả danh mục không được để trống.
- Các thao tác thêm, sửa và xóa/ẩn sử dụng các hàm dịch vụ trong `@/Core/services/admin-api`.
- Danh sách được tải lại sau khi thao tác thành công thông qua các hàm `reloadProducts` và `reloadCategories`.
- Dữ liệu được lấy qua hai custom hook `useAdminProducts` và `useAdminCategories`.
- Giao diện có thông báo khi xảy ra lỗi trong quá trình tải hoặc lưu dữ liệu.

## 5. Những chức năng chưa được xác nhận là đã triển khai

Dựa trên source code được cung cấp, chưa thể xác nhận các chức năng sau đã hoàn thiện:

- Đăng xuất thực sự và kết thúc phiên đăng nhập.
- Phân quyền chi tiết theo từng thao tác quản trị.
- Kiểm tra danh mục có đang được sản phẩm sử dụng trước khi ẩn.
- Phân trang danh sách sản phẩm và danh mục.
- Xác nhận tính hợp lệ của giá bán theo quy tắc nghiệp vụ chi tiết, chẳng hạn giá phải lớn hơn 0.
- Kiểm tra tồn kho là số nguyên và không âm một cách đầy đủ.
- Chọn danh mục từ danh sách có sẵn thay vì nhập tên danh mục bằng văn bản.
- Xác nhận dữ liệu được lưu bền vững trong cơ sở dữ liệu, vì điều đó còn phụ thuộc vào phần triển khai API và backend.

## 6. Kết luận

Các User Stories trên được xây dựng từ những thao tác, trường dữ liệu, điều kiện kiểm tra và lời gọi dịch vụ thể hiện trong source code của chức năng Quản lý sản phẩm và Quản lý danh mục BVP Shop. Chúng có thể được sử dụng làm cơ sở để xây dựng tài liệu yêu cầu phần mềm, thiết kế Use Case Diagram, Activity Diagram và kiểm thử chức năng.
