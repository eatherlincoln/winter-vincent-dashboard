import { useEffect, useState } from "react";
import { useRefreshSignal } from "./useAutoRefresh";
import { fetchDashboardData } from "@/lib/publicDashboard";

type Platform = "instagram" | "youtube" | "tiktok";

type StatRow = {
  platform: Platform;
  followers: number;
  monthly_views: number;
  engagement: number;
  updated_at: string | null;
};

type DeltaRow = {
  followers: number | null;
  monthly_views: number | null;
  engagement: number | null;
};

const PLATFORMS: Platform[] = ["instagram", "youtube", "tiktok"];

const emptyRow = (platform: Platform): StatRow => ({
  platform,
  followers: 0,
  monthly_views: 0,
  engagement: 0,
  updated_at: null,
});

const emptyDelta = (): DeltaRow => ({
  followers: null,
  monthly_views: null,
  engagement: null,
});

export function usePlatformStats() {
  const { version } = useRefreshSignal();
  const [stats, setStats] = useState<Record<Platform, StatRow>>({
    instagram: emptyRow("instagram"),
    youtube: emptyRow("youtube"),
    tiktok: emptyRow("tiktok"),
  });
  const [deltas, setDeltas] = useState<Record<Platform, DeltaRow>>({
    instagram: emptyDelta(),
    youtube: emptyDelta(),
    tiktok: emptyDelta(),
  });
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    fetchDashboardData(version)
      .then((payload) => {
        if (!alive) return;
        const nextStats: Record<Platform, StatRow> = {
          instagram: emptyRow("instagram"),
          youtube: emptyRow("youtube"),
          tiktok: emptyRow("tiktok"),
        };
        const nextDeltas: Record<Platform, DeltaRow> = {
          instagram: emptyDelta(),
          youtube: emptyDelta(),
          tiktok: emptyDelta(),
        };

        let latestUpdate: string | null = null;
        (payload?.platform_stats ?? []).forEach((row: any) => {
          const platform = row.platform as Platform;
          if (!PLATFORMS.includes(platform)) return;
          nextStats[platform] = {
            platform,
            followers: Number(
              row.followers ?? row.follower_count ?? row.followers_count ?? 0
            ),
            monthly_views: Number(
              row.monthly_views ?? row.views ?? row.view_count ?? 0
            ),
            engagement: Number(row.engagement ?? row.engagement_rate ?? 0),
            updated_at: row.updated_at ?? null,
          };
          nextDeltas[platform] = {
            followers:
              typeof row.followers_delta === "number"
                ? row.followers_delta
                : null,
            monthly_views:
              typeof row.views_delta === "number"
                ? row.views_delta
                : typeof row.monthly_views_delta === "number"
                  ? row.monthly_views_delta
                  : null,
            engagement:
              typeof row.engagement_delta === "number"
                ? row.engagement_delta
                : null,
          };

          if (
            row.updated_at &&
            (!latestUpdate || row.updated_at > latestUpdate)
          ) {
            latestUpdate = row.updated_at;
          }
        });

        setStats(nextStats);
        setDeltas(nextDeltas);
        setUpdatedAt(latestUpdate);
      })
      .catch((err) => {
        console.error("Failed to load platform stats:", err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [version]);

  return { stats, deltas, updatedAt, loading };
}
