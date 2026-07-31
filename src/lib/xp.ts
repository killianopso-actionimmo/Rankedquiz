export type LevelTier = "beginner" | "intermediate" | "expert" | "legend";

export interface LevelDefinition {
  tier: LevelTier;
  label: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  bgColor: string;
  description: string;
}

export const LEVEL_TIERS: LevelDefinition[] = [
  {
    tier: "beginner",
    label: "Beginner",
    minLevel: 1,
    maxLevel: 5,
    color: "rgb(var(--c-success))",
    bgColor: "from-success/20 to-success/5",
    description: "Easy questions",
  },
  {
    tier: "intermediate",
    label: "Intermediate",
    minLevel: 6,
    maxLevel: 15,
    color: "rgb(var(--c-highlight))",
    bgColor: "from-highlight/25 to-highlight/5",
    description: "Medium questions",
  },
  {
    tier: "expert",
    label: "Expert",
    minLevel: 16,
    maxLevel: 30,
    color: "rgb(var(--c-danger))",
    bgColor: "from-danger/20 to-danger/5",
    description: "Hard questions",
  },
  {
    tier: "legend",
    label: "Legend",
    minLevel: 31,
    maxLevel: Infinity,
    color: "rgb(var(--c-info))",
    bgColor: "from-info/20 to-info/5",
    description: "Extreme difficulty",
  },
];

const XP_PER_LEVEL = 500;

export function calculateLevelFromXp(xp: number): { level: number; xpInLevel: number; xpForNext: number } {
  const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
  const xpForCurrentLevel = (level - 1) * XP_PER_LEVEL;
  const xpInLevel = xp - xpForCurrentLevel;
  const xpForNext = XP_PER_LEVEL;
  return { level: Math.min(level, 100), xpInLevel, xpForNext };
}

export function getLevelTier(level: number): LevelDefinition {
  return LEVEL_TIERS.find((t) => level >= t.minLevel && level <= t.maxLevel) ?? LEVEL_TIERS[0];
}

export function getDifficultyForLevel(level: number): 1 | 2 | 3 {
  const tier = getLevelTier(level);
  switch (tier.tier) {
    case "beginner":
      return 1;
    case "intermediate":
      return 2;
    case "expert":
      return 3;
    case "legend":
      return 3;
  }
}

export function addXp(currentXp: number, amount: number): number {
  return Math.max(0, currentXp + amount);
}
