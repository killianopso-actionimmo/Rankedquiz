import { useCallback } from "react";
import { evaluateBadges, GameSessionData } from "@/lib/badgeEvaluator";

/**
 * Hook to evaluate badges after a game session
 * Usage:
 * const evaluateBadgesForGame = useBadgeEvaluation();
 *
 * // After game ends:
 * evaluateBadgesForGame({
 *   mode: "ranked",
 *   totalQuestions: 10,
 *   correctAnswers: 10,
 *   consecutiveCorrect: 10,
 *   responseTime: [1.2, 1.5, 0.8, ...],
 * });
 */
export function useBadgeEvaluation() {
  return useCallback((data: GameSessionData) => {
    return evaluateBadges(data);
  }, []);
}
