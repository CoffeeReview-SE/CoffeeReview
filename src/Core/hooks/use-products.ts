import { useCallback, useEffect, useState } from "react";
import { type Product } from "@/Core/services/products-api";
import { fallbackProducts } from "@/Core/services/catalog-fallback";

export function useProducts(enabled = true, language: "vi" | "en" = "vi") {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setProducts(fallbackProducts);
    setError(null);
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const initialLoad = setTimeout(() => void reload(), 0);
    return () => {
      clearTimeout(initialLoad);
    };
  }, [enabled, reload]);

  return { products, loading, error, reload };
}
