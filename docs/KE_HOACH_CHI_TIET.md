# Kế hoạch chi tiết SmartShop (làm cùng công cụ AI)

Dựa trên Bảng phân công v1.0 (21/10/2026). Mỗi việc dưới đây có file theo dõi tương ứng trong `progress/`.
Tất cả trạng thái đang để "Chưa làm" theo bản v1.0. Hãy cập nhật theo thực tế của nhóm.

## 1. Quy trình làm một chức năng cùng AI

1. Tạo nhánh: `git checkout -b feature/<tên>` (lấy tên nhánh trong file progress).
2. Mở file `progress/<chức năng>.md`, đọc danh sách việc cần làm.
3. Giao cho công cụ AI từng việc nhỏ, không giao cả chức năng một lần.
4. Xem diff trong Git Changes, tự chạy thử, rồi commit.
5. Tick checklist, ghi một dòng nhật ký, ghi công cụ AI đã dùng.
6. Chụp ảnh form vào `docs/images/<chức năng>/`.
7. Chạy `node tools/cap-nhat-tien-do.js`, commit cùng code.

## 2. Gợi ý chọn công cụ theo loại việc

Đây là gợi ý, nhóm có thể đổi theo hạn mức và cảm nhận thực tế.

| Loại việc | Gợi ý |
|---|---|
| Gợi ý code khi gõ, sửa nhỏ trong form | Copilot trong Visual Studio |
| Việc nhiều file theo khuôn (DAO, BUS, DTO cho một bảng) | Claude Code hoặc Codex trong terminal |
| Đọc cả repo, giải thích code để ôn kiểm tra giấy | Gemini CLI hoặc Claude Code |
| Viết script SQL, dữ liệu mẫu | Bất kỳ công cụ nào, nhưng Vinh phải tự chạy và kiểm tra |
| Viết nháp báo cáo | Bất kỳ công cụ nào, người phụ trách đọc lại và sửa |

Lưu ý: phần mã cốt lõi (MyConnection, DAO, BUS, nút "...") mỗi người phải hiểu rõ vì có kiểm tra giấy 10 phút. Không nên để AI viết rồi dùng mà không đọc.

## 3. Kế hoạch theo giai đoạn

### Giai đoạn 1 - Khởi tạo (21-23/10)
Mốc: cả nhóm chạy được solution, kết nối được CSDL, thấy form chính.
- Phúc: `01-nen-tang-ket-noi` (solution, GitHub, MyConnection, khung DAO/BUS)
- Vinh: `02-co-so-du-lieu` (ERD, script SQL, dữ liệu mẫu)
- Triết: `04-form-chinh` (form chính, menu)
- Bảo: thử công cụ report và xls (`17-xuat-nhap-excel`, `18-report-pdf`), bản nháp form Sản phẩm (`08-san-pham-don-vi`)

### Giai đoạn 2 - Danh mục (24-29/10)
Mốc: mọi danh mục thêm, sửa, xóa, tìm được.
- Phúc: `03-dang-nhap-phan-quyen`, mẫu nút "..." (`14-nut-ba-cham`)
- Vinh: `11-bang-tham-so`, kiểm tra schema
- Triết: `05-khach-hang`, `06-nhan-vien`, `07-nha-cung-cap`, `09-tim-kiem-arraylist`
- Bảo: `08-san-pham-don-vi`, form tìm sản phẩm

### Giai đoạn 3 - Nghiệp vụ (30/10-05/11)
Mốc: lập được hóa đơn và phiếu nhập, tồn kho đổi đúng.
- Phúc: `12-hoa-don-ban` (main-sub, trừ tồn)
- Vinh: `13-phieu-nhap` (main-sub, cộng tồn)
- Triết: `10-tim-kiem-nang-cao`, `15-rang-buoc-du-lieu`
- Bảo: `17-xuat-nhap-excel`

### Giai đoạn 4 - Thống kê, báo cáo (06-10/11)
Mốc: thống kê khớp dữ liệu, in được PDF.
- Phúc: tích hợp, sửa lỗi liên module
- Vinh: `16-thong-ke`
- Triết: giao diện lọc thống kê, chỉnh form
- Bảo: `18-report-pdf`

### Giai đoạn 5 - Chốt (11-15/11)
Mốc: bản đóng băng, không còn lỗi nghiêm trọng. File: `21-kiem-thu-nghiem-thu`.
- Phúc: kiểm thử hồi quy, chạy thử máy sạch
- Vinh: kiểm tra số liệu
- Triết: kiểm tra giao diện, ràng buộc
- Bảo: kiểm tra xuất, nhập, report

### Giai đoạn 6 - Báo cáo (16/11 - tháng 12)
File: `20-bao-cao`, nháp ở `docs/bao-cao/`.
- Phúc: tổng hợp, định dạng, mục IV, V
- Vinh: mục II
- Triết: mục III phần danh mục và tìm kiếm
- Bảo: bìa, mục I, mục III phần sản phẩm và report

Hôm nay (02/11/2026) là trong giai đoạn 3 theo lịch. Nếu giai đoạn 1-2 chưa xong, ưu tiên hoàn thành trước, phần mở rộng (`19-mo-rong-uc15-19`) chỉ làm khi các mốc 1-4 đạt hạn.

## 4. Mẫu câu giao việc cho công cụ AI

Mẫu chung:
> Đọc AGENTS.md và progress/<file>.md. Làm việc: "<một dòng trong danh sách việc>". Chỉ sửa file thuộc chức năng này. Theo mô hình GUI-BUS-DAO, không viết SQL trong GUI. Làm xong thì liệt kê file đã sửa, đừng commit.

Ví dụ cho DAO/BUS một bảng:
> Dựa trên khung DAO/BUS mẫu của Sản phẩm, tạo DAO, BUS và DTO cho NhaCungCap theo đúng cùng kiểu. Dùng MyConnection, truy vấn có tham số.

Ví dụ cho tìm kiếm ArrayList:
> Trong BUS, nạp danh sách sản phẩm vào ArrayList một lần, viết hàm tìm theo tên và theo giá, lọc trên ArrayList, không query lại CSDL.

Ví dụ cho hóa đơn:
> Viết hàm lưu hóa đơn trong BUS: tính thành tiền từng dòng, tổng tiền, giảm giá, VAT lấy từ bảng tham số; lưu hóa đơn, chi tiết và trừ tồn trong một transaction ở DAO.

## 5. Tránh xung đột khi nhiều công cụ cùng làm

- Một nhánh, một công cụ AI tại một thời điểm.
- Không để nhiều người cùng sửa một form lớn.
- Commit trước mỗi lần giao việc mới cho AI.
- Phúc gộp vào `develop` sau khi review, `main` chỉ chứa bản đã kiểm tra.
- Hết hạn mức: điền `progress/AI_HANDOFF.md`, rồi mở công cụ khác với câu mở đầu trong file đó.

## 6. Điểm còn cần xác nhận (từ mục 11 của bảng phân công)

- Công nghệ chính: WinForms 3 lớp là phần lõi, Web/Mobile ưu tiên 3: Phúc hỏi GVHD
- Chuỗi kết nối: dùng SQL Server, không gắn hậu tố kiểu MySQL: Phúc hỏi GVHD
- "Report PDF: hóa đơn, bảng điểm": giả định thay bằng bảng thống kê: Phúc hỏi GVHD
- Công thức lợi nhuận, loại hóa đơn tính doanh thu: Vinh, Phúc
- UC04, UC11, UC15-UC19 có làm không: cả nhóm, hỏi GVHD
- Thông tin bìa (lớp, nhóm, họ tên, MSSV): Phúc
- Ngày cụ thể kiểm tra giấy (tuần 9-10), chấm (tuần 11-12), hạn nộp: Phúc
- Công cụ report PDF, thư viện Excel, phiên bản .NET: Bảo, Phúc
- Link repo GitHub: Phúc
