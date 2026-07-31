"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { RotateCcw, Home, Trophy } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { PostGameXpSequence } from "@/components/PostGameXpSequence";
import { fireVictoryFlameBurst } from "@/lib/flames";
import { useCountUp } from "@/hooks/useCountUp";
import { usePlayerName } from "@/hooks/usePlayerName";
import { addGameResult, getGrilleLeaderboard, getPlayerGrilleStats } from "@/services/ladder";
import type { GameModeId } from "@/types/quiz";
import type { GrilleResult } from "@/types/ladder";

interface GameOverScreenProps {
  title: string;
  stats: { label: string; value: string }[];
  onRetry: () => void;
  celebrate?: boolean;
  score?: number;
  mode?: string;
  category?: string;
  startXp?: number;
  endXp?: number;
  xpGained?: number;
  onXpSequenceComplete?: () => void;
  roundId?: string;
  timeTaken?: number;
  isCompleted?: boolean;
}

const PURE_INTEGER = /^[+-]?\d+$/;

function StatValue({ value }: { value: string }) {
  const isNumeric = PURE_INTEGER.test(value);
  const numeric = isNumeric ? parseInt(value, 10) : 0;
  const animated = useCountUp(numeric);

  if (!isNumeric) return <>{value}</>;
  const sign = value.startsWith("+") ? "+" : "";
  return <>{sign}{animated}</>;
}

export function GameOverScreen({
  title,
  stats,
  onRetry,
  celebrate = true,
  score,
  mode,
  category,
  startXp,
  endXp,
  xpGained,
  onXpSequenceComplete,
  roundId,
  timeTaken,
  isCompleted,
}: GameOverScreenProps) {
  const playerName = usePlayerName();
  const [showButtons, setShowButtons] = useState(!xpGained);
  const [leaderboard, setLeaderboard] = useState<GrilleResult[]>([]);
  const [playerRank, setPlayerRank] = useState(-1);
  const hasXpSequence = xpGained !== undefined && startXp !== undefined && endXp !== undefined;

  useEffect(() => {
    if (celebrate) fireVictoryFlameBurst();

    if (score !== undefined && mode) {
      addGameResult(
        playerName,
        playerName,
        score,
        mode as GameModeId,
        category,
        roundId,
        timeTaken,
        isCompleted
      );
    }
  }, [celebrate, score, mode, playerName, category, roundId, timeTaken, isCompleted]);

  useEffect(() => {
    if (roundId) {
      const board = getGrilleLeaderboard(roundId);
      setLeaderboard(board.slice(0, 5));
      const { rank } = getPlayerGrilleStats(roundId, playerName);
      setPlayerRank(rank);
    }
  }, [roundId, playerName]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center"
    >
      <GlassCard glow="gold" className="w-full max-w-sm p-8">
        <h1 className="font-display text-3xl font-extrabold leading-snug text-highlight-dark">
          {title}
        </h1>

        {/* XP Sequence or Regular Stats */}
        {hasXpSequence && xpGained !== undefined ? (
          <div className="mt-6">
            <PostGameXpSequence
              startXp={startXp}
              endXp={endXp}
              xpGained={xpGained}
              onAnimationComplete={() => {
                setShowButtons(true);
                onXpSequenceComplete?.();
              }}
            />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-xl bg-background px-4 py-3"
              >
                <span className="text-sm text-ink-soft">{s.label}</span>
                <span className="font-display text-lg font-bold tabular-nums text-ink">
                  <StatValue value={s.value} />
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Regular Stats (always show) */}
        {stats.length > 0 && (!hasXpSequence || showButtons) && (
          <div className="mt-6 flex flex-col gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-xl bg-background px-4 py-3"
              >
                <span className="text-sm text-ink-soft">{s.label}</span>
                <span className="font-display text-lg font-bold tabular-nums text-ink">
                  <StatValue value={s.value} />
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard Section */}
        {roundId && leaderboard.length > 0 && (!hasXpSequence || showButtons) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-6"
          >
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="font-display text-sm font-bold text-ink">Top 5 Classement</h2>
              {playerRank > 0 && playerRank <= 5 && (
                <span className="ml-auto text-xs font-semibold text-highlight-dark">
                  🎯 Tu es #{playerRank}
                </span>
              )}
              {playerRank > 5 && (
                <span className="ml-auto text-xs font-semibold text-ink-soft">
                  Tu es #{playerRank}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {leaderboard.map((result, idx) => (
                <div
                  key={`${result.playerId}-${result.timestamp}`}
                  className={`rounded-lg px-3 py-2 text-xs transition ${
                    result.playerName === playerName
                      ? "bg-primary/20 ring-1 ring-primary"
                      : "bg-background"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink-soft">#{idx + 1}</span>
                      <span className="font-semibold text-ink">{result.playerName}</span>
                    </div>
                    <div className="text-right">
                      {result.isCompleted ? (
                        <div className="text-primary font-semibold">
                          ✓ {result.timeTaken}s
                        </div>
                      ) : (
                        <div className="text-ink-soft">
                          {result.score} réponses
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Buttons - shown after XP animation or immediately if no XP sequence */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={showButtons ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.4 }}
          className="mt-8 flex flex-col gap-3"
        >
          <NeonButton variant="primary" size="lg" className="w-full" onClick={onRetry}>
            <RotateCcw className="h-5 w-5" />
            Rejouer
          </NeonButton>
          <Link href="/" className="w-full">
            <NeonButton variant="ghost" size="lg" className="w-full">
              <Home className="h-5 w-5" />
              Menu principal
            </NeonButton>
          </Link>
        </motion.div>
      </GlassCard>
    </motion.div>
  );
}
