import { useSyncExternalStore } from "react";

const PLAYER_NAME_KEY = "rq_player_name";
const DEFAULT_PLAYER_NAME = "Joueur";
const PLAYER_SUBSCRIBERS = new Set<() => void>();

function getStoredPlayerName(): string {
  if (typeof window === "undefined") return DEFAULT_PLAYER_NAME;
  return window.localStorage.getItem(PLAYER_NAME_KEY) || DEFAULT_PLAYER_NAME;
}

function setStoredPlayerName(name: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLAYER_NAME_KEY, name);
  PLAYER_SUBSCRIBERS.forEach((cb) => cb());
}

function subscribe(callback: () => void) {
  PLAYER_SUBSCRIBERS.add(callback);
  return () => PLAYER_SUBSCRIBERS.delete(callback);
}

function getSnapshot(): string {
  return getStoredPlayerName();
}

function getServerSnapshot(): string {
  return DEFAULT_PLAYER_NAME;
}

export function usePlayerName(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setPlayerName(name: string) {
  setStoredPlayerName(name);
}

export function getPlayerName(): string {
  return getStoredPlayerName();
}
