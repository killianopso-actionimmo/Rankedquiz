import { Badge, BadgeCategory } from "@/types/badge";

export const ALL_BADGES: Record<string, Omit<Badge, "unlockedAt">> = {
  // STARTER / PREMIERS PAS
  premiere_etincelle: {
    id: "premiere_etincelle",
    title: "Première Étincelle",
    description: "Répondre correctement à sa toute première question.",
    icon: "🎯",
    category: "starter",
    isHidden: false,
  },
  explorateur: {
    id: "explorateur",
    title: "Explorateur",
    description: "Essayer au moins une fois tous les modes de jeu.",
    icon: "🗺️",
    category: "starter",
    isHidden: false,
  },
  nouveau_look: {
    id: "nouveau_look",
    title: "Nouveau Look",
    description: "Personnaliser son avatar ou son profil.",
    icon: "🎨",
    category: "starter",
    isHidden: false,
  },

  // PERFORMANCE & VITESSE
  sans_faute: {
    id: "sans_faute",
    title: "Sans Faute",
    description: "Terminer un quiz avec 100% de bonnes réponses.",
    icon: "💎",
    category: "performance",
    isHidden: false,
  },
  eclair_de_genie: {
    id: "eclair_de_genie",
    title: "Éclair de Génie",
    description: "Répondre correctement à une question en moins de 2 secondes.",
    icon: "⚡",
    category: "performance",
    isHidden: false,
  },
  sans_hesitation: {
    id: "sans_hesitation",
    title: "Sans Hésitation",
    description: "Obtenir 5 bonnes réponses consécutives en moins de 3 secondes chacune.",
    icon: "🚀",
    category: "performance",
    isHidden: false,
  },
  lintouchable: {
    id: "lintouchable",
    title: "L'Intouchable",
    description: "Enchaîner une série de 15 bonnes réponses d'affilée sans se tromper.",
    icon: "🔥",
    category: "performance",
    isHidden: false,
  },

  // PROGRESSION & HARDCORE
  maitre_extreme: {
    id: "maitre_extreme",
    title: "Maître Extrême",
    description: "Réussir un quiz complet en difficulté Extrême sans faute.",
    icon: "👑",
    category: "progression",
    isHidden: false,
  },
  bourreau_du_random: {
    id: "bourreau_du_random",
    title: "Bourreau du Random",
    description: "Gagner un quiz complet en Mode Aléatoire.",
    icon: "🎲",
    category: "progression",
    isHidden: false,
  },
  coup_de_chaud: {
    id: "coup_de_chaud",
    title: "Coup de Chaud",
    description: "Obtenir un bonus d'XP de précision (90%+ accuracy) 5 fois au total.",
    icon: "🌟",
    category: "progression",
    isHidden: false,
  },
  ascension_i: {
    id: "ascension_i",
    title: "Ascension I",
    description: "Atteindre le Niveau 5.",
    icon: "🥉",
    category: "progression",
    isHidden: false,
  },
  ascension_ii: {
    id: "ascension_ii",
    title: "Ascension II",
    description: "Atteindre le Niveau 20.",
    icon: "🥇",
    category: "progression",
    isHidden: false,
  },

  // RÉGULARITÉ
  fidele_au_poste: {
    id: "fidele_au_poste",
    title: "Fidèle au Poste",
    description: "Jouer au mode Daily 3 jours d'affilée.",
    icon: "📅",
    category: "regularity",
    isHidden: false,
  },
  marathonien: {
    id: "marathonien",
    title: "Marathonien",
    description: "Jouer au mode Daily 7 jours d'affilée.",
    icon: "🏆",
    category: "regularity",
    isHidden: false,
  },
  loup_solitaire: {
    id: "loup_solitaire",
    title: "Loup Solitaire",
    description: "Cumuler plus de 50 quiz joués au total.",
    icon: "🎮",
    category: "regularity",
    isHidden: false,
  },

  // BADGES CACHÉS / SECRETS
  derniere_seconde: {
    id: "derniere_seconde",
    title: "Dernière Seconde",
    description: "Répondre correctement à moins d'une seconde de la fin du chrono.",
    icon: "⏰",
    category: "secret",
    isHidden: true,
  },
  comedien: {
    id: "comedien",
    title: "Comédien",
    description: "Répondre faux à la première question, mais réussir toutes les suivantes.",
    icon: "🎭",
    category: "secret",
    isHidden: true,
  },
  oiseau_de_nuit: {
    id: "oiseau_de_nuit",
    title: "Oiseau de Nuit",
    description: "Terminer une partie entre minuit et 5h du matin.",
    icon: "🌙",
    category: "secret",
    isHidden: true,
  },

  // PRESSION & MASTERY
  sang_froid: {
    id: "sang_froid",
    title: "Sang-Froid",
    description: "Enchaîner 10 bonnes réponses en répondant à chaque fois avec moins de 3 secondes au chrono.",
    icon: "🧊",
    category: "mastery",
    isHidden: false,
  },
  maitre_vrai_faux: {
    id: "maitre_vrai_faux",
    title: "Maître du Vrai/Faux",
    description: "Réussir 5 quiz consécutifs sans commettre une seule erreur.",
    icon: "⚖️",
    category: "mastery",
    isHidden: false,
  },
  sniper: {
    id: "sniper",
    title: "Sniper",
    description: "Obtenir 100% de précision sur un quiz d'au moins 20 questions.",
    icon: "🎯",
    category: "mastery",
    isHidden: false,
  },
  surfil: {
    id: "surfil",
    title: "Surfil",
    description: "Gagner un Duel ou un match Ranked avec exactement 1 point d'écart.",
    icon: "🧵",
    category: "mastery",
    isHidden: false,
  },

  // PROGRÈS & NIVEAUX AVANCÉS
  ascension_iii: {
    id: "ascension_iii",
    title: "Ascension III",
    description: "Atteindre le Niveau 35.",
    icon: "👑",
    category: "progression-advanced",
    isHidden: false,
  },
  legende_vivante: {
    id: "legende_vivante",
    title: "Légende Vivante",
    description: "Atteindre le Niveau 50.",
    icon: "🌌",
    category: "progression-advanced",
    isHidden: false,
  },
  collectionneur_xp: {
    id: "collectionneur_xp",
    title: "Collectionneur d'XP",
    description: "Cumuler un total de 10 000 XP.",
    icon: "✨",
    category: "progression-advanced",
    isHidden: false,
  },
  banquier: {
    id: "banquier",
    title: "Banquier",
    description: "Accumuler 50 000 XP au total.",
    icon: "💰",
    category: "progression-advanced",
    isHidden: false,
  },
  polyvalent: {
    id: "polyvalent",
    title: "Polyvalent",
    description: "Remporter au moins 1 victoire dans tous les modes de jeu disponibles.",
    icon: "🛠️",
    category: "progression-advanced",
    isHidden: false,
  },

  // MULTI, RANKED & COMPÉTITION
  premier_sang: {
    id: "premier_sang",
    title: "Premier Sang",
    description: "Remporter sa toute première victoire en mode Ranked ou Duel.",
    icon: "⚔️",
    category: "competitive",
    isHidden: false,
  },
  gladiateur: {
    id: "gladiateur",
    title: "Gladiateur",
    description: "Enchaîner une série de 5 victoires d'affilée en Ranked.",
    icon: "🛡️",
    category: "competitive",
    isHidden: false,
  },
  tueur_de_bots: {
    id: "tueur_de_bots",
    title: "Tueur de Bots",
    description: "Battre un Bot en difficulté \"Hard\" ou \"Légende\".",
    icon: "🤖",
    category: "competitive",
    isHidden: false,
  },
  indetronable: {
    id: "indetronable",
    title: "Indétrônable",
    description: "Atteindre le TOP 3 du Classement Global.",
    icon: "👑",
    category: "competitive",
    isHidden: false,
  },

  // SPÉCIAL MODES DE JEU
  tgv: {
    id: "tgv",
    title: "TGV",
    description: "Répondre à 20 questions en moins de 30 secondes au total (Mode Time-Attack).",
    icon: "🚄",
    category: "special-modes",
    isHidden: false,
  },
  incollable_thematique: {
    id: "incollable_thematique",
    title: "Incollable Thématique",
    description: "Compléter toutes les questions d'une même catégorie thématique.",
    icon: "📚",
    category: "special-modes",
    isHidden: false,
  },
  maitre_jetpunk: {
    id: "maitre_jetpunk",
    title: "Maître Jetpunk",
    description: "Remplir une grille Jetpunk à 100% avant la moitié du temps imparti.",
    icon: "⏱️",
    category: "special-modes",
    isHidden: false,
  },
  le_rituel: {
    id: "le_rituel",
    title: "Le Rituel",
    description: "Valider le Quiz Daily 14 jours d'affilée.",
    icon: "☀️",
    category: "special-modes",
    isHidden: false,
  },

  // SECRETS / CACHÉS - HIDDEN
  tetu: {
    id: "tetu",
    title: "Têtu",
    description: "Rejouer exactement le même quiz 3 fois d'affilée.",
    icon: "🐐",
    category: "secret",
    isHidden: true,
  },
  heure_du_cafe: {
    id: "heure_du_cafe",
    title: "L'Heure du Café",
    description: "Terminer une partie entre 6h et 8h du matin.",
    icon: "☕",
    category: "secret",
    isHidden: true,
  },
  rage_quit: {
    id: "rage_quit",
    title: "Rage Quit",
    description: "Quitter un quiz en cours après 3 erreurs d'affilée.",
    icon: "💥",
    category: "secret",
    isHidden: true,
  },
  cambrioleur: {
    id: "cambrioleur",
    title: "Cambrioleur",
    description: "Répondre correctement à la dernière seconde de la toute dernière question du quiz.",
    icon: "🥷",
    category: "secret",
    isHidden: true,
  },

  // BADGES ULTIMATIFA / META
  perfectionniste: {
    id: "perfectionniste",
    title: "Perfectionniste",
    description: "Débloquer 30 badges différents.",
    icon: "💎",
    category: "meta",
    isHidden: false,
  },
  le_completiste: {
    id: "le_completiste",
    title: "Le Complétiste",
    description: "Débloquer TOUS les autres badges du jeu (39/40).",
    icon: "🏆",
    category: "meta",
    isHidden: false,
  },
};

export const BADGE_CATEGORIES: Record<BadgeCategory, string> = {
  starter: "Premiers Pas",
  performance: "Performance & Vitesse",
  progression: "Progression & Hardcore",
  regularity: "Régularité",
  mastery: "Pression & Mastery",
  "progression-advanced": "Progrès & Niveaux",
  competitive: "Multi & Compétition",
  "special-modes": "Modes Spéciaux",
  meta: "Ultimatifa",
  secret: "Secrets",
};

export function getBadge(badgeId: string): Omit<Badge, "unlockedAt"> | null {
  return ALL_BADGES[badgeId] || null;
}

export function getAllBadges(): Omit<Badge, "unlockedAt">[] {
  return Object.values(ALL_BADGES);
}

export function getBadgesByCategory(category: BadgeCategory): Omit<Badge, "unlockedAt">[] {
  return Object.values(ALL_BADGES).filter((badge) => badge.category === category);
}
