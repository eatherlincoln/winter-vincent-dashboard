import React from "react";
import { useInstagramTopPosts } from "@/hooks/useInstagramTopPosts";
import { Heart, MessageCircle, Share2, Instagram } from "lucide-react";

function k(n: number | null | undefined) {
  if (n == null) return "0";
  if (n >= 1000) return `${Math.round(n / 100) / 10}K`;
  return String(n);
}

export default function InstagramTopPosts() {
  const { posts, loading } = useInstagramTopPosts();
  const fallback = "/winter-hero.png";

  return (
    <div>
      {/* title row kept minimal (your page wraps this already with the icon) */}
      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : Array.isArray(posts) && posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {posts.map((p, i) => {
            const hasImg =
              typeof p.image_url === "string" && p.image_url.trim().length > 0;
            const src =
              hasImg && p.updated_at
                ? `${p.image_url}${
                    p.image_url.includes("?") ? "&" : "?"
                  }v=${new Date(p.updated_at).getTime()}`
                : fallback;

            return (
              <a
                key={`${p.platform}-${p.rank}-${i}`}
                href={p.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl overflow-hidden border shadow-sm transition hover:shadow-md"
              >
                <article>
                  <div className="relative w-full">
                    <img
                      src={src}
                      alt={p.caption || "Instagram post"}
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        if (e.currentTarget.dataset.fbk) return;
                        e.currentTarget.dataset.fbk = "1";
                        e.currentTarget.src = fallback;
                      }}
                      loading="lazy"
                    />
                  </div>

                  <footer className="flex justify-around text-xs p-2 text-neutral-600">
                    <span className="inline-flex items-center gap-1">
                      <Heart size={14} /> {k(p.likes)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle size={14} /> {k(p.comments)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Share2 size={14} /> {k(p.shares)}
                    </span>
                  </footer>
                </article>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-4 text-sm text-neutral-500">
          <div className="mb-1 inline-flex h-6 w-6 items-center justify-center rounded-md bg-neutral-50">
            <Instagram size={14} className="text-pink-600" />
          </div>
          No Instagram posts yet.
        </div>
      )}
    </div>
  );
}
