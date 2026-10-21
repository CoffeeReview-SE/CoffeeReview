import { StyleSheet, Text, View } from "react-native";
import { useLanguage } from "@/Core/contexts/language-context";

export function AiStatusBadge({ connected }: { connected: boolean }) {
  const { t } = useLanguage();

  return (
    <View
      accessibilityLabel={t(connected ? "AI đang kết nối" : "AI chưa kết nối")}
      style={[styles.badge, connected ? styles.connected : styles.disconnected]}
    >
      <View style={[styles.dot, connected ? styles.dotConnected : styles.dotDisconnected]} />
      <Text numberOfLines={1} style={styles.text}>
        {t(connected ? "Đang hoạt động" : "Ngoại tuyến")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  connected: { backgroundColor: "#dcfce7" },
  disconnected: { backgroundColor: "#fee2e2" },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotConnected: { backgroundColor: "#16a34a" },
  dotDisconnected: { backgroundColor: "#dc2626" },
  text: { color: "#393232", fontSize: 8, fontWeight: "700" },
});
