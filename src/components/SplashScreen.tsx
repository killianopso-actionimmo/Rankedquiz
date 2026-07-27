"use client";

import { useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { cn } from "@/lib/utils";
import {
  QuizIntro,
  INTRO_DURATION_IN_FRAMES,
  INTRO_FPS,
  INTRO_WIDTH,
  INTRO_HEIGHT,
} from "@/remotion/QuizIntro";

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const playerRef = useRef<PlayerRef>(null);
  const [hidden, setHidden] = useState(false);
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setHidden(true);
    setTimeout(onFinish, 350);
  };

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.addEventListener("ended", finish);
    return () => player.removeEventListener("ended", finish);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Safety net: never trap the user on the splash if playback fails to end on its own.
    const t = setTimeout(finish, 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={finish}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") finish();
      }}
      className={cn(
        "fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-background-deep transition-opacity duration-[350ms]",
        hidden && "pointer-events-none opacity-0"
      )}
    >
      <button
        type="button"
        onClick={finish}
        className="btn-tap absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur active:scale-95"
      >
        Passer
      </button>
      <div className="relative z-10 w-full max-w-[420px] px-8">
        <Player
          ref={playerRef}
          component={QuizIntro}
          durationInFrames={INTRO_DURATION_IN_FRAMES}
          compositionWidth={INTRO_WIDTH}
          compositionHeight={INTRO_HEIGHT}
          fps={INTRO_FPS}
          autoPlay
          loop={false}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
