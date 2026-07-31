"use client";

import { HomeHeader } from "@/components/HomeHeader";
import { DailyQuizBanner } from "@/components/DailyQuizBanner";
import { CircularGalleryModes } from "@/components/CircularGalleryModes";
import { Reveal } from "@/components/scroll/Reveal";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-10">
      <HomeHeader />

      <Reveal className="px-4 sm:px-6" direction="up" distance={18}>
        <DailyQuizBanner />
      </Reveal>

      <div>
        <Reveal direction="up" distance={16} className="px-4 sm:px-6">
          <h2 className="mb-1 font-display text-2xl font-extrabold leading-snug text-ink">
            Choisis ton mode
          </h2>
          <p className="text-sm leading-relaxed text-ink-soft">
            Cinq façons de tester tes connaissances, seul ou en direct.
          </p>
        </Reveal>

        {/* Pleine largeur : la galerie gère elle-meme ses marges internes pour
            que la carte centrale soit alignee sur le centre du viewport. */}
        <CircularGalleryModes />
      </div>
    </div>
  );
}
