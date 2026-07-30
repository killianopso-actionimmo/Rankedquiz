"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

const AXIS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
  none: { x: 0, y: 0 },
};

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Sens d'arrivee de l'element. */
  direction?: Direction;
  /** Distance parcourue en px. */
  distance?: number;
  delay?: number;
  duration?: number;
  /** Echelle de depart (0.96 = leger zoom avant). */
  from?: number;
  /** Rejouer l'animation a chaque passage. */
  repeat?: boolean;
  /** Fraction de l'element visible avant declenchement (0 - 1). */
  amount?: number;
};

/**
 * Revele un bloc quand il entre dans le viewport.
 *
 * Repose sur IntersectionObserver (via framer-motion) : aucun calcul par frame,
 * aucun listener de scroll. Le cout est nul entre deux franchissements de seuil.
 *
 * `prefers-reduced-motion` est gere globalement par <MotionConfig reducedMotion="user">
 * dans SmoothScroll : framer-motion neutralise alors les translations et ne garde
 * que le fondu. On ne branche donc PAS l'arbre rendu ici -- le faire produirait un
 * markup different entre le serveur (pas de matchMedia) et le client, donc une
 * erreur d'hydratation pour tous les utilisateurs en mouvement reduit.
 */
export function Reveal({
  children,
  className,
  direction = "up",
  distance = 24,
  delay = 0,
  duration = 0.55,
  from = 1,
  repeat = false,
  amount = 0.2,
}: RevealProps) {
  const axis = AXIS[direction];

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x: axis.x * distance,
        y: axis.y * distance,
        scale: from,
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: !repeat, amount }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Conteneur qui decale l'apparition de ses enfants.
 * Les enfants doivent porter `variants={revealItem}`.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  delay = 0,
  amount = 0.15,
  repeat = false,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  amount?: number;
  repeat?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !repeat, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Variante a appliquer aux enfants directs d'un <RevealGroup>. */
export const revealItem: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE },
  },
};
