
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Ionicons } from "@expo/vector-icons";

export type Product = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  originalPrice?: number;
};

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
  addItems: (
    products: {
      product: Product;
      quantity: number;
    }[],
  ) => void;
  updateQuantity: (id: string, amount: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function getProductIcon(
  product: Product,
): keyof typeof Ionicons.glyphMap {
  if (product.categoryId === "PHONE1") {
    return "phone-portrait-outline";
  }

  if (product.categoryId === "LAPTOP") {
    return "laptop-outline";
  }

  if (product.categoryId === "WATCH1") {
    return "watch-outline";
  }

  return "headset-outline";
}

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems((current) => {
      const existing = current.find(
        (item) => item.id === product.id,
      );

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: 1,
          variant: "Chính hãng",
          icon: getProductIcon(product),
        },
      ];
    });
  }, []);

  const addItems = useCallback(
    (
      products: {
        product: Product;
        quantity: number;
      }[],
    ) => {
      setItems((current) => {
        let updated = [...current];

        for (const { product, quantity } of products) {
          if (!Number.isInteger(quantity) || quantity <= 0) {
            continue;
          }

          const existing = updated.find(
            (item) => item.id === product.id,
          );

          if (existing) {
            updated = updated.map((item) =>
              item.id === product.id
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                  }
                : item,
            );
          } else {
            updated.push({
              ...product,
              quantity,
              variant: "Chính hãng",
              icon: getProductIcon(product),
            });
          }
        }

        return updated;
      });
    },
    [],
  );

  const updateQuantity = useCallback(
    (id: string, amount: number) => {
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Math.max(
                  1,
                  item.quantity + amount,
                ),
              }
            : item,
        ),
      );
    },
    [],
  );

  const removeItem = useCallback((id: string) => {
    setItems((current) =>
      current.filter((item) => item.id !== id),
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      addItem,
      addItems,
      updateQuantity,
      removeItem,
      clear,
    }),
    [
      items,
      itemCount,
      addItem,
      addItems,
      updateQuantity,
      removeItem,
      clear,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider",
    );
  }

  return context;
}
