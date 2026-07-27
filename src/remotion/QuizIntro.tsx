"use client";

import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const INTRO_FPS = 30;
export const INTRO_DURATION_IN_FRAMES = 120;
export const INTRO_WIDTH = 1080;
export const INTRO_HEIGHT = 1080;

export function QuizIntro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.6 },
  });

  const logoOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowPulse = 0.6 + 0.4 * Math.sin(frame / 6);

  const floatT = (frame % 90) / 90;
  const floatOffset = -8 * ((1 - Math.cos(2 * Math.PI * floatT)) / 2);

  const titleOpacity = interpolate(frame, [22, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [22, 42], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const hintEntrance = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hintPulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(frame / 8));
  const hintOpacity = hintEntrance * hintPulse;

  const fadeOutOpacity = interpolate(frame, [96, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOutScale = interpolate(frame, [96, 120], [1, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 40%, #1A227E 0%, #171B2E 70%)",
        opacity: fadeOutOpacity,
      }}
      className="flex items-center justify-center"
    >
      <div
        style={{
          transform: `scale(${scale * fadeOutScale})`,
          opacity: logoOpacity,
        }}
        className="flex flex-col items-center gap-6"
      >
        <div
          style={{
            transform: `translateY(${floatOffset}px)`,
            filter: `drop-shadow(0 0 ${30 * glowPulse}px rgba(255,20,147,${(
              0.7 * glowPulse
            ).toFixed(2)})) drop-shadow(0 0 ${45 * glowPulse}px rgba(0,71,171,${(
              0.6 * glowPulse
            ).toFixed(2)}))`,
          }}
        >
          <Img src="/logo.png" style={{ width: 260, height: 260, objectFit: "contain" }} />
        </div>
        <div
          style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}
          className="flex flex-col items-center"
        >
          <h1 className="font-display text-5xl font-extrabold tracking-wide text-white">
            RANKED <span className="text-secondary-light">QUIZ</span>
          </h1>
          <p className="mt-1 text-sm uppercase tracking-[0.3em] text-primary-light">
            Live &amp; Competitive
          </p>
        </div>
        <p
          style={{ opacity: hintOpacity }}
          className="mt-2 text-xs font-semibold tracking-wide text-white/60"
        >
          Touche pour continuer
        </p>
      </div>
    </AbsoluteFill>
  );
}
