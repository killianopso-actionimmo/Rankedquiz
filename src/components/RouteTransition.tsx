"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Transition entre les routes.
 *
 * Important : ce conteneur ne doit PAS etre `absolute inset-0 overflow-y-auto`.
 * Sinon il devient le vrai conteneur de scroll et le document ne scrolle plus,
 * ce qui neutralise Lenis (qui ecoute le scroll de la page) et casse le scroll
 * natif mobile (masquage de la barre d'URL, restauration de position).
 *
 * On reste donc dans le flux avec `flex-1`, et `mode="wait"` evite que les deux
 * pages s'empilent verticalement pendant le croisement.
 *
 * Ne PAS remettre `initial={false}` sur AnimatePresence : la valeur se propage via
 * PresenceContext a TOUS les composants motion descendants, qui montent alors
 * directement dans leur etat final. Concretement les <Reveal> apparaissent deja
 * visibles et plus rien ne s'anime au scroll.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{
          duration: 0.26,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex flex-1 flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
