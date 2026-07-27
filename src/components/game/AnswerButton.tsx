"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnswerState = "idle" | "correct" | "wrong" | "reveal-correct" | "disabled";

interface AnswerButtonProps {
  label: string;
  state: AnswerState;
  onClick: () => void;
}

const STATE_CLASSES: Record<AnswerState, string> = {
  idle: "border-black/[0.06] bg-white shadow-card hover:border-primary/40 hover:shadow-card-hover",
  correct: "border-success/60 bg-success-bg shadow-card",
  wrong: "border-danger/60 bg-danger-bg shadow-card animate-shake",
  "reveal-correct": "border-success/60 bg-success-bg shadow-card",
  disabled: "border-black/[0.04] bg-black/[0.02] opacity-60",
};

export function AnswerButton({ label, state, onClick }: AnswerButtonProps) {
  const isLocked = state !== "idle";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isLocked}
      whileTap={!isLocked ? { scale: 0.97 } : undefined}
      className={cn(
        "btn-tap flex w-full items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left font-sans text-base font-semibold text-ink transition-colors duration-150",
        STATE_CLASSES[state]
      )}
    >
      <span>{label}</span>
      {state === "correct" && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-white">
          <Check className="h-4 w-4" />
        </span>
      )}
      {state === "wrong" && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-danger text-white">
          <X className="h-4 w-4" />
        </span>
      )}
      {state === "reveal-correct" && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-white">
          <Check className="h-4 w-4" />
        </span>
      )}
    </motion.button>
  );
}
