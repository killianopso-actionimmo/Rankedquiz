import { unlockBadge, isBadgeUnlocked, getUnlockedBadgesCount } from "@/lib/badgeStorage";
import { addBadgeNotification } from "@/components/BadgeUnlockedToast";

export interface GameSessionData {
  mode: string;
  difficulty?: number;
  isRandom?: boolean;
  totalQuestions: number;
  correctAnswers: number;
  consecutiveCorrect: number;
  responseTime?: number[]; // array of response times in seconds
  firstQuestionCorrect?: boolean;
  lastQuestionResponseTime?: number;
  endTime?: number;
  dailyStreak?: number;
  totalGamesPlayed?: number;
  currentLevel?: number;
  accuracyPercentage?: number;
  precisionBonusCount?: number;
  // New fields for extended badges
  win?: boolean; // Ranked/Duel win
  winMargin?: number; // Win score difference
  recentQuizzesIds?: string[]; // Last 3 quiz IDs
  currentQuizId?: string; // Current quiz ID
  consecutivePerfectGames?: number; // Count of perfect games in a row
  recentWins?: number; // Count of recent consecutive wins
  timeAttackTotalTime?: number; // Total time in seconds for time-attack
  jetpunkTimeUsedPercentage?: number; // Percentage of time used (0-100)
  totalXp?: number; // Total cumulative XP
  modesWithWins?: Set<string>; // Modes where user has won
  leaderboardRank?: number; // Current leaderboard rank
  quitAfterErrors?: boolean; // Did user quit after 3 errors
  isLastQuestion?: boolean; // Is this the last question
  categoryId?: string; // Current category ID
}

export function evaluateBadges(data: GameSessionData): string[] {
  const unlockedBadges: string[] = [];

  // PREMIERE ETINCELLE - First correct answer (triggered elsewhere, but here for completeness)
  // This should be triggered on first ever game first correct answer

  // SANS FAUTE - 100% accuracy
  if (
    data.correctAnswers === data.totalQuestions &&
    data.totalQuestions > 0 &&
    !isBadgeUnlocked("sans_faute")
  ) {
    unlockBadge("sans_faute");
    addBadgeNotification("sans_faute");
    unlockedBadges.push("sans_faute");
  }

  // ECLAIR DE GENIE - Answer correctly in less than 2 seconds
  if (data.responseTime && data.responseTime.some((time) => time < 2)) {
    if (!isBadgeUnlocked("eclair_de_genie")) {
      unlockBadge("eclair_de_genie");
      addBadgeNotification("eclair_de_genie");
      unlockedBadges.push("eclair_de_genie");
    }
  }

  // SANS HESITATION - 5 consecutive correct answers in < 3 seconds each
  if (data.responseTime) {
    const hasValidStreak = checkConsecutiveQuickAnswers(data.responseTime, 5, 3);
    if (hasValidStreak && !isBadgeUnlocked("sans_hesitation")) {
      unlockBadge("sans_hesitation");
      addBadgeNotification("sans_hesitation");
      unlockedBadges.push("sans_hesitation");
    }
  }

  // LINTOUCHABLE - 15 consecutive correct answers
  if (
    data.consecutiveCorrect >= 15 &&
    !isBadgeUnlocked("lintouchable")
  ) {
    unlockBadge("lintouchable");
    addBadgeNotification("lintouchable");
    unlockedBadges.push("lintouchable");
  }

  // MAITRE EXTREME - Perfect game in extreme difficulty
  if (
    data.difficulty === 3 &&
    data.correctAnswers === data.totalQuestions &&
    data.totalQuestions > 0 &&
    !isBadgeUnlocked("maitre_extreme")
  ) {
    unlockBadge("maitre_extreme");
    addBadgeNotification("maitre_extreme");
    unlockedBadges.push("maitre_extreme");
  }

  // BOURREAU DU RANDOM - Win random mode
  if (
    data.isRandom &&
    data.correctAnswers === data.totalQuestions &&
    data.totalQuestions > 0 &&
    !isBadgeUnlocked("bourreau_du_random")
  ) {
    unlockBadge("bourreau_du_random");
    addBadgeNotification("bourreau_du_random");
    unlockedBadges.push("bourreau_du_random");
  }

  // COUP DE CHAUD - 90%+ accuracy bonus (tracked separately, count >= 5)
  if (
    data.accuracyPercentage &&
    data.accuracyPercentage >= 90 &&
    data.precisionBonusCount &&
    data.precisionBonusCount >= 5 &&
    !isBadgeUnlocked("coup_de_chaud")
  ) {
    unlockBadge("coup_de_chaud");
    addBadgeNotification("coup_de_chaud");
    unlockedBadges.push("coup_de_chaud");
  }

  // ASCENSION_I - Level 5
  if (
    data.currentLevel &&
    data.currentLevel >= 5 &&
    !isBadgeUnlocked("ascension_i")
  ) {
    unlockBadge("ascension_i");
    addBadgeNotification("ascension_i");
    unlockedBadges.push("ascension_i");
  }

  // ASCENSION_II - Level 20
  if (
    data.currentLevel &&
    data.currentLevel >= 20 &&
    !isBadgeUnlocked("ascension_ii")
  ) {
    unlockBadge("ascension_ii");
    addBadgeNotification("ascension_ii");
    unlockedBadges.push("ascension_ii");
  }

  // FIDELE AU POSTE - Daily streak 3
  if (
    data.dailyStreak &&
    data.dailyStreak >= 3 &&
    !isBadgeUnlocked("fidele_au_poste")
  ) {
    unlockBadge("fidele_au_poste");
    addBadgeNotification("fidele_au_poste");
    unlockedBadges.push("fidele_au_poste");
  }

  // MARATHONIEN - Daily streak 7
  if (
    data.dailyStreak &&
    data.dailyStreak >= 7 &&
    !isBadgeUnlocked("marathonien")
  ) {
    unlockBadge("marathonien");
    addBadgeNotification("marathonien");
    unlockedBadges.push("marathonien");
  }

  // LOUP SOLITAIRE - 50+ games played
  if (
    data.totalGamesPlayed &&
    data.totalGamesPlayed >= 50 &&
    !isBadgeUnlocked("loup_solitaire")
  ) {
    unlockBadge("loup_solitaire");
    addBadgeNotification("loup_solitaire");
    unlockedBadges.push("loup_solitaire");
  }

  // DERNIERE SECONDE (HIDDEN) - Less than 1 second remaining on timer
  if (
    data.lastQuestionResponseTime &&
    data.lastQuestionResponseTime < 1 &&
    !isBadgeUnlocked("derniere_seconde")
  ) {
    unlockBadge("derniere_seconde");
    addBadgeNotification("derniere_seconde");
    unlockedBadges.push("derniere_seconde");
  }

  // COMEDIEN (HIDDEN) - First answer wrong, all others correct
  if (
    data.firstQuestionCorrect === false &&
    data.correctAnswers === data.totalQuestions - 1 &&
    data.totalQuestions > 1 &&
    !isBadgeUnlocked("comedien")
  ) {
    unlockBadge("comedien");
    addBadgeNotification("comedien");
    unlockedBadges.push("comedien");
  }

  // OISEAU DE NUIT (HIDDEN) - Game ended between midnight and 5am
  if (data.endTime && !isBadgeUnlocked("oiseau_de_nuit")) {
    const hour = new Date(data.endTime).getHours();
    if (hour >= 0 && hour < 5) {
      unlockBadge("oiseau_de_nuit");
      addBadgeNotification("oiseau_de_nuit");
      unlockedBadges.push("oiseau_de_nuit");
    }
  }

  // SANG FROID - 10 consecutive quick answers (< 3 sec each)
  if (data.responseTime) {
    const hasValidStreak = checkConsecutiveQuickAnswers(data.responseTime, 10, 3);
    if (hasValidStreak && !isBadgeUnlocked("sang_froid")) {
      unlockBadge("sang_froid");
      addBadgeNotification("sang_froid");
      unlockedBadges.push("sang_froid");
    }
  }

  // MAITRE DU VRAI/FAUX - 5 consecutive perfect games
  if (
    data.consecutivePerfectGames &&
    data.consecutivePerfectGames >= 5 &&
    !isBadgeUnlocked("maitre_vrai_faux")
  ) {
    unlockBadge("maitre_vrai_faux");
    addBadgeNotification("maitre_vrai_faux");
    unlockedBadges.push("maitre_vrai_faux");
  }

  // SNIPER - 100% accuracy on 20+ questions
  if (
    data.correctAnswers === data.totalQuestions &&
    data.totalQuestions >= 20 &&
    !isBadgeUnlocked("sniper")
  ) {
    unlockBadge("sniper");
    addBadgeNotification("sniper");
    unlockedBadges.push("sniper");
  }

  // SURFIL - Win with exactly 1 point difference
  if (
    data.win &&
    data.winMargin === 1 &&
    !isBadgeUnlocked("surfil")
  ) {
    unlockBadge("surfil");
    addBadgeNotification("surfil");
    unlockedBadges.push("surfil");
  }

  // ASCENSION_III - Level 35
  if (
    data.currentLevel &&
    data.currentLevel >= 35 &&
    !isBadgeUnlocked("ascension_iii")
  ) {
    unlockBadge("ascension_iii");
    addBadgeNotification("ascension_iii");
    unlockedBadges.push("ascension_iii");
  }

  // LEGENDE VIVANTE - Level 50
  if (
    data.currentLevel &&
    data.currentLevel >= 50 &&
    !isBadgeUnlocked("legende_vivante")
  ) {
    unlockBadge("legende_vivante");
    addBadgeNotification("legende_vivante");
    unlockedBadges.push("legende_vivante");
  }

  // COLLECTIONNEUR XP - 10000 total XP
  if (
    data.totalXp &&
    data.totalXp >= 10000 &&
    !isBadgeUnlocked("collectionneur_xp")
  ) {
    unlockBadge("collectionneur_xp");
    addBadgeNotification("collectionneur_xp");
    unlockedBadges.push("collectionneur_xp");
  }

  // BANQUIER - 50000 total XP
  if (
    data.totalXp &&
    data.totalXp >= 50000 &&
    !isBadgeUnlocked("banquier")
  ) {
    unlockBadge("banquier");
    addBadgeNotification("banquier");
    unlockedBadges.push("banquier");
  }

  // POLYVALENT - Win in all modes
  if (
    data.modesWithWins &&
    data.modesWithWins.size >= 6 &&
    !isBadgeUnlocked("polyvalent")
  ) {
    unlockBadge("polyvalent");
    addBadgeNotification("polyvalent");
    unlockedBadges.push("polyvalent");
  }

  // PREMIER SANG - First ranked/duel win
  if (
    data.win &&
    (data.mode === "ranked" || data.mode === "duel") &&
    !isBadgeUnlocked("premier_sang")
  ) {
    unlockBadge("premier_sang");
    addBadgeNotification("premier_sang");
    unlockedBadges.push("premier_sang");
  }

  // GLADIATEUR - 5 consecutive wins in ranked
  if (
    data.mode === "ranked" &&
    data.recentWins &&
    data.recentWins >= 5 &&
    !isBadgeUnlocked("gladiateur")
  ) {
    unlockBadge("gladiateur");
    addBadgeNotification("gladiateur");
    unlockedBadges.push("gladiateur");
  }

  // TUEUR DE BOTS - Beat bot on hard/legend
  if (
    data.mode === "duel" &&
    data.win &&
    data.difficulty && data.difficulty >= 2 &&
    !isBadgeUnlocked("tueur_de_bots")
  ) {
    unlockBadge("tueur_de_bots");
    addBadgeNotification("tueur_de_bots");
    unlockedBadges.push("tueur_de_bots");
  }

  // INDETRONABLE - Top 3 leaderboard
  if (
    data.leaderboardRank &&
    data.leaderboardRank <= 3 &&
    !isBadgeUnlocked("indetronable")
  ) {
    unlockBadge("indetronable");
    addBadgeNotification("indetronable");
    unlockedBadges.push("indetronable");
  }

  // TGV - 20 questions in < 30 seconds total (time-attack)
  if (
    data.mode === "time-attack" &&
    data.totalQuestions >= 20 &&
    data.timeAttackTotalTime &&
    data.timeAttackTotalTime < 30 &&
    !isBadgeUnlocked("tgv")
  ) {
    unlockBadge("tgv");
    addBadgeNotification("tgv");
    unlockedBadges.push("tgv");
  }

  // INCOLLABLE THEMATIQUE - Complete all questions in a category
  if (
    data.mode === "thematique" &&
    data.correctAnswers === data.totalQuestions &&
    data.totalQuestions > 0 &&
    !isBadgeUnlocked("incollable_thematique")
  ) {
    unlockBadge("incollable_thematique");
    addBadgeNotification("incollable_thematique");
    unlockedBadges.push("incollable_thematique");
  }

  // MAITRE JETPUNK - Complete 100% before halfway
  if (
    data.mode === "jetpunk" &&
    data.correctAnswers === data.totalQuestions &&
    data.jetpunkTimeUsedPercentage &&
    data.jetpunkTimeUsedPercentage <= 50 &&
    !isBadgeUnlocked("maitre_jetpunk")
  ) {
    unlockBadge("maitre_jetpunk");
    addBadgeNotification("maitre_jetpunk");
    unlockedBadges.push("maitre_jetpunk");
  }

  // LE RITUEL - Daily streak 14
  if (
    data.dailyStreak &&
    data.dailyStreak >= 14 &&
    !isBadgeUnlocked("le_rituel")
  ) {
    unlockBadge("le_rituel");
    addBadgeNotification("le_rituel");
    unlockedBadges.push("le_rituel");
  }

  // TETU (HIDDEN) - Replay same quiz 3 times in a row
  if (
    data.recentQuizzesIds &&
    data.currentQuizId &&
    data.recentQuizzesIds.length >= 3 &&
    data.recentQuizzesIds[data.recentQuizzesIds.length - 1] === data.currentQuizId &&
    data.recentQuizzesIds[data.recentQuizzesIds.length - 2] === data.currentQuizId &&
    data.recentQuizzesIds[data.recentQuizzesIds.length - 3] === data.currentQuizId &&
    !isBadgeUnlocked("tetu")
  ) {
    unlockBadge("tetu");
    addBadgeNotification("tetu");
    unlockedBadges.push("tetu");
  }

  // HEURE DU CAFE (HIDDEN) - Game ended between 6am and 8am
  if (data.endTime && !isBadgeUnlocked("heure_du_cafe")) {
    const hour = new Date(data.endTime).getHours();
    if (hour >= 6 && hour < 8) {
      unlockBadge("heure_du_cafe");
      addBadgeNotification("heure_du_cafe");
      unlockedBadges.push("heure_du_cafe");
    }
  }

  // RAGE QUIT (HIDDEN) - Quit after 3 errors in a row
  if (
    data.quitAfterErrors &&
    !isBadgeUnlocked("rage_quit")
  ) {
    unlockBadge("rage_quit");
    addBadgeNotification("rage_quit");
    unlockedBadges.push("rage_quit");
  }

  // CAMBRIOLEUR (HIDDEN) - Correct answer at last second of last question
  if (
    data.isLastQuestion &&
    data.lastQuestionResponseTime &&
    data.lastQuestionResponseTime < 1 &&
    data.firstQuestionCorrect === undefined &&
    !isBadgeUnlocked("cambrioleur")
  ) {
    unlockBadge("cambrioleur");
    addBadgeNotification("cambrioleur");
    unlockedBadges.push("cambrioleur");
  }

  return unlockedBadges;
}

// EXPLORATEUR - Try all game modes (needs to be tracked across sessions)
export function checkModeExplorerBadge(modesPlayed: Set<string>) {
  const requiredModes = new Set([
    "time-attack",
    "jetpunk",
    "ranked",
    "thematique",
    "duel",
    "daily",
  ]);
  if (
    requiredModes.size > 0 &&
    Array.from(requiredModes).every((mode) => modesPlayed.has(mode))
  ) {
    if (!isBadgeUnlocked("explorateur")) {
      unlockBadge("explorateur");
      addBadgeNotification("explorateur");
      return true;
    }
  }
  return false;
}

// PREMIERE ETINCELLE - First ever correct answer
export function unlockFirstCorrectAnswer() {
  if (!isBadgeUnlocked("premiere_etincelle")) {
    unlockBadge("premiere_etincelle");
    addBadgeNotification("premiere_etincelle");
    return true;
  }
  return false;
}

// NOUVEAU LOOK - Profile customization (to be integrated with profile feature)
export function unlockNewLook() {
  if (!isBadgeUnlocked("nouveau_look")) {
    unlockBadge("nouveau_look");
    addBadgeNotification("nouveau_look");
    return true;
  }
  return false;
}

function checkConsecutiveQuickAnswers(
  responseTimes: number[],
  consecutiveCount: number,
  maxTimePerAnswer: number
): boolean {
  if (responseTimes.length < consecutiveCount) return false;

  for (let i = 0; i <= responseTimes.length - consecutiveCount; i++) {
    const streak = responseTimes.slice(i, i + consecutiveCount);
    if (streak.every((time) => time <= maxTimePerAnswer)) {
      return true;
    }
  }

  return false;
}

// META-BADGE: PERFECTIONNISTE - Auto-triggers when 30 badges are unlocked
export function checkPerfectionnisteBadge(): boolean {
  const unlockedCount = getUnlockedBadgesCount();

  if (
    unlockedCount >= 30 &&
    !isBadgeUnlocked("perfectionniste")
  ) {
    unlockBadge("perfectionniste");
    addBadgeNotification("perfectionniste");
    return true;
  }
  return false;
}

// META-BADGE: LE COMPLETISTE - Auto-triggers when 39/40 badges are unlocked
export function checkCompletisBadge(): boolean {
  const unlockedCount = getUnlockedBadgesCount();
  const totalBadges = 41; // Total badges including these meta badges

  if (
    unlockedCount >= totalBadges - 1 &&
    !isBadgeUnlocked("le_completiste")
  ) {
    unlockBadge("le_completiste");
    addBadgeNotification("le_completiste");
    return true;
  }
  return false;
}

// Call this function whenever badges are unlocked to check meta badges
export function evaluateMetaBadges(): string[] {
  const unlockedMeta: string[] = [];

  if (checkPerfectionnisteBadge()) {
    unlockedMeta.push("perfectionniste");
  }

  if (checkCompletisBadge()) {
    unlockedMeta.push("le_completiste");
  }

  return unlockedMeta;
}
