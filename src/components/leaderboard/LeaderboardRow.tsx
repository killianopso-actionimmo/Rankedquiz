"use client";

import { motion } from "framer-motion";
import { GenericAvatar } from "@/components/chaos/ChaosAvatar";
import { avatarIndex } from "@/components/profile/PhotoUpload";
import { cn } from "@/lib/utils";

/**
 * Ligne unique des classements. Partagee par le general et l'hebdo : seules
 * les metriques de droite changent d'un classement a l'autre.
 */

export interface LeaderboardRowProps {
  rank: number;
  username: string;
  level: number;
  photoUrl: string | null;
  avatarDefault: string;
  /** Valeur mise en avant (XP total ou XP de la semaine). */
  primary: string;
  /** Ligne secondaire : parties jouees, meilleur score... */
  secondary: string;
  isMe?: boolean;
  index?: number;
}

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function LeaderboardRow({
  rank,
  username,
  level,
  photoUrl,
  avatarDefault,
  primary,
  secondary,
  isMe = false,
  index = 0,
}: LeaderboardRowProps) {
  const medal = MEDALS[rank];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      // Le decalage se stabilise apres 20 lignes : au-dela l'attente cumulee
      // deviendrait plus longue que le scroll de l'utilisateur.
      transition={{ duration: 0.25, delay: Math.min(index, 20) * 0.015 }}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
        isMe ? "bg-primary/20 ring-1 ring-primary" : "bg-background",
      )}
    >
      <span
        className={cn(
          "w-9 shrink-0 text-center font-display text-sm font-bold tabular-nums",
          rank <= 3 ? "text-base" : "text-ink-soft",
        )}
      >
        {medal ?? `#${rank}`}
      </span>

      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-line">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <GenericAvatar index={avatarIndex(avatarDefault)} className="h-full w-full" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-ink">
          {username}
          {isMe && <span className="ml-1.5 text-[10px] font-bold text-primary">TOI</span>}
        </span>
        <span className="text-[11px] text-ink-faint">Niveau {level}</span>
      </div>

      <div className="flex shrink-0 flex-col items-end">
        <span className="font-display text-sm font-bold tabular-nums text-highlight-dark">
          {primary}
        </span>
        <span className="text-[11px] tabular-nums text-ink-faint">{secondary}</span>
      </div>
    </motion.div>
  );
}

/** Etat vide / chargement / erreur, partage par les deux classements. */
export function LeaderboardState({ message }: { message: string }) {
  return <p className="py-10 text-center text-sm text-ink-soft">{message}</p>;
}

export function LeaderboardSpinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
