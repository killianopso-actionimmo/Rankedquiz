"use client";

import { RankBadge } from "@/components/ui/RankBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getRankProgress } from "@/lib/ranks";
import { useCountUp } from "@/hooks/useCountUp";

const TIER_BAR_COLOR: Record<string, string> = {
  bronze: "bg-rank-bronze",
  argent: "bg-rank-silver",
  or: "bg-rank-gold",
  diamant: "bg-rank-diamond",
};

export function RankProgressHeader({ elo }: { elo: number }) {
  const { rank, next, progressPct } = getRankProgress(elo);
  const animatedElo = useCountUp(elo);

  return (
    <div className="glass-card flex items-center gap-4 p-4">
      <RankBadge tier={rank.tier} label={rank.label} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between text-xs text-ink-soft">
          <span className="font-display font-bold tabular-nums text-ink">{animatedElo} ELO</span>
          <span>{next ? `Prochain : ${next.label}` : "Rang maximum"}</span>
        </div>
        <ProgressBar pct={progressPct} colorClass={TIER_BAR_COLOR[rank.tier]} />
      </div>
    </div>
  );
}
