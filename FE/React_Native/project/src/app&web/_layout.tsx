import { DefaultTheme, Stack, ThemeProvider } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sign_up" options={{ headerShown: false }} />
        <Stack.Screen name="cart" options={{ headerShown: false }} />
        <Stack.Screen name="orders" options={{ headerShown: false }} />
        <Stack.Screen name="explore" options={{ headerShown: false }} />
        <Stack.Screen name="product_detail" options={{ headerShown: false }} />
        <Stack.Screen name="main_Admin" />
        <Stack.Screen name="order_management"/>
      </Stack>
    </ThemeProvider>
  );
}
