import React from "react";

const AVATAR = "/winter-profile.png";

export default function AboutSection() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
      <img
        src={AVATAR}
        alt="Winter Vincent"
        className="h-28 w-28 rounded-full object-cover ring-1 ring-black/5 sm:h-32 sm:w-32"
      />

      <div className="flex-1">
        <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">
          About Winter
        </h2>

        <p className="mt-1 text-[13.5px] leading-relaxed text-neutral-700 sm:text-sm">
          Winter Vincent is a 20yr old born and bred Sydney surfer, who has
          recently been on a tear through the surfing ranks. Over the past year,
          Winter has shot to the top of the Oceanic regional world surfing tour
          rankings, on both the junior and qualifying tours.
        </p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-700 sm:text-sm">
          Winning in big surf in Nias Indonesia, in what some are saying were
          greatest conditions ever for a qualifying event, he proved to everyone
          that he has what it takes to be a threat on the big stage.
        </p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-700 sm:text-sm">
          A quietly spoken and polite kid, Winter tends to let his surfing do
          the talking and as he continues to fill out physically, he'll have a
          lot to say in the surfing world on the road ahead.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-600">
            Professional Surfer
          </span>
          <span className="rounded-full bg-purple-50 px-3 py-1 text-[11px] font-medium text-purple-600">
            Ocean Lifestyle
          </span>
          <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-medium text-green-600">
            Content Creator
          </span>
        </div>
      </div>
    </div>
  );
}
