import { backendUrl } from "@/Core/services/backend-url";
import type { Product } from "@/Core/services/products-api";

const adminUrl = `${backendUrl}/api/admin`;

export type AdminProduct = Product & { minimum: number; active: boolean };
export type Category = { id: string; name: string; description: string; productCount: number };
export type MovementType = "Nhập kho" | "Xuất kho";
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
export type StockProduct = Omit<AdminProduct, "active" | "status">;
export type StockData = { products: StockProduct[]; movements: Movement[] };
export type ProductInput = { name: string; category: string; price: number; stock: number; minimum?: number };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${adminUrl}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Không thể kết nối máy chủ quản trị.");
  return data as T;
}

export async function fetchAdminProducts(language: "vi" | "en" = "vi") {
  const data = await request<{ products: AdminProduct[] }>(`/products?lang=${language.toUpperCase()}`);
  return data.products;
}

export async function createAdminProduct(input: ProductInput) {
  const data = await request<{ product: AdminProduct }>("/products", { method: "POST", body: JSON.stringify(input) });
  return data.product;
}

export async function updateAdminProduct(id: string, input: ProductInput) {
  const data = await request<{ product: AdminProduct }>(`/products/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) });
  return data.product;
}

export async function removeAdminProduct(id: string) {
  await request<{ ok: true }>(`/products/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function fetchCategories(language: "vi" | "en" = "vi") {
  const data = await request<{ categories: Category[] }>(`/categories?lang=${language.toUpperCase()}`);
  return data.categories;
}

export async function saveAdminCategory(input: Pick<Category, "name" | "description">, id?: string) {
  const data = await request<{ category: Category }>(id ? `/categories/${encodeURIComponent(id)}` : "/categories", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(input),
  });
  return data.category;
}

export async function removeAdminCategory(id: string) {
  await request<{ ok: true }>(`/categories/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function fetchStockData(language: "vi" | "en" = "vi") {
  return request<StockData>(`/stock?lang=${language.toUpperCase()}`);
}

export async function saveStockMovement(movement: Omit<Movement, "id" | "date" | "productName">) {
  return request<{ id: string }>("/stock/movements", { method: "POST", body: JSON.stringify(movement) });
}

export async function createStockProduct(input: {
  name: string;
  category: string;
  price: number;
  minimum: number;
  quantity: number;
  partner: string;
  note: string;
}) {
  const data = await request<{ product: AdminProduct }>("/stock/products", { method: "POST", body: JSON.stringify(input) });
  return data.product;
}
