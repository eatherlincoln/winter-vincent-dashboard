import React from "react";

/**
 * Full-width banner with image, soft overlay, title/subtitle,
 * and a single stats row (Monthly Views, Total Reach, Admin).
 */
export default function HeroSection() {
  return (
    <section className="relative w-full">
      {/* Background image */}
      <div
        className="h-[360px] md:h-[440px] w-full bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/lovable-uploads/350aac33-19a1-4c3e-bac9-1e7258ac89b7.png')",
        }}
      />

      {/* Dark gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0">
        <div className="mx-auto h-full max-w-content px-6 md:px-10 flex flex-col justify-end">
          {/* Title block */}
          <div className="mb-5 md:mb-6">
            <h1 className="text-white text-3xl md:text-5xl font-bold leading-tight drop-shadow-sm">
              Sheldon Simkus
            </h1>
            <p className="mt-2 text-white/90 text-base md:text-lg drop-shadow-sm">
              Professional Surfer &amp; Content Creator
            </p>
          </div>

          {/* Stats row (single source of truth) */}
          <div className="pb-4 md:pb-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-black/60 px-5 py-2 text-sm font-semibold text-white shadow-lg">
              854K Monthly Views
            </span>
            <span className="rounded-full bg-black/60 px-5 py-2 text-sm font-semibold text-white shadow-lg">
              48,910 Total Reach
            </span>
            <a
              href="/admin"
              className="rounded-full bg-black/60 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:bg-black/70 transition"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
