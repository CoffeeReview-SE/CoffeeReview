import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LanguageSelector } from "@/Core/components/language-selector";
import { AiConsultationWidget } from "@/Core/components/ai-consultation-widget";
import { useLanguage } from "@/Core/contexts/language-context";
import {
  useCart,
  type Product,
} from "@/Core/contexts/cart-context";

/* ================================================= */
/*                  HOVER BUTTON                     */
/* ================================================= */

function HoverButton({
  children,
  style,
  hoverStyle,
  ...props
}: any) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <Pressable
      {...props}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[style, hovered ? hoverStyle : null]}
    >
      {typeof children === "function"
        ? children(hovered)
        : children}
    </Pressable>
  );
}

/* ================================================= */
/*                  KIỂU DỮ LIỆU                     */
/* ================================================= */

type OrderStatus =
  | "Tất cả"
  | "Chờ xác nhận"
  | "Đang giao"
  | "Hoàn thành"
  | "Đã hủy";

type Order = {
  id: string;
  date: string;
  items: string;
  total: string;
  status: Exclude<OrderStatus, "Tất cả">;
};

const initialOrders: Order[] = [
  {
    id: "DH26091001",
    date: "10/10/2026",
    items: "iPhone 16e 128GB · 1 sản phẩm",
    total: "16.990.000đ",
    status: "Chờ xác nhận",
  },
  {
    id: "DH26090802",
    date: "08/10/2026",
    items: "Tai nghe Bluetooth · 2 sản phẩm",
    total: "1.580.000đ",
    status: "Đang giao",
  },
  {
    id: "DH26090503",
    date: "05/10/2026",
    items: "Laptop ASUS Vivobook · 1 sản phẩm",
    total: "18.490.000đ",
    status: "Hoàn thành",
  },
  {
    id: "DH26090104",
    date: "01/10/2026",
    items: "Chuột không dây · 1 sản phẩm",
    total: "390.000đ",
    status: "Đã hủy",
  },
];

const tabs: OrderStatus[] = [
  "Tất cả",
  "Chờ xác nhận",
  "Đang giao",
  "Hoàn thành",
  "Đã hủy",
];

/* ================================================= */
/*                 MÀN HÌNH ĐƠN HÀNG                 */
/* ================================================= */

export default function OrdersScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const { addItems, itemCount } = useCart();

  const [orders, setOrders] =
    React.useState<Order[]>(initialOrders);

  const [activeTab, setActiveTab] =
    React.useState<OrderStatus>("Tất cả");

  const [search, setSearch] = React.useState("");

  // Trạng thái cho pop-up xác nhận hủy đơn hàng và thông báo thành công
  const [cancelOrderId, setCancelOrderId] = React.useState<string | null>(null);
  const [successModalMessage, setSuccessModalMessage] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState("");

  const filteredOrders = orders.filter((order) => {
    const matchesTab =
      activeTab === "Tất cả" ||
      order.status === activeTab;

    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      order.id.toLowerCase().includes(query) ||
      order.items.toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  /* ================================================= */
  /*                    MUA LẠI                       */
  /* ================================================= */

  const handleBuyAgain = (order: Order) => {
    if (order.status !== "Hoàn thành") {
      return;
    }

    const product: Product = {
      id: "LAPTOP_ASUS_VIVOBOOK",
      name: "Laptop ASUS Vivobook",
      price: 18490000,
      categoryId: "LAPTOP",
    };

    addItems([
      {
        product,
        quantity: 1,
      },
    ]);

    const message =
      `${t("Đã thêm ")}${t(product.name)}` +
      `${t(" vào giỏ hàng.")}`;

    setSuccessModalMessage(message);
  };

  /* ================================================= */
  /*                 XỬ LÝ HỦY ĐƠN                    */
  /* ================================================= */

  const initiateCancelOrder = (orderId: string) => {
    const selectedOrder = orders.find(
      (order) => order.id === orderId,
    );

    if (!selectedOrder) {
      return;
    }

    if (selectedOrder.status !== "Chờ xác nhận") {
      const message =
        selectedOrder.status === "Đã hủy"
          ? t("Đơn hàng này đã được hủy trước đó.")
          : t(
              "Không thể hủy đơn hàng này vì trạng thái hiện tại không cho phép hủy.",
            );

      setNotice(message);
      return;
    }

    // Mở pop-up xác nhận hủy
    setCancelOrderId(orderId);
  };

  const confirmCancelOrder = () => {
    if (!cancelOrderId) return;

    const orderId = cancelOrderId;
    setOrders((previousOrders) =>
      previousOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "Đã hủy",
            }
          : order,
      ),
    );

    setCancelOrderId(null);

    const successMessage =
      `${t("Đơn hàng")} #${orderId} ` +
      `${t("đã được hủy thành công.")}`;

    setSuccessModalMessage(successMessage);
  };

  /* ================================================= */
  /*                       GIAO DIỆN                   */
  /* ================================================= */

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View
        style={
          isMobile
            ? styles.phoneHeader
            : styles.header
        }
      >
        <HoverButton
          style={styles.brandRow}
          onPress={() => router.push("/")}
        >
          <Image
            source={require("@/assets/image/logo.jpg")}
            style={
              isMobile
                ? styles.phoneLogoImage
                : styles.logoImage
            }
            resizeMode="cover"
          />

          <View>
            <Text style={styles.logoText}>
              {t("BVP Shop")}
            </Text>

            {!isMobile && (
              <Text style={styles.headerSubtitle}>
                {t("Mua sắm dễ dàng · Giao hàng tận nơi")}
              </Text>
            )}
          </View>
        </HoverButton>

        <View style={styles.headerActions}>
          <LanguageSelector />

          {/* GIỎ HÀNG */}

          <HoverButton
            style={[
              styles.headerAction,
              isMobile && styles.phoneHeaderAction,
            ]}
            hoverStyle={styles.headerActionHover}
            onPress={() => router.push("/cart")}
            accessibilityRole="button"
            accessibilityLabel={t("Giỏ hàng")}
          >
            <View style={styles.cartIconContainer}>
              <Ionicons
                name="cart-outline"
                size={23}
                color="#ffffff"
              />

              {itemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {itemCount > 99 ? "99+" : itemCount}
                  </Text>
                </View>
              )}
            </View>

            {!isMobile && (
              <Text style={styles.headerActionText}>
                {t("Giỏ hàng")}
              </Text>
            )}
          </HoverButton>

          {/* TÀI KHOẢN */}

          <HoverButton
            style={[
              styles.headerAction,
              isMobile && styles.phoneHeaderAction,
            ]}
            hoverStyle={styles.headerActionHover}
            onPress={() => router.push("/account")}
            accessibilityRole="button"
            accessibilityLabel={t("Tài khoản")}
          >
            <Ionicons
              name="person-outline"
              size={23}
              color="#ffffff"
            />

            {!isMobile && (
              <Text style={styles.headerActionText}>
                {t("Tài khoản")}
              </Text>
            )}
          </HoverButton>
        </View>
      </View>

      {/* NỘI DUNG ĐƠN HÀNG */}

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={
          isMobile
            ? styles.phoneContent
            : styles.desktopContent
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeading}>
          <View style={styles.headingIcon}>
            <Ionicons
              name="receipt-outline"
              size={24}
              color="red"
            />
          </View>

          <View style={styles.headingCopy}>
            <Text
              style={
                isMobile
                  ? styles.phonePageTitle
                  : styles.pageTitle
              }
            >
              {t("Đơn hàng của tôi")}
            </Text>

            <Text style={styles.pageSubtitle}>
              {t("Theo dõi và quản lý các đơn hàng của bạn")}
            </Text>
          </View>
        </View>

        {/* THỐNG KÊ */}

        <View style={styles.summaryRow}>
          <SummaryCard
            icon="receipt-outline"
            label={t("Tổng đơn hàng")}
            value={`${orders.length}`}
            isMobile={isMobile}
          />

          <SummaryCard
            icon="time-outline"
            label={t("Chờ xác nhận")}
            value={`${
              orders.filter(
                (order) =>
                  order.status === "Chờ xác nhận",
              ).length
            }`}
            isMobile={isMobile}
          />

          <SummaryCard
            icon="bicycle-outline"
            label={t("Đang giao")}
            value={`${
              orders.filter(
                (order) => order.status === "Đang giao",
              ).length
            }`}
            isMobile={isMobile}
          />
        </View>

        {/* DANH SÁCH ĐƠN HÀNG */}

        <View style={styles.ordersPanel}>
          <View
            style={
              isMobile
                ? styles.phonePanelHeader
                : styles.panelHeader
            }
          >
            <View>
              <Text style={styles.panelTitle}>
                {t("Danh sách đơn hàng")}
              </Text>

              <Text style={styles.panelSubtitle}>
                {t("Bạn có ")}
                {filteredOrders.length}
                {t(" đơn hàng phù hợp")}
              </Text>
            </View>

            <View style={styles.searchBar}>
              <Ionicons
                name="search-outline"
                size={19}
                color="#777"
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={t("Tìm mã đơn hàng...")}
                placeholderTextColor="#888"
                style={styles.searchInput}
              />

              {search.length > 0 && (
                <Pressable
                  onPress={() => setSearch("")}
                  accessibilityRole="button"
                  accessibilityLabel={t("Xóa nội dung tìm kiếm")}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color="#999"
                  />
                </Pressable>
              )}
            </View>
          </View>

          {/* BỘ LỌC TRẠNG THÁI */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {tabs.map((tab) => {
              const selected = activeTab === tab;

              return (
                <HoverButton
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.tab,
                    selected && styles.tabActive,
                  ]}
                  hoverStyle={styles.tabHover}
                >
                  <Text
                    style={[
                      styles.tabText,
                      selected && styles.tabTextActive,
                    ]}
                  >
                    {t(tab)}
                  </Text>

                  {tab === "Tất cả" && (
                    <Text
                      style={[
                        styles.tabCount,
                        selected && styles.tabCountActive,
                      ]}
                    >
                      {orders.length}
                    </Text>
                  )}
                </HoverButton>
              );
            })}
          </ScrollView>

          {/* CÁC THẺ ĐƠN HÀNG */}

          <View style={styles.orderList}>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isMobile={isMobile}
                onCancel={initiateCancelOrder}
                onBuyAgain={handleBuyAgain}
              />
            ))}

            {filteredOrders.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="file-tray-outline"
                  size={44}
                  color="#bbb"
                />

                <Text style={styles.emptyTitle}>
                  {t("Không tìm thấy đơn hàng")}
                </Text>

                <Text style={styles.emptyDescription}>
                  {t("Thử thay đổi từ khóa hoặc trạng thái lọc.")}
                </Text>

                <HoverButton
                  style={styles.resetButton}
                  hoverStyle={styles.buttonHover}
                  onPress={() => {
                    setSearch("");
                    setActiveTab("Tất cả");
                  }}
                >
                  <Text style={styles.resetButtonText}>
                    {t("Xóa bộ lọc")}
                  </Text>
                </HoverButton>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.footerNote}>
          {t("BVP Shop · Cảm ơn bạn đã mua sắm cùng chúng tôi!")}
        </Text>
      </ScrollView>

      {/* TOAST / THÔNG BÁO LỖI */}
      {!!notice && (
        <View style={styles.toast}>
          <Ionicons
            name="alert-circle-outline"
            size={19}
            color="#c62828"
          />
          <Text style={styles.toastText}>{notice}</Text>
          <Pressable
            onPress={() => setNotice("")}
            accessibilityLabel={t("Đóng thông báo")}
          >
            <Ionicons
              name="close"
              size={18}
              color="#666"
            />
          </Pressable>
        </View>
      )}

      {/* MODAL XÁC NHẬN HỦY ĐƠN HÀNG */}
      {!!cancelOrderId && (
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalBackdropTouch}
            onPress={() => setCancelOrderId(null)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={26}
                color="#c62828"
              />
            </View>

            <Text style={styles.modalTitle}>
              {t("Xác nhận hủy đơn hàng")}
            </Text>

            <Text style={styles.modalMessage}>
              {t("Bạn có chắc chắn muốn hủy đơn hàng")} #{cancelOrderId}?
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setCancelOrderId(null)}
              >
                <Text style={styles.modalCancelText}>
                  {t("Không")}
                </Text>
              </Pressable>

              <Pressable
                style={styles.modalDeleteButton}
                onPress={confirmCancelOrder}
              >
                <Text style={styles.modalDeleteText}>
                  {t("Xác nhận hủy")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* MODAL THÔNG BÁO THÀNH CÔNG (HỦY ĐƠN HOẶC MUA LẠI) */}
      {!!successModalMessage && (
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalBackdropTouch}
            onPress={() => setSuccessModalMessage(null)}
          />

          <View style={styles.modalCard}>
            <View
              style={[
                styles.modalIcon,
                styles.modalSuccessIcon,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={27}
                color="#16834a"
              />
            </View>

            <Text style={styles.modalTitle}>
              {t("Hủy đơn hàng thành công")}
            </Text>

            <Text style={styles.modalMessage}>
              {successModalMessage}
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalCancelButton, { flex: 1 }]}
                onPress={() => setSuccessModalMessage(null)}
              >
                <Text style={styles.modalCancelText}>
                  {t("Đóng")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      <AiConsultationWidget
        onPress={() => router.push("/chat")}
      />
    </View>
  );
}

/* ================================================= */
/*                  THẺ THỐNG KÊ                     */
/* ================================================= */

function SummaryCard({
  icon,
  label,
  value,
  isMobile,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isMobile: boolean;
}) {
  return (
    <View
      style={[
        styles.summaryCard,
        isMobile && styles.phoneSummaryCard,
      ]}
    >
      <View style={styles.summaryIcon}>
        <Ionicons
          name={icon}
          size={isMobile ? 19 : 22}
          color="red"
        />
      </View>

      <View style={styles.summaryCopy}>
        <Text style={styles.summaryLabel}>
          {label}
        </Text>

        <Text
          style={
            isMobile
              ? styles.phoneSummaryValue
              : styles.summaryValue
          }
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ================================================= */
/*                 THẺ CHI TIẾT ĐƠN HÀNG             */
/* ================================================= */

function OrderCard({
  order,
  isMobile,
  onCancel,
  onBuyAgain,
}: {
  order: Order;
  isMobile: boolean;
  onCancel: (orderId: string) => void;
  onBuyAgain: (order: Order) => void;
}) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = React.useState(false);

  const statusStyle =
    order.status === "Hoàn thành"
      ? styles.statusSuccess
      : order.status === "Đang giao"
        ? styles.statusShipping
        : order.status === "Đã hủy"
          ? styles.statusCancelled
          : styles.statusPending;

  const statusIcon =
    order.status === "Hoàn thành"
      ? "checkmark-circle"
      : order.status === "Đang giao"
        ? "bicycle"
        : order.status === "Đã hủy"
          ? "close-circle"
          : "time";

  const statusColor =
    order.status === "Hoàn thành"
      ? "#16834a"
      : order.status === "Đang giao"
        ? "#1769aa"
        : order.status === "Đã hủy"
          ? "#c62828"
          : "#a86a00";

  const statusTextStyle =
    order.status === "Hoàn thành"
      ? styles.statusTextSuccess
      : order.status === "Đang giao"
        ? styles.statusTextShipping
        : order.status === "Đã hủy"
          ? styles.statusTextCancelled
          : styles.statusTextPending;

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderTopRow}>
        <View style={styles.orderIdGroup}>
          <View style={styles.orderIcon}>
            <Ionicons
              name="cube-outline"
              size={20}
              color="red"
            />
          </View>

          <View style={styles.orderIdCopy}>
            <Text style={styles.orderId}>
              {order.id}
            </Text>

            <Text style={styles.orderDate}>
              {t("Đặt ngày ")}
              {order.date}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, statusStyle]}>
          <Ionicons
            name={statusIcon as keyof typeof Ionicons.glyphMap}
            size={14}
            color={statusColor}
          />

          <Text
            style={[
              styles.statusText,
              statusTextStyle,
            ]}
          >
            {t(order.status)}
          </Text>
        </View>
      </View>

      <View style={styles.orderDivider} />

      <View
        style={
          isMobile
            ? styles.phoneOrderDetails
            : styles.orderDetails
        }
      >
        <View style={styles.productSummary}>
          <View style={styles.productPlaceholder}>
            <Ionicons
              name="hardware-chip-outline"
              size={26}
              color="#777"
            />
          </View>

          <View style={styles.productCopy}>
            <Text style={styles.productSummaryTitle}>
              {t("Sản phẩm trong đơn")}
            </Text>

            <Text style={styles.productSummaryText}>
              {t(order.items)}
            </Text>
          </View>
        </View>

        <View style={styles.orderTotalBlock}>
          <Text style={styles.totalLabel}>
            {t("Tổng thanh toán")}
          </Text>

          <Text style={styles.orderTotal}>
            {order.total}
          </Text>
        </View>
      </View>

      {/* CHI TIẾT ĐƠN HÀNG */}

      {expanded && (
        <View style={styles.expandedDetails}>
          <Text style={styles.expandedTitle}>
            {t("Thông tin đơn hàng")}
          </Text>

          <Text style={styles.expandedText}>
            {t("Mã đơn: ")}
            {order.id}
          </Text>

          <Text style={styles.expandedText}>
            {t("Ngày đặt: ")}
            {order.date}
          </Text>

          <Text style={styles.expandedText}>
            {t("Trạng thái hiện tại: ")}
            {t(order.status)}
          </Text>

          <Text style={styles.expandedText}>
            {t(
              "Địa chỉ giao hàng và thông tin vận chuyển sẽ được hiển thị khi kết nối dữ liệu đơn hàng.",
            )}
          </Text>
        </View>
      )}

      {/* CÁC NÚT THAO TÁC */}

      <View style={styles.orderBottomRow}>
        <Text style={styles.orderBottomHint}>
          <Ionicons
            name="shield-checkmark-outline"
            size={14}
            color="#777"
          />{" "}
          {t("Giao dịch an toàn")}
        </Text>

        <View style={styles.orderButtons}>
          <HoverButton
            onPress={() => setExpanded(!expanded)}
            style={styles.detailButton}
            hoverStyle={styles.detailButtonHover}
          >
            <Text style={styles.detailButtonText}>
              {expanded
                ? t("Thu gọn")
                : t("Chi tiết")}
            </Text>

            <Ionicons
              name={
                expanded
                  ? "chevron-up"
                  : "chevron-forward"
              }
              size={15}
              color="#444"
            />
          </HoverButton>

          {order.status === "Chờ xác nhận" && (
            <HoverButton
              onPress={() => onCancel(order.id)}
              style={styles.cancelButton}
              hoverStyle={styles.cancelButtonHover}
            >
              <Ionicons
                name="close-circle-outline"
                size={15}
                color="#c62828"
              />

              <Text style={styles.cancelButtonText}>
                {t("Hủy đơn hàng")}
              </Text>
            </HoverButton>
          )}

          {order.status === "Hoàn thành" && (
            <HoverButton
              style={styles.buyAgainButton}
              hoverStyle={styles.buttonHover}
              onPress={() => onBuyAgain(order)}
            >
              <Ionicons
                name="refresh-outline"
                size={15}
                color="#ffffff"
              />

              <Text style={styles.buyAgainText}>
                {t("Mua lại")}
              </Text>
            </HoverButton>
          )}
        </View>
      </View>
    </View>
  );
}

/* ================================================= */
/*                       STYLES                      */
/* ================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  contentScroll: {
    flex: 1,
  },

  header: {
    backgroundColor: "red",
    paddingHorizontal: 28,
    paddingTop: 35,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },

  phoneHeader: {
    backgroundColor: "red",
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },

  logoImage: {
    width: 65,
    height: 65,
    borderRadius: 8,
  },

  phoneLogoImage: {
    width: 48,
    height: 48,
    borderRadius: 7,
  },

  logoText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#ffe5e5",
    fontSize: 12,
    marginTop: 3,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerAction: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  phoneHeaderAction: {
    paddingHorizontal: 5,
    paddingVertical: 6,
  },

  headerActionHover: {
    backgroundColor: "rgba(255,255,255,0.16)",
    transform: [{ scale: 1.04 }],
  },

  headerActionText: {
    color: "#ffffff",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },

  cartIconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  cartBadge: {
    position: "absolute",
    top: -7,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "red",
  },

  cartBadgeText: {
    color: "red",
    fontSize: 10,
    fontWeight: "800",
  },

  desktopContent: {
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 28,
    maxWidth: 1240,
    width: "100%",
    alignSelf: "center",
  },

  phoneContent: {
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 24,
  },

  pageHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    gap: 12,
  },

  headingIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eeeeee",
    justifyContent: "center",
    alignItems: "center",
  },

  headingCopy: {
    flex: 1,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#222",
  },

  phonePageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#222",
  },

  pageSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  summaryCard: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eeeeee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  phoneSummaryCard: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 7,
    padding: 10,
    borderRadius: 12,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#fff0f0",
    justifyContent: "center",
    alignItems: "center",
  },

  summaryCopy: {
    flex: 1,
  },

  summaryLabel: {
    color: "#777",
    fontSize: 12,
  },

  summaryValue: {
    color: "#222",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 3,
  },

  phoneSummaryValue: {
    color: "#222",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 2,
  },

  ordersPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e9e9e9",
    overflow: "hidden",
  },

  panelHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
  },

  phonePanelHeader: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 13,
    gap: 13,
  },

  panelTitle: {
    color: "#222",
    fontSize: 19,
    fontWeight: "700",
  },

  panelSubtitle: {
    color: "#888",
    fontSize: 12,
    marginTop: 5,
  },

  searchBar: {
    height: 42,
    minWidth: 0,
    maxWidth: 310,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    paddingHorizontal: 11,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontSize: 13,
    color: "#333",
    outlineStyle: "none" as any,
  },

  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },

  tab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#f6f6f6",
    borderWidth: 1,
    borderColor: "#eeeeee",
  },

  tabActive: {
    backgroundColor: "red",
    borderColor: "red",
  },

  tabHover: {
    transform: [{ scale: 1.03 }],
  },

  tabText: {
    color: "#555",
    fontSize: 12,
    fontWeight: "600",
  },

  tabTextActive: {
    color: "#ffffff",
  },

  tabCount: {
    color: "#666",
    backgroundColor: "#e8e8e8",
    borderRadius: 10,
    minWidth: 19,
    textAlign: "center",
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    overflow: "hidden",
  },

  tabCountActive: {
    color: "red",
    backgroundColor: "#ffffff",
  },

  orderList: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 12,
  },

  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e9e9e9",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 4,
    elevation: 1,
  },

  orderTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },

  orderIdGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff0f0",
    justifyContent: "center",
    alignItems: "center",
  },

  orderIdCopy: {
    flex: 1,
  },

  orderId: {
    color: "#222",
    fontSize: 14,
    fontWeight: "800",
  },

  orderDate: {
    color: "#888",
    fontSize: 11,
    marginTop: 4,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusSuccess: {
    backgroundColor: "#e9f8ef",
  },

  statusShipping: {
    backgroundColor: "#eaf3ff",
  },

  statusCancelled: {
    backgroundColor: "#fff0f0",
  },

  statusPending: {
    backgroundColor: "#fff5df",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  statusTextSuccess: {
    color: "#16834a",
  },

  statusTextShipping: {
    color: "#1769aa",
  },

  statusTextCancelled: {
    color: "#c62828",
  },

  statusTextPending: {
    color: "#a86a00",
  },

  orderDivider: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 14,
  },

  orderDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  phoneOrderDetails: {
    gap: 13,
  },

  productSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    flex: 1,
  },

  productPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 11,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#eeeeee",
  },

  productCopy: {
    flex: 1,
  },

  productSummaryTitle: {
    color: "#444",
    fontSize: 12,
    fontWeight: "700",
  },

  productSummaryText: {
    color: "#777",
    fontSize: 12,
    marginTop: 5,
    lineHeight: 17,
  },

  orderTotalBlock: {
    alignItems: "flex-end",
    minWidth: 130,
  },

  totalLabel: {
    color: "#888",
    fontSize: 11,
  },

  orderTotal: {
    color: "red",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 5,
  },

  expandedDetails: {
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    gap: 5,
  },

  expandedTitle: {
    color: "#333",
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 3,
  },

  expandedText: {
    color: "#666",
    fontSize: 12,
    lineHeight: 18,
  },

  orderBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },

  orderBottomHint: {
    color: "#888",
    fontSize: 11,
  },

  orderButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dddddd",
    backgroundColor: "#ffffff",
  },

  detailButtonHover: {
    backgroundColor: "#f7f7f7",
    transform: [{ scale: 1.03 }],
  },

  detailButtonText: {
    color: "#444",
    fontSize: 12,
    fontWeight: "600",
  },

  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffcaca",
    backgroundColor: "#fff5f5",
  },

  cancelButtonHover: {
    backgroundColor: "#ffe5e5",
    transform: [{ scale: 1.03 }],
  },

  cancelButtonText: {
    color: "#c62828",
    fontSize: 12,
    fontWeight: "600",
  },

  buyAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "red",
  },

  buyAgainText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },

  buttonHover: {
    transform: [{ scale: 1.04 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 38,
    paddingHorizontal: 16,
  },

  emptyTitle: {
    color: "#333",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
  },

  emptyDescription: {
    color: "#888",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },

  resetButton: {
    backgroundColor: "red",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
  },

  resetButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },

  footerNote: {
    textAlign: "center",
    color: "#999",
    fontSize: 11,
    marginTop: 18,
  },

  toast: {
    position: "absolute",
    top: 18,
    right: 16,
    left: 16,
    alignSelf: "center",
    maxWidth: 520,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: "#f5c6cb",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    zIndex: 1100,
  },

  toastText: {
    flex: 1,
    color: "#c62828",
    fontSize: 13,
    fontWeight: "600",
  },

  modalBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 1000,
  },

  modalBackdropTouch: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  modalIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  modalSuccessIcon: {
    backgroundColor: "#eaf7ef",
  },

  modalTitle: {
    color: "#222",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },

  modalMessage: {
    color: "#666",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
  },

  modalActions: {
    flexDirection: "row",
    alignSelf: "stretch",
    gap: 10,
    marginTop: 22,
  },

  modalCancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  modalCancelText: {
    color: "#444",
    fontSize: 14,
    fontWeight: "700",
  },

  modalDeleteButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: "#d90000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  modalDeleteText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});