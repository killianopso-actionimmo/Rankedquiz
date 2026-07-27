import { useSyncExternalStore } from "react";

const ELO_KEY = "rq_elo";
const XP_KEY = "rq_xp";
export const DEFAULT_ELO = 1000;
export const DEFAULT_XP = 0;

function subscribeElo(callback: () => void) {
  window.addEventListener("rq-elo-change", callback);
  return () => window.removeEventListener("rq-elo-change", callback);
}

function subscribeXp(callback: () => void) {
  window.addEventListener("rq-xp-change", callback);
  return () => window.removeEventListener("rq-xp-change", callback);
}

function getEloSnapshot(): number {
  const raw = window.localStorage.getItem(ELO_KEY);
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : DEFAULT_ELO;
}

function getXpSnapshot(): number {
  const raw = window.localStorage.getItem(XP_KEY);
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : DEFAULT_XP;
}

function getEloServerSnapshot(): number {
  return DEFAULT_ELO;
}

function getXpServerSnapshot(): number {
  return DEFAULT_XP;
}

export function useStoredElo(): number {
  return useSyncExternalStore(subscribeElo, getEloSnapshot, getEloServerSnapshot);
}

export function useStoredXp(): number {
  return useSyncExternalStore(subscribeXp, getXpSnapshot, getXpServerSnapshot);
}

export function setStoredElo(value: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ELO_KEY, String(Math.max(0, value)));
  window.dispatchEvent(new Event("rq-elo-change"));
}

export function setStoredXp(value: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(XP_KEY, String(Math.max(0, value)));
  window.dispatchEvent(new Event("rq-xp-change"));
}

export function addStoredXp(amount: number) {
  const current = getXpSnapshot();
  setStoredXp(current + amount);
}
