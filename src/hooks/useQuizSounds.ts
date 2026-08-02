"use client";

import { useEffect, useRef } from "react";
import { QuizSoundManager } from "@/lib/QuizSoundManager";

/**
 * Instance unique partagee entre tous les modes : un seul AudioContext pour
 * toute la session, pas un par page/composant.
 */
let sharedManager: QuizSoundManager | null = null;

function getManager() {
  if (!sharedManager) sharedManager = new QuizSoundManager();
  return sharedManager;
}

/** Feedback sonore bonne/mauvaise reponse, transition, debut de partie. */
export function useQuizSounds() {
  const managerRef = useRef<QuizSoundManager>(getManager());

  useEffect(() => {
    const manager = managerRef.current;
    return () => {
      // Le manager est partage : on ne le detruit pas au demontage d'une page,
      // seulement s'il n'y a plus personne dessus n'aurait de sens de le faire,
      // mais garder le contexte vivant evite le cout de recreation entre modes.
      void manager;
    };
  }, []);

  return managerRef.current;
}
