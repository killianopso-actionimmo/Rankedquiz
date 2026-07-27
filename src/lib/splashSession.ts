import { useSyncExternalStore } from "react";

const KEY = "rq_splash_seen";
const EVENT = "rq-splash-seen-change";

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

function getSnapshot(): boolean {
  return window.sessionStorage.getItem(KEY) === "1";
}

function getServerSnapshot(): boolean {
  return false;
}

export function useHasSeenSplash(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function markSplashSeen() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, "1");
  window.dispatchEvent(new Event(EVENT));
}
