import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "@/Core/contexts/language-context";
import { registerUser } from "../Use-cases/authService";

const RegisterScreen = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chuẩn hóa và xác thực dữ liệu đầu vào trước khi tạo tài khoản.
  const handleRegister = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedPassword) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng điền đầy đủ tên, email, số điện thoại và mật khẩu.",
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert(
        "Email không hợp lệ",
        "Vui lòng nhập địa chỉ email đúng định dạng.",
      );
      return;
    }

    if (!/^[0-9+()\-\s]{9,15}$/.test(trimmedPhone)) {
      Alert.alert(
        "Số điện thoại không hợp lệ",
        "Vui lòng nhập số điện thoại hợp lệ.",
      );
      return;
    }

    if (trimmedPassword.length < 6) {
      Alert.alert("Mật khẩu quá ngắn", "Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    // Gửi thông tin hợp lệ tới authService, báo kết quả rồi luôn mở lại nút gửi.
    try {
      await registerUser({
        fullName: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        password: trimmedPassword,
      });

      Alert.alert(
        "Đăng ký thành công",
        "Tài khoản của bạn đã được tạo. Hãy đăng nhập để tiếp tục.",
      );
      router.replace("/login");
    } catch (error) {
      Alert.alert(
        "Đăng ký thất bại",
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi tạo tài khoản.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/image/anhnen.png")}
      style={styles.background}
      resizeMode="cover"
      imageStyle={styles.backgroundImage}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isMobile && styles.scrollContentMobile,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.login, isMobile && styles.loginMobile]}>
            <Text style={[styles.title, isMobile && styles.titleMobile]}>
              {t("Đăng ký")}
            </Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={[styles.input, isMobile && styles.inputMobile]}
              placeholder={t("Nhập email")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>{t("Họ và tên")}</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              style={[styles.input, isMobile && styles.inputMobile]}
              placeholder={t("Nhập họ và tên")}
              autoCapitalize="words"
            />

            <Text style={styles.label}>{t("Số điện thoại")}</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={[styles.input, isMobile && styles.inputMobile]}
              placeholder={t("Nhập số điện thoại")}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>{t("Mật khẩu")}</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              style={[styles.input, isMobile && styles.inputMobile]}
              placeholder={t("Nhập mật khẩu")}
              secureTextEntry
            />

            <View style={styles.btn}>
              <Pressable
                onPress={handleRegister}
                disabled={isSubmitting}
                style={[
                  styles.button,
                  isMobile && styles.buttonMobile,
                  isSubmitting && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? t("Đang đăng ký...") : t("Đăng ký")}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  /* ========================= */
  /*        BACKGROUND          */
  /* ========================= */

  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },

  backgroundImage: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },

  /* ========================= */
  /*        CONTAINER           */
  /* ========================= */

  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  scrollContentMobile: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  /* ========================= */
  /*           CARD             */
  /* ========================= */

  login: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",

    padding: 24,

    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 15,

    backgroundColor: "rgba(255,255,255,0.9)",

    elevation: 5,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },

  loginMobile: {
    width: "100%",
    maxWidth: 420,
    padding: 18,
    borderRadius: 12,
  },

  /* ========================= */
  /*           TITLE            */
  /* ========================= */

  title: {
    color: "#d32f2f",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },

  titleMobile: {
    fontSize: 28,
    marginBottom: 20,
  },

  /* ========================= */
  /*           LABEL            */
  /* ========================= */

  label: {
    width: "100%",
    textAlign: "left",
    fontSize: 18,
    marginBottom: 8,
    color: "#333",
    fontWeight: "600",
  },

  /* ========================= */
  /*           INPUT            */
  /* ========================= */

  input: {
    width: "100%",

    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,

    paddingHorizontal: 14,
    paddingVertical: 12,

    marginBottom: 18,

    fontSize: 16,

    backgroundColor: "#fff",
  },

  inputMobile: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 15,
    borderRadius: 8,
  },

  /* ========================= */
  /*          BUTTON            */
  /* ========================= */

  btn: {
    alignItems: "center",
    marginTop: 8,
  },

  button: {
    backgroundColor: "#d32f2f",
    borderRadius: 15,

    paddingVertical: 14,
    paddingHorizontal: 32,

    width: "100%",

    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonMobile: {
    paddingVertical: 13,
    borderRadius: 10,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
