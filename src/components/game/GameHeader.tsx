import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function GameHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center gap-3 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
      <Link
        href="/"
        className="btn-tap flex h-11 w-11 items-center justify-center rounded-full border border-black/[0.06] bg-white text-ink shadow-card active:scale-95"
        aria-label="Retour au menu"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <h1 className="font-display text-lg font-bold text-ink">{title}</h1>
    </header>
  );
}
