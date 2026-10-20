import { DefaultTheme, Stack, ThemeProvider } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="account" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="address" options={{ headerShown: false }} />
        <Stack.Screen name="sign_up" options={{ headerShown: false }} />
        <Stack.Screen name="cart" options={{ headerShown: false }} />
        <Stack.Screen name="orders" options={{ headerShown: false }} />
        <Stack.Screen name="explore" options={{ headerShown: false }} />
        <Stack.Screen name="product_detail" options={{ headerShown: false }} />
        <Stack.Screen name="main_Admin" />
        <Stack.Screen name="order_management" />
        <Stack.Screen name="product_management" />
        <Stack.Screen name="category_management" />
        <Stack.Screen name="stock_inventory" />
        <Stack.Screen name="stock_movements" />
      </Stack>
    </ThemeProvider>
  );
}
