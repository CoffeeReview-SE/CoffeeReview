# Bản dịch thương hiệu

Trong Admin → Quản lý thương hiệu → Sửa, phần **Bản dịch mô tả thương hiệu** có ba ngôn ngữ Anh, Nhật, Trung. Có thể nhập thủ công hoặc dùng Dịch tự động / Tạo bản dịch cả 3 ngôn ngữ. Nội dung tự động là bản nháp; kiểm tra rồi lưu từng ngôn ngữ. Đóng cửa sổ hoặc tải lại sẽ bỏ bản nháp chưa lưu.

Lưu thông tin thương hiệu và lưu bản dịch là hai thao tác riêng. Nếu sửa mô tả gốc, lưu thương hiệu và mở lại trước khi dịch. Mô tả gốc thay đổi khiến bản dịch cũ có trạng thái Cần cập nhật; bản cũ vẫn giữ để đối chiếu. Người dùng chỉ nhận bản đã lưu khớp mô tả gốc hiện tại, sau đó mới dùng dịch tự động. Dữ liệu dịch có sẵn trong source code chỉ là phương án dự phòng khi API lỗi.

## Lưu trữ trên Render / Railway

Không thêm bảng hoặc cột database. File JSON lưu theo ID và ngôn ngữ: `<root>/<brandId>/en.json` (tương tự `ja.json`, `zh.json`).

- Nếu đã cấu hình `Images__UploadDirectory` trên volume/persistent disk, mặc định dùng thư mục `.metadata/translations/brands` bên trong đó; không cần thêm biến.
- Có thể cấu hình riêng `Translations__Directory=/data/translations/brands` và gắn volume/persistent disk tại `/data`.
- Nếu không có cả hai cấu hình, dùng `translations/brands` trong thư mục chạy localization. Đây là thư mục tạm trên hosting nếu không gắn volume; redeploy có thể mất dữ liệu.

Thư mục cần quyền ghi cho tiến trình localization. Triển khai một instance ghi file trên volume. Khóa cập nhật hiện áp dụng trong một tiến trình, không hỗ trợ nhiều replica cùng ghi chung volume. Sao lưu thư mục này cùng dữ liệu ảnh. Giữ nguyên các biến kết nối, khóa gateway và cấu hình admin hiện có.

API qua gateway (giữ chính sách admin hiện tại):

- `GET /api/admin/localization/brands/{id}/translations`: mô tả gốc, bản dịch, trạng thái và revision.
- `POST /api/admin/localization/brands/{id}/translations/{en|ja|zh}`: tạo bản nháp, không lưu file.
- `PUT /api/admin/localization/brands/{id}/translations/{en|ja|zh}`: lưu `description`, `sourceDescription`, `expectedRevision` (null cho lần đầu). Trả 409 khi nguồn hoặc revision đã đổi.
- API dịch công khai hiện có ưu tiên file đã lưu còn phù hợp với mô tả gốc.

Chức năng này quản lý mô tả thương hiệu; địa chỉ chi nhánh vẫn dịch theo cơ chế hiện có. Chưa tự tạo bản dịch lúc duyệt đề xuất; admin mở thương hiệu mới để tạo và kiểm tra.

## Kiểm tra

```powershell
dotnet run --project infrastructure/tests/translation-store/TranslationStore.Tests.csproj
dotnet build services/localization/SGCoffee.Localization.csproj --no-restore
npm run build
```
