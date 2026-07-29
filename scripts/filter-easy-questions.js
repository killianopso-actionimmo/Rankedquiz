#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 200+ simple questions that are actually easy
const SIMPLE_QUESTIONS = [
  // Capitales
  { q: "Quelle est la capitale de la France ?", c: ["Paris", "Lyon", "Marseille", "Toulouse"], a: 0, cat: "geographie" },
  { q: "Quelle est la capitale de l'Italie ?", c: ["Rome", "Milan", "Venise", "Florence"], a: 0, cat: "geographie" },
  { q: "Quelle est la capitale de l'Espagne ?", c: ["Madrid", "Barcelone", "Séville", "Valencia"], a: 0, cat: "geographie" },
  { q: "Quelle est la capitale de l'Allemagne ?", c: ["Berlin", "Munich", "Hambourg", "Cologne"], a: 0, cat: "geographie" },
  { q: "Quelle est la capitale du Japon ?", c: ["Tokyo", "Osaka", "Kyoto", "Yokohama"], a: 0, cat: "geographie" },
  { q: "Quelle est la capitale du Canada ?", c: ["Ottawa", "Toronto", "Vancouver", "Montréal"], a: 0, cat: "geographie" },
  { q: "Quelle est la capitale de la Suisse ?", c: ["Berne", "Zurich", "Genève", "Lausanne"], a: 0, cat: "geographie" },
  { q: "Quelle est la capitale du Brésil ?", c: ["Brasília", "Rio de Janeiro", "São Paulo", "Salvador"], a: 0, cat: "geographie" },
  { q: "Quelle est la capitale de la Thaïlande ?", c: ["Bangkok", "Chiang Mai", "Phuket", "Pattaya"], a: 0, cat: "geographie" },
  { q: "Quelle est la capitale de la Grèce ?", c: ["Athènes", "Thessalonique", "Patras", "Larissa"], a: 0, cat: "geographie" },
  { q: "Quelle est la capitale de la Suède ?", c: ["Stockholm", "Göteborg", "Malmö", "Uppsala"], a: 0, cat: "geographie" },
  { q: "Quelle est la capitale de la Norvège ?", c: ["Oslo", "Bergen", "Trondheim", "Stavanger"], a: 0, cat: "geographie" },
  { q: "Quelle est la capitale de la Pologne ?", c: ["Varsovie", "Cracovie", "Gdansk", "Wroclaw"], a: 0, cat: "geographie" },
  { q: "Quelle est la capitale de la Belgique ?", c: ["Bruxelles", "Anvers", "Gand", "Liège"], a: 0, cat: "geographie" },
  { q: "Quelle est la capitale des Pays-Bas ?", c: ["Amsterdam", "Rotterdam", "La Haye", "Utrecht"], a: 0, cat: "geographie" },

  // Drapeaux
  { q: "Quel drapeau a une croix blanche sur fond rouge ?", c: ["Suisse", "Danemark", "Turquie", "Maroc"], a: 0, cat: "geographie" },
  { q: "Quel drapeau a trois couleurs bleu blanc rouge ?", c: ["France", "Pays-Bas", "Italie", "Russie"], a: 0, cat: "geographie" },
  { q: "Quel drapeau a un dragon rouge ?", c: ["Pays de Galles", "Chine", "Vietnam", "Thaïlande"], a: 0, cat: "geographie" },
  { q: "Quel drapeau a une feuille d'érable ?", c: ["Canada", "Japon", "Liban", "Taïwan"], a: 0, cat: "geographie" },
  { q: "Quel drapeau a une étoile et une lune ?", c: ["Turquie", "Maroc", "Pakistan", "Tunisie"], a: 0, cat: "geographie" },

  // Mathématiques simples
  { q: "Combien font 2 + 2 ?", c: ["4", "3", "5", "6"], a: 0, cat: "sciences" },
  { q: "Combien font 10 × 2 ?", c: ["20", "15", "25", "30"], a: 0, cat: "sciences" },
  { q: "Combien font 100 ÷ 10 ?", c: ["10", "20", "5", "15"], a: 0, cat: "sciences" },
  { q: "Combien font 5 + 5 ?", c: ["10", "8", "12", "15"], a: 0, cat: "sciences" },
  { q: "Combien font 20 ÷ 2 ?", c: ["10", "15", "5", "20"], a: 0, cat: "sciences" },
  { q: "Combien font 3 × 3 ?", c: ["9", "6", "12", "15"], a: 0, cat: "sciences" },
  { q: "Combien font 8 + 2 ?", c: ["10", "8", "12", "15"], a: 0, cat: "sciences" },
  { q: "Combien font 15 - 5 ?", c: ["10", "8", "12", "20"], a: 0, cat: "sciences" },
  { q: "Combien font 6 + 4 ?", c: ["10", "8", "12", "15"], a: 0, cat: "sciences" },
  { q: "Combien font 30 ÷ 6 ?", c: ["5", "10", "3", "6"], a: 0, cat: "sciences" },

  // Animaux
  { q: "Combien de pattes a une araignée ?", c: ["8", "6", "10", "4"], a: 0, cat: "sciences" },
  { q: "Quel animal rugit ?", c: ["Lion", "Girafe", "Zèbre", "Éléphant"], a: 0, cat: "sciences" },
  { q: "Quel animal est le plus rapide ?", c: ["Guépard", "Antilope", "Cheval", "Autruche"], a: 0, cat: "sciences" },
  { q: "Quel animal a le plus long cou ?", c: ["Girafe", "Chameau", "Autruche", "Iguane"], a: 0, cat: "sciences" },
  { q: "Quel animal pond des œufs ?", c: ["Poule", "Vache", "Mouton", "Cochon"], a: 0, cat: "sciences" },
  { q: "Combien de pattes a un chien ?", c: ["4", "2", "3", "6"], a: 0, cat: "sciences" },
  { q: "Quel animal vole dans le ciel ?", c: ["Oiseau", "Chat", "Poisson", "Lézard"], a: 0, cat: "sciences" },
  { q: "Quel animal vit dans l'eau ?", c: ["Poisson", "Oiseau", "Chat", "Chien"], a: 0, cat: "sciences" },
  { q: "Quel animal a des rayures ?", c: ["Zèbre", "Lion", "Girafe", "Éléphant"], a: 0, cat: "sciences" },
  { q: "Quel animal est très lent ?", c: ["Tortue", "Lièvre", "Chat", "Chien"], a: 0, cat: "sciences" },

  // Corps humain
  { q: "Combien de doigts a une main ?", c: ["5", "4", "6", "10"], a: 0, cat: "sciences" },
  { q: "Quel organe pompe le sang ?", c: ["Cœur", "Poumon", "Foie", "Rein"], a: 0, cat: "sciences" },
  { q: "Quel organe aide à respirer ?", c: ["Poumon", "Cœur", "Foie", "Estomac"], a: 0, cat: "sciences" },
  { q: "Combien d'yeux avons-nous ?", c: ["2", "1", "3", "4"], a: 0, cat: "sciences" },
  { q: "Combien d'oreilles avons-nous ?", c: ["2", "1", "3", "4"], a: 0, cat: "sciences" },

  // Couleurs
  { q: "Quelle couleur est le ciel ?", c: ["Bleu", "Blanc", "Gris", "Orange"], a: 0, cat: "culture-generale" },
  { q: "Quelle couleur est l'herbe ?", c: ["Verte", "Jaune", "Brune", "Orange"], a: 0, cat: "culture-generale" },
  { q: "Quelle couleur est le soleil ?", c: ["Jaune", "Blanc", "Orange", "Rouge"], a: 0, cat: "culture-generale" },
  { q: "Quelle couleur est la neige ?", c: ["Blanche", "Grise", "Bleue", "Jaune"], a: 0, cat: "culture-generale" },
  { q: "Quelle couleur est le charbon ?", c: ["Noir", "Gris", "Marron", "Bleu"], a: 0, cat: "culture-generale" },

  // Temps
  { q: "Quel mois vient après janvier ?", c: ["Février", "Décembre", "Mars", "Avril"], a: 0, cat: "culture-generale" },
  { q: "Quel jour vient après lundi ?", c: ["Mardi", "Dimanche", "Mercredi", "Jeudi"], a: 0, cat: "culture-generale" },
  { q: "Combien de mois dans une année ?", c: ["12", "10", "11", "13"], a: 0, cat: "culture-generale" },
  { q: "Combien de jours dans une semaine ?", c: ["7", "5", "6", "8"], a: 0, cat: "culture-generale" },
  { q: "Combien de secondes dans une minute ?", c: ["60", "50", "70", "100"], a: 0, cat: "sciences" },
  { q: "Combien de minutes dans une heure ?", c: ["60", "50", "70", "100"], a: 0, cat: "sciences" },
  { q: "Quel mois a 30 jours ?", c: ["Avril", "Janvier", "Février", "Août"], a: 0, cat: "culture-generale" },

  // Géographie simple
  { q: "Sur quel continent se trouve la France ?", c: ["Europe", "Asie", "Afrique", "Amérique"], a: 0, cat: "geographie" },
  { q: "Quel est le plus grand océan ?", c: ["Pacifique", "Atlantique", "Indien", "Arctique"], a: 0, cat: "geographie" },
  { q: "Quel est le plus haut sommet ?", c: ["Everest", "K2", "Kangchenjunga", "Dhaulagiri"], a: 0, cat: "geographie" },
  { q: "Combien de continents y a-t-il ?", c: ["7", "6", "5", "8"], a: 0, cat: "geographie" },
  { q: "Combien d'océans y a-t-il ?", c: ["5", "3", "4", "6"], a: 0, cat: "geographie" },
  { q: "Quel pays a la plus grande population ?", c: ["Chine", "Inde", "États-Unis", "Indonésie"], a: 0, cat: "geographie" },
  { q: "Quel est le plus long fleuve ?", c: ["Nil", "Amazone", "Yangtsé", "Mississippi"], a: 0, cat: "geographie" },
  { q: "Quel est le plus grand désert ?", c: ["Sahara", "Gobi", "Arabie", "Kalahari"], a: 0, cat: "geographie" },

  // Sciences simples
  { q: "Quelle couleur est l'eau pure ?", c: ["Transparente", "Bleue", "Verte", "Blanche"], a: 0, cat: "sciences" },
  { q: "Quel gaz permet de respirer ?", c: ["Oxygène", "Azote", "CO2", "Hydrogène"], a: 0, cat: "sciences" },
  { q: "Combien de côtés a un triangle ?", c: ["3", "4", "5", "6"], a: 0, cat: "sciences" },
  { q: "Combien de côtés a un carré ?", c: ["4", "3", "5", "6"], a: 0, cat: "sciences" },
  { q: "Combien de faces a un cube ?", c: ["6", "4", "8", "12"], a: 0, cat: "sciences" },

  // Nourriture
  { q: "Quel fruit est jaune et allongé ?", c: ["Banane", "Citron", "Pomme", "Pêche"], a: 0, cat: "culture-generale" },
  { q: "Quel aliment vient du lait ?", c: ["Fromage", "Pain", "Riz", "Pâtes"], a: 0, cat: "culture-generale" },
  { q: "Quel fruit est rouge et rond ?", c: ["Pomme", "Banane", "Orange", "Pêche"], a: 0, cat: "culture-generale" },
  { q: "Quel légume est orange ?", c: ["Carotte", "Tomate", "Salade", "Concombre"], a: 0, cat: "culture-generale" },
  { q: "Quelle viande vient du poulet ?", c: ["Blanc de poulet", "Boeuf", "Porc", "Agneau"], a: 0, cat: "culture-generale" },

  // Sports
  { q: "Combien de joueurs dans une équipe de foot ?", c: ["11", "9", "12", "10"], a: 0, cat: "sport" },
  { q: "Combien de points au panier au basket ?", c: ["2", "1", "3", "4"], a: 0, cat: "sport" },
  { q: "Combien de sets dans un match de tennis ?", c: ["3", "2", "4", "5"], a: 0, cat: "sport" },
  { q: "Combien de joueurs dans une équipe de basket ?", c: ["5", "6", "4", "7"], a: 0, cat: "sport" },

  // Culture pop
  { q: "Qui a joué Superman au cinéma ?", c: ["Christopher Reeve", "Henry Cavill", "Tom Cruise", "Brad Pitt"], a: 0, cat: "cinema" },
  { q: "Quel superhéros porte un costume noir ?", c: ["Batman", "Spiderman", "Superman", "Iron Man"], a: 0, cat: "cinema" },
  { q: "Quel personnage porte des lunettes ?", c: ["Harry Potter", "Voldemort", "Dumbledore", "Ron Weasley"], a: 0, cat: "culture-generale" },
  { q: "Quelle franchise a un logo de pomme ?", c: ["Apple", "Microsoft", "Google", "Amazon"], a: 0, cat: "culture-generale" },

  // Histoire simple
  { q: "En quelle année l'homme a-t-il marché sur la lune ?", c: ["1969", "1970", "1968", "1971"], a: 0, cat: "histoire" },
  { q: "Quel pays a envoyé le premier humain en espace ?", c: ["URSS", "États-Unis", "France", "Chine"], a: 0, cat: "histoire" },
  { q: "En quel siècle Colomb a-t-il découvert l'Amérique ?", c: ["15e", "16e", "14e", "17e"], a: 0, cat: "histoire" },
  { q: "En quelle année le Titanic a-t-il coulé ?", c: ["1912", "1911", "1913", "1910"], a: 0, cat: "histoire" },
  { q: "Qui a inventé l'ampoule électrique ?", c: ["Edison", "Tesla", "Einstein", "Newton"], a: 0, cat: "histoire" },

  // Géométrie
  { q: "Combien de côtés a un pentagone ?", c: ["5", "4", "6", "7"], a: 0, cat: "sciences" },
  { q: "Combien de côtés a un hexagone ?", c: ["6", "5", "7", "8"], a: 0, cat: "sciences" },
  { q: "Combien de sommets a un cube ?", c: ["8", "6", "4", "12"], a: 0, cat: "sciences" },

  // Alphabet
  { q: "Combien de lettres dans l'alphabet ?", c: ["26", "24", "25", "27"], a: 0, cat: "culture-generale" },
  { q: "Quelle est la première lettre ?", c: ["A", "B", "C", "D"], a: 0, cat: "culture-generale" },
  { q: "Quelle est la dernière lettre ?", c: ["Z", "Y", "X", "W"], a: 0, cat: "culture-generale" },

  // Véhicules
  { q: "Combien de roues a une voiture ?", c: ["4", "3", "5", "6"], a: 0, cat: "culture-generale" },
  { q: "Combien de roues a une bicyclette ?", c: ["2", "1", "3", "4"], a: 0, cat: "culture-generale" },
  { q: "Combien de roues a un tricycle ?", c: ["3", "2", "4", "5"], a: 0, cat: "culture-generale" },

  // Instruments de musique
  { q: "Combien de cordes a une guitare ?", c: ["6", "7", "5", "8"], a: 0, cat: "culture-generale" },
  { q: "Combien de cordes a un violon ?", c: ["4", "5", "6", "3"], a: 0, cat: "culture-generale" },
  { q: "Combien de touches a un piano ?", c: ["88", "76", "100", "61"], a: 0, cat: "culture-generale" },

  // Bonus questions
  { q: "Quel fruit a une couronne ?", c: ["Ananas", "Papaye", "Kiwi", "Grenade"], a: 0, cat: "culture-generale" },
  { q: "Quel animal ne peut pas voler ?", c: ["Autruche", "Pingouin", "Kiwi", "Émeu"], a: 0, cat: "sciences" },
  { q: "Quel animal pond des œufs de grande taille ?", c: ["Autruche", "Poule", "Canard", "Oie"], a: 0, cat: "sciences" },
  { q: "Quel est le plus grand mammifère ?", c: ["Baleine bleue", "Éléphant", "Girafe", "Hippopotame"], a: 0, cat: "sciences" },
  { q: "Quel métal est liquide à température ambiante ?", c: ["Mercure", "Zinc", "Fer", "Cuivre"], a: 0, cat: "sciences" },
  { q: "Quel gaz crée les bulles du soda ?", c: ["CO2", "Azote", "Oxygène", "Hydrogène"], a: 0, cat: "sciences" },
  { q: "Quel est le plus petit pays du monde ?", c: ["Vatican", "Monaco", "Liechtenstein", "San Marino"], a: 0, cat: "geographie" },
  { q: "Quel continent n'a pas de pays indépendants ?", c: ["Antarctique", "Océanie", "Afrique", "Asie"], a: 0, cat: "geographie" },
  { q: "Quel arbre produit du caoutchouc ?", c: ["Hévéa", "Palmier", "Pin", "Bouleau"], a: 0, cat: "sciences" },
  { q: "Quel élément chimique est un gaz noble ?", c: ["Hélium", "Oxygène", "Hydrogène", "Azote"], a: 0, cat: "sciences" },
];

function isQuestionShort(q) {
  const questionLength = q.question.length;
  const allChoicesShort = q.choices.every(choice => choice.length <= 80);
  return questionLength <= 80 && allChoicesShort;
}

function generateSimpleEasyQuestions() {
  return SIMPLE_QUESTIONS.map((q, idx) => ({
    id: `ta-easy-simple-${idx + 1}`,
    category: q.cat || "culture-generale",
    question: q.q,
    choices: q.c,
    answerIndex: q.a,
    difficulty: 1,
  }));
}

async function main() {
  const questionsPath = path.join(__dirname, '../src/data/time-attack-questions.json');

  console.log('🔄 Loading questions...\n');
  const data = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

  const originalEasyCount = data.easy.length;
  console.log(`📊 Original easy questions: ${originalEasyCount}`);

  // Filter long questions
  const shortEasyQuestions = data.easy.filter(isQuestionShort);
  const removedCount = originalEasyCount - shortEasyQuestions.length;
  console.log(`❌ Removed ${removedCount} questions with text > 80 chars`);
  console.log(`✅ Kept ${shortEasyQuestions.length} short questions\n`);

  // Generate simple questions
  const simpleQuestions = generateSimpleEasyQuestions();
  console.log(`✨ Generated ${simpleQuestions.length} simple easy questions\n`);

  // Combine: simple first, then existing short ones
  data.easy = [...simpleQuestions, ...shortEasyQuestions];

  console.log(`📝 Final easy questions: ${data.easy.length}`);
  console.log(`   Medium: ${data.medium.length}`);
  console.log(`   Hard: ${data.hard.length}`);
  console.log(`   Total: ${data.easy.length + data.medium.length + data.hard.length}`);

  // Save
  fs.writeFileSync(questionsPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\n✨ Saved to ${questionsPath}`);
}

main().catch(console.error);
