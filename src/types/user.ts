// Types miroir du schema Supabase (supabase/migrations/20260803000000_user_system.sql).
// Toute modification ici doit etre repercutee dans la migration, et inversement.

export type GameMode =
  | "time_attack"
  | "jetpunk"
  | "quiz_du_jour"
  | "1vs1"
  | "ranked"
  | "chaos"
  | "thematique";

export type GameDifficulty = "easy" | "medium" | "hard" | "mixed";

export interface Profile {
  id: string;
  email: string;
  username: string;
  level: number;
  total_xp: number;
  profile_photo_url: string | null;
  avatar_default: string;
  created_at: string;
  updated_at: string;
}

export interface GameRecord {
  id: string;
  user_id: string;
  mode: GameMode;
  score: number;
  correct_answers: number;
  total_questions: number;
  longest_streak: number;
  avg_time_per_question: number;
  difficulty: GameDifficulty;
  xp_earned: number;
  played_at: string;
  week_number: string;
  season: number;
}

/** Payload envoye a submit_game(). L'XP n'y figure pas : il est calcule serveur. */
export interface GameSubmission {
  mode: GameMode;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  longestStreak: number;
  avgTimePerQuestion: number;
  difficulty: GameDifficulty;
}

/** Retour de submit_game() : tout ce dont l'ecran de fin a besoin. */
export interface GameSubmitResult {
  game_id: string;
  xp_earned: number;
  total_xp: number;
  level: number;
  xp_in_level: number;
  xp_for_next: number;
  rank_before: number;
  rank_after: number;
  /** > 0 = le joueur a gagne des places. */
  rank_delta: number;
  xp_to_next_rank: number;
  week: string;
}

export interface LeaderboardEntryAllTime {
  rank: number;
  user_id: string;
  username: string;
  level: number;
  total_xp: number;
  best_score: number;
  games_count: number;
  profile_photo_url: string | null;
  avatar_default: string;
}

export interface LeaderboardEntryWeekly {
  rank: number;
  user_id: string;
  username: string;
  level: number;
  total_xp_week: number;
  games_count: number;
  avg_score: number;
  best_score: number;
  profile_photo_url: string | null;
  avatar_default: string;
}

export interface AvailableWeek {
  week: string;
  players: number;
}

export interface MyRanks {
  alltime_rank: number;
  weekly_rank: number;
  week: string;
}

export interface ProfileStats {
  totalXp: number;
  level: number;
  gamesPlayed: number;
  bestScore: number;
  bestStreak: number;
  /** Ratio 0-1 sur l'ensemble des parties. */
  winRate: number;
}
