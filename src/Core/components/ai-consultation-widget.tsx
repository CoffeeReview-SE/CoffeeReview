import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "@/Core/contexts/language-context";
import { AiStatusBadge } from "@/Core/components/ai-status-badge";
import { useAiStatus } from "@/Core/hooks/use-ai-status";

type AiConsultationWidgetProps = {
  onPress: () => void;
};

export function AiConsultationWidget({ onPress }: AiConsultationWidgetProps) {
  const { t } = useLanguage();
  const aiConnected = useAiStatus();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("Bắt đầu chat ngay")}
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.card,
        hovered && styles.cardHovered,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="chatbubbles-outline" size={25} color="#ffffff" />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>{t("Tư vấn sản phẩm")}</Text>
          <AiStatusBadge connected={aiConnected} />
        </View>
        <View style={styles.cta}>
          <Text numberOfLines={1} style={styles.ctaText}>{t("Bắt đầu chat ngay")}</Text>
          <Ionicons name="chevron-forward" size={12} color="#ffffff" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    right: 12,
    bottom: 14,
    zIndex: 10000,
    elevation: 12,
    width: 214,
    minHeight: 68,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff8f7",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dba8a4",
    shadowColor: "#532b2b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.23,
    shadowRadius: 13,
  },
  cardHovered: { transform: [{ translateY: -2 }], borderColor: "#bd5551" },
  cardPressed: { transform: [{ scale: 0.97 }] },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#9f252b",
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, gap: 5 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 5 },
  title: { color: "#282323", fontSize: 11, fontWeight: "800", flexShrink: 1 },
  cta: {
    minHeight: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 8,
    borderRadius: 7,
    backgroundColor: "#a92e32",
  },
  ctaText: { color: "#ffffff", fontSize: 10, fontWeight: "600", flexShrink: 1 },
});
