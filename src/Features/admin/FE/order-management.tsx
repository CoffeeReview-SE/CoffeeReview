
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// ===== KIỂU DỮ LIỆU ĐƠN HÀNG =====
// Mỗi đơn hàng gồm mã, khách hàng, số điện thoại, tổng tiền,
// trạng thái, hình thức thanh toán và thời gian đặt.
type Order = {
  id: string;
  customer: string;
  phone: string;
  total: number;
  status: string;
  payment: string;
  date: string;
  image: string;
};

// ===== DỮ LIỆU MẪU CÁC ĐƠN HÀNG =====
const orders: Order[] = [
  {
    id: "BVP001258",
    customer: "Nguyễn Văn A",
    phone: "0901234567",
    total: 1250000,
    status: "Đang xử lý",
    payment: "COD",
    date: "2025-09-28 14:32",
    image: "https://placehold.co/80x80/f4f4f4/555?text=Phone",
  },
  {
    id: "BVP001257",
    customer: "Trần Thị B",
    phone: "0987654321",
    total: 2490000,
    status: "Đang giao",
    payment: "Chuyển khoản",
    date: "2025-09-28 11:20",
    image: "https://placehold.co/80x80/f4f4f4/555?text=Headphone",
  },
  {
    id: "BVP001256",
    customer: "Lê Văn C",
    phone: "0912345678",
    total: 890000,
    status: "Hoàn thành",
    payment: "COD",
    date: "2025-09-27 16:45",
    image: "https://placehold.co/80x80/f4f4f4/555?text=Shoes",
  },
  {
    id: "BVP001255",
    customer: "Phạm Thị D",
    phone: "0934567890",
    total: 1860000,
    status: "Đang xử lý",
    payment: "Chuyển khoản",
    date: "2025-09-27 13:10",
    image: "https://placehold.co/80x80/f4f4f4/555?text=Bag",
  },
  {
    id: "BVP001254",
    customer: "Hoàng Văn E",
    phone: "0976543210",
    total: 3200000,
    status: "Đã hủy",
    payment: "COD",
    date: "2025-09-26 09:22",
    image: "https://placehold.co/80x80/f4f4f4/555?text=Watch",
  },
];

// ===== CÁC GIÁ TRỊ CỦA BỘ LỌC =====
const statusOptions = [
  "Tất cả trạng thái",
  "Đang xử lý",
  "Đang giao",
  "Hoàn thành",
  "Đã hủy",
];

const paymentOptions = [
  "Tất cả phương thức thanh toán",
  "COD",
  "Chuyển khoản",
];

const dateOptions = ["Mới nhất", "Cũ nhất"];

// ===== HÀM ĐỊNH DẠNG TIỀN TỆ =====
// Ví dụ: 1250000 -> 1.250.000đ
const money = (amount: number) =>
  amount.toLocaleString("vi-VN") + "đ";

// ===== HÀM XÁC ĐỊNH MÀU TRẠNG THÁI =====
function getStatusStyle(status: string) {
  switch (status) {
    case "Đang xử lý":
      return {
        backgroundColor: "#fff0d5",
        color: "#d97706",
      };

    case "Đang giao":
      return {
        backgroundColor: "#e2efff",
        color: "#1670df",
      };

    case "Hoàn thành":
      return {
        backgroundColor: "#dcfce7",
        color: "#16803d",
      };

    case "Đã hủy":
      return {
        backgroundColor: "#ffe4e8",
        color: "#dc2638",
      };

    default:
      return {
        backgroundColor: "#f2f4f7",
        color: "#586579",
      };
  }
}

// ===== COMPONENT BỘ LỌC DẠNG DANH SÁCH =====
// React Native không có thẻ <select> như HTML.
// Vì vậy, sử dụng Modal để người dùng chọn giá trị.
type FilterSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {/* Nút mở danh sách lựa chọn */}
      <Pressable
        style={styles.filterSelect}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.filterSelectText} numberOfLines={1}>
          {value}
        </Text>

        <Ionicons
          name="chevron-down"
          size={16}
          color="#64748b"
        />
      </Pressable>

      {/* Hộp thoại hiển thị các lựa chọn của bộ lọc */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={() => {}}
          >
            <Text style={styles.modalTitle}>{label}</Text>

            {options.map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.optionItem,
                  value === option && styles.optionSelected,
                ]}
                onPress={() => {
                  onChange(option);
                  setVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === option && styles.optionSelectedText,
                  ]}
                >
                  {option}
                </Text>

                {value === option && (
                  <Ionicons
                    name="checkmark"
                    size={19}
                    color="#e52332"
                  />
                )}
              </Pressable>
            ))}

            <Pressable
              style={styles.closeButton}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ===== COMPONENT SIDEBAR =====
// Thay thế thẻ <aside> và <nav> trong HTML.
type SidebarProps = {
  width: number;
  activePage: string;
  onNavigate: (page: string) => void;
};

function Sidebar({ width, activePage, onNavigate }: SidebarProps) {
  // Các mục điều hướng của trang quản trị
  const menuItems = [
    {
      label: "Tổng quan",
      icon: "home-outline" as const,
      page: "main_Admin",
    },
    {
      label: "Quản lý đơn hàng",
      icon: "cart-outline" as const,
      page: "order_management",
    },
    {
      label: "Quản lý sản phẩm",
      icon: "cube-outline" as const,
      page: "product_management",
    },
    {
      label: "Quản lý danh mục",
      icon: "grid-outline" as const,
      page: "category_management",
    },
    {
      label: "Quản lý khách hàng",
      icon: "person-outline" as const,
      page: "customer_management",
    },
  ];

  return (
    <View style={[styles.sidebar, { width }]}>
      {/* Logo cửa hàng */}
      <Pressable
        style={styles.brand}
        onPress={() => onNavigate("main_Admin")}
      >
        <Image
          source={require("@/assets/image/logo.jpg")}
          style={styles.brandImage}
          resizeMode="contain"
        />

        <Text style={styles.brandText}>
          BVP <Text style={styles.brandStrong}>Shop</Text>
        </Text>
      </Pressable>

      {/* Menu điều hướng */}
      <ScrollView
        style={styles.sidebarMenu}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item, index) => (
          <React.Fragment key={item.page}>
            {/* Tiêu đề nhóm QUẢN LÝ */}
            {index === 1 && (
              <Text style={styles.menuHeading}>QUẢN LÝ</Text>
            )}

            {/* Các trang trong menu */}
            <Pressable
              style={[
                styles.menuLink,
                activePage === item.page && styles.menuLinkActive,
              ]}
              onPress={() => onNavigate(item.page)}
            >
              <Ionicons
                name={item.icon}
                size={20}
                color={
                  activePage === item.page ? "#ffffff" : "#ed263d"
                }
              />

              <Text
                numberOfLines={1}
                style={[
                  styles.menuLinkText,
                  activePage === item.page &&
                    styles.menuLinkTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          </React.Fragment>
        ))}

        {/* Nhóm hệ thống */}
        <Text style={styles.systemHeading}>HỆ THỐNG</Text>

        {/* Đăng xuất */}
        <Pressable
          style={styles.menuLink}
          onPress={() =>
            Alert.alert(
              "Đăng xuất",
              "Bạn có muốn đăng xuất khỏi hệ thống không?",
              [
                { text: "Hủy", style: "cancel" },
                {
                  text: "Đăng xuất",
                  style: "destructive",
                  onPress: () => {
                    // TODO: Thực hiện logic đăng xuất tại đây.
                    Alert.alert(
                      "Thông báo",
                      "Bạn cần kết nối chức năng đăng xuất.",
                    );
                  },
                },
              ],
            )
          }
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#ed263d"
          />
          <Text style={styles.menuLinkText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>

      {/* Thẻ giới thiệu phía dưới sidebar */}
      <View style={styles.imageSide}>
        <Image
          source={require("@/assets/image/anh logo.png")}
          style={styles.promoImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

// ===== COMPONENT CHÍNH: QUẢN LÝ ĐƠN HÀNG =====
export default function OrderManagement() {
  const { width: screenWidth } = useWindowDimensions();

  // Thu nhỏ sidebar trên màn hình hẹp
  const sidebarWidth = screenWidth <= 768 ? 220 : 255;

  // ===== STATE QUẢN LÝ TÌM KIẾM VÀ BỘ LỌC =====
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState(statusOptions[0]);
  const [payment, setPayment] = useState(paymentOptions[0]);
  const [dateOrder, setDateOrder] = useState(dateOptions[0]);

  // ===== STATE QUẢN LÝ CHECKBOX =====
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ===== LẤY DANH SÁCH ĐƠN HÀNG SAU KHI LỌC =====
  // Tìm theo mã đơn, tên khách hàng, số điện thoại.
  // Lọc trạng thái, phương thức thanh toán và sắp xếp ngày đặt.
  const filteredOrders = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return orders
      .filter((order) =>
        `${order.id} ${order.customer} ${order.phone}`
          .toLowerCase()
          .includes(normalizedKeyword),
      )
      .filter(
        (order) =>
          status === statusOptions[0] || order.status === status,
      )
      .filter(
        (order) =>
          payment === paymentOptions[0] ||
          order.payment === payment,
      )
      .sort((a, b) =>
        dateOrder === "Mới nhất"
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date),
      );
  }, [keyword, status, payment, dateOrder]);

  // ===== CHỌN HOẶC BỎ CHỌN MỘT ĐƠN HÀNG =====
  function toggleOrder(id: string) {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id],
    );
  }

  // ===== CHỌN TẤT CẢ ĐƠN HÀNG ĐANG HIỂN THỊ =====
  const allVisibleSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((order) => selectedIds.includes(order.id));

  function toggleSelectAll() {
    if (allVisibleSelected) {
      // Bỏ chọn các đơn đang hiển thị, giữ nguyên lựa chọn khác.
      const visibleIds = filteredOrders.map((order) => order.id);

      setSelectedIds((previous) =>
        previous.filter((id) => !visibleIds.includes(id)),
      );
    } else {
      // Chọn tất cả đơn hàng đang hiển thị sau khi lọc.
      setSelectedIds((previous) =>
        Array.from(
          new Set([
            ...previous,
            ...filteredOrders.map((order) => order.id),
          ]),
        ),
      );
    }
  }

  // ===== XỬ LÝ NÚT THAO TÁC ĐƠN HÀNG =====
  // Hiện tại hiển thị thông tin cơ bản; có thể thay bằng màn hình chi tiết.
  function viewOrder(id: string) {
    const order = orders.find((item) => item.id === id);

    if (!order) return;

    Alert.alert(
      `Đơn hàng #${order.id}`,
      `Khách hàng: ${order.customer}\n` +
        `Số điện thoại: ${order.phone}\n` +
        `Tổng tiền: ${money(order.total)}\n` +
        `Trạng thái: ${order.status}\n` +
        `Thanh toán: ${order.payment}\n` +
        `Thời gian đặt: ${order.date}`,
      [{ text: "Đóng" }],
    );
  }

  // ===== ĐIỀU HƯỚNG SIDEBAR =====
  function navigateTo(page: string) {
    if (page === "order_management") return;

    if (page === "main_Admin") {
      router.push("/main_Admin");
      return;
    }

    // TODO: Thay bằng router.push(...) khi các trang đã được tạo.
    Alert.alert(
      "Điều hướng",
      `Bạn đã chọn trang ${page}. Hãy kết nối route tương ứng.`,
    );
  }

  return (
    <View style={styles.screen}>
      {/* Sidebar: thay thế thẻ <aside> trong HTML */}
      <Sidebar
        width={sidebarWidth}
        activePage="order_management"
        onNavigate={navigateTo}
      />

      {/* Khu vực nội dung bên phải sidebar */}
      <View
        style={[
          styles.page,
          {
            marginLeft: sidebarWidth,
            width: Math.max(0, screenWidth - sidebarWidth),
          },
        ]}
      >
        {/* Header: tài khoản Admin */}
        <View style={styles.header}>
          <View style={styles.accountAdmin}>
            <View style={styles.accountIcon}>
              <Ionicons
                name="person"
                size={18}
                color="#ed263d"
              />
            </View>

            <Text style={styles.accountName}>Admin</Text>
          </View>
        </View>

        {/* Nội dung chính của trang quản lý */}
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.mainContentInner}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tiêu đề trang */}
          <Text style={styles.pageTitle}>Quản lý đơn hàng</Text>
          <Text style={styles.pageSubtitle}>
            Theo dõi và quản lý các đơn hàng của cửa hàng.
          </Text>

          {/* Thanh tìm kiếm và bộ lọc */}
          <View style={styles.filters}>
            {/* Tìm theo mã đơn, tên khách hàng hoặc số điện thoại */}
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={18}
                color="#758198"
              />

              <TextInput
                value={keyword}
                onChangeText={setKeyword}
                placeholder="Tìm mã đơn, tên khách hàng, SDT..."
                placeholderTextColor="#94a3b8"
                style={styles.searchInput}
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
            </View>

            {/* Lọc trạng thái đơn hàng */}
            <FilterSelect
              label="Trạng thái đơn hàng"
              value={status}
              options={statusOptions}
              onChange={setStatus}
            />

            {/* Lọc phương thức thanh toán */}
            <FilterSelect
              label="Phương thức thanh toán"
              value={payment}
              options={paymentOptions}
              onChange={setPayment}
            />

            {/* Sắp xếp theo thời gian đặt */}
            <FilterSelect
              label="Sắp xếp thời gian"
              value={dateOrder}
              options={dateOptions}
              onChange={setDateOrder}
            />
          </View>

          {/* Hiển thị số lượng đơn hàng và số đơn đã chọn */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              Tổng số: {filteredOrders.length} đơn hàng
            </Text>

            <Text style={styles.selectedText}>
              Đã chọn: {selectedIds.length}
            </Text>
          </View>

          {/* Bảng đơn hàng: dùng ScrollView ngang thay cho <table> */}
          <View style={styles.orders}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
            >
              <View>
                {/* Tiêu đề bảng */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <View style={[styles.cell, styles.checkboxCell]}>
                    <Pressable
                      onPress={toggleSelectAll}
                      style={styles.checkboxPressable}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          allVisibleSelected &&
                            styles.checkboxChecked,
                        ]}
                      >
                        {allVisibleSelected && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="#ffffff"
                          />
                        )}
                      </View>
                    </Pressable>
                  </View>

                  <Text style={[styles.cell, styles.idColumn]}>
                    Mã đơn hàng
                  </Text>
                  <Text style={[styles.cell, styles.customerColumn]}>
                    Khách hàng
                  </Text>
                  <Text style={[styles.cell, styles.phoneColumn]}>
                    SDT
                  </Text>
                  <Text style={[styles.cell, styles.totalColumn]}>
                    Tổng tiền
                  </Text>
                  <Text style={[styles.cell, styles.statusColumn]}>
                    Trạng thái
                  </Text>
                  <Text style={[styles.cell, styles.paymentColumn]}>
                    Thanh toán
                  </Text>
                  <Text style={[styles.cell, styles.dateColumn]}>
                    Thời gian đặt
                  </Text>
                  <Text style={[styles.cell, styles.actionColumn]}>
                    Thao tác
                  </Text>
                </View>

                {/* Các hàng dữ liệu đơn hàng */}
                {filteredOrders.map((order) => {
                  // Xác định màu hiển thị tương ứng với trạng thái đơn hàng.
                  const statusStyle = getStatusStyle(order.status);
                  const isSelected = selectedIds.includes(order.id);

                  return (
                    <View
                      key={order.id}
                      style={[
                        styles.tableRow,
                        styles.dataRow,
                        isSelected && styles.selectedRow,
                      ]}
                    >
                      {/* Checkbox chọn từng đơn hàng */}
                      <View
                        style={[styles.cell, styles.checkboxCell]}
                      >
                        <Pressable
                          onPress={() => toggleOrder(order.id)}
                          style={styles.checkboxPressable}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              isSelected && styles.checkboxChecked,
                            ]}
                          >
                            {isSelected && (
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="#ffffff"
                              />
                            )}
                          </View>
                        </Pressable>
                      </View>

                      {/* Hình ảnh minh họa và mã đơn hàng */}
                      <View
                        style={[
                          styles.cell,
                          styles.idColumn,
                          styles.productCell,
                        ]}
                      >
                        <Image
                          source={{ uri: order.image }}
                          style={styles.productImage}
                          resizeMode="contain"
                        />

                        <Text style={styles.orderId}>
                          #{order.id}
                        </Text>
                      </View>

                      {/* Tên khách hàng */}
                      <Text
                        style={[styles.cell, styles.customerColumn]}
                      >
                        {order.customer}
                      </Text>

                      {/* Số điện thoại khách hàng */}
                      <Text style={[styles.cell, styles.phoneColumn]}>
                        {order.phone}
                      </Text>

                      {/* Tổng tiền đơn hàng */}
                      <Text
                        style={[
                          styles.cell,
                          styles.totalColumn,
                          styles.totalText,
                        ]}
                      >
                        {money(order.total)}
                      </Text>

                      {/* Trạng thái đơn hàng */}
                      <View
                        style={[
                          styles.cell,
                          styles.statusColumn,
                          styles.centerCell,
                        ]}
                      >
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: statusStyle.backgroundColor },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: statusStyle.color },
                            ]}
                          >
                            {order.status}
                          </Text>
                        </View>
                      </View>

                      {/* Phương thức thanh toán */}
                      <View
                        style={[
                          styles.cell,
                          styles.paymentColumn,
                          styles.centerCell,
                        ]}
                      >
                        <View style={styles.paymentBadge}>
                          <Text style={styles.paymentText}>
                            {order.payment}
                          </Text>
                        </View>
                      </View>

                      {/* Thời gian đặt đơn hàng */}
                      <Text style={[styles.cell, styles.dateColumn]}>
                        {order.date}
                      </Text>

                      {/* Nút xem thông tin đơn hàng */}
                      <View
                        style={[
                          styles.cell,
                          styles.actionColumn,
                          styles.centerCell,
                        ]}
                      >
                        <Pressable
                          style={styles.actionButton}
                          onPress={() => viewOrder(order.id)}
                          accessibilityLabel={`Xem đơn hàng ${order.id}`}
                        >
                          <Ionicons
                            name="ellipsis-horizontal"
                            size={20}
                            color="#ef3340"
                          />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}

                {/* Thông báo khi không có đơn hàng phù hợp */}
                {filteredOrders.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons
                      name="file-tray-outline"
                      size={34}
                      color="#94a3b8"
                    />
                    <Text style={styles.emptyText}>
                      Không tìm thấy đơn hàng phù hợp.
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// ===== STYLE SHEET =====
// Chuyển đổi CSS sang StyleSheet của React Native.
// Các thuộc tính như position: fixed, border-radius, flex và màu sắc
// được thay bằng những thuộc tính tương ứng mà React Native hỗ trợ.
const styles = StyleSheet.create({
  // Thiết lập mặc định cho trang
  screen: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f8f9fc",
  },

  // ===== SIDEBAR BVP SHOP =====
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    paddingTop: 20,
    paddingHorizontal: 13,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#f0f1f5",
    zIndex: 10,
    elevation: 4,
  },

  // Logo cửa hàng
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 25,
  },
  brandImage: {
    width: 48,
    height: 48,
  },
  brandText: {
    color: "#c8102e",
    fontSize: 21,
    fontWeight: "800",
  },
  brandStrong: {
    color: "#8f101f",
  },

  // Menu
  sidebarMenu: {
    flex: 1,
  },
  menuHeading: {
    marginTop: 19,
    marginBottom: 8,
    marginLeft: 6,
    color: "#758198",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  systemHeading: {
    marginTop: 26,
    marginBottom: 8,
    marginLeft: 6,
    color: "#758198",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Các trang trong menu
  menuLink: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    marginBottom: 5,
    borderRadius: 9,
  },
  menuLinkActive: {
    backgroundColor: "#e52332",
    shadowColor: "#ed263d",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 2,
  },
  menuLinkText: {
    flex: 1,
    color: "#354157",
    fontSize: 12,
    fontWeight: "500",
  },
  menuLinkTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },

  // Thẻ quảng bá phía dưới sidebar
  imageSide: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 12,
  },
  promoImage: {
    width: 170,
    height: 150,
  },

  // ===== HEADER =====
  page: {
    flex: 1,
    height: "100%",
  },
  header: {
    height: 70,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#edf0f5",
    zIndex: 2,
  },

  // Khối tài khoản Admin
  accountAdmin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffe5e9",
  },
  accountName: {
    color: "#263248",
    fontSize: 14,
    fontWeight: "600",
  },

  // ===== VÙNG NỘI DUNG CHÍNH =====
  mainContent: {
    flex: 1,
  },
  mainContentInner: {
    padding: 24,
    paddingBottom: 40,
  },
  pageTitle: {
    color: "#172033",
    fontSize: 23,
    fontWeight: "700",
    marginBottom: 6,
  },
  pageSubtitle: {
    color: "#758198",
    fontSize: 13,
    marginBottom: 20,
  },

  // ===== THANH TÌM KIẾM VÀ BỘ LỌC =====
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  searchBox: {
    flexGrow: 2,
    flexBasis: 230,
    minWidth: 180,
    minHeight: 42,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 7,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 9,
    color: "#172033",
    fontSize: 12,
    outlineStyle: "none",
  } as any,
  filterSelect: {
    flexGrow: 1,
    flexBasis: 145,
    minWidth: 125,
    minHeight: 42,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 7,
  },
  filterSelectText: {
    flex: 1,
    color: "#354157",
    fontSize: 12,
  },

  // ===== MODAL CHỌN BỘ LỌC =====
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  modalContent: {
    width: "100%",
    maxWidth: 380,
    padding: 18,
    backgroundColor: "#ffffff",
    borderRadius: 14,
  },
  modalTitle: {
    marginBottom: 12,
    color: "#172033",
    fontSize: 17,
    fontWeight: "700",
  },
  optionItem: {
    minHeight: 45,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 7,
  },
  optionSelected: {
    backgroundColor: "#fff0f2",
  },
  optionText: {
    color: "#354157",
    fontSize: 13,
  },
  optionSelectedText: {
    color: "#d71932",
    fontWeight: "600",
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    marginTop: 12,
    backgroundColor: "#e52332",
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },

  // ===== THÔNG TIN TỔNG QUAN BẢNG =====
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryText: {
    color: "#354157",
    fontSize: 13,
    fontWeight: "600",
  },
  selectedText: {
    color: "#e52332",
    fontSize: 12,
    fontWeight: "600",
  },

  // ===== BẢNG ĐƠN HÀNG =====
  orders: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0eeee",
    borderRadius: 10,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 62,
  },
  tableHeader: {
    minHeight: 48,
    backgroundColor: "#fff6f6",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f1f4",
  },
  dataRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f1f4",
    backgroundColor: "#ffffff",
  },
  selectedRow: {
    backgroundColor: "#fffafa",
  },
  cell: {
    paddingHorizontal: 9,
    paddingVertical: 10,
    justifyContent: "center",
    color: "#354157",
    fontSize: 12,
  },

  // Chiều rộng từng cột để bảng có thể cuộn ngang
  checkboxCell: {
    width: 42,
    alignItems: "center",
  },
  idColumn: {
    width: 180,
  },
  customerColumn: {
    width: 145,
  },
  phoneColumn: {
    width: 115,
  },
  totalColumn: {
    width: 120,
  },
  statusColumn: {
    width: 120,
  },
  paymentColumn: {
    width: 135,
  },
  dateColumn: {
    width: 155,
  },
  actionColumn: {
    width: 80,
  },

  // Checkbox chọn đơn hàng
  checkboxPressable: {
    minWidth: 30,
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  checkboxChecked: {
    borderColor: "#e52332",
    backgroundColor: "#e52332",
  },

  // Ảnh sản phẩm và mã đơn hàng
  productCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  productImage: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#f5f6f8",
  },
  orderId: {
    color: "#e52332",
    fontSize: 12,
    fontWeight: "600",
  },
  totalText: {
    color: "#172033",
    fontWeight: "700",
  },

  // Nhãn trạng thái và phương thức thanh toán
  centerCell: {
    alignItems: "flex-start",
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
  },
  paymentBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#f2f4f7",
  },
  paymentText: {
    color: "#586579",
    fontSize: 11,
  },

  // Nút thao tác đơn hàng
  actionButton: {
    width: 34,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ffe0e2",
    borderRadius: 5,
  },

  // Thông báo không có dữ liệu
  emptyState: {
    width: 1100,
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyText: {
    color: "#758198",
    fontSize: 13,
  },
});