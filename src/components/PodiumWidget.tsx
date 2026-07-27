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
        <Link href="/leaderboard" className="inline-flex items-center gap-2 text-primary font-semibold text-sm">
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
        <Trophy className="h-6 w-6 text-yellow-400" />
        <h3 className="font-display text-xl font-extrabold text-ink">Classements en direct</h3>
      </div>

      <div className="flex items-flex-end justify-center gap-4 h-64 mb-8">
        {/* 2nd Place (Left) */}
        {second ? (
          <div className="flex flex-col items-center flex-1">
            <div className="w-full h-32 bg-gradient-to-b from-gray-400/20 to-gray-400/10 rounded-t-lg border-2 border-gray-400 flex items-center justify-center">
              <div className="text-center">
                <Medal className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                <p className="font-display text-sm font-bold text-ink">2ND</p>
              </div>
            </div>
            <div className="w-full bg-gray-400/20 backdrop-blur p-3 rounded-b-lg border border-t-0 border-gray-400 text-center">
              <p className="font-semibold text-ink text-sm truncate">{second.playerName}</p>
              <p className="text-xs text-ink-soft">{second.totalScore.toLocaleString()} pts</p>
            </div>
          </div>
        ) : null}

        {/* 1st Place (Center) */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-full h-48 bg-gradient-to-b from-yellow-400/30 to-yellow-400/10 rounded-t-lg border-2 border-yellow-400 flex items-center justify-center">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
              <p className="font-display text-base font-bold text-ink">1ER</p>
            </div>
          </div>
          <div className="w-full bg-yellow-400/20 backdrop-blur p-4 rounded-b-lg border border-t-0 border-yellow-400 text-center">
            <p className="font-display font-bold text-ink">{first.playerName}</p>
            <p className="text-sm font-semibold text-primary">{first.totalScore.toLocaleString()} pts</p>
          </div>
        </div>

        {/* 3rd Place (Right) */}
        {third ? (
          <div className="flex flex-col items-center flex-1">
            <div className="w-full h-20 bg-gradient-to-b from-orange-400/20 to-orange-400/10 rounded-t-lg border-2 border-orange-400 flex items-center justify-center">
              <div className="text-center">
                <Medal className="h-6 w-6 text-orange-400 mx-auto" />
                <p className="font-display text-xs font-bold text-ink">3RD</p>
              </div>
            </div>
            <div className="w-full bg-orange-400/20 backdrop-blur p-3 rounded-b-lg border border-t-0 border-orange-400 text-center">
              <p className="font-semibold text-ink text-sm truncate">{third.playerName}</p>
              <p className="text-xs text-ink-soft">{third.totalScore.toLocaleString()} pts</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex justify-center">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors font-semibold text-sm text-primary"
        >
          Voir tous les classements
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </GlassCard>
  );
}
