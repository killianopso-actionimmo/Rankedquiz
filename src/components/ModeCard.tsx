"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { revealItem } from "@/components/scroll/Reveal";
import { TimeAttackLogo } from "@/components/logos/TimeAttackLogo";
import { JetPunkLogo } from "@/components/logos/JetPunkLogo";
import { ThematicLogo } from "@/components/logos/ThematicLogo";
import { OneVsOneLogo } from "@/components/logos/OneVsOneLogo";
import { RankedLogo } from "@/components/logos/RankedLogo";
import { cn } from "@/lib/utils";
import type { GameMode } from "@/types/quiz";

/**
 * Modes dont le logo est un composant SVG anime au lieu d'un bitmap.
 * Le PNG correspondant dans /public/modes n'est alors plus charge.
 * Le fallback <Image> reste en place pour tout mode ajoute sans logo SVG.
 */
const SVG_LOGOS: Partial<Record<GameMode["id"], (p: { className?: string }) => React.ReactElement>> = {
  "time-attack": TimeAttackLogo,
  jetpunk: JetPunkLogo,
  thematique: ThematicLogo,
  duel: OneVsOneLogo,
  ranked: RankedLogo,
};

/* Bordure vanilla dark au repos, glow cyan au survol : meme grammaire que la
   galerie circulaire et que les boutons de reponse. */
const ACCENT_STYLES = {
  primary: {
    border: "border-vanilla-dark",
    hoverBorder: "group-hover:border-primary",
    hoverShadow: "group-hover:shadow-glow-cyan",
    iconShadow: "shadow-[0_6px_16px_rgb(var(--c-cyan)/0.30)]",
  },
  secondary: {
    border: "border-vanilla-dark",
    hoverBorder: "group-hover:border-primary",
    hoverShadow: "group-hover:shadow-glow-cyan",
    iconShadow: "shadow-[0_6px_16px_rgb(var(--c-vanilla-dark)/0.55)]",
  },
  highlight: {
    border: "border-vanilla-dark",
    hoverBorder: "group-hover:border-highlight",
    hoverShadow: "group-hover:shadow-[0_10px_28px_rgb(var(--c-highlight)/0.30)]",
    iconShadow: "shadow-[0_6px_16px_rgb(var(--c-highlight)/0.35)]",
  },
};

export function ModeCard({ mode }: { mode: GameMode }) {
  const accent = ACCENT_STYLES[mode.accent];
  const SvgLogo = SVG_LOGOS[mode.id];

  return (
    <motion.div
      // L'apparition est pilotee par le <RevealGroup> parent (stagger au scroll).
      variants={revealItem}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="h-full"
    >
      <Link href={mode.href} className="block h-full">
        <div
          className={cn(
            "group relative flex h-full items-center gap-4 rounded-xl2 border bg-background-card p-5 shadow-subtle transition-shadow duration-300",
            "md:flex-col md:justify-center md:gap-3 md:p-6 md:text-center",
            mode.premium
              ? "border-2 border-highlight bg-gradient-to-br from-highlight/15 via-background-card to-background-card shadow-[0_10px_28px_rgb(var(--c-highlight)/0.28)]"
              : accent.border,
            accent.hoverBorder,
            accent.hoverShadow
          )}
        >
          {mode.badge && (
            <span className="absolute -top-2 right-4 rounded-full bg-gold-gradient px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink shadow-btn-highlight">
              {mode.badge}
            </span>
          )}

          <div
            className={cn(
              "relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-background-sunken transition-transform duration-300 group-hover:scale-110 md:h-16 md:w-16",
              accent.iconShadow
            )}
          >
            {SvgLogo ? (
              <SvgLogo className="h-full w-full p-1.5" />
            ) : (
              <Image
                src={mode.logo}
                alt={mode.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            )}
          </div>

          <div className="min-w-0 flex-1 py-0.5 md:flex-none md:w-full">
            <h3 className="font-display text-lg font-bold leading-snug text-ink">{mode.title}</h3>
            <p className="line-clamp-2 pb-0.5 text-sm leading-snug text-ink-soft md:mx-auto md:max-w-[180px]">
              {mode.tagline}
            </p>
          </div>

          <ChevronRight className="h-6 w-6 shrink-0 text-ink-faint md:hidden" />
        </div>
      </Link>
    </motion.div>
  );
}
