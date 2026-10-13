import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { getCurrentUser, updateCurrentUser, UserProfile } from "../Use-cases/authService";

export default function ProfileScreen() {
  const router = useRouter();
  const [, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // Nạp thông tin hồ sơ và đưa người chưa đăng nhập về màn hình đăng nhập.
  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) {
        router.replace("/login");
        return;
      }
      setUser(u);
      setName(u.fullName);
      setEmail(u.email);
      setPhone(u.phone);
    });
  }, [router]);
  const save = async () => {
    // Họ tên và email là các trường bắt buộc trước khi cập nhật hồ sơ.
    if (!name.trim() || !email.trim()) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập họ tên và email.");
      return;
    }
    try {
      const updated = await updateCurrentUser({ fullName: name, email, phone });
      setUser(updated);
      Alert.alert("Thành công", "Thông tin cá nhân đã được lưu.");
    } catch (e) {
      Alert.alert(
        "Không thể lưu",
        e instanceof Error ? e.message : "Đã xảy ra lỗi.",
      );
    }
  };
  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <Pressable onPress={() => router.push("/account")}>
        <Text style={s.back}>‹ Quay lại tài khoản</Text>
      </Pressable>
      <View style={s.card}>
        <Text style={s.title}>Thông tin cá nhân</Text>
        <Text style={s.hint}>Cập nhật hồ sơ BVP Shop của bạn.</Text>
        <Text style={s.label}>Họ và tên</Text>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholder="Nguyễn Văn A"
        />
        <Text style={s.label}>Email</Text>
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="email@example.com"
        />
        <Text style={s.label}>Số điện thoại</Text>
        <TextInput
          style={s.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="Số điện thoại"
        />
        <Pressable style={s.button} onPress={save}>
          <Text style={s.buttonText}>Lưu thay đổi</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 22, alignItems: "center" },
  back: {
    width: "100%",
    maxWidth: 620,
    color: "#d32f2f",
    fontWeight: "700",
    marginBottom: 18,
  },
  card: {
    width: "100%",
    maxWidth: 620,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  title: { fontSize: 26, fontWeight: "800", color: "#222" },
  hint: { color: "#777", marginTop: 6, marginBottom: 22 },
  label: { color: "#333", fontWeight: "600", marginBottom: 7, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 9,
    padding: 13,
    color: "#222",
  },
  button: {
    backgroundColor: "#d32f2f",
    borderRadius: 9,
    padding: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: "#fff", fontWeight: "800" },
});
