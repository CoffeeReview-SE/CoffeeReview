import { useFonts } from "expo-font";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { LanguageProvider } from "@/Core/contexts/language-context";
import { CartProvider } from "@/Core/contexts/cart-context";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...FontAwesome6.font,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <LanguageProvider>
      <CartProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="cart" options={{ headerShown: false }} />
            <Stack.Screen name="orders" options={{ headerShown: false }} />
            <Stack.Screen name="explore" options={{ headerShown: false }} />
            <Stack.Screen name="chat" options={{ headerShown: false }} />
            <Stack.Screen name="product_detail" options={{ headerShown: false }} />
            <Stack.Screen name="products" options={{ headerShown: false }} />
            <Stack.Screen name="main_Admin" />
            <Stack.Screen name="order_management" />
            <Stack.Screen name="product_management" />
            <Stack.Screen name="category_management" />
            <Stack.Screen name="stock_inventory" />
            <Stack.Screen name="stock_movements" />
          </Stack>
        </ThemeProvider>
      </CartProvider>
    </LanguageProvider>
  );
}
