"use client";

import { useRef } from "react";
import { useLenis } from "lenis/react";

/**
 * Barre de progression de lecture, collee en haut de l'ecran.
 *
 * Perf : on ecrit directement `scaleX` sur le noeud (transform composee GPU),
 * jamais via setState. Le composant ne se re-rend jamais apres le montage.
 * Priorite 0 pour passer avant les callbacks de parallax.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const visible = useRef(false);

  useLenis(({ progress, limit }) => {
    const el = barRef.current;
    if (!el) return;

    // Page trop courte pour scroller : on masque la barre.
    const shouldShow = limit > 40;
    if (shouldShow !== visible.current) {
      visible.current = shouldShow;
      el.style.opacity = shouldShow ? "1" : "0";
    }

    const clamped = Number.isFinite(progress)
      ? Math.max(0, Math.min(1, progress))
      : 0;
    el.style.transform = `scaleX(${clamped.toFixed(4)})`;
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-primary via-secondary to-highlight opacity-0 transition-opacity duration-300"
        style={{ transform: "scaleX(0)", willChange: "transform" }}
      />
    </div>
  );
}
