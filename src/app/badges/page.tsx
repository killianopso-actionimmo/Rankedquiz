"use client";

import { useRouter } from "next/navigation";
import { BadgesGallery } from "@/components/BadgesGallery";

export default function BadgesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <div className="px-4 sm:px-6 py-4 border-b border-black/5 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-ink hover:bg-ink-softer transition"
          title="Retour"
        >
          <span className="text-xl">←</span>
        </button>

        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition text-sm sm:text-base"
        >
          Menu Principal
        </button>
      </div>

      {/* Header */}
      <div className="px-4 sm:px-6 py-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
        <h1 className="font-display text-3xl font-extrabold text-ink mb-2">
          Badges & Réalisations
        </h1>
        <p className="text-ink-soft">
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
