"use client";

import { useRef } from "react";
import { useLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";

/** Teintes prises dans les tokens : vanilla, cyan, highlight. */
const HALOS = [
  { color: "var(--c-vanilla)", drift: -0.06, className: "-left-24 -top-24 h-[26rem] w-[26rem]" },
  { color: "var(--c-cyan)", drift: 0.1, className: "-right-24 top-1/3 h-[24rem] w-[24rem]" },
  { color: "var(--c-highlight)", drift: -0.14, className: "-bottom-24 left-1/4 h-[22rem] w-[22rem]" },
];

/**
 * Halos d'ambiance avec derive au scroll.
 *
 * Les halos sont en `fixed`, donc un simple `scroll * drift` suffit a creer la
 * profondeur : chaque couche bouge a sa propre vitesse. On ecrit la transform
 * directement sur les noeuds (aucun rendu React pendant le scroll) et on plafonne
 * le deplacement pour que les halos ne quittent jamais l'ecran.
 */
export function AmbientBackground() {
  const layers = useRef<Array<HTMLDivElement | null>>([]);
  const prefersReduced = useReducedMotion() ?? false;

  useLenis(
    ({ scroll }) => {
      if (prefersReduced) return;

      for (let i = 0; i < HALOS.length; i++) {
        const el = layers.current[i];
        if (!el) continue;

        const offset = Math.max(-180, Math.min(180, scroll * HALOS[i].drift));
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      }
    },
    [prefersReduced]
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background"
    >
      {HALOS.map((halo, i) => (
        <div
          key={i}
          ref={(node) => {
            layers.current[i] = node;
          }}
          className={`absolute animate-breath rounded-full blur-[100px] ${halo.className}`}
          style={{
            // Volontairement discret : le fond de page doit rester #F9FAFB,
            // les halos ne font que le teinter.
            background: `radial-gradient(circle, rgb(${halo.color} / 0.16), transparent 70%)`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
