# Chuyển giao giữa các công cụ AI

Dùng khi hết hạn mức của một công cụ (Claude Code, Codex, Gemini CLI, Copilot) và phải chuyển sang công cụ khác. Công cụ mới không nhớ cuộc trò chuyện cũ, nên mọi thứ cần ghi ở đây.

## Trước khi dừng
1. Commit những gì đang chạy được (hoặc `git stash`).
2. Điền mục bên dưới.

## Mẫu ghi

| Mục | Nội dung |
|---|---|
| Ngày giờ | |
| Người | |
| Chức năng (file trong progress/) | |
| Nhánh Git | |
| Công cụ vừa dừng | |
| Đã làm xong | |
| Đang làm dở (file nào, dòng nào) | |
| Việc tiếp theo | |
| Lỗi đang gặp | |

## Câu mở đầu cho công cụ mới
> Đọc AGENTS.md, progress/AI_HANDOFF.md và progress/<chức năng>.md. Chạy `git status` và `git diff` để xem phần đang làm dở. Tiếp tục từ mục "Việc tiếp theo". Chỉ sửa file thuộc chức năng này.

## Lịch sử chuyển giao
(Thêm mục mới ở trên cùng)

## 03/11/2026 — Ghép giao diện web/mobile

- Nhánh: `feature/web-mobile-gui`.
- Người dùng yêu cầu đưa giao diện cũ vào đúng sườn vừa kéo từ GitHub, tiếp tục hướng web/mobile.
- Giao diện nằm trong `SmartShop.GUI/Components`, không tạo SmartShop.Web chạy song song.
- Đã có project DTO, DAO demo, BUS và GUI. Startup project: SmartShop.GUI, solution: SmartShop.slnx.
- Chi tiết và kiểm tra: `progress/23-web-mobile-gui.md`; kiến trúc: `docs/KIEN_TRUC_WEB_MOBILE.md`.
- Tiếp theo: nhóm chốt schema SQL và DTO chính thức, thay DAO demo bằng SQL/MyConnection, thêm đăng nhập/phân quyền. Không coi UI demo là hoàn tất backend.
