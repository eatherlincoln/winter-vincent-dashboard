type Platform = "instagram" | "youtube" | "tiktok";

export type DashboardPayload = {
  platform_stats: Array<{
    platform: Platform;
    followers: number | null;
    monthly_views: number | null;
    engagement: number | null;
    followers_delta?: number | null;
    views_delta?: number | null;
    engagement_delta?: number | null;
    updated_at?: string | null;
  }>;
  audience: Record<string, any> | null;
  top_posts: Record<Platform, any[]>;
};

const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-dashboard`;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let cacheVersion: number | null = null;
let cacheData: DashboardPayload | null = null;
let inFlight: Promise<DashboardPayload> | null = null;

const versionKey = (version?: number) =>
  typeof version === "number" ? version : -1;

async function requestDashboard(): Promise<DashboardPayload> {
  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(anonKey ? { apikey: anonKey, Authorization: `Bearer ${anonKey}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Public dashboard request failed: ${res.status}`);
  }
  const json = await res.json();
  if (!json?.success) {
    throw new Error(json?.error || "Unknown dashboard error");
  }
  return json.data as DashboardPayload;
}

export async function fetchDashboardData(version?: number) {
  const key = versionKey(version);

  if (cacheData && cacheVersion === key) {
    return cacheData;
  }
  if (inFlight && cacheVersion === key) {
    return inFlight;
  }

  cacheVersion = key;
  inFlight = requestDashboard()
    .then((data) => {
      cacheData = data;
      return data;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
