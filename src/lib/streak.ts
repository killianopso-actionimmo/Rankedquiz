import { useSyncExternalStore } from "react";

const STREAK_KEY = "rq_streak";
const EVENT = "rq-streak-change";

interface StreakRecord {
  lastCompletedDate: string | null;
  currentStreak: number;
  bestStreak: number;
}

export interface StreakSnapshot {
  streak: number;
  bestStreak: number;
  completedToday: boolean;
}

const DEFAULT_RECORD: StreakRecord = {
  lastCompletedDate: null,
  currentStreak: 0,
  bestStreak: 0,
};

const DEFAULT_SNAPSHOT: StreakSnapshot = {
  streak: 0,
  bestStreak: 0,
  completedToday: false,
};

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

function readRecord(): StreakRecord {
  if (typeof window === "undefined") return DEFAULT_RECORD;
  try {
    const raw = window.localStorage.getItem(STREAK_KEY);
    if (!raw) return DEFAULT_RECORD;
    const parsed = JSON.parse(raw);
    return {
      lastCompletedDate: typeof parsed.lastCompletedDate === "string" ? parsed.lastCompletedDate : null,
      currentStreak: Number.isFinite(parsed.currentStreak) ? parsed.currentStreak : 0,
      bestStreak: Number.isFinite(parsed.bestStreak) ? parsed.bestStreak : 0,
    };
  } catch {
    return DEFAULT_RECORD;
  }
}

function writeRecord(record: StreakRecord) {
  window.localStorage.setItem(STREAK_KEY, JSON.stringify(record));
  window.dispatchEvent(new Event(EVENT));
}

/** Effective streak accounts for missed days without needing a write: more than one calendar day since the last completion breaks it. */
function computeEffectiveStreak(record: StreakRecord, todayKey: string): number {
  if (!record.lastCompletedDate) return 0;
  const gap = daysBetween(record.lastCompletedDate, todayKey);
  return gap <= 1 ? record.currentStreak : 0;
}

let cachedRaw: string | null | undefined;
let cachedSnapshot: StreakSnapshot = DEFAULT_SNAPSHOT;

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

function getSnapshot(): StreakSnapshot {
  const raw = window.localStorage.getItem(STREAK_KEY);
  if (raw === cachedRaw) return cachedSnapshot;

  cachedRaw = raw;
  const record = readRecord();
  const todayStr = dateKey(new Date());
  cachedSnapshot = {
    streak: computeEffectiveStreak(record, todayStr),
    bestStreak: record.bestStreak,
    completedToday: record.lastCompletedDate === todayStr,
  };
  return cachedSnapshot;
}

function getServerSnapshot(): StreakSnapshot {
  return DEFAULT_SNAPSHOT;
}

export function useDailyStreak(): StreakSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Marks today's daily quiz as completed, extending the streak if yesterday was the last completion. */
export function recordDailyCompletion(): StreakSnapshot {
  const todayStr = dateKey(new Date());
  const record = readRecord();

  if (record.lastCompletedDate === todayStr) {
    return {
      streak: record.currentStreak,
      bestStreak: record.bestStreak,
      completedToday: true,
    };
  }

  const gap = record.lastCompletedDate ? daysBetween(record.lastCompletedDate, todayStr) : Infinity;
  const nextStreak = gap === 1 ? record.currentStreak + 1 : 1;
  const next: StreakRecord = {
    lastCompletedDate: todayStr,
    currentStreak: nextStreak,
    bestStreak: Math.max(record.bestStreak, nextStreak),
  };
  writeRecord(next);

  return { streak: nextStreak, bestStreak: next.bestStreak, completedToday: true };
}

export function getMsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

export interface WeekDay {
  label: string;
  date: string;
  done: boolean;
  isToday: boolean;
  isFuture: boolean;
}

const WEEKDAY_LABELS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

/** Derives a Mon–Sun view of which days are "done", approximated from the trailing streak length since we don't store per-day history. */
export function getWeekStreakDays(streak: number, completedToday: boolean, now: Date = new Date()): WeekDay[] {
  const todayStr = dateKey(now);
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);

  const doneKeys = new Set<string>();
  if (streak > 0) {
    const anchor = new Date(now);
    if (!completedToday) anchor.setDate(anchor.getDate() - 1);
    for (let i = 0; i < streak; i++) {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() - i);
      doneKeys.add(dateKey(d));
    }
  }

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = dateKey(d);
    return {
      label: WEEKDAY_LABELS[i],
      date: key,
      done: doneKeys.has(key),
      isToday: key === todayStr,
      isFuture: key > todayStr,
    };
  });
}
