"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Flame } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";
import { QCM_QUESTIONS } from "@/data/questions";
import { shuffle } from "@/lib/utils";
import { GameHeader } from "@/components/game/GameHeader";
import { TimerBar } from "@/components/game/TimerBar";
import { QuestionCard } from "@/components/game/QuestionCard";
import { AnswerButton, type AnswerState } from "@/components/game/AnswerButton";
import { GameOverScreen } from "@/components/game/GameOverScreen";
import { DifficultySelector } from "@/components/DifficultySelector";
import { fireFlameBurst } from "@/lib/flames";
import { useStoredXp, setStoredXp } from "@/lib/storage";
import { calculateXpGain } from "@/lib/xp-gain";
import { shuffleQuestionChoices } from "@/data/questions";
import { filterQuestionsByMode, QuestionSessionManager } from "@/services/questions";
import { useQuizSounds } from "@/hooks/useQuizSounds";
import type { QcmQuestion } from "@/types/quiz";

const START_SECONDS = 60;
const CORRECT_BONUS = 3;
const WRONG_PENALTY = -2;
const IDLE_STATES: AnswerState[] = ["idle", "idle", "idle", "idle"];

function buildQueue(diff?: 1 | 2 | 3) {
  let questions = filterQuestionsByMode(QCM_QUESTIONS, "time-attack");
  if (diff) {
    questions = questions.filter(q => q.difficulty === diff);
  }
  return shuffle(questions).map(q => shuffleQuestionChoices(q));
}

export default function TimeAttackPage() {
  const sounds = useQuizSounds();
  const startXp = useStoredXp();
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | "random" | null>(null);
  const [queue, setQueue] = useState<QcmQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answerStates, setAnswerStates] = useState<AnswerState[]>(IDLE_STATES);
  const [locked, setLocked] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const startGame = useCallback((diff: 1 | 2 | 3 | "random") => {
    const questionDifficulty = diff !== "random" ? diff : undefined;
    setQueue(buildQueue(questionDifficulty));
    setQIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setAnswerStates(IDLE_STATES);
    setLocked(false);
    setGameOver(false);
    setDifficulty(diff);
    sounds.playStart();
  }, [sounds]);

  const currentQuestion = queue[qIndex % queue.length];

  const { secondsLeft, addSeconds, reset } = useCountdown(START_SECONDS, {
    active: !gameOver,
    onExpire: () => setGameOver(true),
  });

  const handleAnswer = useCallback(
    (choiceIndex: number) => {
      if (locked || gameOver) return;
      setLocked(true);

      const isCorrect = choiceIndex === currentQuestion.answerIndex;
      const nextStates = currentQuestion.choices.map((_, i) => {
        if (i === choiceIndex) return isCorrect ? "correct" : "wrong";
        if (i === currentQuestion.answerIndex && !isCorrect) return "reveal-correct";
        return "disabled";
      }) as AnswerState[];
      setAnswerStates(nextStates);

      if (isCorrect) {
        sounds.playCorrect();
        addSeconds(CORRECT_BONUS);
        setScore((s) => s + 1);
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          if (next > 0 && next % 5 === 0) fireFlameBurst();
          return next;
        });
      } else {
        sounds.playWrong();
        addSeconds(WRONG_PENALTY);
        setStreak(0);
      }

      setTimeout(() => {
        setQIndex((i) => {
          const next = i + 1;
          if (next >= queue.length) {
            setQueue(buildQueue());
            return 0;
          }
          return next;
        });
        setAnswerStates(IDLE_STATES);
        setLocked(false);
        sounds.playNext();
      }, 650);
    },
    [locked, gameOver, currentQuestion, addSeconds, queue.length, sounds]
  );

  const handleRetry = () => {
    startGame(difficulty as 1 | 2 | 3 | "random");
    reset(START_SECONDS);
  };

  const xpSavedRef = useRef(false);
  const xpGained = gameOver ? calculateXpGain(score, queue.length, "time-attack") : 0;
  const endXp = startXp + xpGained;

  useEffect(() => {
    if (gameOver && !xpSavedRef.current) {
      xpSavedRef.current = true;
      const timer = setTimeout(() => {
        setStoredXp(endXp);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameOver, endXp]);

  if (difficulty === null) {
    return (
      <DifficultySelector
        currentXp={startXp}
        onSelectDifficulty={startGame}
        title="Time Attack"
      />
    );
  }

  if (gameOver) {
    return (
      <GameOverScreen
        title="Temps écoulé !"
        stats={[
          { label: "Score", value: `${score}` },
          { label: "Meilleure série", value: `${bestStreak}` },
        ]}
        onRetry={handleRetry}
        score={score}
        mode="time-attack"
        startXp={startXp}
        endXp={endXp}
        xpGained={xpGained}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 pb-8">
      <GameHeader title="Time Attack" />

      <div className="flex flex-col gap-2 px-4 sm:px-6">
        <TimerBar secondsLeft={secondsLeft} maxSeconds={START_SECONDS} />
        <div className="flex items-center justify-between text-sm text-ink-soft">
          <span>
            Score <span className="font-display font-bold text-ink">{score}</span>
          </span>
          {streak >= 2 && (
            <span className="flex items-center gap-1 font-display font-bold text-highlight-dark">
              <Flame className="h-4 w-4" />
              Série x{streak}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 sm:px-6">
        <QuestionCard
          questionKey={currentQuestion.id}
          category={currentQuestion.category}
          question={currentQuestion.question}
          index={qIndex}
          total={queue.length}
        />

        <div className="grid grid-cols-2 gap-3">
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
