import React from "react";
import { useYouTubeTopVideos } from "@/hooks/useYouTubeTopVideos";
import { Play, Eye, Heart, MessageCircle, Youtube } from "lucide-react";

function k(n: number | null | undefined) {
  if (n == null) return "0";
  if (n >= 1000) return `${Math.round(n / 100) / 10}K`;
  return String(n);
}

export default function TopYouTubeContent() {
  const { videos, loading } = useYouTubeTopVideos();
  const fallback = "/winter-hero.png";

  if (loading) {
    return <p className="text-sm text-neutral-500">Loading…</p>;
  }

  if (!Array.isArray(videos) || videos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-neutral-500">
        <div className="mb-1 inline-flex h-6 w-6 items-center justify-center rounded-md bg-neutral-50">
          <Youtube size={14} className="text-red-600" />
        </div>
        No videos yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {videos.map((v, i) => {
        const hasImg =
          typeof v.image_url === "string" && v.image_url.trim().length > 0;
        const src =
          hasImg && v.updated_at
            ? `${v.image_url}${
                v.image_url.includes("?") ? "&" : "?"
              }v=${new Date(v.updated_at).getTime()}`
            : fallback;

        const link = v.url || "#";

        return (
          <a
            key={`${v.platform}-${v.rank}-${i}`}
            href={link}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl overflow-hidden border shadow-sm transition hover:shadow-md"
          >
            <article>
              <div className="relative w-full">
                <img
                  src={src}
                  alt={v.caption || "YouTube video"}
                  className="w-full aspect-video object-cover"
                  onError={(e) => {
                    if (e.currentTarget.dataset.fbk) return;
                    e.currentTarget.dataset.fbk = "1";
                    e.currentTarget.src = fallback;
                  }}
                  loading="lazy"
                />
                <span className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white">
                  <Play size={18} />
                </span>
              </div>

              <div className="p-3">
                {v.caption ? (
                  <h4 className="mb-1 line-clamp-2 text-sm font-medium text-neutral-900">
                    {v.caption}
                  </h4>
                ) : null}

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
                  <span className="inline-flex items-center gap-1">
                    <Eye size={14} /> {k(v.views)} views
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Heart size={14} /> {k(v.likes)} likes
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle size={14} /> {k(v.comments)} comments
                  </span>
                </div>
              </div>
            </article>
          </a>
        );
      })}
    </div>
  );
}
