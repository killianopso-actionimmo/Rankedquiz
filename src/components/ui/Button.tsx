"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Bouton unique du site. Aucun autre composant ne doit redefinir un style de
 * bouton : on passe toujours par `variant` + `size`.
 *
 * Etats couverts : default / hover / active / focus / disabled / loading.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  // Cyan — action principale
  primary: cn(
    "bg-primary text-ink-accent shadow-btn-primary",
    "hover:bg-primary-dark hover:shadow-[0_4px_0_0_rgb(var(--c-cyan-dark))]",
    "active:translate-y-[3px] active:shadow-none",
  ),
  // Vanilla — action alternative
  secondary: cn(
    "bg-secondary text-ink-accent shadow-btn-secondary",
    "hover:bg-secondary-dark",
    "active:translate-y-[3px] active:shadow-none",
  ),
  // Vert — valider, continuer
  success: cn(
    "bg-success text-ink-accent shadow-btn-success",
    "hover:brightness-110",
    "active:translate-y-[3px] active:shadow-none",
  ),
  // Rouge — supprimer, quitter
  danger: cn(
    "bg-danger text-ink-accent shadow-btn-danger",
    "hover:brightness-110",
    "active:translate-y-[3px] active:shadow-none",
  ),
  // Neutre — actions tertiaires
  ghost: cn(
    "bg-background-card text-ink border border-line shadow-btn-ghost",
    "hover:bg-background-sunken hover:border-primary",
    "active:translate-y-[3px] active:shadow-none",
  ),
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-token-4 text-sm rounded-md gap-token-1",
  md: "h-12 px-token-6 text-base rounded-md gap-token-2",
  lg: "h-14 px-token-8 text-lg rounded-lg gap-token-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold",
        "transition-all duration-[var(--duration-fast)] ease-token",
        "disabled:pointer-events-none",
        SIZES[size],
        VARIANTS[variant],
        // Disabled : opacite 50% + gris, on neutralise tous les effets.
        // Le loading garde la couleur de sa variante (l'action reste en cours).
        disabled &&
          !loading &&
          "!bg-background-sunken !text-ink-soft !shadow-none !translate-y-0 opacity-50",
        loading && "cursor-wait opacity-80",
        fullWidth && "w-full",
        className,
      )}
    >
      {loading ? (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70"
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
