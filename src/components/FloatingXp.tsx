"use client";

import { motion } from "framer-motion";

interface FloatingXpProps {
  amount: number;
  x?: number;
  y?: number;
}

export function FloatingXp({ amount, x = 0, y = 0 }: FloatingXpProps) {
  return (
    <motion.div
      initial={{
        opacity: 1,
        x: x,
        y: y,
      }}
      animate={{
        opacity: 0,
        y: y - 60,
      }}
      transition={{
        duration: 1.2,
        ease: "easeOut",
      }}
      className="pointer-events-none fixed font-display font-bold text-lg"
      style={{
        color: "#10B981",
        textShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
      }}
    >
      +{amount} XP
    </motion.div>
  );
}
