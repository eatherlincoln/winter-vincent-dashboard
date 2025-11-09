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
          Partner with Sheldon Simkus — a rising force in surf media whose
          authentic lifestyle content and world-class surfing consistently
          engage audiences across Australia and globally. With proven
          performance metrics and the credibility to cut through in surf
          culture, Sheldon offers brands a unique opportunity to align with a
          content creator who delivers both reach and real impact.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        <Tile
          n={1}
          title="Content Collaborations"
          body="Custom video and photo content created with your brand seamlessly integrated into Sheldon's authentic surf lifestyle. Ideal for brands wanting to tap into surf culture with credibility and creativity."
        />
        <Tile
          n={2}
          title="Brand Ambassador"
          body="Ongoing partnerships that put your products front and center across Sheldon's platforms and surf career, building trust, consistency, and long-term equity with his engaged audience."
        />
        <Tile
          n={3}
          title="Event & Travel Integration"
          body="Leverage Sheldon's global surf schedule, trips, and competitions to position your brand in premium, culturally relevant moments for high-visibility exposure with impact."
        />
        <Tile
          n={4}
          title="Custom Campaigns"
          body="Tailored programs aligned to your goals—whether launching a new product, targeting a key demographic, or sparking buzz across surf and lifestyle media."
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {[
          "Authentic Audience",
          "Growing Revenue",
          "Multi-Platform Reach",
          "Professional Content",
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
