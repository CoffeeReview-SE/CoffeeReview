# ======
# Xay dung he thong thuong mai dien tu thong minh 
# ======

## Chay ung dung va backend

1. Cấu hình SQL Server trong `backend/.env` (SQL Express cục bộ dùng sẵn Windows Authentication).
2. Mở terminal thứ nhất và chạy `npm run server`.
3. Mở terminal thứ hai và chạy `npm run start` để khởi động Expo.

Backend lắng nghe cổng `3333`. Khi chạy Expo ở chế độ LAN, app tự lấy host
của Expo dev server làm địa chỉ backend, nên điện thoại và máy tính cần cùng
mạng Wi-Fi. Nếu backend chạy ở địa chỉ khác, đặt `EXPO_PUBLIC_BACKEND_URL`
thành `http://<địa-chỉ-máy-chạy-backend>:3333` rồi khởi động lại Expo.
`GEMINI_API_KEY` chỉ cần nếu muốn bật tính năng chat AI; đồng bộ dữ liệu SQL
không phụ thuộc dịch vụ bên ngoài.

### Ket noi SQL Server

Backend đọc sản phẩm, danh mục và tồn kho từ database `ElectronicCommerceDB`
theo schema trong `Data/Database.sql`. Với SQL Express cục bộ, cấu hình mặc định
dùng Windows Authentication (`DB_SERVER=localhost`, `DB_INSTANCE=SQLEXPRESS`),
không cần lưu mật khẩu SQL. Backend chạy trên cùng máy SQL Server; điện thoại/web
chỉ gọi máy chủ nội bộ qua `EXPO_PUBLIC_BACKEND_URL` (mặc định tự lấy host Expo).
Nếu SQL Server ở máy khác, cấu hình TCP/IP và SQL login trong `backend/.env`.

Nếu database chưa có, chạy `Data/Database.sql` một lần trong SQL Server. Script
này khởi tạo schema và dữ liệu mẫu, đồng thời xóa các bảng cũ trước khi tạo lại;
chỉ chạy khi database chưa có dữ liệu cần giữ. Nếu database đã có dữ liệu, chỉ chạy
`Data/Database.InventoryMigration.sql` khi cần cập nhật bảng kho.
Để đổi database cũ sang đúng bốn nhóm Điện thoại, Laptop, Đồng hồ và Phụ kiện,
chạy thêm `Data/Database.ProductCategoryMigration.sql` một lần.

Catalog user doc san pham tu `SAN_PHAM`, `SAN_PHAM_NGON_NGU` va `TON_KHO` qua
`/api/catalog/products`. Trang quan tri doc/ghi san pham, danh muc va kho qua
cac endpoint `/api/admin/*`; Gemini van chi dung `/api/chat`.

De them du lieu mau laptop va dong ho thong minh vao database dang co, chay
`Data/Database.LaptopWatchSeed.sql` mot lan. Script co the chay lai an toan va
khong xoa cac san pham/don hang hien co.

De an khoi trang user cac san pham chua co gia ma van giu lich su don hang/kho,
chay `Data/Database.HideUnpricedProducts.sql` mot lan.

Neu database da duoc tao truoc do, chay mot lan `Data/Database.InventoryMigration.sql`
trong SQL Server Management Studio de them nguong ton kho va bang lich su phieu.
Endpoint `/health` tra `databaseConnected` de xem backend da ket noi SQL Server chua.
