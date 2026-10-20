import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

import {
  useLanguage,
  type Language,
} from "@/Core/contexts/language-context";

const options: { value: Language; label: string }[] = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
];

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityLabel={t("Chọn ngôn ngữ")}
        accessibilityRole="button"
        hitSlop={6}
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          pressed && styles.triggerPressed,
        ]}
      >
        <Ionicons name="globe-outline" size={17} color="#ffffff" />
        <Text style={styles.triggerText}>{language.toUpperCase()}</Text>
        <Ionicons name="chevron-down" size={14} color="#ffffff" />
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          accessibilityLabel={t("Đóng danh sách ngôn ngữ")}
          style={styles.backdrop}
          onPress={() => setIsOpen(false)}
        >
          <Pressable style={styles.menu} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.menuTitle}>{t("Ngôn ngữ")}</Text>
            {options.map((option) => {
              const selected = option.value === language;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => {
                    setLanguage(option.value);
                    setIsOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {language === "en" && option.value === "vi"
                      ? t("Tiếng Việt")
                      : option.label}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark" size={18} color="#d32f2f" />
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  triggerPressed: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  triggerText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  backdrop: {
    alignItems: "flex-end",
    backgroundColor: "rgba(0,0,0,0.18)",
    flex: 1,
    paddingRight: 18,
    paddingTop: 82,
  },
  menu: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 8,
    minWidth: 170,
    padding: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  menuTitle: {
    color: "#666666",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  option: {
    alignItems: "center",
    borderRadius: 7,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  optionSelected: {
    backgroundColor: "#fff1f1",
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionText: {
    color: "#333333",
    fontSize: 14,
  },
  optionTextSelected: {
    color: "#d32f2f",
    fontWeight: "700",
  },
});
