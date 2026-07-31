"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

/**
 * Bouton de reponse A/B/C/D — le composant le plus critique du quiz.
 *
 * default   : fond alternatif, texte dark
 * hover     : glow cyan
 * selected  : cyan bold
 * correct   : vert  #51CF66
 * incorrect : rouge #FF6B6B
 * disabled  : opacite 50%
 */
export type AnswerState = "default" | "selected" | "correct" | "incorrect";

const STATES: Record<AnswerState, string> = {
  default: cn(
    "bg-background-sunken border-line text-ink",
    "hover:border-primary hover:bg-background-card hover:shadow-glow-cyan",
  ),
  selected: "bg-primary/15 border-primary text-ink font-bold shadow-glow-cyan",
  correct: "bg-success/20 border-success text-ink font-bold shadow-glow-success",
  incorrect: "bg-danger/20 border-danger text-ink font-bold shadow-glow-danger",
};

const LETTER_STATES: Record<AnswerState, string> = {
  default: "bg-background-card border-line text-ink-soft",
  selected: "bg-primary border-primary text-ink-accent",
  correct: "bg-success border-success text-ink-accent",
  incorrect: "bg-danger border-danger text-ink-accent",
};

export interface AnswerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** "A" | "B" | "C" | "D" */
  letter: string;
  label: string;
  state?: AnswerState;
}

export function AnswerButton({
  letter,
  label,
  state = "default",
  className,
  disabled,
  ...props
}: AnswerButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      aria-pressed={state === "selected"}
      className={cn(
        "group flex w-full items-center gap-token-4 rounded-md border-2 p-token-4 text-left",
        "transition-all duration-[var(--duration-base)] ease-token",
        "active:scale-[0.98]",
        "disabled:pointer-events-none",
        STATES[state],
        // On n'estompe QUE les options non retenues : la bonne et la mauvaise
        // reponse doivent rester parfaitement lisibles apres validation.
        disabled && state === "default" && "opacity-50",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border font-display text-base font-bold",
          "transition-colors duration-[var(--duration-base)] ease-token",
          LETTER_STATES[state],
        )}
      >
        {letter}
      </span>
      <span className="text-base leading-snug">{label}</span>
    </button>
  );
}
