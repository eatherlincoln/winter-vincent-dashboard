// src/hooks/useTikTokTopPosts.ts
import { useEffect, useState } from "react";
import { useRefreshSignal } from "./useAutoRefresh";
import { fetchDashboardData } from "@/lib/publicDashboard";

type TikTokPost = {
  rank: number;
  url: string;
  caption?: string;
  image_url?: string;
  likes?: number;
  comments?: number;
  shares?: number;
};

export function useTikTokTopPosts() {
  const { version } = useRefreshSignal(); // ✅ re-fetch when admin saves
  const [posts, setPosts] = useState<TikTokPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);

      fetchDashboardData(version)
        .then((payload) => {
          if (!active) return;
          const list = payload?.top_posts?.tiktok ?? [];
          setPosts(list as TikTokPost[]);
        })
        .catch((err) => {
          if (!active) return;
          console.error("Error fetching TikTok posts:", err);
          setPosts([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    })();

    return () => {
      active = false;
    };
  }, [version]); // ✅ refresh when tick() is called

  return { posts, loading };
}
