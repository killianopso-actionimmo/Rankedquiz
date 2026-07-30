"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";

/**
 * Parallax vertical leger sur un element dans le flux.
 *
 * Perf : la position du bloc est mesuree une seule fois (puis sur resize), pas a
 * chaque frame. Le callback de scroll n'ecrit qu'une `transform` composee sur le
 * GPU -- pas de setState, donc zero rendu React pendant le scroll.
 */
export function Parallax({
  children,
  className,
  /** Amplitude. 0.1 = discret, 0.3 = marque. Negatif = sens inverse. */
  speed = 0.12,
  /** Deplacement max en px, pour eviter les trous dans la mise en page. */
  clamp = 60,
  /** Desactive sous cette largeur (px) : sur mobile le parallax coute plus qu'il rapporte. */
  minWidth = 768,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  clamp?: number;
  minWidth?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const bounds = useRef({ top: 0, height: 0 });
  const enabled = useRef(true);
  const prefersReduced = useReducedMotion() ?? false;

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    enabled.current = window.innerWidth >= minWidth && !prefersReduced;

    if (!enabled.current) {
      el.style.transform = "";
      return;
    }

    const rect = el.getBoundingClientRect();
    bounds.current = {
      top: rect.top + window.scrollY,
      height: rect.height,
    };
  }, [minWidth, prefersReduced]);

  useEffect(() => {
    measure();

    const el = ref.current;
    const observer = new ResizeObserver(measure);
    if (el) observer.observe(el);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  useLenis(
    ({ scroll }) => {
      const el = ref.current;
      if (!el || !enabled.current) return;

      const { top, height } = bounds.current;
      const viewport = window.innerHeight;

      // Centre de l'element par rapport au centre du viewport, normalise en -1..1.
      const distanceFromCenter =
        top + height / 2 - scroll - viewport / 2;
      const progress = distanceFromCenter / (viewport / 2 + height / 2);

      const offset = Math.max(
        -clamp,
        Math.min(clamp, progress * speed * 100)
      );

      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    },
    [speed, clamp]
  );

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
