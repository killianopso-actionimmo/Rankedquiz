"use client";

import { HomeHeader } from "@/components/HomeHeader";
import { DailyQuizBanner } from "@/components/DailyQuizBanner";
import { ModeCard } from "@/components/ModeCard";
import { Reveal, RevealGroup } from "@/components/scroll/Reveal";
import { GAME_MODES } from "@/data/modes";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-6 pb-10">
      <HomeHeader />

      <Reveal className="px-4 sm:px-6" direction="up" distance={18}>
        <DailyQuizBanner />
      </Reveal>

      <div className="px-4 sm:px-6">
        <Reveal direction="up" distance={16}>
          <h2 className="mb-1 font-display text-2xl font-extrabold leading-snug text-ink">
            Choisis ton mode
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-ink-soft">
            Cinq façons de tester tes connaissances, seul ou en direct.
          </p>
        </Reveal>

        <RevealGroup
          className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3"
          stagger={0.07}
          amount={0.1}
        >
          {GAME_MODES.map((mode) => (
            <ModeCard key={mode.id} mode={mode} />
          ))}
        </RevealGroup>
      </div>
    </div>
  );
}
