import React, { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getCurrentUser, logoutUser, type UserProfile } from "../Use-cases/authService";

const menuItems = [
  {
    icon: "receipt-outline" as const,
    label: "Đơn hàng của tôi",
    detail: "Theo dõi trạng thái đơn hàng",
  },
  {
    icon: "location-outline" as const,
    label: "Địa chỉ giao hàng",
    detail: "Quản lý địa chỉ nhận hàng",
  },
  {
    icon: "heart-outline" as const,
    label: "Sản phẩm yêu thích",
    detail: "Các sản phẩm bạn đã lưu",
  },
  {
    icon: "wallet-outline" as const,
    label: "Ví của tôi",
    detail: "Phương thức thanh toán",
  },
  {
    icon: "pricetag-outline" as const,
    label: "Mã giảm giá",
    detail: "Ưu đãi dành cho bạn",
  },
  {
    icon: "settings-outline" as const,
    label: "Cài đặt tài khoản",
    detail: "Bảo mật và tùy chọn",
  },
];

export default function AccountScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 700;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoading && user === null) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      router.replace("/login");
    } catch (error) {
      Alert.alert(
        "Đăng xuất thất bại",
        error instanceof Error ? error.message : "Không thể đăng xuất lúc này.",
      );
    }
  };

  if (isLoading || !user) {
    return null;
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <Pressable style={styles.brand} onPress={() => router.replace("/")}>
          <Image
            source={require("@/assets/image/logo.jpg")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandText}>BVP Shop</Text>
        </Pressable>
        {!isMobile && (
          <Text style={styles.headerCaption}>Tài khoản của tôi</Text>
        )}
        <Pressable
          style={styles.homeButton}
          onPress={() => router.replace("/")}
        >
          <Ionicons name="home-outline" size={18} color="#d32f2f" />
          <Text style={styles.homeText}>Trang chủ</Text>
        </Pressable>
      </View>

      <ImageBackground
        source={require("@/assets/image/anhnen.png")}
        style={styles.heroBackground}
        imageStyle={styles.heroBackgroundImage}
        resizeMode="cover"
      >
        <View style={styles.heroOverlay}>
          <View style={[styles.layout, isMobile && styles.layoutMobile]}>
            {!isMobile && (
              <View style={styles.sidebar}>
                <View style={styles.userSummary}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={30} color="#d32f2f" />
                  </View>
                  <Text style={styles.userName}>{user.fullName}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                {["Tổng quan", ...menuItems.map((item) => item.label)].map(
                  (label, index) => (
                    <Pressable
                      key={label}
                      style={[
                        styles.sideItem,
                        index === 0 && styles.sideItemActive,
                      ]}
                      onPress={() =>
                        index === 1
                          ? router.push("/orders")
                          : index === 0
                            ? undefined
                            : Alert.alert(
                                label,
                                "Mục này sẽ được hoàn thiện ở bước tiếp theo.",
                              )
                      }
                    >
                      <Ionicons
                        name={
                          index === 0
                            ? "grid-outline"
                            : (menuItems[index - 1]?.icon ?? "grid-outline")
                        }
                        size={18}
                        color={index === 0 ? "#d32f2f" : "#555"}
                      />
                      <Text
                        style={[
                          styles.sideText,
                          index === 0 && styles.sideTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  ),
                )}
                <Pressable style={styles.logoutButton} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={18} color="#d32f2f" />
                  <Text style={styles.logoutText}>Đăng xuất</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.main}>
              <Text style={styles.pageTitle}>Tài khoản của tôi</Text>
              <Text style={styles.pageSubtitle}>
                Quản lý thông tin cá nhân và hoạt động mua sắm của bạn.
              </Text>

              <View
                style={[
                  styles.profileCard,
                  isMobile && styles.profileCardMobile,
                ]}
              >
                <View style={styles.profileLeft}>
                  <View style={styles.avatarLarge}>
                    <Ionicons name="person" size={32} color="#d32f2f" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.greeting}>
                      Xin chào, {user.fullName}!
                    </Text>
                    <Text style={styles.muted}>
                      Chào mừng bạn quay lại BVP Shop.
                    </Text>
                    <Text style={styles.emailText}>{user.email}</Text>
                  </View>
                </View>
                <Pressable
                  style={styles.editButton}
                  onPress={() =>
                    Alert.alert(
                      "Thông tin cá nhân",
                      "Form chỉnh sửa thông tin sẽ được bổ sung sau.",
                    )
                  }
                >
                  <Ionicons name="create-outline" size={16} color="#d32f2f" />
                  <Text style={styles.editText}>Chỉnh sửa</Text>
                </Pressable>
              </View>

              <View
                style={[styles.statsRow, isMobile && styles.statsRowMobile]}
              >
                <StatCard
                  icon="receipt-outline"
                  title="Đơn hàng"
                  value="3"
                  note="Tổng đơn hàng"
                />
                <StatCard
                  icon="heart-outline"
                  title="Yêu thích"
                  value="5"
                  note="Sản phẩm đã lưu"
                />
                <StatCard
                  icon="wallet-outline"
                  title="Ví của tôi"
                  value="0đ"
                  note="Số dư hiện tại"
                />
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quản lý tài khoản</Text>
                <Text style={styles.sectionCaption}>
                  Các tiện ích dành cho bạn
                </Text>
              </View>

              <View style={styles.menuCard}>
                {menuItems.map((item, index) => (
                  <Pressable
                    key={item.label}
                    style={[
                      styles.menuItem,
                      index < menuItems.length - 1 && styles.menuItemBorder,
                    ]}
                    onPress={() =>
                      item.label === "Đơn hàng của tôi"
                        ? router.push("/orders")
                        : Alert.alert(
                            item.label,
                            "Mục này sẽ được hoàn thiện ở bước tiếp theo.",
                          )
                    }
                  >
                    <View style={styles.menuIcon}>
                      <Ionicons name={item.icon} size={21} color="#d32f2f" />
                    </View>
                    <View style={styles.menuCopy}>
                      <Text style={styles.menuTitle}>{item.label}</Text>
                      <Text style={styles.menuDetail}>{item.detail}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#999" />
                  </Pressable>
                ))}
              </View>

              {isMobile && (
                <Pressable style={styles.mobileLogout} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={18} color="#d32f2f" />
                  <Text style={styles.logoutText}>Đăng xuất</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </ImageBackground>
      <Text style={styles.footer}>© BVP Shop</Text>
    </ScrollView>
  );
}

function StatCard({
  icon,
  title,
  value,
  note,
}: {
  icon: "receipt-outline" | "heart-outline" | "wallet-outline";
  title: string;
  value: string;
  note: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        <Ionicons name={icon} size={19} color="#d32f2f" />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statNote}>{note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f5f5f5" },
  pageContent: { flexGrow: 1, paddingBottom: 24 },
  heroBackground: {
    width: "100%",
    minHeight: 520,
    overflow: "hidden",
  },
  heroBackgroundImage: {
    opacity: 0.82,
  },
  heroOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.38)",
    paddingTop: 12,
    paddingBottom: 18,
  },
  header: {
    minHeight: 76,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerMobile: { paddingHorizontal: 16, minHeight: 64 },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  logo: { width: 38, height: 38, borderRadius: 8 },
  brandText: { color: "#d32f2f", fontSize: 20, fontWeight: "800" },
  headerCaption: { color: "#040404", fontSize: 13 },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
  },
  homeText: { color: "#d32f2f", fontSize: 14, fontWeight: "600" },
  layout: {
    width: "94%",
    maxWidth: 1200,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 24,
    paddingVertical: 28,
  },
  layoutMobile: { width: "100%", paddingHorizontal: 16, paddingVertical: 22 },
  sidebar: {
    width: 245,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    padding: 14,
  },
  userSummary: {
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 8,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  userName: { color: "#222", fontWeight: "700", fontSize: 14 },
  userEmail: { color: "#888", fontSize: 11, marginTop: 4 },
  sideItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  sideItemActive: { backgroundColor: "#fff0f0" },
  sideText: { color: "#0000", fontSize: 12, flex: 1 },
  sideTextActive: { color: "#d32f2f", fontWeight: "700" },
  logoutButton: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 10,
  },
  logoutText: { color: "#d32f2f", fontSize: 13, fontWeight: "700" },
  main: { flex: 1, minWidth: 0 },
  pageTitle: { fontSize: 27, fontWeight: "800", color: "#222" },
  pageSubtitle: { color: "#777", fontSize: 13, marginTop: 6, marginBottom: 20 },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 22,
    borderWidth: 1,
    borderColor: "#e7e7e7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  profileCardMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    padding: 16,
  },
  profileLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  avatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#fff0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: { fontSize: 17, fontWeight: "700", color: "#222" },
  muted: { fontSize: 12, color: "#777", marginTop: 5 },
  emailText: { fontSize: 12, color: "#d32f2f", marginTop: 5 },
  editButton: {
    borderWidth: 1,
    borderColor: "#d32f2f",
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  editText: { color: "#d32f2f", fontSize: 12, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 14, marginTop: 16 },
  statsRowMobile: { flexDirection: "column" },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7e7e7",
    borderRadius: 12,
    padding: 18,
  },
  statTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  statTitle: { color: "#555", fontSize: 12, fontWeight: "600" },
  statValue: { fontSize: 25, fontWeight: "800", color: "#222", marginTop: 16 },
  statNote: { color: "#888", fontSize: 11, marginTop: 3 },
  sectionHeader: { marginTop: 26, marginBottom: 12 },
  sectionTitle: { fontSize: 18, color: "#222", fontWeight: "800" },
  sectionCaption: { color: "#888", fontSize: 12, marginTop: 4 },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e7e7e7",
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: "#eee" },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#fff0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  menuCopy: { flex: 1 },
  menuTitle: { color: "#333", fontSize: 13, fontWeight: "700" },
  menuDetail: { color: "#888", fontSize: 11, marginTop: 4 },
  mobileLogout: {
    marginTop: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#d32f2f",
    borderRadius: 9,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
  },
  footer: {
    textAlign: "center",
    color: "#999",
    fontSize: 11,
    paddingVertical: 10,
  },
});
