"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal, RevealGroup, revealItem } from "@/components/scroll/Reveal";
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
      <Reveal
        className="rounded-lg border border-vanilla-dark bg-vanilla/50 p-4"
        distance={16}
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-ink">Badges Débloqués</h3>
          <span className="text-sm font-bold text-ink">
            {unlockedCount} / {totalCount}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full border border-line bg-background-sunken">
          <div
            className="h-full bg-quiz-gradient transition-all duration-300"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </Reveal>

      {/* Filters */}
      <Reveal className="space-y-3" distance={14} delay={0.05}>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              selectedCategory === "all"
                ? "bg-primary text-ink-accent shadow-subtle"
                : "border border-line bg-background-sunken text-ink hover:border-primary"
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
                    ? "bg-primary text-ink-accent shadow-subtle"
                    : "border border-line bg-background-sunken text-ink hover:border-primary"
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
            className="h-4 w-4 rounded-[4px] border-2 border-line accent-[rgb(var(--c-cyan))]"
          />
          <span className="text-ink">Afficher les badges verrouillés</span>
        </label>
      </Reveal>

      {/* Badges Grid */}
      <RevealGroup
        key={`${selectedCategory}-${showLocked}`}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        stagger={0.03}
        amount={0.02}
      >
        {filteredBadges.map((badge) => {
          const isUnlocked = unlockedBadgeIds.includes(badge.id);
          const isHidden = badge.isHidden && !isUnlocked;

          return (
            <motion.div
              key={badge.id}
              variants={revealItem}
              className={`group relative flex flex-col items-center gap-2 rounded-lg p-3 transition ${
                isUnlocked
                  ? "bg-gradient-to-br from-highlight/25 to-flame/20 ring-1 ring-highlight"
                  : isHidden
                    ? "border border-line bg-background-sunken"
                    : "border border-line bg-background-sunken opacity-50"
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
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-highlight text-ink-accent text-xs font-bold">
                  ✓
                </div>
              )}
            </motion.div>
          );
        })}
      </RevealGroup>

      {filteredBadges.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-line py-8 text-center">
          <p className="text-sm text-ink-soft">Aucun badge dans cette catégorie.</p>
        </div>
      )}
    </div>
  );
}
