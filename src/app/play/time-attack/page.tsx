"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Flame } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";
import { QCM_QUESTIONS } from "@/data/questions";
import { shuffle } from "@/lib/utils";
import { GameHeader } from "@/components/game/GameHeader";
import { BombTimer } from "@/components/game/BombTimer";
import { QuestionCard } from "@/components/game/QuestionCard";
import { AnswerButton, type AnswerState } from "@/components/game/AnswerButton";
import { PostGameScreen } from "@/components/game/PostGameScreen";
import { DifficultySelector } from "@/components/DifficultySelector";
import { fireFlameBurst } from "@/lib/flames";
import { useStoredXp, setStoredXp } from "@/lib/storage";
import { calculateProgressionXp, toDbDifficulty } from "@/lib/xp-gain";
import { shuffleQuestionChoices } from "@/data/questions";
import { filterQuestionsByMode } from "@/services/questions";
import { submitGame } from "@/services/userStats";
import { useQuizSounds } from "@/hooks/useQuizSounds";
import type { QcmQuestion } from "@/types/quiz";
import type { GameSubmitResult } from "@/types/user";

const START_SECONDS = 60;
const CORRECT_BONUS = 3;
const WRONG_PENALTY = -2;

/**
 * Points par bonne reponse. Cale la formule XP sur l'echelle voulue :
 * base_xp = score / questions_repondues = 40 x taux_de_reussite.
 * Une partie a 8/10 rapporte donc 32 XP de base, avant bonus.
 */
const POINTS_PER_CORRECT = 40;

const IDLE_STATES: AnswerState[] = ["idle", "idle", "idle", "idle"];

function buildQueue(diff?: 1 | 2 | 3) {
  let questions = filterQuestionsByMode(QCM_QUESTIONS, "time-attack");
  if (diff) {
    questions = questions.filter((q) => q.difficulty === diff);
  }
  return shuffle(questions).map((q) => shuffleQuestionChoices(q));
}

export default function TimeAttackPage() {
  const sounds = useQuizSounds();
  const startXp = useStoredXp();
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | "random" | null>(null);
  const [queue, setQueue] = useState<QcmQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answerStates, setAnswerStates] = useState<AnswerState[]>(IDLE_STATES);
  const [locked, setLocked] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [result, setResult] = useState<GameSubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Chronometrage : instant d'affichage de la question courante, et cumul du
  // temps de reflexion. Des refs et non des states : la valeur est lue dans des
  // callbacks, elle ne doit declencher aucun rendu.
  const questionShownAt = useRef<number>(0);
  const totalThinkMs = useRef<number>(0);
  const submittedRef = useRef(false);

  const startGame = useCallback(
    (diff: 1 | 2 | 3 | "random") => {
      const questionDifficulty = diff !== "random" ? diff : undefined;
      setQueue(buildQueue(questionDifficulty));
      setQIndex(0);
      setScore(0);
      setCorrectCount(0);
      setAnsweredCount(0);
      setStreak(0);
      setBestStreak(0);
      setAnswerStates(IDLE_STATES);
      setLocked(false);
      setGameOver(false);
      setResult(null);
      setSubmitError(null);
      totalThinkMs.current = 0;
      questionShownAt.current = Date.now();
      submittedRef.current = false;
      setDifficulty(diff);
      sounds.playStart();
    },
    [sounds],
  );

  const currentQuestion = queue[qIndex % queue.length];

  const { secondsLeft, addSeconds, reset } = useCountdown(START_SECONDS, {
    active: !gameOver,
    onExpire: () => setGameOver(true),
  });

  const handleAnswer = useCallback(
    (choiceIndex: number) => {
      if (locked || gameOver) return;
      setLocked(true);

      // Mesure avant tout traitement : c'est le temps de reflexion reel.
      const elapsed = Date.now() - questionShownAt.current;
      totalThinkMs.current += elapsed;
      setAnsweredCount((n) => n + 1);

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
        setScore((s) => s + POINTS_PER_CORRECT);
        setCorrectCount((c) => c + 1);
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
        // Le chrono de la question suivante ne demarre qu'a son affichage,
        // sinon les 650 ms de transition seraient comptees comme reflexion.
        questionShownAt.current = Date.now();
        sounds.playNext();
      }, 650);
    },
    [locked, gameOver, currentQuestion, addSeconds, queue.length, sounds],
  );

  const handleRetry = () => {
    startGame(difficulty as 1 | 2 | 3 | "random");
    reset(START_SECONDS);
  };

  const avgTimePerQuestion = answeredCount > 0 ? totalThinkMs.current / answeredCount / 1000 : 0;

  // Enregistrement de la partie. submittedRef empeche le double envoi que
  // provoquerait un re-rendu pendant l'appel reseau.
  useEffect(() => {
    if (!gameOver || submittedRef.current || difficulty === null) return;
    submittedRef.current = true;

    // L'XP local (localStorage) alimente le selecteur de difficulte et l'entete
    // d'accueil : on le met a jour meme si le joueur n'est pas connecte.
    const estimated = calculateProgressionXp({
      score,
      correctAnswers: correctCount,
      totalQuestions: answeredCount,
      longestStreak: bestStreak,
      avgTimePerQuestion,
      difficulty: toDbDifficulty(difficulty),
    });
    setStoredXp(startXp + estimated);

    if (answeredCount === 0) {
      setSubmitError("Aucune question répondue.");
      return;
    }

    setSubmitting(true);
    submitGame({
      mode: "time_attack",
      score,
      correctAnswers: correctCount,
      totalQuestions: answeredCount,
      longestStreak: bestStreak,
      avgTimePerQuestion,
      difficulty: toDbDifficulty(difficulty),
    }).then((res) => {
      setSubmitting(false);
      if (res.data) {
        setResult(res.data);
        // La valeur serveur fait foi : on aligne le cache local dessus.
        setStoredXp(res.data.total_xp);
      } else {
        setSubmitError(res.error ?? "Partie non enregistrée.");
      }
    });
  }, [
    gameOver,
    difficulty,
    score,
    correctCount,
    answeredCount,
    bestStreak,
    avgTimePerQuestion,
    startXp,
  ]);

  if (difficulty === null) {
    return (
      <DifficultySelector currentXp={startXp} onSelectDifficulty={startGame} title="Time Attack" />
    );
  }

  if (gameOver) {
    return (
      <PostGameScreen
        score={score}
        correctAnswers={correctCount}
        totalAnswered={answeredCount}
        longestStreak={bestStreak}
        avgTimePerQuestion={avgTimePerQuestion}
        result={result}
        submitting={submitting}
        submitError={submitError}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 pb-8">
      <GameHeader title="Time Attack" />

      <div className="flex flex-col gap-2 px-4 sm:px-6">
        <BombTimer timeLeft={secondsLeft} totalTime={START_SECONDS} isGameActive={!gameOver} />
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
          index={answeredCount}
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
