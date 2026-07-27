export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
      }
    }
  }
  return dp[m][n];
}

function isSimilarEnough(input: string, target: string): boolean {
  const distance = levenshteinDistance(input, target);
  const maxLength = Math.max(input.length, target.length);
  const similarity = (maxLength - distance) / maxLength;
  return similarity >= 0.8;
}

export function isAnswerMatch(input: string, validAnswers: string[]): boolean {
  const normalizedInput = normalizeAnswer(input);
  if (!normalizedInput) return false;

  const inputWords = normalizedInput.split(" ");

  for (const answer of validAnswers) {
    const normalizedAnswer = normalizeAnswer(answer);
    const answerWords = normalizedAnswer.split(" ");

    if (normalizedAnswer === normalizedInput) return true;

    if (inputWords.length === 1) {
      const inputWord = inputWords[0];
      for (const answerWord of answerWords) {
        if (answerWord === inputWord) return true;
        if (isSimilarEnough(inputWord, answerWord)) return true;
      }
    }

    if (isSimilarEnough(normalizedInput, normalizedAnswer)) return true;
  }

  return false;
}
