"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type CardVariant = "question" | "ranking" | "badge" | "plain";

/**
 * Conteneur unique du site. Espacement et typo homogenes sur toutes les
 * variantes : padding 24px, rayon lg, bordure token.
 *
 * - question : surface blanche + bordure vanilla dark (carte de question)
 * - ranking  : fond alternatif, ombre nulle (lignes de classement)
 * - badge    : surface blanche + ombre forte (trophees, recompenses)
 * - plain    : surface neutre par defaut
 */
const VARIANTS: Record<CardVariant, string> = {
  question: "bg-background-card border-vanilla-dark shadow-medium",
  ranking: "bg-background-sunken border-line shadow-none",
  badge: "bg-background-card border-line shadow-strong",
  plain: "bg-background-card border-line shadow-subtle",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Ajoute l'elevation + le liseré cyan au survol. */
  interactive?: boolean;
}

export function Card({
  variant = "plain",
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-lg border p-token-6 transition-all duration-[var(--duration-base)] ease-token",
        VARIANTS[variant],
        interactive && "cursor-pointer hover:-translate-y-0.5 hover:border-primary hover:shadow-glow-cyan active:translate-y-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("font-display text-lg font-bold text-ink", className)}>{children}</h3>
  );
}

export function CardSubtitle({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("mt-token-1 text-sm text-ink-soft", className)}>{children}</p>;
}
