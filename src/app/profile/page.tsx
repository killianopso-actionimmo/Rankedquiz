"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Home, Pencil, Trophy, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { PhotoUpload, avatarIndex } from "@/components/profile/PhotoUpload";
import { GenericAvatar } from "@/components/chaos/ChaosAvatar";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyRanks, fetchProfileStats, fetchRecentGames } from "@/services/userStats";
import { calculateLevelFromXp, getLevelTier } from "@/lib/xp";
import type { GameRecord, MyRanks, ProfileStats } from "@/types/user";

const MODE_LABELS: Record<string, string> = {
  time_attack: "Time Attack",
  jetpunk: "JetPunk",
  quiz_du_jour: "Quiz du Jour",
  "1vs1": "1 vs 1",
  ranked: "Ranked",
  chaos: "Quiz Chaos",
  thematique: "Thematique",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
  mixed: "Mixte",
};

/** "Aujourd'hui 15:32", "Hier 20:45", sinon "12 aout 14:03". */
function formatPlayedAt(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86400000);

  if (dayDiff === 0) return `Aujourd'hui ${time}`;
  if (dayDiff === 1) return `Hier ${time}`;
  return `${date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} ${time}`;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-background px-3 py-3 text-center">
      <span className="font-display text-xl font-bold tabular-nums text-ink">{value}</span>
      <span className="text-[11px] uppercase tracking-wide text-ink-soft">{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile, initialized, updateProfile, signOut } = useAuth();

  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [games, setGames] = useState<GameRecord[]>([]);
  const [ranks, setRanks] = useState<MyRanks | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (userId: string) => {
    setLoading(true);
    const [statsRes, gamesRes, ranksRes] = await Promise.all([
      fetchProfileStats(userId),
      fetchRecentGames(userId, 10),
      fetchMyRanks(),
    ]);
    setStats(statsRes.data);
    setGames(gamesRes.data);
    setRanks(ranksRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      setLoading(false);
      return;
    }
    void load(user.id);
  }, [initialized, user, load]);

  useEffect(() => {
    if (profile) setNameDraft(profile.username);
  }, [profile]);

  const handlePhotoChange = useCallback(
    async (next: { photoUrl: string | null; avatarDefault: string }) => {
      await updateProfile({
        profilePhotoUrl: next.photoUrl,
        avatarDefault: next.avatarDefault,
      });
    },
    [updateProfile],
  );

  const handleSaveName = useCallback(async () => {
    const trimmed = nameDraft.trim();
    if (trimmed.length < 3) {
      setNameError("3 caracteres minimum.");
      return;
    }
    if (trimmed.length > 20) {
      setNameError("20 caracteres maximum.");
      return;
    }
    setSaving(true);
    setNameError(null);
    const { error } = await updateProfile({ displayName: trimmed });
    setSaving(false);
    if (error) {
      setNameError(error);
      return;
    }
    setEditing(false);
  }, [nameDraft, updateProfile]);

  // ------------------------------------------------------------- etats
  if (!initialized || loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center">
        <GlassCard className="w-full p-8">
          <h1 className="font-display text-2xl font-extrabold text-ink">Profil</h1>
          <p className="mt-3 text-sm text-ink-soft">
            {user
              ? "Ton profil n'a pas encore ete cree. Recharge la page ou reconnecte-toi."
              : "Connecte-toi pour suivre ta progression, ton XP et ton classement."}
          </p>
          <Link href="/" className="mt-6 block">
            <NeonButton variant="primary" size="lg" className="w-full">
              <Home className="h-5 w-5" />
              Retour a l&apos;accueil
            </NeonButton>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const { level, xpInLevel, xpForNext } = calculateLevelFromXp(profile.total_xp);
  const tier = getLevelTier(level);
  const pct = Math.min(100, Math.round((xpInLevel / xpForNext) * 100));
  const memberSince = new Date(profile.created_at).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 pb-10 pt-6 sm:px-6"
    >
      {/* ------------------------------------------------------- en-tete */}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-primary">
            {profile.profile_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profile_photo_url}
                alt={profile.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <GenericAvatar index={avatarIndex(profile.avatar_default)} className="h-full w-full" />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {editing ? (
              <div className="flex flex-col gap-2">
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  maxLength={20}
                  autoFocus
                  className="w-full rounded-sm border border-line bg-background-sunken px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
                <div className="flex gap-2">
                  <NeonButton variant="primary" size="md" onClick={handleSaveName} disabled={saving}>
                    <Check className="h-4 w-4" />
                    {saving ? "..." : "OK"}
                  </NeonButton>
                  <NeonButton
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      setEditing(false);
                      setNameDraft(profile.username);
                      setNameError(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </NeonButton>
                </div>
                {nameError && <p className="text-xs text-danger">{nameError}</p>}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 text-left"
              >
                <span className="truncate font-display text-2xl font-extrabold text-ink">
                  {profile.username}
                </span>
                <Pencil className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
              </button>
            )}

            <span className="text-xs text-ink-faint">Membre depuis {memberSince}</span>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-display font-bold text-ink">
                Niveau {level}
                <span className="ml-2 font-normal text-ink-soft">{tier.label}</span>
              </span>
              <span className="tabular-nums text-ink-soft">
                {xpInLevel} / {xpForNext} XP
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-background-sunken">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full bg-primary"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* --------------------------------------------------------- photo */}
      <GlassCard className="p-5 sm:p-6">
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
          Photo de profil
        </h2>
        <PhotoUpload
          userId={user.id}
          photoUrl={profile.profile_photo_url}
          avatarDefault={profile.avatar_default}
          onChange={handlePhotoChange}
        />
      </GlassCard>

      {/* --------------------------------------------------------- stats */}
      <GlassCard className="p-5 sm:p-6">
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
          Statistiques
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="XP total" value={String(stats?.totalXp ?? profile.total_xp)} />
          <StatTile label="Parties" value={String(stats?.gamesPlayed ?? 0)} />
          <StatTile label="Meilleur score" value={String(stats?.bestScore ?? 0)} />
          <StatTile label="Meilleure serie" value={String(stats?.bestStreak ?? 0)} />
          <StatTile
            label="Reussite"
            value={stats ? `${Math.round(stats.winRate * 100)}%` : "0%"}
          />
          <StatTile label="Niveau" value={String(level)} />
        </div>
      </GlassCard>

      {/* ---------------------------------------------------- classement */}
      <GlassCard className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
            Classement
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatTile
            label="Rang general"
            value={ranks?.alltime_rank ? `#${ranks.alltime_rank}` : "-"}
          />
          <StatTile
            label="Rang hebdo"
            value={ranks?.weekly_rank ? `#${ranks.weekly_rank}` : "-"}
          />
        </div>
        <Link href="/leaderboard" className="mt-3 block">
          <NeonButton variant="ghost" size="md" className="w-full">
            Voir le classement complet
          </NeonButton>
        </Link>
      </GlassCard>

      {/* ------------------------------------------------------ historique */}
      <GlassCard className="p-5 sm:p-6">
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
          10 dernieres parties
        </h2>

        {games.length === 0 ? (
          <p className="py-4 text-center text-sm text-ink-soft">
            Aucune partie enregistree. Lance un Time Attack !
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {games.map((g) => {
              const accuracy = Math.round((g.correct_answers / g.total_questions) * 100);
              return (
                <div key={g.id} className="rounded-xl bg-background px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-ink">
                      {MODE_LABELS[g.mode] ?? g.mode}
                    </span>
                    <span className="shrink-0 text-[11px] text-ink-faint">
                      {formatPlayedAt(g.played_at)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-soft">
                    <span>
                      Score <span className="font-bold tabular-nums text-ink">{g.score}</span>
                    </span>
                    <span className="tabular-nums">
                      {g.correct_answers}/{g.total_questions} ({accuracy}%)
                    </span>
                    <span className="tabular-nums">Serie {g.longest_streak}</span>
                    <span>{DIFFICULTY_LABELS[g.difficulty] ?? g.difficulty}</span>
                    <span className="ml-auto font-bold text-highlight-dark">+{g.xp_earned} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      <div className="flex flex-col gap-2">
        <Link href="/play/time-attack">
          <NeonButton variant="primary" size="lg" className="w-full">
            Jouer
          </NeonButton>
        </Link>
        <NeonButton variant="ghost" size="lg" className="w-full" onClick={signOut}>
          Deconnexion
        </NeonButton>
      </div>
    </motion.div>
  );
}
