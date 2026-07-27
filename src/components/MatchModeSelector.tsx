"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Users, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";

export type MatchMode = "human" | "bot";

interface MatchModeSelectorProps {
  title: string;
  onSelectMode: (mode: MatchMode) => void;
}

export function MatchModeSelector({ title, onSelectMode }: MatchModeSelectorProps) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-8 px-4 py-10">
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold text-ink mb-2">{title}</h1>
        <p className="text-sm text-ink-soft">Choisis ton adversaire</p>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Human Match */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => onSelectMode("human")}
          type="button"
          className="w-full"
        >
          <GlassCard hover glow="blue" className="h-full p-6 flex flex-col items-center gap-4">
            <Users className="h-12 w-12 text-primary" />
            <div className="text-center">
              <h3 className="font-bold text-ink mb-1">Joueur</h3>
              <p className="text-xs text-ink-soft">Affronte un autre joueur</p>
            </div>
            <div className="mt-2 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-semibold">
              Jouer
            </div>
          </GlassCard>
        </motion.button>

        {/* Bot Match */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onClick={() => onSelectMode("bot")}
          type="button"
          className="w-full"
        >
          <GlassCard hover glow="gold" className="h-full p-6 flex flex-col items-center gap-4">
            <Zap className="h-12 w-12 text-yellow-500" />
            <div className="text-center">
              <h3 className="font-bold text-ink mb-1">Bot IA</h3>
              <p className="text-xs text-ink-soft">Affronte une intelligence artificielle</p>
            </div>
            <div className="mt-2 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-semibold">
              Jouer
            </div>
          </GlassCard>
        </motion.button>
      </div>

      <Link href="/" className="w-full max-w-xs">
        <NeonButton variant="ghost" size="lg" className="w-full">
          <Home className="h-5 w-5" />
          Menu Principal
        </NeonButton>
      </Link>
    </div>
  );
}
