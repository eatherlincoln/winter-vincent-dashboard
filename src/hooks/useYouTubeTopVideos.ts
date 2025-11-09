import { useEffect, useState } from "react";
import { useRefreshSignal } from "./useAutoRefresh";
import { fetchDashboardData } from "@/lib/publicDashboard";

type YouTubeVideo = {
  rank: number;
  url: string;
  caption?: string; // title/description field you’re using
  image_url?: string; // uploaded/override thumbnail
  views?: number;
  likes?: number;
  comments?: number;
  updated_at?: string | null;
};

export function useYouTubeTopVideos() {
  const { version } = useRefreshSignal(); // re-fetch after admin saves
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);

      fetchDashboardData(version)
        .then((payload) => {
          if (!active) return;
          const list = payload?.top_posts?.youtube ?? [];
          setVideos(list as YouTubeVideo[]);
        })
        .catch((err) => {
          if (!active) return;
          console.error("Error fetching YouTube videos:", err);
          setVideos([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    })();

    return () => {
      active = false;
    };
  }, [version]);

  return { videos, loading };
}
