"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Home } from "lucide-react";
import { getDailyQuestions } from "@/data/questions";
import { recordDailyCompletion } from "@/lib/streak";
import { useCountdown } from "@/hooks/useCountdown";
import { useCountUp } from "@/hooks/useCountUp";
import { fireVictoryFlameBurst } from "@/lib/flames";
import { GameHeader } from "@/components/game/GameHeader";
import { TimerBar } from "@/components/game/TimerBar";
import { QuestionCard } from "@/components/game/QuestionCard";
import { AnswerButton, type AnswerState } from "@/components/game/AnswerButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { PostGameXpSequence } from "@/components/PostGameXpSequence";
import { useStoredXp, setStoredXp } from "@/lib/storage";
import { calculateXpGain } from "@/lib/xp-gain";

const DAILY_SECONDS = 120;
const IDLE_STATES: AnswerState[] = ["idle", "idle", "idle", "idle"];

interface DailyResult {
  correctCount: number;
  streak: number;
}

export default function DailyQuizPage() {
  const startXp = useStoredXp();
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [questions] = useState(() => getDailyQuestions());
  const [qIndex, setQIndex] = useState(0);
  const [answerStates, setAnswerStates] = useState<AnswerState[]>(IDLE_STATES);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<DailyResult | null>(null);
  const correctCountRef = useRef(0);

  const currentQuestion = questions[qIndex];
  const finished = result !== null;
  const animatedCorrect = useCountUp(result?.correctCount ?? 0);
  const animatedStreak = useCountUp(result?.streak ?? 0);

  const finishDaily = useCallback(() => {
    const { streak } = recordDailyCompletion();
    setResult({ correctCount: correctCountRef.current, streak });
  }, []);

  const { secondsLeft } = useCountdown(DAILY_SECONDS, {
    active: !finished,
    onExpire: finishDaily,
  });

  const advance = useCallback(
    (wasCorrect: boolean) => {
      setLocked(true);
      if (wasCorrect) correctCountRef.current += 1;

      setTimeout(() => {
        setQIndex((i) => {
          const next = i + 1;
          if (next >= questions.length) {
            finishDaily();
            return i;
          }
          return next;
        });
        setAnswerStates(IDLE_STATES);
        setLocked(false);
      }, 650);
    },
    [questions.length, finishDaily]
  );

  const handleAnswer = useCallback(
    (choiceIndex: number) => {
      if (locked || finished || !currentQuestion) return;
      const isCorrect = choiceIndex === currentQuestion.answerIndex;
      const nextStates = currentQuestion.choices.map((_, i) => {
        if (i === choiceIndex) return isCorrect ? "correct" : "wrong";
        if (i === currentQuestion.answerIndex && !isCorrect) return "reveal-correct";
        return "disabled";
      }) as AnswerState[];
      setAnswerStates(nextStates);
      advance(isCorrect);
    },
    [locked, finished, currentQuestion, advance]
  );

  const xpSavedRef = useRef(false);
  const xpGained = result ? calculateXpGain(result.correctCount, questions.length, "thematique") : 0;
  const endXp = startXp + xpGained;

  useEffect(() => {
    if (result && showXpAnimation && !xpSavedRef.current) {
      xpSavedRef.current = true;
      const timer = setTimeout(() => {
        setStoredXp(endXp);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [result, showXpAnimation, endXp]);

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onAnimationComplete={() => fireVictoryFlameBurst()}
        className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center"
      >
        <GlassCard glow="gold" className="w-full max-w-sm p-8">
          <h1 className="font-display text-3xl font-extrabold leading-snug text-highlight-dark">
            Quiz du jour terminé !
          </h1>

          {!showXpAnimation ? (
            <>
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-xl bg-background px-4 py-3">
                  <span className="text-sm text-ink-soft">Bonnes réponses</span>
                  <span className="font-display text-lg font-bold tabular-nums text-ink">
                    {animatedCorrect} / {questions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-background px-4 py-3">
                  <span className="flex items-center gap-1.5 text-sm text-ink-soft">
                    <Flame className="h-4 w-4 text-highlight-dark" />
                    Série actuelle
                  </span>
                  <span className="font-display text-lg font-bold tabular-nums text-ink">{animatedStreak} jours</span>
                </div>
              </div>

              <motion.button
                onClick={() => setShowXpAnimation(true)}
                className="mt-6 text-sm text-primary hover:text-primary-light transition-colors"
              >
                Voir mes gains XP →
              </motion.button>
            </>
          ) : (
            <div className="mt-6">
              <PostGameXpSequence
                startXp={startXp}
                endXp={endXp}
                xpGained={xpGained}
                onAnimationComplete={() => {}}
              />
            </div>
          )}

          <p className="mt-6 text-sm text-ink-soft">Reviens demain pour continuer ta série !</p>
          <div className="mt-6">
            <Link href="/" className="w-full">
              <NeonButton variant="ghost" size="lg" className="w-full">
                <Home className="h-5 w-5" />
                Menu principal
              </NeonButton>
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 pb-8">
      <GameHeader title="Quiz du Jour" />

      <div className="px-4 sm:px-6">
        <TimerBar secondsLeft={secondsLeft} maxSeconds={DAILY_SECONDS} />
      </div>

      <div className="flex flex-col gap-4 px-4 sm:px-6">
        <QuestionCard
          questionKey={currentQuestion.id}
          category={currentQuestion.category}
          question={currentQuestion.question}
          index={qIndex}
          total={questions.length}
        />
        <div className="flex flex-col gap-3">
          {currentQuestion.choices.map((choice, i) => (
            <AnswerButton
              key={`${currentQuestion.id}-${i}`}
              label={choice}
              state={answerStates[i]}
              onClick={() => handleAnswer(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
