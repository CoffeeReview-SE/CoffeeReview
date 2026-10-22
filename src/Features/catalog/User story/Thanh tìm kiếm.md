# User Story: Thanh tìm kiếm sản phẩm (Product Search Bar)

## 1. Tổng quan (Overview)

- **Feature:** Thanh tìm kiếm sản phẩm trên giao diện trang chủ (`home.tsx`)
- **User Story ID:** `US-SEARCH-001`
- **Priority:** High
- **Target Audience:** Khách hàng / Người mua sắm trên ứng dụng BVP Shop

---

## 2. Thân User Story (User Story Statement)

> **Là một** Khách hàng sử dụng ứng dụng BVP Shop,  
> **Tôi muốn** tìm kiếm sản phẩm trực tiếp bằng cách nhập từ khóa tên sản phẩm trên thanh tìm kiếm,  
> **Để** nhanh chóng lọc ra danh sách các sản phẩm phù hợp mà không cần phải duyệt qua toàn bộ cửa hàng.

---

## 3. Tiêu chí chấp nhận (Acceptance Criteria)

### AC-01: Hiển thị thanh tìm kiếm

- **Given** Khách hàng truy cập vào trang chủ trên thiết bị di động hoặc máy tính (Desktop/Mobile),
- **When** Giao diện trang chủ được tải,
- **Then** Thanh tìm kiếm xuất hiện nổi bật tại phần Header kèm nút icon tìm kiếm (kèm placeholder: *"Tìm kiếm sản phẩm"*).

### AC-02: Tìm kiếm theo từ khóa thực tế (Real-time Filtering)

- **Given** Khách hàng đang ở trang chủ và danh sách sản phẩm hiển thị,
- **When** Khách hàng nhập từ khóa vào ô tìm kiếm (ví dụ: *"Laptop"*, *"RTX"*, *"Phone"*),
- **Then** Danh sách sản phẩm lập tức lọc chỉ hiển thị các sản phẩm mà tên (`name`) có chứa từ khóa nhập vào (không phân biệt chữ hoa / chữ thường).

### AC-03: Kết hợp bộ lọc danh mục và từ khóa

- **Given** Khách hàng đã chọn một Danh mục sản phẩm (thông qua `ProductCategoryPicker`),
- **When** Khách hàng nhập thêm từ khóa vào thanh tìm kiếm,
- **Then** Hệ thống chỉ hiển thị những sản phẩm vừa thuộc danh mục đã chọn, vừa khớp với từ khóa tìm kiếm.

### AC-04: Xử lý ngoại lệ - Không tìm thấy sản phẩm

- **Given** Khách hàng nhập từ khóa không khớp với bất kỳ sản phẩm nào trong cửa hàng,
- **When** Danh sách sản phẩm trả về kết quả rỗng ($0$ sản phẩm),
- **Then**:
  1. Hiển thị giao diện thông báo rỗng (`emptySearchState`) với biểu tượng tìm kiếm và thông điệp:  
     *"Thông báo: Không tìm thấy sản phẩm phù hợp với từ khóa hoặc tiêu chí lọc."*
  2. Hiển thị nút **"Quay lại / Xóa tìm kiếm"** cho phép khách hàng xóa nhanh từ khóa tìm kiếm và reset lại bộ lọc danh mục.

---

## 4. Mẫu Kịch bản Kiểm thử BDD (Cucumber Test Scenario)

```gherkin
Feature: Tìm kiếm sản phẩm trên trang chủ

  Scenario: Tìm kiếm sản phẩm thành công theo tên
    Given Khách hàng đang ở trang chủ BVP Shop
    When Khách hàng nhập từ khóa "Laptop" vào thanh tìm kiếm
    Then Danh sách sản phẩm hiển thị chỉ gồm các sản phẩm có tên chứa từ "Laptop"

  Scenario: Xử lý khi không tìm thấy sản phẩm nào
    Given Khách hàng đang ở trang chủ BVP Shop
    When Khách hàng nhập từ khóa "XYZ123456" vào thanh tìm kiếm
    Then Hệ thống hiển thị thông báo "Không tìm thấy sản phẩm phù hợp..."
    And Hiển thị nút "Quay lại / Xóa tìm kiếm" để đặt lại dữ liệu
```
