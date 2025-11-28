import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl =
  Deno.env.get("SUPABASE_URL") ?? Deno.env.get("SERVICE_URL") ?? "";
const serviceKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("SERVICE_ROLE_KEY") ??
  "";

if (!supabaseUrl) {
  console.error("Missing SUPABASE_URL for public-dashboard");
}

if (!serviceKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY for public-dashboard");
}

const supabase = createClient(supabaseUrl ?? "", serviceKey ?? "");
const PUBLIC_USER_ID =
  Deno.env.get("PUBLIC_USER_ID") || "8a2f7fc5-4e21-4af5-ab98-80956b3b7fa0";

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
          "platform, follower_count, monthly_views, engagement_rate, updated_at"
        )
        .eq("user_id", PUBLIC_USER_ID),
      supabase
        .from("platform_audience")
        .select(
          "gender, age_groups, countries, cities, updated_at, user_id, platform"
        )
        .eq("platform", "instagram")
        .eq("user_id", PUBLIC_USER_ID)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
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
    const message =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : JSON.stringify(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
