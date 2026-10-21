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

import { Ionicons } from "@expo/vector-icons";
import { LanguageSelector } from "@/Core/components/language-selector";
import { AiConsultationWidget } from "@/Core/components/ai-consultation-widget";
import { ProductCategoryPicker } from "@/Core/components/product-category-picker";
import { useLanguage } from "@/Core/contexts/language-context";
import { useCart } from "@/Core/contexts/cart-context";
import { useProductCategories } from "@/Core/hooks/use-product-categories";
import { useProducts } from "@/Core/hooks/use-products";

const categoryIcon = (categoryId: string, productName = ""): React.ComponentProps<typeof Ionicons>["name"] => {
  switch (categoryId.toUpperCase()) {
    case "PHONE1": return "phone-portrait-outline";
    case "LAPTOP": return "laptop-outline";
    case "WATCH1": return "watch-outline";
    case "ACC001": {
      const name = productName.toLowerCase();
      if (name.includes("ssd")) return "server-outline";
      if (name.includes("ram")) return "albums-outline";
      if (name.includes("cpu") || name.includes("gpu") || name.includes("rtx") || name.includes("core ultra")) return "hardware-chip-outline";
      if (name.includes("mainboard") || name.includes("motherboard")) return "git-network-outline";
      return "headset-outline";
    }
    default: return "cube-outline";
  }
};

/* ================================================= */
/*                 HOVER BUTTON                      */
/* ================================================= */

function HoverButton({ children, style, hoverStyle, ...props }: any) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <Pressable
      {...props}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[style, hovered ? hoverStyle : style]}
    >
      {typeof children === "function" ? children(hovered) : children}
    </Pressable>
  );
}

/* ================================================= */
/*                     APP                           */
/* ================================================= */

export default function App() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  return isMobile ? <PhoneLayout /> : <DesktopLayout />;
}

/* ================================================= */
/*             GIAO DIỆN ĐIỆN THOẠI                 */
/* ================================================= */

function PhoneLayout() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { products, error } = useProducts(true, language);
  const { categories } = useProductCategories(true, language);
  const { itemCount, addItem } = useCart();
  const [notice, setNotice] = React.useState("");
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);
  
  // Trạng thái tìm kiếm theo từ khóa (Khớp Activity: Nhập từ khóa hoặc tiêu chí lọc)[cite: 20]
  const [searchQuery, setSearchQuery] = React.useState("");

  const pricedProducts = products.filter((product) => product.price > 0);
  
  // Lọc theo danh mục và từ khóa tìm kiếm
  const visibleProducts = pricedProducts.filter((product) => {
    const matchesCategory = selectedCategoryId ? product.categoryId === selectedCategoryId : true;
    const matchesSearch = searchQuery.trim() === "" || product.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.phoneContainer}>
      {/* HEADER */}
      <View style={styles.phoneHeader}>
        <View style={styles.phoneLogo}>
          <Image
            source={require("@/assets/image/logo.jpg")}
            style={styles.phoneLogoImage}
          />
          <Text style={styles.phoneLogoText}>{t("BVP Shop")}</Text>
        </View>

        <View style={styles.phoneCustomerIcons}>
          <LanguageSelector />
          <HoverButton
            style={styles.phoneIconItem}
            hoverStyle={styles.iconItemHover}
            onPress={() => router.push("/cart")}
          >
            {(hovered: boolean) => (
              <>
                <View style={[styles.phoneIconButton, hovered && styles.iconButtonHover]}>
                  <Ionicons name="cart-outline" size={22} color={hovered ? "red" : "#ffffff"} />
                  {itemCount > 0 && <Text style={styles.cartBadge}>{itemCount}</Text>}
                </View>
                <Text style={styles.phoneIconText}>{t("Giỏ hàng")}</Text>
              </>
            )}
          </HoverButton>

          <HoverButton
            style={styles.phoneIconItem}
            hoverStyle={styles.iconItemHover}
            onPress={() => router.push("/orders")}
          >
            {(hovered: boolean) => (
              <>
                <View style={[styles.phoneIconButton, hovered && styles.iconButtonHover]}>
                  <Ionicons name="cube-outline" size={22} color={hovered ? "red" : "#ffffff"} />
                </View>
                <Text style={styles.phoneIconText}>{t("Đơn hàng")}</Text>
              </>
            )}
          </HoverButton>

          <HoverButton
            style={styles.phoneIconItem}
            hoverStyle={styles.iconItemHover}
            onPress={() => router.push("/account")}
          >
            {(hovered: boolean) => (
              <>
                <View style={[styles.phoneIconButton, hovered && styles.iconButtonHover]}>
                  <Ionicons name="person-outline" size={22} color={hovered ? "red" : "#ffffff"} />
                </View>
                <Text style={styles.phoneIconText}>{t("Tài khoản")}</Text>
              </>
            )}
          </HoverButton>
        </View>

        {/* Search bar tích hợp xử lý tìm kiếm */}
        <View style={styles.phoneSearchBar}>
          <TextInput
            testID="home-phone-search-input"
            placeholder={t("Tìm kiếm sản phẩm")}
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            underlineColorAndroid="transparent"
            style={styles.phoneSearchInput}
          />

          <HoverButton
            style={styles.phoneSearchButton}
            hoverStyle={styles.buttonHover}
          >
            <Ionicons name="search" size={20} color="#ffffff" />
          </HoverButton>
        </View>
      </View>

      <ScrollView
        style={styles.phoneContentScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.phoneBanner}>
          <View style={styles.phoneBannerLeft}>
            <Text style={styles.phoneBannerSmallTitle}>
              {t("MUA SẮM DỄ DÀNG - TIỆN LỢI MỖI NGÀY")}
            </Text>
            <Text style={styles.phoneBannerTitle}>
              {t("Sản phẩm chất lượng")}{"\n"}
              <Text style={styles.bannerTitleHighlight}>{t("Giá tốt mỗi ngày")}</Text>
            </Text>
            <Text style={styles.phoneBannerDescription}>
              {t("Khám phá hàng ngàn sản phẩm chính hãng với nhiều ưu đãi hấp dẫn.")}
            </Text>
            <HoverButton
              style={styles.phoneBuyButton}
              hoverStyle={styles.buttonHover}
            >
              <Text style={styles.buyButtonText}>{t("Mua ngay")}</Text>
            </HoverButton>
          </View>
          <View style={styles.phoneBannerRight}>
            <Image
              source={require("@/assets/image/Designer.png")}
              style={styles.phoneBannerImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <ProductCategoryPicker
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          compact
        />

        <View style={styles.phoneFeaturedProducts}>
          <View style={styles.titleRow}>
            <Text style={styles.phoneTitle}>{t("Sản phẩm nổi bật")}</Text>
            <HoverButton
              style={styles.viewAllButton}
              hoverStyle={styles.viewAllHover}
              onPress={() => router.push("/products")}
            >
              <Text style={styles.viewAll}>{t("Xem tất cả")}</Text>
            </HoverButton>
          </View>

          <View style={styles.phoneProductList}>
            {visibleProducts.map((product) => (
              <Pressable
                key={product.id}
                style={styles.phoneProductCard}
                onPress={() => router.push({ pathname: "/product_detail", params: { productId: product.id } })}
              >
                <View style={[styles.phoneProductImage, styles.productPlaceholder]}>
                  <Ionicons name={categoryIcon(product.categoryId, product.name)} size={58} color="#d9273e" />
                </View>
                <Text style={styles.phoneProductName} numberOfLines={2}>{t(product.name)}</Text>
                <Text style={styles.phonePrice}>{product.price.toLocaleString("vi-VN")} đ</Text>
                <Text style={styles.phoneStock}>{product.stock > 0 ? `${product.stock} ${t("sản phẩm")}` : t("Hết hàng")}</Text>

                <HoverButton
                  style={styles.addCartButton}
                  hoverStyle={styles.buttonHover}
                  onPress={() => {
                    addItem(product);
                    setNotice(t("Đã thêm vào giỏ hàng"));
                  }}
                >
                  <Text style={styles.addCartText}>{t("Thêm vào giỏ")}</Text>
                </HoverButton>
              </Pressable>
            ))}

            {/* Nhánh ngoại lệ: Thông báo không tìm thấy sản phẩm phù hợp và quay lại bước nhập/kiểm tra[cite: 20] */}
            {visibleProducts.length === 0 && (
              <View style={styles.emptySearchState}>
                <Ionicons name="search-outline" size={40} color="#999" />
                <Text style={styles.productLoadError}>
                  {t("Thông báo: Không tìm thấy sản phẩm phù hợp với từ khóa hoặc tiêu chí lọc.")}
                </Text>
                <Pressable
                  style={styles.clearSearchButton}
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedCategoryId(null);
                  }}
                >
                  <Text style={styles.clearSearchText}>{t("Quay lại / Xóa tìm kiếm")}</Text>
                </Pressable>
              </View>
            )}

            {error && products.length === 0 && <Text style={styles.productLoadError}>{t("Không tải được sản phẩm. Hãy kiểm tra kết nối máy chủ.")}</Text>}
          </View>
        </View>
      </ScrollView>
      {!!notice && (
        <Pressable style={styles.homeNotice} onPress={() => setNotice("")}>
          <Ionicons name="checkmark-circle" size={18} color="#16834a" />
          <Text style={styles.homeNoticeText}>{notice}</Text>
        </Pressable>
      )}
      <AiConsultationWidget onPress={() => router.push("/chat")} />
    </View>
  );
}

/* ================================================= */
/*             GIAO DIỆN LAPTOP                     */
/* ================================================= */

function DesktopLayout() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { products, error } = useProducts(true, language);
  const { categories } = useProductCategories(true, language);
  const { itemCount, addItem } = useCart();
  const [notice, setNotice] = React.useState("");
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);

  // Trạng thái tìm kiếm theo từ khóa (Khớp Activity: Nhập từ khóa hoặc tiêu chí lọc)[cite: 20]
  const [searchQuery, setSearchQuery] = React.useState("");

  const pricedProducts = products.filter((product) => product.price > 0);
  
  const visibleProducts = pricedProducts.filter((product) => {
    const matchesCategory = selectedCategoryId ? product.categoryId === selectedCategoryId : true;
    const matchesSearch = searchQuery.trim() === "" || product.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Image
            source={require("@/assets/image/logo.jpg")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>{t("BVP Shop")}</Text>
        </View>

        {/* Search bar tích hợp xử lý tìm kiếm */}
        <View style={styles.searchBar}>
          <TextInput
            testID="home-search-input"
            placeholder={t("Tìm kiếm sản phẩm")}
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            underlineColorAndroid="transparent"
            style={styles.searchInput}
          />

          <HoverButton
            style={styles.searchButton}
            hoverStyle={styles.buttonHover}
          >
            <Ionicons name="search" size={22} color="#ffffff" />
          </HoverButton>
        </View>

        <View style={styles.customerIcons}>
          <LanguageSelector />
          <HoverButton
            style={styles.iconItem}
            hoverStyle={styles.iconItemHover}
            onPress={() => router.push("/cart")}
          >
            {(hovered: boolean) => (
              <>
                <View style={[styles.iconButton, hovered && styles.iconButtonHover]}>
                  <Ionicons name="cart-outline" size={25} color={hovered ? "red" : "#ffffff"} />
                  {itemCount > 0 && <Text style={styles.cartBadge}>{itemCount}</Text>}
                </View>
                <Text style={styles.iconText}>{t("Giỏ hàng")}</Text>
              </>
            )}
          </HoverButton>

          <HoverButton
            style={styles.iconItem}
            hoverStyle={styles.iconItemHover}
            onPress={() => router.push("/orders")}
          >
            {(hovered: boolean) => (
              <>
                <View style={[styles.iconButton, hovered && styles.iconButtonHover]}>
                  <Ionicons name="cube-outline" size={25} color={hovered ? "red" : "#ffffff"} />
                </View>
                <Text style={styles.iconText}>{t("Đơn hàng")}</Text>
              </>
            )}
          </HoverButton>

          <HoverButton
            style={styles.iconItem}
            hoverStyle={styles.iconItemHover}
            onPress={() => router.push("/account")}
          >
            {(hovered: boolean) => (
              <>
                <View style={[styles.iconButton, hovered && styles.iconButtonHover]}>
                  <Ionicons name="person-outline" size={25} color={hovered ? "red" : "#ffffff"} />
                </View>
                <Text style={styles.iconText}>{t("Tài khoản")}</Text>
              </>
            )}
          </HoverButton>
        </View>
      </View>

      <ScrollView
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerSmallTitle}>
              {t("MUA SẮM DỄ DÀNG - TIỆN LỢI MỖI NGÀY")}
            </Text>
            <Text style={styles.bannerTitle}>
              {t("Sản phẩm chất lượng")}{"\n"}
              <Text style={styles.bannerTitleHighlight}>{t("Giá tốt mỗi ngày")}</Text>
            </Text>
            <Text style={styles.bannerDescription}>
              {t("Khám phá hàng ngàn sản phẩm chính hãng với nhiều ưu đãi hấp dẫn.")}
            </Text>
            <HoverButton
              style={styles.buyButton}
              hoverStyle={styles.buttonHover}
            >
              <Text style={styles.buyButtonText}>{t("Mua ngay")}</Text>
            </HoverButton>
          </View>
          <View style={styles.bannerRight}>
            <Image
              source={require("@/assets/image/Designer.png")}
              style={styles.bannerImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <ProductCategoryPicker
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />

        <View style={styles.featuredProducts}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{t("Sản phẩm nổi bật")}</Text>
            <HoverButton
              style={styles.viewAllButton}
              hoverStyle={styles.viewAllHover}
              onPress={() => router.push("/products")}
            >
              <Text style={styles.viewAll}>{t("Xem tất cả")}</Text>
            </HoverButton>
          </View>

          <View style={styles.productList}>
            {visibleProducts.map((product) => (
              <Pressable
                key={product.id}
                style={styles.productCard}
                onPress={() => router.push({ pathname: "/product_detail", params: { productId: product.id } })}
              >
                <View style={[styles.productImage, styles.productPlaceholder]}>
                  <Ionicons name={categoryIcon(product.categoryId, product.name)} size={72} color="#d9273e" />
                </View>
                <Text style={styles.productName} numberOfLines={2}>{t(product.name)}</Text>
                <Text style={styles.price}>{product.price.toLocaleString("vi-VN")} đ</Text>
                <Text style={styles.productStock}>{product.stock > 0 ? `${product.stock} ${t("sản phẩm")}` : t("Hết hàng")}</Text>

                <HoverButton
                  style={styles.addCartButton}
                  hoverStyle={styles.buttonHover}
                  onPress={() => {
                    addItem(product);
                    setNotice(t("Đã thêm vào giỏ hàng"));
                  }}
                >
                  <Text style={styles.addCartText}>{t("Thêm vào giỏ")}</Text>
                </HoverButton>
              </Pressable>
            ))}

            {/* Nhánh ngoại lệ: Thông báo không tìm thấy sản phẩm phù hợp và quay lại bước nhập/kiểm tra[cite: 20] */}
            {visibleProducts.length === 0 && (
              <View style={styles.emptySearchState}>
                <Ionicons name="search-outline" size={48} color="#999" />
                <Text style={styles.productLoadError}>
                  {t("Thông báo: Không tìm thấy sản phẩm phù hợp với từ khóa hoặc tiêu chí lọc.")}
                </Text>
                <Pressable
                  style={styles.clearSearchButton}
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedCategoryId(null);
                  }}
                >
                  <Text style={styles.clearSearchText}>{t("Quay lại / Xóa tìm kiếm")}</Text>
                </Pressable>
              </View>
            )}

            {error && products.length === 0 && <Text style={styles.productLoadError}>{t("Không tải được sản phẩm. Hãy kiểm tra kết nối máy chủ.")}</Text>}
          </View>
        </View>
      </ScrollView>
      {!!notice && (
        <Pressable style={styles.homeNotice} onPress={() => setNotice("")}>
          <Ionicons name="checkmark-circle" size={18} color="#16834a" />
          <Text style={styles.homeNoticeText}>{notice}</Text>
        </Pressable>
      )}
      <AiConsultationWidget onPress={() => router.push("/chat")} />
    </View>
  );
}

/* ================================================= */
/*                     STYLES                        */
/* ================================================= */

const styles = StyleSheet.create({
  cartBadge: {
    position: "absolute",
    right: -8,
    top: -8,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#ffd43b",
    color: "#8a1c1c",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    overflow: "hidden",
  },
  homeNotice: {
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
  homeNoticeText: { color: "#176b35", fontWeight: "700" },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentScroll: {
    flex: 1,
  },
  header: {
    backgroundColor: "red",
    paddingHorizontal: 25,
    paddingTop: 45,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 25,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 65,
    height: 65,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 27,
    fontWeight: "700",
    marginLeft: 12,
    color: "#ffffff",
  },
  searchBar: {
    flex: 1,
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
    height: "100%",
    borderWidth: 0,
    borderColor: "transparent",
    paddingHorizontal: 15,
    fontSize: 14,
    color: "#333",
  },
  searchButton: {
    width: 42,
    height: 42,
    marginRight: 3,
    borderRadius: 21,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  customerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 25,
  },
  iconItem: {
    alignItems: "center",
  },
  iconItemHover: {
    transform: [{ scale: 1.05 }],
  },
  iconButton: {
    width: 50,
    height: 40,
    borderRadius: 25,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonHover: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  iconText: {
    fontSize: 12,
    marginTop: 3,
    color: "#ffffff",
    fontWeight: "500",
  },
  banner: {
    margin: 20,
    backgroundColor: "#dbdbdb",
    borderRadius: 20,
    padding: 40,
    flexDirection: "row",
    minHeight: 300,
    overflow: "hidden",
  },
  bannerLeft: {
    flex: 1,
    justifyContent: "center",
  },
  bannerSmallTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "red",
    marginBottom: 15,
  },
  bannerTitle: {
    fontSize: 42,
    fontWeight: "800",
    color: "#222",
    lineHeight: 50,
  },
  bannerTitleHighlight: {
    color: "red",
  },
  bannerDescription: {
    fontSize: 15,
    color: "#555",
    marginTop: 15,
    lineHeight: 23,
    maxWidth: 500,
  },
  buyButton: {
    backgroundColor: "red",
    paddingVertical: 13,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignSelf: "flex-start",
    marginTop: 20,
  },
  buyButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  bannerRight: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerImage: {
    width: "100%",
    height: 260,
  },
  featuredProducts: {
    margin: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },
  productList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  productCard: {
    width: 220,
    minHeight: 300,
    justifyContent: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#eeeeee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 160,
    marginBottom: 10,
  },
  productPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff7f7",
    borderRadius: 10,
  },
  productStock: { color: "#667085", fontSize: 13, marginBottom: 10 },
  productLoadError: { color: "#667085", paddingVertical: 16, textAlign: "center" },
  emptySearchState: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    gap: 10,
  },
  clearSearchButton: {
    backgroundColor: "red",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 5,
  },
  clearSearchText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    lineHeight: 20,
    minHeight: 40,
    marginBottom: 7,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "red",
    marginBottom: 12,
  },
  addCartButton: {
    backgroundColor: "red",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  addCartText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  viewAllButton: {
    padding: 5,
  },
  viewAllHover: {
    transform: [{ scale: 1.05 }],
  },
  viewAll: {
    color: "red",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonHover: {
    transform: [{ scale: 1.05 }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  phoneContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  phoneContentScroll: {
    flex: 1,
  },
  phoneHeader: {
    backgroundColor: "red",
    paddingHorizontal: 15,
    paddingTop: 30,
    paddingBottom: 15,
  },
  phoneLogo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  phoneLogoImage: {
    width: 48,
    height: 48,
    borderRadius: 7,
  },
  phoneLogoText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 9,
  },
  phoneCustomerIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },
  phoneIconItem: {
    alignItems: "center",
  },
  phoneIconButton: {
    width: 42,
    height: 36,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  phoneIconText: {
    color: "#ffffff",
    fontSize: 10,
    marginTop: 2,
  },
  phoneSearchBar: {
    height: 44,
    marginTop: 15,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 5,
    overflow: "hidden",
  },
  phoneSearchInput: {
    flex: 1,
    height: "100%",
    borderWidth: 0,
    borderColor: "transparent",
    paddingHorizontal: 12,
    fontSize: 13,
    color: "#333",
  },
  phoneSearchButton: {
    width: 38,
    height: 38,
    marginRight: 3,
    borderRadius: 20,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  phoneBanner: {
    margin: 12,
    padding: 20,
    height: 410,
    backgroundColor: "#dbdbdb",
    borderRadius: 18,
    overflow: "hidden",
  },
  phoneBannerLeft: {
    justifyContent: "center",
  },
  phoneBannerSmallTitle: {
    fontSize: 9,
    fontWeight: "600",
    color: "red",
    marginBottom: 8,
  },
  phoneBannerTitle: {
    fontSize: 25,
    lineHeight: 34,
    fontWeight: "800",
    color: "#222",
  },
  phoneBannerDescription: {
    fontSize: 15,
    lineHeight: 18,
    color: "#555",
    marginTop: 10,
  },
  phoneBuyButton: {
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: "flex-start",
    marginTop: 15,
  },
  phoneBannerRight: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  phoneBannerImage: {
    width: "100%",
    height: 150,
  },
  phoneFeaturedProducts: {
    margin: 12,
  },
  phoneTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#222",
  },
  phoneProductList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  phoneProductCard: {
    width: "48%",
    minHeight: 270,
    justifyContent: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eeeeee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  phoneProductImage: {
    width: "100%",
    height: 118,
    marginBottom: 8,
  },
  phoneProductName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
    lineHeight: 17,
    minHeight: 34,
    marginBottom: 5,
  },
  phonePrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "red",
    marginBottom: 10,
  },
  phoneStock: {
    color: "#667085",
    fontSize: 11,
    marginBottom: 8,
  },
});