import { useEffect, useState } from "react";
import {
  createStockProduct,
  fetchStockData,
  saveStockMovement,
  type Movement,
  type StockData,
  type StockProduct,
} from "@/Core/services/admin-api";

export type { Movement, MovementType } from "@/Core/services/admin-api";
export type Product = StockProduct;

let stockData: StockData = { products: [], movements: [] };
let writeQueue: Promise<void> = Promise.resolve();
const listeners = new Set<(data: StockData) => void>();

function publish(data: StockData) {
  stockData = data;
  listeners.forEach((listener) => listener(stockData));
}

async function refreshStock() {
  const data = await fetchStockData("vi");
  publish(data);
}

export function useStockData() {
  const [data, setData] = useState(stockData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const listener = (next: StockData) => setData(next);
    listeners.add(listener);
    const load = async () => {
      try {
        await refreshStock();
        setError(null);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không tải được dữ liệu kho.");
      }
    };
    const initialLoad = setTimeout(() => void load(), 0);
    const interval = setInterval(() => void load(), 15_000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
      listeners.delete(listener);
    };
  }, []);

  return { ...data, error };
}

export function recordMovement(movement: Movement) {
  const task = writeQueue.then(async () => {
    await saveStockMovement({
      type: movement.type,
      productId: movement.productId,
      quantity: movement.quantity,
      partner: movement.partner,
      note: movement.note,
    });
    await refreshStock();
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
    const product = await createStockProduct({
      name: input.name.trim(),
      category: input.category.trim(),
      price: input.price,
      minimum: input.minimum,
      quantity: input.quantity,
      partner: input.partner.trim(),
      note: input.note.trim(),
    });
    await refreshStock();
    return product;
  });
  writeQueue = task.then(() => undefined, () => undefined);
  return task;
}
