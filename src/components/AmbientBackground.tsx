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
 * Degrade a estompement progressif, sans filtre.
 *
 * Ces halos etaient rendus par un `blur(100px)` applique a un degrade simple.
 * Un flou de 100px deborde d'environ 300px de chaque cote : les trois halos
 * representaient ~2.9 megapixels de texture filtree a composer en permanence,
 * pour un resultat qu'un degrade multi-arrets reproduit a l'identique. Un
 * simple `transparent` en fin de course ne suffit pas (l'interpolation passe
 * par du noir premultiplie et laisse un bord de cercle visible) : d'ou les
 * paliers intermediaires et l'alpha 0 explicite.
 */
/** Agrandissement compensant la diffusion que produisait le flou. */
const HALO_SCALE = 1.5;

function haloGradient(color: string): string {
  return (
    `radial-gradient(circle, ` +
    `rgb(${color} / .14) 0%, ` +
    `rgb(${color} / .10) 25%, ` +
    `rgb(${color} / .05) 48%, ` +
    `rgb(${color} / .02) 68%, ` +
    `rgb(${color} / 0) 85%)`
  );
}

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
        // Le scale fait partie de la meme propriete : l'omettre ici remettrait
        // les halos a leur taille d'origine des le premier evenement de scroll.
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0) scale(${HALO_SCALE})`;
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
          className={`absolute animate-breath rounded-full ${halo.className}`}
          style={{
            // Volontairement discret : le fond de page doit rester #F9FAFB,
            // les halos ne font que le teinter.
            background: haloGradient(halo.color),
            // HALO_SCALE compense l'etalement que produisait le flou.
            transform: `translate3d(0,0,0) scale(${HALO_SCALE})`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
