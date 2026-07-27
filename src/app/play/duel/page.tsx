"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Loader2, X } from "lucide-react";
import Link from "next/link";
import { getRandomQuestions } from "@/data/questions";
import { useStoredElo, useStoredXp, setStoredXp, DEFAULT_ELO } from "@/lib/storage";
import { calculateXpGain } from "@/lib/xp-gain";
import { GameHeader } from "@/components/game/GameHeader";
import { QuestionCard } from "@/components/game/QuestionCard";
import { AnswerButton, type AnswerState } from "@/components/game/AnswerButton";
import { GameOverScreen } from "@/components/game/GameOverScreen";
import { PlayerBattleCard } from "@/components/duel/PlayerBattleCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { MatchModeSelector, type MatchMode } from "@/components/MatchModeSelector";
import { BotDifficultySelector, type BotDifficulty } from "@/components/BotDifficultySelector";
import { getBotConfig, simulateBotAnswer } from "@/services/bot";
import { fireFlameBurst } from "@/lib/flames";

const OPPONENT_NAMES = ["Nova_92", "QuizKing", "LunaFast", "ByteRush", "Zed_Prime", "Ariaa"];
const QUESTIONS_PER_DUEL = 8;
const IDLE_STATES: AnswerState[] = ["idle", "idle", "idle", "idle"];

type Phase = "searching" | "found" | "countdown" | "quiz" | "result";

export default function DuelPage() {
  const playerElo = useStoredElo();
  const startXp = useStoredXp();
  const [matchMode, setMatchMode] = useState<MatchMode | null>(null);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty | null>(null);
  const [phase, setPhase] = useState<Phase>("searching");
  const [opponent] = useState(() => {
    if (matchMode === "bot" && botDifficulty) {
      const botConfig = getBotConfig(botDifficulty);
      return { name: botConfig.name, elo: 1200 };
    }
    return {
      name: OPPONENT_NAMES[Math.floor(Math.random() * OPPONENT_NAMES.length)],
      elo: DEFAULT_ELO + Math.floor(Math.random() * 160 - 80),
    };
  });
  const [countdown, setCountdown] = useState(3);
  const [questions] = useState(() => getRandomQuestions(QUESTIONS_PER_DUEL));
  const [qIndex, setQIndex] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [answerStates, setAnswerStates] = useState<AnswerState[]>(IDLE_STATES);
  const [locked, setLocked] = useState(false);
  const opponentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase !== "searching") return;
    const t = setTimeout(() => setPhase("found"), 2200);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "found") return;
    const t = setTimeout(() => setPhase("countdown"), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "countdown") return;
    const t = setTimeout(
      () => {
        if (countdown === 0) {
          setPhase("quiz");
        } else {
          setCountdown((c) => c - 1);
        }
      },
      countdown === 0 ? 500 : 700
    );
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const currentQuestion = questions[qIndex];

  // Simulate the opponent answering each question independently of the player's pace.
  useEffect(() => {
    if (phase !== "quiz" || !currentQuestion) return;

    let delay: number;
    let willBeCorrect: boolean;

    if (matchMode === "bot" && botDifficulty) {
      const botConfig = getBotConfig(botDifficulty);
      const botResult = simulateBotAnswer(botConfig, currentQuestion.answerIndex, 4);
      delay = botResult.delayMs;
      willBeCorrect = botResult.isCorrect;
    } else {
      delay = 500 + Math.random() * 1600;
      willBeCorrect = Math.random() < 0.62;
    }

    opponentTimerRef.current = setTimeout(() => {
      if (willBeCorrect) setOpponentScore((s) => s + 1);
    }, delay);
    return () => {
      if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);
    };
  }, [phase, currentQuestion, qIndex, matchMode, botDifficulty]);

  const handleAnswer = useCallback(
    (choiceIndex: number) => {
      if (locked || !currentQuestion) return;
      setLocked(true);
      const isCorrect = choiceIndex === currentQuestion.answerIndex;
      const nextStates = currentQuestion.choices.map((_, i) => {
        if (i === choiceIndex) return isCorrect ? "correct" : "wrong";
        if (i === currentQuestion.answerIndex && !isCorrect) return "reveal-correct";
        return "disabled";
      }) as AnswerState[];
      setAnswerStates(nextStates);
      if (isCorrect) {
        setPlayerScore((s) => s + 1);
        fireFlameBurst();
      }

      setTimeout(() => {
        setQIndex((i) => {
          const next = i + 1;
          if (next >= questions.length) {
            setPhase("result");
            return i;
          }
          return next;
        });
        setAnswerStates(IDLE_STATES);
        setLocked(false);
      }, 650);
    },
    [locked, currentQuestion, questions.length]
  );

  const xpSavedRef = useRef(false);
  const xpGained = phase === "result" ? calculateXpGain(playerScore, questions.length, "duel") : 0;
  const endXp = startXp + xpGained;

  useEffect(() => {
    if (phase === "result" && !xpSavedRef.current) {
      xpSavedRef.current = true;
      const timer = setTimeout(() => {
        setStoredXp(endXp);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, endXp]);

  if (!matchMode) {
    return <MatchModeSelector title="Duel 1v1" onSelectMode={setMatchMode} />;
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

  if (phase === "searching") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
        <GameHeader title="Duel 1v1" />
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-secondary/10">
            <div className="absolute inset-0 animate-ping rounded-full bg-secondary/20" />
            <Swords className="h-10 w-10 text-secondary" />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-ink">Recherche d&apos;un adversaire…</p>
            <p className="mt-1 flex items-center justify-center gap-2 text-sm text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin" />
              Matchmaking en direct
            </p>
          </div>
          <Link href="/">
            <NeonButton variant="ghost">
              <X className="h-4 w-4" />
              Annuler
            </NeonButton>
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "found" || phase === "countdown") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
        <GameHeader title="Duel 1v1" />
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex w-full max-w-sm items-center gap-3"
          >
            <PlayerBattleCard name="Toi" elo={playerElo} score={0} isSelf accent="primary" />
            <span className="font-display text-2xl font-extrabold text-ink-faint">VS</span>
            <PlayerBattleCard name={opponent.name} elo={opponent.elo} score={0} accent="secondary" />
          </motion.div>

          <AnimatePresence mode="wait">
            {phase === "found" ? (
              <motion.p
                key="found"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-display text-lg font-bold text-highlight-dark"
              >
                Adversaire trouvé !
              </motion.p>
            ) : (
              <motion.p
                key={countdown}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.3 }}
                className="font-display text-6xl font-extrabold text-secondary"
              >
                {countdown === 0 ? "GO !" : countdown}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const isWin = playerScore > opponentScore;
    const isDraw = playerScore === opponentScore;

    return (
      <GameOverScreen
        title={isDraw ? "Match nul !" : isWin ? "Victoire !" : "Défaite"}
        celebrate={isWin}
        stats={[
          { label: "Ton score", value: `${playerScore} / ${questions.length}` },
          { label: `Score de ${opponent.name}`, value: `${opponentScore} / ${questions.length}` },
        ]}
        onRetry={() => window.location.reload()}
        startXp={startXp}
        endXp={endXp}
        xpGained={xpGained}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 pb-8">
      <GameHeader title="Duel 1v1" />

      <div className="flex items-center gap-3 px-4 sm:px-6">
        <PlayerBattleCard name="Toi" elo={playerElo} score={playerScore} isSelf accent="primary" />
        <span className="font-display text-lg font-extrabold text-ink-faint">VS</span>
        <PlayerBattleCard name={opponent.name} elo={opponent.elo} score={opponentScore} accent="secondary" />
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
