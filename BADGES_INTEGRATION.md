# Badge System Integration Guide

## Quick Start

### 1. Add Badge Evaluation to Game Over Screen

In any game page (e.g., `src/app/play/ranked/page.tsx`):

```typescript
import { useBadgeEvaluation } from "@/hooks/useBadgeEvaluation";

export default function RankedPage() {
  const evaluateBadges = useBadgeEvaluation();

  // In your game-over handler:
  const handleGameOver = (stats: GameStats) => {
    // Evaluate badges based on game results
    evaluateBadges({
      mode: "ranked",
      totalQuestions: stats.questions.length,
      correctAnswers: stats.correctAnswers,
      consecutiveCorrect: stats.maxStreak,
      responseTime: stats.questionTimes, // array of times in seconds
      difficulty: stats.difficulty,
      isRandom: false,
      firstQuestionCorrect: stats.firstCorrect,
      lastQuestionResponseTime: stats.questionTimes[stats.questionTimes.length - 1],
      endTime: Date.now(),
      dailyStreak: stats.dailyStreak,
      totalGamesPlayed: stats.totalGamesPlayed,
      currentLevel: stats.level,
      accuracyPercentage: (stats.correctAnswers / stats.totalQuestions) * 100,
      precisionBonusCount: stats.precisionBonusCount,
    });
  };

  return (
    // Your game UI
  );
}
```

### 2. Track First Correct Answer (Game Start)

```typescript
import { unlockFirstCorrectAnswer } from "@/lib/badgeEvaluator";
import { useStoredXp } from "@/lib/storage";

// On first ever game, first correct answer:
const handleFirstAnswer = (isCorrect: boolean) => {
  if (isCorrect && !hasEverAnsweredCorrectly) {
    unlockFirstCorrectAnswer();
  }
};
```

### 3. Track Mode Exploration

```typescript
import { checkModeExplorerBadge } from "@/lib/badgeEvaluator";

// Track modes played in localStorage or state
const modesPlayed = new Set(["ranked", "time-attack", "daily"]);

// When user plays a new mode, add it:
modesPlayed.add("jetpunk");

// Check badge condition:
if (modesPlayed.size >= 6) {
  checkModeExplorerBadge(modesPlayed);
}
```

### 4. Profile Customization Badge

```typescript
import { unlockNewLook } from "@/lib/badgeEvaluator";

// When user saves profile changes:
const handleSaveProfile = () => {
  // ... save profile ...
  unlockNewLook();
};
```

## Badge Unlock Scenarios

### Performance Badges

**Sans Faute** (100% accuracy):
- Triggered after any game ends with `correctAnswers === totalQuestions`

**Éclair de Génie** (< 2 sec response):
- Triggered when ANY question is answered in < 2 seconds

**Sans Hésitation** (5 consecutive < 3 sec):
- Triggered when 5 consecutive correct answers all have response time < 3 sec

**L'Intouchable** (15 consecutive correct):
- Triggered when `consecutiveCorrect >= 15`

**Maître Extrême** (Perfect extreme):
- Triggered when `difficulty === 3` AND `correctAnswers === totalQuestions`

### Progression Badges

**Ascension I** (Level 5):
- Monitor `currentLevel` and trigger when `>= 5`

**Ascension II** (Level 20):
- Monitor `currentLevel` and trigger when `>= 20`

**Coup de Chaud** (90%+ accuracy 5x):
- Track in localStorage: `rq_precision_bonus_count`
- Increment when game has 90%+ accuracy
- Trigger when `precisionBonusCount >= 5`

### Regularity Badges

**Fidèle au Poste** (Daily 3 days):
- Track daily login streak
- Trigger when `dailyStreak >= 3`

**Marathonien** (Daily 7 days):
- Track daily login streak
- Trigger when `dailyStreak >= 7`

**Loup Solitaire** (50+ games):
- Trigger when `totalGamesPlayed >= 50`

### Hidden Badges

**Dernière Seconde** (< 1 sec before timeout):
- Track time remaining on timer
- Trigger when `lastQuestionResponseTime < 1`

**Comédien** (First wrong, rest correct):
- Track first question result
- Trigger when `firstQuestionCorrect === false` AND `correctAnswers === totalQuestions - 1`

**Oiseau de Nuit** (Midnight-5am):
- Check `new Date(Date.now()).getHours()` when game ends
- Trigger when `hour >= 0 && hour < 5`

## Storage Keys

| Key | Description |
|-----|-------------|
| `rq_badges` | Unlocked badges (JSON) |
| `rq_modes_played` | Set of modes tried (recommend tracking separately) |
| `rq_precision_bonus_count` | Count of 90%+ accuracy games |
| `rq_total_games` | Total games played |
| `rq_daily_streak` | Current daily login streak |

## Display Badges

### On Profile/Account Page

```typescript
import { BadgesGallery } from "@/components/BadgesGallery";

export default function ProfilePage() {
  return <BadgesGallery />;
}
```

### Badge Count Widget

```typescript
import { useUnlockedBadges } from "@/lib/badgeStorage";
import { getAllBadges } from "@/lib/badges";

function BadgeCounter() {
  const unlockedIds = useUnlockedBadges();
  const total = getAllBadges().length;

  return (
    <div>
      Badges: {unlockedIds.length} / {total}
    </div>
  );
}
```

## Testing Badges

### Manual Test (DevTools Console)

```javascript
// Unlock a badge manually
localStorage.setItem(
  "rq_badges",
  JSON.stringify({
    unlocked: [
      { badgeId: "premiere_etincelle", unlockedAt: Date.now() },
      { badgeId: "sans_faute", unlockedAt: Date.now() - 60000 },
    ],
  })
);
window.dispatchEvent(new Event("rq-badges-change"));
```

### Jest Test Example

```typescript
import { evaluateBadges } from "@/lib/badgeEvaluator";
import { isBadgeUnlocked, unlockBadge } from "@/lib/badgeStorage";

describe("Badge Evaluation", () => {
  it("should unlock sans_faute badge", () => {
    evaluateBadges({
      mode: "ranked",
      totalQuestions: 10,
      correctAnswers: 10,
      consecutiveCorrect: 10,
      responseTime: [],
    });

    expect(isBadgeUnlocked("sans_faute")).toBe(true);
  });

  it("should not duplicate unlocks", () => {
    unlockBadge("test_badge");
    const result = unlockBadge("test_badge");

    expect(result).toBe(false); // Already unlocked
  });
});
```

## Toast Notification

The `BadgeUnlockedToast` component is automatically rendered in the root layout and displays:
- Badge emoji icon (large)
- "🎉 Badge Débloqué !"
- Badge title
- Auto-dismisses after 3 seconds
- Queues multiple badge unlocks

No manual integration needed—just ensure `addBadgeNotification()` is called from `badgeEvaluator.ts`.

## Hidden Badge Reveal

When a hidden badge is unlocked:
1. Icon changes from `❓` to real emoji
2. Title changes from `??? Badge Secret` to real title
3. Description reveals the actual requirement
4. Checkmark appears in top-right corner
5. Toast notification displays with full info

## File Structure

```
src/
├── types/
│   └── badge.ts              # Type definitions
├── lib/
│   ├── badges.ts             # Badge list + helpers (17 badges)
│   ├── badgeStorage.ts       # localStorage hooks
│   └── badgeEvaluator.ts     # Badge evaluation logic
├── hooks/
│   └── useBadgeEvaluation.ts # React hook for game screens
├── components/
│   ├── BadgesGallery.tsx     # Gallery + filtering + progress
│   └── BadgeUnlockedToast.tsx # Toast notifications
└── app/
    └── badges/
        └── page.tsx          # /badges page
```

## Next Steps

1. [ ] Add badge evaluation to all game end screens
2. [ ] Track response times per question
3. [ ] Add daily login tracking
4. [ ] Add profile customization UI
5. [ ] Link badges page in navigation
6. [ ] Add badge stats to leaderboard
7. [ ] Create achievements email notification
