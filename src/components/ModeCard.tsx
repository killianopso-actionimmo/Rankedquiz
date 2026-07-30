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

const ACCENT_STYLES = {
  primary: {
    border: "border-black/[0.05]",
    hoverBorder: "group-hover:border-primary/40",
    hoverShadow: "group-hover:shadow-[0_10px_28px_rgba(0,71,171,0.16)]",
    iconShadow: "shadow-[0_6px_16px_rgba(0,71,171,0.28)]",
  },
  secondary: {
    border: "border-black/[0.05]",
    hoverBorder: "group-hover:border-secondary/40",
    hoverShadow: "group-hover:shadow-[0_10px_28px_rgba(255,20,147,0.16)]",
    iconShadow: "shadow-[0_6px_16px_rgba(255,20,147,0.28)]",
  },
  highlight: {
    border: "border-black/[0.05]",
    hoverBorder: "group-hover:border-highlight/50",
    hoverShadow: "group-hover:shadow-[0_10px_28px_rgba(255,188,0,0.20)]",
    iconShadow: "shadow-[0_6px_16px_rgba(255,188,0,0.30)]",
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
            "group relative flex h-full items-center gap-4 rounded-xl2 border bg-white p-5 shadow-card transition-shadow duration-300",
            "md:flex-col md:justify-center md:gap-3 md:p-6 md:text-center",
            mode.premium
              ? "border-2 border-highlight/60 bg-gradient-to-br from-highlight/10 via-white to-white shadow-[0_10px_28px_rgba(255,188,0,0.20)]"
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
              "relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-background transition-transform duration-300 group-hover:scale-110 md:h-16 md:w-16",
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
