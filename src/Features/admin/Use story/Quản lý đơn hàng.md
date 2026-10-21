# TÀI LIỆU USER STORIES – MÀN HÌNH QUẢN LÝ ĐƠN HÀNG (BVP SHOP)

## 1. Tổng quan

**Tên chức năng:** Quản lý đơn hàng (Order Management).

**Đối tượng sử dụng:** Quản trị viên (Admin).

**Mục đích:** Cho phép Admin xem danh sách đơn hàng, tìm kiếm, lọc, sắp xếp, chọn nhiều đơn hàng, xem thông tin chi tiết và cập nhật trạng thái đơn hàng.

**Phạm vi:** Tài liệu được xây dựng dựa trên source code React Native, sử dụng Expo Router để điều hướng, `useState` để quản lý trạng thái giao diện và `useMemo` để xử lý danh sách đơn hàng sau khi tìm kiếm, lọc và sắp xếp.

## 2. Danh sách User Stories

### US01 – Xem danh sách đơn hàng

**Là** một Admin,  
**Tôi muốn** xem danh sách các đơn hàng trên hệ thống,  
**Để** theo dõi thông tin và tình trạng xử lý của từng đơn hàng.

**Tiêu chí chấp nhận:**

- Hiển thị tiêu đề “Quản lý đơn hàng” và mô tả chức năng.
- Hiển thị danh sách đơn hàng dưới dạng bảng.
- Mỗi hàng hiển thị mã đơn hàng, hình ảnh minh họa, tên khách hàng, số điện thoại, tổng tiền, trạng thái, phương thức thanh toán và thời gian đặt.
- Hiển thị nút thao tác để xem thông tin đơn hàng.
- Hiển thị thông báo “Không tìm thấy đơn hàng phù hợp.” khi danh sách không có kết quả.
- Bảng có thể cuộn ngang khi chiều rộng màn hình không đủ để hiển thị toàn bộ các cột.

### US02 – Tìm kiếm đơn hàng

**Là** một Admin,  
**Tôi muốn** tìm kiếm đơn hàng theo mã đơn hàng, tên khách hàng hoặc số điện thoại,  
**Để** nhanh chóng tìm được đơn hàng cần quản lý.

**Tiêu chí chấp nhận:**

- Hiển thị ô tìm kiếm với nội dung gợi ý “Tìm mã đơn, tên khách hàng, SDT...”.
- Cho phép nhập từ khóa tìm kiếm.
- Tìm kiếm theo mã đơn hàng, tên khách hàng hoặc số điện thoại.
- Không phân biệt chữ hoa và chữ thường.
- Tự động cập nhật danh sách kết quả khi từ khóa thay đổi.
- Bỏ qua khoảng trắng ở đầu và cuối từ khóa.
- Nếu không có kết quả phù hợp, hiển thị thông báo tương ứng.

### US03 – Lọc đơn hàng theo trạng thái

**Là** một Admin,  
**Tôi muốn** lọc đơn hàng theo trạng thái,  
**Để** theo dõi các đơn hàng thuộc từng giai đoạn xử lý.

**Tiêu chí chấp nhận:**

- Hiển thị bộ lọc trạng thái đơn hàng.
- Cung cấp các lựa chọn:
  - Tất cả trạng thái.
  - Đang xử lý.
  - Đang giao.
  - Hoàn thành.
  - Đã hủy.
- Khi chọn trạng thái, danh sách chỉ hiển thị những đơn hàng phù hợp.
- Khi chọn “Tất cả trạng thái”, hiển thị các đơn hàng không bị loại bởi những điều kiện lọc khác.
- Trạng thái đang chọn được thể hiện trên bộ lọc.

### US04 – Lọc đơn hàng theo phương thức thanh toán

**Là** một Admin,  
**Tôi muốn** lọc đơn hàng theo phương thức thanh toán,  
**Để** theo dõi các đơn hàng sử dụng từng hình thức thanh toán.

**Tiêu chí chấp nhận:**

- Hiển thị bộ lọc phương thức thanh toán.
- Cung cấp các lựa chọn:
  - Tất cả phương thức thanh toán.
  - COD.
  - Chuyển khoản.
- Khi chọn một phương thức, danh sách chỉ hiển thị các đơn hàng sử dụng phương thức đó.
- Khi chọn “Tất cả phương thức thanh toán”, không giới hạn danh sách theo phương thức thanh toán.

### US05 – Sắp xếp đơn hàng theo thời gian đặt

**Là** một Admin,  
**Tôi muốn** sắp xếp danh sách đơn hàng theo thời gian đặt,  
**Để** dễ dàng theo dõi đơn hàng mới nhất hoặc cũ nhất.

**Tiêu chí chấp nhận:**

- Hiển thị bộ lọc sắp xếp thời gian.
- Cung cấp hai lựa chọn:
  - Mới nhất.
  - Cũ nhất.
- Khi chọn “Mới nhất”, đơn hàng có thời gian đặt gần nhất được hiển thị trước.
- Khi chọn “Cũ nhất”, đơn hàng có thời gian đặt xa nhất được hiển thị trước.
- Danh sách được sắp xếp lại khi lựa chọn thay đổi.

### US06 – Kết hợp tìm kiếm, lọc và sắp xếp

**Là** một Admin,  
**Tôi muốn** kết hợp từ khóa tìm kiếm với trạng thái, phương thức thanh toán và thứ tự thời gian,  
**Để** tìm chính xác các đơn hàng cần xử lý.

**Tiêu chí chấp nhận:**

- Cho phép sử dụng đồng thời ô tìm kiếm và các bộ lọc.
- Kết quả phải thỏa mãn từ khóa tìm kiếm, trạng thái và phương thức thanh toán đã chọn.
- Danh sách kết quả được sắp xếp theo thứ tự thời gian đã chọn.
- Số lượng đơn hàng được cập nhật tương ứng với kết quả sau khi áp dụng các điều kiện.

### US07 – Xem tổng số đơn hàng sau lọc

**Là** một Admin,  
**Tôi muốn** xem số lượng đơn hàng phù hợp với điều kiện tìm kiếm hiện tại,  
**Để** biết có bao nhiêu đơn hàng trong danh sách kết quả.

**Tiêu chí chấp nhận:**

- Hiển thị dòng “Tổng số: ... đơn hàng”.
- Số lượng được tính theo danh sách sau khi tìm kiếm và lọc.
- Số lượng thay đổi khi từ khóa hoặc bộ lọc thay đổi.
- Khi không có kết quả, tổng số hiển thị là 0.

### US08 – Chọn một đơn hàng

**Là** một Admin,  
**Tôi muốn** chọn hoặc bỏ chọn một đơn hàng bằng checkbox,  
**Để** đánh dấu các đơn hàng cần theo dõi.

**Tiêu chí chấp nhận:**

- Mỗi đơn hàng có một checkbox.
- Nhấn checkbox để chọn đơn hàng.
- Nhấn lại checkbox để bỏ chọn đơn hàng.
- Đơn hàng được chọn có màu nền khác biệt.
- Số lượng đơn hàng đã chọn được cập nhật trên giao diện.

### US09 – Chọn tất cả đơn hàng đang hiển thị

**Là** một Admin,  
**Tôi muốn** chọn hoặc bỏ chọn tất cả đơn hàng đang hiển thị,  
**Để** đánh dấu nhiều đơn hàng nhanh chóng.

**Tiêu chí chấp nhận:**

- Hiển thị checkbox ở phần tiêu đề bảng.
- Khi nhấn checkbox và chưa chọn hết các đơn hàng đang hiển thị, hệ thống chọn tất cả đơn hàng trong danh sách kết quả hiện tại.
- Khi tất cả đơn hàng đang hiển thị đã được chọn, nhấn checkbox sẽ bỏ chọn các đơn hàng đó.
- Những đơn hàng đã chọn nhưng không thuộc danh sách đang hiển thị được giữ nguyên lựa chọn.
- Không thực hiện thao tác chọn tất cả nếu danh sách kết quả rỗng.

**Lưu ý:** Chức năng chọn nhiều đơn hàng hiện chỉ phục vụ việc đánh dấu trên giao diện; chưa có thao tác hàng loạt như hủy hoặc cập nhật trạng thái nhiều đơn cùng lúc.

### US10 – Xem thông tin chi tiết đơn hàng

**Là** một Admin,  
**Tôi muốn** mở thông tin của một đơn hàng,  
**Để** kiểm tra các thông tin cần thiết trước khi thực hiện thao tác quản lý.

**Tiêu chí chấp nhận:**

- Mỗi hàng có nút thao tác với biểu tượng dấu ba chấm.
- Khi nhấn nút, hiển thị hộp thoại chứa:
  - Mã đơn hàng.
  - Tên khách hàng.
  - Số điện thoại.
  - Tổng tiền.
  - Trạng thái.
  - Phương thức thanh toán.
  - Thời gian đặt.
- Hiển thị nút “Đóng”.
- Với đơn hàng chưa hoàn thành và chưa bị hủy, hiển thị thêm lựa chọn “Cập nhật trạng thái”.

**Lưu ý:** Thông tin chi tiết hiện được hiển thị trong `Alert.alert`, chưa điều hướng đến một màn hình chi tiết riêng.

### US11 – Mở chức năng cập nhật trạng thái đơn hàng

**Là** một Admin,  
**Tôi muốn** mở giao diện cập nhật trạng thái từ thông tin đơn hàng,  
**Để** thay đổi trạng thái của đơn hàng cần xử lý.

**Tiêu chí chấp nhận:**

- Chỉ hiển thị lựa chọn “Cập nhật trạng thái” đối với đơn hàng chưa có trạng thái “Hoàn thành” hoặc “Đã hủy”.
- Khi chọn chức năng cập nhật, hiển thị modal cập nhật trạng thái.
- Modal hiển thị mã đơn hàng và tên khách hàng.
- Hiển thị các trạng thái có thể lựa chọn:
  - Đang xử lý.
  - Đang giao.
  - Hoàn thành.
  - Đã hủy.
- Trạng thái hiện tại được chọn mặc định, ngoại trừ đơn hàng đã hủy được mở lại để cập nhật thì mặc định chuyển về “Đang xử lý”.

### US12 – Chọn trạng thái mới cho đơn hàng

**Là** một Admin,  
**Tôi muốn** chọn trạng thái mới trong modal cập nhật,  
**Để** xác định trạng thái mà đơn hàng sẽ được chuyển sang.

**Tiêu chí chấp nhận:**

- Cho phép chọn một trong các trạng thái được cung cấp.
- Trạng thái đang chọn được làm nổi bật bằng màu nền.
- Hiển thị biểu tượng xác nhận bên cạnh trạng thái được chọn.
- Việc chọn trạng thái mới chưa cập nhật đơn hàng ngay lập tức.
- Chỉ khi nhấn “Lưu thay đổi”, hệ thống mới thực hiện cập nhật trong state giao diện.

### US13 – Lưu thay đổi trạng thái đơn hàng

**Là** một Admin,  
**Tôi muốn** lưu trạng thái mới của đơn hàng,  
**Để** danh sách hiển thị đúng trạng thái vừa cập nhật.

**Tiêu chí chấp nhận:**

- Khi nhấn “Lưu thay đổi”, hệ thống kiểm tra đơn hàng đang được cập nhật và trạng thái mới.
- Nếu không có đơn hàng hoặc trạng thái hợp lệ, không thực hiện cập nhật.
- Nếu dữ liệu hợp lệ, cập nhật trạng thái của đúng đơn hàng trong `displayOrders`.
- Các thông tin khác của đơn hàng được giữ nguyên.
- Modal cập nhật trạng thái được đóng sau khi lưu.
- Hiển thị thông báo “Cập nhật thành công” kèm mã đơn hàng và trạng thái mới.
- Danh sách được cập nhật theo trạng thái mới; nếu đơn hàng không còn phù hợp với bộ lọc hiện tại, đơn hàng sẽ không xuất hiện trong kết quả lọc.

**Lưu ý:** Việc lưu hiện chỉ cập nhật state trong ứng dụng, chưa lưu vào backend hoặc cơ sở dữ liệu. Dữ liệu cũng chưa được bảo đảm tồn tại sau khi tải lại trang.

### US14 – Hủy thao tác cập nhật trạng thái

**Là** một Admin,  
**Tôi muốn** hủy thao tác cập nhật trạng thái,  
**Để** đóng giao diện mà không lưu thay đổi đang chọn.

**Tiêu chí chấp nhận:**

- Hiển thị nút “Hủy” trong modal.
- Khi nhấn “Hủy”, modal được đóng.
- Khi nhấn ra ngoài vùng modal hoặc sử dụng thao tác đóng của hệ điều hành, modal được đóng.
- Trạng thái đơn hàng không bị cập nhật nếu chưa nhấn “Lưu thay đổi”.

### US15 – Hiển thị màu sắc theo trạng thái đơn hàng

**Là** một Admin,  
**Tôi muốn** mỗi trạng thái đơn hàng có màu hiển thị riêng,  
**Để** dễ dàng phân biệt tình trạng của từng đơn hàng.

**Tiêu chí chấp nhận:**

- “Đang xử lý” sử dụng nền vàng nhạt và chữ màu cam.
- “Đang giao” sử dụng nền xanh dương nhạt và chữ xanh dương.
- “Hoàn thành” sử dụng nền xanh lá nhạt và chữ xanh lá.
- “Đã hủy” sử dụng nền đỏ nhạt và chữ đỏ.
- Các trạng thái không thuộc danh sách trên sử dụng màu mặc định.

### US16 – Điều hướng đến các trang quản trị

**Là** một Admin,  
**Tôi muốn** sử dụng thanh sidebar để chuyển đến các chức năng quản trị khác,  
**Để** quản lý cửa hàng từ một giao diện thống nhất.

**Tiêu chí chấp nhận:**

- Hiển thị logo BVP Shop và các mục điều hướng.
- Mục “Tổng quan” điều hướng đến `/main_Admin`.
- Mục “Quản lý đơn hàng” giữ nguyên trang hiện tại.
- Mục “Quản lý sản phẩm” điều hướng đến `/product_management`.
- Mục “Quản lý danh mục” điều hướng đến `/category_management`.
- Mục “Tồn kho” điều hướng đến `/stock_inventory`.
- Mục “Nhập xuất kho” điều hướng đến `/stock_movements`.
- Mục “Quản lý khách hàng” điều hướng đến `/customer_management`.
- Mục “Quản lý đơn hàng” được đánh dấu là trang đang hoạt động.

### US17 – Đăng xuất khỏi hệ thống

**Là** một Admin,  
**Tôi muốn** xác nhận đăng xuất khỏi hệ thống,  
**Để** kết thúc phiên sử dụng khi không còn cần quản lý cửa hàng.

**Tiêu chí chấp nhận:**

- Hiển thị mục “Đăng xuất” trong nhóm “HỆ THỐNG”.
- Khi nhấn, hiển thị hộp thoại xác nhận.
- Có hai lựa chọn “Hủy” và “Đăng xuất”.
- Chọn “Hủy” sẽ không thực hiện thao tác đăng xuất.
- Chọn “Đăng xuất” hiển thị thông báo yêu cầu kết nối chức năng đăng xuất.

**Lưu ý:** Chức năng đăng xuất hiện chưa xóa phiên đăng nhập, chưa xử lý token và chưa điều hướng về màn hình đăng nhập.

### US18 – Hiển thị giao diện phù hợp với kích thước màn hình

**Là** một Admin,  
**Tôi muốn** giao diện quản lý đơn hàng thích ứng với kích thước màn hình,  
**Để** có thể theo dõi thông tin trên các màn hình có chiều rộng khác nhau.

**Tiêu chí chấp nhận:**

- Sidebar có chiều rộng 220 px khi màn hình không quá 768 px và 255 px khi màn hình rộng hơn.
- Khu vực nội dung được bố trí bên phải sidebar.
- Các trường tìm kiếm và bộ lọc có thể xuống dòng khi không đủ chiều rộng.
- Bảng đơn hàng giữ chiều rộng tổng thể 1092 px để bảo toàn kích thước các cột.
- Khi vùng hiển thị nhỏ hơn bảng, người dùng có thể cuộn ngang để xem các cột.
- Nội dung chính có thể cuộn dọc để xem danh sách đơn hàng.

## 3. Quy tắc nghiệp vụ và giới hạn hiện tại

1. **Dữ liệu đơn hàng:** Danh sách hiện sử dụng mảng `orders` được khai báo cố định với 5 đơn hàng mẫu.
2. **Tìm kiếm và lọc:** Các thao tác được thực hiện trên dữ liệu trong state `displayOrders`, không truy vấn backend.
3. **Sắp xếp:** Danh sách được sắp xếp theo chuỗi thời gian có định dạng `YYYY-MM-DD HH:mm`, phù hợp với dữ liệu mẫu hiện tại.
4. **Chọn đơn hàng:** Checkbox chỉ đánh dấu đơn hàng; chưa có xử lý hàng loạt.
5. **Xem chi tiết:** Thông tin được hiển thị bằng hộp thoại, chưa có trang chi tiết riêng.
6. **Cập nhật trạng thái:** Có thể thay đổi trạng thái trong state hiện tại, nhưng chưa ghi vào cơ sở dữ liệu.
7. **Đăng xuất:** Mới có hộp thoại xác nhận và thông báo; chưa triển khai quy trình đăng xuất thực tế.
8. **Điều hướng:** Các route cần tồn tại trong dự án Expo Router để thao tác điều hướng hoạt động.
9. **Hình ảnh:** Hình ảnh trong danh sách là URL minh họa được khai báo trong dữ liệu mẫu, không phải hình ảnh sản phẩm lấy từ cơ sở dữ liệu.

## 4. Tổng kết

Màn hình Quản lý đơn hàng của BVP Shop hiện hỗ trợ xem danh sách đơn hàng, tìm kiếm theo mã đơn hàng/tên khách hàng/số điện thoại, lọc theo trạng thái và phương thức thanh toán, sắp xếp theo thời gian, chọn nhiều đơn hàng, xem thông tin đơn hàng và cập nhật trạng thái trong giao diện.

Tuy nhiên, dữ liệu vẫn là dữ liệu mẫu và chưa được kết nối với backend. Chức năng cập nhật trạng thái chỉ thay đổi dữ liệu trong state của ứng dụng; chức năng đăng xuất chưa được triển khai hoàn chỉnh.
