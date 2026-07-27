const K_FACTOR = 32;

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function computeEloDelta(
  playerElo: number,
  opponentElo: number,
  didWin: boolean,
  kFactor: number = K_FACTOR
): number {
  const expected = expectedScore(playerElo, opponentElo);
  const actual = didWin ? 1 : 0;
  return Math.round(kFactor * (actual - expected));
}

export function computeQuizEloDelta(
  playerElo: number,
  correctAnswers: number,
  totalQuestions: number,
  kFactor: number = K_FACTOR
): number {
  const virtualOpponentElo = playerElo;
  const accuracy = totalQuestions === 0 ? 0 : correctAnswers / totalQuestions;
  const expected = expectedScore(playerElo, virtualOpponentElo);
  return Math.round(kFactor * (accuracy - expected) * 2);
}
