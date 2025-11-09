import { useEffect, useState } from "react";
import { useRefreshSignal } from "./useAutoRefresh";
import { fetchDashboardData } from "@/lib/publicDashboard";

type InstagramPost = {
  rank: number;
  url: string;
  caption?: string;
  image_url?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  updated_at?: string | null;
};

export function useInstagramTopPosts() {
  const { version } = useRefreshSignal(); // re-fetch after admin saves
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);

      fetchDashboardData(version)
        .then((payload) => {
          if (!active) return;
          const list = payload?.top_posts?.instagram ?? [];
          setPosts(list as InstagramPost[]);
        })
        .catch((err) => {
          if (!active) return;
          console.error("Error fetching Instagram posts:", err);
          setPosts([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    })();

    return () => {
      active = false;
    };
  }, [version]);

  return { posts, loading };
}
