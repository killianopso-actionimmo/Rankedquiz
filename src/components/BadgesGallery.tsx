"use client";

import { useState } from "react";
import { ALL_BADGES, BADGE_CATEGORIES } from "@/lib/badges";
import { useUnlockedBadges } from "@/lib/badgeStorage";
import { BadgeCategory } from "@/types/badge";

export function BadgesGallery() {
  const unlockedBadgeIds = useUnlockedBadges();
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | "all">("all");
  const [showLocked, setShowLocked] = useState(true);

  const badgeList = Object.values(ALL_BADGES);
  const unlockedCount = unlockedBadgeIds.length;
  const totalCount = badgeList.length;

  let filteredBadges = badgeList;
  if (selectedCategory !== "all") {
    filteredBadges = filteredBadges.filter((b) => b.category === selectedCategory);
  }
  if (!showLocked) {
    filteredBadges = filteredBadges.filter((b) => unlockedBadgeIds.includes(b.id));
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-ink">Badges Débloqués</h3>
          <span className="text-sm font-bold text-highlight">
            {unlockedCount} / {totalCount}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-ink-softer">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              selectedCategory === "all"
                ? "bg-blue-500 text-white"
                : "bg-ink-softer text-ink hover:bg-ink-soft"
            }`}
          >
            Tous
          </button>
          {(Object.entries(BADGE_CATEGORIES) as Array<[BadgeCategory, string]>).map(
            ([categoryId, label]) => (
              <button
                key={categoryId}
                onClick={() => setSelectedCategory(categoryId)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  selectedCategory === categoryId
                    ? "bg-blue-500 text-white"
                    : "bg-ink-softer text-ink hover:bg-ink-soft"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showLocked}
            onChange={(e) => setShowLocked(e.target.checked)}
            className="rounded"
          />
          <span className="text-ink">Afficher les badges verrouillés</span>
        </label>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredBadges.map((badge) => {
          const isUnlocked = unlockedBadgeIds.includes(badge.id);
          const isHidden = badge.isHidden && !isUnlocked;

          return (
            <div
              key={badge.id}
              className={`group relative flex flex-col items-center gap-2 rounded-lg p-3 transition ${
                isUnlocked
                  ? "bg-gradient-to-br from-yellow-400/20 to-orange-400/20 ring-1 ring-yellow-400/30"
                  : isHidden
                    ? "bg-ink-softer/30"
                    : "bg-ink-softer/50 opacity-60"
              }`}
            >
              {/* Icon */}
              <div className="text-3xl">
                {isHidden ? "❓" : badge.icon}
              </div>

              {/* Title */}
              <h4 className="text-center text-xs font-bold text-ink line-clamp-2">
                {isHidden ? "??? Badge Secret" : badge.title}
              </h4>

              {/* Description */}
              <p className="text-center text-xs text-ink-soft line-clamp-2">
                {isHidden
                  ? "Débloque ce badge pour révéler son secret !"
                  : badge.description}
              </p>

              {/* Unlock Badge */}
              {isUnlocked && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-ink-softer py-8 text-center">
          <p className="text-sm text-ink-soft">Aucun badge dans cette catégorie.</p>
        </div>
      )}
    </div>
  );
}
