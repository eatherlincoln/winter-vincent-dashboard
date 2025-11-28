import { useEffect, useState } from "react";
import { fetchDashboardData } from "@/lib/publicDashboard";
import { useRefreshSignal } from "./useAutoRefresh";

export function useBrandAssets() {
  const { version } = useRefreshSignal();
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchDashboardData(version)
      .then((payload) => {
        if (!alive) return;
        setAssets(payload?.assets || {});
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [version]);

  return { assets, loading };
}
