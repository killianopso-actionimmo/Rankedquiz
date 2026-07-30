/**
 * Logo Duel 1v1 : deux epees croisees qui s'entrechoquent + barres de vie.
 *
 * Meme DA que TimeAttackLogo. Cycle court (2.4s) volontairement nerveux :
 * ecartement -> impact (flash cyan) -> recul. Les deux barres de vie utilisent
 * des keyframes distinctes pour que le combat n'ait pas l'air symetrique.
 *
 * La rotation de base est portee par l'attribut `transform` du groupe exterieur,
 * l'oscillation par une transform CSS sur le groupe interieur : une transform CSS
 * ecrase l'attribut, il faut donc deux niveaux. `transform-box: view-box` permet
 * d'exprimer l'origine en coordonnees du viewBox, commune aux deux epees.
 */
const SWORD = (
  <>
    <path d="M40 29 L43.5 35 L43.5 56 L36.5 56 L36.5 35 Z" fill="url(#du-fill)" stroke="#00FFFF" strokeWidth="1.8" strokeLinejoin="round" />
    <rect x="30" y="56" width="20" height="4.5" rx="2.2" fill="#00FFFF" />
    <rect x="37.6" y="60.5" width="4.8" height="8" rx="2.4" fill="url(#du-fill)" />
    <circle cx="40" cy="70.5" r="2.8" fill="#00FFFF" />
  </>
);

export function OneVsOneLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 100" className={className} role="img" aria-label="Duel 1v1">
      <style>{`
        .du-l,.du-r{transform-box:view-box;transform-origin:40px 51px}
        .du-l{animation:du-l 2.4s cubic-bezier(.6,0,.35,1) infinite}
        .du-r{animation:du-r 2.4s cubic-bezier(.6,0,.35,1) infinite}
        .du-spark{transform-box:fill-box;transform-origin:center;opacity:0;animation:du-spark 2.4s ease-out infinite}
        .du-hp-a{transform-box:fill-box;transform-origin:left center;animation:du-hp-a 2.4s ease-out infinite}
        .du-hp-b{transform-box:fill-box;transform-origin:right center;animation:du-hp-b 2.4s ease-out infinite}
        .du-glow{opacity:0;transition:opacity .3s ease}
        .du-tilt{transition:transform .35s cubic-bezier(.22,1,.36,1);transform-box:fill-box;transform-origin:center}
        @keyframes du-l{0%{transform:rotate(7deg)}38%{transform:rotate(-6deg)}46%{transform:rotate(-3deg)}64%{transform:rotate(9deg)}100%{transform:rotate(7deg)}}
        @keyframes du-r{0%{transform:rotate(-7deg)}38%{transform:rotate(6deg)}46%{transform:rotate(3deg)}64%{transform:rotate(-9deg)}100%{transform:rotate(-7deg)}}
        @keyframes du-spark{0%,32%{opacity:0;transform:scale(.2)}40%{opacity:1;transform:scale(1)}58%{opacity:0;transform:scale(1.9)}100%{opacity:0;transform:scale(.2)}}
        @keyframes du-hp-a{0%,34%{transform:scaleX(1)}44%{transform:scaleX(.58)}92%{transform:scaleX(.62)}100%{transform:scaleX(1)}}
        @keyframes du-hp-b{0%,34%{transform:scaleX(.86)}44%{transform:scaleX(.34)}92%{transform:scaleX(.4)}100%{transform:scaleX(.86)}}
        @keyframes du-pulse{0%,100%{opacity:.35}50%{opacity:.95}}
        .group:hover .du-glow,.du-root:hover .du-glow{opacity:1;animation:du-pulse 1.2s ease-in-out infinite}
        .group:hover .du-tilt,.du-root:hover .du-tilt{transform:rotate(-4deg) scale(1.05)}
        .group:hover .du-l,.group:hover .du-r,.group:hover .du-spark,.group:hover .du-hp-a,.group:hover .du-hp-b,
        .du-root:hover .du-l,.du-root:hover .du-r,.du-root:hover .du-spark,.du-root:hover .du-hp-a,.du-root:hover .du-hp-b{animation-duration:1.1s}
        @media (prefers-reduced-motion:reduce){
          .du-l,.du-r,.du-spark,.du-hp-a,.du-hp-b{animation:none}
          .du-hp-b{transform:scaleX(.7)}
          .du-tilt{transition:none}
        }
      `}</style>

      <defs>
        <linearGradient id="du-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff2d2d" />
          <stop offset="100%" stopColor="#ffa500" />
        </linearGradient>
        <radialGradient id="du-halo">
          <stop offset="40%" stopColor="#00FFFF" stopOpacity=".45" />
          <stop offset="100%" stopColor="#00FFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="du-root">
        <circle className="du-glow" cx="40" cy="50" r="42" fill="url(#du-halo)" />

        <g className="du-tilt">
          {/* Barres de vie : piste cyan + remplissage qui encaisse a chaque impact. */}
          <rect x="9" y="14" width="62" height="9" rx="4.5" fill="none" stroke="#00FFFF" strokeWidth="2" />
          <rect className="du-hp-a" x="11.5" y="16.5" width="57" height="4" rx="2" fill="url(#du-fill)" />
          <rect x="9" y="79" width="62" height="9" rx="4.5" fill="none" stroke="#00FFFF" strokeWidth="2" />
          <rect className="du-hp-b" x="11.5" y="81.5" width="57" height="4" rx="2" fill="url(#du-fill)" />

          {/* Les deux epees : rotation de base en attribut, oscillation en CSS. */}
          <g transform="rotate(-42 40 51)">
            <g className="du-l">{SWORD}</g>
          </g>
          <g transform="rotate(42 40 51)">
            <g className="du-r">{SWORD}</g>
          </g>

          {/* Impact, au point de croisement des lames. */}
          <g className="du-spark" stroke="#00FFFF" strokeWidth="2.2" strokeLinecap="round">
            <path d="M40 28 V35 M40 53 V60 M24 44 H31 M49 44 H56 M29 33 L33.5 37.5 M51 55 L46.5 50.5 M51 33 L46.5 37.5 M29 55 L33.5 50.5" />
            <circle cx="40" cy="44" r="4.5" fill="#ffff00" fillOpacity=".6" stroke="none" />
          </g>
        </g>
      </g>
    </svg>
  );
}
