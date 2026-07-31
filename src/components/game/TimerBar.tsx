import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";

interface TimerBarProps {
  secondsLeft: number;
  maxSeconds: number;
}

export function TimerBar({ secondsLeft, maxSeconds }: TimerBarProps) {
  const pct = (secondsLeft / maxSeconds) * 100;
  const isLow = pct <= 25;
  const isMid = pct > 25 && pct <= 55;

  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "w-12 shrink-0 text-right font-display text-2xl font-extrabold tabular-nums",
          // Urgent -> rouge. Sinon texte principal.
          isLow ? "text-danger animate-pulse-glow" : "text-ink"
        )}
      >
        {Math.ceil(secondsLeft)}
      </span>
      <ProgressBar
        pct={pct}
        colorClass={cn(
          isLow ? "bg-danger" : isMid ? "bg-highlight" : "bg-primary",
          isLow && "shadow-glow-danger"
        )}
      />
    </div>
  );
}
