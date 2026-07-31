import type { ChaosDeck, ChaosQuestion, ChaosRoundId } from "@/types/chaos";

/**
 * 100 questions "C'est qui..." pour QUIZ CHAOS.
 *
 * Chaque deck = 5 rounds de 10 questions, l'intensite monte round apres round.
 *   - DISCOVER : soft -> trash (on apprend a se connaitre)
 *   - CHAOS    : medium -> extreme (le groupe se connait deja, on tape)
 *
 * Les reponses ne sont jamais stockees : on repond a l'oral, c'est le principe.
 */

/** 10 questions par round, index 0 = round 1. */
type Deck = [string[], string[], string[], string[], string[]];

const DISCOVER: Deck = [
  // ------------------------------------------------------------ ROUND 1 soft
  [
    "C'est qui le plus souriant du groupe ?",
    "C'est qui qui a l'air le plus sportif ?",
    "Qui c'est qui a le meilleur style ce soir ?",
    "C'est qui qui semble le plus bavard ?",
    "Qui tu emmenerais en road trip demain ?",
    "C'est qui qui a la voix la plus agreable ?",
    "Qui c'est qui a l'air le plus organise ?",
    "C'est qui qui ferait le meilleur guide touristique ?",
    "Qui tu imagines debout a 6h du matin sans reveil ?",
    "C'est qui qui a l'air le plus gourmand ?",
  ],
  // ----------------------------------------------------- ROUND 2 medium-soft
  [
    "C'est qui le plus drole depuis le debut de la soiree ?",
    "Qui c'est qui parle le plus fort ?",
    "C'est qui qui craquerait en premier sur un fou rire ?",
    "Qui tu confierais les cles de chez toi ?",
    "C'est qui qui cache le plus de talents ?",
    "Qui c'est le plus tete en l'air ?",
    "C'est qui qui gere le mieux la pression ?",
    "Qui tu prends dans ton equipe pour un escape game ?",
    "C'est qui qui raconte les meilleures histoires ?",
    "Qui c'est qui a le plus de photos inutiles dans son telephone ?",
  ],
  // ---------------------------------------------------------- ROUND 3 medium
  [
    "C'est qui qui ment le mieux ?",
    "Qui tu confierais un secret ?",
    "C'est qui le plus jaloux ?",
    "Qui c'est qui pleure devant les films ?",
    "C'est qui qui a le plus mauvais caractere le matin ?",
    "Qui t'appelles a 3h du matin en cas de galere ?",
    "C'est qui le plus radin ?",
    "Qui c'est qui verifie son reflet le plus souvent ?",
    "C'est qui qui ghost le plus les gens ?",
    "Qui c'est qui a le pire gout musical ?",
  ],
  // ---------------------------------------------------- ROUND 4 medium-trash
  [
    "C'est qui qui a le plus de red flags ?",
    "Qui c'est qui tient le moins l'alcool ?",
    "C'est qui qui a stalke un ex ce mois-ci ?",
    "Qui tu ne laisserais jamais organiser une soiree ?",
    "C'est qui le plus dramatique quand il est malade ?",
    "Qui c'est qui a le plus de squelettes dans le placard ?",
    "C'est qui qui embrasserait quelqu'un du groupe en premier ?",
    "Qui c'est qui a la pire histoire de date ?",
    "C'est qui qui balance tout des qu'il a bu ?",
    "Qui c'est qui juge en silence depuis le debut de la soiree ?",
  ],
  // ----------------------------------------------------------- ROUND 5 trash
  [
    "C'est qui le plus infidele en puissance ?",
    "Qui c'est qui a le pire historique de recherche ?",
    "C'est qui qui finirait la soiree en pleurant ?",
    "Qui tu embrasserais si tu devais absolument choisir ?",
    "C'est qui qui a le plus menti ce soir ?",
    "Qui c'est qui a les pires gouts en matiere de partenaires ?",
    "C'est qui qui va recraquer pour son ex cette semaine ?",
    "Qui c'est qui ne survivrait pas 24h sans telephone ?",
    "C'est qui qui a fait le truc le plus honteux en soiree ?",
    "Qui c'est qui repartirait accompagne ce soir ?",
  ],
];

const CHAOS: Deck = [
  // ---------------------------------------------------------- ROUND 1 medium
  [
    "C'est qui le plus chiant en soiree ?",
    "Qui c'est qui arrive toujours en retard ?",
    "C'est qui qui parle trop de lui ?",
    "Qui c'est le plus accro a son telephone ?",
    "C'est qui qui a le pire humour ?",
    "Qui tu virerais du groupe sans hesiter ?",
    "C'est qui le plus faux-cul ?",
    "Qui c'est qui a le plus change depuis qu'on le connait ?",
    "C'est qui qui ne rembourse jamais ?",
    "Qui c'est qui se plaint le plus ?",
  ],
  // ---------------------------------------------------- ROUND 2 medium-trash
  [
    "C'est qui qui a le plus de red flags amoureux ?",
    "Qui c'est qui a la pire hygiene de vie ?",
    "C'est qui qui a pleure pour une histoire de coeur cette annee ?",
    "Qui c'est qui repond aux messages a 4h du matin ?",
    "C'est qui le plus toxique en couple ?",
    "Qui c'est qui a un compte Insta secret ?",
    "C'est qui qui a le pire ex ?",
    "Qui c'est qui ne survivrait pas a 3 mois de celibat ?",
    "C'est qui qui a deja fait un scandale en public ?",
    "Qui c'est qui verifie le telephone de son ou sa partenaire ?",
  ],
  // ----------------------------------------------------------- ROUND 3 trash
  [
    "C'est qui qui a deja embrasse quelqu'un du groupe ?",
    "Qui c'est qui a le pire historique de navigation ?",
    "C'est qui qui a menti sur son nombre de partenaires ?",
    "Qui c'est qui a des messages jamais envoyes qu'il relit encore ?",
    "C'est qui qui a deja trompe quelqu'un ?",
    "Qui c'est qui a la pire reputation ?",
    "C'est qui qui a deja vole quelque chose ?",
    "Qui c'est qui a deja supplie pour recuperer quelqu'un ?",
    "C'est qui qui a le plus de regrets de soiree ?",
    "Qui c'est qui a deja fait semblant d'aimer quelqu'un ?",
  ],
  // ------------------------------------------------------ ROUND 4 tres trash
  [
    "C'est qui qui craquerait sur quelqu'un ici ce soir ?",
    "Qui c'est qui a le plus gros ego pour le moins de resultats ?",
    "C'est qui qui s'est deja fait bloquer par un ex ?",
    "Qui c'est qui a la pire histoire de fin de soiree ?",
    "C'est qui qui refera exactement la meme erreur amoureuse demain ?",
    "Qui c'est qui a deja drague un pote de son ex ?",
    "C'est qui qui a le plus honte de son passe ?",
    "Qui c'est qui a envoye un message qu'il regrette encore aujourd'hui ?",
    "C'est qui qui trahirait le groupe pour de l'argent ?",
    "Qui c'est qui est en train de mentir la, maintenant ?",
  ],
  // --------------------------------------------------------- ROUND 5 extreme
  [
    "C'est qui qui a le plus gros secret dans cette piece ?",
    "Qui c'est qui a deja ete amoureux de quelqu'un ici ?",
    "C'est qui qui finira seul si rien ne change ?",
    "Qui tu supprimerais de ta vie sans aucun regret ?",
    "C'est qui qui a fait le pire truc qu'on ne sait pas encore ?",
    "Qui c'est qui a deja balance un secret du groupe ?",
    "C'est qui qui embrasserait quelqu'un ici, la, maintenant ?",
    "Qui c'est qui a menti sur un truc important ce soir ?",
    "C'est qui qui ne devrait vraiment pas etre en couple ?",
    "Qui c'est qui a le plus a perdre si tout se savait ?",
  ],
];

const DECKS: Record<ChaosDeck, Deck> = { discover: DISCOVER, chaos: CHAOS };

export const CHAOS_DECK_META: Record<
  ChaosDeck,
  { label: string; tagline: string; detail: string; accent: "secondary" | "danger" }
> = {
  discover: {
    label: "DISCOVER",
    tagline: "Vous ne vous connaissez pas encore",
    detail: "Escalade lente. On commence soft, on finit par se dire des trucs.",
    accent: "secondary",
  },
  chaos: {
    label: "CHAOS",
    tagline: "Vous vous connaissez deja trop bien",
    detail: "Escalade brutale. Ca part en vrille des le round 2.",
    accent: "danger",
  },
};

/** Melange Fisher-Yates (copie, ne mute pas l'entree). */
export function shuffle<T>(input: readonly T[]): T[] {
  const out = [...input];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Construit la file de 50 questions : l'ordre des rounds est fixe (c'est
 * l'escalade), l'ordre a l'interieur d'un round est melange a chaque partie.
 */
export function buildChaosQueue(deck: ChaosDeck): ChaosQuestion[] {
  return DECKS[deck].flatMap((round, i) =>
    shuffle(round).map((text, j) => ({
      id: `${deck}-r${i + 1}-${j}`,
      text,
      round: (i + 1) as ChaosRoundId,
    })),
  );
}

export const CHAOS_TOTAL_QUESTIONS = 50;
