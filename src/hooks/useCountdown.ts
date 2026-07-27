"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseCountdownOptions {
  onExpire?: () => void;
  active?: boolean;
}

export function useCountdown(initialSeconds: number, options: UseCountdownOptions = {}) {
  const { onExpire, active = true } = options;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!active) return;
    if (secondsLeft <= 0) {
      onExpireRef.current?.();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, +(s - 0.1).toFixed(1)));
    }, 100);

    return () => clearInterval(interval);
  }, [active, secondsLeft]);

  const addSeconds = useCallback((delta: number) => {
    setSecondsLeft((s) => Math.max(0, +(s + delta).toFixed(1)));
  }, []);

  const reset = useCallback((seconds: number) => {
    setSecondsLeft(seconds);
  }, []);

  return { secondsLeft, addSeconds, reset };
}
