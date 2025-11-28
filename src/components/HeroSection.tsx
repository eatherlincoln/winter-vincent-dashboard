import React, { useMemo } from "react";
import { usePlatformStats, useBrandAssets } from "@/hooks";

const fallbackHero = "url('/winter-hero.png')";

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

export default function HeroSection() {
  const { stats, loading } = usePlatformStats();
  const { assets } = useBrandAssets();

  const { totalMonthly, totalReach } = useMemo(() => {
    const values = Object.values(stats || {});
    const monthly = values.reduce((sum, r: any) => sum + (r?.monthly_views || 0), 0);
    const reach = values.reduce((sum, r: any) => sum + (r?.followers || 0), 0);
    return { totalMonthly: monthly, totalReach: reach };
  }, [stats]);

  return (
    <section className="relative w-full">
      {/* Background image */}
      <div
        className="h-[360px] md:h-[440px] w-full bg-cover bg-center"
        style={{
          backgroundImage: assets.hero
            ? `url('${assets.hero}')`
            : fallbackHero,
        }}
      />

      {/* Dark gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0">
        <div className="mx-auto flex h-full max-w-content flex-col justify-end px-6 md:px-10">
          {/* Title block */}
          <div className="mb-5 md:mb-6">
            <h1 className="text-3xl font-bold leading-tight text-white drop-shadow-sm md:text-5xl">
              Winter Vincent
            </h1>
            <p className="mt-2 text-base text-white/90 drop-shadow-sm md:text-lg">
              Professional Surfer &amp; Content Creator
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3 pb-4 md:pb-6">
            <span className="rounded-full bg-black/60 px-5 py-2 text-sm font-semibold text-white shadow-lg">
              {loading ? "Loading…" : `${formatNumber(totalMonthly)} Monthly Views`}
            </span>
            <span className="rounded-full bg-black/60 px-5 py-2 text-sm font-semibold text-white shadow-lg">
              {loading ? "Loading…" : `${formatNumber(totalReach)} Total Reach`}
            </span>
            <a
              href="/admin"
              className="rounded-full bg-black/60 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-black/70"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
