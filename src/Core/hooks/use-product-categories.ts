import { useCallback, useEffect, useState } from "react";
import { type ProductCategory } from "@/Core/services/products-api";
import { fallbackCategories } from "@/Core/services/catalog-fallback";

export function useProductCategories(enabled = true, language: "vi" | "en" = "vi") {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setCategories(fallbackCategories);
    setError(null);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const initialLoad = setTimeout(() => void reload(), 0);
    return () => {
      clearTimeout(initialLoad);
    };
  }, [enabled, reload]);

  return { categories, error, reload };
}
