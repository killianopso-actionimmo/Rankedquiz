import { getCategory } from "@/data/categories";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/types/quiz";

/* Cyan et vanilla sont trop clairs pour du texte : le label reste en `ink`,
   l'accent se lit sur le fond et la bordure. */
const ACCENT_CLASS = {
  primary: "bg-primary/15 text-ink border-primary",
  secondary: "bg-secondary text-ink-accent border-vanilla-dark",
  highlight: "bg-highlight/25 text-ink border-highlight",
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
