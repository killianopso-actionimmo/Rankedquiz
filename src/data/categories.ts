import type { Category } from "@/types/quiz";

export const CATEGORIES: Category[] = [
  { id: "geographie", label: "Géographie", emoji: "🌍", color: "primary" },
  { id: "histoire", label: "Histoire", emoji: "🏛️", color: "highlight" },
  { id: "sciences", label: "Sciences", emoji: "🔬", color: "secondary" },
  { id: "sport", label: "Sport", emoji: "⚽", color: "primary" },
  { id: "cinema", label: "Cinéma", emoji: "🎬", color: "secondary" },
  { id: "culture-generale", label: "Culture Générale", emoji: "🧠", color: "highlight" },
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
