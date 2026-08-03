export type CategoryId =
  | "geographie"
  | "histoire"
  | "sciences"
  | "sport"
  | "cinema"
  | "culture-generale"
  // Categories introduites par le pool Time Attack (900 questions).
  | "popculture"
  | "nature"
  | "gastronomie"
  | "musique"
  | "litterature"
  | "langues"
  | "art"
  | "technologie";

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  color: "primary" | "secondary" | "highlight";
}

export interface QcmQuestion {
  id: string;
  category: CategoryId;
  question: string;
  choices: [string, string, string, string];
  answerIndex: number;
  difficulty: 1 | 2 | 3;
  allowedModes: GameModeId[];
}

export interface JetpunkItem {
  id: string;
  answers: string[];
  hint?: string;
}

export interface JetpunkRound {
  id: string;
  category: CategoryId;
  title: string;
  instructions: string;
  timeLimitSeconds: number;
  items: JetpunkItem[];
}

export type GameModeId =
  | "time-attack"
  | "jetpunk"
  | "ranked"
  | "thematique"
  | "duel"
  | "chaos";

export interface GameMode {
  id: GameModeId;
  title: string;
  tagline: string;
  href: string;
  accent: "primary" | "secondary" | "highlight";
  badge?: string;
  premium?: boolean;
  logo: string;
}

export type RankTier = "bronze" | "argent" | "or" | "diamant";

export interface RankDefinition {
  tier: RankTier;
  label: string;
  minElo: number;
  maxElo: number;
  color: string;
}
