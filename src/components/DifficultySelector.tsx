"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Shuffle, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { calculateLevelFromXp, getLevelTier, LEVEL_TIERS } from "@/lib/xp";

interface DifficultySelectorProps {
  currentXp: number;
  onSelectDifficulty: (difficulty: 1 | 2 | 3 | "random") => void;
  onCancel?: () => void;
  showMenuLink?: boolean;
  title?: string;
}

export function DifficultySelector({
  currentXp,
  onSelectDifficulty,
  onCancel,
  showMenuLink = true,
  title = "Choisis la difficulté",
}: DifficultySelectorProps) {
  const { level } = calculateLevelFromXp(currentXp);
  const tierInfo = getLevelTier(level);

  const difficultyOptions = [
    {
      id: 1 as const,
      label: "Facile",
      tier: "beginner",
      locked: level < 1,
      icon: "🟢",
    },
    {
      id: 2 as const,
      label: "Moyen",
      tier: "intermediate",
      locked: level < 6,
      icon: "🟡",
    },
    {
      id: 3 as const,
      label: "Difficile",
      tier: "expert",
      locked: level < 16,
      icon: "🔴",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-4 py-10">
      <GlassCard glow="blue" className="w-full p-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full font-display font-bold text-white"
              style={{ backgroundColor: tierInfo.color }}
            >
              {level}
            </div>
            <div>
              <h2 className="font-display text-2xl font-extrabold text-ink">
                {title}
              </h2>
              <p className="text-xs text-ink-soft">{tierInfo.label}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {difficultyOptions.map((option, idx) => {
            const tierDef = LEVEL_TIERS.find((t) => t.tier === option.tier)!;
            const isCurrentTier = tierInfo.tier === option.tier;
            const isLocked = option.locked;

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => !isLocked && onSelectDifficulty(option.id)}
                disabled={isLocked}
                type="button"
                className={`w-full p-4 rounded-lg border-2 transition-all text-left hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isLocked
                    ? "bg-ink/5 border-ink/20"
                    : isCurrentTier
                      ? `bg-gradient-to-r ${tierDef.bgColor} border-2`
                      : "border-ink/20 hover:border-ink/40"
                }`}
                style={
                  !isLocked
                    ? { borderColor: tierDef.color }
                    : undefined
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1">
                      <p
                        className="font-bold"
                        style={{ color: tierDef.color }}
                      >
                        {option.label}
                      </p>
                      <p className="text-xs text-ink-soft mt-1">
                        Lvl {tierDef.minLevel}-{tierDef.maxLevel === Infinity ? "∞" : tierDef.maxLevel}
                        {isCurrentTier && " • Ton niveau"}
                      </p>
                    </div>
                  </div>
                  {isLocked && (
                    <span className="text-xs font-bold text-ink-soft">
                      Lvl {tierDef.minLevel}+
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Random Mode Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.24 }}
          onClick={() => onSelectDifficulty("random")}
          type="button"
          className="w-full p-4 rounded-lg border-2 border-dashed border-highlight/40 bg-highlight/5 transition-all text-left hover:shadow-lg hover:border-highlight/60 active:scale-95"
        >
          <div className="flex items-center gap-3">
            <Shuffle className="h-5 w-5 text-highlight-dark" />
            <div className="flex-1">
              <p className="font-bold text-highlight-dark">Mode Aléatoire</p>
              <p className="text-xs text-ink-soft mt-1">
                Mélange toutes les difficultés
              </p>
            </div>
          </div>
        </motion.button>

        <div className="mt-6 flex flex-col gap-3">
          <NeonButton
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => onSelectDifficulty(tierInfo.tier === "beginner" ? 1 : tierInfo.tier === "intermediate" ? 2 : 3)}
          >
            <Zap className="h-5 w-5" />
            Commencer
          </NeonButton>
          {onCancel && (
            <NeonButton
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={onCancel}
            >
              Annuler
            </NeonButton>
          )}
          {showMenuLink && (
            <Link href="/" className="w-full">
              <NeonButton
                variant="ghost"
                size="lg"
                className="w-full"
              >
                <Home className="h-5 w-5" />
                Menu Principal
              </NeonButton>
            </Link>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
