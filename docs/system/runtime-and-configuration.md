# Chạy hệ thống và cấu hình

## Yêu cầu

- Node.js `>=20.19` và npm.
- .NET SDK 10 để chạy/build backend từ source.
- PostgreSQL/Supabase có schema cần thiết cho tính năng đang dùng.

## Local development

### Chỉ frontend

```bash
npm install
npm run dev
```

Vite mặc định chạy cổng `8080`, proxy `/api` đến `http://127.0.0.1:5100`. Chỉ chạy frontend không tự khởi động Gateway hoặc backend.

### Frontend với một phần backend

Tạo `.env` từ `.env.example`, cấu hình `ConnectionStrings__Supabase` và `Gateway__SharedKey`, sau đó chạy:

```bash
npm run dev:stack
```

Stack này chạy Vite `8080`, Gateway `5100`, Catalog `5101`, Localization `5102`. Nó không chạy Submission `5104` hoặc Analytics `5105`, vì vậy luồng đề xuất và dashboard tracking cần backend được khởi động riêng hoặc môi trường production.

## Production

- `npm run build` tạo thư mục `dist`.
- `npm start` chạy `scripts/web-server.mjs`, phục vụ `dist`, proxy `/api` tới `API_GATEWAY_URL` (mặc định mẫu là `http://127.0.0.1:5100`). Lệnh này không tự chạy backend.
- Root `Dockerfile` build frontend, publish năm service .NET và dùng `scripts/start-all.mjs` để khởi động backend rồi web server trong cùng container. Listener công khai dùng `PORT`; các port nội bộ mặc định là `5100`, `5101`, `5102`, `5104`, `5105`.

## Nhóm biến môi trường

| Biến | Dùng bởi | Ghi chú |
| --- | --- | --- |
| `ConnectionStrings__Supabase` | Backend | PostgreSQL connection string; chỉ đặt phía server |
| `Gateway__SharedKey` | Gateway và backend | Khóa dùng cho giao tiếp nội bộ; đặt secret riêng |
| `Admin__Enabled` | Gateway | Bật/tắt API admin; mặc định mẫu là `false` |
| `API_GATEWAY_URL` | Web server | Địa chỉ Gateway mà web server proxy tới |
| `API_EDGE_SECRET`, `Gateway__EdgeSecret` | Web server/Gateway | Tùy chọn kiểm tra header edge proxy |
| `Chat__GroqApiKey`, `Chat__GroqModel` | Gateway | Cấu hình assistant; không đưa API key vào frontend |
| `Cors__Origins__*` | Gateway | Origin được phép gọi Gateway |
| `ReverseProxy__Clusters__*__Destinations__d1__Address` | Gateway | Địa chỉ nội bộ từng backend service |

`.env.example` là danh sách tham khảo tên biến. Không ghi secret thật vào tài liệu hoặc commit `.env`.

## Health và chẩn đoán

Gateway và các service có `/health`. Trong production, web server có endpoint health tổng hợp; xem `scripts/web-server.mjs`. Khi API trả lỗi HTML hoặc không phải JSON, kiểm tra trước `API_GATEWAY_URL`, Gateway routing và trạng thái health của service đích.

## Triển khai và vận hành liên quan

- [Railway: một service](../deployment/railway/single-service.md)
- [Khắc phục API trả HTML](../deployment/railway/api-routing-fix.md)
- [Kế hoạch Gateway nhiều service](../deployment/railway/gateway-multi-service-plan.md)
- [Docker Compose](../../infrastructure/docker/README.md)
