# TÀI LIỆU USER STORIES – MÀN HÌNH DANH SÁCH SẢN PHẨM (BVP SHOP)

## 1. Tổng quan

Màn hình Danh sách sản phẩm cho phép người dùng xem các sản phẩm theo từng danh mục, theo dõi giá bán và số lượng tồn kho, truy cập trang chi tiết sản phẩm và thêm sản phẩm vào giỏ hàng.

**Đối tượng sử dụng:** Khách hàng của BVP Shop.

## 2. Danh sách User Stories

### US01 – Xem danh sách sản phẩm theo danh mục

**Là** khách hàng, **tôi muốn** xem danh sách sản phẩm được phân chia theo từng danh mục, **để** dễ dàng tìm kiếm và lựa chọn sản phẩm phù hợp.

**Tiêu chí chấp nhận:**

- Hệ thống hiển thị tiêu đề “Danh sách sản phẩm” và mô tả trang.
- Sản phẩm được phân chia thành các danh mục dựa trên `categoryId`:
  - `PHONE1`: Điện thoại.
  - `LAPTOP`: Laptop.
  - `WATCH1`: Đồng hồ.
  - `ACC001`: Phụ kiện.
- Danh sách được lấy từ `allFallbackProducts`.
- Tên danh mục và tên sản phẩm được hiển thị thông qua hàm dịch `t()`.

### US02 – Xem thông tin sản phẩm

**Là** khách hàng, **tôi muốn** xem tên, giá bán và số lượng tồn kho của sản phẩm, **để
