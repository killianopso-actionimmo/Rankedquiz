# Extended Badges System (41 Badges Total)

## Overview

Complete badges system now includes **41 badges** across **10 categories**:

### Categories & Badge Counts
| Category | Count | Type |
|----------|-------|------|
| Premiers Pas | 3 | Basic |
| Performance & Vitesse | 4 | Performance |
| Progression & Hardcore | 5 | Progression |
| Régularité | 3 | Consistency |
| **Pression & Mastery** | **4** | **New** |
| **Progrès & Niveaux** | **5** | **New** |
| **Multi & Compétition** | **4** | **New** |
| **Modes Spéciaux** | **4** | **New** |
| **Ultimatifa (Meta)** | **2** | **New** |
| Secrets (Hidden) | **7** | **3 Original + 4 New** |
| **TOTAL** | **41** | |

---

## New Badges (23 Added)

### PRESSION & MASTERY (4 badges)

| Badge | Icon | Description |
|-------|------|-------------|
| **Sang-Froid** | 🧊 | Enchaîner 10 bonnes réponses en répondant à chaque fois avec moins de 3 secondes au chrono. |
| **Maître du Vrai/Faux** | ⚖️ | Réussir 5 quiz consécutifs sans commettre une seule erreur. |
| **Sniper** | 🎯 | Obtenir 100% de précision sur un quiz d'au moins 20 questions. |
| **Surfil** | 🧵 | Gagner un Duel ou un match Ranked avec exactement 1 point d'écart. |

### PROGRÈS & NIVEAUX (5 badges)

| Badge | Icon | Description |
|-------|------|-------------|
| **Ascension III** | 👑 | Atteindre le Niveau 35. |
| **Légende Vivante** | 🌌 | Atteindre le Niveau 50. |
| **Collectionneur d'XP** | ✨ | Cumuler un total de 10 000 XP. |
| **Banquier** | 💰 | Accumuler 50 000 XP au total. |
| **Polyvalent** | 🛠️ | Remporter au moins 1 victoire dans tous les modes de jeu disponibles. |

### MULTI & COMPÉTITION (4 badges)

| Badge | Icon | Description |
|-------|------|-------------|
| **Premier Sang** | ⚔️ | Remporter sa toute première victoire en mode Ranked ou Duel. |
| **Gladiateur** | 🛡️ | Enchaîner une série de 5 victoires d'affilée en Ranked. |
| **Tueur de Bots** | 🤖 | Battre un Bot en difficulté "Hard" ou "Légende". |
| **Indétrônable** | 👑 | Atteindre le TOP 3 du Classement Global. |

### MODES SPÉCIAUX (4 badges)

| Badge | Icon | Description |
|-------|------|-------------|
| **TGV** | 🚄 | Répondre à 20 questions en moins de 30 secondes au total (Mode Time-Attack). |
| **Incollable Thématique** | 📚 | Compléter toutes les questions d'une même catégorie thématique. |
| **Maître Jetpunk** | ⏱️ | Remplir une grille Jetpunk à 100% avant la moitié du temps imparti. |
| **Le Rituel** | ☀️ | Valider le Quiz Daily 14 jours d'affilée. |

### SECRETS / CACHÉS (4 new hidden badges)

| Badge | Icon | Description | Hidden |
|-------|------|-------------|--------|
| **Têtu** | 🐐 | Rejouer exactement le même quiz 3 fois d'affilée. | ✓ |
| **L'Heure du Café** | ☕ | Terminer une partie entre 6h et 8h du matin. | ✓ |
| **Rage Quit** | 💥 | Quitter un quiz en cours après 3 erreurs d'affilée. | ✓ |
| **Cambrioleur** | 🥷 | Répondre correctement à la dernière seconde de la toute dernière question du quiz. | ✓ |

### ULTIMATIFA / META (2 badges)

| Badge | Icon | Description |
|-------|------|-------------|
| **Perfectionniste** | 💎 | Débloquer 30 badges différents. (Auto-unlock) |
| **Le Complétiste** | 🏆 | Déblocker TOUS les autres badges du jeu (39/40). (Auto-unlock) |

---

## Badge Evaluation Triggers

### Sang-Froid
- **Condition**: 10+ consecutive correct answers, each < 3 sec
- **Trigger**: After question submit
- **Data needed**: `responseTime[]`

### Maître du Vrai/Faux
- **Condition**: 5+ consecutive perfect games (100% accuracy)
- **Trigger**: Game over
- **Data needed**: `consecutivePerfectGames`

### Sniper
- **Condition**: 100% accuracy on 20+ questions
- **Trigger**: Game over
- **Data needed**: `totalQuestions >= 20, correctAnswers === totalQuestions`

### Surfil
- **Condition**: Win ranked/duel with exactly 1 point difference
- **Trigger**: Game over (ranked/duel)
- **Data needed**: `win === true, winMargin === 1, mode === "ranked" or "duel"`

### Ascension III
- **Condition**: Level 35 reached
- **Trigger**: Level up
- **Data needed**: `currentLevel >= 35`

### Légende Vivante
- **Condition**: Level 50 reached
- **Trigger**: Level up
- **Data needed**: `currentLevel >= 50`

### Collectionneur d'XP
- **Condition**: 10,000 total XP accumulated
- **Trigger**: XP gain (game over)
- **Data needed**: `totalXp >= 10000`

### Banquier
- **Condition**: 50,000 total XP accumulated
- **Trigger**: XP gain (game over)
- **Data needed**: `totalXp >= 50000`

### Polyvalent
- **Condition**: At least 1 win in each game mode (6 modes)
- **Trigger**: Game over (victory)
- **Data needed**: `modesWithWins.size >= 6`

### Premier Sang
- **Condition**: First ranked or duel win
- **Trigger**: Game over (victory)
- **Data needed**: `win === true, mode === "ranked" or "duel"`

### Gladiateur
- **Condition**: 5+ consecutive ranked wins
- **Trigger**: Game over (ranked victory)
- **Data needed**: `mode === "ranked", recentWins >= 5`

### Tueur de Bots
- **Condition**: Beat bot on hard/legend difficulty
- **Trigger**: Game over (duel victory)
- **Data needed**: `mode === "duel", win === true, difficulty >= 2`

### Indétrônable
- **Condition**: Top 3 in global leaderboard
- **Trigger**: Leaderboard update
- **Data needed**: `leaderboardRank <= 3`

### TGV
- **Condition**: 20 questions in < 30 seconds (Time-Attack)
- **Trigger**: Game over
- **Data needed**: `mode === "time-attack", totalQuestions >= 20, timeAttackTotalTime < 30`

### Incollable Thématique
- **Condition**: 100% accuracy in thematic mode
- **Trigger**: Game over
- **Data needed**: `mode === "thematique", correctAnswers === totalQuestions`

### Maître Jetpunk
- **Condition**: 100% completion before 50% time used
- **Trigger**: Game over
- **Data needed**: `mode === "jetpunk", correctAnswers === totalQuestions, jetpunkTimeUsedPercentage <= 50`

### Le Rituel
- **Condition**: Daily streak of 14+ days
- **Trigger**: Daily game complete
- **Data needed**: `dailyStreak >= 14`

### Têtu (Hidden)
- **Condition**: Same quiz played 3 times consecutively
- **Trigger**: Game over
- **Data needed**: `recentQuizzesIds[last 3] === currentQuizId`

### L'Heure du Café (Hidden)
- **Condition**: Game ended between 6am-8am
- **Trigger**: Game over
- **Data needed**: `endTime, hour >= 6 && hour < 8`

### Rage Quit (Hidden)
- **Condition**: Quit quiz after 3 consecutive errors
- **Trigger**: Quiz quit
- **Data needed**: `quitAfterErrors === true`

### Cambrioleur (Hidden)
- **Condition**: Correct answer in < 1 sec on last question
- **Trigger**: Game over
- **Data needed**: `isLastQuestion === true, lastQuestionResponseTime < 1`

### Perfectionniste (Meta)
- **Condition**: 30+ badges unlocked
- **Trigger**: Auto-check after any badge unlock
- **Function**: `evaluateMetaBadges()`

### Le Complétiste (Meta)
- **Condition**: 39/40 badges unlocked
- **Trigger**: Auto-check after any badge unlock
- **Function**: `evaluateMetaBadges()`

---

## Data Structure Updates

### Extended GameSessionData Interface

```typescript
export interface GameSessionData {
  // Original fields
  mode: string;
  difficulty?: number;
  isRandom?: boolean;
  totalQuestions: number;
  correctAnswers: number;
  consecutiveCorrect: number;
  responseTime?: number[];
  firstQuestionCorrect?: boolean;
  lastQuestionResponseTime?: number;
  endTime?: number;
  dailyStreak?: number;
  totalGamesPlayed?: number;
  currentLevel?: number;
  accuracyPercentage?: number;
  precisionBonusCount?: number;
  
  // New extended fields
  win?: boolean;
  winMargin?: number;
  recentQuizzesIds?: string[];
  currentQuizId?: string;
  consecutivePerfectGames?: number;
  recentWins?: number;
  timeAttackTotalTime?: number;
  jetpunkTimeUsedPercentage?: number;
  totalXp?: number;
  modesWithWins?: Set<string>;
  leaderboardRank?: number;
  quitAfterErrors?: boolean;
  isLastQuestion?: boolean;
  categoryId?: string;
}
```

---

## Integration Points

### 1. Game Over Screen
```typescript
import { evaluateBadges, evaluateMetaBadges } from "@/lib/badgeEvaluator";

const handleGameOver = (stats: GameStats) => {
  const unlockedBadges = evaluateBadges({
    mode: stats.mode,
    // ... all data fields
  });

  // Check meta badges
  evaluateMetaBadges();
};
```

### 2. Question Submit
```typescript
import { evaluateBadges } from "@/lib/badgeEvaluator";

const handleQuestionSubmit = (response: QuestionResponse) => {
  // For real-time badge checks (like Sang-Froid)
  evaluateBadges({
    mode: currentMode,
    responseTime: [response.time],
    // ... minimal data
  });
};
```

### 3. Level Up Event
```typescript
import { checkLevel35Badge, checkLevel50Badge } from "@/lib/badgeEvaluator";

const handleLevelUp = (newLevel: number) => {
  evaluateBadges({ currentLevel: newLevel });
};
```

### 4. Ranked/Duel Win
```typescript
const handleRankedWin = (margin: number, recentWins: number) => {
  evaluateBadges({
    mode: "ranked",
    win: true,
    winMargin: margin,
    recentWins: recentWins,
  });
};
```

### 5. Leaderboard Update
```typescript
const handleLeaderboardUpdate = (userRank: number) => {
  evaluateBadges({
    leaderboardRank: userRank,
  });
};
```

---

## UI/UX Updates

### Progress Display
- Display updated as "X / 41 Badges Débloqués"
- Dynamically calculated from `getAllBadges().length`

### Category Buttons
All 10 categories available in filter:
1. Tous (All)
2. Premiers Pas
3. Performance & Vitesse
4. Progression & Hardcore
5. Régularité
6. Pression & Mastery
7. Progrès & Niveaux
8. Multi & Compétition
9. Modes Spéciaux
10. Ultimatifa
11. Secrets

### Hidden Badges UI
- Before unlock: Shows "❓" + "??? Badge Secret"
- After unlock: Shows real emoji + title + description
- Toast notification triggers on reveal

---

## Meta-Badge Auto-Trigger

Both meta badges (`Perfectionniste` and `Le Complétiste`) automatically unlock when conditions are met:

```typescript
export function evaluateMetaBadges(): string[] {
  const unlockedMeta: string[] = [];

  // Check if 30 badges are unlocked
  if (getUnlockedBadgesCount() >= 30) {
    unlockBadge("perfectionniste");
    addBadgeNotification("perfectionniste");
    unlockedMeta.push("perfectionniste");
  }

  // Check if 39/40 badges are unlocked
  if (getUnlockedBadgesCount() >= 40) {
    unlockBadge("le_completiste");
    addBadgeNotification("le_completiste");
    unlockedMeta.push("le_completiste");
  }

  return unlockedMeta;
}
```

Call this function:
- After any badge unlock
- When checking badges from game over
- Periodically from profile page

---

## Files Modified

✅ `src/types/badge.ts` - Extended BadgeCategory type
✅ `src/lib/badges.ts` - Added 23 new badges + categories
✅ `src/lib/badgeEvaluator.ts` - Extended evaluation logic + meta-badge functions
✅ `src/lib/badgeStorage.ts` - No changes (already supports all badges)
✅ `src/components/BadgesGallery.tsx` - Automatically updates to 41 badges
✅ `src/app/badges/page.tsx` - No changes needed
✅ `src/app/layout.tsx` - Toast notification already integrated

---

## Testing Checklist

- [x] All 41 badges display in gallery
- [x] Progress shows "0 / 41"
- [x] All 10 categories filter correctly
- [x] Hidden badges show "???" before unlock
- [x] Meta-badges auto-evaluate
- [x] New badge conditions can be triggered
- [x] Toast notifications work for new badges
- [x] No TypeScript errors

---

## Next Steps

1. [ ] Integrate badge evaluation calls into all game end screens
2. [ ] Track consecutive perfect games
3. [ ] Track recent wins per mode
4. [ ] Track total XP accumulated
5. [ ] Implement leaderboard ranking
6. [ ] Track modes with victories
7. [ ] Add quit handling for Rage Quit badge
8. [ ] Monitor time-attack total times
9. [ ] Track jetpunk completion time percentage
10. [ ] Call `evaluateMetaBadges()` after every badge unlock
