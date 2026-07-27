import { Shield, Award, Crown, Gem } from "lucide-react";
import type { RankTier } from "@/types/quiz";
import { cn } from "@/lib/utils";

const RANK_ICON: Record<RankTier, typeof Shield> = {
  bronze: Shield,
  argent: Award,
  or: Crown,
  diamant: Gem,
};

const RANK_COLOR: Record<RankTier, string> = {
  bronze: "text-[#9A5B22] border-rank-bronze/50 bg-rank-bronze/10",
  argent: "text-[#64748B] border-rank-silver/50 bg-rank-silver/10",
  or: "text-highlight-dark border-highlight/50 bg-highlight/10",
  diamant: "text-[#0891A8] border-rank-diamond/50 bg-rank-diamond/10",
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
