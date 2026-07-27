import { useSyncExternalStore } from "react";
import { UnlockedBadge, BadgesState } from "@/types/badge";

const BADGES_KEY = "rq_badges";
const DEFAULT_BADGES: BadgesState = { unlocked: [] };

function subscribeBadges(callback: () => void) {
  window.addEventListener("rq-badges-change", callback);
  return () => window.removeEventListener("rq-badges-change", callback);
}

function getBadgesSnapshot(): BadgesState {
  if (typeof window === "undefined") return DEFAULT_BADGES;
  const raw = window.localStorage.getItem(BADGES_KEY);
  if (!raw) return DEFAULT_BADGES;
  try {
    return JSON.parse(raw) as BadgesState;
  } catch {
    return DEFAULT_BADGES;
  }
}

function getBadgesServerSnapshot(): BadgesState {
  return DEFAULT_BADGES;
}

export function useUnlockedBadges(): string[] {
  const state = useSyncExternalStore(
    subscribeBadges,
    getBadgesSnapshot,
    getBadgesServerSnapshot
  );
  return state.unlocked.map((b) => b.badgeId);
}

export function useAllBadgesState(): BadgesState {
  return useSyncExternalStore(
    subscribeBadges,
    getBadgesSnapshot,
    getBadgesServerSnapshot
  );
}

export function isBadgeUnlocked(badgeId: string): boolean {
  const state = getBadgesSnapshot();
  return state.unlocked.some((b) => b.badgeId === badgeId);
}

export function unlockBadge(badgeId: string): boolean {
  if (typeof window === "undefined") return false;

  const state = getBadgesSnapshot();
  const alreadyUnlocked = state.unlocked.some((b) => b.badgeId === badgeId);

  if (alreadyUnlocked) return false;

  const newUnlockedBadges: UnlockedBadge[] = [
    ...state.unlocked,
    { badgeId, unlockedAt: Date.now() },
  ];

  window.localStorage.setItem(
    BADGES_KEY,
    JSON.stringify({ unlocked: newUnlockedBadges })
  );
  window.dispatchEvent(new Event("rq-badges-change"));
  return true;
}

export function getUnlockedBadgeTimestamp(badgeId: string): number | null {
  const state = getBadgesSnapshot();
  const badge = state.unlocked.find((b) => b.badgeId === badgeId);
  return badge?.unlockedAt || null;
}

export function getUnlockedBadgesCount(): number {
  const state = getBadgesSnapshot();
  return state.unlocked.length;
}
