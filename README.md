# SmartShop

Đồ án học phần Lập trình C#: phần mềm quản lý bán hàng đồ điện tử. WinForms 3 lớp GUI-BUS-DAO, SQL Server.

## Cấu trúc thư mục

```
SmartShop/
├── SmartShop.GUI/         # WinForms (Forms/Main, Auth, DanhMuc, NghiepVu, ThongKe, TimKiem)
├── SmartShop.BUS/         # Nghiệp vụ, tìm kiếm ArrayList
├── SmartShop.DAO/         # Truy cập CSDL, MyConnection
├── SmartShop.DTO/         # Các class thực thể
├── Database/              # Script SQL, dữ liệu mẫu, ERD
├── docs/
│   ├── word/              # Nơi lưu file .docx
│   ├── pdf/               # Yêu cầu của giảng viên, báo cáo PDF
│   ├── images/            # Ảnh form, mỗi chức năng một thư mục
│   ├── erd/               # Ảnh ERD
│   ├── bao-cao/           # Bản nháp từng mục báo cáo (.md)
│   ├── ai/                # Ghi chú dùng AI
│   └── KE_HOACH_CHI_TIET.md
├── progress/              # Báo cáo tiến độ từng chức năng (.md)
│   ├── TONG_QUAN.md       # Bảng tổng hợp, tự sinh
│   ├── AI_HANDOFF.md      # Chuyển giao khi đổi công cụ AI
│   ├── nhat-ky/           # Nhật ký họp hằng ngày
│   └── 01-... đến 22-...  # Mỗi chức năng một file
├── tools/
│   └── cap-nhat-tien-do.js
├── AGENTS.md              # Quy tắc chung cho mọi công cụ AI
├── CLAUDE.md              # Trỏ về AGENTS.md
├── GEMINI.md              # Trỏ về AGENTS.md
└── .github/copilot-instructions.md
```

## Báo cáo tiến độ

1. Làm xong một việc nhỏ thì tick `- [x]` trong file `progress/<chức năng>.md`, thêm một dòng vào Nhật ký tiến độ, sửa dòng `Trạng thái`.
2. Chạy `node tools/cap-nhat-tien-do.js` để cập nhật `progress/TONG_QUAN.md`.
3. Commit file progress cùng với code của chức năng đó.

## Công cụ AI
Mọi công cụ (Claude Code, Codex, Gemini CLI, Copilot) đọc chung `AGENTS.md`. Đổi công cụ giữa chừng thì ghi vào `progress/AI_HANDOFF.md`.
