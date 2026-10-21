import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AiConsultationWidget } from "@/Core/components/ai-consultation-widget";
import { LanguageSelector } from "@/Core/components/language-selector";
import { useLanguage } from "@/Core/contexts/language-context";
import { useCart } from "@/Core/contexts/cart-context";
import { allFallbackProducts } from "@/Core/services/catalog-fallback";

const iconFor = (categoryId: string): React.ComponentProps<typeof Ionicons>["name"] =>
  categoryId === "PHONE1" ? "phone-portrait-outline" :
  categoryId === "LAPTOP" ? "laptop-outline" :
  categoryId === "WATCH1" ? "watch-outline" : "headset-outline";

export default function ProductsScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { itemCount, addItem } = useCart();
  const [notice, setNotice] = React.useState("");

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable style={styles.brand} onPress={() => router.replace("/")}>
          <Image source={require("@/assets/image/logo.jpg")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandText}>{t("BVP Shop")}</Text>
        </Pressable>
        <View style={styles.searchBar}>
          <TextInput placeholder={t("Tìm kiếm sản phẩm")} placeholderTextColor="#888" style={styles.searchInput} />
          <Pressable style={styles.searchButton}><Ionicons name="search" size={21} color="#fff" /></Pressable>
        </View>
        <View style={styles.actions}>
          <LanguageSelector />
          <Pressable style={styles.headerAction} onPress={() => router.push("/cart")}>
            <View style={styles.iconButton}>
              <Ionicons name="cart-outline" size={24} color="#fff" />
              {itemCount > 0 && <Text style={styles.badge}>{itemCount}</Text>}
            </View>
            <Text style={styles.actionText}>{t("Giỏ hàng")}</Text>
          </Pressable>
          <Pressable style={styles.headerAction} onPress={() => router.push("/orders")}>
            <View style={styles.iconButton}><Ionicons name="receipt-outline" size={24} color="#fff" /></View>
            <Text style={styles.actionText}>{t("Đơn hàng")}</Text>
          </Pressable>
          <Pressable style={styles.headerAction} onPress={() => router.push("/account")}>
            <View style={styles.iconButton}><Ionicons name="person-outline" size={24} color="#fff" /></View>
            <Text style={styles.actionText}>{t("Tài khoản")}</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headingRow}>
          <View>
            <Text style={styles.title}>{t("Danh sách sản phẩm")}</Text>
            <Text style={styles.subtitle}>{t("Khám phá sản phẩm theo từng danh mục")}</Text>
          </View>
          <Pressable style={styles.backButton} onPress={() => router.replace("/")}>
            <Text style={styles.backText}>{t("Trang chủ")}</Text>
          </Pressable>
        </View>
        {["PHONE1", "LAPTOP", "WATCH1", "ACC001"].map((categoryId) => {
          const products = allFallbackProducts.filter((product) => product.categoryId === categoryId);
          return (
            <View key={categoryId} style={styles.section}>
              <Text style={styles.sectionTitle}>{t(products[0]?.category ?? "")}</Text>
              <View style={styles.grid}>
                {products.map((product) => (
                  <Pressable key={product.id} style={styles.card} onPress={() => router.push({ pathname: "/product_detail", params: { productId: product.id } })}>
                    <View style={styles.productImage}><Ionicons name={iconFor(product.categoryId)} size={48} color="#d9273e" /></View>
                    <Text style={styles.productName} numberOfLines={2}>{t(product.name)}</Text>
                    <Text style={styles.price}>{product.price.toLocaleString("vi-VN")} đ</Text>
                    <Text style={styles.stock}>{product.stock} {t("sản phẩm")}</Text>
                    <Pressable style={styles.addButton} onPress={() => { addItem(product); setNotice(t("Đã thêm vào giỏ hàng")); }}>
                      <Text style={styles.addText}>{t("Thêm vào giỏ")}</Text>
                    </Pressable>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
      {!!notice && <Pressable style={styles.notice} onPress={() => setNotice("")}><Ionicons name="checkmark-circle" size={18} color="#16834a" /><Text style={styles.noticeText}>{notice}</Text></Pressable>}
      <AiConsultationWidget onPress={() => router.push("/chat")} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f7f7f7" },
  header: { minHeight: 82, paddingHorizontal: 28, backgroundColor: "red", flexDirection: "row", alignItems: "center", gap: 26 },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  logo: { width: 42, height: 42, borderRadius: 21 },
  brandText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  searchBar: { flex: 1, maxWidth: 650, height: 48, flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 30, overflow: "hidden" },
  searchInput: { flex: 1, height: "100%", paddingHorizontal: 17, color: "#333", fontSize: 14 },
  searchButton: { width: 42, height: 42, marginRight: 3, borderRadius: 21, backgroundColor: "red", alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row", alignItems: "center", gap: 18 },
  headerAction: { alignItems: "center", minWidth: 54 },
  iconButton: { width: 50, height: 40, borderRadius: 25, alignItems: "center", justifyContent: "center", position: "relative" },
  actionText: { color: "#fff", fontWeight: "700" },
  badge: { position: "absolute", top: -10, left: 14, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: "#ffd43b", color: "#8a1c1c", textAlign: "center", fontSize: 11, fontWeight: "800", overflow: "hidden" },
  content: { padding: 20, paddingBottom: 90, maxWidth: 1200, width: "100%", alignSelf: "center" },
  headingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 22 },
  title: { color: "#222", fontSize: 28, fontWeight: "800" },
  subtitle: { color: "#777", marginTop: 5 },
  backButton: { borderRadius: 8, backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 10 },
  backText: { color: "#b51f2d", fontWeight: "700" },
  section: { marginBottom: 28 },
  sectionTitle: { color: "#b51f2d", fontSize: 21, fontWeight: "800", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { width: 180, minHeight: 255, padding: 12, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#ececec" },
  productImage: { height: 92, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#fff5f5" },
  productName: { minHeight: 40, marginTop: 9, color: "#222", fontWeight: "700" },
  price: { color: "#c62828", fontSize: 16, fontWeight: "800", marginTop: 5 },
  stock: { color: "#777", fontSize: 12, marginTop: 4 },
  addButton: { marginTop: 9, paddingVertical: 9, borderRadius: 8, backgroundColor: "#d9273e", alignItems: "center" },
  addText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  notice: { position: "absolute", bottom: 24, left: 20, right: 20, zIndex: 10, flexDirection: "row", alignItems: "center", gap: 8, padding: 13, borderRadius: 12, backgroundColor: "#e9f8ee", borderWidth: 1, borderColor: "#b9e6c7" },
  noticeText: { color: "#176b35", fontWeight: "700" },
});
