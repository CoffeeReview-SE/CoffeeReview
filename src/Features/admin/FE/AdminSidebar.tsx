import React from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const menuItems = [
  { label: "Tổng quan", icon: "home-outline", page: "main_Admin" },
  { label: "Quản lý đơn hàng", icon: "cart-outline", page: "order_management" },
  { label: "Quản lý sản phẩm", icon: "cube-outline", page: "product_management" },
  { label: "Quản lý danh mục", icon: "grid-outline", page: "category_management" },
  { label: "Tồn kho", icon: "file-tray-stacked-outline", page: "stock_inventory" },
  { label: "Nhập xuất kho", icon: "swap-vertical-outline", page: "stock_movements" },
  { label: "Quản lý khách hàng", icon: "person-outline", page: "customer_management" },
] as const;

type AdminPage = (typeof menuItems)[number]["page"];

type AdminSidebarProps = {
  width: number;
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
};

export default function AdminSidebar({ width, activePage, onNavigate }: AdminSidebarProps) {
  return (
    <View style={[styles.sidebar, { width }]}>
      <Pressable style={styles.brand} onPress={() => onNavigate("main_Admin")}>
        <Image source={require("@/assets/image/logo.jpg")} style={styles.brandImage} resizeMode="contain" />
        <Text style={styles.brandText}>BVP <Text style={styles.brandStrong}>Shop</Text></Text>
      </Pressable>

      <ScrollView style={styles.sidebarMenu} showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.page}>
            {index === 1 && <Text style={styles.menuHeading}>QUẢN LÝ</Text>}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: activePage === item.page }}
              style={[styles.menuLink, activePage === item.page && styles.menuLinkActive]}
              onPress={() => onNavigate(item.page)}
            >
              <Ionicons name={item.icon} size={20} color={activePage === item.page ? "#ffffff" : "#ed263d"} />
              <Text numberOfLines={1} style={[styles.menuLinkText, activePage === item.page && styles.menuLinkTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          </React.Fragment>
        ))}

        <Text style={styles.systemHeading}>HỆ THỐNG</Text>
        <Pressable
          accessibilityRole="button"
          style={styles.menuLink}
          onPress={() => Alert.alert("Đăng xuất", "Bạn có muốn đăng xuất khỏi hệ thống không?", [
            { text: "Hủy", style: "cancel" },
            { text: "Đăng xuất", style: "destructive", onPress: () => Alert.alert("Thông báo", "Hãy kết nối chức năng đăng xuất với hệ thống.") },
          ])}
        >
          <Ionicons name="log-out-outline" size={20} color="#ed263d" />
          <Text style={styles.menuLinkText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.imageSide}>
        <Image source={require("@/assets/image/anh logo.png")} style={styles.promoImage} resizeMode="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { position: "absolute", left: 0, top: 0, bottom: 0, paddingTop: 20, paddingHorizontal: 13, paddingBottom: 12, backgroundColor: "#fff", borderRightWidth: 1, borderRightColor: "#f0f1f5", zIndex: 10, elevation: 4, flexDirection: "column" },
  brand: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4, marginBottom: 25 },
  brandImage: { width: 48, height: 48 },
  brandText: { fontSize: 21, fontWeight: "800", color: "#c8102e" },
  brandStrong: { color: "#8f101f" },
  sidebarMenu: { flex: 1 },
  menuHeading: { marginTop: 19, marginBottom: 8, marginLeft: 6, color: "#758198", fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  systemHeading: { marginTop: 19, marginBottom: 8, marginLeft: 6, color: "#758198", fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  menuLink: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 43, paddingHorizontal: 12, marginBottom: 5, borderRadius: 9 },
  menuLinkActive: { backgroundColor: "#e52332", shadowColor: "#ed263d", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.16, shadowRadius: 5, elevation: 2 },
  menuLinkText: { flex: 1, color: "#354157", fontSize: 12, fontWeight: "500" },
  menuLinkTextActive: { color: "#fff", fontWeight: "600" },
  imageSide: { alignItems: "center", justifyContent: "center", width: "100%", marginTop: 12 },
  promoImage: { width: 170, height: 150 },
});
