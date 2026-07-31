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

/**
 * Palette verrouillee sur les tokens :
 *  idle     -> fond sunken, bordure neutre
 *  hover    -> bordure cyan + glow cyan subtil
 *  correct  -> vert plein
 *  wrong    -> rouge plein
 *
 * La bordure au repos est volontairement neutre (`line`) et non vanilla : une
 * bordure teintee de vert se lirait comme un debut de "bonne reponse" avant
 * meme que le joueur ait repondu.
 * Le texte reste `ink-accent` sur les fonds pleins (ils sont clairs).
 */
const STATE_CLASSES: Record<AnswerState, string> = {
  idle: "border-line bg-background-sunken text-ink shadow-subtle hover:border-primary hover:shadow-glow-cyan",
  correct: "border-success bg-success text-ink-accent shadow-glow-success",
  wrong: "border-danger bg-danger text-ink-accent shadow-glow-danger animate-shake",
  "reveal-correct": "border-success bg-success text-ink-accent shadow-glow-success",
  disabled: "border-line bg-background-sunken text-ink opacity-50",
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
        "btn-tap flex w-full items-center justify-between gap-3 rounded-2xl border-2 px-5 py-4 text-left font-sans text-base font-semibold transition-all duration-150 ease-token",
        STATE_CLASSES[state]
      )}
    >
      <span>{label}</span>
      {state === "correct" && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background-card text-success">
          <Check className="h-4 w-4" />
        </span>
      )}
      {state === "wrong" && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background-card text-danger">
          <X className="h-4 w-4" />
        </span>
      )}
      {state === "reveal-correct" && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background-card text-success">
          <Check className="h-4 w-4" />
        </span>
      )}
    </motion.button>
  );
}
