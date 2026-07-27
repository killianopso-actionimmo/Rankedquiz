import type { BotDifficulty } from "@/components/BotDifficultySelector";

export interface BotConfig {
  difficulty: BotDifficulty;
  reactionTimeMs: number;
  accuracy: number;
  name: string;
}

export function getBotConfig(difficulty: BotDifficulty): BotConfig {
  const configs: { [key in BotDifficulty]: BotConfig } = {
    easy: {
      difficulty: "easy",
      reactionTimeMs: 800 + Math.random() * 400,
      accuracy: 0.55,
      name: "Bot Facile",
    },
    medium: {
      difficulty: "medium",
      reactionTimeMs: 400 + Math.random() * 200,
      accuracy: 0.78,
      name: "Bot Moyen",
    },
    hard: {
      difficulty: "hard",
      reactionTimeMs: 150 + Math.random() * 100,
      accuracy: 0.92,
      name: "Bot Difficile",
    },
  };

  return configs[difficulty];
}

export function simulateBotAnswer(
  config: BotConfig,
  correctIndex: number,
  totalChoices: number
): { choiceIndex: number; isCorrect: boolean; delayMs: number } {
  const isCorrect = Math.random() < config.accuracy;
  const choiceIndex = isCorrect ? correctIndex : Math.floor(Math.random() * totalChoices);
  const delayMs = config.reactionTimeMs;

  return { choiceIndex, isCorrect, delayMs };
}
