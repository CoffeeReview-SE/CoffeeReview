# Phân loại thương hiệu

Đối chiếu ngày 31/10/2026. Phân loại là nhãn lọc ở cấp thương hiệu, không bảo đảm mọi chi nhánh đều có món đó. Nhóm “Trà & Cà phê” lấy thương hiệu có nhãn Trà, kể cả thương hiệu chuyên trà; nhóm “Cà phê & Bánh” lấy nhãn Bánh. Một thương hiệu có thể thuộc cả hai nhóm.

| Thương hiệu | Nhãn được gán | Nguồn chính thức |
|---|---|---|
| Phúc Long | Cà phê, Trà, Bánh | [BST có trà, cà phê và bánh](https://phuclong.com.vn/khuyen-mai/bo-suu-tap-huong-mat-uom-sac-20260227022356) |
| Highlands Coffee | Cà phê, Trà, Bánh | [Thực đơn](https://order.highlandscoffee.com.vn/), [bánh](https://order.highlandscoffee.com.vn/banh-ngot) |
| Trung Nguyên | Cà phê | [Menu cốt lõi cà phê](https://trungnguyenlegend.com/cong-thuc-thanh-cong-cua-chuoi-quan-ca-phe-trung-nguyen-legend/) |
| KATINAT | Trà, Cà phê | [Danh mục cà phê, trà sữa, trà trái cây](https://katinat.vn/) |
| KOI Thé | Trà | [Danh mục trà](https://koithe.com/ourtea.php), [menu có lựa chọn Việt Nam](https://koithe.com/menu.php) |
| Phê La | Trà, Cà phê | [Sản phẩm: cà phê, ô long, matcha](https://phela.vn/san-pham-phela/) |
| Milano Coffee | Trà, Cà phê | [Các món thức uống](https://milanocoffee.com.vn/cac-mon-thuc-uong), [menu cà phê và trà](https://salekit.milanocoffee.com.vn/lam-the-nao-de-thu-hut-sinh-vien-den-quan-cua-ban) |
| Viva Star Coffee | Trà, Cà phê | [Thực đơn công khai hiện tại](https://www.vivastarcoffee.com/thuc-don/) |
| The Coffee House | Cà phê, Trà, Bánh | [Cà phê và trà](https://info.thecoffeehouse.com/), [menu bánh](https://order.thecoffeehouse.com/order) |
| Starbucks | Cà phê, Trà, Bánh | [Thực đơn](https://www.starbucks.vn/thuc-don/), [trà](https://www.starbucks.vn/thuc-don/thuc-uong/tra-pha/), [bánh](https://www.starbucks.vn/thuc-don/thuc-an/banh/) |

Chỉ gán nhãn đã xác minh; không có nhãn không có nghĩa thương hiệu chắc chắn không bán món đó. Trung Nguyên chưa xác minh được trà/bánh trong menu tại Việt Nam nên tạm chỉ gán cà phê. Viva có bài khuyến mãi bánh cũ nhưng menu hiện tại được đọc chỉ có danh mục đồ uống nên chưa gán bánh. Không dùng bánh trung thu mùa vụ hay topping bánh trong đồ uống để suy ra danh mục bánh thường xuyên.

## Áp dụng

Database đang sử dụng: chạy `infrastructure/Database/brand_types_migration.sql` trong Supabase SQL Editor trước khi deploy Catalog mới. Script thêm cột `brand.type` nếu thiếu và cập nhật phân loại của 10 tên thương hiệu; không tạo thương hiệu thiếu và không xóa dữ liệu. Chạy lại sẽ gán lại các nhãn đã xác minh trong script.

Database mới: dùng `SGCoffeeData.sql`, đã có cột và dữ liệu phân loại.

Catalog trả `type` trong danh sách công khai, chi tiết và danh sách admin. Bộ lọc có sẵn ở `Brand_list.jsx` dùng trường này. Sau khi áp dụng đủ 10 thương hiệu, nhóm trà có 9 thương hiệu, nhóm bánh có 4; tìm kiếm còn có thể làm giảm số kết quả.

Chưa thực thi migration này trên Supabase từ công cụ trong phiên làm việc này.
