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

  /*
   * Nếu màn hình nhỏ hơn 600px
   * => dùng giao diện điện thoại
   *
   * Nếu từ 600px trở lên
   * => dùng giao diện laptop / máy tính
   */

  const isMobile = width < 600;

  return isMobile ? <PhoneLayout /> : <DesktopLayout />;
}

/* ================================================= */
/*             GIAO DIỆN ĐIỆN THOẠI                 */
/* ================================================= */

function PhoneLayout() {
  const router = useRouter();

  return (
    <View style={styles.phoneContainer}>
      {/* ================================================= */}
      {/*                     HEADER                        */}
      {/* ================================================= */}

      <View style={styles.phoneHeader}>
        {/* logo */}
        <View style={styles.phoneLogo}>
          <Image
            source={require("@/assets/image/logo.jpg")}
            style={styles.phoneLogoImage}
          />

          <Text style={styles.phoneLogoText}>BVP Shop</Text>
        </View>

        {/* Customer icons */}
        <View style={styles.phoneCustomerIcons}>
          <LanguageSelector />
          {/* Giỏ hàng */}
          <HoverButton
            style={styles.phoneIconItem}
            hoverStyle={styles.iconItemHover}
            onPress={() => router.push("/cart")}
          >
            {(hovered: boolean) => (
              <>
                <View
                  style={[
                    styles.phoneIconButton,
                    hovered && styles.iconButtonHover,
                  ]}
                >
                  <Ionicons
                    name="cart-outline"
                    size={22}
                    color={hovered ? "red" : "#ffffff"}
                  />
                </View>

                <Text style={styles.phoneIconText}>Giỏ hàng</Text>
              </>
            )}
          </HoverButton>

          {/* Đơn hàng */}
          <HoverButton
            style={styles.phoneIconItem}
            hoverStyle={styles.iconItemHover}
            onPress={() => router.push("/orders")}
          >
            {(hovered: boolean) => (
              <>
                <View
                  style={[
                    styles.phoneIconButton,
                    hovered && styles.iconButtonHover,
                  ]}
                >
                  <Ionicons
                    name="cube-outline"
                    size={22}
                    color={hovered ? "red" : "#ffffff"}
                  />
                </View>

                <Text style={styles.phoneIconText}>Đơn hàng</Text>
              </>
            )}
          </HoverButton>

          {/* Tài khoản */}
          <HoverButton
            style={styles.phoneIconItem}
            hoverStyle={styles.iconItemHover}
            onPress={() => router.push("/account")}
          >
            {(hovered: boolean) => (
              <>
                <View
                  style={[
                    styles.phoneIconButton,
                    hovered && styles.iconButtonHover,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={22}
                    color={hovered ? "red" : "#ffffff"}
                  />
                </View>

                <Text style={styles.phoneIconText}>Tài khoản</Text>
              </>
            )}
          </HoverButton>
        </View>

        {/* Search bar */}
        <View style={styles.phoneSearchBar}>
          <TextInput
            placeholder="Tìm kiếm sản phẩm"
            placeholderTextColor="#888"
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

      {/* ================================================= */}
      {/*              PHẦN NỘI DUNG SCROLL                */}
      {/* ================================================= */}

      <ScrollView
        style={styles.phoneContentScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================= */}
        {/*                       MAIN                         */}
        {/* ================================================= */}

        {/* Banner */}
        <View style={styles.phoneBanner}>
          {/* bên trái */}
          <View style={styles.phoneBannerLeft}>
            <Text style={styles.phoneBannerSmallTitle}>
              MUA SẮM DỄ DÀNG - TIỆN LỢI MỖI NGÀY
            </Text>

            <Text style={styles.phoneBannerTitle}>
              Sản phẩm chất lượng{"\n"}
              <Text style={styles.bannerTitleHighlight}>Giá tốt mỗi ngày</Text>
            </Text>

            <Text style={styles.phoneBannerDescription}>
              Khám phá hàng ngàn sản phẩm chính hãng với nhiều ưu đãi hấp dẫn.
            </Text>

            {/* Mua ngay */}
            <HoverButton
              style={styles.phoneBuyButton}
              hoverStyle={styles.buttonHover}
            >
              <Text style={styles.buyButtonText}>Mua ngay</Text>
            </HoverButton>
          </View>

          {/* bên phải */}
          <View style={styles.phoneBannerRight}>
            <Image
              source={require("@/assets/image/Designer.png")}
              style={styles.phoneBannerImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ================================================= */}
        {/*                    DANH MỤC                       */}
        {/* ================================================= */}

        <View style={styles.phoneCategories}>
          {/* Tất cả */}
          <HoverButton
            style={[styles.phoneCategory, styles.categoryActive]}
            hoverStyle={styles.categoryHover}
          >
            <Ionicons name="grid-outline" size={23} color="#ffffff" />

            <Text style={styles.categoryTextActive}>Tất cả</Text>
          </HoverButton>

          {/* Điện thoại */}
          <HoverButton
            style={styles.phoneCategory}
            hoverStyle={styles.categoryHover}
          >
            <Ionicons name="phone-portrait-outline" size={23} color="red" />

            <Text style={styles.phoneCategoryText}>Điện thoại</Text>
          </HoverButton>

          {/* Laptop */}
          <HoverButton
            style={styles.phoneCategory}
            hoverStyle={styles.categoryHover}
          >
            <Ionicons name="laptop-outline" size={23} color="red" />

            <Text style={styles.phoneCategoryText}>Laptop</Text>
          </HoverButton>

          {/* Phụ kiện */}
          <HoverButton
            style={styles.phoneCategory}
            hoverStyle={styles.categoryHover}
          >
            <Ionicons name="headset-outline" size={23} color="red" />

            <Text style={styles.phoneCategoryText}>Phụ kiện</Text>
          </HoverButton>
        </View>

        {/* ================================================= */}
        {/*                  SẢN PHẨM                         */}
        {/* ================================================= */}

        <View style={styles.phoneFeaturedProducts}>
          {/* Tiêu đề */}
          <View style={styles.titleRow}>
            <Text style={styles.phoneTitle}>Sản phẩm nổi bật</Text>

            <HoverButton
              style={styles.viewAllButton}
              hoverStyle={styles.viewAllHover}
            >
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </HoverButton>
          </View>

          {/* Danh sách sản phẩm */}
          <View style={styles.phoneProductList}>
            {/* Product 1 */}
            <Pressable
              style={styles.phoneProductCard}
              onPress={() => router.push("/product_detail")}
            >
              <Image
                source={require("@/assets/image/16e4.jpg")}
                style={styles.phoneProductImage}
                resizeMode="contain"
              />

              <Text style={styles.phoneProductName}>iPhone 16e 128GB</Text>

              <Text style={styles.rating}>⭐ 4.8</Text>

              <Text style={styles.phonePrice}>16.990.000đ</Text>

              <HoverButton
                style={styles.addCartButton}
                hoverStyle={styles.buttonHover}
              >
                <Text style={styles.addCartText}>Thêm vào giỏ</Text>
              </HoverButton>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ================================================= */
/*             GIAO DIỆN LAPTOP                     */
/* ================================================= */

function DesktopLayout() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* ================================================= */}
      {/*                     HEADER                        */}
      {/* ================================================= */}

      <View style={styles.header}>
        {/* logo */}
        <View style={styles.logo}>
          <Image
            source={require("@/assets/image/logo.jpg")}
            style={styles.logoImage}
          />

          <Text style={styles.logoText}>BVP Shop</Text>
        </View>

        {/* search bar */}
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Tìm kiếm sản phẩm"
            placeholderTextColor="#888"
            style={styles.searchInput}
          />

          <HoverButton
            style={styles.searchButton}
            hoverStyle={styles.buttonHover}
          >
            <Ionicons name="search" size={22} color="#ffffff" />
          </HoverButton>
        </View>

        {/* Customer icons */}
        <View style={styles.customerIcons}>
          <LanguageSelector />
          {/* Giỏ hàng */}
          <HoverButton
            style={styles.iconItem}
            hoverStyle={styles.iconItemHover}
            onPress={() => router.push("/cart")}
          >
            {(hovered: boolean) => (
              <>
                <View
                  style={[styles.iconButton, hovered && styles.iconButtonHover]}
                >
                  <Ionicons
                    name="cart-outline"
                    size={25}
                    color={hovered ? "red" : "#ffffff"}
                  />
                </View>

                <Text style={styles.iconText}>Giỏ hàng</Text>
              </>
            )}
          </HoverButton>

          {/* Đơn hàng */}
          <HoverButton
            style={styles.iconItem}
            hoverStyle={styles.iconItemHover}
            onPress={() => router.push("/orders")}
          >
            {(hovered: boolean) => (
              <>
                <View
                  style={[styles.iconButton, hovered && styles.iconButtonHover]}
                >
                  <Ionicons
                    name="cube-outline"
                    size={25}
                    color={hovered ? "red" : "#ffffff"}
                  />
                </View>

                <Text style={styles.iconText}>Đơn hàng</Text>
              </>
            )}
          </HoverButton>

          {/* Tài khoản */}
          <HoverButton
            style={styles.iconItem}
            hoverStyle={styles.iconItemHover}
            onPress={() => router.push("/account")}
          >
            {(hovered: boolean) => (
              <>
                <View
                  style={[styles.iconButton, hovered && styles.iconButtonHover]}
                >
                  <Ionicons
                    name="person-outline"
                    size={25}
                    color={hovered ? "red" : "#ffffff"}
                  />
                </View>

                <Text style={styles.iconText}>Tài khoản</Text>
              </>
            )}
          </HoverButton>
        </View>
      </View>

      {/* ================================================= */}
      {/*              PHẦN NỘI DUNG SCROLL                */}
      {/* ================================================= */}

      <ScrollView
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================= */}
        {/*                       MAIN                         */}
        {/* ================================================= */}

        {/* Banner */}
        <View style={styles.banner}>
          {/* bên trái */}
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerSmallTitle}>
              MUA SẮM DỄ DÀNG - TIỆN LỢI MỖI NGÀY
            </Text>

            <Text style={styles.bannerTitle}>
              Sản phẩm chất lượng{"\n"}
              <Text style={styles.bannerTitleHighlight}>Giá tốt mỗi ngày</Text>
            </Text>

            <Text style={styles.bannerDescription}>
              Khám phá hàng ngàn sản phẩm chính hãng với nhiều ưu đãi hấp dẫn.
            </Text>

            {/* Mua ngay */}
            <HoverButton
              style={styles.buyButton}
              hoverStyle={styles.buttonHover}
            >
              <Text style={styles.buyButtonText}>Mua ngay</Text>
            </HoverButton>
          </View>

          {/* bên phải */}
          <View style={styles.bannerRight}>
            <Image
              source={require("@/assets/image/Designer.png")}
              style={styles.bannerImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ================================================= */}
        {/*                    DANH MỤC                       */}
        {/* ================================================= */}

        <View style={styles.categories}>
          {/* Tất cả */}
          <HoverButton
            style={[styles.category, styles.categoryActive]}
            hoverStyle={styles.categoryHover}
          >
            <Ionicons name="grid-outline" size={28} color="#ffffff" />

            <Text style={styles.categoryTextActive}>Tất cả</Text>
          </HoverButton>

          {/* Điện thoại */}
          <HoverButton
            style={styles.category}
            hoverStyle={styles.categoryHover}
          >
            <Ionicons name="phone-portrait-outline" size={28} color="red" />

            <Text style={styles.categoryText}>Điện thoại</Text>
          </HoverButton>

          {/* Laptop */}
          <HoverButton
            style={styles.category}
            hoverStyle={styles.categoryHover}
          >
            <Ionicons name="laptop-outline" size={28} color="red" />

            <Text style={styles.categoryText}>Laptop</Text>
          </HoverButton>

          {/* Phụ kiện */}
          <HoverButton
            style={styles.category}
            hoverStyle={styles.categoryHover}
          >
            <Ionicons name="headset-outline" size={28} color="red" />

            <Text style={styles.categoryText}>Phụ kiện</Text>
          </HoverButton>
        </View>

        {/* ================================================= */}
        {/*                  SẢN PHẨM                         */}
        {/* ================================================= */}

        <View style={styles.featuredProducts}>
          {/* Tiêu đề */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>Sản phẩm nổi bật</Text>

            <HoverButton
              style={styles.viewAllButton}
              hoverStyle={styles.viewAllHover}
            >
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </HoverButton>
          </View>

          {/* Danh sách sản phẩm */}
          <View style={styles.productList}>
            {/* Product 1 */}
            <Pressable
              style={styles.productCard}
              onPress={() => router.push("/product_detail")}
            >
              <Image
                source={require("@/assets/image/16e4.jpg")}
                style={styles.productImage}
                resizeMode="contain"
              />

              <Text style={styles.productName}>iPhone 16e 128GB</Text>

              <Text style={styles.rating}>⭐ 4.8</Text>

              <Text style={styles.price}>16.990.000đ</Text>

              <HoverButton
                style={styles.addCartButton}
                hoverStyle={styles.buttonHover}
              >
                <Text style={styles.addCartText}>Thêm vào giỏ</Text>
              </HoverButton>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ================================================= */
/*                     STYLES                        */
/* ================================================= */

const styles = StyleSheet.create({
  /* ================================================= */
  /*                DESKTOP CONTAINER                  */
  /* ================================================= */

  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  /* Phần ScrollView desktop */
  contentScroll: {
    flex: 1,
  },

  /* ================================================= */
  /*                     HEADER                        */
  /* ================================================= */

  header: {
    backgroundColor: "red",

    paddingHorizontal: 25,
    paddingTop: 45,
    paddingBottom: 18,

    flexDirection: "row",
    alignItems: "center",

    gap: 25,
  },

  /* logo */

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

  /* search bar */

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

  /* Customer icons */

  customerIcons: {
    flexDirection: "row",

    alignItems: "center",

    gap: 25,
  },

  iconItem: {
    alignItems: "center",
  },

  iconItemHover: {
    transform: [
      {
        scale: 1.05,
      },
    ],
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

    shadowOffset: {
      width: 0,
      height: 5,
    },

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

  /* ================================================= */
  /*                       BANNER                      */
  /* ================================================= */

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

  /* ================================================= */
  /*                    DANH MỤC                       */
  /* ================================================= */

  categories: {
    flexDirection: "row",

    backgroundColor: "#ffffff",

    marginHorizontal: 20,

    borderRadius: 15,

    padding: 10,

    justifyContent: "space-around",

    borderWidth: 1,

    borderColor: "#dddddd",
  },

  category: {
    minWidth: 120,

    paddingVertical: 15,

    alignItems: "center",

    justifyContent: "center",

    borderRadius: 15,

    backgroundColor: "#ffffff",
  },

  categoryActive: {
    backgroundColor: "red",
  },

  categoryHover: {
    transform: [
      {
        scale: 1.05,
      },
    ],

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.2,

    shadowRadius: 7,

    elevation: 5,
  },

  categoryText: {
    fontSize: 14,

    color: "#555",

    marginTop: 7,
  },

  categoryTextActive: {
    fontSize: 14,

    color: "#ffffff",

    fontWeight: "600",

    marginTop: 7,
  },

  /* ================================================= */
  /*                   SẢN PHẨM                        */
  /* ================================================= */

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

    backgroundColor: "#ffffff",

    borderRadius: 15,

    padding: 15,

    borderWidth: 1,

    borderColor: "#eeeeee",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,

    shadowRadius: 5,

    elevation: 3,
  },

  productImage: {
    width: "100%",

    height: 180,

    marginBottom: 10,
  },

  productName: {
    fontSize: 16,

    fontWeight: "600",

    color: "#222",

    marginBottom: 7,
  },

  rating: {
    fontSize: 14,

    marginBottom: 7,

    color: "#555",
  },

  price: {
    fontSize: 20,

    fontWeight: "700",

    color: "red",

    marginBottom: 12,
  },

  /* ================================================= */
  /*                 NÚT THÊM GIỎ                     */
  /* ================================================= */

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

  /* ================================================= */
  /*                    XEM TẤT CẢ                    */
  /* ================================================= */

  viewAllButton: {
    padding: 5,
  },

  viewAllHover: {
    transform: [
      {
        scale: 1.05,
      },
    ],
  },

  viewAll: {
    color: "red",

    fontSize: 14,

    fontWeight: "600",
  },

  /* ================================================= */
  /*                 COMMON HOVER                     */
  /* ================================================= */

  buttonHover: {
    transform: [
      {
        scale: 1.05,
      },
    ],

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.2,

    shadowRadius: 7,

    elevation: 5,
  },

  /* ================================================= */
  /*                  PHONE LAYOUT                     */
  /* ================================================= */

  phoneContainer: {
    flex: 1,

    backgroundColor: "#f5f5f5",
  },

  /* Phần ScrollView mobile */

  phoneContentScroll: {
    flex: 1,
  },

  /* ================================================= */
  /*                  PHONE HEADER                     */
  /* ================================================= */

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

  /* ================================================= */
  /*                  PHONE SEARCH                     */
  /* ================================================= */

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

  /* ================================================= */
  /*                  PHONE BANNER                     */
  /* ================================================= */

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

  /* ================================================= */
  /*                 PHONE CATEGORY                    */
  /* ================================================= */

  phoneCategories: {
    marginHorizontal: 12,

    backgroundColor: "#ffffff",

    borderRadius: 15,

    padding: 5,

    flexDirection: "row",

    justifyContent: "space-between",

    borderWidth: 1,

    borderColor: "#dddddd",
  },

  phoneCategory: {
    flex: 1,

    minWidth: 0,

    paddingVertical: 10,

    alignItems: "center",

    justifyContent: "center",

    borderRadius: 10,

    backgroundColor: "#ffffff",
  },

  phoneCategoryText: {
    fontSize: 10,

    color: "#555",

    marginTop: 4,

    textAlign: "center",
  },

  /* ================================================= */
  /*                PHONE PRODUCTS                     */
  /* ================================================= */

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

    backgroundColor: "#ffffff",

    borderRadius: 12,

    padding: 10,

    marginBottom: 12,

    borderWidth: 1,

    borderColor: "#eeeeee",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,

    shadowRadius: 5,

    elevation: 3,
  },

  phoneProductImage: {
    width: "100%",

    height: 130,

    marginBottom: 8,
  },

  phoneProductName: {
    fontSize: 13,

    fontWeight: "600",

    color: "#222",

    marginBottom: 5,
  },

  phonePrice: {
    fontSize: 16,

    fontWeight: "700",

    color: "red",

    marginBottom: 10,
  },
});
