import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Address,
  deleteAddress,
  getAddresses,
  getCurrentUser,
  saveAddress,
} from "../Use-cases/authService";

// Tạo biểu mẫu địa chỉ rỗng; ID thật được gán khi bắt đầu thêm địa chỉ mới.
const empty = (): Address => ({
  id: "",
  receiver: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  detail: "",
  isDefault: false,
});
export default function AddressesScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Address[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  // Chỉ cho phép quản lý địa chỉ sau khi xác định được tài khoản đang đăng nhập.
  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserId(user.id);
      setItems(await getAddresses(user.id));
      setLoading(false);
    })();
  }, [router]);
  const field = (key: keyof Address, value: string | boolean) =>
    setForm((old) => (old ? { ...old, [key]: value } : old));
  // Sao chép địa chỉ đang chọn để sửa, hoặc khởi tạo một địa chỉ mới.
  const edit = (a?: Address) =>
    setForm(a ? { ...a } : { ...empty(), id: String(Date.now()) });
  const save = async () => {
    // Không lưu khi thiếu bất kỳ phần nào của địa chỉ hoặc chưa có userId.
    if (
      !form ||
      !form.receiver.trim() ||
      !form.phone.trim() ||
      !form.province.trim() ||
      !form.district.trim() ||
      !form.ward.trim() ||
      !form.detail.trim() ||
      !userId
    ) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập đủ người nhận, số điện thoại, tỉnh/thành, quận/huyện, phường/xã và địa chỉ chi tiết.",
      );
      return;
    }
    setItems(await saveAddress(form, userId));
    setForm(null);
    Alert.alert("Thành công", "Địa chỉ đã được lưu.");
  };
  // Hỏi xác nhận trước khi xóa vì thao tác này thay đổi danh sách đã lưu.
  const remove = (id: string) =>
    Alert.alert("Xóa địa chỉ", "Bạn có chắc muốn xóa địa chỉ này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () =>
          setItems(await deleteAddress(id, userId ?? undefined)),
      },
    ]);
  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <Pressable onPress={() => router.push("/account")}>
        <Text style={s.back}>‹ Quay lại tài khoản</Text>
      </Pressable>
      <View style={s.heading}>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Địa chỉ giao hàng</Text>
          <Text style={s.hint}>Quản lý nơi nhận đơn hàng của bạn.</Text>
        </View>
        <Pressable style={s.add} onPress={() => edit()}>
          <Text style={s.addText}>+ Thêm địa chỉ</Text>
        </Pressable>
      </View>
      {form && (
        <View style={s.card}>
          <Text style={s.formTitle}>
            {items.some((a) => a.id === form.id)
              ? "Chỉnh sửa địa chỉ"
              : "Thêm địa chỉ mới"}
          </Text>
          {(
            [
              { k: "receiver", label: "Họ tên người nhận", ph: "Nguyễn Văn A" },
              { k: "phone", label: "Số điện thoại", ph: "09..." },
              {
                k: "province",
                label: "Tỉnh / Thành phố",
                ph: "TP. Hồ Chí Minh",
              },
              { k: "district", label: "Quận / Huyện", ph: "Quận 1" },
              { k: "ward", label: "Phường / Xã", ph: "Phường Bến Nghé" },
              {
                k: "detail",
                label: "Địa chỉ chi tiết",
                ph: "Số nhà, tên đường...",
              },
            ] as const
          ).map((f) => (
            <View key={f.k}>
              <Text style={s.label}>{f.label}</Text>
              <TextInput
                style={s.input}
                value={String(form[f.k])}
                onChangeText={(v) => field(f.k, v)}
                placeholder={f.ph}
              />
            </View>
          ))}
          <View style={s.defaultRow}>
            <Text style={s.label}>Đặt làm địa chỉ mặc định</Text>
            <Switch
              value={form.isDefault}
              onValueChange={(v) => field("isDefault", v)}
              trackColor={{ true: "#d32f2f" }}
            />
          </View>
          <View style={s.actions}>
            <Pressable style={s.cancel} onPress={() => setForm(null)}>
              <Text>Hủy</Text>
            </Pressable>
            <Pressable style={s.save} onPress={save}>
              <Text style={s.saveText}>Lưu địa chỉ</Text>
            </Pressable>
          </View>
        </View>
      )}
      {!loading && items.length === 0 && !form && (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>Bạn chưa lưu địa chỉ nào</Text>
          <Text style={s.hint}>Nhấn “Thêm địa chỉ” để bắt đầu.</Text>
        </View>
      )}
      {items.map((a) => (
        <View key={a.id} style={s.card}>
          <View style={s.addressTop}>
            <Text style={s.name}>
              {a.receiver} · {a.phone}
            </Text>
            {a.isDefault && <Text style={s.badge}>Mặc định</Text>}
          </View>
          <Text style={s.address}>
            {a.detail}, {a.ward}, {a.district}, {a.province}
          </Text>
          <View style={s.actions}>
            <Pressable onPress={() => edit(a)}>
              <Text style={s.link}>Chỉnh sửa</Text>
            </Pressable>
            <Pressable onPress={() => remove(a.id)}>
              <Text style={s.delete}>Xóa</Text>
            </Pressable>
            {!a.isDefault && (
              <Pressable
                onPress={async () =>
                  setItems(
                    await saveAddress(
                      { ...a, isDefault: true },
                      userId ?? undefined,
                    ),
                  )
                }
              >
                <Text style={s.link}>Đặt mặc định</Text>
              </Pressable>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 22, alignSelf: "center", width: "100%", maxWidth: 950 },
  back: { color: "#d32f2f", fontWeight: "700", marginBottom: 18 },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  title: { fontSize: 26, fontWeight: "800", color: "#222" },
  hint: { color: "#777", marginTop: 5 },
  add: {
    backgroundColor: "#d32f2f",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 9,
  },
  addText: { color: "#fff", fontWeight: "700" },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: "#444",
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    color: "#222",
  },
  defaultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 16,
    flexWrap: "wrap",
  },
  cancel: { padding: 12 },
  save: { backgroundColor: "#d32f2f", padding: 12, borderRadius: 8 },
  saveText: { color: "#fff", fontWeight: "700" },
  addressTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  name: { fontWeight: "800", color: "#222" },
  badge: {
    backgroundColor: "#fff0f0",
    color: "#d32f2f",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
  },
  address: { color: "#555", lineHeight: 22, marginTop: 8 },
  link: { color: "#d32f2f", fontWeight: "700" },
  delete: { color: "#b91c1c", fontWeight: "700" },
  empty: {
    padding: 28,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyTitle: { fontWeight: "800", fontSize: 17, color: "#222" },
});
