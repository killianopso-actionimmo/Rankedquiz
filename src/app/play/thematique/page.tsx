"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/data/categories";
import { getRandomQuestions } from "@/data/questions";
import { GameHeader } from "@/components/game/GameHeader";
import { QuestionCard } from "@/components/game/QuestionCard";
import { AnswerButton, type AnswerState } from "@/components/game/AnswerButton";
import { GameOverScreen } from "@/components/game/GameOverScreen";
import { GlassCard } from "@/components/ui/GlassCard";
import { shuffle } from "@/lib/utils";
import { useStoredXp, setStoredXp } from "@/lib/storage";
import { calculateXpGain } from "@/lib/xp-gain";
import { DifficultySelector } from "@/components/DifficultySelector";
import { useQuizSounds } from "@/hooks/useQuizSounds";
import type { CategoryId, QcmQuestion } from "@/types/quiz";

const QUESTIONS_PER_ROUND = 8;
const IDLE_STATES: AnswerState[] = ["idle", "idle", "idle", "idle"];

const ACCENT_ICON_WRAP = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  highlight: "bg-highlight/15 text-highlight-dark",
};

export default function ThematiquePage() {
  const sounds = useQuizSounds();
  const startXp = useStoredXp();
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | "random" | null>(null);
  const [questions, setQuestions] = useState<QcmQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answerStates, setAnswerStates] = useState<AnswerState[]>(IDLE_STATES);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[qIndex];

  const { shuffledChoices, correctAnswerIndex } = useMemo(() => {
    if (!currentQuestion) return { shuffledChoices: [], correctAnswerIndex: -1 };
    const indices = Array.from({ length: currentQuestion.choices.length }, (_, i) => i);
    const shuffledIndices = shuffle(indices);
    const newCorrectIndex = shuffledIndices.indexOf(currentQuestion.answerIndex);
    const newChoices = shuffledIndices.map((i) => currentQuestion.choices[i]);
    return { shuffledChoices: newChoices, correctAnswerIndex: newCorrectIndex };
  }, [currentQuestion]);

  const startCategory = (id: CategoryId) => {
    setCategory(id);
    setDifficulty(null);
  };

  const startGame = (diff: 1 | 2 | 3 | "random") => {
    const questionDifficulty = diff !== "random" ? diff : undefined;
    setQuestions(getRandomQuestions(QUESTIONS_PER_ROUND, category ?? undefined, questionDifficulty));
    setQIndex(0);
    setScore(0);
    setAnswerStates(IDLE_STATES);
    setLocked(false);
    setFinished(false);
    setDifficulty(diff);
    sounds.playStart();
  };

  const handleAnswer = useCallback(
    (choiceIndex: number) => {
      if (locked || finished) return;
      setLocked(true);
      const isCorrect = choiceIndex === correctAnswerIndex;
      const nextStates = shuffledChoices.map((_, i) => {
        if (i === choiceIndex) return isCorrect ? "correct" : "wrong";
        if (i === correctAnswerIndex && !isCorrect) return "reveal-correct";
        return "disabled";
      }) as AnswerState[];
      setAnswerStates(nextStates);
      if (isCorrect) {
        setScore((s) => s + 1);
        sounds.playCorrect();
      } else {
        sounds.playWrong();
      }

      setTimeout(() => {
        setQIndex((i) => {
          const next = i + 1;
          if (next >= questions.length) {
            setFinished(true);
            return i;
          }
          return next;
        });
        setAnswerStates(IDLE_STATES);
        setLocked(false);
        sounds.playNext();
      }, 650);
    },
    [locked, finished, correctAnswerIndex, shuffledChoices.length, sounds]
  );

  const categoryLabel = useMemo(
    () => CATEGORIES.find((c) => c.id === category)?.label ?? "",
    [category]
  );

  const xpSavedRef = useRef(false);
  const xpGained = finished ? calculateXpGain(score, questions.length, "thematique") : 0;
  const endXp = startXp + xpGained;

  useEffect(() => {
    if (finished && !xpSavedRef.current) {
      xpSavedRef.current = true;
      const timer = setTimeout(() => {
        setStoredXp(endXp);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [finished, endXp]);

  if (category && difficulty === null) {
    const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label ?? "";
    return (
      <DifficultySelector
        currentXp={startXp}
        onSelectDifficulty={startGame}
        onCancel={() => setCategory(null)}
        title={categoryLabel}
      />
    );
  }

  if (!category) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 pb-8">
        <GameHeader title="Thématique" />
        <div className="flex flex-col gap-3 px-4 sm:px-6">
          <p className="text-sm text-ink-soft">Choisis une catégorie pour commencer.</p>
          {CATEGORIES.map((cat, index) => (
            <motion.button
              key={cat.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => startCategory(cat.id)}
              className="text-left"
            >
              <GlassCard hover className="flex items-center gap-4 p-5">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${ACCENT_ICON_WRAP[cat.color]}`}
                >
                  {cat.emoji}
                </div>
                <h3 className="font-display text-lg font-bold text-ink">{cat.label}</h3>
              </GlassCard>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <GameOverScreen
        title={`${categoryLabel} terminé !`}
        stats={[
          { label: "Bonnes réponses", value: `${score} / ${questions.length}` },
          { label: "Précision", value: `${Math.round((score / questions.length) * 100)}%` },
        ]}
        onRetry={() => startCategory(category)}
        startXp={startXp}
        endXp={endXp}
        xpGained={xpGained}
      />
    );
  }

  if (!currentQuestion) return <div />;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 pb-8">
      <GameHeader title={categoryLabel} />
      <div className="flex flex-col gap-4 px-4 sm:px-6">
        <QuestionCard
          questionKey={currentQuestion.id}
          category={currentQuestion.category}
          question={currentQuestion.question}
          index={qIndex}
          total={questions.length}
        />
        <div className="flex flex-col gap-3">
          {shuffledChoices.map((choice, i) => (
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
