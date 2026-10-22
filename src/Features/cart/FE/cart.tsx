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
import { useCart, type CartItem } from "@/Core/contexts/cart-context";

/* ================================================= */
/*                  HOVER BUTTON                     */
/* ================================================= */

function HoverButton({ children, style, hoverStyle, ...props }: any) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <Pressable
      {...props}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[style, hovered ? hoverStyle : null]}
    >
      {typeof children === "function" ? children(hovered) : children}
    </Pressable>
  );
}

/* ================================================= */
/*                  KIỂU DỮ LIỆU                    */
/* ================================================= */

type CartProduct = CartItem & { stock?: number }; // Thêm trường tồn kho để kiểm tra theo Activity

const formatPrice = (price: number) =>
  `${price.toLocaleString("vi-VN")}đ`;

/* ================================================= */
/*                  MÀN HÌNH GIỎ HÀNG               */
/* ================================================= */

export default function CartScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const router = useRouter();
  const { t } = useLanguage();

  const { items, itemCount, updateQuantity, removeItem, clear } = useCart();
  const products = items as CartProduct[];
  const [selectedIds, setSelectedIds] = React.useState<string[] | null>(null);

  const [pendingDelete, setPendingDelete] =
    React.useState<CartProduct | null>(null);

  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
  const [notice, setNotice] = React.useState("");
  const [customerName, setCustomerName] = React.useState("");
  const [deliveryAddress, setDeliveryAddress] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("Thanh toán khi nhận hàng");

  const selectedProducts = selectedIds === null
    ? products
    : products.filter((product) => selectedIds.includes(product.id));

  const subtotal = selectedProducts.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0,
  );

  const savings = selectedProducts.reduce(
    (sum, product) =>
      sum +
      Math.max(
        0,
        (product.originalPrice ?? product.price) - product.price,
      ) *
        product.quantity,
    0,
  );

  const shipping =
    selectedProducts.length === 0 || subtotal >= 5000000 ? 0 : 30000;

  const total = subtotal + shipping;

  /* ================================================= */
  /*                 XỬ LÝ SẢN PHẨM                   */
  /* ================================================= */

  // Cập nhật theo Nhánh ngoại lệ Activity: Kiểm tra số lượng hợp lệ và đủ tồn kho hay không
  const changeQuantity = (product: CartProduct, amount: number) => {
    const newQty = product.quantity + amount;
    const maxStock = product.stock ?? 10; // Mặc định tồn kho giả định nếu không có sẵn

    if (newQty <= 0) {
      setPendingDelete(product);
      return;
    }

    if (newQty > maxStock) {
      setNotice(t("Số lượng không hợp lệ hoặc không đủ hàng trong kho!"));
      return; // Quay lại bước nhập/kiểm tra (giữ nguyên số lượng cũ)
    }

    updateQuantity(product.id, amount);
  };

  const removeProduct = (id: string) => {
    removeItem(id);
    setSelectedIds((current) => current === null ? null : current.filter((item) => item !== id));
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => {
      if (current === null) return products.filter((product) => product.id !== id).map((product) => product.id);
      return current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((current) =>
      current === null || current.length === products.length
        ? []
        : products.map((product) => product.id),
    );
  };

  /* ================================================= */
  /*                       GIAO DIỆN                   */
  /* ================================================= */

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={isMobile ? styles.phoneHeader : styles.header}>
        <HoverButton
          style={styles.brandRow}
          onPress={() => router.push("/")}
        >
          <Image
            source={require("@/assets/image/logo.jpg")}
            style={isMobile ? styles.phoneLogoImage : styles.logoImage}
            resizeMode="cover"
          />

          <View style={styles.brandCopy}>
            <Text style={styles.logoText}>{t("BVP Shop")}</Text>

            {!isMobile && (
              <Text style={styles.headerSubtitle}>
                {t("Mua sắm dễ dàng · Giao hàng tận nơi")}
              </Text>
            )}
          </View>
        </HoverButton>

        <View style={styles.headerActions}>
          <LanguageSelector />

          {!isMobile && (
            <HoverButton
              style={styles.headerAction}
              hoverStyle={styles.headerActionHover}
              onPress={() => router.push("/orders")}
            >
              <Ionicons
                name="receipt-outline"
                size={23}
                color="#ffffff"
              />
              <Text style={styles.headerActionText}>
                {t("Đơn hàng")}
              </Text>
            </HoverButton>
          )}

        </View>
      </View>

      {/* NỘI DUNG GIỎ HÀNG */}

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={
          isMobile ? styles.phoneContent : styles.desktopContent
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* TIÊU ĐỀ */}

        <View style={styles.pageHeading}>
          <View style={styles.headingIcon}>
            <Ionicons
              name="cart-outline"
              size={25}
              color="red"
            />
          </View>

          <View style={styles.headingCopy}>
            <Text
              style={
                isMobile ? styles.phonePageTitle : styles.pageTitle
              }
            >
              {t("Giỏ hàng của tôi")}
            </Text>

            <Text style={styles.pageSubtitle}>
              {t("Kiểm tra sản phẩm và thông tin trước khi đặt hàng")}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.cartLayout,
            isMobile && styles.phoneCartLayout,
          ]}
        >
          {/* BẢNG SẢN PHẨM */}

          <View style={styles.cartPanel}>
            <View
              style={
                isMobile
                  ? styles.phonePanelHeader
                  : styles.panelHeader
              }
            >
              <View style={styles.panelTitleGroup}>
                <Text style={styles.panelTitle}>
                  {t("Sản phẩm trong giỏ")}
                </Text>

                <Text style={styles.panelSubtitle}>
                  {itemCount} {t("sản phẩm")} · {t("Đã chọn")}{" "}
                  {selectedProducts.length}
                </Text>
              </View>

              {products.length > 0 && (
                <HoverButton
                  style={styles.selectAllButton}
                  hoverStyle={styles.selectAllHover}
                  onPress={toggleSelectAll}
                >
                  <Ionicons
                    name={
                      selectedIds === null || selectedIds.length === products.length
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={18}
                    color="red"
                  />

                  <Text style={styles.selectAllText}>
                    {selectedIds === null || selectedIds.length === products.length
                      ? t("Bỏ chọn tất cả")
                      : t("Chọn tất cả")}
                  </Text>
                </HoverButton>
              )}
            </View>

            {/* DANH SÁCH SẢN PHẨM */}

            {products.map((product) => {
              const selected = selectedIds === null || selectedIds.includes(product.id);

              return (
                <View
                  key={product.id}
                  style={[
                    styles.productRow,
                    isMobile && styles.phoneProductRow,
                  ]}
                >
                  <Pressable
                    onPress={() => toggleSelected(product.id)}
                    style={styles.checkArea}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                  >
                    <Ionicons
                      name={
                        selected ? "checkbox" : "square-outline"
                      }
                      size={22}
                      color={selected ? "red" : "#999"}
                    />
                  </Pressable>

                  <View
                    style={[
                      styles.productImage,
                      isMobile && styles.phoneProductImage,
                    ]}
                  >
                    <Ionicons
                      name={product.icon}
                      size={isMobile ? 32 : 38}
                      color="#777"
                    />
                  </View>

                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>
                      {t(product.name)}
                    </Text>

                    <Text style={styles.productVariant}>
                      {t(product.variant)}
                    </Text>

                    <View
                      style={[
                        styles.productBottom,
                        isMobile && styles.phoneProductBottom,
                      ]}
                    >
                      <View style={styles.priceGroup}>
                        <Text style={styles.productPrice}>
                          {formatPrice(product.price)}
                        </Text>

                        {!!product.originalPrice && (
                          <Text style={styles.originalPrice}>
                            {formatPrice(product.originalPrice)}
                          </Text>
                        )}
                      </View>

                      <View
                        style={[
                          styles.quantityAndRemove,
                          isMobile &&
                            styles.phoneQuantityAndRemove,
                        ]}
                      >
                        <View style={styles.quantityControl}>
                          <Pressable
                            onPress={() =>
                              changeQuantity(product, -1)
                            }
                            style={styles.quantityButton}
                            accessibilityLabel={t("Giảm số lượng")}
                          >
                            <Ionicons
                              name="remove"
                              size={16}
                              color="#444"
                            />
                          </Pressable>

                          <Text style={styles.quantityText}>
                            {product.quantity}
                          </Text>

                          <Pressable
                            onPress={() =>
                              changeQuantity(product, 1)
                            }
                            style={styles.quantityButton}
                            accessibilityLabel={t("Tăng số lượng")}
                          >
                            <Ionicons
                              name="add"
                              size={16}
                              color="#444"
                            />
                          </Pressable>
                        </View>

                        <Pressable
                          onPress={() => setPendingDelete(product)}
                          style={styles.removeButton}
                          accessibilityLabel={`${t("Xóa")} ${t(product.name)}`}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color="#c62828"
                          />

                          {!isMobile && (
                            <Text style={styles.removeText}>
                              {t("Xóa")}
                            </Text>
                          )}
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* GIỎ HÀNG TRỐNG (Khớp nhánh kết thúc nhánh khi giỏ hàng không còn sản phẩm) */}

            {products.length === 0 && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="cart-outline"
                    size={42}
                    color="#aaa"
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  {t("Giỏ hàng đang trống")}
                </Text>

                <Text style={styles.emptyDescription}>
                  {t("Hãy khám phá các sản phẩm và thêm món đồ bạn yêu thích vào giỏ hàng.")}
                </Text>

                <HoverButton
                  style={styles.primaryButton}
                  hoverStyle={styles.primaryButtonHover}
                  onPress={() => router.push("/")}
                >
                  <Ionicons
                    name="storefront-outline"
                    size={17}
                    color="#ffffff"
                  />

                  <Text style={styles.primaryButtonText}>
                    {t("Tiếp tục mua sắm")}
                  </Text>
                </HoverButton>
              </View>
            )}

            {products.length > 0 && (
              <HoverButton
                style={styles.continueShopping}
                hoverStyle={styles.continueShoppingHover}
                onPress={() => router.push("/")}
              >
                <Ionicons
                  name="arrow-back"
                  size={16}
                  color="red"
                />

                <Text style={styles.continueShoppingText}>
                  {t("Tiếp tục mua sắm")}
                </Text>
              </HoverButton>
            )}
          </View>

          {/* TÓM TẮT ĐƠN HÀNG */}

          <View
            style={[
              styles.summaryPanel,
              isMobile && styles.phoneSummaryPanel,
            ]}
          >
            <Text style={styles.summaryTitle}>
              {t("Tóm tắt đơn hàng")}
            </Text>

            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>
                {t("Tạm tính (")}
                {selectedProducts.reduce(
                  (sum, product) => sum + product.quantity,
                  0,
                )}{" "}
                {t("sản phẩm)")}
              </Text>

              <Text style={styles.summaryValue}>
                {formatPrice(subtotal)}
              </Text>
            </View>

            {savings > 0 && (
              <View style={styles.summaryLine}>
                <Text style={styles.savingsLabel}>
                  {t("Ưu đãi sản phẩm")}
                </Text>

                <Text style={styles.savingsValue}>
                  -{formatPrice(savings)}
                </Text>
              </View>
            )}

            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>
                {t("Phí giao hàng")}
              </Text>

              <Text
                style={
                  shipping === 0
                    ? styles.freeShipping
                    : styles.summaryValue
                }
              >
                {shipping === 0
                  ? t("Miễn phí")
                  : formatPrice(shipping)}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>
                {t("Tổng cộng")}
              </Text>

              <Text style={styles.totalValue}>
                {formatPrice(total)}
              </Text>
            </View>

            <Text style={styles.vatNote}>
              {t("Đã bao gồm VAT (nếu có)")}
            </Text>

            <View style={styles.deliveryNotice}>
              <Ionicons
                name="car-outline"
                size={20}
                color="red"
              />

              <View style={styles.deliveryCopy}>
                <Text style={styles.deliveryTitle}>
                  {t("Miễn phí giao hàng")}
                </Text>

                <Text style={styles.deliveryDescription}>
                  {t("Cho đơn hàng từ 5.000.000đ")}
                </Text>
              </View>
            </View>

            <HoverButton
              style={[
                styles.checkoutButton,
                selectedProducts.length === 0 &&
                  styles.checkoutDisabled,
              ]}
              hoverStyle={styles.checkoutButtonHover}
              disabled={selectedProducts.length === 0}
              onPress={() => setShowCheckoutModal(true)}
            >
              <Text style={styles.checkoutButtonText}>
                {t("Tiến hành đặt hàng")}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#ffffff"
              />
            </HoverButton>

            <View style={styles.secureNote}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color="#16834a"
              />

              <Text style={styles.secureText}>
                {t("Thông tin của bạn được bảo mật")}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.footerNote}>
          {t("BVP Shop · Cảm ơn bạn đã mua sắm cùng chúng tôi!")}
        </Text>
      </ScrollView>

      {/* THÔNG BÁO THAO TÁC / NGOẠI LỆ */}

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

      {/* XÁC NHẬN XÓA SẢN PHẨM */}

      {!!pendingDelete && (
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalBackdropTouch}
            onPress={() => setPendingDelete(null)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons
                name="trash-outline"
                size={26}
                color="#c62828"
              />
            </View>

            <Text style={styles.modalTitle}>
              {t("Xóa sản phẩm?")}
            </Text>

            <Text style={styles.modalMessage}>
              {t("Bạn có chắc muốn xóa “")}{pendingDelete.name}{t("” khỏi giỏ hàng không?")}
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setPendingDelete(null)}
              >
                <Text style={styles.modalCancelText}>
                  {t("Hủy")}
                </Text>
              </Pressable>

              <Pressable
                style={styles.modalDeleteButton}
                onPress={() => {
                  removeProduct(pendingDelete.id);
                  setPendingDelete(null);
                  setNotice(t("Đã xóa sản phẩm khỏi giỏ hàng"));
                }}
              >
                <Text style={styles.modalDeleteText}>
                  {t("Xóa sản phẩm")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* XÁC NHẬN ĐẶT HÀNG */}

      {showCheckoutModal && (
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalBackdropTouch}
            onPress={() => setShowCheckoutModal(false)}
          />

          <View style={styles.modalCard}>
            <View
              style={[
                styles.modalIcon,
                styles.modalSuccessIcon,
              ]}
            >
              <Ionicons
                name="bag-check-outline"
                size={27}
                color="#16834a"
              />
            </View>

            <Text style={styles.modalTitle}>
              {t("Tiến hành đặt hàng")}
            </Text>

            <Text style={styles.checkoutSectionTitle}>{t("Sản phẩm đã chọn")}</Text>
            <ScrollView style={styles.selectedProducts} nestedScrollEnabled>
              {selectedProducts.map((product) => (
                <View key={product.id} style={styles.selectedProductRow}>
                  <Ionicons name={product.icon} size={22} color="#c62828" />
                  <View style={styles.selectedProductCopy}>
                    <Text style={styles.selectedProductName}>{t(product.name)}</Text>
                    <Text style={styles.selectedProductMeta}>
                      {product.quantity} x {formatPrice(product.price)}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.checkoutSectionTitle}>{t("Thông tin giao hàng")}</Text>
            <TextInput style={styles.checkoutInput} value={customerName} onChangeText={setCustomerName} placeholder={t("Họ và tên")} />
            <TextInput style={styles.checkoutInput} value={deliveryAddress} onChangeText={setDeliveryAddress} placeholder={t("Địa chỉ giao hàng")} />
            <Text style={styles.paymentLabel}>{t("Hình thức thanh toán")}</Text>
            {["Thanh toán khi nhận hàng", "Chuyển khoản ngân hàng"].map((method) => (
              <Pressable key={method} style={styles.paymentOption} onPress={() => setPaymentMethod(method)}>
                <Ionicons name={paymentMethod === method ? "radio-button-on" : "radio-button-off"} size={20} color="#c62828" />
                <Text>{t(method)}</Text>
              </Pressable>
            ))}
            <Text style={styles.checkoutTotal}>{t("Tổng thanh toán")}: {formatPrice(total)}</Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setShowCheckoutModal(false)}
              >
                <Text style={styles.modalCancelText}>
                  {t("Đóng")}
                </Text>
              </Pressable>

              <Pressable
                style={styles.modalDeleteButton}
                onPress={() => {
                  if (!customerName.trim() || !deliveryAddress.trim()) {
                    setNotice(t("Vui lòng nhập họ tên và địa chỉ giao hàng"));
                    return;
                  }
                  setShowCheckoutModal(false);
                  clear();
                  setSelectedIds([]);
                  setNotice(t("Đặt hàng thành công"));
                }}
              >
                <Text style={styles.modalDeleteText}>
                  {t("Xác nhận đặt hàng")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
      <AiConsultationWidget onPress={() => router.push("/chat")} />
    </View>
  );
}

/* ================================================= */
/*                      STYLES                       */
/* ================================================= */

const styles = StyleSheet.create({
  checkoutInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 9,
    color: "#222",
  },
  checkoutSectionTitle: {
    alignSelf: "flex-start",
    color: "#333",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 8,
  },
  selectedProducts: {
    width: "100%",
    maxHeight: 125,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 8,
  },
  selectedProductRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  selectedProductCopy: { flex: 1 },
  selectedProductName: { color: "#333", fontWeight: "700", fontSize: 13 },
  selectedProductMeta: { color: "#777", fontSize: 12, marginTop: 2 },
  paymentLabel: { alignSelf: "flex-start", color: "#333", fontWeight: "700", marginTop: 4, marginBottom: 6 },
  paymentOption: { width: "100%", flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  checkoutTotal: { alignSelf: "flex-start", color: "#c62828", fontWeight: "800", marginTop: 8 },
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
    gap: 10,
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

  brandCopy: {
    flexShrink: 1,
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
    gap: 20,
  },

  headerAction: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  phoneHeaderAction: {
    paddingHorizontal: 6,
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

  cartLayout: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 18,
  },

  phoneCartLayout: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 14,
    width: "100%",
  },

  cartPanel: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e9e9e9",
    overflow: "hidden",
  },

  panelHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  phonePanelHeader: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  panelTitleGroup: {
    flex: 1,
    minWidth: 0,
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

  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 7,
    borderRadius: 8,
  },

  selectAllHover: {
    backgroundColor: "#fff0f0",
  },

  selectAllText: {
    color: "#c00",
    fontSize: 12,
    fontWeight: "600",
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    gap: 12,
  },

  phoneProductRow: {
    width: "100%",
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 9,
  },

  checkArea: {
    paddingVertical: 6,
    flexShrink: 0,
  },

  productImage: {
    width: 86,
    height: 86,
    borderRadius: 13,
    backgroundColor: "#f6f6f6",
    borderWidth: 1,
    borderColor: "#eeeeee",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  phoneProductImage: {
    width: 64,
    height: 64,
    borderRadius: 11,
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  productInfo: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    gap: 6,
  },

  productName: {
    color: "#222",
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },

  productVariant: {
    color: "#888",
    fontSize: 12,
    flexShrink: 1,
  },

  productBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 7,
  },

  phoneProductBottom: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: 10,
    marginTop: 7,
  },

  priceGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  productPrice: {
    color: "red",
    fontSize: 16,
    fontWeight: "800",
  },

  originalPrice: {
    color: "#999",
    fontSize: 12,
    textDecorationLine: "line-through",
  },

  quantityAndRemove: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  phoneQuantityAndRemove: {
    alignSelf: "stretch",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },

  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 8,
    overflow: "hidden",
    height: 32,
  },

  quantityButton: {
    width: 31,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },

  quantityText: {
    minWidth: 30,
    textAlign: "center",
    color: "#333",
    fontSize: 13,
    fontWeight: "600",
  },

  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 5,
  },

  removeText: {
    color: "#c62828",
    fontSize: 12,
  },

  continueShopping: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },

  continueShoppingHover: {
    backgroundColor: "#fff8f8",
  },

  continueShoppingText: {
    color: "red",
    fontSize: 13,
    fontWeight: "600",
  },

  summaryPanel: {
    width: 320,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e9e9e9",
    padding: 20,
  },

  phoneSummaryPanel: {
    width: "100%",
    padding: 16,
  },

  summaryTitle: {
    color: "#222",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 20,
  },

  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 15,
  },

  summaryLabel: {
    color: "#666",
    fontSize: 12,
    flex: 1,
  },

  summaryValue: {
    color: "#333",
    fontSize: 13,
    fontWeight: "600",
  },

  savingsLabel: {
    color: "#16834a",
    fontSize: 12,
    flex: 1,
  },

  savingsValue: {
    color: "#16834a",
    fontSize: 13,
    fontWeight: "600",
  },

  freeShipping: {
    color: "#16834a",
    fontSize: 13,
    fontWeight: "700",
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 5,
  },

  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 13,
  },

  totalLabel: {
    color: "#222",
    fontSize: 15,
    fontWeight: "700",
  },

  totalValue: {
    color: "red",
    fontSize: 21,
    fontWeight: "800",
  },

  vatNote: {
    color: "#999",
    fontSize: 11,
    textAlign: "right",
    marginTop: 5,
  },

  deliveryNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff5f5",
    borderRadius: 11,
    padding: 12,
    marginTop: 19,
    marginBottom: 17,
  },

  deliveryCopy: {
    flex: 1,
  },

  deliveryTitle: {
    color: "#333",
    fontSize: 12,
    fontWeight: "700",
  },

  deliveryDescription: {
    color: "#888",
    fontSize: 11,
    marginTop: 3,
  },

  checkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "red",
    borderRadius: 11,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },

  checkoutButtonHover: {
    backgroundColor: "#d90000",
    transform: [{ scale: 1.02 }],
  },

  checkoutDisabled: {
    opacity: 0.45,
  },

  checkoutButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },

  secureNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
  },

  secureText: {
    color: "#777",
    fontSize: 11,
  },

  emptyState: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 38,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    color: "#333",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyDescription: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 7,
    marginBottom: 18,
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 17,
    paddingVertical: 12,
  },

  primaryButtonHover: {
    backgroundColor: "#d90000",
    transform: [{ scale: 1.02 }],
  },

  primaryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },

  footerNote: {
    textAlign: "center",
    color: "#999",
    fontSize: 11,
    marginTop: 22,
    marginBottom: 6,
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
});