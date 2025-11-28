// src/hooks/index.ts

// Refresh signal
export { useAutoRefresh, useRefreshSignal } from "./useAutoRefresh";

// Platform stats / audience
export { usePlatformStats } from "./usePlatformStats";
export { usePlatformAudience } from "./usePlatformAudience";

// Top content
export { useInstagramTopPosts } from "./useInstagramTopPosts";
export { useYouTubeTopVideos } from "./useYouTubeTopVideos";
export { useTikTokTopPosts } from "./useTikTokTopPosts"; // ✅ add this

// (keep any other exports you rely on below)
export { useInstagramMonthlyLikes } from "./useInstagramMonthlyLikes";
export { useRealtimeAnalytics } from "./useRealtimeAnalytics";
export { useAnalyticsSnapshot } from "./useAnalyticsSnapshot";
export { useSocialMetrics } from "./useSocialMetrics";
export { useViewStats } from "./useViewStats";
export { useSocialAssets } from "./useSocialAssets";
export { useBrandAssets } from "./useBrandAssets";

// Utilities
export { useIsMobile as useMobile } from "./use-mobile";
export { useToast } from "./use-toast";
