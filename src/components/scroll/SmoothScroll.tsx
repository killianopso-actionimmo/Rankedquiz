"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import { MotionConfig, useReducedMotion } from "framer-motion";

/**
 * Remonte en haut a chaque changement de route, sans animation.
 * Doit vivre a l'interieur de <ReactLenis root> pour acceder a l'instance.
 */
function ScrollResetOnRouteChange() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    lenis.scrollTo(0, { immediate: true, force: true });
  }, [pathname, lenis]);

  return null;
}

/**
 * Smooth scroll global.
 *
 * - `autoRaf: true` : Lenis gere sa propre boucle requestAnimationFrame.
 * - `lerp` plutot que `duration` : lissage independant du framerate (120Hz ok).
 * - `syncTouch: false` : sur mobile on garde le scroll natif (momentum systeme,
 *   masquage de la barre d'URL, zero jank). Lenis ne lisse que la molette/trackpad.
 * - `prefers-reduced-motion` : lerp a 1 = aucun lissage, on respecte l'utilisateur.
 *   Cote animations, <MotionConfig reducedMotion="user"> laisse framer-motion
 *   neutraliser les translations tout en gardant les fondus -- sans modifier le
 *   markup, donc sans casser l'hydratation SSR.
 * - `allowNestedScroll` : les conteneurs scrollables internes (tableaux, modales)
 *   gardent leur scroll natif au lieu d'etre captures par Lenis.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const prefersReduced = useReducedMotion() ?? false;

  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: prefersReduced ? 1 : 0.11,
        smoothWheel: !prefersReduced,
        wheelMultiplier: 1,
        syncTouch: false,
        touchMultiplier: 1.6,
        gestureOrientation: "vertical",
        orientation: "vertical",
        overscroll: false,
        anchors: true,
        allowNestedScroll: true,
        autoResize: true,
      }}
    >
      <MotionConfig reducedMotion="user">
        <ScrollResetOnRouteChange />
        {children}
      </MotionConfig>
    </ReactLenis>
  );
}
