import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: "blue" | "magenta" | "gold" | "none";
}

export function GlassCard({
  className,
  hover = false,
  glow = "none",
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card",
        hover && "glass-card-hover cursor-pointer",
        glow === "blue" && "neon-border-blue",
        glow === "magenta" && "neon-border-magenta",
        glow === "gold" && "neon-border-gold",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
