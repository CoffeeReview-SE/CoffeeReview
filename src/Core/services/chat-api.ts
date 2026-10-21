import Constants from "expo-constants";

const metroHost = Constants.expoConfig?.hostUri?.split(":")[0] || "localhost";

export const chatApiUrl =
  process.env.EXPO_PUBLIC_CHAT_API_URL || `http://${metroHost}:3333/api/chat`;

export const chatHealthUrl = chatApiUrl.replace(/\/api\/chat\/?$/, "/health");
