import type { Category } from "@/types/quiz";

export const CATEGORIES: Category[] = [
  { id: "geographie", label: "Géographie", emoji: "🌍", color: "primary" },
  { id: "histoire", label: "Histoire", emoji: "🏛️", color: "highlight" },
  { id: "sciences", label: "Sciences", emoji: "🔬", color: "secondary" },
  { id: "sport", label: "Sport", emoji: "⚽", color: "primary" },
  { id: "cinema", label: "Cinéma", emoji: "🎬", color: "secondary" },
  { id: "culture-generale", label: "Culture Générale", emoji: "🧠", color: "highlight" },
  { id: "popculture", label: "Pop Culture", emoji: "🎮", color: "highlight" },
  { id: "nature", label: "Nature", emoji: "🌿", color: "primary" },
  { id: "gastronomie", label: "Gastronomie", emoji: "🍽️", color: "secondary" },
  { id: "musique", label: "Musique", emoji: "🎵", color: "secondary" },
  { id: "litterature", label: "Littérature", emoji: "📚", color: "highlight" },
  { id: "langues", label: "Langues", emoji: "🗣️", color: "primary" },
  { id: "art", label: "Art", emoji: "🎨", color: "highlight" },
  { id: "technologie", label: "Technologie", emoji: "💻", color: "secondary" },
];

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
