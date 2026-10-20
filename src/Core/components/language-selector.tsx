import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
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
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityLabel="Chọn ngôn ngữ"
        accessibilityRole="button"
        hitSlop={6}
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          pressed && styles.triggerPressed,
        ]}
      >
        <Ionicons name="globe-outline" size={17} color="#c62828" />
        <Text style={styles.triggerText}>
          {language.toUpperCase()}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#c62828" />
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          accessibilityLabel="Đóng danh sách ngôn ngữ"
          style={styles.backdrop}
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            style={styles.menu}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.menuHeading}>
              <View style={styles.menuIcon}>
                <Ionicons name="globe-outline" size={19} color="#c62828" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Ngôn ngữ</Text>
                <Text style={styles.menuSubtitle}>Chọn ngôn ngữ hiển thị</Text>
              </View>
            </View>
            <View style={styles.divider} />
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
                  <View style={styles.optionCopy}>
                    <Text
                      style={[
                        styles.optionCode,
                        selected && styles.optionCodeSelected,
                      ]}
                    >
                      {option.value.toUpperCase()}
                    </Text>
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.checkCircle,
                      selected && styles.checkCircleSelected,
                    ]}
                  >
                    {selected && (
                      <Ionicons name="checkmark" size={13} color="#ffffff" />
                    )}
                  </View>
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
    backgroundColor: "#ffffff",
    borderColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderRadius: 12,
    elevation: 2,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: "#6f1010",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
  },
  triggerPressed: {
    backgroundColor: "#fff5f5",
  },
  triggerText: {
    color: "#a61f1f",
    fontSize: 12,
    fontWeight: "700",
  },
  backdrop: {
    alignItems: "flex-end",
    backgroundColor: "rgba(22, 27, 36, 0.32)",
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 76,
  },
  menu: {
    backgroundColor: "#ffffff",
    borderColor: "#f0eeee",
    borderRadius: 16,
    borderWidth: 1,
    elevation: 12,
    minWidth: 224,
    padding: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
  },
  menuHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  menuIcon: {
    alignItems: "center",
    backgroundColor: "#fff1f1",
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  menuTitle: {
    color: "#222222",
    fontSize: 14,
    fontWeight: "700",
  },
  menuSubtitle: {
    color: "#858585",
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    backgroundColor: "#eeeeee",
    height: 1,
    marginVertical: 10,
  },
  option: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  optionSelected: {
    backgroundColor: "#fff5f5",
  },
  optionPressed: {
    opacity: 0.72,
  },
  optionCopy: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  optionCode: {
    backgroundColor: "#f4f5f7",
    borderRadius: 7,
    color: "#687080",
    fontSize: 10,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  optionCodeSelected: {
    backgroundColor: "#ffe5e5",
    color: "#c62828",
  },
  checkCircle: {
    alignItems: "center",
    borderColor: "#d9dce1",
    borderRadius: 9,
    borderWidth: 1,
    height: 18,
    justifyContent: "center",
    width: 18,
  },
  checkCircleSelected: {
    backgroundColor: "#c62828",
    borderColor: "#c62828",
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
