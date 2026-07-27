"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { calculateLevelFromXp, getLevelTier } from "@/lib/xp";

interface PostGameXpSequenceProps {
  startXp: number;
  endXp: number;
  xpGained: number;
  onAnimationComplete: () => void;
}

export function PostGameXpSequence({
  startXp,
  endXp,
  xpGained,
  onAnimationComplete,
}: PostGameXpSequenceProps) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const startLevel = calculateLevelFromXp(startXp).level;
  const endLevel = calculateLevelFromXp(endXp).level;
  const tierInfo = getLevelTier(endLevel);
  const leveledUp = endLevel > startLevel;

  const { xpInLevel: startXpInLevel, xpForNext: startXpForNext } =
    calculateLevelFromXp(startXp);
  const { xpInLevel: endXpInLevel, xpForNext: endXpForNext } =
    calculateLevelFromXp(endXp);

  const startProgress = (startXpInLevel / startXpForNext) * 100;
  const endProgress = (endXpInLevel / endXpForNext) * 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (leveledUp) {
        setShowLevelUp(true);
      }
    }, 1000);

    const completeTimer = setTimeout(() => {
      onAnimationComplete();
    }, leveledUp ? 2500 : 1800);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [leveledUp, onAnimationComplete]);

  return (
    <div className="space-y-6">
      {/* Level Badge */}
      <div className="flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full font-display font-bold text-lg text-white"
            style={{ backgroundColor: tierInfo.color }}
          >
            {endLevel}
          </div>
          <div>
            <p className="font-display font-bold text-ink">{tierInfo.label}</p>
            <p className="text-xs text-ink-soft">{tierInfo.description}</p>
          </div>
        </motion.div>
      </div>

      {/* XP Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-ink">Experience</span>
          <span className="text-sm font-bold text-ink-soft">
            {endXpInLevel} / {endXpForNext}
          </span>
        </div>

        {/* Animated XP Bar */}
        <div className="w-full h-3 rounded-full bg-ink/10 overflow-hidden">
          <motion.div
            initial={{ width: `${startProgress}%` }}
            animate={{ width: `${endProgress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: tierInfo.color }}
          />
        </div>

        {/* XP Gained Label */}
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-xs text-center font-bold"
          style={{ color: tierInfo.color }}
        >
          +{xpGained} XP
        </motion.p>
      </div>

      {/* Level Up Celebration */}
      {leveledUp && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={showLevelUp ? { opacity: 1, scale: 1 } : {}}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          className="text-center py-4 px-6 rounded-lg bg-gradient-to-r from-amber-400/20 to-amber-400/10 border border-amber-400/50"
        >
          <motion.p
            animate={
              showLevelUp
                ? {
                    scale: [1, 1.2, 1],
                    textShadow: [
                      "0 0 0px rgba(251, 191, 36, 0)",
                      "0 0 20px rgba(251, 191, 36, 0.8)",
                      "0 0 0px rgba(251, 191, 36, 0)",
                    ],
                  }
                : {}
            }
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-2xl font-extrabold text-amber-600"
          >
            🎉 LEVEL UP! 🎉
          </motion.p>
        </motion.div>
      )}
    </div>
  );
}
