import React from "react";

export default function PartnershipOpportunities() {
  const Tile = ({
    n,
    title,
    body,
  }: {
    n: number;
    title: string;
    body: string;
  }) => (
    <div className="rounded-2xl bg-white/15 border border-white/25 p-4 md:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm">
      <h4 className="font-semibold text-white mb-2">
        {n}. {title}
      </h4>
      <p className="text-white/90 text-sm leading-relaxed">{body}</p>
    </div>
  );

  return (
    <div className="rounded-[28px] bg-gradient-to-br from-[#0d7cd7] via-[#10b4cf] to-[#12d5c6] px-5 py-7 sm:px-8 sm:py-10 text-white shadow-[0_20px_45px_rgba(15,124,215,0.3)] border border-white/20">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">
          Partnership Opportunities
        </h2>
        <p className="text-white/90 text-sm sm:text-base leading-relaxed">
          Partner with Winter Vincent — a 20-year-old Queenscliff surfer leading
          the Australia/Oceania QS and one of Australia’s sharpest next-gen
          talents. Known for seamless rail-to-rail surfing, results in serious
          waves (including his standout result at maxing Nias) and purpose-led
          work with Waves for Water and Surfrider, Winter brings brands a mix of
          high performance, credibility and heart.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        <Tile
          n={1}
          title="Content Collaborations"
          body="Custom surf, lifestyle and travel content with your brand woven naturally into Winter’s day-to-day — from Queenscliff sessions to QS events and strike missions."
        />
        <Tile
          n={2}
          title="Brand Ambassador"
          body="Long-term partnerships that put your product in his quiver, on his back and in his routine across contests, training, trips and social channels."
        />
        <Tile
          n={3}
          title="Event & Travel Integration"
          body="Plug into Winter’s competition schedule and surf trips to showcase your brand in premium, wave-rich, culturally relevant locations around the world."
        />
        <Tile
          n={4}
          title="Custom Campaigns"
          body="Tailored campaigns built around your goals — product launches, youth and coastal markets, or purpose-driven stories tied to ocean health and sustainability."
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {[
          "Next-Gen Credibility",
          "High-Performance Surfing",
          "Purpose-Driven Storytelling",
          "Global Tour Visibility",
        ].map((t) => (
          <span
            key={t}
            className="rounded-full bg-white px-4 py-1 text-sm font-medium text-sky-700 shadow-sm"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
