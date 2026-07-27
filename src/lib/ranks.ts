import type { RankDefinition, RankTier } from "@/types/quiz";

export const RANKS: RankDefinition[] = [
  { tier: "bronze", label: "Bronze", minElo: 0, maxElo: 999, color: "#CD7F32" },
  { tier: "argent", label: "Argent", minElo: 1000, maxElo: 1499, color: "#C0C6D6" },
  { tier: "or", label: "Or", minElo: 1500, maxElo: 1999, color: "#FFBC00" },
  { tier: "diamant", label: "Diamant", minElo: 2000, maxElo: Infinity, color: "#5FE0E0" },
];

export function getRankForElo(elo: number): RankDefinition {
  return RANKS.find((r) => elo >= r.minElo && elo <= r.maxElo) ?? RANKS[0];
}

export function getRankProgress(elo: number): {
  rank: RankDefinition;
  next: RankDefinition | null;
  progressPct: number;
} {
  const rank = getRankForElo(elo);
  const index = RANKS.findIndex((r) => r.tier === rank.tier);
  const next = RANKS[index + 1] ?? null;

  if (!next) {
    return { rank, next: null, progressPct: 100 };
  }

  const span = rank.maxElo - rank.minElo + 1;
  const progressPct = Math.min(100, Math.max(0, ((elo - rank.minElo) / span) * 100));
  return { rank, next, progressPct };
}

export function rankTierColorClass(tier: RankTier): string {
  switch (tier) {
    case "bronze":
      return "text-rank-bronze";
    case "argent":
      return "text-rank-silver";
    case "or":
      return "text-rank-gold";
    case "diamant":
      return "text-rank-diamond";
  }
}
