"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * BombTimer — corde qui brule + bombe qui descend.
 *
 * Modele visuel : un point d'ancrage fixe en haut, une meche (corde)
 * intacte qui pend en dessous, et la bombe attachee tout au bout de la
 * meche restante. Quand le temps baisse, la meche raccourcit et la
 * bombe DESCEND vers le sol (explosion). Quand on gagne du temps, la
 * meche repousse et la bombe REMONTE. C'est exactement la logique
 * "correct = +3s, la bombe remonte / faux = -2s, elle descend plus
 * vite" demandee.
 *
 * Comme le reste du projet, ce composant est CONTROLE : c'est le parent
 * qui possede le vrai decompte (le hook `useCountdown` deja utilise par
 * Time Attack / Quiz du jour / Ranked / Duel). BombTimer ne fait que
 * visualiser `timeLeft`, jamais un second minuteur en concurrence avec
 * celui du parent — ca evite toute divergence entre les deux.
 *
 * Perf : la position de la meche/bombe est interpolee frame par frame
 * via requestAnimationFrame et ecrite DIRECTEMENT sur le DOM (refs),
 * sans passer par setState. Les seuls re-renders React declenches par
 * ce composant sont l'explosion et le passage en/hors mode "stress" —
 * tout le reste (flicker de flamme, fumee, etincelles) est de la pure
 * animation CSS qui tourne sur le compositor, donc gratuite pour le
 * thread JS meme si les reponses s'enchainent tres vite.
 */

export interface BombTimerColors {
  ropeTop?: string;
  ropeBottom?: string;
  ash?: string;
  ashDark?: string;
  flameCore?: string;
  flameMid?: string;
  flameOuter?: string;
  smoke?: string;
  spark?: string;
  bombBody?: string;
  bombRim?: string;
  accent?: string;
  danger?: string;
}

const DEFAULT_COLORS: Required<BombTimerColors> = {
  ropeTop: "#ffb347",
  ropeBottom: "#ff3b1f",
  ash: "#4a4038",
  ashDark: "#1c1815",
  flameCore: "#fff4c2",
  flameMid: "#ff9a2e",
  flameOuter: "#ff3b1f",
  smoke: "#9aa0a6",
  spark: "#ffd166",
  bombBody: "#1a1b1e",
  bombRim: "#22e5ff",
  accent: "#22e5ff",
  danger: "#ff3b5c",
};

export interface BombTimerProps {
  /** Temps restant en secondes. Piloté par le parent (useCountdown). */
  timeLeft: number;
  /** Durée totale initiale du compte à rebours. */
  totalTime: number;
  /** Appelé une seule fois quand timeLeft atteint 0. */
  onTimeUp?: () => void;
  /** Coupe/reprend les animations décoratives (flamme, fumée...). */
  isGameActive?: boolean;
  /** Fraction du temps total sous laquelle le mode "stress" s'active (défaut 0.2 = 20%). */
  stressThreshold?: number;
  /** Force le mode stress indépendamment du seuil, pour prévisualiser. */
  forceStress?: boolean;
  /** Overrides de couleurs, partiels — le reste garde les défauts rouge/orange + cyan. */
  colors?: BombTimerColors;
  width?: number | string;
  height?: number;
  className?: string;
}

const VB_W = 480;
const VB_H = 100;
const CY = 50;
const ROPE_HALF_H = 5;
const LEFT_X = 34;
const RIGHT_X = 430;
const TRACK_LEN = RIGHT_X - LEFT_X;
const BOMB_RADIUS = 15;
const BOMB_OFFSET = 18;
/** Position fixe de la bombe : elle ne bouge plus avec le temps, seule la meche brule. */
const BOMB_FIXED_X = LEFT_X - BOMB_RADIUS * 0.4;
const SMOOTHING = 0.16;
const CONVERGE_EPSILON = 0.0006;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function formatTime(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

/** Injecte les keyframes une seule fois pour toute la page, peu importe le nombre d'instances. */
function ensureStylesInjected() {
  if (typeof document === "undefined") return;
  if (document.getElementById("bomb-timer-styles")) return;
  const style = document.createElement("style");
  style.id = "bomb-timer-styles";
  style.textContent = `
@keyframes bt-flicker {
  0%   { transform: scale(1, 1) skewX(0deg); opacity: 1; }
  25%  { transform: scale(0.9, 1.08) skewX(-3deg); opacity: 0.92; }
  50%  { transform: scale(1.06, 0.94) skewX(2deg); opacity: 1; }
  75%  { transform: scale(0.95, 1.05) skewX(-1deg); opacity: 0.95; }
  100% { transform: scale(1, 1) skewX(0deg); opacity: 1; }
}
@keyframes bt-smoke {
  0%   { transform: translate(0, 0) scale(0.5); opacity: 0.45; }
  100% { transform: translate(var(--bt-dx, 4px), -46px) scale(1.6); opacity: 0; }
}
@keyframes bt-spark {
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--bt-dx, 10px), var(--bt-dy, 18px)) scale(0.2); opacity: 0; }
}
@keyframes bt-ember {
  0%, 100% { opacity: 0.25; transform: scale(0.85); }
  50%      { opacity: 0.9; transform: scale(1.15); }
}
@keyframes bt-stress-shake {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-1.4px) rotate(-0.4deg); }
  40%      { transform: translateX(1.6px) rotate(0.4deg); }
  60%      { transform: translateX(-1.2px) rotate(-0.3deg); }
  80%      { transform: translateX(1.2px) rotate(0.3deg); }
}
@keyframes bt-boom-shake {
  0%   { transform: translate(0, 0); }
  20%  { transform: translate(-4px, 2px); }
  40%  { transform: translate(4px, -3px); }
  60%  { transform: translate(-3px, -2px); }
  80%  { transform: translate(3px, 2px); }
  100% { transform: translate(0, 0); }
}
@keyframes bt-flash {
  0%   { opacity: 0.95; }
  100% { opacity: 0; }
}
@keyframes bt-particle {
  0%   { transform: translate(-50%, -50%) translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) translate(var(--bt-dx), var(--bt-dy)) scale(0); opacity: 0; }
}
@keyframes bt-pulse-text {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}
@keyframes bt-bomb-shake {
  0%   { transform: translate(0, 0); }
  10%  { transform: translate(calc(var(--bt-amp) * -1), calc(var(--bt-amp) * 0.6)); }
  20%  { transform: translate(calc(var(--bt-amp) * 0.8), calc(var(--bt-amp) * -0.9)); }
  30%  { transform: translate(calc(var(--bt-amp) * -0.6), calc(var(--bt-amp) * -0.4)); }
  40%  { transform: translate(calc(var(--bt-amp) * 1), calc(var(--bt-amp) * 0.5)); }
  50%  { transform: translate(calc(var(--bt-amp) * -0.9), calc(var(--bt-amp) * 0.8)); }
  60%  { transform: translate(calc(var(--bt-amp) * 0.5), calc(var(--bt-amp) * -0.7)); }
  70%  { transform: translate(calc(var(--bt-amp) * -1), calc(var(--bt-amp) * -0.3)); }
  80%  { transform: translate(calc(var(--bt-amp) * 0.7), calc(var(--bt-amp) * 0.9)); }
  90%  { transform: translate(calc(var(--bt-amp) * -0.4), calc(var(--bt-amp) * 0.6)); }
  100% { transform: translate(0, 0); }
}
.bt-anim-paused * { animation-play-state: paused !important; }
`;
  document.head.appendChild(style);
}

interface Particle {
  id: number;
  dx: number;
  dy: number;
  delay: number;
  duration: number;
  size: number;
}

function makeParticles(count: number, spreadX: number, spreadY: number, seedOffset = 0): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + seedOffset;
    return {
      id: i,
      dx: Math.cos(angle) * spreadX * (0.6 + 0.4 * ((i * 37) % 5) / 4),
      dy: Math.sin(angle) * spreadY * (0.6 + 0.4 * ((i * 53) % 5) / 4),
      delay: (i * 0.13) % 1,
      duration: 0.9 + ((i * 0.21) % 0.6),
      size: 2 + ((i * 3) % 3),
    };
  });
}

export function BombTimer({
  timeLeft,
  totalTime,
  onTimeUp,
  isGameActive = true,
  stressThreshold = 0.2,
  forceStress = false,
  colors,
  width = "100%",
  height = 90,
  className,
}: BombTimerProps) {
  const c = useMemo(() => ({ ...DEFAULT_COLORS, ...colors }), [colors]);

  const displayedRatioRef = useRef(clamp01(timeLeft / totalTime));
  const targetRatioRef = useRef(displayedRatioRef.current);
  const rafIdRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  const ropeRef = useRef<SVGRectElement>(null);
  const ashRef = useRef<SVGRectElement>(null);
  const twistRef = useRef<SVGRectElement>(null);
  const flameGroupRef = useRef<SVGGElement>(null);
  const bombGroupRef = useRef<SVGGElement>(null);
  const fuseLineRef = useRef<SVGLineElement>(null);
  const emitterRef = useRef<HTMLDivElement>(null);

  const [exploded, setExploded] = useState(false);
  const explodedFiredRef = useRef(false);

  useEffect(() => ensureStylesInjected(), []);

  const applyRatioToDom = (ratio: number) => {
    // La meche part de l'ancrage a DROITE (temps plein) et brule vers la
    // GAUCHE ou la bombe finit par exploser (temps ecoule).
    const markerX = RIGHT_X - (1 - ratio) * TRACK_LEN;

    if (ashRef.current) {
      ashRef.current.setAttribute("x", String(markerX));
      ashRef.current.setAttribute("width", String(Math.max(0, RIGHT_X - markerX)));
    }
    if (ropeRef.current) {
      ropeRef.current.setAttribute("x", String(LEFT_X));
      ropeRef.current.setAttribute("width", String(Math.max(0, markerX - LEFT_X)));
    }
    if (twistRef.current) {
      twistRef.current.setAttribute("x", String(LEFT_X));
      twistRef.current.setAttribute("width", String(Math.max(0, markerX - LEFT_X)));
    }
    if (flameGroupRef.current) {
      flameGroupRef.current.setAttribute("transform", `translate(${markerX}, ${CY})`);
    }
    if (fuseLineRef.current) {
      fuseLineRef.current.setAttribute("x1", String(markerX));
      fuseLineRef.current.setAttribute("x2", String(BOMB_FIXED_X + BOMB_RADIUS));
    }
    if (emitterRef.current) {
      emitterRef.current.style.left = `${(markerX / VB_W) * 100}%`;
    }
  };

  const tick = () => {
    const target = targetRatioRef.current;
    const cur = displayedRatioRef.current;
    const diff = target - cur;

    if (Math.abs(diff) < CONVERGE_EPSILON) {
      displayedRatioRef.current = target;
      applyRatioToDom(target);
      runningRef.current = false;
      rafIdRef.current = null;
      return;
    }

    displayedRatioRef.current = cur + diff * SMOOTHING;
    applyRatioToDom(displayedRatioRef.current);
    rafIdRef.current = requestAnimationFrame(tick);
  };

  const kick = () => {
    if (!runningRef.current) {
      runningRef.current = true;
      rafIdRef.current = requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    applyRatioToDom(displayedRatioRef.current);
    kick();
    return () => {
      // En StrictMode (dev) React monte/demonte/remonte cet effet : il faut
      // remettre runningRef a false ici, sinon kick() croit a tort qu'une
      // boucle tourne deja et n'en replanifie plus jamais apres le remount.
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      runningRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    targetRatioRef.current = clamp01(timeLeft / totalTime);
    kick();
  }, [timeLeft, totalTime]);

  useEffect(() => {
    if (timeLeft <= 0 && !explodedFiredRef.current) {
      explodedFiredRef.current = true;
      setExploded(true);
      onTimeUp?.();
    }
    if (timeLeft > 0 && explodedFiredRef.current) {
      explodedFiredRef.current = false;
      setExploded(false);
    }
  }, [timeLeft, onTimeUp]);

  const stressActive =
    !exploded && (forceStress || (isGameActive && timeLeft > 0 && timeLeft <= Math.max(5, totalTime * stressThreshold)));

  // Tremblement de la bombe : demarre a 15s, s'intensifie a l'approche de 0.
  const bombShakeTier =
    !exploded && isGameActive && timeLeft > 0
      ? timeLeft <= 5
        ? "violent"
        : timeLeft <= 10
          ? "medium"
          : timeLeft <= 15
            ? "light"
            : null
      : null;
  const bombShakeAmp = bombShakeTier === "violent" ? 13 : bombShakeTier === "medium" ? 6.5 : bombShakeTier === "light" ? 2.5 : 0;
  const bombShakeDuration = bombShakeTier === "violent" ? 0.07 : bombShakeTier === "medium" ? 0.08 : 0.09;

  const smokeParticles = useMemo(() => makeParticles(4, 5, 1, 0.3), []);
  const sparkParticles = useMemo(() => makeParticles(6, 16, 22, 1.1), []);
  const emberDots = useMemo(
    () => [
      { t: 0.28, y: -3, delay: 0 },
      { t: 0.52, y: 4, delay: 0.5 },
      { t: 0.76, y: -2, delay: 1 },
    ],
    []
  );
  const explosionBits = useMemo(() => makeParticles(14, 42, 42, 0.2), []);
  const explosionLeftPct = (LEFT_X / VB_W) * 100;

  return (
    <div
      className={cn("select-none", stressActive && "animate-[bt-stress-shake_0.35s_ease-in-out_infinite]", className)}
      style={{ width, maxWidth: "100%" }}
    >
      <div
        className="pointer-events-none text-center font-display text-lg font-extrabold tabular-nums"
        style={{
          color: stressActive ? c.danger : "inherit",
          animation: stressActive ? "bt-pulse-text 0.6s ease-in-out infinite" : undefined,
        }}
      >
        {formatTime(timeLeft)}
      </div>

      <div className="relative w-full" style={{ aspectRatio: `${VB_W} / ${VB_H}`, maxHeight: height }}>
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          width="100%"
          height="100%"
          className={cn(!isGameActive && !exploded && "bt-anim-paused")}
        >
          <defs>
            <linearGradient id="bt-rope-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={c.ropeTop} />
              <stop offset="100%" stopColor={c.ropeBottom} />
            </linearGradient>
            <linearGradient id="bt-ash-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={c.ash} />
              <stop offset="100%" stopColor={c.ashDark} />
            </linearGradient>
            <radialGradient id="bt-flame-grad">
              <stop offset="0%" stopColor={c.flameCore} />
              <stop offset="45%" stopColor={c.flameMid} />
              <stop offset="100%" stopColor={c.flameOuter} stopOpacity="0" />
            </radialGradient>
            <pattern id="bt-rope-twist" width="10" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
              <rect width="10" height="6" fill="transparent" />
              <rect width="10" height="2.4" fill="rgba(0,0,0,0.18)" />
            </pattern>
          </defs>

          {/* Cendre : trainee deja consumee, de l'ancrage jusqu'a la flamme */}
          <rect ref={ashRef} x={RIGHT_X} y={CY - ROPE_HALF_H} width={0} height={ROPE_HALF_H * 2} fill="url(#bt-ash-grad)" rx="2" />

          {/* Meche restante : de la flamme jusqu'a la bombe, se raccourcit quand le temps baisse */}
          <rect ref={ropeRef} x={LEFT_X} y={CY - ROPE_HALF_H} width={0} height={ROPE_HALF_H * 2} fill="url(#bt-rope-grad)" rx="2" />
          <rect
            ref={twistRef}
            x={LEFT_X}
            y={CY - ROPE_HALF_H}
            width={0}
            height={ROPE_HALF_H * 2}
            fill="url(#bt-rope-twist)"
            opacity="0.5"
          />

          {/* Braises residuelles dans la partie deja brulee */}
          {emberDots.map((e, i) => (
            <circle
              key={i}
              cx={RIGHT_X - TRACK_LEN * e.t}
              cy={CY + e.y}
              r="1.6"
              fill={c.spark}
              style={{
                animation: `bt-ember 1.6s ease-in-out ${e.delay}s infinite`,
                transformOrigin: "center",
                transformBox: "fill-box",
              }}
            />
          ))}

          {/* Fusible visible entre la meche et la bombe */}
          <line
            ref={fuseLineRef}
            x1={RIGHT_X}
            y1={CY}
            x2={BOMB_FIXED_X + BOMB_RADIUS}
            y2={CY}
            stroke={c.ropeBottom}
            strokeWidth="2"
          />

          {/* Flamme, au point de combustion */}
          <g ref={flameGroupRef} transform={`translate(${RIGHT_X}, ${CY})`}>
            <circle
              r="10"
              fill="url(#bt-flame-grad)"
              style={{
                animation: `bt-flicker ${stressActive ? 0.22 : 0.4}s ease-in-out infinite`,
                transformOrigin: "center",
                transformBox: "fill-box",
                filter: "blur(0.4px)",
              }}
            />
            <circle
              r="4.5"
              fill={c.flameCore}
              style={{
                animation: `bt-flicker ${stressActive ? 0.18 : 0.32}s ease-in-out infinite reverse`,
                transformOrigin: "center",
                transformBox: "fill-box",
              }}
            />
          </g>

          {/* Bombe — position fixe, tremble seule quand le temps devient critique */}
          <g transform={`translate(${BOMB_FIXED_X}, ${CY})`}>
            <g
              ref={bombGroupRef}
              style={
                bombShakeTier
                  ? ({
                      "--bt-amp": `${bombShakeAmp}px`,
                      animation: `bt-bomb-shake ${bombShakeDuration}s linear infinite`,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <circle
                r={BOMB_RADIUS}
                fill={c.bombBody}
                stroke={bombShakeTier === "violent" ? c.danger : c.bombRim}
                strokeWidth="1.6"
              />
              <circle cx="-4" cy="-4" r="4" fill="rgba(255,255,255,0.14)" />
              <rect x="-2" y={-BOMB_RADIUS - 6} width="4" height="6" rx="1.5" fill="#555" />
              <circle cx="0" cy={-BOMB_RADIUS - 7} r="2.4" fill={c.bombRim} opacity="0.9" />
            </g>
          </g>
        </svg>

        {/* Fumee + etincelles, suit la position de la flamme sans re-render React */}
        <div
          ref={emitterRef}
          className={cn("pointer-events-none absolute top-1/2 h-0 w-0", !isGameActive && !exploded && "bt-anim-paused")}
          style={{ left: `${(RIGHT_X / VB_W) * 100}%` }}
        >
          {smokeParticles.map((p) => (
            <span
              key={`smoke-${p.id}`}
              className="absolute rounded-full"
              style={
                {
                  width: p.size + 3,
                  height: p.size + 3,
                  left: -((p.size + 3) / 2),
                  top: -6,
                  background: c.smoke,
                  opacity: 0,
                  "--bt-dx": `${p.dx}px`,
                  animation: `bt-smoke ${1.6 + p.duration}s ease-out ${p.delay}s infinite`,
                } as React.CSSProperties
              }
            />
          ))}
          {sparkParticles.map((p) => (
            <span
              key={`spark-${p.id}`}
              className="absolute rounded-full"
              style={
                {
                  width: p.size,
                  height: p.size,
                  left: -(p.size / 2),
                  top: 0,
                  background: c.spark,
                  opacity: 0,
                  "--bt-dx": `${p.dx}px`,
                  "--bt-dy": `${p.dy}px`,
                  animation: `bt-spark ${p.duration}s ease-in ${p.delay}s infinite`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* Explosion */}
        {exploded && (
          <div className={cn("pointer-events-none absolute inset-0 overflow-visible", "animate-[bt-boom-shake_0.5s_ease-in-out]")}>
            <div
              className="absolute rounded-full"
              style={{
                left: `${explosionLeftPct}%`,
                top: "50%",
                width: 90,
                height: 90,
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(circle, ${c.flameCore} 0%, ${c.flameMid} 35%, ${c.flameOuter} 65%, transparent 75%)`,
                animation: "bt-flash 0.5s ease-out forwards",
              }}
            />
            {explosionBits.map((p) => (
              <span
                key={`boom-${p.id}`}
                className="absolute rounded-full"
                style={
                  {
                    left: `${explosionLeftPct}%`,
                    top: "50%",
                    width: p.size + 2,
                    height: p.size + 2,
                    background: p.id % 2 === 0 ? c.flameMid : c.spark,
                    "--bt-dx": `${p.dx}px`,
                    "--bt-dy": `${p.dy}px`,
                    animation: `bt-particle ${0.5 + p.duration * 0.4}s ease-out ${p.delay * 0.15}s forwards`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Exemple d'utilisation minimal, branché sur le hook de countdown déjà
 * présent dans le projet (voir src/hooks/useCountdown.ts, utilisé par
 * Time Attack / Quiz du jour / Ranked / Duel).
 *
 * import { useCountdown } from "@/hooks/useCountdown";
 * import { BombTimer } from "@/components/game/BombTimer";
 *
 * function TimeAttackPage() {
 *   const [gameOver, setGameOver] = useState(false);
 *   const { secondsLeft, addSeconds } = useCountdown(60, {
 *     active: !gameOver,
 *     onExpire: () => setGameOver(true),
 *   });
 *
 *   // bonne reponse : addSeconds(3)
 *   // mauvaise reponse : addSeconds(-2)
 *
 *   return (
 *     <BombTimer
 *       timeLeft={secondsLeft}
 *       totalTime={60}
 *       isGameActive={!gameOver}
 *       onTimeUp={() => setGameOver(true)}
 *     />
 *   );
 * }
 */

/**
 * Petit banc de test autonome pour verifier que les variations rapides
 * (+3s, -2s, +3s...) restent fluides. Pas branche a une route, juste a
 * importer temporairement dans une page pour visualiser.
 */
export function BombTimerPlayground() {
  const [timeLeft, setTimeLeft] = useState(60);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <BombTimer timeLeft={timeLeft} totalTime={60} isGameActive={active} onTimeUp={() => setActive(false)} />
      <div className="flex gap-2">
        <button className="rounded bg-primary px-3 py-2 text-sm font-bold text-white" onClick={() => setTimeLeft((t) => t + 3)}>
          +3s (bonne réponse)
        </button>
        <button className="rounded bg-danger px-3 py-2 text-sm font-bold text-white" onClick={() => setTimeLeft((t) => Math.max(0, t - 2))}>
          -2s (mauvaise réponse)
        </button>
        <button className="rounded bg-ink/20 px-3 py-2 text-sm font-bold" onClick={() => { setTimeLeft(60); setActive(true); }}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default BombTimer;
