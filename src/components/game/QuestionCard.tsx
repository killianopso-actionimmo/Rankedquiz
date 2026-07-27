"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CategoryBadge } from "./CategoryBadge";
import type { CategoryId } from "@/types/quiz";

interface QuestionCardProps {
  questionKey: string | number;
  category: CategoryId;
  question: string;
  index: number;
  total: number;
}

export function QuestionCard({ questionKey, category, question, index, total }: QuestionCardProps) {
  return (
    <div className="glass-card p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <CategoryBadge category={category} />
        <span className="font-display text-sm font-semibold text-ink-faint">
          {index + 1} / {total}
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.h2
          key={questionKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="font-display text-xl font-bold leading-snug text-ink sm:text-2xl"
        >
          {question}
        </motion.h2>
      </AnimatePresence>
    </div>
  );
}
