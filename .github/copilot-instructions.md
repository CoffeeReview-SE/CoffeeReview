# Hướng dẫn cho GitHub Copilot - SmartShop

Quy tắc đầy đủ nằm ở `AGENTS.md` ở gốc repo. Tóm tắt:

- WinForms 3 lớp GUI-BUS-DAO, SQL Server.
- GUI chỉ gọi BUS, BUS chỉ gọi DAO, DAO là nơi duy nhất dùng MyConnection.
- Không viết SQL trong GUI, dùng truy vấn có tham số.
- Tính tiền, trừ/cộng tồn, kiểm tra dữ liệu nằm ở BUS.
- Cột tiếng Việt dùng nvarchar.
- Không đưa mật khẩu hoặc khóa API vào code.
