# SaigonCoffee

SaigonCoffee là ứng dụng khám phá thương hiệu và chi nhánh cà phê tại TP. Hồ Chí Minh. Repository hiện có giao diện khách hàng, khu vực quản trị, bản đồ, API Gateway và các backend service kết nối PostgreSQL/Supabase.

## Bắt đầu nhanh

Yêu cầu: Node.js `>=20.19`, npm và .NET SDK 10.

```bash
npm install
```

Để chạy giao diện độc lập:

```bash
npm run dev
```

Để chạy giao diện cùng Catalog, Localization và Gateway:

1. Sao chép `.env.example` thành `.env`.
2. Điền `ConnectionStrings__Supabase` và đặt `Gateway__SharedKey` riêng, đủ mạnh.
3. Chạy:

```bash
npm run dev:stack
```

Mở `http://localhost:8080`. `dev:stack` không chạy Analytics hoặc Submission; một số chức năng gọi hai service này cần môi trường triển khai đầy đủ. Lệnh không tự chạy SQL migration.

## Chạy production

`npm run build` tạo frontend trong `dist`. `npm start` chạy web server phục vụ `dist` và proxy `/api` đến `API_GATEWAY_URL`; cần khởi động Gateway cùng các service phía sau. Dockerfile ở thư mục gốc đóng gói frontend và năm service: Gateway, Catalog, Localization, Submission, Analytics. Runtime cần `ConnectionStrings__Supabase` và `Gateway__SharedKey`.

## Cấu trúc chính

- `apps/` — React SPA: trang khách hàng, quản trị, bản đồ và tracking.
- `services/` — API Gateway và backend .NET cho Catalog, Localization, Submission, Analytics.
- `infrastructure/Database/` — schema, migration và dữ liệu seed PostgreSQL.
- `scripts/` — chạy local stack và web server/proxy production.
- `docs/` — tài liệu hệ thống theo nhóm chủ đề.

## Tài liệu

- [Tổng quan hệ thống](docs/system/README.md)
- [Sơ đồ kiến trúc](docs/system/architecture.md)
- [Module và API](docs/system/modules-and-apis.md)
- [Mô hình dữ liệu](docs/system/data-model.md)
- [Chạy hệ thống và cấu hình](docs/system/runtime-and-configuration.md)
- [Mục lục tài liệu](docs/README.md)

## Ghi chú

- Admin API hiện không có đăng nhập người dùng tích hợp; chỉ bật endpoint quản trị trong môi trường được bảo vệ phù hợp. `Gateway__SharedKey` phục vụ xác thực giữa gateway và backend, không thay thế xác thực admin.
- Một số route review và một số tài liệu là kế hoạch/khung. Xem [Modules và API](docs/system/modules-and-apis.md) để biết trạng thái từng phần.
