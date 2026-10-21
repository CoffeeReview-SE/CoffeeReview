import { useCallback, useEffect, useState } from "react";
import { fetchCategories, type Category } from "@/Core/services/admin-api";

export function useAdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try {
      setCategories(await fetchCategories());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được danh mục.");
    }
  }, []);
  useEffect(() => {
    const firstLoad = setTimeout(() => void reload(), 0);
    const interval = setInterval(reload, 30_000);
    return () => { clearTimeout(firstLoad); clearInterval(interval); };
  }, [reload]);
  return { categories, error, reload };
}
