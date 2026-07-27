"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Flame, ChevronRight, Check } from "lucide-react";
import { useDailyStreak, getWeekStreakDays } from "@/lib/streak";
import { useMidnightCountdown } from "@/hooks/useMidnightCountdown";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

function formatTodayLabel(): string {
  const label = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function DailyQuizBanner() {
  const { completedToday, streak } = useDailyStreak();
  const countdown = useMidnightCountdown(completedToday);
  const days = getWeekStreakDays(streak, completedToday);
  const dayRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(dayRefs.current.filter(Boolean), {
        scale: 0,
        opacity: 0,
        duration: 0.4,
        ease: "back.out(2.2)",
        stagger: 0.06,
        delay: 0.15,
      });
    },
    { scope, dependencies: [streak, completedToday] }
  );

  return (
    <div ref={scope} className="overflow-hidden rounded-xl2 border border-black/[0.05] bg-white shadow-card">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-daily-gradient px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
            <Flame className="h-3.5 w-3.5" />
            +1 Flamme du jour
          </span>
          <h2 className="mt-3 font-display text-xl font-extrabold leading-snug text-ink sm:text-2xl">
            Quiz du Jour{" "}
            <span className="text-base font-semibold text-ink-faint">— {formatTodayLabel()}</span>
          </h2>
          <p className="mt-1 pb-0.5 text-sm leading-snug text-ink-soft">
            3 questions • 2 minutes pour maintenir ta série !
          </p>
        </div>

        <div className="shrink-0">
          {completedToday ? (
            <div className="flex flex-col items-center gap-1 rounded-2xl border border-black/[0.05] bg-background px-6 py-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Reviens demain !
              </p>
              <p className="font-display text-xl font-extrabold tabular-nums text-ink">
                {countdown ?? "--:--:--"}
              </p>
            </div>
          ) : (
            <Link href="/play/daily">
              <div className="btn-tap flex items-center justify-center gap-2 rounded-2xl bg-highlight px-6 py-4 text-center font-display text-base font-extrabold uppercase tracking-wide text-ink shadow-btn-highlight transition-transform active:translate-y-1 active:shadow-none">
                Lancer le quiz du jour
                <ChevronRight className="h-5 w-5" />
              </div>
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-1.5 border-t border-black/[0.05] bg-background/60 px-5 py-4 sm:gap-3">
        <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-ink-soft">
          Série
        </span>
        {days.map((day, i) => (
          <div key={day.date} className="flex flex-col items-center gap-1">
            <div
              ref={(el) => {
                dayRefs.current[i] = el;
              }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold sm:h-8 sm:w-8",
                day.done
                  ? "border-highlight bg-highlight text-ink"
                  : day.isToday
                    ? "border-secondary bg-white text-secondary"
                    : "border-black/[0.08] bg-white text-ink-faint"
              )}
            >
              {day.done ? <Check className="h-3.5 w-3.5" /> : day.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
