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
import type { JetpunkRound } from "@/types/quiz";

export default function JetpunkPage() {
  const startXp = useStoredXp();
  const [round, setRound] = useState<JetpunkRound | null>(null);
  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [input, setInput] = useState("");
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const xpSavedRef = useRef(false);

  const active = !!round && !finished;
  const { secondsLeft, reset } = useCountdown(round?.timeLimitSeconds ?? 60, {
    active,
    onExpire: () => setFinished(true),
  });

  const startRound = (r: JetpunkRound) => {
    setRound(r);
    setFoundIds(new Set());
    setInput("");
    setFinished(false);
    reset(r.timeLimitSeconds);
    xpSavedRef.current = false;
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
      if (!round || !value.trim()) return;

      const matches = round.items.filter(
        (item) => !foundIds.has(item.id) && isAnswerMatch(value, item.answers)
      );

      if (matches.length > 0) {
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
    [round, foundIds]
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

  if (finished) {
    const success = foundIds.size === round.items.length;
    const xpGained = calculateXpGain(foundIds.size, round.items.length, "jetpunk");
    const endXp = startXp + xpGained;
    const timeTaken = round.timeLimitSeconds - Math.ceil(secondsLeft);
    return (
      <GameOverScreen
        title={success ? "Grille complétée !" : "Temps écoulé"}
        celebrate={success}
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
        isCompleted={success}
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
        </div>
        <JetpunkGrid items={round.items} foundIds={foundIds} revealed={false} />
      </div>

      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-black/5 bg-background px-4 py-4 sm:px-6 sm:py-5">
        <TimerBar secondsLeft={secondsLeft} maxSeconds={round.timeLimitSeconds} />
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Tape ta réponse..."
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="glass-card w-full px-5 py-4 text-lg font-semibold text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-center text-xs text-ink-faint">
          {foundIds.size} / {round.items.length} trouvées
        </p>
      </div>
    </div>
  );
}
