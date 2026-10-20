import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export type MovementType = "Nhập kho" | "Xuất kho";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minimum: number;
};

export type Movement = {
  id: string;
  type: MovementType;
  productId: string;
  productName: string;
  quantity: number;
  partner: string;
  note: string;
  date: string;
};

export type StockData = { products: Product[]; movements: Movement[] };

const STORAGE_KEY = "smartshop.stock.v1";

const initialData: StockData = {
  products: [
    { id: "SP0001", name: "iPhone 15 Pro Max", category: "Điện thoại", price: 28990000, stock: 18, minimum: 5 },
    { id: "SP0002", name: "MacBook Air M3", category: "Laptop", price: 25990000, stock: 7, minimum: 5 },
    { id: "SP0003", name: "Tai nghe Sony WH-1000XM5", category: "Phụ kiện", price: 7490000, stock: 0, minimum: 4 },
    { id: "SP0004", name: "Apple Watch Series 10", category: "Đồng hồ", price: 11990000, stock: 12, minimum: 4 },
    { id: "SP0005", name: "Bàn phím cơ Keychron K2", category: "Phụ kiện", price: 2190000, stock: 3, minimum: 6 },
    { id: "SP0006", name: "Chuột Logitech MX Master 3S", category: "Phụ kiện", price: 2490000, stock: 15, minimum: 5 },
  ],
  movements: [
    { id: "PN00128", type: "Nhập kho", productId: "SP0001", productName: "iPhone 15 Pro Max", quantity: 10, partner: "Công ty TNHH Apple Việt Nam", note: "Nhập hàng định kỳ", date: "20/10/2026 09:15" },
    { id: "PX00127", type: "Xuất kho", productId: "SP0002", productName: "MacBook Air M3", quantity: 2, partner: "Đơn hàng BVP001258", note: "Xuất bán", date: "20/10/2026 08:42" },
    { id: "PN00126", type: "Nhập kho", productId: "SP0005", productName: "Bàn phím cơ Keychron K2", quantity: 8, partner: "Nhà phân phối Keychron", note: "Bổ sung hàng sắp hết", date: "19/10/2026 16:30" },
    { id: "PX00125", type: "Xuất kho", productId: "SP0004", productName: "Apple Watch Series 10", quantity: 1, partner: "Đơn hàng BVP001241", note: "Xuất bán", date: "19/10/2026 14:05" },
  ],
};

let stockData = initialData;
let hydration: Promise<void> | undefined;
let writeQueue: Promise<void> = Promise.resolve();
const listeners = new Set<(data: StockData) => void>();

function publish(data: StockData) {
  stockData = data;
  listeners.forEach((listener) => listener(stockData));
}

function hydrate() {
  if (!hydration) {
    hydration = AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed: unknown = JSON.parse(stored);
        if (
          parsed && typeof parsed === "object" &&
          Array.isArray((parsed as StockData).products) &&
          Array.isArray((parsed as StockData).movements)
        ) {
          publish(parsed as StockData);
        }
      })
      .catch(() => {
        // Keep the bundled sample data available if storage is unavailable or invalid.
      });
  }
  return hydration;
}

export function useStockData() {
  const [data, setData] = useState(stockData);

  useEffect(() => {
    const listener = (next: StockData) => setData(next);
    listeners.add(listener);
    void hydrate().then(() => setData(stockData));
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return data;
}

export function recordMovement(movement: Movement) {
  const task = writeQueue.then(async () => {
    await hydrate();
    const product = stockData.products.find((item) => item.id === movement.productId);
    if (!product) throw new Error("Không tìm thấy sản phẩm.");
    if (movement.type === "Xuất kho" && movement.quantity > product.stock) {
      throw new Error(`Sản phẩm hiện chỉ còn ${product.stock} sản phẩm.`);
    }

    const next: StockData = {
      products: stockData.products.map((item) => item.id === product.id
        ? { ...item, stock: item.stock + (movement.type === "Nhập kho" ? movement.quantity : -movement.quantity) }
        : item),
      movements: [movement, ...stockData.movements],
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    publish(next);
  });

  writeQueue = task.catch(() => undefined);
  return task;
}

export function createProductWithInboundMovement(input: {
  name: string;
  category: string;
  price: number;
  minimum: number;
  quantity: number;
  partner: string;
  note: string;
}) {
  const task = writeQueue.then(async () => {
    await hydrate();
    let id = `SP${Date.now()}`;
    while (stockData.products.some((product) => product.id === id)) id = `SP${Number(id.slice(2)) + 1}`;

    const product: Product = {
      id,
      name: input.name.trim(),
      category: input.category.trim(),
      price: input.price,
      stock: input.quantity,
      minimum: input.minimum,
    };
    const movement: Movement = {
      id: `PN${Date.now()}`,
      type: "Nhập kho",
      productId: product.id,
      productName: product.name,
      quantity: input.quantity,
      partner: input.partner.trim() || "Nhà cung cấp",
      note: input.note.trim() || "Nhập kho ban đầu",
      date: new Date().toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }),
    };
    const next: StockData = {
      products: [product, ...stockData.products],
      movements: [movement, ...stockData.movements],
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    publish(next);
    return product;
  });

  writeQueue = task.then(() => undefined, () => undefined);
  return task;
}
