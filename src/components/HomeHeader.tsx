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
        /* Les pieces 3D redeclarent leur variable de taille sur leur propre racine
           (.t3d, .b3d, .f3d). Poser la variable sur le parent n'a donc aucun effet :
           il faut cibler la racine elle-meme pour battre sa declaration. */
        .hh-trophy .t3d { --t3d-h: 24px; }
        .hh-badge .b3d { --b3d-d: 20px; }
        .hh-flame .f3d { --f3d-h: 22px; }
        @media (max-width: 640px) {
          .hh-trophy .t3d { --t3d-h: 20px; }
          .hh-badge .b3d { --b3d-d: 17px; }
          .hh-flame .f3d { --f3d-h: 18px; }
        }
        /* Les flous sont en px dans les composants : a cette echelle ils noieraient
           la forme, on les ramene a l'echelle de l'icone. */
        .hh-flame .f3d-halo { filter: blur(1.5px); }
        .hh-flame .f3d-sheen { filter: blur(.5px); }
        .hh-badge .b3d-dome::after { filter: blur(.5px); }
      `}</style>
      {/* Top Row: Logo & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Ranked Quiz" width={40} height={40} />
          <p className="font-display text-base font-extrabold text-ink">RANKED QUIZ</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/leaderboard"
            aria-label="Classement"
            className="btn-tap flex items-center justify-center active:scale-95 t3d-g hh-trophy"
          >
            <Trophy3D />
          </Link>
          <Link
            href="/badges"
            aria-label="Succès"
            className="btn-tap flex items-center justify-center active:scale-95 b3d-g hh-badge"
          >
            <Badge3D />
          </Link>
          <div className="flex items-center gap-1 f3d-g">
            <div className="hh-flame">
              <Flame3D />
            </div>
            <span className="font-display text-sm font-bold text-highlight-dark">{streak}</span>
          </div>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            aria-label="Mon profil"
            className="btn-tap rounded-full active:scale-95"
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
              className="flex items-center justify-center w-8 h-8 rounded-full font-display font-bold text-sm text-ink-accent"
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
        <div className="w-full h-2 rounded-full border border-line bg-background-sunken overflow-hidden">
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
