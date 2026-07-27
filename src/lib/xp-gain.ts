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
