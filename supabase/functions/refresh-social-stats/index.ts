import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!supabaseServiceKey) {
      throw new Error("Supabase service key not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate the caller and ensure they are an admin
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(
      token
    );
    if (authError || !authData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    const userId = authData.user.id;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || profile?.role !== "admin") {
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Optional: read handles from request body
    let tiktokHandle = "winterrrr_v";
    let instagramHandle = "winter_v";
    try {
      const body = await req.json().catch(() => ({}));
      if (typeof body?.tiktokHandle === "string" && body.tiktokHandle.trim()) {
        tiktokHandle = body.tiktokHandle.replace(/^@/, "").trim();
      }
      if (
        typeof body?.instagramHandle === "string" &&
        body.instagramHandle.trim()
      ) {
        instagramHandle = body.instagramHandle.replace(/^@/, "").trim();
      }
    } catch (_) {
      // ignore
    }

    console.log("Refreshing all social platform stats as user", userId, "...");

    // Refresh ViewStats (YouTube)
    console.log("1. Fetching YouTube data from ViewStats...");
    const viewStatsResponse = await supabase.functions.invoke(
      "fetch-viewstats",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    let youtubeSuccess = false;
    if (viewStatsResponse.data?.success) {
      youtubeSuccess = true;
      console.log("✅ YouTube stats updated from ViewStats");

      // Also sync into platform_stats for dashboard consistency
      try {
        const yt = viewStatsResponse.data?.data || {};
        const followerCount =
          typeof yt.subscriberCount === "number" ? yt.subscriberCount : null;
        const monthlyViews =
          typeof yt.monthlyViews === "number"
            ? Math.round(yt.monthlyViews)
            : undefined;
        const updatePayload: Record<string, number | string | null> = {
          updated_at: new Date().toISOString(),
        } as any;
        if (followerCount !== null)
          updatePayload.follower_count = followerCount;
        if (typeof monthlyViews === "number")
          updatePayload.monthly_views = monthlyViews;

        if (Object.keys(updatePayload).length > 0) {
          const { error: psErr } = await supabase
            .from("platform_stats")
            .update(updatePayload)
            .eq("user_id", userId)
            .eq("platform", "youtube");
          if (psErr)
            console.log(
              "⚠️ Failed to update platform_stats (YouTube):",
              psErr.message
            );
        }
      } catch (e) {
        console.log(
          "⚠️ Error syncing YouTube into platform_stats:",
          (e as any)?.message
        );
      }
    } else {
      console.log(
        "❌ YouTube ViewStats update failed:",
        viewStatsResponse.error
      );
    }

    // Helper to parse counts with K/M/B suffixes
    const parseNumber = (str: string): number | null => {
      if (!str) return null;
      const s = String(str).trim();
      const m =
        s.match(/^([\d.,]+)\s*([KkMmBb])?$/) ||
        s.match(/"([\d.,]+)\s*([KkMmBb])?\s*Followers"/i) ||
        s.match(/([\d.,]+)\s*([KkMmBb])?\s*followers/i);
      if (!m) {
        // Try raw digits
        const d = s.replace(/[^\d.]/g, "");
        const n = parseFloat(d);
        return Number.isFinite(n) ? Math.round(n) : null;
      }
      const num = parseFloat(m[1].replace(/,/g, ""));
      if (!Number.isFinite(num)) return null;
      const suf = (m[2] || "").toUpperCase();
      const mult =
        suf === "K" ? 1e3 : suf === "M" ? 1e6 : suf === "B" ? 1e9 : 1;
      return Math.round(num * mult);
    };

    // Attempt to fetch Instagram data (limited due to API restrictions)
    console.log("2. Attempting Instagram data refresh...");
    let instagramData = null;
    try {
      // Try to fetch Instagram profile page (public data only)
      const instagramResponse = await fetch(
        `https://www.instagram.com/${instagramHandle}/`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
      );

      if (instagramResponse.ok) {
        const html = await instagramResponse.text();

        // Extract follower count from meta tags or structured data
        const followerMatch =
          html.match(/"edge_followed_by":\{"count":(\d+)\}/i) ||
          html.match(/([\d.,]+\s*[KkMmBb]?)\s*followers/i);

        if (followerMatch) {
          const followers = followerMatch[1]
            ? parseNumber(followerMatch[1]) ??
              parseInt(followerMatch[1].replace(/,/g, ""))
            : null;
          if (followers && followers > 0) {
            instagramData = { followers };
            console.log("✅ Instagram follower count extracted:", followers);
          }
        }
      }
    } catch (error) {
      console.log(
        "❌ Instagram data fetch failed (expected due to restrictions):",
        error.message
      );
    }

    // Sync Instagram followers into platform_stats when available
    if (instagramData?.followers) {
      try {
        const { error: igErr } = await supabase
          .from("platform_stats")
          .update({
            follower_count: instagramData.followers,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("platform", "instagram");
        if (igErr)
          console.log(
            "⚠️ Failed to update platform_stats (Instagram):",
            igErr.message
          );
      } catch (e) {
        console.log(
          "⚠️ Error syncing Instagram into platform_stats:",
          (e as any)?.message
        );
      }
    }
    // Attempt to fetch TikTok data (very limited)
    console.log("3. Attempting TikTok data refresh...");
    let tiktokData: { followers?: number } | null = null;
    try {
      // TikTok is heavily protected, but we can try basic page scraping
      const tiktokResponse = await fetch(
        `https://www.tiktok.com/@${tiktokHandle}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
      );

      if (tiktokResponse.ok) {
        const html = await tiktokResponse.text();
        // Try multiple patterns and parse K/M/B suffixes
        const followersMatch =
          html.match(/"fans":(\d+)/i) ||
          html.match(/"FollowerCount"\s*:\s*"([^"]+)"/i) ||
          html.match(/([\d.,]+\s*[KkMmBb]?)\s*Followers/i);

        if (followersMatch) {
          const raw = followersMatch[1] ?? followersMatch[0];
          const parsed = parseNumber(String(raw).replace(/^[^\d]*/, ""));
          if (parsed && parsed > 0) {
            const followers = parsed;
            tiktokData = { followers };
            console.log(
              "✅ TikTok follower count extracted (best-effort):",
              followers
            );
          }
        } else {
          console.log("ℹ️ TikTok follower pattern not found");
        }
      }
    } catch (error) {
      console.log(
        "❌ TikTok data fetch failed (expected due to restrictions):",
        (error as any)?.message
      );
    }

    // Sync TikTok followers into platform_stats when available
    if (tiktokData?.followers) {
      try {
        const { error: tkErr } = await supabase
          .from("platform_stats")
          .update({
            follower_count: tiktokData.followers,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("platform", "tiktok");
        if (tkErr)
          console.log(
            "⚠️ Failed to update platform_stats (TikTok):",
            tkErr.message
          );
      } catch (e) {
        console.log(
          "⚠️ Error syncing TikTok into platform_stats:",
          (e as any)?.message
        );
      }
    }

    // Return results
    const results = {
      success: true,
      updates: {
        youtube: youtubeSuccess ? "Updated from ViewStats" : "Failed",
        instagram: instagramData
          ? `Followers: ${instagramData.followers}`
          : "Limited access - manual update recommended",
        tiktok: tiktokData
          ? "Updated"
          : "Limited access - manual update recommended",
      },
      message:
        "Social platform refresh completed. YouTube auto-updated, Instagram/TikTok require manual updates in admin panel.",
    };

    console.log("Social refresh results:", results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in refresh-social-stats function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
