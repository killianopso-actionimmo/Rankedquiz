"use client";

import { useRouter } from "next/navigation";
import { BadgesGallery } from "@/components/BadgesGallery";

export default function BadgesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <div className="px-4 sm:px-6 py-4 border-b border-line flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-ink transition hover:bg-background-sunken"
          title="Retour"
        >
          <span className="text-xl">←</span>
        </button>

        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded-md bg-primary text-ink-accent font-semibold shadow-btn-primary transition hover:bg-primary-dark active:translate-y-[3px] active:shadow-none text-sm sm:text-base"
        >
          Menu Principal
        </button>
      </div>

      {/* Header */}
      <div className="px-4 sm:px-6 py-6 border-b border-line bg-vanilla">
        <h1 className="font-display text-3xl font-extrabold text-ink-accent mb-2">
          Badges & Réalisations
        </h1>
        <p className="text-ink-accent/70">
          Débloque des badges en accomplissant des défis et en explorant tous les modes de jeu.
        </p>
      </div>

      {/* Gallery */}
      <div className="flex-1 px-4 sm:px-6 py-6">
        <BadgesGallery />
      </div>
    </div>
  );
}
