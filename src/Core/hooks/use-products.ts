import { useCallback, useEffect, useState } from "react";
import { fetchProducts, type Product } from "@/Core/services/products-api";

export function useProducts(enabled = true, language: "vi" | "en" = "vi") {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    try {
      const next = await fetchProducts(language);
      setProducts(next);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [enabled, language]);

  useEffect(() => {
    if (!enabled) return;
    const initialLoad = setTimeout(() => void reload(), 0);
    const interval = setInterval(reload, 15_000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [enabled, reload]);

  return { products, loading, error, reload };
}
