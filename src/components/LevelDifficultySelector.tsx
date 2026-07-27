"use client";

import { motion } from "framer-motion";
import { Zap, Shuffle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { calculateLevelFromXp, getLevelTier, LEVEL_TIERS } from "@/lib/xp";

interface LevelDifficultySelectorProps {
  currentXp: number;
  onSelectDifficulty: (difficulty: 1 | 2 | 3 | "random") => void;
  onCancel: () => void;
}

export function LevelDifficultySelector({
  currentXp,
  onSelectDifficulty,
  onCancel,
}: LevelDifficultySelectorProps) {
  const { level } = calculateLevelFromXp(currentXp);
  const tierInfo = getLevelTier(level);

  const difficultyOptions = [
    {
      id: 1 as const,
      label: "Easy",
      tier: "beginner",
      locked: level < 1,
      icon: "🟢",
    },
    {
      id: 2 as const,
      label: "Medium",
      tier: "intermediate",
      locked: level < 6,
      icon: "🟡",
    },
    {
      id: 3 as const,
      label: "Hard",
      tier: "expert",
      locked: level < 16,
      icon: "🔴",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <GlassCard glow="blue" className="p-8">
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
                  {tierInfo.label}
                </h2>
                <p className="text-xs text-ink-soft">{tierInfo.description}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-ink-soft mb-6">
            Choisis ta difficulté ou joue en mode aléatoire
          </p>

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
                          Levels {tierDef.minLevel}-{tierDef.maxLevel === Infinity ? "∞" : tierDef.maxLevel}
                          {isCurrentTier && " • Your tier"}
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
            className="w-full p-4 rounded-lg border-2 border-dashed border-highlight/40 bg-highlight/5 transition-all text-left hover:shadow-lg hover:border-highlight/60 active:scale-95"
          >
            <div className="flex items-center gap-3">
              <Shuffle className="h-5 w-5 text-highlight-dark" />
              <div className="flex-1">
                <p className="font-bold text-highlight-dark">Random Mode</p>
                <p className="text-xs text-ink-soft mt-1">
                  Mix all difficulty levels
                </p>
              </div>
            </div>
          </motion.button>

          <NeonButton
            variant="ghost"
            size="lg"
            className="w-full mt-6"
            onClick={onCancel}
          >
            Annuler
          </NeonButton>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
