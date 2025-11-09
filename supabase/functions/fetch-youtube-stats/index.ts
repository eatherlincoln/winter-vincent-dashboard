import { supabase } from "@supabaseClient";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = "https://gmprigvmotrdrayxacnl.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!youtubeApiKey) {
      throw new Error("YouTube API key not configured");
    }

    if (!supabaseServiceKey) {
      throw new Error("Supabase service key not configured");
    }

    // Get the authorization header to verify user access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    // Create Supabase client for auth verification
    const supabaseAuth = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );

    // Verify the user token
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Invalid or expired token");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Sheldon Simkus YouTube channel ID (extracted from @sheldonsimkus)
    const channelId = "UCKp8YgCM8wfzNHqGY0_Fhfg"; // You may need to verify this ID

    console.log("Fetching YouTube stats for channel:", channelId);

    // Fetch channel statistics from YouTube Data API v3
    const youtubeResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${youtubeApiKey}`
    );

    if (!youtubeResponse.ok) {
      throw new Error(
        `YouTube API error: ${youtubeResponse.status} ${youtubeResponse.statusText}`
      );
    }

    const youtubeData = await youtubeResponse.json();
    console.log("YouTube API response:", youtubeData);

    if (!youtubeData.items || youtubeData.items.length === 0) {
      throw new Error("Channel not found or no data returned from YouTube API");
    }

    const stats = youtubeData.items[0].statistics;

    // Extract the statistics
    const channelStats = {
      channel_id: channelId,
      user_id: user.id, // Associate with the authenticated user
      subscriber_count: parseInt(stats.subscriberCount || "0"),
      view_count: parseInt(stats.viewCount || "0"),
      video_count: parseInt(stats.videoCount || "0"),
    };

    console.log("Parsed stats:", channelStats);

    // Insert or update the stats in the database (user-specific)
    const { data, error } = await supabase
      .from("youtube_stats")
      .upsert(channelStats, {
        onConflict: "user_id,channel_id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log("Successfully updated YouTube stats:", data);

    return new Response(
      JSON.stringify({
        success: true,
        data: channelStats,
        message: "YouTube stats updated successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in fetch-youtube-stats function:", error);
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
