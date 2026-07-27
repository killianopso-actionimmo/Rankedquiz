import { getCategory } from "@/data/categories";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/types/quiz";

const ACCENT_CLASS = {
  primary: "bg-primary/10 text-primary border-primary/25",
  secondary: "bg-secondary/10 text-secondary border-secondary/25",
  highlight: "bg-highlight/15 text-highlight-dark border-highlight/35",
};

export function CategoryBadge({ category, className }: { category: CategoryId; className?: string }) {
  const cat = getCategory(category);
  if (!cat) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        ACCENT_CLASS[cat.color],
        className
      )}
    >
      <span>{cat.emoji}</span>
      {cat.label}
    </span>
  );
}
