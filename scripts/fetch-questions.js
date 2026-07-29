#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple HTML entity decoder
const decodeHTML = (str) => {
  const map = {
    '&quot;': '"',
    '&#039;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
  };
  return str.replace(/&quot;|&#039;|&amp;|&lt;|&gt;/g, (m) => map[m]);
};

// Map categories to our categories
const categoryMap = {
  '9': 'culture-generale',
  '10': 'sciences',
  '11': 'sciences',
  '12': 'culture-generale',
  '13': 'sciences',
  '14': 'culture-generale',
  '15': 'culture-generale',
  '16': 'culture-generale',
  '17': 'sciences',
  '18': 'sciences',
  '19': 'sciences',
  '20': 'culture-generale',
  '21': 'culture-generale',
  '22': 'geographie',
  '23': 'histoire',
  '24': 'culture-generale',
  '25': 'culture-generale',
  '26': 'cinema',
  '27': 'cinema',
  '28': 'cinema',
  '29': 'cinema',
  '30': 'cinema',
  '31': 'cinema',
  '32': 'cinema',
};

const triviaCategoryMap = {
  'arts_and_literature': 'culture-generale',
  'film_and_tv': 'cinema',
  'food_and_drink': 'culture-generale',
  'general_knowledge': 'culture-generale',
  'geography': 'geographie',
  'history': 'histoire',
  'music': 'culture-generale',
  'science': 'sciences',
  'society_and_culture': 'culture-generale',
  'sport_and_leisure': 'sport',
};

let openTriviaToken = null;

// Get session token from Open Trivia DB
async function getOpenTriviaToken() {
  try {
    const response = await fetch('https://opentdb.com/api_token.php?command=request');
    if (!response.ok) throw new Error(`Failed to get token: ${response.status}`);

    const data = await response.json();
    if (data.response_code === 0) {
      console.log(`✅ Got Open Trivia DB session token\n`);
      return data.token;
    }
  } catch (error) {
    console.warn(`⚠️  Could not get Open Trivia token:`, error.message);
  }
  return null;
}

// Fetch from Open Trivia DB with token
async function fetchFromOpenTriviaDB(difficulty, token) {
  const difficultyMap = { 1: 'easy', 2: 'medium', 3: 'hard' };
  const url = `https://opentdb.com/api.php?amount=50&difficulty=${difficultyMap[difficulty]}&type=multiple${token ? `&token=${token}` : ''}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    if (data.response_code === 5) {
      console.warn(`⚠️  Open Trivia token exhausted, resetting...`);
      return [];
    }
    if (data.response_code !== 0) {
      console.warn(`⚠️  Open Trivia code ${data.response_code}`);
      return [];
    }

    return data.results.map((q) => {
      const allAnswers = [decodeHTML(q.correct_answer), ...q.incorrect_answers].map(decodeHTML);
      const correctIdx = allAnswers.indexOf(decodeHTML(q.correct_answer));

      return {
        question: decodeHTML(q.question),
        choices: allAnswers,
        answerIndex: correctIdx,
        category: categoryMap[q.category] || 'culture-generale',
        difficulty: difficulty,
      };
    });
  } catch (error) {
    console.error(`❌ Open Trivia (${difficultyMap[difficulty]}):`, error.message);
    return [];
  }
}

// Fetch from The Trivia API
async function fetchFromTriviaAPI(difficulty) {
  const difficultyMap = { 1: 'easy', 2: 'medium', 3: 'hard' };
  const url = `https://the-trivia-api.com/v2/questions?limit=50&difficulty=${difficultyMap[difficulty]}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();

    return data.map((q) => {
      const allAnswers = [q.correctAnswer, ...q.incorrectAnswers].sort(() => Math.random() - 0.5);
      const correctIdx = allAnswers.indexOf(q.correctAnswer);

      return {
        question: q.question.text || q.question,
        choices: allAnswers,
        answerIndex: correctIdx,
        category: triviaCategoryMap[q.category] || 'culture-generale',
        difficulty: difficulty,
      };
    });
  } catch (error) {
    console.error(`❌ Trivia API (${difficultyMap[difficulty]}):`, error.message);
    return [];
  }
}

// Load existing questions
function loadExistingQuestions() {
  const questionsPath = path.join(__dirname, '../src/data/time-attack-questions.json');
  if (!fs.existsSync(questionsPath)) {
    return { easy: [], medium: [], hard: [] };
  }

  try {
    return JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
  } catch (error) {
    console.warn('⚠️  Could not read existing:', error.message);
    return { easy: [], medium: [], hard: [] };
  }
}

// Check duplicate
function isDuplicate(newQuestion, existing) {
  const allExisting = [...existing.easy, ...existing.medium, ...existing.hard];
  return allExisting.some(q => q.question.toLowerCase().trim() === newQuestion.question.toLowerCase().trim());
}

// Generate ID
function generateId(difficulty, index) {
  const diffMap = { 1: 'easy', 2: 'medium', 3: 'hard' };
  return `ta-${diffMap[difficulty]}-${index + 1}`;
}

// Main function
async function main() {
  console.log('🔄 Fetching questions from multiple APIs...\n');

  openTriviaToken = await getOpenTriviaToken();

  const existing = loadExistingQuestions();
  const targetPerLevel = 1000;
  const results = { easy: [...existing.easy], medium: [...existing.medium], hard: [...existing.hard] };
  const diffMap = { 1: 'easy', 2: 'medium', 3: 'hard' };

  console.log(`📊 Current counts:`);
  console.log(`  Easy: ${existing.easy.length}/${targetPerLevel}`);
  console.log(`  Medium: ${existing.medium.length}/${targetPerLevel}`);
  console.log(`  Hard: ${existing.hard.length}/${targetPerLevel}\n`);

  // Fetch for each difficulty
  for (const difficulty of [1, 2, 3]) {
    const needed = targetPerLevel - existing[diffMap[difficulty]].length;
    if (needed <= 0) {
      console.log(`✅ ${diffMap[difficulty].toUpperCase()} already at target`);
      continue;
    }

    console.log(`⬇️  Need ${needed} ${diffMap[difficulty]} questions...\n`);

    let fetched = [];

    // Try Open Trivia DB first
    console.log(`  📡 Trying Open Trivia DB...`);
    let attempts = 0;
    while (fetched.length < needed && attempts < 20) {
      const batch = await fetchFromOpenTriviaDB(difficulty, openTriviaToken);
      if (batch.length === 0) break;

      const unique = batch.filter(q => !isDuplicate(q, existing) && !fetched.some(f => f.question === q.question));
      fetched = [...fetched, ...unique];

      attempts++;
      console.log(`    Batch ${attempts}: +${unique.length} (total: ${fetched.length}/${needed})`);

      if (unique.length < 10) break;

      // 5 second pause as requested
      await new Promise(r => setTimeout(r, 5000));
    }

    // If still need more, use Trivia API
    if (fetched.length < needed) {
      console.log(`  📡 Trying Trivia API...`);
      attempts = 0;
      while (fetched.length < needed && attempts < 20) {
        const batch = await fetchFromTriviaAPI(difficulty);
        if (batch.length === 0) break;

        const unique = batch.filter(q => !isDuplicate(q, existing) && !fetched.some(f => f.question === q.question));
        fetched = [...fetched, ...unique];

        attempts++;
        console.log(`    Batch ${attempts}: +${unique.length} (total: ${fetched.length}/${needed})`);

        if (unique.length < 10) break;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    // Add to results
    const toAdd = fetched.slice(0, needed);
    const startIdx = results[diffMap[difficulty]].length;

    toAdd.forEach((q, idx) => {
      results[diffMap[difficulty]].push({
        id: generateId(difficulty, startIdx + idx),
        category: q.category,
        question: q.question,
        choices: q.choices,
        answerIndex: q.answerIndex,
        difficulty: difficulty,
      });
    });

    console.log(`✅ Added ${toAdd.length} questions\n`);
  }

  // Write to file
  const outputPath = path.join(__dirname, '../src/data/time-attack-questions.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log(`📝 Final counts:`);
  console.log(`  Easy: ${results.easy.length}/${targetPerLevel}`);
  console.log(`  Medium: ${results.medium.length}/${targetPerLevel}`);
  console.log(`  Hard: ${results.hard.length}/${targetPerLevel}`);
  console.log(`  Total: ${results.easy.length + results.medium.length + results.hard.length}/3000`);
  console.log(`\n✨ Saved to ${outputPath}`);
}

main().catch(console.error);
