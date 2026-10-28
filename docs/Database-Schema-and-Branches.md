# SQL hiện tại và chi nhánh có nguồn — 28/10/2026

Đã đối chiếu các câu SQL trong ba service Catalog, Submission và Analytics. File khởi tạo mới chỉ tạo các bảng đang dùng; không có DROP TABLE và chưa thay đổi schema/dữ liệu thật trên Supabase.

## Các bảng giữ lại

| Bảng | Chức năng đang dùng |
| --- | --- |
| language | Ngôn ngữ mô tả và nhóm lượt nghe |
| brand | CRUD thương hiệu, mô tả thật, tổng hợp audio |
| branch | CRUD chi nhánh, liên kết thương hiệu, xác thực audio theo chi nhánh |
| submission | Danh sách đề xuất và duyệt/từ chối |
| visit_session | Phiên riêng, heartbeat, kết thúc phiên, Active/Inactive |
| page_view | Lượt xem trang và event ID chống trùng |
| audio_play | Lượt nghe theo thương hiệu/ngôn ngữ và event ID chống trùng |

Đã bỏ phần CREATE TABLE, index và seed liên quan khỏi `SGCoffeeData.sql` cho 11 bảng chưa có tính năng sử dụng trong source hiện tại: `role`, `user_account`, `user_role`, `menu_item`, `review`, `review_report`, `brand_translation`, `branch_translation`, `menu_item_translation`, `visitor_location`, `admin_audit_log`.

Các bảng trên nếu đã tồn tại trên Supabase vẫn được giữ nguyên. Không dùng DROP CASCADE để dọn database thật. Việc bỏ khỏi file khởi tạo không xóa bảng trong database đã tạo trước đây.

`submission.created_by` và `processed_by` vẫn là BIGINT nullable để tương thích dữ liệu/API cũ, nhưng bản khởi tạo mới không còn FK đến user_account. Token MENU_ITEM trong target_type được giữ để đọc được dữ liệu đề xuất cũ; không còn tạo bảng menu_item. Các FK đã tồn tại trên database cũ không bị tự thay đổi.

File khởi tạo cũng có sẵn visitor_id, ended_at, event_id và các index Analytics hiện hành để database mới không thiếu cột. Hai migration Analytics cũ được giữ để nâng cấp database đã tồn tại.

## Chi nhánh đã thêm

| Thương hiệu | Số chi nhánh | Nguồn chính thức |
| --- | ---: | --- |
| Phúc Long | 3 | [Danh sách cửa hàng 2026](https://phuclong.com.vn/khuyen-mai/danh-sach-cua-hang-mo-ban-bo-co-o-an-xai-20260129031319) |
| Highlands Coffee | 3 | Trang cửa hàng riêng: [210 Nguyễn Trãi](https://www.highlandscoffee.com.vn/vn/he-thong-cua-hang/403/highlands-coffee-210-nguyen-trai-hcm.html), [Nguyễn Thị Định](https://www.highlandscoffee.com.vn/vn/he-thong-cua-hang/511/highlands-coffee-nguyen-thi-dinh-hcm.html), [Trade Center D10](https://www.highlandscoffee.com.vn/vn/he-thong-cua-hang/184/phin-sua.html) |
| Trung Nguyên | 3 | [Bản đồ không gian cà phê](https://trungnguyenlegend.com/ban-do-khong-gian-ca-phe-nang-luong/) |
| KATINAT | 5 | [Hệ thống cửa hàng](https://katinat.vn/cua-hang-2/), dữ liệu tra cứu công khai TP.HCM của trang này |
| KOI Thé | 3 | [Store locator](https://www.koithe.com/en/store.php?b=282&c=56&s=0), [Saigon Garden](https://www.koithe.com/en/store.php?c=56&ipp=6&page=8) |
| Phê La | 3 | [Hệ thống cửa hàng](https://phela.vn/he-thong-cua-hang/) |
| Milano Coffee | 1 | [Thông báo mời khách tới cửa hàng Phan Văn Trị](https://salekit.milanocoffee.com.vn/dat-hang-ca-phe-cold-brew-tai-app) |
| Viva Star Coffee | 3 | [Hệ thống cửa hàng](https://vivastarcoffee.com/he-thong-cua-hang/) |
| The Coffee House | 3 | [Xuân Thủy](https://info.thecoffeehouse.com/blogs/cua-hang-tp-ho-chi-minh/hcm-xuan-thuy), [Huỳnh Văn Bánh](https://info.thecoffeehouse.com/blogs/cua-hang-tp-ho-chi-minh/hcm-huynh-van-banh), [Phan Văn Trị 3](https://info.thecoffeehouse.com/blogs/cua-hang-tp-ho-chi-minh/hcm-phan-van-tri-3) |
| Starbucks | 3 | [Store locator Việt Nam](https://www.starbucks.vn/store-locator/) |
| Tổng | 30 | Đủ 10 thương hiệu |

Đây là danh sách chọn lọc địa chỉ được thương hiệu công bố, không phải toàn bộ mạng lưới. Kiểm chứng nguồn ngày 28/10/2026, không phải xác nhận thực địa cửa hàng đang mở. Một số trang cửa hàng/bài công bố có thể cũ; cần kiểm tra lại trước khi dùng làm danh mục vận hành chính thức. Giữ tên phường/quận như nguồn cung cấp, không tự suy đoán địa chỉ mới sau sáp nhập.

Milano chỉ thêm một địa điểm có thông báo chính thức rõ ràng là cửa hàng, không lấy địa chỉ văn phòng làm chi nhánh và không lấy cửa hàng bên thứ ba chưa xác minh. KATINAT có source_id để đối chiếu với dữ liệu tra cứu chính thức. Không lấy địa chỉ placeholder từ trang store finder.

`branches_hcm_verified.json` lưu từng địa chỉ, nguồn URL, số điện thoại nếu có xác minh và ngày kiểm tra. Tọa độ/giờ mở cửa chưa được bổ sung. Không dùng số liệu giả hay geocode ước lượng.

## File cần chạy trên Supabase

**Database đang sử dụng:** mở Supabase SQL Editor và chạy riêng `infrastructure/Database/branches_hcm_verified_seed.sql`. Script chỉ thêm chi nhánh còn thiếu, không sửa dữ liệu cũ, không tự bật lại chi nhánh đã tắt. Chạy lại không tăng bản ghi trùng theo thương hiệu và địa chỉ đã chuẩn hóa khoảng trắng/chữ hoa thường. Tên thương hiệu phải khớp đủ 10 seed gốc, thiếu tên sẽ báo lỗi và rollback.

**Database trống hoàn toàn:** dùng `infrastructure/Database/SGCoffeeData.sql`; file này chứa 7 bảng, 4 ngôn ngữ, 10 thương hiệu và 30 chi nhánh. Sau đó chạy `rls.sql` theo cấu hình hiện tại. Không cần nhập lại hai migration Analytics trên database mới đã dùng schema này.

Không chạy lại toàn bộ SQL khởi tạo chỉ để thêm chi nhánh vào database thật, vì phần seed thương hiệu có cập nhật mô tả. Push code/deploy Railway không tự import dữ liệu SQL.

Kiểm tra số chi nhánh sau khi nhập:

```sql
SELECT b.brand_name, COUNT(br.branch_id) AS branches
FROM public.brand b
LEFT JOIN public.branch br ON br.brand_id = b.brand_id
GROUP BY b.brand_id, b.brand_name
ORDER BY b.brand_name;
```

Nếu đã có chi nhánh trước đó, tổng số thực tế có thể lớn hơn 30.

## Kiểm tra đã thực hiện

Đã chạy SQL thật trên Supabase trong schema thử riêng, rồi rollback toàn bộ: tạo đúng 7 bảng, 10 thương hiệu, 30 chi nhánh thuộc 10 thương hiệu; chạy lại SQL khởi tạo và seed hai lần vẫn 30 chi nhánh; hai migration Analytics chạy được; không tạo lượt truy cập/audio mẫu; tọa độ và giờ mở cửa chưa xác minh vẫn NULL. Không commit schema thử hay seed vào dữ liệu thật.

Lệnh kiểm tra lại, yêu cầu quyền tạo schema thử và kết nối Supabase:

```powershell
dotnet run --project infrastructure/tools/AnalyticsDatabase/AnalyticsDatabase.csproj -- --validate-current-sql
```

Khi sửa JSON nguồn, tạo lại hai phần seed đồng nhất bằng:

```powershell
python infrastructure/scripts/generate-branch-seed.py
```
