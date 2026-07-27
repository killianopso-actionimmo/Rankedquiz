import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "highlight" | "ghost";
  size?: "md" | "lg";
}

const variantClasses: Record<NonNullable<NeonButtonProps["variant"]>, string> = {
  primary: "bg-primary text-white shadow-btn-primary hover:bg-primary-light",
  secondary: "bg-secondary text-white shadow-btn-secondary hover:bg-secondary-light",
  highlight: "bg-highlight text-ink shadow-btn-highlight hover:bg-highlight-light",
  ghost: "bg-white text-ink border border-black/[0.08] shadow-btn-ghost hover:bg-background",
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
