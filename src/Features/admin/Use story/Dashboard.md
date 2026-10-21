# TÀI LIỆU USER STORIES – MÀN HÌNH TỔNG QUAN ADMIN (BVP SHOP)

## 1. Tổng quan

**Tên chức năng:** Tổng quan Admin (Dashboard)

**Đối tượng sử dụng:** Quản trị viên (Admin).

**Mục đích:** Cung cấp giao diện tổng quan để Admin theo dõi các chỉ số đơn hàng, xem biểu đồ doanh số, thống kê doanh số theo danh mục sản phẩm và điều hướng đến các chức năng quản lý của hệ thống BVP Shop.

**Phạm vi:** Tài liệu được xây dựng dựa trên source code React Native, sử dụng Expo Router để điều hướng và `react-native-svg` để hiển thị biểu đồ.

## 2. Danh sách User Stories

### US01 – Xem trang tổng quan Admin

**Là** một Admin,  
**Tôi muốn** truy cập màn hình Tổng quan,  
**Để** xem nhanh tình hình đơn hàng và doanh số của cửa hàng.

**Tiêu chí chấp nhận:**

- Hiển thị tiêu đề “Tổng quan”.
- Hiển thị mô tả theo dõi và quản lý đơn hàng.
- Hiển thị các thẻ thống kê đơn hàng.
- Hiển thị biểu đồ doanh số theo ngày.
- Hiển thị biểu đồ doanh số theo danh mục.
- Giao diện có thể cuộn dọc để xem toàn bộ nội dung.

### US02 – Xem thống kê tổng đơn hàng

**Là** một Admin,  
**Tôi muốn** xem tổng số đơn hàng và tỷ lệ thay đổi,  
**Để** nắm được tình hình đơn hàng của cửa hàng.

**Tiêu chí chấp nhận:**

- Hiển thị thẻ “Tổng đơn hàng”.
- Hiển thị tổng số đơn hàng mẫu là 128.
- Hiển thị tỷ lệ 12% và mô tả “so với tháng trước”.
- Hiển thị biểu tượng giỏ hàng và biểu đồ đường thu nhỏ.

### US03 – Xem số lượng đơn hàng đang xử lý

**Là** một Admin,  
**Tôi muốn** xem số lượng đơn hàng đang xử lý,  
**Để** theo dõi những đơn hàng chưa hoàn tất xử lý.

**Tiêu chí chấp nhận:**

- Hiển thị thẻ “Đang xử lý”.
- Hiển thị số liệu mẫu là 18.
- Hiển thị tỷ lệ 14% cùng mô tả “tổng đơn”.
- Hiển thị biểu tượng và biểu đồ đường thu nhỏ.

### US04 – Xem số lượng đơn hàng đang giao

**Là** một Admin,  
**Tôi muốn** xem số lượng đơn hàng đang giao,  
**Để** theo dõi tình hình giao hàng của cửa hàng.

**Tiêu chí chấp nhận:**

- Hiển thị thẻ “Đang giao”.
- Hiển thị số liệu mẫu là 42.
- Hiển thị tỷ lệ 33% cùng mô tả “tổng đơn”.
- Hiển thị biểu tượng xe giao hàng và biểu đồ đường thu nhỏ.

### US05 – Xem số lượng đơn hàng đã hoàn thành

**Là** một Admin,  
**Tôi muốn** xem số lượng đơn hàng đã hoàn thành,  
**Để** nắm được số đơn đã hoàn tất.

**Tiêu chí chấp nhận:**

- Hiển thị thẻ “Đã hoàn thành”.
- Hiển thị số liệu mẫu là 68.
- Hiển thị tỷ lệ 53% cùng mô tả “tổng đơn”.
- Hiển thị biểu tượng hoàn thành và biểu đồ đường thu nhỏ.

### US06 – Chọn khoảng thời gian thống kê

**Là** một Admin,  
**Tôi muốn** chọn một khoảng thời gian từ danh sách có sẵn,  
**Để** xác định khoảng thời gian muốn xem trên giao diện tổng quan.

**Tiêu chí chấp nhận:**

- Nhấn nút ngày tháng để mở hộp thoại chọn khoảng thời gian.
- Hiển thị ba lựa chọn:
  - 01/09/2025 – 30/09/2025.
  - 01/10/2025 – 31/10/2025.
  - 01/10/2026 – 12/10/2026.
- Khoảng thời gian đang chọn được đánh dấu bằng màu nền và biểu tượng xác nhận.
- Khi chọn một khoảng thời gian, nút ngày tháng cập nhật nội dung tương ứng.
- Có thể đóng hộp thoại bằng nút “Đóng” hoặc nhấn ra ngoài hộp thoại.

**Lưu ý:** Việc chọn khoảng thời gian hiện chỉ cập nhật trạng thái hiển thị; chưa lọc dữ liệu thống kê hoặc biểu đồ theo ngày đã chọn.

### US07 – Xem biểu đồ doanh số theo ngày

**Là** một Admin,  
**Tôi muốn** xem biểu đồ đường doanh số,  
**Để** quan sát sự thay đổi doanh số qua các mốc thời gian.

**Tiêu chí chấp nhận:**

- Hiển thị biểu đồ đường với các điểm dữ liệu doanh số.
- Hiển thị các đường lưới và nhãn trục tung theo đơn vị triệu đồng.
- Hiển thị nhãn ngày trên trục hoành.
- Hiển thị đường biểu diễn và vùng tô bên dưới đường.
- Hiển thị chú thích “Doanh số”.
- Biểu đồ sử dụng dữ liệu mẫu được khai báo trong `salesData` và `salesLabels`.

### US08 – Chuyển đổi lựa chọn chu kỳ biểu đồ

**Là** một Admin,  
**Tôi muốn** chuyển đổi lựa chọn giữa theo ngày, theo tuần và theo tháng,  
**Để** thao tác lựa chọn chu kỳ thống kê trên giao diện.

**Tiêu chí chấp nhận:**

- Hiển thị lựa chọn mặc định “Theo ngày”.
- Khi nhấn vào lựa chọn, giá trị lần lượt chuyển đổi:
  - Theo ngày → Theo tuần.
  - Theo tuần → Theo tháng.
  - Theo tháng → Theo ngày.
- Giá trị được chọn hiển thị trên giao diện.

**Lưu ý:** Chu kỳ chỉ thay đổi nhãn hiển thị. Dữ liệu và cách vẽ biểu đồ hiện chưa thay đổi theo chu kỳ.

### US09 – Xem biểu đồ doanh số theo danh mục

**Là** một Admin,  
**Tôi muốn** xem tỷ trọng doanh số của từng danh mục sản phẩm,  
**Để** quan sát cơ cấu doanh số giữa các danh mục.

**Tiêu chí chấp nhận:**

- Hiển thị biểu đồ doughnut (vòng tròn khuyết).
- Hiển thị tổng tỷ lệ 100% ở giữa biểu đồ.
- Hiển thị nhãn “Doanh số” ở giữa biểu đồ.
- Các phần của biểu đồ được phân biệt bằng màu sắc.
- Hiển thị chú thích tên danh mục và tỷ lệ tương ứng.

**Các danh mục dữ liệu mẫu:**

- Điện thoại: 35%.
- Laptop: 25%.
- Phụ kiện: 15%.
- Thiết bị game: 10%.
- Đồng hồ: 8%.
- Khác: 7%.

### US10 – Điều hướng về trang Tổng quan

**Là** một Admin,  
**Tôi muốn** nhấn vào logo hoặc mục “Tổng quan” trên thanh điều hướng,  
**Để** quay lại màn hình Dashboard.

**Tiêu chí chấp nhận:**

- Hiển thị logo và thương hiệu BVP Shop trên sidebar.
- Nhấn logo sẽ điều hướng đến `/main_Admin`.
- Mục “Tổng quan” điều hướng đến `/main_Admin`.
- Mục Tổng quan được tô màu để thể hiện trang đang hoạt động.

### US11 – Điều hướng đến Quản lý đơn hàng

**Là** một Admin,  
**Tôi muốn** chọn mục “Quản lý đơn hàng”,  
**Để** truy cập màn hình quản lý đơn hàng.

**Tiêu chí chấp nhận:**

- Hiển thị mục “Quản lý đơn hàng” trên sidebar.
- Khi nhấn, hệ thống điều hướng đến `/order_management`.

### US12 – Điều hướng đến Quản lý sản phẩm

**Là** một Admin,  
**Tôi muốn** chọn mục “Quản lý sản phẩm”,  
**Để** truy cập màn hình quản lý sản phẩm.

**Tiêu chí chấp nhận:**

- Hiển thị mục “Quản lý sản phẩm” trên sidebar.
- Khi nhấn, hệ thống điều hướng đến `/product_management`.

### US13 – Điều hướng đến Quản lý danh mục

**Là** một Admin,  
**Tôi muốn** chọn mục “Quản lý danh mục”,  
**Để** truy cập màn hình quản lý danh mục sản phẩm.

**Tiêu chí chấp nhận:**

- Hiển thị mục “Quản lý danh mục” trên sidebar.
- Khi nhấn, hệ thống điều hướng đến `/category_management`.

### US14 – Điều hướng đến Tồn kho

**Là** một Admin,  
**Tôi muốn** chọn mục “Tồn kho”,  
**Để** truy cập màn hình theo dõi tồn kho.

**Tiêu chí chấp nhận:**

- Hiển thị mục “Tồn kho” trên sidebar.
- Khi nhấn, hệ thống điều hướng đến `/stock_inventory`.

### US15 – Điều hướng đến Nhập xuất kho

**Là** một Admin,  
**Tôi muốn** chọn mục “Nhập xuất kho”,  
**Để** truy cập màn hình quản lý biến động kho.

**Tiêu chí chấp nhận:**

- Hiển thị mục “Nhập xuất kho” trên sidebar.
- Khi nhấn, hệ thống điều hướng đến `/stock_movements`.

### US16 – Điều hướng đến Quản lý khách hàng

**Là** một Admin,  
**Tôi muốn** chọn mục “Quản lý khách hàng”,  
**Để** truy cập màn hình quản lý thông tin khách hàng.

**Tiêu chí chấp nhận:**

- Hiển thị mục “Quản lý khách hàng” trên sidebar.
- Khi nhấn, hệ thống điều hướng đến `/customer_management`.

### US17 – Xem thông tin quyền Admin

**Là** một Admin,  
**Tôi muốn** nhấn vào khu vực tài khoản trên header,  
**Để** xác nhận quyền truy cập hiện tại.

**Tiêu chí chấp nhận:**

- Hiển thị biểu tượng tài khoản.
- Hiển thị tên “Admin” khi màn hình không ở chế độ compact.
- Khi nhấn vào khu vực tài khoản, hiển thị thông báo “Bạn đang đăng nhập với quyền Admin.”

**Lưu ý:** Đây là thông báo giao diện; source code chưa thực hiện truy vấn hoặc xác thực thông tin tài khoản tại thao tác này.

### US18 – Tạo đơn hàng từ Dashboard

**Là** một Admin,  
**Tôi muốn** nhấn nút “Tạo đơn hàng”,  
**Để** bắt đầu quy trình tạo đơn hàng mới.

**Tiêu chí chấp nhận:**

- Hiển thị nút “Tạo đơn hàng”.
- Khi nhấn nút, hiển thị hộp thoại thông báo.
- Hộp thoại thông báo rằng cần kết nối nút với màn hình tạo đơn hàng.

**Lưu ý:** Chức năng tạo đơn hàng chưa được triển khai. Nút hiện chỉ hiển thị thông báo, chưa điều hướng đến màn hình tạo đơn hoặc lưu đơn hàng.

### US19 – Đăng xuất khỏi hệ thống

**Là** một Admin,  
**Tôi muốn** nhấn “Đăng xuất” và xác nhận thao tác,  
**Để** bắt đầu quy trình đăng xuất khỏi hệ thống.

**Tiêu chí chấp nhận:**

- Hiển thị mục “Đăng xuất” trong nhóm “HỆ THỐNG”.
- Khi nhấn, hiển thị hộp thoại xác nhận đăng xuất.
- Có hai lựa chọn “Hủy” và “Đăng xuất”.
- Chọn “Hủy” sẽ đóng hộp thoại.
- Chọn “Đăng xuất” sẽ hiển thị thông báo yêu cầu kết nối chức năng đăng xuất.

**Lưu ý:** Source code chưa xóa phiên đăng nhập, chưa xử lý token và chưa điều hướng về màn hình đăng nhập.

### US20 – Hiển thị Dashboard theo kích thước màn hình

**Là** một Admin,  
**Tôi muốn** giao diện Dashboard tự điều chỉnh theo kích thước màn hình,  
**Để** có thể theo dõi thông tin trên các kích thước màn hình khác nhau.

**Tiêu chí chấp nhận:**

- Sidebar có chiều rộng 220 px khi màn hình rộng không quá 768 px; các màn hình rộng hơn sử dụng 255 px.
- Khi chiều rộng màn hình không quá 600 px, giao diện sử dụng chế độ compact.
- Các thẻ thống kê hiển thị theo một cột ở chế độ compact, hai cột ở chế độ tablet và bốn cột ở chế độ desktop.
- Các biểu đồ xếp theo chiều dọc khi chiều rộng màn hình không quá 1100 px.
- Tên Admin được ẩn trong chế độ compact.
- Khu vực nội dung có thể cuộn để xem đầy đủ các thành phần.

## 3. Quy tắc nghiệp vụ và giới hạn hiện tại

1. **Dữ liệu thống kê:** Các chỉ số đơn hàng, tỷ lệ và dữ liệu biểu đồ đang được khai báo cố định trong source code.
2. **Bộ lọc ngày:** Chỉ cập nhật khoảng thời gian được chọn; chưa lọc dữ liệu.
3. **Chu kỳ biểu đồ:** Chỉ thay đổi nhãn Theo ngày/Theo tuần/Theo tháng; chưa cập nhật dữ liệu.
4. **Tạo đơn hàng:** Chưa có chức năng tạo và lưu đơn hàng thực tế.
5. **Đăng xuất:** Chưa có xử lý đăng xuất thực tế.
6. **Tài khoản Admin:** Thông tin tài khoản đang hiển thị cố định, chưa có thao tác xác thực tại Dashboard.
7. **Điều hướng:** Các đường dẫn sidebar sử dụng Expo Router; việc điều hướng thành công phụ thuộc vào các route tương ứng đã tồn tại trong dự án.

## 4. Tổng kết

Màn hình Tổng quan Admin hiện cung cấp giao diện Dashboard gồm các thẻ thống kê, biểu đồ doanh số theo ngày, biểu đồ tỷ trọng theo danh mục, lựa chọn khoảng thời gian, lựa chọn chu kỳ biểu đồ và thanh điều hướng đến các màn hình quản trị.

Các thao tác lựa chọn ngày và chu kỳ biểu đồ đã có state giao diện, trong khi dữ liệu thống kê vẫn là dữ liệu mẫu. Các chức năng tạo đơn hàng và đăng xuất mới dừng ở mức thông báo, chưa kết nối nghiệp vụ thực tế hoặc backend.
