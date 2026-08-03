"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchLeaderboardAllTime } from "@/services/userStats";
import type { LeaderboardEntryAllTime } from "@/types/user";
import { LeaderboardRow, LeaderboardSpinner, LeaderboardState } from "./LeaderboardRow";

/** Classement general : top 1000 par XP cumule, toutes parties confondues. */
export function LeaderboardGlobal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntryAllTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchLeaderboardAllTime(1000).then((res) => {
      if (!active) return;
      setEntries(res.data);
      setError(res.error);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => e.username.toLowerCase().includes(q));
  }, [entries, query]);

  // Le joueur peut etre hors du top 1000 ou masque par la recherche : on
  // affiche alors sa ligne en rappel au-dessus de la liste.
  const me = useMemo(
    () => (user ? entries.find((e) => e.user_id === user.id) : undefined),
    [entries, user],
  );
  const meVisible = useMemo(
    () => (me ? filtered.some((e) => e.user_id === me.user_id) : false),
    [filtered, me],
  );

  if (loading) return <LeaderboardSpinner />;
  if (error) return <LeaderboardState message={`Classement indisponible : ${error}`} />;
  if (entries.length === 0) {
    return <LeaderboardState message="Aucun joueur classe. Sois le premier a jouer !" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 rounded-full border border-line bg-background-sunken px-4 py-2 focus-within:border-primary">
        <Search className="h-4 w-4 shrink-0 text-ink-faint" />
        <input
          type="search"
          placeholder="Chercher un joueur"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </label>

      {me && !meVisible && (
        <>
          <LeaderboardRow
            rank={me.rank}
            username={me.username}
            level={me.level}
            photoUrl={me.profile_photo_url}
            avatarDefault={me.avatar_default}
            primary={`${me.total_xp} XP`}
            secondary={`${me.games_count} parties`}
            isMe
          />
          <div className="h-px bg-line" />
        </>
      )}

      {filtered.length === 0 ? (
        <LeaderboardState message="Aucun joueur ne correspond." />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((e, i) => (
            <LeaderboardRow
              key={e.user_id}
              index={i}
              rank={e.rank}
              username={e.username}
              level={e.level}
              photoUrl={e.profile_photo_url}
              avatarDefault={e.avatar_default}
              primary={`${e.total_xp} XP`}
              secondary={`${e.games_count} parties`}
              isMe={e.user_id === user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
