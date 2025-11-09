// src/hooks/usePlatformAudience.ts
import { useEffect, useState } from "react";
import { useRefreshSignal } from "@/hooks/useAutoRefresh";
import { fetchDashboardData } from "@/lib/publicDashboard";

export type AgeBand = { range: string; percentage: number };
export type Country = { country: string; percentage: number };

export type AudienceRow = {
  user_id: string | null;
  gender: { men?: number; women?: number } | null;
  age_bands: AgeBand[] | null;
  countries: Country[] | null;
  cities: string[] | null;
  updated_at: string | null;
};

export function usePlatformAudience() {
  const [row, setRow] = useState<AudienceRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { version } = useRefreshSignal();

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      fetchDashboardData(version)
        .then((payload) => {
          if (!alive) return;
          setError(null);
          setRow(payload?.audience || null);
        })
        .catch((err) => {
          if (!alive) return;
          setError(err instanceof Error ? err.message : String(err));
          setRow(null);
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    })();
    return () => {
      alive = false;
    };
  }, [version]);

  return { audience: row, loading, error };
}
