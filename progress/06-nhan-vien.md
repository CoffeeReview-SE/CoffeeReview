# Quản lý Nhân viên

**Người phụ trách:** Triết  
**Trạng thái:** Đang làm
**Cập nhật lần cuối:** 03/11/2026

| Mục | Nội dung |
|---|---|
| Phối hợp | Vinh (UNIQUE) |
| Yêu cầu / Use Case | UC03 |
| Mức ưu tiên | 1 |
| Nhánh Git | `develop` (local, chưa commit/push) |
| Mục báo cáo | III (Triết) |
| Ảnh form | `docs/images/06-nhan-vien/` |

Trạng thái dùng một trong: Chưa làm, Đang làm, Chờ review, Xong, Bị chặn.

## Việc cần làm

- [x] CRUD Nhân viên theo GUI-BUS-DAO (bản demo theo phiên)
- [x] Kiểm tra trùng mã, field bắt buộc, field khóa không cho sửa
- [x] Form tìm nhân viên cho nút "..." (popup web trong Admin)
- [x] Chụp ảnh form cho báo cáo
- [x] Đã có ảnh form trong `docs/images/06-nhan-vien/`
- [ ] Đã viết phần báo cáo tương ứng (III (Triết))

### Phạm vi đã thực hiện

- Trang `/admin/employees` thuộc Admin, có menu riêng trên desktop và điện thoại; hỗ trợ thêm, sửa, xóa có xác nhận, xem hồ sơ và đổi tình trạng làm việc.
- Tách DTO Employee/EmployeeDraft, BUS IEmployeeService/EmployeeService, hợp đồng IEmployeeRepository và DAO DemoEmployeeRepository; ghép qua dependency injection theo phiên, BUS không tham chiếu DAO cụ thể.
- BUS giữ ArrayList, tìm trên danh sách đã nạp một lần theo mã, tên, điện thoại, email, địa chỉ; hỗ trợ tiếng Việt không dấu và lọc tình trạng làm việc.
- Chặn mã trùng không phân biệt hoa/thường; kiểm tra dữ liệu ở form và BUS; giữ nguyên mã, ngày tạo khi sửa. Hủy form và lỗi ghi DAO không làm thay đổi dữ liệu đã lưu trong BUS.
- Dùng lại DataTable, ValidatedForm, FormField, ModalDialog và kiểu trình bày hiện có. SearchText được dùng chung cho khách hàng và nhân viên.
- EmployeePicker/EmployeeSelector trả nhân viên đã chọn bằng callback, có tùy chọn chỉ chọn người đang làm việc để dùng lại trong nghiệp vụ quản trị.
- Đã lưu 5 ảnh danh sách, form sửa, popup và giao diện mobile tại `docs/images/06-nhan-vien/`.
- Nháp báo cáo: `docs/bao-cao/III-triet-nhan-vien.md`; chưa tick báo cáo chính vì chưa gộp vào `docs/bao-cao/III-triet.md` và chưa hoàn tất tích hợp CSDL.
- Build thành công, 0 lỗi/0 cảnh báo; 29 kiểm tra Nhân viên và 48 kiểm tra trước đó đều đạt. Đã kiểm tra thao tác trên trình duyệt và bố cục 390 × 844 không tràn ngang.

## Tiêu chí nghiệm thu

Thêm, sửa, xóa, tìm được; không trùng mã

## Nhật ký tiến độ

| Ngày | Người | Đã làm | Công cụ AI | Ghi chú |
|---|---|---|---|---|
| 03/11/2026 | Triết | Hoàn thành bản demo web phần 06: CRUD, hồ sơ, tình trạng làm việc, tìm/lọc, popup chọn, kiểm tra dữ liệu; tái sử dụng component, lưu ảnh và nháp báo cáo | Codex | Local trên develop, chưa commit/push. Còn CSDL thật, liên kết tài khoản/giao dịch và báo cáo chính |

## Vướng mắc

- 03/11/2026: dữ liệu hiện nằm trong bộ nhớ theo phiên, chưa lưu bền vững; chờ phối hợp Vinh chốt schema, UNIQUE và tích hợp SQL/MyConnection.
- Tình trạng làm việc chưa liên kết đăng nhập/phân quyền; cần phối hợp Phúc khi tích hợp tài khoản.
- Chưa có quan hệ hóa đơn/phiếu nhập để chặn xóa nhân viên đã phát sinh giao dịch; cần bổ sung khi tích hợp CSDL.
- Popup web dùng callback theo phiên; chưa triển khai cơ chế biến static đặc thù của mẫu desktop.
- Chưa gộp nháp vào báo cáo III chính.
