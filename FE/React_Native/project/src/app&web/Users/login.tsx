import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { loginUser } from "./authService";

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 700;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(
    null,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập email/số điện thoại và mật khẩu.",
      );
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await loginUser(email, password);
      router.replace("/account");
    } catch (error) {
      Alert.alert(
        "Đăng nhập thất bại",
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.authShell, isMobile && styles.authShellMobile]}>
        <View
          style={[styles.welcomePanel, isMobile && styles.welcomePanelMobile]}
        >
          <ImageBackground
            source={require("../../../image/Nền login.png")}
            style={[
              styles.imageBackground,
              isMobile && styles.imageBackgroundMobile,
            ]}
            imageStyle={styles.imageBackgroundStyle}
            resizeMode="cover"
          >
            <View
              style={[
                styles.panelOverlay,
                isMobile && styles.panelOverlayMobile,
              ]}
            >
              <View
                style={[styles.iconCircle, isMobile && styles.iconCircleMobile]}
              >
                <Ionicons name="bag-handle-outline" size={38} color="#d32f2f" />
              </View>

              <Text
                style={[
                  styles.welcomeTitle,
                  isMobile && styles.welcomeTitleMobile,
                ]}
              >
                Chào mừng bạn{"\n"}trở lại!
              </Text>

              <Text
                style={[
                  styles.welcomeDescription,
                  isMobile && styles.welcomeDescriptionMobile,
                ]}
              >
                Đăng nhập để tiếp tục mua sắm và theo dõi những ưu đãi dành
                riêng cho bạn tại BVP Shop.
              </Text>

              <View style={styles.underline} />

              <Text
                style={[styles.footerText, isMobile && styles.footerTextMobile]}
              >
                BVP Shop · Mua sắm thông minh
              </Text>
            </View>
          </ImageBackground>
        </View>

        <View style={[styles.formCard, isMobile && styles.formCardMobile]}>
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Chào mừng bạn quay trở lại!</Text>

          <Text style={styles.label}>Email hoặc số điện thoại</Text>
          <View
            style={[
              styles.inputWrap,
              focusedInput === "email" && styles.inputWrapFocused,
            ]}
          >
            <Ionicons name="mail-outline" size={19} color="#777" />
            <TextInput
              testID="login-email"
              style={styles.input}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              value={email}
              onChangeText={setEmail}
              placeholder="testuser@example.com"
              placeholderTextColor="#9a9a9a"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.label}>Mật khẩu</Text>
          <View
            style={[
              styles.inputWrap,
              focusedInput === "password" && styles.inputWrapFocused,
            ]}
          >
            <Ionicons name="lock-closed-outline" size={19} color="#777" />
            <TextInput
              testID="login-password"
              style={styles.input}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              value={password}
              onChangeText={setPassword}
              placeholder="123456"
              placeholderTextColor="#9a9a9a"
              secureTextEntry={!showPassword}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel="Hiện hoặc ẩn mật khẩu"
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={19}
                color="#777"
              />
            </Pressable>
          </View>

          <View style={styles.optionsRow}>
            <Pressable
              style={styles.rememberRow}
              onPress={() => setRemember(!remember)}
            >
              <Ionicons
                name={remember ? "checkbox" : "square-outline"}
                size={18}
                color={remember ? "#d32f2f" : "#777"}
              />
              <Text style={styles.optionText}>Nhớ đăng nhập</Text>
            </Pressable>

            <Pressable onPress={() => router.push("/forgot_password")}>
              <Text style={styles.link}>Quên mật khẩu?</Text>
            </Pressable>
          </View>

          <Pressable style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.socialCaption}>
            Đăng nhập bằng tài khoản khác
          </Text>

          <View style={styles.socialRow}>
            <Pressable
              style={styles.socialButton}
              onPress={() =>
                Alert.alert("Thông báo", "Đăng nhập Google chưa được kết nối.")
              }
            >
              <Text style={styles.google}>G</Text>
            </Pressable>
            <Pressable
              style={styles.socialButton}
              onPress={() =>
                Alert.alert(
                  "Thông báo",
                  "Đăng nhập Facebook chưa được kết nối.",
                )
              }
            >
              <Ionicons name="logo-facebook" size={22} color="#1877f2" />
            </Pressable>
            <Pressable
              style={styles.socialButton}
              onPress={() =>
                Alert.alert("Thông báo", "Đăng nhập Apple chưa được kết nối.")
              }
            >
              <Ionicons name="logo-apple" size={22} color="#111" />
            </Pressable>
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.optionText}>Chưa có tài khoản? </Text>
            <Pressable onPress={() => router.push("/sign_up")}>
              <Text style={styles.link}>Đăng ký ngay</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#efefef",
  },
  pageContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 36,
  },
  authShell: {
    width: "92%",
    maxWidth: 1180,
    minHeight: 720,
    alignSelf: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 22,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  authShellMobile: {
    width: "100%",
    minHeight: 0,
    borderRadius: 0,
    flexDirection: "column",
  },
  welcomePanel: {
    flex: 1,
    minHeight: 620,
    backgroundColor: "#f6e9e7",
    overflow: "hidden",
  },
  welcomePanelMobile: {
    flex: 0,
    minHeight: 300,
  },
  imageBackground: {
    flex: 1,
    minHeight: 620,
    justifyContent: "center",
  },
  imageBackgroundMobile: {
    minHeight: 300,
  },
  imageBackgroundStyle: {
    opacity: 1,
  },
  panelOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 46,
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: "rgba(255, 255, 255, 0.58)",
  },
  panelOverlayMobile: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 26,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 46,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#f1d9d4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    alignSelf: "flex-start",
  },
  iconCircleMobile: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 16,
  },
  welcomeTitle: {
    color: "#000",
    fontSize: 36,
    lineHeight: 46,
    fontWeight: "800",
    maxWidth: 300,
    marginBottom: 18,
  },
  welcomeTitleMobile: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 10,
  },
  welcomeDescription: {
    maxWidth: 420,
    color: "#000",
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "700",
    marginBottom: 30,
  },
  welcomeDescriptionMobile: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  underline: {
    width: 98,
    height: 4,
    backgroundColor: "#d32f2f",
    borderRadius: 2,
    marginBottom: 26,
  },
  footerText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },
  footerTextMobile: {
    fontSize: 12,
  },
  formCard: {
    width: 520,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 42,
    paddingVertical: 42,
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#ececec",
  },
  formCardMobile: {
    width: "100%",
    paddingHorizontal: 22,
    paddingVertical: 26,
    borderLeftWidth: 0,
  },
  title: {
    color: "#1f1f1f",
    fontSize: 38,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "#6d6d6d",
    fontSize: 14,
    marginBottom: 26,
  },
  label: {
    color: "#303030",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 6,
  },
  inputWrap: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 16,
  },
  inputWrapFocused: {
    borderColor: "#d32f2f",
    shadowColor: "#d32f2f",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    color: "#222",
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderWidth: 0,
    borderColor: "transparent",
    backgroundColor: "transparent",
    outlineWidth: 0,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 22,
    gap: 10,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionText: {
    color: "#5f5f5f",
    fontSize: 13,
  },
  link: {
    color: "#d32f2f",
    fontSize: 13,
    fontWeight: "700",
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: "#d32f2f",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#d7d7d7",
  },
  dividerText: {
    color: "#888",
    fontSize: 12,
  },
  socialCaption: {
    textAlign: "center",
    color: "#888",
    fontSize: 13,
    marginBottom: 16,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 26,
  },
  socialButton: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d9d9d9",
    alignItems: "center",
    justifyContent: "center",
  },
  google: {
    color: "#4285f4",
    fontSize: 24,
    fontWeight: "800",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    alignItems: "center",
  },
});
