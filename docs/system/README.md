# Tổng quan hệ thống SaigonCoffee

> Tài liệu này mô tả cấu trúc và cách các thành phần đang kết nối trong repository. Nội dung phản ánh mã nguồn tại thời điểm rà soát; route được cấu hình không đồng nghĩa service đã có đầy đủ tính năng.

## Tài liệu trong nhóm

- [Kiến trúc và luồng request](architecture.md)
- [Module và API](modules-and-apis.md)
- [Mô hình dữ liệu](data-model.md)
- [Chạy hệ thống và cấu hình](runtime-and-configuration.md)

## Tóm tắt

- **Frontend:** React 19, Vite 7, React Router 7; Leaflet/react-leaflet cho bản đồ.
- **Backend:** ASP.NET Core minimal APIs trên .NET 10, phía trước là YARP API Gateway.
- **Dữ liệu:** PostgreSQL/Supabase qua kết nối Npgsql từ backend.
- **Chạy local:** Vite trên `8080`, Gateway trên `5100`, Catalog trên `5101`, Localization trên `5102`. `npm run dev:stack` chạy bốn tiến trình này.
- **Production container:** root `Dockerfile` build frontend và khởi động Gateway, Catalog, Localization, Submission, Analytics trong một container; web server đưa `/api` về Gateway.

## Phạm vi tính năng hiện tại

Trang khách hàng gồm trang chủ, danh sách/chi tiết thương hiệu, đề xuất và bản đồ. Admin có dashboard và các màn hình quản lý thương hiệu, chi nhánh, đề xuất, phê duyệt. Backend đang có mã cho catalog, localization, submission và analytics; Gateway cũng có trợ lý chat. Gateway khai báo route cho reviews, nhưng trong `services/` hiện không có project review tương ứng.

## Tài liệu chi tiết hiện có

- [Lộ trình backend](../backend/roadmap.md)
- [Chat assistant với Groq](../backend/groq-chat.md)
- [Dịch mô tả thương hiệu](../backend/translation.md)
- [Schema và chi nhánh](../catalog/database-schema-and-branches.md)
- [Phân loại thương hiệu](../catalog/brand-categories.md)
- [Phát triển Admin Dashboard](../admin/local-development.md)
- [Triển khai Railway một service](../deployment/railway/single-service.md)
