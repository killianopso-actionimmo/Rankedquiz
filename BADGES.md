# Badge System Documentation

## Overview

Complete Badges/Achievements system with 17 badges including 3 hidden badges. Badges are stored in localStorage and evaluated after each game session.

## Files Created

### Types
- `src/types/badge.ts` — Badge type definitions

### Libraries
- `src/lib/badges.ts` — Badge list (17 badges) and category definitions
- `src/lib/badgeStorage.ts` — localStorage persistence with React hooks
- `src/lib/badgeEvaluator.ts` — Badge condition evaluation engine

### Components
- `src/components/BadgesGallery.tsx` — Badge gallery with filtering and progress
- `src/components/BadgeUnlockedToast.tsx` — Toast notification for unlocked badges

### Pages
- `src/app/badges/page.tsx` — Badges/Achievements page

### Hooks
- `src/hooks/useBadgeEvaluation.ts` — Hook for badge evaluation

## All 17 Badges

### Starter (3)
- **Première Étincelle** 🎯 — Answer correctly to first ever question
- **Explorateur** 🗺️ — Try all game modes at least once
- **Nouveau Look** 🎨 — Customize profile/avatar

### Performance & Speed (4)
- **Sans Faute** 💎 — 100% accuracy in a quiz
- **Éclair de Génie** ⚡ — Answer in < 2 seconds
- **Sans Hésitation** 🚀 — 5 consecutive correct in < 3 sec each
- **L'Intouchable** 🔥 — 15 consecutive correct answers

### Progression (5)
- **Maître Extrême** 👑 — Perfect score on Extreme difficulty
- **Bourreau du Random** 🎲 — Win Random mode perfectly
- **Coup de Chaud** 🌟 — 90%+ accuracy bonus 5 times
- **Ascension I** 🥉 — Reach Level 5
- **Ascension II** 🥇 — Reach Level 20

### Regularity (3)
- **Fidèle au Poste** 📅 — Daily mode 3 days in a row
- **Marathonien** 🏆 — Daily mode 7 days in a row
- **Loup Solitaire** 🎮 — 50+ total games played

### Secret/Hidden (3)
- **Dernière Seconde** ⏰ [HIDDEN] — Answer correctly in < 1 second before timeout
- **Comédien** 🎭 [HIDDEN] — First answer wrong, all others correct
- **Oiseau de Nuit** 🌙 [HIDDEN] — Finish game between midnight and 5am

## Hidden Badge UI Logic

Before unlock: Badges with `isHidden: true` show:
- Icon: `❓`
- Title: `??? Badge Secret`
- Description: `Débloque ce badge pour révéler son secret !`

After unlock: Reveal real icon, title, and description with "Badge Débloqué !" toast.

## Usage

### 1. Check Unlocked Badges

```typescript
import { useUnlockedBadges } from "@/lib/badgeStorage";

function MyComponent() {
  const unlockedBadges = useUnlockedBadges();
  // unlockedBadges: string[] (array of badge IDs)
}
```

### 2. Evaluate Badges After Game

```typescript
import { useBadgeEvaluation } from "@/hooks/useBadgeEvaluation";

function GameOverScreen() {
  const evaluateBadges = useBadgeEvaluation();

  // After game ends:
  evaluateBadges({
    mode: "ranked",
    totalQuestions: 10,
    correctAnswers: 10,
    consecutiveCorrect: 10,
    responseTime: [1.2, 1.5, 0.8, ...], // seconds per question
    difficulty: 2,
    isRandom: false,
    firstQuestionCorrect: true,
    lastQuestionResponseTime: 0.5,
    endTime: Date.now(),
    dailyStreak: 3,
    totalGamesPlayed: 45,
    currentLevel: 8,
    accuracyPercentage: 95,
    precisionBonusCount: 2,
  });
}
```

### 3. Unlock First Correct Answer

```typescript
import { unlockFirstCorrectAnswer } from "@/lib/badgeEvaluator";

// After user answers first ever question correctly:
unlockFirstCorrectAnswer();
```

### 4. Unlock Mode Explorer

```typescript
import { checkModeExplorerBadge } from "@/lib/badgeEvaluator";

// Track played modes as Set<string>
const modesPlayed = new Set(["ranked", "time-attack", "daily"]);

// When all modes are played:
checkModeExplorerBadge(modesPlayed);
```

### 5. Unlock New Look

```typescript
import { unlockNewLook } from "@/lib/badgeEvaluator";

// When user customizes profile:
unlockNewLook();
```

### 6. Display Badges Gallery

```typescript
import { BadgesGallery } from "@/components/BadgesGallery";

export default function ProfilePage() {
  return <BadgesGallery />;
}
```

## Storage

Badges are stored in localStorage under key `rq_badges`:

```json
{
  "unlocked": [
    { "badgeId": "premiere_etincelle", "unlockedAt": 1690000000000 },
    { "badgeId": "sans_faute", "unlockedAt": 1690000050000 }
  ]
}
```

## API Reference

### badgeStorage.ts

- `useUnlockedBadges()` — React hook, returns array of badge IDs
- `useAllBadgesState()` — React hook, returns full BadgesState
- `isBadgeUnlocked(badgeId)` — Check if badge unlocked
- `unlockBadge(badgeId)` — Unlock a badge (returns true if newly unlocked)
- `getUnlockedBadgeTimestamp(badgeId)` — Get unlock timestamp
- `getUnlockedBadgesCount()` — Get total unlocked count

### badgeEvaluator.ts

- `evaluateBadges(data)` — Main evaluation function (called after game)
- `checkModeExplorerBadge(modesPlayed)` — Check explorer badge
- `unlockFirstCorrectAnswer()` — Unlock first correct answer
- `unlockNewLook()` — Unlock profile customization

### badges.ts

- `getBadge(badgeId)` — Get badge by ID
- `getAllBadges()` — Get all 17 badges
- `getBadgesByCategory(category)` — Filter by category

## Styling

The gallery uses Tailwind CSS with the project's existing color scheme:
- Hidden badges: dimmed, with "???" icon
- Locked badges: muted appearance
- Unlocked badges: gold/orange gradient background with checkmark

## Integration Checklist

- [ ] Add badge evaluation to all game end screens
- [ ] Track response times per question
- [ ] Track total games played in storage
- [ ] Track daily streak logic
- [ ] Track level progression logic
- [ ] Track accuracy percentage calculations
- [ ] Track modes played for explorer badge
- [ ] Add profile customization trigger
- [ ] Link badges page in main navigation
- [ ] Monitor for edge cases in badge evaluation
