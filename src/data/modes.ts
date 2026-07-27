import type { GameMode } from "@/types/quiz";

export const GAME_MODES: GameMode[] = [
  {
    id: "time-attack",
    title: "Time Attack",
    tagline: "20s chrono, chaque bonne réponse te sauve",
    href: "/play/time-attack",
    accent: "secondary",
    badge: "RAPIDE",
    logo: "/modes/time-attack.png",
  },
  {
    id: "jetpunk",
    title: "Jetpunk",
    tagline: "Tape vite, remplis la grille",
    href: "/play/jetpunk",
    accent: "primary",
    logo: "/modes/jetpunk.png",
  },
  {
    id: "ranked",
    title: "Ranked",
    tagline: "Grimpe les rangs, gagne de l'ELO",
    href: "/play/ranked",
    accent: "highlight",
    badge: "HOT",
    premium: true,
    logo: "/modes/ranked.png",
  },
  {
    id: "thematique",
    title: "Thématique",
    tagline: "Choisis ta catégorie préférée",
    href: "/play/thematique",
    accent: "primary",
    logo: "/modes/thematique.png",
  },
  {
    id: "duel",
    title: "Duel 1v1",
    tagline: "Affronte un adversaire en direct",
    href: "/play/duel",
    accent: "secondary",
    badge: "E-SPORT",
    logo: "/modes/duel.png",
  },
];
