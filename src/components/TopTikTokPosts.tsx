import React from "react";
import { useTikTokTopPosts } from "@/hooks/useTikTokTopPosts";
import { Card } from "@/components/ui/card";

/** Inline SVG icons */
const Icon = {
  music: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 3v10.55A4 4 0 1 1 10 17V7h8V3h-6z" />
    </svg>
  ),
  heart: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 21s-6.716-4.248-9.428-7.38C.686 11.358.996 8.5 3.02 6.93 5.044 5.36 7.77 5.9 9.2 7.76c1.43-1.86 4.156-2.4 6.18-.83 2.025 1.57 2.335 4.43.448 6.69C18.716 16.752 12 21 12 21z" />
    </svg>
  ),
  comment: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
    </svg>
  ),
  share: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.27 3.27 0 0 0 0-1.39l7-4.11A3 3 0 1 0 14 5a2.99 2.99 0 0 0 .04.49l-7 4.11a3 3 0 1 0 0 4.8l7.05 4.14c-.02.17-.05.34-.05.51a3 3 0 1 0 3-3z" />
    </svg>
  ),
};

export default function TikTokTopPosts() {
  const { posts } = useTikTokTopPosts();
  const fallback = "/winter-hero.png";
  if (!posts?.length) return null;

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex rounded-md bg-black/10 p-1">
          <Icon.music className="h-4 w-4 text-black" />
        </span>
        <h2 className="text-lg font-semibold">Top Performing TikTok Posts</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {posts.map((p) => {
          const hasImg =
            typeof p.image_url === "string" && p.image_url.trim().length > 0;
          const base = hasImg ? p.image_url : "/winter-hero.png";
          const src =
            hasImg && p.updated_at
              ? `${base}${base.includes("?") ? "&" : "?"}v=${new Date(
                  p.updated_at
                ).getTime()}`
              : base;

          return (
            <a
              key={`${p.platform}-${p.rank}`}
              href={p.url || "#"}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-square w-full overflow-hidden">
                <img
                  src={src}
                  alt={p.caption || "TikTok post"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    if (e.currentTarget.dataset.fbk) return;
                    e.currentTarget.dataset.fbk = "1";
                    e.currentTarget.src = fallback;
                  }}
                />
              </div>
              <div className="flex items-center justify-between p-2 text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <Icon.heart className="h-4 w-4 text-red-500" />
                  <span>{p.likes?.toLocaleString() ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon.comment className="h-4 w-4 text-blue-500" />
                  <span>{p.comments?.toLocaleString() ?? 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon.share className="h-4 w-4 text-green-600" />
                  <span>{p.shares?.toLocaleString() ?? 0}</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </Card>
  );
}
