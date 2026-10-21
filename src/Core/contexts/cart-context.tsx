import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import type { Product } from "@/Core/services/products-api";

export type CartItem = Product & {
  quantity: number;
  variant: string;
  originalPrice?: number;
  icon: keyof typeof Ionicons.glyphMap;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addItem: (product: Product) => void;
  updateQuantity: (id: string, amount: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, {
        ...product,
        quantity: 1,
        variant: "Chính hãng",
        icon: product.categoryId === "PHONE1" ? "phone-portrait-outline" : product.categoryId === "LAPTOP" ? "laptop-outline" : product.categoryId === "WATCH1" ? "watch-outline" : "headset-outline",
      }];
    });
  }, []);

  const updateQuantity = useCallback((id: string, amount: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item,
      ),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const value = useMemo(
    () => ({ items, itemCount, addItem, updateQuantity, removeItem, clear }),
    [items, itemCount, addItem, updateQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
