import React from "react";

const AVATAR = "/lovable-uploads/sheldon-profile.png";

export default function AboutSection() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
      <img
        src={AVATAR}
        alt="Sheldon Simkus"
        className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover ring-1 ring-black/5"
      />

      <div className="flex-1">
        <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
          About Sheldon
        </h2>

        <p className="mt-1 text-[13.5px] sm:text-sm leading-relaxed text-neutral-700">
          Sheldon Simkus is a professional surfer with proven global reach, a
          trusted voice in surf culture, and a track record of delivering
          measurable value for partners. His ability to combine high-performance
          surfing with authentic, creative storytelling has established him as a
          unique content creator whose work consistently generates strong
          exposure and return on investment.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-600">
            Professional Surfer
          </span>
          <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-medium text-green-600">
            Content Creator
          </span>
          <span className="rounded-full bg-purple-50 px-3 py-1 text-[11px] font-medium text-purple-600">
            Global Influencer
          </span>
        </div>
      </div>
    </div>
  );
}
