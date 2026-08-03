"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  currentIsoWeek,
  fetchAvailableWeeks,
  fetchLeaderboardWeekly,
  formatWeekLabel,
} from "@/services/userStats";
import type { AvailableWeek, LeaderboardEntryWeekly } from "@/types/user";
import { LeaderboardRow, LeaderboardSpinner, LeaderboardState } from "./LeaderboardRow";

/**
 * Classement hebdomadaire, remis a zero chaque lundi 00:00 UTC.
 * Le selecteur permet de consulter les semaines passees.
 */
export function LeaderboardWeekly() {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState<AvailableWeek[]>([]);
  const [selected, setSelected] = useState<string>(() => currentIsoWeek());
  const [entries, setEntries] = useState<LeaderboardEntryWeekly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Semaines disponibles pour l'historique.
  useEffect(() => {
    let active = true;
    fetchAvailableWeeks().then((res) => {
      if (!active) return;
      const list = res.data;
      const now = currentIsoWeek();
      // La semaine en cours peut n'avoir aucune partie : on la garde en tete
      // du selecteur pour que le classement vide reste consultable.
      setWeeks(list.some((w) => w.week === now) ? list : [{ week: now, players: 0 }, ...list]);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchLeaderboardWeekly(selected, 1000).then((res) => {
      if (!active) return;
      setEntries(res.data);
      setError(res.error);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [selected]);

  const me = useMemo(
    () => (user ? entries.find((e) => e.user_id === user.id) : undefined),
    [entries, user],
  );

  const isCurrentWeek = selected === currentIsoWeek();

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 rounded-full border border-line bg-background-sunken px-4 py-2 focus-within:border-primary">
        <CalendarDays className="h-4 w-4 shrink-0 text-ink-faint" />
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full bg-transparent text-sm text-ink focus:outline-none"
        >
          {weeks.map((w) => (
            <option key={w.week} value={w.week}>
              {formatWeekLabel(w.week)}
              {w.week === currentIsoWeek() ? " - en cours" : ""}
            </option>
          ))}
        </select>
      </label>

      {isCurrentWeek && (
        <p className="text-center text-[11px] text-ink-faint">
          Remise a zero chaque lundi a 00:00 UTC
        </p>
      )}

      {loading ? (
        <LeaderboardSpinner />
      ) : error ? (
        <LeaderboardState message={`Classement indisponible : ${error}`} />
      ) : entries.length === 0 ? (
        <LeaderboardState
          message={
            isCurrentWeek
              ? "Personne n'a encore joue cette semaine. A toi de lancer !"
              : "Aucune partie enregistree cette semaine-la."
          }
        />
      ) : (
        <>
          {me && me.rank > 20 && (
            <>
              <LeaderboardRow
                rank={me.rank}
                username={me.username}
                level={me.level}
                photoUrl={me.profile_photo_url}
                avatarDefault={me.avatar_default}
                primary={`${me.total_xp_week} XP`}
                secondary={`${me.games_count} parties`}
                isMe
              />
              <div className="h-px bg-line" />
            </>
          )}

          <div className="flex flex-col gap-2">
            {entries.map((e, i) => (
              <LeaderboardRow
                key={e.user_id}
                index={i}
                rank={e.rank}
                username={e.username}
                level={e.level}
                photoUrl={e.profile_photo_url}
                avatarDefault={e.avatar_default}
                primary={`${e.total_xp_week} XP`}
                secondary={`${e.games_count} parties · ${e.best_score} max`}
                isMe={e.user_id === user?.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
