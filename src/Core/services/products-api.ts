import { backendUrl } from "@/Core/services/backend-url";

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  status: "Đang bán" | "Hết hàng" | "Ngừng bán";
};

export type ProductCategory = {
  id: string;
  name: string;
  description: string;
  productCount: number;
};

const productsUrl = `${backendUrl}/api/catalog/products`;
const categoriesUrl = `${backendUrl}/api/catalog/categories`;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Không thể kết nối máy chủ sản phẩm.");
  return data as T;
}

export async function fetchProducts(language: "vi" | "en" = "vi") {
  const data = await request<{ products: Product[] }>(`${productsUrl}?lang=${language.toUpperCase()}`);
  return data.products;
}

export async function fetchProductCategories(language: "vi" | "en" = "vi") {
  const data = await request<{ categories: ProductCategory[] }>(`${categoriesUrl}?lang=${language.toUpperCase()}`);
  return data.categories;
}
