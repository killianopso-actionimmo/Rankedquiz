"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUp, Home, RotateCcw, Trophy, User } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { useCountUp } from "@/hooks/useCountUp";
import { fireVictoryFlameBurst } from "@/lib/flames";
import { calculateLevelFromXp } from "@/lib/xp";
import { cn } from "@/lib/utils";
import type { GameSubmitResult } from "@/types/user";

/**
 * Ecran de fin de partie Time Attack.
 *
 * L'XP et le rang viennent de submit_game() cote serveur. Tant que la reponse
 * n'est pas arrivee (ou si le joueur n'est pas connecte), on affiche quand meme
 * les stats de la partie : le resultat local ne depend pas du reseau.
 */

export interface PostGameScreenProps {
  score: number;
  correctAnswers: number;
  totalAnswered: number;
  longestStreak: number;
  avgTimePerQuestion: number;
  /** Resultat serveur. null tant que l'appel est en cours ou en cas d'echec. */
  result: GameSubmitResult | null;
  submitting: boolean;
  /** Renseigne si l'enregistrement a echoue (hors-ligne, non connecte...). */
  submitError: string | null;
  onRetry: () => void;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-background px-4 py-2.5">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="font-display text-lg font-bold tabular-nums text-ink">{value}</span>
    </div>
  );
}

function RankDelta({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="flex items-center gap-1 text-sm font-bold text-success">
        <ArrowUp className="h-4 w-4" />
        {delta} place{delta > 1 ? "s" : ""}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="flex items-center gap-1 text-sm font-bold text-danger">
        <ArrowDown className="h-4 w-4" />
        {Math.abs(delta)} place{Math.abs(delta) > 1 ? "s" : ""}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-sm font-bold text-ink-soft">
      <ArrowRight className="h-4 w-4" />
      stable
    </span>
  );
}

export function PostGameScreen({
  score,
  correctAnswers,
  totalAnswered,
  longestStreak,
  avgTimePerQuestion,
  result,
  submitting,
  submitError,
  onRetry,
}: PostGameScreenProps) {
  const [showRank, setShowRank] = useState(false);
  const animatedScore = useCountUp(score);
  const animatedXp = useCountUp(result?.xp_earned ?? 0);

  useEffect(() => {
    fireVictoryFlameBurst();
  }, []);

  // Le bloc classement n'apparait qu'apres le compteur d'XP, sinon les deux
  // animations se disputent l'attention.
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => setShowRank(true), 900);
    return () => clearTimeout(t);
  }, [result]);

  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
  const level = result ? result.level : null;
  const xpInLevel = result ? result.xp_in_level : 0;
  const xpForNext = result ? result.xp_for_next : 500;
  const pct = level ? Math.min(100, Math.round((xpInLevel / xpForNext) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8"
    >
      <GlassCard glow="gold" className="w-full max-w-sm p-6 sm:p-8">
        <h1 className="text-center font-display text-3xl font-extrabold leading-snug text-highlight-dark">
          Temps écoulé !
        </h1>

        {/* ---------------------------------------------------------- stats */}
        <div className="mt-6 flex flex-col gap-2">
          <StatRow label="Score" value={String(animatedScore)} />
          <StatRow label="Bonnes réponses" value={`${correctAnswers}/${totalAnswered} (${accuracy}%)`} />
          <StatRow label="Meilleure série" value={String(longestStreak)} />
          <StatRow label="Temps moyen" value={`${avgTimePerQuestion.toFixed(1)}s`} />
        </div>

        {/* ------------------------------------------------------------ XP */}
        {submitting ? (
          <div className="mt-6 flex items-center justify-center gap-2 py-4 text-sm text-ink-soft">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Enregistrement...
          </div>
        ) : result ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6"
          >
            <p className="text-center font-display text-4xl font-extrabold text-primary">
              +{animatedXp} XP
            </p>

            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-display font-bold text-ink">Niveau {level}</span>
                <span className="tabular-nums text-ink-soft">
                  {xpInLevel} / {xpForNext} XP
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-background-sunken">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="mt-6 rounded-xl bg-background px-4 py-3 text-center">
            <p className="text-xs text-ink-soft">
              {submitError ?? "Partie non enregistrée."}
            </p>
            <p className="mt-1 text-[11px] text-ink-faint">
              Ton score du jour compte, mais il ne rejoindra pas le classement.
            </p>
          </div>
        )}

        {/* ----------------------------------------------------- classement */}
        {result && showRank && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 rounded-xl bg-background p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="font-display text-xs font-bold uppercase tracking-wide text-ink-soft">
                Classement
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-display text-2xl font-extrabold tabular-nums text-ink">
                #{result.rank_after}
              </span>
              <RankDelta delta={result.rank_delta} />
            </div>

            {result.rank_delta !== 0 && (
              <p className="mt-1 text-[11px] text-ink-faint">
                Tu étais #{result.rank_before}
              </p>
            )}

            {result.xp_to_next_rank > 0 && (
              <p className="mt-2 text-xs text-ink-soft">
                Plus que{" "}
                <span className="font-bold text-highlight-dark">
                  {result.xp_to_next_rank} XP
                </span>{" "}
                pour passer #{result.rank_after - 1}
              </p>
            )}
            {result.rank_after === 1 && (
              <p className="mt-2 text-xs font-bold text-highlight-dark">
                Tu es en tête du classement 🥇
              </p>
            )}
          </motion.div>
        )}

        {/* -------------------------------------------------------- actions */}
        <div className={cn("mt-7 flex flex-col gap-2.5")}>
          <NeonButton variant="primary" size="lg" className="w-full" onClick={onRetry}>
            <RotateCcw className="h-5 w-5" />
            Rejouer
          </NeonButton>
          <Link href="/leaderboard" className="w-full">
            <NeonButton variant="ghost" size="lg" className="w-full">
              <Trophy className="h-5 w-5" />
              Voir le classement
            </NeonButton>
          </Link>
          <div className="flex gap-2.5">
            <Link href="/profile" className="flex-1">
              <NeonButton variant="ghost" size="lg" className="w-full">
                <User className="h-5 w-5" />
                Profil
              </NeonButton>
            </Link>
            <Link href="/" className="flex-1">
              <NeonButton variant="ghost" size="lg" className="w-full">
                <Home className="h-5 w-5" />
                Menu
              </NeonButton>
            </Link>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
