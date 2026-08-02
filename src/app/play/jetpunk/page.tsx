"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { JETPUNK_ROUNDS } from "@/data/questions";
import { isAnswerMatch } from "@/lib/utils";
import { useCountdown } from "@/hooks/useCountdown";
import { fireFlameBurst } from "@/lib/flames";
import { GameHeader } from "@/components/game/GameHeader";
import { TimerBar } from "@/components/game/TimerBar";
import { JetpunkGrid } from "@/components/game/JetpunkGrid";
import { GameOverScreen } from "@/components/game/GameOverScreen";
import { GlassCard } from "@/components/ui/GlassCard";
import { useStoredXp, setStoredXp } from "@/lib/storage";
import { calculateXpGain } from "@/lib/xp-gain";
import { useQuizSounds } from "@/hooks/useQuizSounds";
import type { JetpunkRound } from "@/types/quiz";

export default function JetpunkPage() {
  const sounds = useQuizSounds();
  const startXp = useStoredXp();
  const [round, setRound] = useState<JetpunkRound | null>(null);
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [input, setInput] = useState("");
  const [finished, setFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const xpSavedRef = useRef(false);

  const active = !!round && !finished && !isPaused;
  const { secondsLeft, reset, addSeconds } = useCountdown(round?.timeLimitSeconds ?? 60, {
    active,
    onExpire: () => setFinished(true),
  });

  const startRound = (r: JetpunkRound) => {
    setRound(r);
    setFoundIds(new Set());
    setInput("");
    setFinished(false);
    setIsPaused(false);
    reset(r.timeLimitSeconds);
    xpSavedRef.current = false;
    sounds.playStart();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (finished && round) {
      const endXp = startXp + calculateXpGain(foundIds.size, round.items.length, "jetpunk");
      if (!xpSavedRef.current) {
        xpSavedRef.current = true;
        const timer = setTimeout(() => {
          setStoredXp(endXp);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [finished, round, foundIds, startXp]);

  const handleChange = useCallback(
    (value: string) => {
      setInput(value);
      if (!round || !value.trim() || isPaused) return;

      const matches = round.items.filter(
        (item) => !foundIds.has(item.id) && isAnswerMatch(value, item.answers)
      );

      if (matches.length > 0) {
        sounds.playCorrect();
        addSeconds(5 * matches.length);
        setFoundIds((prev) => {
          const next = new Set(prev);
          matches.forEach((match) => next.add(match.id));
          if (next.size % 3 === 0) fireFlameBurst();
          if (next.size === round.items.length) setFinished(true);
          return next;
        });
        setInput("");
      }
    },
    [round, foundIds, isPaused, addSeconds, sounds]
  );

  if (!round) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 pb-8">
        <GameHeader title="Jetpunk" />
        <div className="flex flex-col gap-3 px-4 sm:px-6">
          <p className="text-sm text-ink-soft">
            Choisis une grille et tape les réponses le plus vite possible.
          </p>
          {JETPUNK_ROUNDS.map((r, index) => (
            <motion.button
              key={r.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => startRound(r)}
              className="text-left"
            >
              <GlassCard hover glow="blue" className="p-5">
                <h3 className="font-display text-lg font-bold text-ink">{r.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{r.instructions}</p>
                <p className="mt-2 text-xs font-semibold text-primary">
                  {r.items.length} réponses · {r.timeLimitSeconds}s
                </p>
              </GlassCard>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  const success = finished && foundIds.size === round.items.length;
  const xpGained = finished ? calculateXpGain(foundIds.size, round.items.length, "jetpunk") : 0;
  const endXp = startXp + xpGained;
  const timeTaken = finished ? round.timeLimitSeconds - Math.ceil(secondsLeft) : 0;

  if (finished && success) {
    return (
      <GameOverScreen
        title="Grille complétée !"
        celebrate
        stats={[
          { label: "Trouvées", value: `${foundIds.size} / ${round.items.length}` },
          { label: "Temps restant", value: `${Math.ceil(secondsLeft)}s` },
        ]}
        onRetry={() => startRound(round)}
        score={foundIds.size}
        mode="jetpunk"
        category={round.category}
        roundId={round.id}
        timeTaken={timeTaken}
        isCompleted
        startXp={startXp}
        endXp={endXp}
        xpGained={xpGained}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-0">
      <GameHeader title={round.title} />

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mb-3">
          <p className="text-sm text-ink-soft">{round.instructions}</p>
          {finished && <p className="mt-2 text-sm font-semibold text-danger">Temps écoulé</p>}
        </div>
        <JetpunkGrid items={round.items} foundIds={foundIds} revealed={finished} />
      </div>

      {!finished && (
        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-line bg-background-card px-4 py-4 sm:px-6 sm:py-5">
          <TimerBar secondsLeft={secondsLeft} maxSeconds={round.timeLimitSeconds} />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={isPaused ? "En pause..." : "Tape ta réponse..."}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={isPaused}
            className="glass-card w-full px-5 py-4 text-lg font-semibold text-ink placeholder:text-ink-faint disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-2">
            <p className="flex-1 text-center text-xs text-ink-faint">
              {foundIds.size} / {round.items.length} trouvées
            </p>
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="px-3 py-2 text-xs font-semibold text-ink-soft hover:text-ink"
            >
              {isPaused ? "Reprendre" : "Pause"}
            </button>
            <button
              type="button"
              onClick={() => setFinished(true)}
              className="px-3 py-2 text-xs font-semibold text-ink-soft hover:text-ink"
            >
              Forfait
            </button>
          </div>
        </div>
      )}

      {finished && (
        <div className="sticky bottom-0 border-t border-line bg-background-card px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => startRound(round)}
              className="flex-1 px-4 py-3 bg-primary text-ink-accent rounded-md font-semibold shadow-btn-primary"
            >
              Recommencer
            </button>
            <button
              type="button"
              onClick={() => setRound(null)}
              className="flex-1 px-4 py-3 bg-ink/10 text-ink rounded-lg font-semibold"
            >
              Retour
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
