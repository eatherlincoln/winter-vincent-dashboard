import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ??
  "https://iekmymepjbqwlmqejidv.supabase.co";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!serviceKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY for public-dashboard");
}

const supabase = createClient(supabaseUrl, serviceKey ?? "");

type Platform = "instagram" | "youtube" | "tiktok";
const PLATFORMS: Platform[] = ["instagram", "youtube", "tiktok"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!serviceKey) {
      throw new Error("Service role key not configured");
    }

    const [statsRes, audienceRes, postsRes] = await Promise.all([
      supabase
        .from("platform_stats")
        .select(
          "platform, followers, monthly_views, engagement, followers_delta, views_delta, engagement_delta, updated_at"
        ),
      supabase.from("audience").select("*").eq("id", "global").maybeSingle(),
      supabase
        .from("top_posts")
        .select(
          "platform, rank, url, caption, image_url, likes, comments, shares, views, updated_at"
        )
        .in("platform", PLATFORMS)
        .order("rank", { ascending: true }),
    ]);

    if (statsRes.error) throw statsRes.error;
    if (audienceRes.error) throw audienceRes.error;
    if (postsRes.error) throw postsRes.error;

    const groupedPosts: Record<Platform, any[]> = {
      instagram: [],
      youtube: [],
      tiktok: [],
    };
    for (const row of postsRes.data ?? []) {
      const platform = (row.platform ?? "") as Platform;
      if (groupedPosts[platform]) {
        groupedPosts[platform].push(row);
      }
    }

    const payload = {
      platform_stats: statsRes.data ?? [],
      audience: audienceRes.data ?? null,
      top_posts: groupedPosts,
    };

    return new Response(JSON.stringify({ success: true, data: payload }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("public-dashboard error", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
