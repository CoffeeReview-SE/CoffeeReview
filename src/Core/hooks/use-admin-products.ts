import { useCallback, useEffect, useState } from "react";
import { fetchAdminProducts, type AdminProduct } from "@/Core/services/admin-api";

export function useAdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try {
      setProducts(await fetchAdminProducts());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const firstLoad = setTimeout(() => void reload(), 0);
    const interval = setInterval(reload, 15_000);
    return () => { clearTimeout(firstLoad); clearInterval(interval); };
  }, [reload]);
  return { products, loading, error, reload };
}
