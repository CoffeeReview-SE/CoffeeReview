import * as Speech from "expo-speech";
import type { Language } from "@/Core/contexts/language-context";

const locales: Record<Language, string> = { vi: "vi-VN", en: "en-US" };

export const welcomeText: Record<Language, string> = {
  vi: "Chào mừng bạn đến với BVP Shop. Ngôn ngữ đã chuyển sang tiếng Việt.",
  en: "Welcome to BVP Shop. The language has been switched to English.",
};

export function speak(text: string, language: Language) {
  if (!text.trim()) return;
  Speech.stop();
  Speech.speak(text, { language: locales[language] });
}