import type { GameModeId, QcmQuestion } from "@/types/quiz";

export class QuestionSessionManager {
  private usedQuestionIds: Set<string>;
  private readonly sessionQuestionPool: QcmQuestion[];

  constructor(questions: QcmQuestion[]) {
    this.usedQuestionIds = new Set();
    this.sessionQuestionPool = [...questions];
  }

  getNextQuestion(): QcmQuestion | null {
    const available = this.sessionQuestionPool.filter(
      (q) => !this.usedQuestionIds.has(q.id)
    );

    if (available.length === 0) {
      this.usedQuestionIds.clear();
      return this.sessionQuestionPool[0] || null;
    }

    const question = available[Math.floor(Math.random() * available.length)];
    this.usedQuestionIds.add(question.id);
    return question;
  }

  reset() {
    this.usedQuestionIds.clear();
  }

  getPoolSize(): number {
    return this.sessionQuestionPool.length;
  }
}

export function filterQuestionsByMode(
  questions: QcmQuestion[],
  mode: GameModeId
): QcmQuestion[] {
  return questions.filter((q) => q.allowedModes.includes(mode));
}

export function distributeByDifficulty(
  questions: QcmQuestion[]
): {
  easy: QcmQuestion[];
  medium: QcmQuestion[];
  hard: QcmQuestion[];
} {
  return {
    easy: questions.filter((q) => q.difficulty === 1),
    medium: questions.filter((q) => q.difficulty === 2),
    hard: questions.filter((q) => q.difficulty === 3),
  };
}

export function buildBalancedPool(
  questions: QcmQuestion[],
  easyRatio: number = 0.35,
  mediumRatio: number = 0.4,
  hardRatio: number = 0.25
): QcmQuestion[] {
  const difficulty = distributeByDifficulty(questions);
  const result: QcmQuestion[] = [];

  const easyCount = Math.floor(questions.length * easyRatio);
  const mediumCount = Math.floor(questions.length * mediumRatio);
  const hardCount = Math.floor(questions.length * hardRatio);

  result.push(
    ...difficulty.easy.slice(0, easyCount),
    ...difficulty.medium.slice(0, mediumCount),
    ...difficulty.hard.slice(0, hardCount)
  );

  return result;
}
