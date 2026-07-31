"use client";

import { cn } from "@/components/ui/cn";
import type { ChaosAvatar as ChaosAvatarValue } from "@/types/chaos";

/**
 * Avatar joueur : soit un selfie (dataURL), soit une des 15 tetes generiques.
 *
 * Les tetes sont dessinees en SVG a partir des tokens de la palette : aucune
 * image a charger, aucun poids reseau, et elles suivent le theme du site.
 */

const FACE_COLORS = [
  "var(--c-cyan)",
  "var(--c-vanilla)",
  "var(--c-highlight)",
  "var(--c-success)",
  "var(--c-danger)",
  "var(--c-info)",
  "var(--c-flame)",
  "var(--c-vanilla-dark)",
  "var(--c-cyan-dark)",
  "var(--c-silver)",
  "var(--c-bronze)",
  "var(--c-cyan)",
  "var(--c-vanilla)",
  "var(--c-highlight)",
  "var(--c-success)",
] as const;

/** 5 regards x 3 bouches = les 15 tetes, chacune unique. */
const EYES = ["round", "wink", "wide", "line", "star"] as const;
const MOUTHS = ["smile", "flat", "open"] as const;

export const CHAOS_AVATAR_COUNT = 15;

function Eyes({ variant }: { variant: (typeof EYES)[number] }) {
  const ink = "rgb(var(--c-ink))";
  switch (variant) {
    case "round":
      return (
        <>
          <circle cx="38" cy="44" r="6" fill={ink} />
          <circle cx="62" cy="44" r="6" fill={ink} />
        </>
      );
    case "wink":
      return (
        <>
          <circle cx="38" cy="44" r="6" fill={ink} />
          <path d="M56 44h12" stroke={ink} strokeWidth="5" strokeLinecap="round" />
        </>
      );
    case "wide":
      return (
        <>
          <circle cx="38" cy="44" r="9" fill="rgb(var(--c-white))" />
          <circle cx="38" cy="44" r="4" fill={ink} />
          <circle cx="62" cy="44" r="9" fill="rgb(var(--c-white))" />
          <circle cx="62" cy="44" r="4" fill={ink} />
        </>
      );
    case "line":
      return (
        <>
          <path d="M32 44h12" stroke={ink} strokeWidth="5" strokeLinecap="round" />
          <path d="M56 44h12" stroke={ink} strokeWidth="5" strokeLinecap="round" />
        </>
      );
    case "star":
      return (
        <>
          <path d="M38 36v16M30 44h16M32.5 38.5l11 11M43.5 38.5l-11 11" stroke={ink} strokeWidth="4" strokeLinecap="round" />
          <circle cx="62" cy="44" r="6" fill={ink} />
        </>
      );
  }
}

function Mouth({ variant }: { variant: (typeof MOUTHS)[number] }) {
  const ink = "rgb(var(--c-ink))";
  switch (variant) {
    case "smile":
      return <path d="M36 64q14 14 28 0" stroke={ink} strokeWidth="5" strokeLinecap="round" fill="none" />;
    case "flat":
      return <path d="M38 68h24" stroke={ink} strokeWidth="5" strokeLinecap="round" />;
    case "open":
      return <ellipse cx="50" cy="68" rx="11" ry="9" fill={ink} />;
  }
}

/** Tete generique n°`index` (0-14). */
export function GenericAvatar({ index, className }: { index: number; className?: string }) {
  const i = ((index % CHAOS_AVATAR_COUNT) + CHAOS_AVATAR_COUNT) % CHAOS_AVATAR_COUNT;
  return (
    <svg viewBox="0 0 100 100" className={className} role="presentation" aria-hidden>
      <rect width="100" height="100" rx="50" fill={`rgb(${FACE_COLORS[i]})`} />
      <Eyes variant={EYES[i % EYES.length]} />
      <Mouth variant={MOUTHS[Math.floor(i / EYES.length) % MOUTHS.length]} />
    </svg>
  );
}

export interface ChaosAvatarProps {
  avatar: ChaosAvatarValue;
  name?: string;
  /** Diametre CSS (ex: "8rem"). Par defaut l'avatar remplit son conteneur. */
  size?: string;
  className?: string;
  /** Anneau cyan : marque le joueur qui pose la question. */
  active?: boolean;
}

export function ChaosAvatar({ avatar, name, size, className, active = false }: ChaosAvatarProps) {
  const isPhoto = avatar.startsWith("img:");
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-full bg-background-sunken",
        active
          ? "ring-4 ring-primary shadow-glow-cyan"
          : "ring-1 ring-line",
        className,
      )}
      style={size ? { width: size } : undefined}
    >
      {isPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- dataURL locale, jamais servie par le CDN
        <img
          src={avatar.slice(4)}
          alt={name ? `Photo de ${name}` : ""}
          className="h-full w-full object-cover"
        />
      ) : (
        <GenericAvatar index={Number(avatar.slice(3)) || 0} className="h-full w-full" />
      )}
    </div>
  );
}
