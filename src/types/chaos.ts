/**
 * QUIZ CHAOS — party game social 2-8 joueurs.
 *
 * Deux surfaces :
 *   - l'ecran central (TV / ordi) : affichage pur, zero interaction
 *   - l'ecran joueur (mobile)     : celui dont c'est le tour pilote le rythme
 *
 * L'etat de la partie est detenu par l'hote (l'onglet qui a cree le salon) et
 * rediffuse a tous via `chaosRoom`. Les joueurs n'envoient que des intentions.
 */

/** Deck de questions : escalade lente (etrangers) ou brutale (groupe connu). */
export type ChaosDeck = "discover" | "chaos";

/** 5 rounds de 10 questions, l'intensite monte a chaque round. */
export type ChaosRoundId = 1 | 2 | 3 | 4 | 5;

export interface ChaosQuestion {
  id: string;
  text: string;
  round: ChaosRoundId;
  /** Question ajoutee par le groupe pendant la partie (reste privee au salon). */
  custom?: boolean;
  /** Nom de l'auteur, pour les questions custom. */
  author?: string;
}

/**
 * Avatar serialise :
 *   "av:7"        -> avatar generique n°7 (voir CHAOS_AVATARS)
 *   "img:data:…"  -> selfie compresse en dataURL JPEG
 */
export type ChaosAvatar = string;

export interface ChaosPlayer {
  id: string;
  name: string;
  avatar: ChaosAvatar;
  joinedAt: number;
}

export type ChaosPhase = "lobby" | "playing" | "finished";

/** Etat complet de la partie. C'est ce que l'hote broadcast a chaque changement. */
export interface ChaosState {
  code: string;
  deck: ChaosDeck;
  phase: ChaosPhase;
  players: ChaosPlayer[];
  /** Ordre de passage (ids joueurs), melange au START. */
  order: string[];
  /** Index de la question courante dans `queue`. */
  index: number;
  queue: ChaosQuestion[];
  /** Sanctions alcool activees. */
  drinks: boolean;
  /** Gorgees tirees pour la question courante (1-5), null si `drinks` off. */
  sips: number | null;
  updatedAt: number;
}

/* ------------------------------------------------------------------ MESSAGES */

/** Hote -> tout le monde : la verite. */
export interface ChaosStateMessage {
  t: "state";
  state: ChaosState;
}

/** Joueur -> hote : je rejoins (ou je me reconnecte avec le meme id). */
export interface ChaosJoinMessage {
  t: "join";
  player: ChaosPlayer;
}

/** Joueur -> hote : j'ai fini de poser ma question. */
export interface ChaosNextMessage {
  t: "next";
  playerId: string;
}

/** Joueur -> hote : ajoute cette question a la fin de la file. */
export interface ChaosAddQuestionMessage {
  t: "add";
  text: string;
  author: string;
}

/** Joueur -> hote : donne-moi l'etat courant (arrivee / reconnexion). */
export interface ChaosHelloMessage {
  t: "hello";
}

export type ChaosMessage =
  | ChaosStateMessage
  | ChaosJoinMessage
  | ChaosNextMessage
  | ChaosAddQuestionMessage
  | ChaosHelloMessage;

/* ------------------------------------------------------------------ HELPERS */

export const CHAOS_QUESTIONS_PER_ROUND = 10;
export const CHAOS_MAX_PLAYERS = 8;
export const CHAOS_MIN_PLAYERS = 2;

/** Round courant (1-5) deduit de l'index. Les questions custom restent en 5. */
export function chaosRoundOf(state: ChaosState): ChaosRoundId {
  return state.queue[state.index]?.round ?? 5;
}

/** Position dans le round, 1-based. */
export function chaosPositionInRound(state: ChaosState): number {
  return (state.index % CHAOS_QUESTIONS_PER_ROUND) + 1;
}

/** Joueur dont c'est le tour de poser. */
export function chaosAsker(state: ChaosState): ChaosPlayer | null {
  if (state.order.length === 0) return null;
  const id = state.order[state.index % state.order.length];
  return state.players.find((p) => p.id === id) ?? null;
}
