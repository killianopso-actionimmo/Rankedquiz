import type { GameDifficulty } from "@/types/user";

/**
 * Formule XP de progression (niveaux 1-100), miroir exact de la fonction SQL
 * `calc_xp` dans supabase/migrations/20260803000000_user_system.sql.
 *
 * La base fait foi cote serveur : cette version sert uniquement a afficher un
 * gain estime pendant l'animation de fin de partie, avant que la reponse de
 * submit_game() n'arrive. Si les deux divergent, c'est la valeur serveur qui
 * est retenue. Toute modification ici doit etre repliquee dans le SQL.
 *
 * base  = score / total_questions
 * bonus = pourcentages de la base, cumulatifs :
 *   streak    +5% par bonne reponse consecutive, plafonne a +50% (10+)
 *   win rate  +10% si correct/total > 70%
 *   speed     +15% si temps moyen < 2s
 *   difficulte hard +20% | medium +10% | mixed +5% | easy +0%
 */
export function calculateProgressionXp(params: {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  longestStreak: number;
  avgTimePerQuestion: number;
  difficulty: GameDifficulty;
}): number {
  const { score, correctAnswers, totalQuestions, longestStreak, avgTimePerQuestion, difficulty } =
    params;

  if (!totalQuestions || totalQuestions <= 0) return 0;

  const base = score / totalQuestions;
  const winRate = correctAnswers / totalQuestions;
  let bonus = 0;

  bonus += base * Math.min(Math.max(longestStreak, 0) * 0.05, 0.5);
  if (winRate > 0.7) bonus += base * 0.1;
  if (avgTimePerQuestion > 0 && avgTimePerQuestion < 2) bonus += base * 0.15;

  const difficultyBonus: Record<GameDifficulty, number> = {
    hard: 0.2,
    medium: 0.1,
    mixed: 0.05,
    easy: 0,
  };
  bonus += base * (difficultyBonus[difficulty] ?? 0);

  return Math.max(0, Math.floor(base + bonus));
}

/** Mappe la difficulte interne (1|2|3|"random") vers le format base de donnees. */
export function toDbDifficulty(diff: 1 | 2 | 3 | "random"): GameDifficulty {
  if (diff === 1) return "easy";
  if (diff === 2) return "medium";
  if (diff === 3) return "hard";
  return "mixed";
}

// Calculate XP gained based on game performance
export function calculateXpGain(
  correct: number,
  total: number,
  mode: "time-attack" | "jetpunk" | "ranked" | "thematique" | "duel"
): number {
  const accuracy = correct / total;

  // Base XP by mode
  const baseXpByMode = {
    "time-attack": 50,
    jetpunk: 75,
    ranked: 100,
    thematique: 60,
    duel: 80,
  };

  const baseXp = baseXpByMode[mode];

  // Bonus multiplier based on accuracy
  let multiplier = 1;
  if (accuracy >= 0.9) multiplier = 1.5; // 90%+
  else if (accuracy >= 0.75) multiplier = 1.25; // 75-89%
  else if (accuracy >= 0.5) multiplier = 1; // 50-74%
  else multiplier = 0.5; // Below 50%

  const xpGain = Math.max(10, Math.floor(baseXp * multiplier));
  return xpGain;
}
