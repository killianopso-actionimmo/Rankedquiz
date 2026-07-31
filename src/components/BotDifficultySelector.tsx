"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Zap, BarChart3, Flame } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";

export type BotDifficulty = "easy" | "medium" | "hard";

interface BotDifficultySelectorProps {
  onSelectDifficulty: (difficulty: BotDifficulty) => void;
  onCancel: () => void;
}

const difficultyOptions = [
  {
    id: "easy" as BotDifficulty,
    label: "Facile",
    emoji: "🤖",
    description: "Bot lent, ~50-60% de précision",
    color: "from-success/30 to-success/10",
    accent: "text-ink",
  },
  {
    id: "medium" as BotDifficulty,
    label: "Moyen",
    emoji: "🤖",
    description: "Bot modéré, ~75-80% de précision",
    color: "from-highlight/35 to-highlight/10",
    accent: "text-ink",
  },
  {
    id: "hard" as BotDifficulty,
    label: "Difficile",
    emoji: "🤖",
    description: "Bot rapide, ~90-95% de précision",
    color: "from-danger/30 to-danger/10",
    accent: "text-ink",
  },
];

export function BotDifficultySelector({ onSelectDifficulty, onCancel }: BotDifficultySelectorProps) {
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
          <h2 className="font-display text-2xl font-extrabold text-ink mb-2">Jouer vs Bot</h2>
          <p className="text-sm text-ink-soft mb-6">Choisis la difficulté du bot</p>

          <div className="space-y-3 mb-6">
            {difficultyOptions.map((option, idx) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => onSelectDifficulty(option.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left hover:shadow-lg active:scale-95 ${option.color}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <div className="flex-1">
                    <p className={`font-bold ${option.accent}`}>{option.label}</p>
                    <p className="text-xs text-ink-soft mt-1">{option.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <NeonButton variant="ghost" size="lg" className="w-full" onClick={onCancel}>
              Annuler
            </NeonButton>
            <Link href="/" className="w-full">
              <NeonButton variant="ghost" size="lg" className="w-full">
                <Home className="h-5 w-5" />
                Menu Principal
              </NeonButton>
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
