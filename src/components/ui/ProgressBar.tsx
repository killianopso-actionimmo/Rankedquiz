import { cn } from "@/lib/utils";

interface ProgressBarProps {
  pct: number;
  colorClass?: string;
  trackClassName?: string;
  className?: string;
  animated?: boolean;
}

export function ProgressBar({
  pct,
  colorClass = "bg-primary",
  trackClassName,
  className,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, pct));

  return (
    <div
      className={cn(
        "h-3 w-full overflow-hidden rounded-full border border-line bg-background-sunken",
        trackClassName
      )}
    >
      <div
        className={cn(
          "h-full rounded-full",
          animated && "transition-[width] duration-300 ease-out",
          colorClass,
          className
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
