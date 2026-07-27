export type BadgeCategory =
  | "starter"
  | "performance"
  | "progression"
  | "regularity"
  | "mastery"
  | "progression-advanced"
  | "competitive"
  | "special-modes"
  | "meta"
  | "secret";

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  isHidden: boolean;
  unlockedAt: number | null;
}

export interface UnlockedBadge {
  badgeId: string;
  unlockedAt: number;
}

export interface BadgesState {
  unlocked: UnlockedBadge[];
}
