import Constants from "expo-constants";

const metroHost = Constants.expoConfig?.hostUri?.split(":")[0] || "localhost";

export const backendUrl = (
  process.env.EXPO_PUBLIC_BACKEND_URL?.trim() || `http://${metroHost}:3333`
).replace(/\/+$/, "");
