import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "@/Core/contexts/language-context";
import type { ProductCategory } from "@/Core/services/products-api";

type Props = {
  categories: ProductCategory[];
  selectedCategoryId: string | null;
  onSelect: (id: string | null) => void;
  compact?: boolean;
};

const iconForCategory = (id: string): React.ComponentProps<typeof Ionicons>["name"] => {
  switch (id.trim().toUpperCase()) {
    case "PHONE1": return "phone-portrait-outline";
    case "LAPTOP": return "laptop-outline";
    case "WATCH1": return "watch-outline";
    case "ACC001": return "headset-outline";
    default: return "cube-outline";
  }
};

export function ProductCategoryPicker({
  categories,
  selectedCategoryId,
  onSelect,
  compact = false,
}: Props) {
  const { t } = useLanguage();
  const totalProducts = categories.reduce((sum, category) => sum + category.productCount, 0);
  const items = [
    { id: null, name: t("Tất cả"), productCount: totalProducts },
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      productCount: category.productCount,
    })),
  ];

  const pickerItems = items.map((item) => {
    const active = item.id === selectedCategoryId;
    return (
      <Pressable
        key={item.id ?? "all"}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        onPress={() => onSelect(item.id)}
        style={[
          compact ? styles.compactItem : styles.item,
          active && styles.itemActive,
        ]}
      >
        <Ionicons
          name={item.id ? iconForCategory(item.id) : "grid-outline"}
          size={compact ? 21 : 27}
          color={active ? "#ffffff" : "#d9273e"}
        />
        <Text
          numberOfLines={2}
          style={[compact ? styles.compactName : styles.name, active && styles.nameActive]}
        >
          {item.name}
        </Text>
        <Text style={[styles.count, active && styles.nameActive]}>{item.productCount}</Text>
      </Pressable>
    );
  });

  if (compact) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.compactList}
      >
        {pickerItems}
      </ScrollView>
    );
  }

  return <View style={styles.list}>{pickerItems}</View>;
}

const styles = StyleSheet.create({
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginHorizontal: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e6e7eb",
    borderRadius: 15,
    backgroundColor: "#ffffff",
  },
  item: {
    width: 120,
    minHeight: 92,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  itemActive: { backgroundColor: "#d9273e" },
  name: { color: "#555b67", fontSize: 12, fontWeight: "600", textAlign: "center" },
  nameActive: { color: "#ffffff" },
  count: { color: "#89909d", fontSize: 10 },
  compactList: { gap: 7, paddingHorizontal: 12, paddingVertical: 5 },
  compactItem: {
    width: 78,
    minHeight: 74,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  compactName: { color: "#555b67", fontSize: 9, fontWeight: "600", textAlign: "center" },
});
