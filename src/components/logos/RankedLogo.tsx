/**
 * Logo Ranked : pyramide de paliers qui se remplissent du bas vers le haut.
 *
 * Meme DA que TimeAttackLogo. Cycle long (5s) assume : la progression classee
 * doit se sentir lente. Chaque palier se remplit (scaleY depuis le bas) puis
 * "deverrouille" par un petit pop, et l'etoile s'allume quand le sommet est
 * atteint.
 */
const TIERS = [
  { x: 8, w: 64, y: 76 },
  { x: 15.5, w: 49, y: 61 },
  { x: 23, w: 34, y: 46 },
  { x: 30.5, w: 19, y: 31 },
];

const STAR =
  "M40 6 L42.53 12.52 L49.51 12.91 L44.09 17.33 L45.88 24.09 L40 20.3 L34.12 24.09 L35.91 17.33 L30.49 12.91 L37.47 12.52 Z";

export function RankedLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 100" className={className} role="img" aria-label="Ranked">
      <style>{`
        /* animation-fill-mode backwards : sans lui, un palier en attente de son
           delai afficherait son style de base (plein) au lieu de l'etat 0% (vide). */
        .rk-fill{animation:rk-fill 5s cubic-bezier(.4,0,.2,1) infinite backwards;animation-delay:calc(var(--i) * .9s);transform-box:fill-box;transform-origin:bottom}
        .rk-tier{animation:rk-pop 5s ease-out infinite backwards;animation-delay:calc(var(--i) * .9s);transform-box:fill-box;transform-origin:center}
        .rk-star{animation:rk-star 5s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
        .rk-glow{opacity:0;transition:opacity .3s ease}
        .rk-body{transition:transform .35s cubic-bezier(.22,1,.36,1);transform-box:fill-box;transform-origin:center}
        @keyframes rk-fill{0%{transform:scaleY(0)}14%{transform:scaleY(1)}84%{transform:scaleY(1)}94%,100%{transform:scaleY(0)}}
        @keyframes rk-pop{0%,12%{transform:scale(1)}17%{transform:scale(1.09)}23%,100%{transform:scale(1)}}
        @keyframes rk-star{0%,52%{opacity:.5;transform:scale(.9)}66%{opacity:1;transform:scale(1.15)}80%{opacity:.95;transform:scale(1)}100%{opacity:.5;transform:scale(.9)}}
        @keyframes rk-pulse{0%,100%{opacity:.35}50%{opacity:.95}}
        .group:hover .rk-glow,.rk-root:hover .rk-glow{opacity:1;animation:rk-pulse 1.2s ease-in-out infinite}
        .group:hover .rk-body,.rk-root:hover .rk-body{transform:scale(1.06)}
        .group:hover .rk-fill,.group:hover .rk-tier,.group:hover .rk-star,
        .rk-root:hover .rk-fill,.rk-root:hover .rk-tier,.rk-root:hover .rk-star{animation-duration:2.2s}
        .group:hover .rk-fill,.group:hover .rk-tier,.rk-root:hover .rk-fill,.rk-root:hover .rk-tier{animation-delay:calc(var(--i) * .4s)}
        @media (prefers-reduced-motion:reduce){
          .rk-fill,.rk-tier,.rk-star{animation:none}
          .rk-body{transition:none}
        }
      `}</style>

      <defs>
        <linearGradient id="rk-fill-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ff2d2d" />
          <stop offset="100%" stopColor="#ffa500" />
        </linearGradient>
        <radialGradient id="rk-halo">
          <stop offset="40%" stopColor="#00FFFF" stopOpacity=".45" />
          <stop offset="100%" stopColor="#00FFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="rk-root">
        <circle className="rk-glow" cx="40" cy="50" r="42" fill="url(#rk-halo)" />

        <g className="rk-body">
          {TIERS.map((t, i) => (
            <g key={i} className="rk-tier" style={{ "--i": i } as React.CSSProperties}>
              <rect
                className="rk-fill"
                x={t.x + 2.5}
                y={t.y + 2.5}
                width={t.w - 5}
                height="8"
                rx="2"
                fill="url(#rk-fill-grad)"
                style={{ "--i": i } as React.CSSProperties}
              />
              <rect x={t.x} y={t.y} width={t.w} height="13" rx="3.5" fill="none" stroke="#00FFFF" strokeWidth="2.2" />
            </g>
          ))}

          <path className="rk-star" d={STAR} fill="url(#rk-fill-grad)" stroke="#00FFFF" strokeWidth="2" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
}
