"use client";

import Link from "next/link";
import { NeonButton } from "@/components/ui/NeonButton";

export default function TypographyShowcase() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 pb-16 pt-8">
      {/* Navigation */}
      <div className="px-4 sm:px-6">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Retour au menu
        </Link>
      </div>

      {/* Header */}
      <div className="px-4 sm:px-6">
        <h1 className="mb-2">Typography Showcase</h1>
        <p className="text-sm text-ink-soft">
          Hiérarchie typographique du site — Bebas Neue (titres) + Poppins (body)
        </p>
      </div>

      <div className="flex flex-col gap-16 px-4 sm:px-6">
        {/* H1 Section */}
        <section className="flex flex-col gap-4 border-l-4 border-primary pl-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">
            H1 — Bebas Neue 400
          </h2>
          <h1 className="text-4xl">Bebas Neue Ultra Bold</h1>
          <p className="text-sm text-ink-soft">
            Usage: Page titles, main hero sections. Sizes: 64px desktop / 40px mobile. Uppercase,
            letter-spacing: 0.02em
          </p>
        </section>

        {/* H2 Section */}
        <section className="flex flex-col gap-4 border-l-4 border-secondary pl-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">
            H2 — Bebas Neue 400
          </h2>
          <h2>Bebas Neue Section Heading</h2>
          <p className="text-sm text-ink-soft">
            Usage: Section subtitles, major headings. Sizes: 48px desktop / 32px mobile. Uppercase,
            letter-spacing: 0.02em
          </p>
        </section>

        {/* H3 Section */}
        <section className="flex flex-col gap-4 border-l-4 border-highlight pl-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">
            H3 — Poppins 600
          </h2>
          <h3>Poppins Accent Heading</h3>
          <p className="text-sm text-ink-soft">
            Usage: Small titles, accents. Sizes: 32px desktop / 24px mobile. Semi-bold weight
          </p>
        </section>

        {/* Body Text Section */}
        <section className="flex flex-col gap-4 border-l-4 border-cyan pl-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">
            Body Text — Poppins 400
          </h2>
          <p>
            Ceci est un exemple de body text en Poppins 400. Lorem ipsum dolor sit amet, consectetur
            adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
            enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
            commodo consequat.
          </p>
          <p className="text-sm text-ink-soft">
            Usage: Regular content, descriptions. Sizes: 16px desktop / 14px mobile. Line-height:
            1.6
          </p>
        </section>

        {/* Buttons Section */}
        <section className="flex flex-col gap-4 border-l-4 border-flame pl-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">
            Buttons/CTA — Bebas Neue 400
          </h2>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-md bg-primary px-6 py-3 font-display text-sm font-bold uppercase text-ink-accent shadow-btn-primary">
              Primary Button
            </button>
            <button className="rounded-md bg-secondary px-6 py-3 font-display text-sm font-bold uppercase text-ink-accent shadow-btn-secondary">
              Secondary Button
            </button>
            <NeonButton variant="ghost">Ghost Button</NeonButton>
          </div>
          <p className="text-sm text-ink-soft">
            Usage: CTAs, action buttons. Bebas Neue with uppercase. Sizes: 24px desktop / 16px
            mobile
          </p>
        </section>

        {/* Font Mix Example */}
        <section className="rounded-lg border-2 border-line bg-background-card p-6">
          <h2 className="mb-4">Real-World Example</h2>
          <div className="space-y-3">
            <h3>Ranked Quiz Challenge</h3>
            <p>
              Découvrez les 6 modes de jeu : Time Attack, Jetpunk, Ranked, Thématique, Duel 1v1
              et Quiz Chaos. Chaque mode offre une expérience unique pour tester vos connaissances
              et progresser dans les classements.
            </p>
            <div className="mt-4 flex gap-2">
              <button className="rounded-md bg-primary px-4 py-2 font-display text-xs font-bold uppercase text-ink-accent shadow-btn-primary">
                Commencer
              </button>
              <button className="rounded-md border border-line px-4 py-2 font-display text-xs font-bold uppercase text-ink">
                Plus d&apos;infos
              </button>
            </div>
          </div>
        </section>

        {/* Responsive Scaling Info */}
        <section className="rounded-lg border-2 border-line bg-background-card p-6">
          <h3>Responsive Sizing</h3>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <strong>Desktop (640px+):</strong> H1 48-64px, H2 36-48px, H3 24-32px, Body 16px
            </p>
            <p>
              <strong>Mobile (&lt;640px):</strong> H1 32-40px, H2 28-32px, H3 18-24px, Body 14px
            </p>
            <p>
              <strong>Line Heights:</strong> Titles 1.1-1.2 (tight), Body 1.6 (breathing)
            </p>
            <p>
              <strong>Letter Spacing:</strong> Bebas Neue +2% for airiness, Body normal
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
