"use client";

import { useState } from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { Ladder } from "@/components/Ladder";
import { LeaderboardGlobal } from "@/components/leaderboard/LeaderboardGlobal";
import { LeaderboardWeekly } from "@/components/leaderboard/LeaderboardWeekly";
import { NeonButton } from "@/components/ui/NeonButton";
import { cn } from "@/lib/utils";

type Tab = "global" | "weekly" | "ladder";

const TABS: { id: Tab; label: string }[] = [
  { id: "global", label: "Général" },
  { id: "weekly", label: "Semaine" },
  { id: "ladder", label: "Ladder" },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("global");

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 pb-10 pt-6 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold leading-snug text-ink">Classement</h1>

      <div className="flex rounded-full border border-line bg-background-sunken p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
              tab === t.id ? "bg-primary text-ink-accent shadow-subtle" : "text-ink-soft",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "global" && <LeaderboardGlobal />}
      {tab === "weekly" && <LeaderboardWeekly />}
      {tab === "ladder" && <Ladder />}

      <Link href="/" className="mt-2">
        <NeonButton variant="ghost" size="lg" className="w-full">
          <Home className="h-5 w-5" />
          Menu principal
        </NeonButton>
      </Link>
    </div>
  );
}
