/**
 * Logo Jetpunk : grille 3x3 qui se remplit en cascade diagonale.
 *
 * Meme DA que TimeAttackLogo (degrade rouge/orange + accents cyan), meme
 * viewBox 80x100, memes contraintes : SVG pur, CSS seul, transform/opacity
 * uniquement. Les 9 cases partagent une duree de 3.6s et ne different que par
 * `animation-delay`, donc la composition entiere reste periodique a 3.6s.
 * `backwards` fait tenir aux cases en attente leur etat 0% (invisibles).
 */
const CELLS = Array.from({ length: 9 }, (_, i) => ({
  i,
  x: 12 + (i % 3) * 19,
  y: 26 + Math.floor(i / 3) * 19,
}));

export function JetPunkLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 100" className={className} role="img" aria-label="Jetpunk">
      <style>{`
        .jp-cell{animation:jp-pop 3.6s ease-out infinite backwards;animation-delay:calc(var(--i) * .16s);transform-box:fill-box;transform-origin:center}
        .jp-glow{opacity:0;transition:opacity .3s ease}
        .jp-frame{transition:transform .35s cubic-bezier(.22,1,.36,1);transform-box:fill-box;transform-origin:center}
        @keyframes jp-pop{0%{opacity:0;transform:scale(.35)}6%{opacity:1;transform:scale(1.2)}12%{transform:scale(1)}58%{opacity:1;transform:scale(1)}68%,100%{opacity:0;transform:scale(.35)}}
        @keyframes jp-pulse{0%,100%{opacity:.35}50%{opacity:.9}}
        .group:hover .jp-glow,.jp-root:hover .jp-glow{opacity:1;animation:jp-pulse 1.2s ease-in-out infinite}
        .group:hover .jp-cell,.jp-root:hover .jp-cell{animation-duration:1.5s;animation-delay:calc(var(--i) * .07s)}
        .group:hover .jp-frame,.jp-root:hover .jp-frame{transform:scale(1.06)}
        @media (prefers-reduced-motion:reduce){
          .jp-cell{animation:none;opacity:1}
          .jp-frame{transition:none}
        }
      `}</style>

      <defs>
        <linearGradient id="jp-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff2d2d" />
          <stop offset="100%" stopColor="#ffa500" />
        </linearGradient>
        <radialGradient id="jp-halo">
          <stop offset="40%" stopColor="#00FFFF" stopOpacity=".45" />
          <stop offset="100%" stopColor="#00FFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="jp-root">
        <circle className="jp-glow" cx="40" cy="50" r="42" fill="url(#jp-halo)" />

        <g className="jp-frame">
          {CELLS.map(({ i, x, y }) => (
            <rect
              key={i}
              className="jp-cell"
              x={x}
              y={y}
              width="17"
              height="17"
              rx="3"
              fill="url(#jp-fill)"
              style={{ "--i": i } as React.CSSProperties}
            />
          ))}

          {/* Grille cyan par-dessus : cadre epais + separateurs fins. */}
          <g stroke="#00FFFF" fill="none" strokeLinecap="round">
            <rect x="10" y="24" width="59" height="59" rx="5" strokeWidth="2.5" />
            <g strokeWidth="1.4" opacity=".75">
              <path d="M29.5 24 V83 M48.5 24 V83 M10 43.5 H69 M10 62.5 H69" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
