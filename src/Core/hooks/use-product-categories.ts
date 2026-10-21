import { useCallback, useEffect, useState } from "react";
import {
  fetchProductCategories,
  type ProductCategory,
} from "@/Core/services/products-api";

export function useProductCategories(enabled = true, language: "vi" | "en" = "vi") {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    try {
      setCategories(await fetchProductCategories(language));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được danh mục.");
    }
  }, [enabled, language]);

  useEffect(() => {
    if (!enabled) return;
    const initialLoad = setTimeout(() => void reload(), 0);
    const interval = setInterval(reload, 60_000);
    return () => {
      clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, [enabled, reload]);

  return { categories, error, reload };
}
