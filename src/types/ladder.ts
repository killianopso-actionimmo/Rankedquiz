import type { GameModeId } from "./quiz";

export interface GameResult {
  id: string;
  playerId: string;
  playerName: string;
  score: number;
  mode: GameModeId;
  timestamp: number;
  category?: string;
  roundId?: string;
  timeTaken?: number;
  isCompleted?: boolean;
}

export interface GrilleResult {
  playerId: string;
  playerName: string;
  score: number;
  timeTaken: number;
  isCompleted: boolean;
  timestamp: number;
}

export interface GrilleLeaderboard {
  roundId: string;
  results: GrilleResult[];
}

export interface LadderEntry {
  rank: number;
  playerId: string;
  playerName: string;
  totalScore: number;
  gameCount: number;
  averageScore: number;
  modes?: { [key in GameModeId]?: number };
}

export interface ModeLadder {
  mode: GameModeId;
  entries: LadderEntry[];
  lastUpdated: number;
}

export interface GlobalLadder {
  entries: LadderEntry[];
  lastUpdated: number;
}
