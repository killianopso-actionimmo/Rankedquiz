"use client";

import { SplashScreen } from "@/components/SplashScreen";
import { HomeHeader } from "@/components/HomeHeader";
import { DailyQuizBanner } from "@/components/DailyQuizBanner";
import { PodiumWidget } from "@/components/PodiumWidget";
import { ModeCard } from "@/components/ModeCard";
import { GAME_MODES } from "@/data/modes";
import { useHasSeenSplash, markSplashSeen } from "@/lib/splashSession";

export default function Home() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-6 pb-10">
        <HomeHeader />

        <div className="px-4 sm:px-6">
          <DailyQuizBanner />
        </div>

        <div className="px-4 sm:px-6">
          <PodiumWidget />
        </div>

        <div className="px-4 sm:px-6">
          <h2 className="mb-1 font-display text-2xl font-extrabold leading-snug text-ink">
            Choisis ton mode
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-ink-soft">
            Cinq façons de tester tes connaissances, seul ou en direct.
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {GAME_MODES.map((mode, index) => (
              <ModeCard key={mode.id} mode={mode} index={index} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
