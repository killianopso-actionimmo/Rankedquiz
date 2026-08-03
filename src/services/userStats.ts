import { createClient } from "@/lib/supabase";
import type {
  AvailableWeek,
  GameRecord,
  GameSubmission,
  GameSubmitResult,
  LeaderboardEntryAllTime,
  LeaderboardEntryWeekly,
  MyRanks,
  Profile,
  ProfileStats,
} from "@/types/user";

/**
 * Acces Supabase pour le systeme de profils / XP / classements.
 *
 * Toutes les fonctions renvoient une valeur neutre (null / tableau vide) si
 * Supabase n'est pas configure ou si l'appel echoue : le jeu doit rester
 * jouable hors-ligne, la persistance est un bonus, jamais un bloqueur.
 */

type Result<T> = { data: T; error: string | null };

function ok<T>(data: T): Result<T> {
  return { data, error: null };
}

function fail<T>(fallback: T, error: unknown): Result<T> {
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "Erreur inconnue";
  if (process.env.NODE_ENV !== "production") {
    console.warn("[userStats]", message);
  }
  return { data: fallback, error: message };
}

// ------------------------------------------------------------------ profil

export async function fetchProfile(userId: string): Promise<Result<Profile | null>> {
  const supabase = createClient();
  if (!supabase) return ok(null);

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) return fail(null, error.message);
    return ok((data as Profile | null) ?? null);
  } catch (err) {
    return fail(null, err);
  }
}

/**
 * Met a jour les champs editables du profil.
 * total_xp et level sont volontairement absents : ils sont verrouilles par un
 * trigger cote base et ne bougent que via submitGame().
 */
export async function updateProfile(
  userId: string,
  patch: Partial<Pick<Profile, "username" | "profile_photo_url" | "avatar_default">>,
): Promise<Result<Profile | null>> {
  const supabase = createClient();
  if (!supabase) return ok(null);

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select()
      .maybeSingle();

    if (error) {
      // 23505 = violation d'unicite : le pseudo est deja pris.
      if (error.code === "23505") return fail(null, "Ce pseudo est deja pris.");
      return fail(null, error.message);
    }
    return ok((data as Profile | null) ?? null);
  } catch (err) {
    return fail(null, err);
  }
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return true;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (error) return true;
    return data === null;
  } catch {
    return true;
  }
}

// ------------------------------------------------------------------ parties

/**
 * Enregistre une partie terminee.
 *
 * L'XP est calcule par la base (fonction calc_xp) et non par le client : un
 * joueur ne peut donc pas s'attribuer un gain arbitraire en bidouillant la
 * requete. Le retour contient tout ce qu'il faut pour l'ecran de fin de partie
 * (XP gagne, niveau, rang avant/apres).
 */
export async function submitGame(game: GameSubmission): Promise<Result<GameSubmitResult | null>> {
  const supabase = createClient();
  if (!supabase) return ok(null);

  try {
    const { data, error } = await supabase.rpc("submit_game", {
      p_mode: game.mode,
      p_score: Math.max(0, Math.round(game.score)),
      p_correct: Math.max(0, Math.round(game.correctAnswers)),
      p_total: Math.max(1, Math.round(game.totalQuestions)),
      p_streak: Math.max(0, Math.round(game.longestStreak)),
      p_avg_time: Math.max(0, game.avgTimePerQuestion),
      p_difficulty: game.difficulty,
    });

    if (error) {
      if (error.message.includes("not_authenticated")) {
        return fail(null, "Connecte-toi pour enregistrer ta partie.");
      }
      return fail(null, error.message);
    }
    return ok((data as GameSubmitResult | null) ?? null);
  } catch (err) {
    return fail(null, err);
  }
}

export async function fetchRecentGames(userId: string, limit = 10): Promise<Result<GameRecord[]>> {
  const supabase = createClient();
  if (!supabase) return ok([]);

  try {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .eq("user_id", userId)
      .order("played_at", { ascending: false })
      .limit(limit);

    if (error) return fail([], error.message);
    return ok((data as GameRecord[]) ?? []);
  } catch (err) {
    return fail([], err);
  }
}

/** Stats cumulees pour l'en-tete du profil. */
export async function fetchProfileStats(userId: string): Promise<Result<ProfileStats | null>> {
  const supabase = createClient();
  if (!supabase) return ok(null);

  try {
    const [profileRes, aggRes] = await Promise.all([
      supabase.from("profiles").select("total_xp, level").eq("id", userId).maybeSingle(),
      supabase
        .from("games")
        .select("score, correct_answers, total_questions, longest_streak")
        .eq("user_id", userId),
    ]);

    if (profileRes.error) return fail(null, profileRes.error.message);
    if (aggRes.error) return fail(null, aggRes.error.message);

    const profile = profileRes.data as { total_xp: number; level: number } | null;
    if (!profile) return ok(null);

    const games = (aggRes.data ?? []) as Array<{
      score: number;
      correct_answers: number;
      total_questions: number;
      longest_streak: number;
    }>;

    let bestScore = 0;
    let bestStreak = 0;
    let correct = 0;
    let asked = 0;

    for (const g of games) {
      if (g.score > bestScore) bestScore = g.score;
      if (g.longest_streak > bestStreak) bestStreak = g.longest_streak;
      correct += g.correct_answers;
      asked += g.total_questions;
    }

    return ok({
      totalXp: profile.total_xp,
      level: profile.level,
      gamesPlayed: games.length,
      bestScore,
      bestStreak,
      winRate: asked > 0 ? correct / asked : 0,
    });
  } catch (err) {
    return fail(null, err);
  }
}

// ------------------------------------------------------------- classements

export async function fetchLeaderboardAllTime(
  limit = 1000,
): Promise<Result<LeaderboardEntryAllTime[]>> {
  const supabase = createClient();
  if (!supabase) return ok([]);

  try {
    const { data, error } = await supabase.rpc("get_leaderboard_alltime", { p_limit: limit });
    if (error) return fail([], error.message);
    return ok((data as LeaderboardEntryAllTime[]) ?? []);
  } catch (err) {
    return fail([], err);
  }
}

/** `week` au format ISO `2026-W32`. null = semaine en cours. */
export async function fetchLeaderboardWeekly(
  week: string | null = null,
  limit = 1000,
): Promise<Result<LeaderboardEntryWeekly[]>> {
  const supabase = createClient();
  if (!supabase) return ok([]);

  try {
    const { data, error } = await supabase.rpc("get_leaderboard_weekly", {
      p_week: week,
      p_limit: limit,
    });
    if (error) return fail([], error.message);
    return ok((data as LeaderboardEntryWeekly[]) ?? []);
  } catch (err) {
    return fail([], err);
  }
}

export async function fetchAvailableWeeks(): Promise<Result<AvailableWeek[]>> {
  const supabase = createClient();
  if (!supabase) return ok([]);

  try {
    const { data, error } = await supabase.rpc("get_available_weeks");
    if (error) return fail([], error.message);
    return ok((data as AvailableWeek[]) ?? []);
  } catch (err) {
    return fail([], err);
  }
}

export async function fetchMyRanks(): Promise<Result<MyRanks | null>> {
  const supabase = createClient();
  if (!supabase) return ok(null);

  try {
    const { data, error } = await supabase.rpc("get_my_ranks");
    if (error) return fail(null, error.message);
    return ok((data as MyRanks | null) ?? null);
  } catch (err) {
    return fail(null, err);
  }
}

// ---------------------------------------------------------------- semaines

/** Semaine ISO courante, meme format que iso_week() cote base : `2026-W32`. */
export function currentIsoWeek(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // Jeudi de la semaine courante : determine l'annee ISO.
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** `2026-W32` -> `Semaine 32 (3 - 9 aout)`, pour le selecteur d'historique. */
export function formatWeekLabel(week: string): string {
  const match = /^(\d{4})-W(\d{2})$/.exec(week);
  if (!match) return week;

  const year = Number(match[1]);
  const num = Number(match[2]);

  // Lundi de la semaine ISO demandee.
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (num - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
  return `Semaine ${num} (${fmt.format(monday)} - ${fmt.format(sunday)})`;
}
