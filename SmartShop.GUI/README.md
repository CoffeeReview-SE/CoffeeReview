# SmartShop.GUI

Giao diện Blazor C# .NET 10 chạy trên trình duyệt máy tính và điện thoại. Khởi chạy bằng `dotnet run --project SmartShop.GUI --launch-profile http --urls http://localhost:5188`.

| File/thư mục | Nội dung |
|---|---|
| Components/Layout/ShopShell.razor | Header, menu trái, điều hướng mobile, popup sản phẩm |
| Components/Pages/Catalog.razor | Trang chủ, danh mục, tìm kiếm, yêu thích |
| Components/Pages/Cart.razor | Giỏ hàng |
| Components/Pages/Checkout.razor | Form nhận hàng và đặt đơn demo |
| Components/Pages/Success.razor | Kết quả đặt hàng |
| Components/Pages/Orders.razor | Lịch sử đơn |
| Components/Pages/Admin.razor | Quản trị sản phẩm, đơn, thống kê |
| Components/Pages/Account.razor | Thông tin tài khoản demo |
| Components/Pages/Support.razor | Câu hỏi hỗ trợ |
| Components/Shared/ShopPageBase.cs | Điều hướng và gọi BUS từ giao diện |
| Components/Device.razor | Minh họa thiết bị |
| Services/ShopUiState.cs | Trạng thái UI dùng chung giữa các trang |
| wwwroot/app.css | Giao diện đen–đỏ và breakpoint responsive |

Chỉ gọi nghiệp vụ qua `SmartShop.BUS.ShopState`. Giao diện đọc model DTO, không sửa trực tiếp sản phẩm/đơn và không tham chiếu DAO. `Forms/` và `Resources/` là sườn cũ được giữ nguyên; các màn hình hiện tại ở `Components/Pages/`.
