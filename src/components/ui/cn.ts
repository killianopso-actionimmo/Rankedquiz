/** Concatene des classes conditionnelles (mini-clsx, zero dependance). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
