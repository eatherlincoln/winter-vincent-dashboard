// src/pages/Index.tsx
import React from "react";

import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import KpiRow from "@/components/KpiRow"; // <-- the only KPI component
import AudienceDemographics from "@/components/AudienceDemographics";
import InstagramTopPosts from "@/components/InstagramTopPosts";
import TopYouTubeContent from "@/components/TopYouTubeContent";
import PartnershipOpportunities from "@/components/PartnershipOpportunities";

export default function Index() {
  return (
    <div className="min-h-dvh bg-gray-50">
      <section className="relative">
        <HeroSection />
      </section>

      <main className="mx-auto max-w-content px-6 sm:px-8 pb-24">
        <section className="pt-10 sm:pt-14">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
            <AboutSection />
          </div>
        </section>

        {/* The ONLY KPI row */}
        <section className="mt-6">
          <KpiRow />
        </section>

        {/* Audience (global/per platform card you already have) */}
        <section className="mt-8">
          <AudienceDemographics />
        </section>

        {/* Top content */}
        <section className="mt-8">
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
            <div className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-pink-500/80" />
                <h3 className="text-sm font-semibold text-neutral-800">
                  Top Performing Instagram Posts
                </h3>
              </div>
              <div className="flex-1">
                <InstagramTopPosts />
              </div>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-red-500/80" />
                <h3 className="text-sm font-semibold text-neutral-800">
                  Top Performing YouTube Content
                </h3>
              </div>
              <div className="flex-1">
                <TopYouTubeContent />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 mb-12">
          <PartnershipOpportunities />
        </section>
      </main>
    </div>
  );
}
