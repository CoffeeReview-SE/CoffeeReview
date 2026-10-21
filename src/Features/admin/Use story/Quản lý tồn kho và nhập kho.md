# TÀI LIỆU USER STORIES – QUẢN LÝ TỒN KHO VÀ NHẬP XUẤT KHO (BVP SHOP)

## 1. Tổng quan

Tài liệu mô tả các User Stories cho hai chức năng Quản lý tồn kho và Nhập xuất kho của hệ thống BVP Shop. Các chức năng hỗ trợ Admin theo dõi số lượng hàng hóa, giá trị tồn kho, phát hiện sản phẩm sắp hết hoặc hết hàng, lập phiếu nhập kho, lập phiếu xuất kho và theo dõi lịch sử giao dịch.

## 2. Tác nhân

- **Admin:** Người quản trị cửa hàng, chịu trách nhiệm theo dõi tồn kho và thực hiện các nghiệp vụ nhập xuất hàng hóa.
- **Hệ thống:** Tải dữ liệu sản phẩm, kiểm tra thông tin phiếu, ghi nhận giao dịch và cập nhật dữ liệu kho thông qua các hàm trong `stock-store`.

## 3. Danh sách User Stories

### US01 – Xem tổng quan tồn kho

**Là** Admin,  
**Tôi muốn** xem tổng quan tình trạng hàng hóa trong kho,  
**Để** nắm được số lượng sản phẩm và giá trị hàng hóa hiện có.

**Tiêu chí chấp nhận:**

- Hiển thị tổng số sản phẩm.
- Hiển thị số sản phẩm sắp hết hàng.
- Hiển thị số sản phẩm đã hết hàng.
- Hiển thị giá trị tồn kho được tính bằng tổng giá bán nhân với số lượng tồn của từng sản phẩm.
- Hiển thị thông báo nếu không tải được dữ liệu kho từ SQL Server.

### US02 – Xem danh sách tồn kho

**Là** Admin,  
**Tôi muốn** xem danh sách sản phẩm trong kho,  
**Để** kiểm tra số lượng và tình trạng tồn kho của từng mặt hàng.

**Tiêu chí chấp nhận:**

- Hiển thị tên sản phẩm, mã sản phẩm và danh mục.
- Hiển thị số lượng tồn kho hiện tại.
- Hiển thị mức tồn kho tối thiểu của từng sản phẩm.
- Hiển thị giá trị hàng tồn của sản phẩm, được tính bằng giá bán nhân số lượng tồn.
- Hiển thị trạng thái Còn hàng, Sắp hết hoặc Hết hàng.
- Hiển thị thông báo nếu không tìm thấy sản phẩm phù hợp.

### US03 – Tìm kiếm sản phẩm trong kho

**Là** Admin,  
**Tôi muốn** tìm kiếm sản phẩm theo mã, tên hoặc danh mục,  
**Để** nhanh chóng xác định mặt hàng cần kiểm tra.

**Tiêu chí chấp nhận:**

- Có ô nhập từ khóa tìm kiếm.
- Hệ thống tìm kiếm theo mã sản phẩm, tên sản phẩm hoặc danh mục.
- Không phân biệt chữ hoa và chữ thường.
- Danh sách được cập nhật theo từ khóa nhập vào.
- Hiển thị thông báo khi không có kết quả phù hợp.

### US04 – Lọc sản phẩm theo tình trạng tồn kho

**Là** Admin,  
**Tôi muốn** lọc sản phẩm theo tình trạng tồn kho,  
**Để** ưu tiên kiểm tra các mặt hàng cần nhập bổ sung.

**Tiêu chí chấp nhận:**

- Có ba lựa chọn: Tất cả, Sắp hết và Hết hàng.
- Tất cả hiển thị toàn bộ sản phẩm.
- Sắp hết hiển thị sản phẩm có số lượng tồn lớn hơn 0 và nhỏ hơn hoặc bằng mức tồn tối thiểu.
- Hết hàng hiển thị sản phẩm có số lượng tồn bằng 0.
- Có thể kết hợp tìm kiếm và lọc trạng thái.

### US05 – Mở chức năng tạo phiếu nhập xuất kho

**Là** Admin,  
**Tôi muốn** mở biểu mẫu tạo phiếu nhập hoặc xuất kho,  
**Để** ghi nhận các giao dịch làm thay đổi số lượng hàng hóa.

**Tiêu chí chấp nhận:**

- Tại màn hình Quản lý tồn kho có nút Tạo phiếu để chuyển sang màn hình Nhập xuất kho.
- Tại màn hình Nhập xuất kho có nút Tạo phiếu mới để mở biểu mẫu.
- Biểu mẫu cho phép lựa chọn Nhập kho hoặc Xuất kho.
- Khi mở biểu mẫu, các trường số lượng, đối tác và ghi chú được khởi tạo lại.
- Có thể đóng biểu mẫu hoặc hủy thao tác.

### US06 – Lập phiếu nhập kho

**Là** Admin,  
**Tôi muốn** lập phiếu nhập kho cho một sản phẩm,  
**Để** ghi nhận số lượng hàng được nhập từ nhà cung cấp hoặc nguồn khác.

**Tiêu chí chấp nhận:**

- Cho phép chọn sản phẩm từ danh sách hiện có.
- Hiển thị mã sản phẩm, tên sản phẩm, danh mục và số lượng tồn hiện tại.
- Cho phép nhập số lượng, nhà cung cấp và ghi chú.
- Số lượng phải là số nguyên lớn hơn 0.
- Nếu bỏ trống đối tác, hệ thống sử dụng giá trị mặc định Nhà cung cấp.
- Nếu bỏ trống ghi chú, hệ thống sử dụng giá trị mặc định Nhập hàng.
- Khi lưu thành công, biểu mẫu được đóng.
- Nếu lưu thất bại, hệ thống hiển thị thông báo lỗi.

### US07 – Lập phiếu xuất kho

**Là** Admin,  
**Tôi muốn** lập phiếu xuất kho cho một sản phẩm,  
**Để** ghi nhận số lượng hàng được xuất khỏi kho.

**Tiêu chí chấp nhận:**

- Cho phép chọn sản phẩm cần xuất.
- Cho phép nhập số lượng xuất, mã đơn hàng hoặc nơi nhận và ghi chú.
- Số lượng xuất phải là số nguyên lớn hơn 0.
- Không cho phép xuất số lượng lớn hơn số lượng tồn hiện tại.
- Hiển thị số lượng tồn dự kiến sau khi xuất nếu số lượng nhập hợp lệ và không vượt quá tồn kho.
- Nếu bỏ trống nơi nhận, hệ thống sử dụng giá trị mặc định Xuất kho nội bộ.
- Nếu bỏ trống ghi chú, hệ thống sử dụng giá trị mặc định Xuất hàng.
- Nếu số lượng xuất vượt quá tồn kho, hệ thống hiển thị thông báo Không đủ tồn kho.
- Khi lưu thành công, biểu mẫu được đóng.

### US08 – Thêm sản phẩm mới kèm phiếu nhập đầu tiên

**Là** Admin,  
**Tôi muốn** thêm sản phẩm mới ngay trong quá trình lập phiếu nhập kho,  
**Để** ghi nhận hàng hóa chưa tồn tại trong danh sách mà không cần rời khỏi nghiệp vụ nhập kho.

**Tiêu chí chấp nhận:**

- Có tùy chọn Sản phẩm chưa có? Thêm sản phẩm mới.
- Biểu mẫu cho phép nhập tên sản phẩm, danh mục, giá bán, mức tồn tối thiểu và số lượng nhập.
- Tên sản phẩm và danh mục không được để trống.
- Giá bán phải là giá trị số hợp lệ và không âm.
- Mức tồn tối thiểu phải là số nguyên không âm.
- Số lượng nhập phải là số nguyên lớn hơn 0.
- Khi lưu, hệ thống gọi chức năng tạo sản phẩm kèm giao dịch nhập kho đầu tiên.
- Khi thao tác thành công, biểu mẫu được đóng và các trường thông tin sản phẩm mới được đặt lại.
- Nếu thao tác thất bại, hệ thống hiển thị thông báo lỗi.
- Có thể quay lại danh sách sản phẩm mà không cần thoát toàn bộ biểu mẫu.

### US09 – Xem tổng quan phiếu nhập xuất

**Là** Admin,  
**Tôi muốn** xem số lượng phiếu nhập, phiếu xuất và số sản phẩm trong kho,  
**Để** theo dõi hoạt động luân chuyển hàng hóa.

**Tiêu chí chấp nhận:**

- Hiển thị tổng số phiếu nhập kho.
- Hiển thị tổng số phiếu xuất kho.
- Hiển thị số lượng sản phẩm trong kho theo dữ liệu danh sách sản phẩm.
- Các số liệu được tính từ dữ liệu được cung cấp bởi `useStockData`.

### US10 – Xem lịch sử giao dịch kho

**Là** Admin,  
**Tôi muốn** xem lịch sử các giao dịch nhập xuất kho,  
**Để** theo dõi những thay đổi hàng hóa đã được ghi nhận.

**Tiêu chí chấp nhận:**

- Hiển thị mã phiếu giao dịch.
- Hiển thị loại giao dịch nhập kho hoặc xuất kho.
- Hiển thị ngày giờ giao dịch.
- Hiển thị tên sản phẩm và mã sản phẩm.
- Hiển thị số lượng nhập hoặc xuất.
- Hiển thị tên nhà cung cấp, nơi nhận hoặc đối tác.
- Hiển thị ghi chú nếu có.
- Phân biệt phiếu nhập và phiếu xuất bằng biểu tượng, màu sắc và dấu của số lượng.
- Hiển thị thông báo nếu không có phiếu giao dịch phù hợp.

### US11 – Tìm kiếm phiếu nhập xuất kho

**Là** Admin,  
**Tôi muốn** tìm kiếm giao dịch theo mã phiếu, tên sản phẩm hoặc đối tác,  
**Để** nhanh chóng tra cứu một giao dịch cụ thể.

**Tiêu chí chấp nhận:**

- Có ô tìm kiếm trong màn hình Nhập xuất kho.
- Hệ thống tìm kiếm theo mã phiếu, tên sản phẩm hoặc đối tác.
- Không phân biệt chữ hoa và chữ thường.
- Danh sách được cập nhật theo từ khóa.
- Hiển thị thông báo nếu không tìm thấy giao dịch phù hợp.

### US12 – Lọc lịch sử theo loại giao dịch

**Là** Admin,  
**Tôi muốn** lọc lịch sử theo loại phiếu nhập hoặc phiếu xuất,  
**Để** dễ dàng theo dõi từng nhóm giao dịch.

**Tiêu chí chấp nhận:**

- Có ba lựa chọn: Tất cả, Nhập kho và Xuất kho.
- Tất cả hiển thị mọi giao dịch.
- Nhập kho chỉ hiển thị các phiếu nhập.
- Xuất kho chỉ hiển thị các phiếu xuất.
- Có thể kết hợp lọc với tìm kiếm.
- Hiển thị số lượng phiếu phù hợp với điều kiện lọc.

### US13 – Điều hướng giữa các chức năng quản trị

**Là** Admin,  
**Tôi muốn** chuyển đổi giữa các màn hình quản trị thông qua thanh điều hướng,  
**Để** truy cập nhanh các chức năng của BVP Shop.

**Tiêu chí chấp nhận:**

- Hiển thị các mục Tổng quan, Quản lý đơn hàng, Quản lý sản phẩm, Quản lý danh mục, Tồn kho, Nhập xuất kho và Quản lý khách hàng.
- Cho phép chuyển đến màn hình tương ứng khi chọn một mục.
- Đánh dấu mục Tồn kho hoặc Nhập xuất kho theo màn hình đang sử dụng.
- Trên giao diện có chiều rộng dưới 700 pixel, thanh điều hướng chuyển thành thanh ngang có thể cuộn.
- Logo BVP Shop cho phép quay lại trang Tổng quan.

### US14 – Xem thông tin tài khoản Admin

**Là** Admin,  
**Tôi muốn** nhận biết tài khoản đang sử dụng trên màn hình quản trị,  
**Để** xác nhận mình đang thao tác trong khu vực quản trị.

**Tiêu chí chấp nhận:**

- Hiển thị biểu tượng tài khoản Admin.
- Trên giao diện nhỏ, tên Admin được ẩn để tiết kiệm không gian.
- Khi nhấn vào mục Đăng xuất, hệ thống hiển thị thông báo yêu cầu kết nối chức năng đăng xuất với hệ thống.

**Lưu ý:** Chức năng đăng xuất thực tế chưa được triển khai trong source code hiện tại.

## 4. Quy tắc nghiệp vụ

1. **Xác định sản phẩm sắp hết hàng:** Số lượng tồn phải lớn hơn 0 và nhỏ hơn hoặc bằng mức tồn tối thiểu.
2. **Xác định sản phẩm hết hàng:** Số lượng tồn bằng 0.
3. **Tính giá trị tồn kho:** Giá bán nhân với số lượng tồn của từng sản phẩm, sau đó cộng tổng.
4. **Số lượng nhập xuất:** Phải là số nguyên dương.
5. **Giới hạn xuất kho:** Không cho phép xuất vượt quá số lượng tồn hiện có.
6. **Giao dịch nhập kho:** Làm tăng số lượng tồn theo nghiệp vụ của hệ thống.
7. **Giao dịch xuất kho:** Làm giảm số lượng tồn theo nghiệp vụ của hệ thống.
8. **Sản phẩm mới:** Có thể được tạo đồng thời với phiếu nhập kho đầu tiên.
9. **Thông tin đối tác và ghi chú:** Có giá trị mặc định nếu người dùng để trống.
10. **Xử lý lỗi:** Khi thao tác lưu phiếu thất bại, hệ thống hiển thị thông báo để Admin biết và xử lý.

## 5. Những chức năng chưa được xác nhận

Dựa trên component được cung cấp, chưa thể khẳng định các chức năng sau đã hoàn thiện:

- Phân quyền người dùng đối với các thao tác nhập xuất kho.
- Phân trang lịch sử giao dịch.
- Lọc giao dịch theo khoảng thời gian.
- Chỉnh sửa hoặc hủy phiếu đã ghi nhận.
- Xuất báo cáo tồn kho ra Excel hoặc PDF.
- Tự động tạo phiếu nhập khi hàng sắp hết.
- Xác nhận dữ liệu tồn kho được lưu bền vững trong SQL Server và được cập nhật đồng bộ giữa các thiết bị. Các nội dung này phụ thuộc vào phần triển khai của `stock-store` và backend.

## 6. Kết luận

Các User Stories trên được xây dựng dựa trên giao diện, trạng thái, điều kiện kiểm tra và lời gọi hàm trong source code Quản lý tồn kho và Nhập xuất kho của BVP Shop. Tài liệu có thể được sử dụng làm cơ sở để xây dựng Use Case Diagram, Activity Diagram và kiểm thử chức năng quản lý kho.
