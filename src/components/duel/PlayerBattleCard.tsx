import { cn } from "@/lib/utils";

interface PlayerBattleCardProps {
  name: string;
  elo: number;
  score: number;
  isSelf?: boolean;
  accent: "primary" | "secondary";
}

const ACCENT = {
  primary: {
    ring: "border-primary/50",
    badge: "bg-primary/10 text-primary",
  },
  secondary: {
    ring: "border-secondary/50",
    badge: "bg-secondary/10 text-secondary",
  },
};

export function PlayerBattleCard({ name, elo, score, isSelf, accent }: PlayerBattleCardProps) {
  const initials = name.slice(0, 2).toUpperCase();
  const style = ACCENT[accent];

  return (
    <div className="glass-card flex flex-1 flex-col items-center gap-2 p-4">
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full border-2 bg-background font-display text-lg font-extrabold text-ink",
          style.ring
        )}
      >
        {initials}
      </div>
      <p className="w-full truncate px-1 pb-0.5 text-center font-display text-sm font-bold leading-snug text-ink">
        {isSelf ? "Toi" : name}
      </p>
      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", style.badge)}>
        {elo} ELO
      </span>
      <span className="font-display text-3xl font-extrabold tabular-nums text-ink">
        {score}
      </span>
    </div>
  );
}
