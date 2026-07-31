"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { RankBadge } from "@/components/ui/RankBadge";
import { Trophy3D } from "@/components/three-d/Trophy3D";
import { Badge3D } from "@/components/three-d/Badge3D";
import { Flame3D } from "@/components/three-d/Flame3D";
import { AuthModal } from "@/components/auth/AuthModal";
import { getRankProgress } from "@/lib/ranks";
import { useStoredElo, useStoredXp } from "@/lib/storage";
import { useDailyStreak } from "@/lib/streak";
import { calculateLevelFromXp, getLevelTier } from "@/lib/xp";

export function HomeHeader() {
  const elo = useStoredElo();
  const xp = useStoredXp();
  const { streak } = useDailyStreak();
  const { rank } = getRankProgress(elo);
  const { level, xpInLevel, xpForNext } = calculateLevelFromXp(xp);
  const tierInfo = getLevelTier(level);
  const [authOpen, setAuthOpen] = useState(false);

  const progressPct = (xpInLevel / xpForNext) * 100;

  return (
    <header className="sticky top-0 z-40 bg-background flex flex-col gap-4 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6">
      <style>{`
        .hh-trophy { --t3d-h: 20px; }
        .hh-badge { --b3d-d: 20px; }
        .hh-flame { --f3d-h: 18px; }
        @media (max-width: 640px) {
          .hh-trophy { --t3d-h: 16px; }
          .hh-badge { --b3d-d: 16px; }
          .hh-flame { --f3d-h: 14px; }
        }
      `}</style>
      {/* Top Row: Logo & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Ranked Quiz" width={40} height={40} />
          <div className="leading-snug">
            <p className="font-display text-base font-extrabold text-ink">RANKED QUIZ</p>
            <p className="pb-0.5 text-[11px] uppercase tracking-[0.2em] text-ink-faint">Live &amp; Competitive</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/leaderboard"
            aria-label="Classement"
            className="btn-tap active:scale-95 t3d-g hh-trophy"
          >
            <Trophy3D />
          </Link>
          <Link
            href="/badges"
            aria-label="Succès"
            className="btn-tap active:scale-95 b3d-g hh-badge"
          >
            <Badge3D />
          </Link>
          <div className="flex items-center gap-1.5 rounded-full border border-highlight/40 bg-highlight/10 px-3 py-1.5 ml-1">
            <div className="hh-flame">
              <Flame3D />
            </div>
            <span className="font-display text-sm font-bold text-highlight-dark">{streak}</span>
          </div>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            aria-label="Mon profil"
            className="btn-tap rounded-full active:scale-95 ml-1"
          >
            <RankBadge tier={rank.tier} label={rank.label} size="sm" />
          </button>
        </div>
      </div>

      {/* XP Progress Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full font-display font-bold text-sm text-white"
              style={{ backgroundColor: tierInfo.color }}
            >
              {level}
            </div>
            <span className="font-display text-sm font-bold text-ink">{tierInfo.label}</span>
            <span className="text-xs text-ink-soft">•</span>
            <span className="text-xs text-ink-soft font-medium">
              {xpInLevel} / {xpForNext} XP
            </span>
          </div>
        </div>

        {/* XP Bar */}
        <div className="w-full h-2 rounded-full bg-ink/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progressPct}%`,
              backgroundColor: tierInfo.color,
            }}
          />
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
