import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

type SocialAsset = {
  source: string;
  thumb_path: string;
  updated_at: string;
};

export function useSocialAssets(source: string) {
  const [asset, setAsset] = useState<SocialAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAsset() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("social_media_assets")
        .select("source, thumb_path, updated_at")
        .eq("source", source)
        .single();

      if (error) {
        throw error;
      }

      setAsset(data);
    } catch (err) {
      console.error("Error fetching social asset:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch asset");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAsset();

    // Set up real-time subscription for asset changes
    const channel = supabase
      .channel(`social_assets_${source}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "social_media_assets",
          filter: `source=eq.${source}`,
        },
        () => {
          console.log(`Asset updated for ${source}, refetching...`);
          fetchAsset();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [source]);

  return { asset, loading, error, refetch: fetchAsset };
}
