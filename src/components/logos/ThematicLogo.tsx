/**
 * Logo Thematique : disque segmente en rotation continue (les differents themes).
 *
 * Meme DA que TimeAttackLogo. Les 6 segments tournent en bloc (une seule
 * animation sur le groupe) et pulsent individuellement avec un decalage, ce qui
 * donne l'impression qu'un theme "s'allume" au passage sans multiplier les
 * animations lourdes.
 */
const SEGMENTS = [
  { d: "M40 50 L68 50 A28 28 0 0 1 54 74.25 Z", g: "th-a" },
  { d: "M40 50 L54 74.25 A28 28 0 0 1 26 74.25 Z", g: "th-b" },
  { d: "M40 50 L26 74.25 A28 28 0 0 1 12 50 Z", g: "th-c" },
  { d: "M40 50 L12 50 A28 28 0 0 1 26 25.75 Z", g: "th-a" },
  { d: "M40 50 L26 25.75 A28 28 0 0 1 54 25.75 Z", g: "th-b" },
  { d: "M40 50 L54 25.75 A28 28 0 0 1 68 50 Z", g: "th-c" },
];

export function ThematicLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 100" className={className} role="img" aria-label="Thématique">
      <style>{`
        .th-spin{animation:th-spin 4s linear infinite;transform-box:fill-box;transform-origin:center}
        .th-seg{animation:th-flash 4s ease-in-out infinite backwards;animation-delay:calc(var(--i) * .66s)}
        .th-glow{opacity:0;transition:opacity .3s ease}
        @keyframes th-spin{to{transform:rotate(360deg)}}
        @keyframes th-flash{0%,100%{opacity:.72}12%{opacity:1}30%{opacity:.72}}
        @keyframes th-pulse{0%,100%{opacity:.35}50%{opacity:.95}}
        .group:hover .th-glow,.th-root:hover .th-glow{opacity:1;animation:th-pulse 1.2s ease-in-out infinite}
        .group:hover .th-spin,.th-root:hover .th-spin{animation-duration:1.6s}
        .group:hover .th-seg,.th-root:hover .th-seg{animation-duration:1.6s;animation-delay:calc(var(--i) * .26s)}
        @media (prefers-reduced-motion:reduce){.th-spin,.th-seg{animation:none}.th-seg{opacity:.85}}
      `}</style>

      <defs>
        <linearGradient id="th-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff1f1f" />
          <stop offset="100%" stopColor="#ff6a00" />
        </linearGradient>
        <linearGradient id="th-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff5a1f" />
          <stop offset="100%" stopColor="#ffa500" />
        </linearGradient>
        <linearGradient id="th-c" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff8c1a" />
          <stop offset="100%" stopColor="#ffd166" />
        </linearGradient>
        <radialGradient id="th-halo">
          <stop offset="40%" stopColor="#00FFFF" stopOpacity=".45" />
          <stop offset="100%" stopColor="#00FFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="th-root">
        <circle className="th-glow" cx="40" cy="50" r="42" fill="url(#th-halo)" />

        <g className="th-spin">
          {SEGMENTS.map((s, i) => (
            <path
              key={i}
              className="th-seg"
              d={s.d}
              fill={`url(#${s.g})`}
              style={{ "--i": i } as React.CSSProperties}
            />
          ))}
          {/* Rayons cyan : rendent la rotation lisible meme a 54px. */}
          <g stroke="#00FFFF" strokeWidth="1.6" opacity=".8" strokeLinecap="round">
            <path d="M40 50 L68 50 M40 50 L54 74.25 M40 50 L26 74.25 M40 50 L12 50 M40 50 L26 25.75 M40 50 L54 25.75" />
          </g>
        </g>

        {/* Anneau + moyeu fixes : le cadre ne tourne pas, seul le contenu bouge. */}
        <circle cx="40" cy="50" r="29.5" fill="none" stroke="#00FFFF" strokeWidth="2.5" />
        <circle cx="40" cy="50" r="6" fill="#00FFFF" />
      </g>
    </svg>
  );
}
