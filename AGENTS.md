# SmartShop - Quy tắc chung cho mọi công cụ AI


## Dự án
Đồ án học phần Lập trình C#: SmartShop, phần mềm quản lý bán hàng đồ điện tử.
Theo quyết định của người dùng ngày 03/11/2026: Blazor Web/Mobile responsive, C# .NET 10, giữ mô hình GUI-BUS-DAO và DTO. Xem docs/KIEN_TRUC_WEB_MOBILE.md. SQL Server là phần tích hợp tiếp theo; hiện dùng DAO demo trong bộ nhớ.
Nhóm: Phúc (trưởng nhóm), Vinh, Triết, Bảo. Giảng viên: Phùng Thái Thiên Trang.

## Kiến trúc (bắt buộc)
- GUI chỉ gọi BUS. BUS chỉ gọi DAO. DAO là nơi duy nhất dùng MyConnection.
- Không viết SQL trong GUI. Dùng truy vấn có tham số.
- Nghiệp vụ (tính tiền, trừ/cộng tồn, kiểm tra dữ liệu) nằm ở BUS, không nằm trong sự kiện nút bấm.
- Bán hàng trừ tồn, nhập hàng cộng tồn: làm trong một transaction.
- Tìm kiếm trên ArrayList viết trong BUS, không query lại CSDL.
- Web: dùng component chọn/tìm kiếm và state scoped theo phiên; không dùng biến static để giữ thông tin của người dùng.
- Mã đơn và thành tiền do BUS tính. Tồn kho sẽ cập nhật qua nghiệp vụ nhập/bán; Admin demo hiện có chỉnh tồn qua BUS và kiểm tra hợp lệ.
- Cột tiếng Việt dùng nvarchar. Chuỗi kết nối để ở một chỗ duy nhất.
- Đổi lớp Entity/DTO, tên trường, tên bảng, cột hoặc chữ ký phương thức BUS phải báo cả nhóm trước.

## Cách làm việc với AI
1. Trước khi bắt đầu, đọc `progress/AI_HANDOFF.md` và file `progress/<chức năng>.md` của việc được giao.
2. Chỉ sửa file thuộc chức năng được giao. Không sửa form của người khác.
3. Không commit `bin/`, `obj/`, `.vs/`, mật khẩu thật hoặc khóa API thật.
4. Làm trên nhánh `feature/...` của chức năng đó. Một nhánh chỉ cho một công cụ AI chạy tại một thời điểm.
5. Giữ nguyên bước xác nhận của công cụ trước khi sửa file hoặc chạy lệnh quan trọng. Xem diff trước khi commit.
6. Xong một việc: tick checklist trong `progress/<chức năng>.md`, thêm một dòng vào Nhật ký tiến độ, đổi Trạng thái nếu cần.
7. Phải dừng giữa chừng: ghi vào `progress/AI_HANDOFF.md`.
8. Viết code dễ giải thích, vì cả nhóm có kiểm tra giấy 10 phút (viết 1-2 hàm về MyConnection, DAO, BUS, nút "...").

## Phân công nhanh
- Phúc: nền tảng, MyConnection, đăng nhập, Hóa đơn bán, nút "...", tích hợp, báo cáo IV-V
- Vinh: CSDL, Phiếu nhập, Bảng tham số, Thống kê
- Triết: Form chính, Khách hàng, Nhân viên, Nhà cung cấp, tìm kiếm, ràng buộc dữ liệu
- Bảo: Sản phẩm, Đơn vị, Export/Import xls, Report PDF, mở rộng UC15-UC19

## Build
Build bằng dotnet build SmartShop.slnx hoặc Visual Studio hỗ trợ .NET 10. Startup project: SmartShop.GUI.
Chạy: dotnet run --project SmartShop.GUI --launch-profile http --urls http://localhost:5188. Thư viện Excel/PDF và backend SQL chưa được chọn.
