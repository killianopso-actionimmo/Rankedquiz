import { Shield, Award, Crown, Gem } from "lucide-react";
import type { RankTier } from "@/types/quiz";
import { cn } from "@/lib/utils";

const RANK_ICON: Record<RankTier, typeof Shield> = {
  bronze: Shield,
  argent: Award,
  or: Crown,
  diamant: Gem,
};

/* Les couleurs de rang sont claires : l'icone et le label restent en `ink`
   pour garder le contraste, le rang se lit sur la bordure et le fond. */
const RANK_COLOR: Record<RankTier, string> = {
  bronze: "text-ink border-rank-bronze bg-rank-bronze/20",
  argent: "text-ink border-rank-silver bg-rank-silver/20",
  or: "text-ink border-rank-gold bg-rank-gold/25",
  diamant: "text-ink border-rank-diamond bg-rank-diamond/20",
};

interface RankBadgeProps {
  tier: RankTier;
  label: string;
  size?: "sm" | "md" | "lg";
}

export function RankBadge({ tier, label, size = "md" }: RankBadgeProps) {
  const Icon = RANK_ICON[tier];
  const dims = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-16 w-16" : "h-11 w-11";
  const iconDims = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-5 w-5";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "flex items-center justify-center rounded-full border-2 shadow-card",
          dims,
          RANK_COLOR[tier]
        )}
      >
        <Icon className={iconDims} />
      </div>
      {size !== "sm" && (
        <span className={cn("font-display text-xs font-semibold", RANK_COLOR[tier].split(" ")[0])}>
          {label}
        </span>
      )}
    </div>
  );
}
