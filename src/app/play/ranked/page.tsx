"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useCountdown } from "@/hooks/useCountdown";
import { getRandomQuestions, type QcmQuestion } from "@/data/questions";
import { computeQuizEloDelta } from "@/lib/elo";
import { getRankProgress } from "@/lib/ranks";
import { useStoredElo, setStoredElo } from "@/lib/storage";
import { GameHeader } from "@/components/game/GameHeader";
import { TimerBar } from "@/components/game/TimerBar";
import { QuestionCard } from "@/components/game/QuestionCard";
import { RankProgressHeader } from "@/components/game/RankProgressHeader";
import { AnswerButton, type AnswerState } from "@/components/game/AnswerButton";
import { GameOverScreen } from "@/components/game/GameOverScreen";
import { MatchModeSelector, type MatchMode } from "@/components/MatchModeSelector";
import { BotDifficultySelector, type BotDifficulty } from "@/components/BotDifficultySelector";
import { LevelDifficultySelector } from "@/components/LevelDifficultySelector";
import { getBotConfig, simulateBotAnswer } from "@/services/bot";
import { fireFlameBurst } from "@/lib/flames";
import { useStoredXp } from "@/lib/storage";

const QUESTIONS_PER_MATCH = 10;
const SECONDS_PER_QUESTION = 12;
const IDLE_STATES: AnswerState[] = ["idle", "idle", "idle", "idle"];

interface MatchResult {
  correctCount: number;
  eloDelta: number;
  newElo: number;
}

export default function RankedPage() {
  const startingElo = useStoredElo();
  const xp = useStoredXp();
  const [matchMode, setMatchMode] = useState<MatchMode | null>(null);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty | null>(null);
  const [levelDifficulty, setLevelDifficulty] = useState<1 | 2 | 3 | "random" | null>(null);
  const [questions, setQuestions] = useState<QcmQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answerStates, setAnswerStates] = useState<AnswerState[]>(IDLE_STATES);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const correctCountRef = useRef(0);
  const botCorrectCountRef = useRef(0);
  const resetRef = useRef<(seconds: number) => void>(() => {});
  const botActionRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[qIndex];
  const finished = result !== null;

  const finishMatch = useCallback(() => {
    const delta = computeQuizEloDelta(startingElo, correctCountRef.current, questions.length);
    const newElo = Math.max(0, startingElo + delta);
    setStoredElo(newElo);
    setResult({ correctCount: correctCountRef.current, eloDelta: delta, newElo });
  }, [startingElo, questions.length]);

  const advance = useCallback(
    (wasCorrect: boolean) => {
      setLocked(true);
      if (wasCorrect) correctCountRef.current += 1;

      setTimeout(() => {
        setQIndex((i) => {
          const next = i + 1;
          if (next >= questions.length) {
            finishMatch();
            return i;
          }
          return next;
        });
        setAnswerStates(IDLE_STATES);
        setLocked(false);
        resetRef.current(SECONDS_PER_QUESTION);
      }, 650);
    },
    [questions.length, finishMatch]
  );

  const { secondsLeft, reset } = useCountdown(SECONDS_PER_QUESTION, {
    active: !finished && !locked,
    onExpire: () => {
      if (locked || finished) return;
      const revealed = currentQuestion.choices.map((_, i) =>
        i === currentQuestion.answerIndex ? "reveal-correct" : "disabled"
      ) as AnswerState[];
      setAnswerStates(revealed);
      advance(false);
    },
  });

  useEffect(() => {
    resetRef.current = reset;
  }, [reset]);

  // Load questions for bot mode
  useEffect(() => {
    if (matchMode === "bot" && botDifficulty && questions.length === 0) {
      setQuestions(getRandomQuestions(QUESTIONS_PER_MATCH));
    }
  }, [matchMode, botDifficulty, questions.length]);

  const handleAnswer = useCallback(
    (choiceIndex: number) => {
      if (locked || finished) return;
      const isCorrect = choiceIndex === currentQuestion.answerIndex;
      const nextStates = currentQuestion.choices.map((_, i) => {
        if (i === choiceIndex) return isCorrect ? "correct" : "wrong";
        if (i === currentQuestion.answerIndex && !isCorrect) return "reveal-correct";
        return "disabled";
      }) as AnswerState[];
      setAnswerStates(nextStates);
      if (isCorrect) fireFlameBurst();

      if (matchMode === "bot" && botDifficulty) {
        simulateBotAction(choiceIndex, isCorrect);
      } else {
        advance(isCorrect);
      }
    },
    [locked, finished, currentQuestion, advance, matchMode, botDifficulty]
  );

  const simulateBotAction = useCallback(
    (playerChoiceIndex: number, playerCorrect: boolean) => {
      if (!botDifficulty) return;
      const botConfig = getBotConfig(botDifficulty);
      const botResult = simulateBotAnswer(botConfig, currentQuestion.answerIndex, 4);

      if (botActionRef.current) clearTimeout(botActionRef.current);

      botActionRef.current = setTimeout(() => {
        if (botResult.isCorrect) botCorrectCountRef.current += 1;
        advance(playerCorrect);
      }, botResult.delayMs);
    },
    [botDifficulty, currentQuestion, advance]
  );

  const handleRetry = () => {
    if (botActionRef.current) clearTimeout(botActionRef.current);
    const difficulty = levelDifficulty && levelDifficulty !== "random" ? levelDifficulty : undefined;
    setQuestions(getRandomQuestions(QUESTIONS_PER_MATCH, undefined, difficulty));
    setQIndex(0);
    correctCountRef.current = 0;
    botCorrectCountRef.current = 0;
    setAnswerStates(IDLE_STATES);
    setLocked(false);
    setResult(null);
    resetRef.current(SECONDS_PER_QUESTION);
  };

  const handleLevelDifficultySelect = (difficulty: 1 | 2 | 3 | "random") => {
    setLevelDifficulty(difficulty);
    const questionDifficulty = difficulty !== "random" ? difficulty : undefined;
    setQuestions(getRandomQuestions(QUESTIONS_PER_MATCH, undefined, questionDifficulty));
  };

  if (!matchMode) {
    return <MatchModeSelector title="Ranked" onSelectMode={setMatchMode} />;
  }

  if (matchMode === "bot" && !botDifficulty) {
    return (
      <AnimatePresence>
        <BotDifficultySelector
          onSelectDifficulty={setBotDifficulty}
          onCancel={() => setMatchMode(null)}
        />
      </AnimatePresence>
    );
  }

  if (matchMode === "human" && levelDifficulty === null) {
    return (
      <AnimatePresence>
        <LevelDifficultySelector
          currentXp={xp}
          onSelectDifficulty={handleLevelDifficultySelect}
          onCancel={() => setMatchMode(null)}
        />
      </AnimatePresence>
    );
  }

  if (result) {
    const { rank } = getRankProgress(result.newElo);
    const deltaLabel = result.eloDelta >= 0 ? `+${result.eloDelta}` : `${result.eloDelta}`;
    const botConfig = botDifficulty ? getBotConfig(botDifficulty) : null;

    const stats = matchMode === "bot" && botConfig
      ? [
          { label: "Toi", value: `${result.correctCount} / ${questions.length}` },
          { label: botConfig.name, value: `${botCorrectCountRef.current} / ${questions.length}` },
          { label: "Variation ELO", value: deltaLabel },
          { label: "Rang actuel", value: `${rank.label} (${result.newElo})` },
        ]
      : [
          { label: "Bonnes réponses", value: `${result.correctCount} / ${questions.length}` },
          { label: "Variation ELO", value: deltaLabel },
          { label: "Rang actuel", value: `${rank.label} (${result.newElo})` },
        ];

    return (
      <GameOverScreen
        title="Match terminé"
        celebrate={result.eloDelta >= 0}
        stats={stats}
        onRetry={handleRetry}
      />
    );
  }

  if (questions.length === 0) {
    return <div />;
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 pb-8">
      <GameHeader title="Ranked" />

      <div className="flex flex-col gap-3 px-4 sm:px-6">
        <RankProgressHeader elo={startingElo} />
        <TimerBar secondsLeft={secondsLeft} maxSeconds={SECONDS_PER_QUESTION} />
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
