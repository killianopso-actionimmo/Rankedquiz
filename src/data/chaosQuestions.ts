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
  // ---------------------------------------------------------- ROUND 1 TRASH
  [
    "Qui a une relation secrète en ce moment ?",
    "Qui a couché avec quelqu'un du groupe ?",
    "Qui regarde du porno en ce moment ?",
    "Qui a trompé son partenaire récemment ?",
    "Qui a payé pour du sexe ?",
    "Qui s'est touché en pensant à quelqu'un ici ?",
    "Qui a des vidéos compromettantes quelque part ?",
    "Qui ferait l'amour avec deux personnes la même nuit ?",
    "Qui a menti sur sa vie sexuelle au groupe ?",
    "Qui a une relation complètement dingue en secret ?",
  ],
  // ---------------------------------------------------- ROUND 2 TRASH
  [
    "Qui a fantasmé sur quelqu'un d'ici cette semaine ?",
    "Qui coucherait avec quelqu'un du groupe si personne ne saurait ?",
    "Qui enverrait une photo nue au mauvais groupe ?",
    "Qui a couché à cause que de l'alcool ou drogue ?",
    "Qui a une obsession sexuelle bizarre ?",
    "Qui a refusé une relation pour juste du sexe ?",
    "Qui a filmé quelqu'un en secret pendant du sexe ?",
    "Qui a plusieurs partenaires en même temps ?",
    "Qui a un kink super dark et humiliant ?",
    "Qui a fait un truc sexuel complètement fou bourré ?",
  ],
  // ----------------------------------------------------------- ROUND 3 TRASH
  [
    "Qui a couché avec un ex très récemment ?",
    "Qui baiserait quelqu'un ici ce soir sans hésiter ?",
    "Qui a une bite pics envoyé à quelqu'un ici ?",
    "Qui a laisser quelqu'un d'ici le toucher ?",
    "Qui a une rage de sexe constante ?",
    "Qui a un fantasme sur quelqu'un du groupe ?",
    "Qui a menti sur le nombre de partenaires sexuels ?",
    "Qui referait le même truc dégueulasse demain ?",
    "Qui devient complètement pervers quand bourré ?",
    "Qui a le dossier le plus dark sur son téléphone ?",
  ],
  // ------------------------------------------------------ ROUND 4 TRASH
  [
    "Qui cherche juste du sexe sans relation ?",
    "Qui a couché avec un ami du groupe ?",
    "Qui a des fantasmes sur plusieurs personnes ici ?",
    "Qui ment constamment sur ses conquêtes ?",
    "Qui a une addiction au sexe vraiment grave ?",
    "Qui a filmé du sexe sans l'accord de l'autre ?",
    "Qui a trop de sextapes en circulation ?",
    "Qui a une relation très toxique sexuellement ?",
    "Qui ferait n'importe quoi sexuellement ce soir ?",
    "Qui cache le secret le plus dégueulasse du groupe ?",
  ],
  // --------------------------------------------------------- ROUND 5 TRASH
  [
    "Qui a le plus gros secret sexuel jamais ?",
    "Qui tricherait sur son mec/sa meuf demain ?",
    "Qui a une double vie sexuelle ?",
    "Qui cache une vidéo porno d'un ami ici ?",
    "Qui a couché avec quelqu'un du groupe sans le dire ?",
    "Qui a une reputation de salope/salaud du groupe ?",
    "Qui a un truc vraiment pervers qu'on connait pas ?",
    "Qui a la vie sexuelle la plus chaotique ?",
    "Qui ferait l'amour avec n'importe qui ce soir ?",
    "Qui cache le pire des secrets jamais du groupe ?",
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
