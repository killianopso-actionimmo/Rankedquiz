"use client";

import { useEffect, useState } from "react";
import { getMsUntilMidnight } from "@/lib/streak";

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/** Returns null until mounted on the client, so the server-rendered markup never shows a guessed time. */
export function useMidnightCountdown(active: boolean): string | null {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const tick = () => setMs(getMsUntilMidnight());
    const immediate = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(immediate);
      clearInterval(interval);
    };
  }, [active]);

  return ms === null ? null : formatDuration(ms);
}
