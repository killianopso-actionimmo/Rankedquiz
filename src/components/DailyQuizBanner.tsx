"use client";

import { useDailyStreak } from "@/lib/streak";
import { useMidnightCountdown } from "@/hooks/useMidnightCountdown";
import { QuizDuJourBook } from "@/components/QuizDuJourBook";

/**
 * Section Quiz du Jour : un titre, un livre. Rien d'autre.
 *
 * L'etat "deja joue" n'ajoute pas de bloc de texte : il se lit sur le livre
 * lui-meme, qui se verrouille et affiche le compte a rebours sur sa couverture.
 */
function formatDayLabel(): string {
  return new Date()
    .toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    .replace(".", "");
}

export function DailyQuizBanner() {
  const { completedToday } = useDailyStreak();
  const countdown = useMidnightCountdown(completedToday);

  return (
    <section className="flex flex-col items-center gap-7 py-6 sm:gap-9 sm:py-8">
      <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.22em] text-ink sm:text-2xl">
        Quiz du Jour
      </h2>

      <QuizDuJourBook
        href="/play/daily"
        disabled={completedToday}
        label={completedToday ? (countdown ?? "--:--:--") : formatDayLabel()}
      />
    </section>
  );
}
