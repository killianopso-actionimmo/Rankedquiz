/**
 * Logo Time Attack : sablier anime, 100% SVG + CSS (aucun JS, aucun bitmap).
 *
 * Cycle de 8s = 2 vidanges de 4s. A chaque vidange le sablier se retourne de 180deg
 * (0 -> 180 -> 360), ce qui masque le reset des niveaux de sable : la boucle est
 * donc invisible. Le tilt de hover est sur un groupe SEPARE du flip, sinon les deux
 * transforms s'ecraseraient.
 *
 * Perf : uniquement `transform` et `opacity` (composites GPU), aucun layout/paint
 * par frame. Le `<style>` est inline dans le SVG pour rester un Server Component.
 */
export function TimeAttackLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 100"
      className={className}
      role="img"
      aria-label="Time Attack"
    >
      <style>{`
        .ta-root{transform-box:fill-box;transform-origin:center}
        .ta-flip{animation:ta-flip 8s cubic-bezier(.7,0,.3,1) infinite;transform-box:fill-box;transform-origin:center}
        .ta-shake{animation:ta-shake 4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
        .ta-fall-top{animation:ta-drain 4s cubic-bezier(.45,.05,.55,.95) infinite}
        .ta-fill-bot{animation:ta-fill 4s cubic-bezier(.45,.05,.55,.95) infinite}
        .ta-grain{animation:ta-grain 1.5s linear infinite;animation-delay:var(--d)}
        .ta-glow{opacity:0;transition:opacity .3s ease}
        @keyframes ta-flip{0%,48%{transform:rotate(0)}50%,98%{transform:rotate(180deg)}100%{transform:rotate(360deg)}}
        @keyframes ta-shake{0%,42%{transform:translate(0,0)}46%{transform:translate(-1px,0) rotate(-1.5deg)}50%{transform:translate(1px,0) rotate(1.5deg)}54%{transform:translate(-.8px,0) rotate(-1deg)}58%{transform:translate(.6px,0) rotate(.8deg)}62%,100%{transform:translate(0,0)}}
        @keyframes ta-drain{0%{transform:translateY(0)}100%{transform:translateY(40px)}}
        @keyframes ta-fill{0%{transform:translateY(46px)}100%{transform:translateY(0)}}
        @keyframes ta-grain{0%{transform:translateY(38px);opacity:0}12%{opacity:1}80%{opacity:1}100%{transform:translateY(80px);opacity:0}}
        .group:hover .ta-glow,.ta-root:hover .ta-glow{opacity:1;animation:ta-pulse 1.2s ease-in-out infinite}
        .group:hover .ta-tilt,.ta-root:hover .ta-tilt{transform:rotate(-5deg)}
        .ta-tilt{transition:transform .35s cubic-bezier(.22,1,.36,1);transform-box:fill-box;transform-origin:center}
        .group:hover .ta-grain,.ta-root:hover .ta-grain{animation-duration:.6s}
        .group:hover .ta-fall-top,.group:hover .ta-fill-bot,.group:hover .ta-shake,
        .ta-root:hover .ta-fall-top,.ta-root:hover .ta-fill-bot,.ta-root:hover .ta-shake{animation-duration:2s}
        @keyframes ta-pulse{0%,100%{opacity:.35}50%{opacity:.9}}
        @media (prefers-reduced-motion:reduce){
          .ta-flip,.ta-shake,.ta-fall-top,.ta-fill-bot,.ta-grain{animation:none}
          .ta-fall-top{transform:translateY(14px)}
          .ta-fill-bot{transform:translateY(16px)}
          .ta-tilt{transition:none}
        }
      `}</style>

      <defs>
        <linearGradient id="ta-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff2d2d" />
          <stop offset="100%" stopColor="#ffa500" />
        </linearGradient>
        <linearGradient id="ta-sand-lo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff2d2d" stopOpacity=".55" />
          <stop offset="100%" stopColor="#ffa500" stopOpacity=".85" />
        </linearGradient>
        <radialGradient id="ta-halo">
          <stop offset="40%" stopColor="#00FFFF" stopOpacity=".45" />
          <stop offset="100%" stopColor="#00FFFF" stopOpacity="0" />
        </radialGradient>
        {/* Chambres : servent a la fois de contour et de masque pour le sable. */}
        <path id="ta-top" d="M14 12 L66 12 C64 32 44 42 42 50 L38 50 C36 42 16 32 14 12 Z" />
        <path id="ta-bot" d="M14 89 L66 89 C64 69 44 59 42 51 L38 51 C36 59 16 69 14 89 Z" />
        <clipPath id="ta-clip-top">
          <use href="#ta-top" />
        </clipPath>
        <clipPath id="ta-clip-bot">
          <use href="#ta-bot" />
        </clipPath>
      </defs>

      <g className="ta-root">
        <circle className="ta-glow" cx="40" cy="50" r="42" fill="url(#ta-halo)" />

        <g className="ta-tilt">
          <g className="ta-flip">
            <g className="ta-shake">
              {/* Sable : rectangles pleins reveles par le clip de chaque chambre. */}
              <g clipPath="url(#ta-clip-top)">
                <rect className="ta-fall-top" x="10" y="8" width="60" height="46" fill="url(#ta-sand)" />
              </g>
              <g clipPath="url(#ta-clip-bot)">
                <rect className="ta-fill-bot" x="10" y="51" width="60" height="48" fill="url(#ta-sand-lo)" />
              </g>

              {/* Grains en chute libre a travers le col. */}
              <g fill="#ffa500">
                <circle className="ta-grain" cx="40" cy="0" r="1.5" style={{ "--d": "0s" } as React.CSSProperties} />
                <circle className="ta-grain" cx="39.2" cy="0" r="1.1" style={{ "--d": ".25s" } as React.CSSProperties} />
                <circle className="ta-grain" cx="40.8" cy="0" r="1.3" style={{ "--d": ".5s" } as React.CSSProperties} />
                <circle className="ta-grain" cx="39.6" cy="0" r="1" fill="#ffff00" opacity=".6" style={{ "--d": ".75s" } as React.CSSProperties} />
                <circle className="ta-grain" cx="40.4" cy="0" r="1.4" style={{ "--d": "1s" } as React.CSSProperties} />
                <circle className="ta-grain" cx="40" cy="0" r="1" fill="#ffff00" opacity=".6" style={{ "--d": "1.25s" } as React.CSSProperties} />
              </g>

              {/* Verre + monture cyan, par-dessus le sable. */}
              <g fill="none" stroke="#00FFFF" strokeWidth="2" strokeLinejoin="round">
                <use href="#ta-top" />
                <use href="#ta-bot" />
              </g>
              <g fill="#00FFFF">
                <rect x="10" y="6" width="60" height="5" rx="2.5" />
                <rect x="10" y="90" width="60" height="5" rx="2.5" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
