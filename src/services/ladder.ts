import { useSyncExternalStore } from "react";
import type { GameResult, LadderEntry, ModeLadder, GlobalLadder, GrilleLeaderboard, GrilleResult } from "@/types/ladder";
import type { GameModeId } from "@/types/quiz";

const RESULTS_KEY = "rq_game_results";
const LADDER_SUBSCRIBERS = new Set<() => void>();

let cachedResults: GameResult[] | null = null;
let cachedGlobalLadder: GlobalLadder | null = null;
const cachedModeLadders = new Map<GameModeId, ModeLadder>();
const emptyModeLadders: { [key in GameModeId]: ModeLadder } = {
  "time-attack": { mode: "time-attack", entries: [], lastUpdated: 0 },
  jetpunk: { mode: "jetpunk", entries: [], lastUpdated: 0 },
  ranked: { mode: "ranked", entries: [], lastUpdated: 0 },
  thematique: { mode: "thematique", entries: [], lastUpdated: 0 },
  duel: { mode: "duel", entries: [], lastUpdated: 0 },
};

function getStoredResults(): GameResult[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(RESULTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function setStoredResults(results: GameResult[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  cachedResults = null;
  cachedGlobalLadder = null;
  cachedModeLadders.clear();
  LADDER_SUBSCRIBERS.forEach((cb) => cb());
}

export function addGameResult(
  playerId: string,
  playerName: string,
  score: number,
  mode: GameModeId,
  category?: string,
  roundId?: string,
  timeTaken?: number,
  isCompleted?: boolean
) {
  const results = getStoredResults();
  const newResult: GameResult = {
    id: `${Date.now()}_${Math.random()}`,
    playerId,
    playerName,
    score,
    mode,
    timestamp: Date.now(),
    category,
    roundId,
    timeTaken,
    isCompleted,
  };
  results.push(newResult);
  setStoredResults(results);
}

function computeLadderEntries(results: GameResult[]): LadderEntry[] {
  const byPlayer = new Map<string, GameResult[]>();

  results.forEach((result) => {
    if (!byPlayer.has(result.playerId)) {
      byPlayer.set(result.playerId, []);
    }
    byPlayer.get(result.playerId)!.push(result);
  });

  const entries: LadderEntry[] = Array.from(byPlayer.entries()).map(
    ([playerId, playerResults]) => {
      const totalScore = playerResults.reduce((sum, r) => sum + r.score, 0);
      const gameCount = playerResults.length;
      const averageScore = Math.round(totalScore / gameCount);

      const modes: { [key in GameModeId]?: number } = {};
      playerResults.forEach((result) => {
        if (!modes[result.mode]) modes[result.mode] = 0;
        modes[result.mode]! += result.score;
      });

      return {
        rank: 0,
        playerId,
        playerName: playerResults[0].playerName,
        totalScore,
        gameCount,
        averageScore,
        modes,
      };
    }
  );

  entries.sort((a, b) => b.totalScore - a.totalScore);
  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return entries;
}

const EMPTY_GLOBAL: GlobalLadder = { entries: [], lastUpdated: 0 };

function ensureCachedResults() {
  if (cachedResults === null) {
    cachedResults = getStoredResults();
  }
}

function getCachedGlobalSnapshot(): GlobalLadder {
  if (cachedGlobalLadder !== null) {
    return cachedGlobalLadder;
  }

  ensureCachedResults();
  const results = cachedResults!;

  if (results.length === 0) {
    cachedGlobalLadder = EMPTY_GLOBAL;
  } else {
    cachedGlobalLadder = {
      entries: computeLadderEntries(results),
      lastUpdated: 0,
    };
  }

  return cachedGlobalLadder;
}

export function getGlobalLadder(): GlobalLadder {
  return getCachedGlobalSnapshot();
}

function getCachedModeLadder(mode: GameModeId): ModeLadder {
  if (cachedModeLadders.has(mode)) {
    return cachedModeLadders.get(mode)!;
  }

  ensureCachedResults();
  const results = cachedResults!.filter((r) => r.mode === mode);

  let ladder: ModeLadder;
  if (results.length === 0) {
    ladder = emptyModeLadders[mode];
  } else {
    ladder = {
      mode,
      entries: computeLadderEntries(results),
      lastUpdated: 0,
    };
  }

  cachedModeLadders.set(mode, ladder);
  return ladder;
}

export function getModeLadder(mode: GameModeId): ModeLadder {
  return getCachedModeLadder(mode);
}

function subscribe(callback: () => void) {
  LADDER_SUBSCRIBERS.add(callback);
  return () => LADDER_SUBSCRIBERS.delete(callback);
}

export function useGlobalLadder(): GlobalLadder {
  return useSyncExternalStore(subscribe, getCachedGlobalSnapshot, () => EMPTY_GLOBAL);
}

export function useModeLadder(mode: GameModeId): ModeLadder {
  return useSyncExternalStore(
    subscribe,
    () => getCachedModeLadder(mode),
    () => emptyModeLadders[mode]
  );
}

export function getGrilleLeaderboard(roundId: string): GrilleResult[] {
  const results = getStoredResults();
  const grilleResults = results
    .filter((r) => r.roundId === roundId)
    .map((r) => ({
      playerId: r.playerId,
      playerName: r.playerName,
      score: r.score,
      timeTaken: r.timeTaken || 0,
      isCompleted: r.isCompleted || false,
      timestamp: r.timestamp,
    }))
    .sort((a, b) => {
      // Trier par : d'abord les grilles complétées, puis par temps (plus court = mieux)
      if (a.isCompleted !== b.isCompleted) {
        return b.isCompleted ? 1 : -1;
      }
      if (a.isCompleted) {
        // Les deux complétées : trier par temps croissant
        return a.timeTaken - b.timeTaken;
      }
      // Les deux non complétées : trier par score décroissant
      return b.score - a.score;
    });

  return grilleResults;
}

export function getPlayerGrilleStats(
  roundId: string,
  playerId: string
): { rank: number; stats: GrilleResult | null } {
  const leaderboard = getGrilleLeaderboard(roundId);
  const playerStats = leaderboard.find((r) => r.playerId === playerId);
  const rank = playerStats ? leaderboard.indexOf(playerStats) + 1 : -1;

  return {
    rank,
    stats: playerStats || null,
  };
}
