import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "highlight" | "ghost";
  size?: "md" | "lg";
}

const variantClasses: Record<NonNullable<NeonButtonProps["variant"]>, string> = {
  // Les fonds accent sont clairs : le texte est toujours `ink-accent`, jamais blanc.
  primary: "bg-primary text-ink-accent shadow-btn-primary hover:bg-primary-dark",
  secondary: "bg-secondary text-ink-accent shadow-btn-secondary hover:bg-secondary-dark",
  highlight: "bg-highlight text-ink-accent shadow-btn-highlight hover:brightness-110",
  ghost: "bg-background-card text-ink border border-line shadow-btn-ghost hover:bg-background-sunken hover:border-primary",
};

export function NeonButton({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: NeonButtonProps) {
  return (
    <button
      className={cn(
        "btn-tap inline-flex items-center justify-center gap-2 rounded-2xl font-display font-bold transition-all duration-150",
        "active:translate-y-1 active:shadow-none",
        size === "md" && "px-6 text-base",
        size === "lg" && "px-8 text-lg",
        variantClasses[variant],
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-y-0",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
