import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type Language = "vi" | "en";

const translations: Record<string, string> = {
  "Chọn ngôn ngữ": "Select language",
  "Đóng danh sách ngôn ngữ": "Close language list",
  "Ngôn ngữ": "Language",
  "Tiếng Việt": "Vietnamese",
  "BVP Shop": "BVP Shop",
  "Giỏ hàng": "Cart",
  "Đơn hàng": "Orders",
  "Tài khoản": "Account",
  "Trang chủ": "Home",
  "Tìm kiếm sản phẩm": "Search products",
  "Sản phẩm nổi bật": "Featured products",
  "Xem tất cả": "View all",
  "Điện thoại": "Phones",
  Laptop: "Laptops",
  "Phụ kiện": "Accessories",
  "Tất cả": "All",
  "Mua ngay": "Shop now",
  "Thêm vào giỏ": "Add to cart",
  "Giá tốt mỗi ngày": "Great prices every day",
  "Danh sách đơn hàng": "Order list",
  "Tìm mã đơn hàng...": "Search order number...",
  "Không tìm thấy đơn hàng": "No orders found",
  "Xóa bộ lọc": "Clear filters",
  "Sản phẩm trong đơn": "Products in order",
  "Tổng thanh toán": "Total payment",
  "Thông tin đơn hàng": "Order information",
  "Mua lại": "Buy again",
  "Sản phẩm trong giỏ": "Products in cart",
  "Giỏ hàng của bạn": "Your shopping cart",
  "Giỏ hàng đang trống": "Your cart is empty",
  "Tiếp tục mua sắm": "Continue shopping",
  "Tóm tắt đơn hàng": "Order summary",
  "Ưu đãi sản phẩm": "Product discount",
  "Phí giao hàng": "Delivery fee",
  "Tổng cộng": "Total",
  "Đã bao gồm VAT (nếu có)": "VAT included (if applicable)",
  "Miễn phí giao hàng": "Free delivery",
  "Tiến hành đặt hàng": "Place order",
  "Xóa": "Delete",
  "Hủy": "Cancel",
  "Đóng": "Close",
  "Xóa sản phẩm?": "Delete product?",
  "Xóa sản phẩm": "Delete product",
  "Đã hiểu": "Got it",
  "Mua sắm dễ dàng · Giao hàng tận nơi": "Easy shopping · Door-to-door delivery",
  "Giỏ hàng của tôi": "My cart",
  "Đơn hàng của tôi": "My orders",
  "Đăng nhập": "Log in",
  "Chào mừng bạn quay trở lại!": "Welcome back!",
  "Email hoặc số điện thoại": "Email or phone number",
  "Mật khẩu": "Password",
  "Nhớ đăng nhập": "Remember me",
  "Quên mật khẩu?": "Forgot password?",
  "Hoặc": "Or",
  "Đăng nhập bằng mạng xã hội": "Log in with social account",
  "Chưa có tài khoản? ": "Don't have an account? ",
  "Đăng ký ngay": "Sign up now",
  "Đăng ký": "Sign up",
  "Họ và tên": "Full name",
  "Số điện thoại": "Phone number",
  "Nhập email": "Enter email",
  "Nhập họ và tên": "Enter full name",
  "Nhập số điện thoại": "Enter phone number",
  "Nhập mật khẩu": "Enter password",
  "Quay lại tài khoản": "Back to account",
  "Thông tin cá nhân": "Personal information",
  "Cập nhật hồ sơ BVP Shop của bạn.": "Update your BVP Shop profile.",
  "Lưu thay đổi": "Save changes",
  "Địa chỉ giao hàng": "Delivery address",
  "Quản lý nơi nhận đơn hàng của bạn.": "Manage your delivery addresses.",
  "+ Thêm địa chỉ": "+ Add address",
  "Đặt làm địa chỉ mặc định": "Set as default address",
  "Lưu địa chỉ": "Save address",
  "Bạn chưa lưu địa chỉ nào": "You have no saved addresses",
  "Nhấn “Thêm địa chỉ” để bắt đầu.": "Tap “Add address” to get started.",
  "Mặc định": "Default",
  "Chỉnh sửa": "Edit",
  "Đặt mặc định": "Set as default",
  "Quên mật khẩu": "Forgot password",
  "Nhập email đã đăng ký": "Enter your registered email",
  "Gửi mã OTP": "Send OTP",
  "Quay lại đăng nhập": "Back to login",
  "Tài khoản của tôi": "My account",
  "Đăng xuất": "Log out",
  "Chỉnh sửa thông tin": "Edit information",
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("vi");
  const t = useCallback(
    (text: string) => (language === "en" ? translations[text] ?? text : text),
    [language],
  );
  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
