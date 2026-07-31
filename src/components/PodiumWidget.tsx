"use client";

import Link from "next/link";
import { Trophy, Medal, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useGlobalLadder } from "@/services/ladder";

export function PodiumWidget() {
  const globalLadder = useGlobalLadder();
  const top3 = globalLadder.entries.slice(0, 3);

  if (top3.length === 0) {
    return (
      <GlassCard glow="gold" className="p-8 text-center">
        <Trophy className="h-12 w-12 mx-auto mb-3 text-ink-soft" />
        <h3 className="font-display text-lg font-bold text-ink mb-1">Classements en direct</h3>
        <p className="text-sm text-ink-soft mb-4">
          Joue une partie pour voir les meilleurs sur le podium!
        </p>
        <Link href="/leaderboard" className="inline-flex items-center gap-2 text-ink-soft font-semibold text-sm transition-colors hover:text-ink">
          Voir tous les classements
          <ArrowRight className="h-4 w-4" />
        </Link>
      </GlassCard>
    );
  }

  const [first, second, third] = [top3[0], top3[1] || null, top3[2] || null];

  return (
    <GlassCard glow="gold" className="p-8">
      <div className="flex items-center justify-center gap-2 mb-8">
        <Trophy className="h-6 w-6 text-rank-gold" />
        <h3 className="font-display text-xl font-extrabold text-ink">Classements en direct</h3>
      </div>

      <div className="flex items-flex-end justify-center gap-4 h-64 mb-8">
        {/* 2nd Place (Left) */}
        {second ? (
          <div className="flex flex-col items-center flex-1">
            <div className="w-full h-32 bg-gradient-to-b from-rank-silver/25 to-rank-silver/10 rounded-t-lg border-2 border-rank-silver flex items-center justify-center">
              <div className="text-center">
                <Medal className="h-8 w-8 text-rank-silver mx-auto mb-1" />
                <p className="font-display text-sm font-bold text-ink">2ND</p>
              </div>
            </div>
            <div className="w-full bg-rank-silver/20 backdrop-blur p-3 rounded-b-lg border border-t-0 border-rank-silver text-center">
              <p className="font-semibold text-ink text-sm truncate">{second.playerName}</p>
              <p className="text-xs text-ink-soft">{second.totalScore.toLocaleString()} pts</p>
            </div>
          </div>
        ) : null}

        {/* 1st Place (Center) */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-full h-48 bg-gradient-to-b from-rank-gold/35 to-rank-gold/10 rounded-t-lg border-2 border-rank-gold flex items-center justify-center">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-rank-gold mx-auto mb-2" />
              <p className="font-display text-base font-bold text-ink">1ER</p>
            </div>
          </div>
          <div className="w-full bg-rank-gold/25 backdrop-blur p-4 rounded-b-lg border border-t-0 border-rank-gold text-center">
            <p className="font-display font-bold text-ink">{first.playerName}</p>
            <p className="text-sm font-semibold text-ink">{first.totalScore.toLocaleString()} pts</p>
          </div>
        </div>

        {/* 3rd Place (Right) */}
        {third ? (
          <div className="flex flex-col items-center flex-1">
            <div className="w-full h-20 bg-gradient-to-b from-rank-bronze/25 to-rank-bronze/10 rounded-t-lg border-2 border-rank-bronze flex items-center justify-center">
              <div className="text-center">
                <Medal className="h-6 w-6 text-rank-bronze mx-auto" />
                <p className="font-display text-xs font-bold text-ink">3RD</p>
              </div>
            </div>
            <div className="w-full bg-rank-bronze/20 backdrop-blur p-3 rounded-b-lg border border-t-0 border-rank-bronze text-center">
              <p className="font-semibold text-ink text-sm truncate">{third.playerName}</p>
              <p className="text-xs text-ink-soft">{third.totalScore.toLocaleString()} pts</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex justify-center">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-primary bg-primary/15 hover:bg-primary/25 transition-colors font-semibold text-sm text-ink"
        >
          Voir tous les classements
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </GlassCard>
  );
}
