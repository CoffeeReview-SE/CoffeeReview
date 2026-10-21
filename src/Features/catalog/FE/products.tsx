
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

import { AiConsultationWidget } from "@/Core/components/ai-consultation-widget";
import { LanguageSelector } from "@/Core/components/language-selector";
import { useLanguage } from "@/Core/contexts/language-context";
import { useCart } from "@/Core/contexts/cart-context";
import { allFallbackProducts } from "@/Core/services/catalog-fallback";

const iconFor = (
  categoryId: string
): React.ComponentProps<typeof Ionicons>["name"] =>
  categoryId === "PHONE1"
    ? "phone-portrait-outline"
    : categoryId === "LAPTOP"
      ? "laptop-outline"
      : categoryId === "WATCH1"
        ? "watch-outline"
        : "headset-outline";

export default function ProductsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { itemCount, addItem } = useCart();
  const { width } = useWindowDimensions();

  const [notice, setNotice] = React.useState("");
  const [searchText, setSearchText] = React.useState("");

  // Responsive layout
  const isMobile = width < 700;
  const contentPadding = width < 380 ? 12 : isMobile ? 16 : 20;

  const cardWidth = isMobile
    ? Math.max(0, (width - contentPadding * 2 - 12) / 2)
    : 180;

  const categories = ["PHONE1", "LAPTOP", "WATCH1", "ACC001"];

  const normalizedSearch = searchText.trim().toLocaleLowerCase();

  const getProducts = (categoryId: string) =>
    allFallbackProducts.filter((product) => {
      const matchesCategory = product.categoryId === categoryId;

      const searchableText = [
        product.name,
        product.id,
        product.category,
      ]
        .join(" ")
        .toLocaleLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchableText.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });

  const handleAddToCart = (
    product: (typeof allFallbackProducts)[number]
  ) => {
    addItem(product);
    setNotice(t("Đã thêm vào giỏ hàng"));
  };

  return (
    <View style={styles.page}>
      {/* Desktop header - đồng bộ với Home */}
      {!isMobile && (
        <View style={styles.header}>
          <Pressable
            style={styles.brand}
            onPress={() => router.replace("/")}
          >
            <Image
              source={require("@/assets/image/logo.jpg")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandText}>{t("BVP Shop")}</Text>
          </Pressable>

          <View style={styles.searchBar}>
            <TextInput
              testID="products-search-input"
              value={searchText}
              onChangeText={setSearchText}
              placeholder={t("Tìm kiếm sản phẩm")}
              placeholderTextColor="#888"
              underlineColorAndroid="transparent"
              style={styles.searchInput}
              returnKeyType="search"
            />

            <Pressable
              style={styles.searchButton}
              accessibilityRole="button"
              accessibilityLabel={t("Tìm kiếm sản phẩm")}
            >
              <Ionicons
                name="search"
                size={22}
                color="#ffffff"
              />
            </Pressable>
          </View>

          <View style={styles.actions}>
            <LanguageSelector />

            <Pressable
              style={styles.headerAction}
              onPress={() => router.push("/cart")}
            >
              <View style={styles.iconButton}>
                <Ionicons
                  name="cart-outline"
                  size={25}
                  color="#ffffff"
                />
                {itemCount > 0 && (
                  <Text style={styles.badge}>{itemCount}</Text>
                )}
              </View>
              <Text style={styles.actionText}>
                {t("Giỏ hàng")}
              </Text>
            </Pressable>

            <Pressable
              style={styles.headerAction}
              onPress={() => router.push("/orders")}
            >
              <View style={styles.iconButton}>
                <Ionicons
                  name="cube-outline"
                  size={25}
                  color="#ffffff"
                />
              </View>
              <Text style={styles.actionText}>
                {t("Đơn hàng")}
              </Text>
            </Pressable>

            <Pressable
              style={styles.headerAction}
              onPress={() => router.push("/account")}
            >
              <View style={styles.iconButton}>
                <Ionicons
                  name="person-outline"
                  size={25}
                  color="#ffffff"
                />
              </View>
              <Text style={styles.actionText}>
                {t("Tài khoản")}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Mobile header - giữ nguyên */}
      {isMobile && (
        <View style={styles.mobileHeader}>
          <View style={styles.mobileTopRow}>
            <Pressable
              style={styles.brand}
              onPress={() => router.replace("/")}
            >
              <Image
                source={require("@/assets/image/logo.jpg")}
                style={styles.mobileLogo}
                resizeMode="contain"
              />
              <Text style={styles.mobileBrandText}>
                {t("BVP Shop")}
              </Text>
            </Pressable>

            <LanguageSelector />
          </View>

          <View style={styles.mobileActions}>
            <Pressable
              style={styles.mobileAction}
              onPress={() => router.push("/cart")}
            >
              <View style={styles.mobileIconWrapper}>
                <Ionicons
                  name="cart-outline"
                  size={23}
                  color="#fff"
                />
                {itemCount > 0 && (
                  <Text style={styles.badge}>{itemCount}</Text>
                )}
              </View>
              <Text style={styles.mobileActionText}>
                {t("Giỏ hàng")}
              </Text>
            </Pressable>

            <Pressable
              style={styles.mobileAction}
              onPress={() => router.push("/orders")}
            >
              <View style={styles.mobileIconWrapper}>
                <Ionicons
                  name="receipt-outline"
                  size={23}
                  color="#fff"
                />
              </View>
              <Text style={styles.mobileActionText}>
                {t("Đơn hàng")}
              </Text>
            </Pressable>

            <Pressable
              style={styles.mobileAction}
              onPress={() => router.push("/account")}
            >
              <View style={styles.mobileIconWrapper}>
                <Ionicons
                  name="person-outline"
                  size={23}
                  color="#fff"
                />
              </View>
              <Text style={styles.mobileActionText}>
                {t("Tài khoản")}
              </Text>
            </Pressable>
          </View>

          <View style={styles.mobileSearchBar}>
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={t("Tìm kiếm sản phẩm")}
              placeholderTextColor="#888"
              style={styles.searchInput}
              returnKeyType="search"
            />
            <View style={styles.mobileSearchIcon}>
              <Ionicons
                name="search"
                size={20}
                color="#fff"
              />
            </View>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: contentPadding,
            paddingBottom: isMobile ? 110 : 90,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Page heading */}
        <View style={styles.headingRow}>
          <View style={styles.headingTextContainer}>
            <Text
              style={[
                styles.title,
                isMobile && styles.mobileTitle,
              ]}
            >
              {t("Danh sách sản phẩm")}
            </Text>

            <Text
              style={[
                styles.subtitle,
                isMobile && styles.mobileSubtitle,
              ]}
            >
              {t("Khám phá sản phẩm theo từng danh mục")}
            </Text>
          </View>

          <Pressable
            style={[
              styles.backButton,
              isMobile && styles.mobileBackButton,
            ]}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.backText}>
              {t("Trang chủ")}
            </Text>
          </Pressable>
        </View>

        {/* Product categories */}
        {categories.map((categoryId) => {
          const products = getProducts(categoryId);

          if (products.length === 0) {
            return null;
          }

          return (
            <View key={categoryId} style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  isMobile && styles.mobileSectionTitle,
                ]}
              >
                {t(products[0]?.category ?? "")}
              </Text>

              <View
                style={[
                  styles.grid,
                  isMobile && styles.mobileGrid,
                ]}
              >
                {products.map((product) => (
                  <View
                    key={product.id}
                    style={[
                      styles.card,
                      { width: cardWidth },
                      isMobile && styles.mobileCard,
                    ]}
                  >
                    <Pressable
                      style={styles.productDetails}
                      onPress={() =>
                        router.push({
                          pathname: "/product_detail",
                          params: { productId: product.id },
                        })
                      }
                    >
                      <View
                        style={[
                          styles.productImage,
                          isMobile && styles.mobileProductImage,
                        ]}
                      >
                        <Ionicons
                          name={iconFor(product.categoryId)}
                          size={isMobile ? 40 : 48}
                          color="#d9273e"
                        />
                      </View>

                      <Text
                        style={[
                          styles.productName,
                          isMobile && styles.mobileProductName,
                        ]}
                        numberOfLines={2}
                      >
                        {t(product.name)}
                      </Text>

                      <Text
                        style={[
                          styles.price,
                          isMobile && styles.mobilePrice,
                        ]}
                      >
                        {product.price.toLocaleString("vi-VN")} đ
                      </Text>

                      <Text style={styles.stock}>
                        {product.stock} {t("sản phẩm")}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.addButton,
                        isMobile && styles.mobileAddButton,
                      ]}
                      onPress={() => handleAddToCart(product)}
                    >
                      <Ionicons
                        name="cart-outline"
                        size={isMobile ? 15 : 16}
                        color="#fff"
                      />
                      <Text style={styles.addText}>
                        {t("Thêm vào giỏ")}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {normalizedSearch.length > 0 &&
          categories.every(
            (categoryId) => getProducts(categoryId).length === 0
          ) && (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={40}
                color="#aaa"
              />
              <Text style={styles.emptyTitle}>
                {t("Không tìm thấy sản phẩm")}
              </Text>
              <Text style={styles.emptyDescription}>
                {t("Vui lòng thử từ khóa khác")}
              </Text>
            </View>
          )}
      </ScrollView>

      {!!notice && (
        <Pressable
          style={[
            styles.notice,
            isMobile && styles.mobileNotice,
          ]}
          onPress={() => setNotice("")}
        >
          <Ionicons
            name="checkmark-circle"
            size={18}
            color="#16834a"
          />
          <Text style={styles.noticeText}>{notice}</Text>
          <Ionicons
            name="close"
            size={18}
            color="#176b35"
          />
        </Pressable>
      )}

      <AiConsultationWidget
        onPress={() => router.push("/chat")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },

  scrollView: {
    flex: 1,
  },

  /* Desktop header - đồng bộ với Home */
  header: {
    backgroundColor: "red",
    paddingHorizontal: 25,
    paddingTop: 45,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 25,
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },

  logo: {
    width: 65,
    height: 65,
    borderRadius: 8,
  },

  brandText: {
    fontSize: 27,
    fontWeight: "700",
    marginLeft: 12,
    color: "#ffffff",
  },

  searchBar: {
    flex: 1,
    minWidth: 100,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 30,
    overflow: "hidden",
    paddingLeft: 5,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    borderWidth: 0,
    borderColor: "transparent",
    paddingHorizontal: 15,
    fontSize: 14,
    color: "#333",
    outlineStyle: "none",
  } as any,

  searchButton: {
    width: 42,
    height: 42,
    marginRight: 3,
    borderRadius: 21,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 25,
    flexShrink: 0,
  },

  headerAction: {
    alignItems: "center",
  },

  iconButton: {
    width: 50,
    height: 40,
    borderRadius: 25,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  actionText: {
    fontSize: 12,
    marginTop: 3,
    color: "#ffffff",
    fontWeight: "500",
  },

  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: "#ffd43b",
    color: "#8a1c1c",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
    lineHeight: 18,
  },

  /* Mobile header - giữ nguyên */
  mobileHeader: {
    width: "100%",
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#e00000",
    gap: 7,
  },

  mobileTopRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  mobileLogo: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },

  mobileBrandText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  mobileActions: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  mobileAction: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },

  mobileIconWrapper: {
    width: 38,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  mobileActionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
    marginTop: 1,
  },

  mobileSearchBar: {
    width: "100%",
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 22,
    overflow: "hidden",
  },

  mobileSearchIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d9273e",
    borderRadius: 20,
    marginRight: 1,
  },

  /* Main content */
  content: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingTop: 20,
  },

  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 22,
  },

  headingTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: "#222",
    fontSize: 28,
    fontWeight: "800",
  },

  mobileTitle: {
    fontSize: 21,
    lineHeight: 27,
  },

  subtitle: {
    color: "#777",
    marginTop: 5,
    fontSize: 14,
  },

  mobileSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },

  backButton: {
    flexShrink: 0,
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  mobileBackButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  backText: {
    color: "#b51f2d",
    fontWeight: "700",
    fontSize: 12,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    color: "#b51f2d",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 12,
  },

  mobileSectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  mobileGrid: {
    gap: 12,
  },

  card: {
    minHeight: 255,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ececec",
    justifyContent: "space-between",
  },

  mobileCard: {
    minHeight: 0,
    padding: 9,
    borderRadius: 10,
  },

  productDetails: {
    flex: 1,
  },

  productImage: {
    height: 92,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff5f5",
  },

  mobileProductImage: {
    height: 78,
  },

  productName: {
    minHeight: 40,
    marginTop: 9,
    color: "#222",
    fontWeight: "700",
    fontSize: 14,
  },

  mobileProductName: {
    minHeight: 36,
    marginTop: 7,
    fontSize: 12,
    lineHeight: 17,
  },

  price: {
    color: "#c62828",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 5,
  },

  mobilePrice: {
    fontSize: 13,
    lineHeight: 18,
  },

  stock: {
    color: "#777",
    fontSize: 12,
    marginTop: 4,
  },

  addButton: {
    marginTop: 9,
    paddingVertical: 9,
    paddingHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#d9273e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  mobileAddButton: {
    marginTop: 8,
    paddingVertical: 9,
    paddingHorizontal: 3,
    gap: 3,
  },

  addText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
    flexShrink: 1,
    textAlign: "center",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
  },

  emptyTitle: {
    marginTop: 12,
    color: "#333",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  emptyDescription: {
    marginTop: 6,
    color: "#777",
    fontSize: 13,
    textAlign: "center",
  },

  /* Feedback notification */
  notice: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 13,
    borderRadius: 12,
    backgroundColor: "#e9f8ee",
    borderWidth: 1,
    borderColor: "#b9e6c7",
  },

  mobileNotice: {
    bottom: 16,
    left: 12,
    right: 12,
    padding: 11,
  },

  noticeText: {
    flex: 1,
    color: "#176b35",
    fontWeight: "700",
    fontSize: 13,
  },
});