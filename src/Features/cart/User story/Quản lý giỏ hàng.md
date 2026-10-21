# BVP Shop - Danh sách User Stories (Màn hình Giỏ hàng & Đặt hàng)

Tài liệu tổng hợp danh sách User Stories và Tiêu chí chấp nhận (Acceptance Criteria) dựa trên phân tích mã nguồn `cart_4.tsx` thuộc ứng dụng BVP Shop.

---

## Danh sách User Stories

### 1. Xem danh sách sản phẩm trong giỏ hàng

* **Mã US**: `US-CART-01`
* **User Story**:
  * **Là một** Khách hàng,
  * **Tôi muốn** xem danh sách các sản phẩm đã thêm vào giỏ hàng cùng thông tin tên, mẫu mã (variant), đơn giá, giá gốc (nếu có) và hình ảnh đại diện,
  * **Để** kiểm tra lại thông tin các món đồ trước khi đưa ra quyết định mua sắm.
* **Mức độ ưu tiên**: Cao (High)

#### Tiêu chí chấp nhận - US-CART-01

1. **Hiển thị thông tin mặt hàng**:
   * Mỗi dòng sản phẩm thể hiện rõ: Biểu tượng/Hình ảnh sản phẩm, Tên sản phẩm, Phân loại/Biến thể (variant), Đơn giá hiện tại và Giá gốc (có gạch ngang nếu có ưu đãi).
2. **Tổng quan số lượng**:
   * Hiển thị tổng số lượng món đồ (`itemCount`) và số lượng mặt hàng đã chọn (`selectedProducts.length`) ngay trên thanh tiêu đề danh sách.
3. **Phản hồi giao diện responsive**:
   * Trên thiết bị di động (chiều rộng < 600px), layout hiển thị tối ưu theo dạng cuộn dọc thu gọn; trên máy tính (desktop) hiển thị bảng sản phẩm song song với Bảng tóm tắt đơn hàng.

---

### 2. Thay đổi số lượng sản phẩm

* **Mã US**: `US-CART-02`
* **User Story**:
  * **Là một** Khách hàng,
  * **Tôi muốn** tăng hoặc giảm số lượng của từng sản phẩm trong giỏ hàng,
  * **Để** điều chỉnh quy mô đơn hàng theo nhu cầu thực tế.
* **Mức độ ưu tiên**: Cao (High)

#### Tiêu chí chấp nhận - US-CART-02

1. **Tăng số lượng (Luồng chính)**:
   * Nhấn nút `+` giúp gia tăng số lượng mặt hàng lên 1 đơn vị. Tổng tiền và tóm tắt đơn hàng cập nhật tương ứng ngay lập tức.
2. **Kiểm tra tồn kho (Nhánh ngoại lệ)**:
   * Nếu số lượng mới vượt quá số lượng tồn kho khả dụng (`maxStock`), hệ thống giữ nguyên số lượng cũ và hiển thị thông báo Toast: *"Số lượng không hợp lệ hoặc không đủ hàng trong kho!"*.
3. **Giảm số lượng về 0 (Nhánh ngoại lệ)**:
   * Khi số lượng giảm xuống `0` (nhấn nút `-` khi số lượng hiện tại là 1), hệ thống không tự động giảm âm mà mở Modal xác nhận xóa sản phẩm.

---

### 3. Chọn / Bỏ chọn sản phẩm thanh toán

* **Mã US**: `US-CART-03`
* **User Story**:
  * **Là một** Khách hàng,
  * **Tôi muốn** bật/tắt chọn từng sản phẩm hoặc chọn/bỏ chọn tất cả sản phẩm trong giỏ hàng,
  * **Để** lựa chọn chính xác những món hàng muốn thanh toán trong lần đặt này.
* **Mức độ ưu tiên**: Trung bình (Medium)

#### Tiêu chí chấp nhận - US-CART-03

1. **Chọn đơn lẻ**:
   * Mặc định tất cả sản phẩm trong giỏ đều ở trạng thái được chọn. Khách hàng có thể nhấn vào hộp kiểm (checkbox) của từng dòng để chọn hoặc bỏ chọn.
2. **Chọn / Bỏ chọn tất cả**:
   * Nhấn nút *"Bỏ chọn tất cả"* sẽ bỏ tích toàn bộ sản phẩm (nút đổi thành *"Chọn tất cả"*).
   * Nhấn nút *"Chọn tất cả"* sẽ tích chọn lại toàn bộ danh sách sản phẩm.
3. **Cập nhật tính toán tự động**:
   * Giá tạm tính (`subtotal`), Tiết kiệm (`savings`), Phí giao hàng (`shipping`) và Tổng cộng (`total`) chỉ được tính dựa trên các sản phẩm **đang được chọn**.

---

### 4. Xóa sản phẩm khỏi giỏ hàng

* **Mã US**: `US-CART-04`
* **User Story**:
  * **Là một** Khách hàng,
  * **Tôi muốn** xóa một mặt hàng ra khỏi giỏ hàng,
  * **Để** loại bỏ những sản phẩm không còn nhu cầu mua.
* **Mức độ ưu tiên**: Cao (High)

#### Tiêu chí chấp nhận - US-CART-04

1. **Xác nhận trước khi xóa**:
   * Nhấn vào biểu tượng thùng rác làm xuất hiện Modal xác nhận với câu hỏi: *"Bạn có chắc muốn xóa “[Tên sản phẩm]” khỏi giỏ hàng không?"*.
2. **Hủy thao tác**:
   * Nhấn nút *"Hủy"* hoặc nhấn ra ngoài vùng Modal để đóng hộp thoại mà không thay đổi dữ liệu giỏ hàng.
3. **Xác nhận xóa**:
   * Nhấn nút *"Xóa sản phẩm"* để loại bỏ hoàn toàn mặt hàng đó khỏi giỏ, đồng thời xuất hiện Toast thông báo: *"Đã xóa sản phẩm khỏi giỏ hàng"*.

---

### 5. Tóm tắt chi phí & Chính sách giao hàng

* **Mã US**: `US-CART-05`
* **User Story**:
  * **Là một** Khách hàng,
  * **Tôi muốn** xem bảng phân tích chi tiết chi phí bao gồm Tạm tính, Ưu đãi, Phí giao hàng và Tổng thanh toán,
  * **Để** nắm rõ giá trị chiết khấu cũng như quy định miễn phí vận chuyển.
* **Mức độ ưu tiên**: Cao (High)

#### Tiêu chí chấp nhận - US-CART-05

1. **Bản tóm tắt chi phí**:
   * Hiển thị Tạm tính tương ứng với tổng số lượng sản phẩm được chọn.
   * Hiển thị khoản tiết kiệm/ưu đãi màu xanh lá nếu sản phẩm có niêm yết giá gốc lớn hơn giá bán.
2. **Tính toán phí giao hàng**:
   * Phí vận chuyển mặc định là `30.000đ`.
   * Miễn phí giao hàng (`0đ` - hiển thị mác *"Miễn phí"*) nếu tạm tính đạt từ `5.000.000đ` trở lên hoặc khi chưa chọn sản phẩm nào.
3. **Khóa nút đặt hàng**:
   * Nếu không có sản phẩm nào được chọn (`selectedProducts.length === 0`), nút *"Tiến hành đặt hàng"* sẽ bị vô hiệu hóa (disabled).

---

### 6. Xử lý trạng thái giỏ hàng trống

* **Mã US**: `US-CART-06`
* **User Story**:
  * **Là một** Khách hàng,
  * **Tôi muốn** nhận được thông báo rõ ràng khi giỏ hàng chưa có sản phẩm,
  * **Để** dễ dàng quay lại trang chủ khám phá và tiếp tục mua sắm.
* **Mức độ ưu tiên**: Trung bình (Medium)

#### Tiêu chí chấp nhận - US-CART-06

1. **Giao diện giỏ hàng trống**:
   * Khi giỏ hàng không chứa sản phẩm nào (`products.length === 0`), hiển thị biểu tượng giỏ hàng xám, tiêu đề *"Giỏ hàng đang trống"* và thông điệp hướng dẫn.
2. **Điều hướng mua sắm**:
   * Hiển thị nút *"Tiếp tục mua sắm"*. Khi nhấn vào, hệ thống chuyển hướng người dùng về trang chủ (`/`).

---

### 7. Tiến hành đặt hàng & Xác nhận thông tin

* **Mã US**: `US-CART-07`
* **User Story**:
  * **Là một** Khách hàng,
  * **Tôi muốn** điền thông tin người nhận, địa chỉ và lựa chọn hình thức thanh toán trong cửa sổ xác nhận,
  * **Để** hoàn tất việc đặt đơn hàng từ giỏ hàng.
* **Mức độ ưu tiên**: Cao (High)

#### Tiêu chí chấp nhận - US-CART-07

1. **Hiển thị Form đặt hàng**:
   * Nhấn nút *"Tiến hành đặt hàng"* mở ra Modal bao gồm:
     * Danh sách tóm tắt các sản phẩm đã chọn (Tên, Số lượng x Đơn giá).
     * Trường nhập Họ và tên.
     * Trường nhập Địa chỉ giao hàng.
     * Tùy chọn Phương thức thanh toán (*"Thanh toán khi nhận hàng"* hoặc *"Chuyển khoản ngân hàng"*).
     * Tổng số tiền cần thanh toán.
2. **Ràng buộc dữ liệu (Validation)**:
   * Nếu bỏ trống Họ tên hoặc Địa chỉ giao hàng khi nhấn *"Xác nhận đặt hàng"*, hệ thống xuất hiện Toast cảnh báo: *"Vui lòng nhập họ tên và địa chỉ giao hàng"*.
3. **Hoàn tất đặt hàng**:
   * Khi thông tin đầy đủ, nhấn *"Xác nhận đặt hàng"* sẽ:
     * Đóng Modal đặt hàng.
     * Xóa sạch các mặt hàng trong giỏ (`clear()`).
     * Hiển thị Toast thông báo: *"Đặt hàng thành công"*.

---

### 8. Tiện ích Điều hướng Header & Tư vấn AI

* **Mã US**: `US-CART-08`
* **User Story**:
  * **Là một** Khách hàng,
  * **Tôi muốn** chuyển đổi ngôn ngữ, truy cập nhanh lịch sử đơn hàng, tài khoản cá nhân và mở trợ lý tư vấn AI,
  * **Để** nhận hỗ trợ hoặc quản lý tài khoản nhanh chóng trong quá trình xem giỏ hàng.
* **Mức độ ưu tiên**: Thấp (Low)

#### Tiêu chí chấp nhận - US-CART-08

1. **Header Navigation**:
   * Nhấn vào Logo BVP Shop để trở về trang chủ `/`.
   * Hỗ trợ bộ chọn ngôn ngữ `LanguageSelector`.
   * Cung cấp các nút lối tắt dẫn đến màn hình Đơn hàng (`/orders`) và Tài khoản (`/account`).
2. **Trợ lý AI**:
   * Luôn hiển thị Floating Widget tư vấn AI (`AiConsultationWidget`). Nhấn vào nút này chuyển hướng sang màn hình chat AI (`/chat`).
