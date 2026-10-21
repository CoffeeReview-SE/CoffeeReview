# Tài liệu User Stories - Màn hình Quản lý Đơn hàng (BVP Shop)

Tài liệu này tổng hợp các User Stories (Câu chuyện người dùng) được trích xuất và chuẩn hóa từ mã nguồn tính năng Quản lý Đơn hàng (`orders_2.tsx`) thuộc ứng dụng thương mại điện tử **BVP Shop**.

## Danh sách User Stories (Overview)

| ID | Tên tính năng / User Story | Phân loại |
| ----- | ----- | ----- |
| **US-ORD-01** | Xem danh sách đơn hàng & Thống kê tổng quan | Chức năng chính |
| **US-ORD-02** | Lọc đơn hàng theo trạng thái | Chức năng chính |
| **US-ORD-03** | Tìm kiếm đơn hàng theo mã đơn / sản phẩm | Chức năng chính |
| **US-ORD-04** | Xem chi tiết thông tin đơn hàng | Chức năng chính |
| **US-ORD-05** | Hủy đơn hàng đang chờ xác nhận | Chức năng chính / Luồng ngoại lệ |
| **US-ORD-06** | Mua lại đơn hàng đã hoàn thành | Chức năng mở rộng |
| **US-ORD-07** | Đa ngôn ngữ & Hỗ trợ AI (Widget) | Tiện ích hệ thống |

## Chi tiết các User Stories

### US-ORD-01: Xem danh sách đơn hàng & Thống kê tổng quan

* **Là một:** Khách hàng (Customer) đã đăng nhập.
* **Tôi muốn:** Xem tổng quan các chỉ số (Tổng số đơn, Đơn chờ xác nhận, Đơn đang giao) và danh sách các đơn hàng đã đặt.
* **Để:** Nhanh chóng nắm được số lượng và tình trạng chung của các giao dịch mua sắm của mình.

#### Tiêu chí chấp nhận - US-ORD-01

1. **Thẻ thống kê (Summary Cards):**
   * Hiển thị đúng 3 thẻ thống kê: **Tổng đơn hàng**, **Chờ xác nhận**, và **Đang giao**.
   * Con số trên các thẻ phải được tính toán tự động tương ứng với dữ liệu thực tế của người dùng.

2. **Hiển thị thẻ đơn hàng (Order Card):**
   * Mỗi thẻ đơn hàng phải bao gồm:
     * Mã đơn hàng (`id`).
     * Ngày đặt hàng (`date`).
     * Tóm tắt danh sách/số lượng sản phẩm (`items`).
     * Tổng số tiền thanh toán (`total`).
     * Trạng thái hiện tại đi kèm nhãn và màu sắc tương ứng (`status`).

3. **Responsive / Giao diện thích ứng:**
   * Đảm bảo hiển thị tối ưu trên cả thiết bị di động (`width < 600px`) và máy tính bảng/máy tính để bàn.

---

### US-ORD-02: Lọc đơn hàng theo trạng thái

* **Là một:** Khách hàng (Customer).
* **Tôi muốn:** Lọc danh sách đơn hàng theo từng trạng thái cụ thể (Tất cả, Chờ xác nhận, Đang giao, Hoàn thành, Đã hủy).
* **Để:** Dễ dàng tìm lại các đơn hàng thuộc một giai đoạn xử lý nhất định.

#### Tiêu chí chấp nhận - US-ORD-02

1. Hiển thị thanh Tab bao gồm các mục: `Tất cả`, `Chờ xác nhận`, `Đang giao`, `Hoàn thành`, `Đã hủy`.
2. Mặc định chọn tab `Tất cả`.
3. Khi bấm vào một Tab:
   * Danh sách bên dưới chỉ hiển thị các đơn hàng có trạng thái trùng khớp.
   * Tab được chọn hiển thị trạng thái active (nổi bật nền/màu chữ).
4. Tab `Tất cả` hiển thị badge tổng số lượng đơn hàng hiện có.
5. Nếu không có đơn hàng nào khớp với tab được chọn, hệ thống hiển thị màn hình rỗng (**Empty State**) kèm nút "Xóa bộ lọc".

---

### US-ORD-03: Tìm kiếm đơn hàng

* **Là một:** Khách hàng (Customer).
* **Tôi muốn:** Nhập từ khóa vào thanh tìm kiếm để tra cứu đơn hàng theo Mã đơn hàng hoặc Tên sản phẩm.
* **Để:** Tìm nhanh một đơn hàng cụ thể mà không cần cuộn tìm thủ công.

#### Tiêu chí chấp nhận - US-ORD-03

1. Có thanh tìm kiếm với placeholder *"Tìm mã đơn hàng..."*.
2. Khi người dùng nhập từ khóa (không phân biệt chữ hoa/thường, tự động loại bỏ khoảng trắng thừa):
   * Kết quả lọc theo thời gian thực (Real-time).
   * Chỉ giữ lại các đơn hàng chứa mã đơn hoặc chứa tên sản phẩm khớp với từ khóa.
3. Khi thanh tìm kiếm có nội dung, xuất hiện nút biểu tượng xóa (`x`). Bấm vào sẽ xóa nhanh toàn bộ từ khóa.
4. Trường hợp không tìm thấy kết quả:
   * Hiển thị thông báo *"Không tìm thấy đơn hàng"* cùng mô tả gợi ý.
   * Nút *"Xóa bộ lọc"* giúp khôi phục lại trạng thái tìm kiếm ban đầu.

---

### US-ORD-04: Xem chi tiết / Thu gọn thông tin đơn hàng

* **Là một:** Khách hàng (Customer).
* **Tôi muốn:** Mở rộng hoặc thu gọn phần xem chi tiết của từng thẻ đơn hàng.
* **Để:** Xem đầy đủ thông tin giao dịch, vận chuyển khi cần mà không làm rối giao diện chung.

#### Tiêu chí chấp nhận - US-ORD-04

1. Mặc định thông tin chi tiết mở rộng (`expanded`) ở trạng thái ẩn.
2. Mỗi thẻ đơn hàng có nút **"Chi tiết"** kèm icon chỉ hướng xuống.
3. Khi bấm **"Chi tiết"**:
   * Mở rộng khối thông tin bên dưới bao gồm: Mã đơn, Ngày đặt, Trạng thái hiện tại và Ghi chú địa chỉ giao hàng.
   * Đổi nhãn nút thành **"Thu gọn"** kèm icon chỉ hướng lên.
4. Khi bấm **"Thu gọn"**: Đóng khối thông tin chi tiết.

---

### US-ORD-05: Hủy đơn hàng đang chờ xác nhận

* **Là một:** Khách hàng (Customer).
* **Tôi muốn:** Có thể hủy các đơn hàng đang ở trạng thái "Chờ xác nhận".
* **Để:** Thay đổi quyết định mua sắm hoặc sửa đổi đơn hàng khi người bán chưa xử lý.

#### Tiêu chí chấp nhận - US-ORD-05

1. **Điều kiện hiển thị:** Nút **"Hủy đơn hàng"** chỉ xuất hiện trên các đơn hàng có trạng thái `Chờ xác nhận`.
2. **Xác nhận hủy:**
   * Khi bấm "Hủy đơn hàng", hệ thống hiển thị hộp thoại xác nhận (Alert / Confirm dialog): *"Bạn có chắc chắn muốn hủy đơn hàng \[Mã đơn\]?"*.
3. **Ngoại lệ - Người dùng xác nhận HỦY:**
   * Trạng thái đơn hàng chuyển sang `Đã hủy`.
   * Cập nhật số lượng đơn ở các thẻ thống kê.
   * Hiển thị thông báo thành công: *"Đơn hàng \[Mã đơn\] đã được hủy thành công."*.
4. **Ngoại lệ - Người dùng KHÔNG hủy (Giữ đơn):**
   * Giữ nguyên trạng thái đơn hàng.
   * Hiển thị thông báo: *"Giữ nguyên đơn hàng."*.
5. **Ngoại lệ - Hủy đơn không hợp lệ:**
   * Nếu đơn hàng không ở trạng thái `Chờ xác nhận` (ví dụ: Đang giao, Hoàn thành), hệ thống ngăn chặn và thông báo: *"Không thể hủy đơn hàng này vì trạng thái hiện tại không cho phép hủy."*.

---

### US-ORD-06: Mua lại đơn hàng đã hoàn thành

* **Là một:** Khách hàng (Customer).
* **Tôi muốn:** Bấm nút "Mua lại" đối với các đơn hàng đã ở trạng thái "Hoàn thành".
* **Để:** Nhanh chóng đặt lại các sản phẩm yêu thích mà không phải tìm lại từng sản phẩm.

#### Tiêu chí chấp nhận - US-ORD-06

1. Nút **"Mua lại"** chỉ hiển thị đối với các đơn hàng có trạng thái `Hoàn thành`.
2. Nút có thiết kế nổi bật (màu đỏ) kèm biểu tượng làm mới (refresh icon).

---

### US-ORD-07: Hỗ trợ đa ngôn ngữ và Widget Tư vấn AI

* **Là một:** Khách hàng (Customer).
* **Tôi muốn:** Chuyển đổi ngôn ngữ hiển thị và có Widget tư vấn AI trực tiếp trên màn hình đơn hàng.
* **Để:** Sử dụng ứng dụng bằng ngôn ngữ phù hợp và nhận trợ giúp nhanh khi gặp sự cố về đơn hàng.

#### Tiêu chí chấp nhận - US-ORD-07

1. Trên Header tích hợp component `LanguageSelector` cho phép đổi ngôn ngữ ứng dụng (tiếng Việt / tiếng Anh,...).
2. Toàn bộ các nhãn, trạng thái, thông báo Alert/Confirm đều tự động cập nhật theo ngôn ngữ đã chọn via hàm `t()`.
3. Tích hợp Widget AI Floating Button ở góc màn hình. Bấm vào Widget sẽ điều hướng sang màn hình nhắn tin trợ lý AI (`/chat`).
