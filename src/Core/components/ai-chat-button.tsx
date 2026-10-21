import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type AiChatButtonProps = {
  isMobile?: boolean;
  onPress: () => void;
};

export function AiChatButton({
  isMobile = false,
  onPress,
}: AiChatButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Mở trợ lý AI"
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.button,
        isMobile && styles.buttonMobile,
        hovered && styles.buttonHover,
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          isMobile && styles.iconWrapMobile,
          hovered && styles.iconWrapHover,
        ]}
      >
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={isMobile ? 22 : 23}
          color={hovered ? "#d32f2f" : "#ffffff"}
        />
      </View>
      <Text
        style={[
          styles.label,
          isMobile && styles.labelMobile,
        ]}
      >
        Trợ lý AI
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", borderRadius: 10 },
  buttonMobile: { minWidth: 48 },
  buttonHover: { transform: [{ scale: 1.05 }] },
  iconWrap: {
    width: 50,
    height: 40,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapMobile: { width: 42, height: 36, borderRadius: 20 },
  iconWrapHover: {
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 5,
  },
  label: { color: "#ffffff", fontSize: 11, marginTop: 3, fontWeight: "500" },
  labelMobile: { fontSize: 10, marginTop: 2 },
});
