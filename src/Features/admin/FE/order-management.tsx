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
import AdminSidebar from "./AdminSidebar";

// ===== KIỂU DỮ LIỆU ĐƠN HÀNG ĐÃ ĐỒNG BỘ =====
type Order = {
  id: string;
  customer: string;
  phone: string;
  items: string;
  total: number;
  status: "Chờ xác nhận" | "Đang giao" | "Hoàn thành" | "Đã hủy";
  payment: string;
  date: string;
  image: string;
};

// ===== DỮ LIỆU ĐỒNG BỘ TỪ TRANG ORDERS =====
const synchronizedOrders: Order[] = [
  {
    id: "DH26091001",
    customer: "Nguyễn Văn A",
    phone: "0901234567",
    items: "iPhone 16e 128GB · 1 sản phẩm",
    total: 16990000,
    status: "Chờ xác nhận",
    payment: "Chuyển khoản",
    date: "10/10/2026",
    image: "https://placehold.co/80x80/f4f4f4/555?text=iPhone",
  },
  {
    id: "DH26090802",
    customer: "Trần Thị B",
    phone: "0987654321",
    items: "Tai nghe Bluetooth · 2 sản phẩm",
    total: 1580000,
    status: "Đang giao",
    payment: "COD",
    date: "08/10/2026",
    image: "https://placehold.co/80x80/f4f4f4/555?text=Audio",
  },
  {
    id: "DH26090503",
    customer: "Lê Văn C",
    phone: "0912345678",
    items: "Laptop ASUS Vivobook · 1 sản phẩm",
    total: 18490000,
    status: "Hoàn thành",
    payment: "Chuyển khoản",
    date: "05/10/2026",
    image: "https://placehold.co/80x80/f4f4f4/555?text=Laptop",
  },
  {
    id: "DH26090104",
    customer: "Phạm Thị D",
    phone: "0934567890",
    items: "Chuột không dây · 1 sản phẩm",
    total: 390000,
    status: "Đã hủy",
    payment: "COD",
    date: "01/10/2026",
    image: "https://placehold.co/80x80/f4f4f4/555?text=Mouse",
  },
];

// ===== CÁC GIÁ TRỊ CỦA BỘ LỌC ĐỒNG BỘ =====
const statusOptions = [
  "Tất cả trạng thái",
  "Chờ xác nhận",
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
const money = (amount: number) =>
  amount.toLocaleString("vi-VN") + "đ";

// ===== HÀM XÁC ĐỊNH MÀU TRẠNG THÁI (Đồng bộ giao diện) =====
function getStatusStyle(status: string) {
  switch (status) {
    case "Chờ xác nhận":
      return {
        backgroundColor: "#fff5df",
        color: "#a86a00",
      };

    case "Đang giao":
      return {
        backgroundColor: "#eaf3ff",
        color: "#1769aa",
      };

    case "Hoàn thành":
      return {
        backgroundColor: "#e9f8ef",
        color: "#16834a",
      };

    case "Đã hủy":
      return {
        backgroundColor: "#fff0f0",
        color: "#c62828",
      };

    default:
      return {
        backgroundColor: "#f2f4f7",
        color: "#586579",
      };
  }
}

// ===== COMPONENT BỘ LỌC DẠNG DANH SÁCH =====
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

// ===== COMPONENT CHÍNH: QUẢN LÝ ĐƠN HÀNG =====
export default function OrderManagement() {
  const { width: screenWidth } = useWindowDimensions();

  const sidebarWidth = screenWidth <= 768 ? 220 : 255;
  const tableWidth = 1180;

  const availableContentWidth = Math.max(
    0,
    screenWidth - sidebarWidth - 48,
  );
  const ordersViewportWidth = Math.min(tableWidth, availableContentWidth);

  // ===== STATE QUẢN LÝ TÌM KIẾM VÀ BỘ LỌC =====
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState(statusOptions[0]);
  const [payment, setPayment] = useState(paymentOptions[0]);
  const [dateOrder, setDateOrder] = useState(dateOptions[0]);

  // ===== STATE QUẢN LÝ CHECKBOX =====
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ===== STATE DỮ LIỆU ĐƠN HÀNG ĐÃ ĐỒNG BỘ =====
  const [displayOrders, setDisplayOrders] = useState<Order[]>(synchronizedOrders);
  const [statusChangeId, setStatusChangeId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<Order["status"]>("Chờ xác nhận");
  const orderToUpdate = displayOrders.find((item) => item.id === statusChangeId) ?? null;

  // ===== LẤY DANH SÁCH ĐƠN HÀNG SAU KHI LỌC =====
  const filteredOrders = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return displayOrders
      .filter((order) =>
        `${order.id} ${order.customer} ${order.phone} ${order.items}`
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
          ? b.id.localeCompare(a.id)
          : a.id.localeCompare(b.id),
      );
  }, [keyword, status, payment, dateOrder, displayOrders]);

  function toggleOrder(id: string) {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id],
    );
  }

  const allVisibleSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((order) => selectedIds.includes(order.id));

  function toggleSelectAll() {
    if (allVisibleSelected) {
      const visibleIds = filteredOrders.map((order) => order.id);
      setSelectedIds((previous) =>
        previous.filter((id) => !visibleIds.includes(id)),
      );
    } else {
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

  function openStatusChange(id: string) {
    const order = displayOrders.find((item) => item.id === id);
    if (!order) return;
    setStatusChangeId(id);
    setNewStatus(order.status);
  }

  function saveStatusChange() {
    if (!orderToUpdate || !newStatus) return;
    setDisplayOrders((current) =>
      current.map((order) =>
        order.id === orderToUpdate.id ? { ...order, status: newStatus } : order,
      ),
    );
    setStatusChangeId(null);
    Alert.alert(
      "Cập nhật thành công",
      `Đơn hàng #${orderToUpdate.id} đã chuyển sang trạng thái "${newStatus}".`,
    );
  }

  function viewOrder(id: string) {
    const order = displayOrders.find((item) => item.id === id);

    if (!order) return;

    Alert.alert(
      `Đơn hàng #${order.id}`,
      `Khách hàng: ${order.customer}\n` +
        `Số điện thoại: ${order.phone}\n` +
        `Sản phẩm: ${order.items}\n` +
        `Tổng tiền: ${money(order.total)}\n` +
        `Trạng thái: ${order.status}\n` +
        `Thanh toán: ${order.payment}\n` +
        `Thời gian đặt: ${order.date}`,
      [
        { text: "Đóng", style: "cancel" },
        {
          text: "Cập nhật trạng thái",
          onPress: () => openStatusChange(order.id),
        },
      ],
    );
  }

  function navigateTo(page: string) {
    if (page === "order_management") return;

    const routes = {
      main_Admin: "/main_Admin",
      product_management: "/product_management",
      category_management: "/category_management",
      stock_inventory: "/stock_inventory",
      stock_movements: "/stock_movements",
      customer_management: "/customer_management",
    } as const;

    const route = routes[page as keyof typeof routes];

    if (route) {
      router.push(route as never);
      return;
    }

    Alert.alert("Điều hướng", `Không tìm thấy route cho trang ${page}.`);
  }

  return (
    <View style={styles.screen}>
      <AdminSidebar width={sidebarWidth} activePage="order_management" onNavigate={navigateTo} />

      <View
        style={[
          styles.page,
          {
            position: "absolute",
            left: sidebarWidth,
            right: 0,
            top: 0,
            bottom: 0,
          },
        ]}
      >
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

        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.mainContentInner}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.pageTitle}>Quản lý đơn hàng</Text>
          <Text style={styles.pageSubtitle}>
            Theo dõi và quản lý các đơn hàng đồng bộ từ cửa hàng.
          </Text>

          <View style={styles.filters}>
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={18}
                color="#758198"
              />

              <TextInput
                value={keyword}
                onChangeText={setKeyword}
                placeholder="Tìm mã đơn, khách hàng, sản phẩm, SDT..."
                placeholderTextColor="#94a3b8"
                style={styles.searchInput}
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
            </View>

            <FilterSelect
              label="Trạng thái đơn hàng"
              value={status}
              options={statusOptions}
              onChange={setStatus}
            />

            <FilterSelect
              label="Phương thức thanh toán"
              value={payment}
              options={paymentOptions}
              onChange={setPayment}
            />

            <FilterSelect
              label="Sắp xếp thời gian"
              value={dateOrder}
              options={dateOptions}
              onChange={setDateOrder}
            />
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              Tổng số: {filteredOrders.length} đơn hàng
            </Text>

            <Text style={styles.selectedText}>
              Đã chọn: {selectedIds.length}
            </Text>
          </View>

          <View
            style={[
              styles.orders,
              {
                width: ordersViewportWidth,
                alignSelf: "center",
              },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ width: tableWidth }}
            >
              <View style={{ width: tableWidth }}>
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
                  <Text style={[styles.cell, styles.itemsColumn]}>
                    Sản phẩm
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

                {filteredOrders.map((order) => {
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

                      <Text
                        style={[styles.cell, styles.customerColumn]}
                      >
                        {order.customer}
                      </Text>

                      <Text
                        style={[styles.cell, styles.itemsColumn]}
                        numberOfLines={1}
                      >
                        {order.items}
                      </Text>

                      <Text style={[styles.cell, styles.phoneColumn]}>
                        {order.phone}
                      </Text>

                      <Text
                        style={[
                          styles.cell,
                          styles.totalColumn,
                          styles.totalText,
                        ]}
                      >
                        {money(order.total)}
                      </Text>

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

                      <Text style={[styles.cell, styles.dateColumn]}>
                        {order.date}
                      </Text>

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

      <Modal
        visible={statusChangeId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusChangeId(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setStatusChangeId(null)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Cập nhật trạng thái đơn hàng</Text>
            <Text style={styles.modalDescription}>
              {orderToUpdate
                ? `Đơn hàng #${orderToUpdate.id} · ${orderToUpdate.customer}`
                : ""}
            </Text>

            {statusOptions
              .filter((option) => option !== statusOptions[0])
              .map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.optionItem,
                    newStatus === option && styles.optionSelected,
                  ]}
                  onPress={() => setNewStatus(option as Order["status"])}
                >
                  <Text
                    style={[
                      styles.optionText,
                      newStatus === option && styles.optionSelectedText,
                    ]}
                  >
                    {option}
                  </Text>
                  {newStatus === option && (
                    <Ionicons name="checkmark" size={19} color="#e52332" />
                  )}
                </Pressable>
              ))}

            <View style={styles.statusActions}>
              <Pressable
                style={styles.closeButton}
                onPress={() => setStatusChangeId(null)}
              >
                <Text style={styles.closeButtonText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={styles.saveStatusButton}
                onPress={saveStatusChange}
              >
                <Text style={styles.closeButtonText}>Lưu thay đổi</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ===== STYLE SHEET =====
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f8f9fc",
  },
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
  checkboxCell: {
    width: 42,
    alignItems: "center",
  },
  idColumn: {
    width: 140,
  },
  customerColumn: {
    width: 130,
  },
  itemsColumn: {
    width: 220,
  },
  phoneColumn: {
    width: 110,
  },
  totalColumn: {
    width: 120,
  },
  statusColumn: {
    width: 120,
  },
  paymentColumn: {
    width: 120,
  },
  dateColumn: {
    width: 120,
  },
  actionColumn: {
    width: 80,
  },
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
  emptyState: {
    width: "100%",
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyText: {
    color: "#758198",
    fontSize: 13,
  },
  modalDescription: {
    marginBottom: 12,
    color: "#758198",
    fontSize: 12,
  },
  statusActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  saveStatusButton: {
    minHeight: 42,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e52332",
    borderRadius: 8,
  },
});
