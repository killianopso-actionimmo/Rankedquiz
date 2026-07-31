"use client";

import type { ReactNode } from "react";
import { cn } from "./cn";

/* ==========================================================================
   PROGRESS BAR — gradient signature vanilla -> cyan
   ======================================================================== */
export function ProgressBar({
  value,
  max = 100,
  label,
  className,
}: {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-token-2 flex items-center justify-between text-sm font-semibold text-ink-soft">
          <span>{label}</span>
          <span className="text-ink">
            {value}/{max}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-3 w-full overflow-hidden rounded-full bg-background-sunken border border-line"
      >
        <div
          className="h-full rounded-full bg-quiz-gradient transition-[width] duration-500 ease-token"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   TIMER — dark par defaut, rouge quand il reste peu de temps
   ======================================================================== */
export function Timer({
  seconds,
  urgentBelow = 5,
  className,
}: {
  seconds: number;
  urgentBelow?: number;
  className?: string;
}) {
  const urgent = seconds <= urgentBelow;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-token-2 rounded-full border px-token-4 py-token-1",
        "font-display text-lg font-bold tabular-nums transition-colors duration-[var(--duration-base)]",
        urgent
          ? "border-danger bg-danger/12 text-danger animate-pulse-glow"
          : "border-line bg-background-sunken text-ink",
        className,
      )}
    >
      <span aria-hidden>⏱</span>
      {seconds}s
    </span>
  );
}

/* ==========================================================================
   SCORE — vert pour les bonnes reponses
   ======================================================================== */
export function ScoreDisplay({
  correct,
  total,
  className,
}: {
  correct: number;
  total: number;
  className?: string;
}) {
  return (
    <span className={cn("font-display text-lg font-bold text-ink", className)}>
      <span className="text-success">{correct}</span>
      <span className="text-ink-faint"> / {total}</span>
    </span>
  );
}

/* ==========================================================================
   STREAK / FLAMME — gradient highlight -> flame -> danger
   ======================================================================== */
export function Streak({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-token-1 rounded-full bg-flame-gradient px-token-4 py-token-1",
        "font-display text-sm font-bold text-ink-accent shadow-subtle",
        className,
      )}
    >
      <span aria-hidden>🔥</span>
      {count}
    </span>
  );
}

/* ==========================================================================
   BADGE / TAG — statuts et difficultes
   ======================================================================== */
export type TagTone = "primary" | "vanilla" | "success" | "danger" | "info" | "highlight" | "neutral";

const TAG_TONES: Record<TagTone, string> = {
  primary: "bg-primary/15 text-ink border-primary",
  vanilla: "bg-secondary text-ink-accent border-vanilla-dark",
  success: "bg-success/18 text-ink border-success",
  danger: "bg-danger/18 text-ink border-danger",
  info: "bg-info/18 text-ink border-info",
  highlight: "bg-highlight/25 text-ink border-highlight",
  neutral: "bg-background-sunken text-ink-soft border-line",
};

export function Tag({
  tone = "neutral",
  children,
  className,
}: {
  tone?: TagTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-token-1 rounded-full border px-token-2 py-[2px]",
        "text-xs font-semibold uppercase tracking-wide",
        TAG_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* Les 3 niveaux de difficulte, verrouilles sur la palette. */
export function DifficultyTag({ level }: { level: "facile" | "moyen" | "difficile" }) {
  const tone: TagTone = level === "facile" ? "success" : level === "moyen" ? "highlight" : "danger";
  return <Tag tone={tone}>{level}</Tag>;
}

/* ==========================================================================
   TROPHEE / MEDAILLE — rangs
   ======================================================================== */
const RANKS = {
  bronze: "bg-rank-bronze/20 border-rank-bronze",
  silver: "bg-rank-silver/20 border-rank-silver",
  gold: "bg-rank-gold/25 border-rank-gold",
  diamond: "bg-rank-diamond/20 border-rank-diamond",
} as const;

export function Trophy({
  rank,
  icon = "🏆",
  className,
}: {
  rank: keyof typeof RANKS;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl shadow-subtle",
        RANKS[rank],
        className,
      )}
    >
      {icon}
    </span>
  );
}
