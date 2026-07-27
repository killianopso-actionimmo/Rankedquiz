"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Medal, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useGlobalLadder, useModeLadder } from "@/services/ladder";
import { GAME_MODES } from "@/data/modes";
import type { GameModeId } from "@/types/quiz";

type LadderView = "global" | GameModeId;

export function Ladder() {
  const [view, setView] = useState<LadderView>("global");
  const globalLadder = useGlobalLadder();
  const timeAttackLadder = useModeLadder("time-attack");
  const jetpunkLadder = useModeLadder("jetpunk");
  const rankedLadder = useModeLadder("ranked");
  const thematiqueLadder = useModeLadder("thematique");
  const duelLadder = useModeLadder("duel");

  const renderMedal = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-400" />;
    return <span className="text-sm font-bold text-ink-soft">#{rank}</span>;
  };

  let entries: typeof globalLadder.entries = [];
  if (view === "global") {
    entries = globalLadder.entries;
  } else if (view === "time-attack") {
    entries = timeAttackLadder.entries;
  } else if (view === "jetpunk") {
    entries = jetpunkLadder.entries;
  } else if (view === "ranked") {
    entries = rankedLadder.entries;
  } else if (view === "thematique") {
    entries = thematiqueLadder.entries;
  } else if (view === "duel") {
    entries = duelLadder.entries;
  }

  const getModeLabel = (modeId: GameModeId) => {
    return GAME_MODES.find((m) => m.id === modeId)?.title || modeId;
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 sm:px-6 pb-10">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-semibold">Accueil</span>
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-extrabold leading-snug text-ink">
            Classements
          </h1>
          <p className="text-sm leading-relaxed text-ink-soft">
            {view === "global"
              ? "Scores globaux de tous les modes"
              : `Classement ${getModeLabel(view as GameModeId)}`}
          </p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setView("global")}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            view === "global"
              ? "bg-gradient-to-r from-primary to-primary-light text-white"
              : "bg-background text-ink hover:bg-ink-softer"
          }`}
        >
          Global
        </button>
        {GAME_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setView(mode.id)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              view === mode.id
                ? "bg-gradient-to-r from-primary to-primary-light text-white"
                : "bg-background text-ink hover:bg-ink-softer"
            }`}
          >
            {mode.title}
          </button>
        ))}
      </div>

      {/* Ladder Table */}
      <GlassCard className="overflow-hidden">
        {entries.length === 0 ? (
          <div className="p-8 text-center text-ink-soft">
            Aucune partie jouée encore. Commence une partie pour te voir classé!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-softer bg-background/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                    RANG
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-soft">
                    JOUEUR
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-soft">
                    PARTIES
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-soft">
                    TOTAL
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-soft">
                    MOY.
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.playerId}
                    className="border-b border-ink-softer hover:bg-background/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center w-8">
                        {renderMedal(entry.rank)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-ink">{entry.playerName}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-ink-soft">
                      {entry.gameCount}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">
                      {entry.totalScore.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-ink-soft">
                      {entry.averageScore.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
