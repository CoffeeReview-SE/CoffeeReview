import React, { useState } from "react";
import {
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setFeedback("Vui lòng nhập email đã đăng ký.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setFeedback("Email chưa đúng định dạng. Vui lòng kiểm tra lại.");
      return;
    }

    setFeedback(
      "Ứng dụng chưa kết nối dịch vụ email/backend nên chưa thể gửi mã OTP thật.",
    );
  };

  return (
    <ImageBackground
      source={require("../../../image/anhnen.png")}
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
          <View style={[styles.formCard, isMobile && styles.formCardMobile]}>
            <Text style={[styles.title, isMobile && styles.titleMobile]}>
              Quên mật khẩu?
            </Text>
            <Text style={styles.description}>
              Nhập email đã đăng ký để nhận mã OTP khôi phục mật khẩu.
            </Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setFeedback("");
              }}
              style={[styles.input, isMobile && styles.inputMobile]}
              placeholder="Nhập email đã đăng ký"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Email đã đăng ký"
            />

            <Pressable
              onPress={handleSubmit}
              style={[styles.button, isMobile && styles.buttonMobile]}
            >
              <Text style={styles.buttonText}>Gửi mã OTP</Text>
            </Pressable>

            {!!feedback && (
              <Text style={styles.feedback} accessibilityLiveRegion="polite">
                {feedback}
              </Text>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/login")}
              style={styles.backButton}
            >
              <Text style={styles.backText}>Quay lại đăng nhập</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
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
  formCard: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    padding: 24,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.94)",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  formCardMobile: {
    padding: 18,
    borderRadius: 12,
  },
  title: {
    color: "#d32f2f",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  titleMobile: {
    fontSize: 28,
  },
  description: {
    color: "#555",
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    fontSize: 16,
    color: "#222",
    backgroundColor: "#fff",
  },
  inputMobile: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 15,
  },
  button: {
    minHeight: 50,
    backgroundColor: "#d32f2f",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonMobile: {
    paddingVertical: 13,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  feedback: {
    color: "#a12622",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 12,
  },
  backButton: {
    alignSelf: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  backText: {
    color: "#d32f2f",
    fontSize: 14,
    fontWeight: "700",
  },
});
