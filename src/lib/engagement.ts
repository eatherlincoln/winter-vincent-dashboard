// src/lib/engagement.ts
import { SupabaseClient } from "@supabase/supabase-js";

type Platform = "instagram" | "youtube" | "tiktok";

export async function recalcEngagement(
  supabase: SupabaseClient,
  platform: Platform
) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;

  // Pull all the inputs we might need
  const { data, error } = await supabase
    .from("platform_stats")
    .select(
      `
      platform,
      monthly_views,
      monthly_reach,
      total_views,
      monthly_likes,
      monthly_comments,
      monthly_shares,
      monthly_saves
    `
    )
    .eq("platform", platform)
    .maybeSingle();

  if (error || !data) {
    // Don't throw, just bail quietly
    return;
  }

  const likes = num(data.monthly_likes);
  const comments = num(data.monthly_comments);
  const shares = num(data.monthly_shares);
  const saves = num(data.monthly_saves);
  const monthlyViews = num(data.monthly_views);
  const reach = num(data.monthly_reach);
  const totalViews = num(data.total_views);

  // Per-platform formulas (industry-friendly)
  // Denominator preference:
  // - IG: reach || monthlyViews
  // - YT: totalViews || monthlyViews
  // - TT: totalViews || monthlyViews
  let numerator = 0;
  let denominator = 0;

  if (platform === "instagram") {
    numerator = likes + comments + saves;
    denominator = firstNonZero(reach, monthlyViews);
  } else if (platform === "youtube") {
    numerator = likes + comments + shares;
    denominator = firstNonZero(totalViews, monthlyViews);
  } else {
    // tiktok
    numerator = likes + comments + shares + saves;
    denominator = firstNonZero(totalViews, monthlyViews);
  }

  const pct = denominator > 0 ? round2((numerator / denominator) * 100) : 0;

  // Persist the computed engagement back into platform_stats
  const record: any = { platform, engagement_rate: pct };
  if (userId) record.user_id = userId;

  await supabase
    .from("platform_stats")
    .upsert([record], {
      onConflict: userId ? "user_id,platform" : "platform",
    });
}

function num(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function firstNonZero(...vals: number[]) {
  for (const v of vals) if (v > 0) return v;
  return 0;
}
