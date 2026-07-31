/**
 * Logo QUIZ CHAOS : le cercle de joueurs autour d'une bulle qui passe de main
 * en main.
 *
 * Meme DA que les autres logos de modes (viewBox 80x100, halo cyan au hover,
 * remplissage degrade chaud). L'animation raconte la mecanique du mode : une
 * seule tete est "allumee" a la fois, et le tour passe au suivant — cycle de
 * 4.8s, soit 1.2s par joueur.
 */
const HEADS = [
  { cx: 40, cy: 22 },
  { cx: 63, cy: 45 },
  { cx: 40, cy: 68 },
  { cx: 17, cy: 45 },
];

export function ChaosLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 100" className={className} role="img" aria-label="Quiz Chaos">
      <style>{`
        .cx-head{transform-box:fill-box;transform-origin:center}
        .cx-h0{animation:cx-turn 4.8s ease-in-out infinite}
        .cx-h1{animation:cx-turn 4.8s ease-in-out infinite -3.6s}
        .cx-h2{animation:cx-turn 4.8s ease-in-out infinite -2.4s}
        .cx-h3{animation:cx-turn 4.8s ease-in-out infinite -1.2s}
        .cx-bubble{transform-box:view-box;transform-origin:40px 45px;animation:cx-orbit 4.8s ease-in-out infinite}
        /* Contre-rotation : la bulle suit le cercle mais reste toujours droite. */
        .cx-counter{transform-box:fill-box;transform-origin:center;animation:cx-counter 4.8s ease-in-out infinite}
        .cx-mark{transform-box:fill-box;transform-origin:center;animation:cx-pop 1.2s ease-in-out infinite}
        .cx-glow{opacity:0;transition:opacity .3s ease}
        .cx-tilt{transition:transform .35s cubic-bezier(.22,1,.36,1);transform-box:fill-box;transform-origin:center}
        @keyframes cx-turn{0%,16%{opacity:1;transform:scale(1.14)}26%,100%{opacity:.4;transform:scale(1)}}
        @keyframes cx-orbit{0%,22%{transform:rotate(0deg)}25%,47%{transform:rotate(90deg)}50%,72%{transform:rotate(180deg)}75%,97%{transform:rotate(270deg)}100%{transform:rotate(360deg)}}
        @keyframes cx-counter{0%,22%{transform:rotate(0deg)}25%,47%{transform:rotate(-90deg)}50%,72%{transform:rotate(-180deg)}75%,97%{transform:rotate(-270deg)}100%{transform:rotate(-360deg)}}
        @keyframes cx-pop{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
        @keyframes cx-pulse{0%,100%{opacity:.35}50%{opacity:.95}}
        .group:hover .cx-glow,.cx-root:hover .cx-glow{opacity:1;animation:cx-pulse 1.2s ease-in-out infinite}
        .group:hover .cx-tilt,.cx-root:hover .cx-tilt{transform:rotate(-4deg) scale(1.05)}
        .group:hover .cx-bubble,.cx-root:hover .cx-bubble{animation-duration:2.4s}
        @media (prefers-reduced-motion:reduce){
          .cx-head,.cx-bubble,.cx-counter,.cx-mark{animation:none}
          .cx-h1,.cx-h2,.cx-h3{opacity:.4}
          .cx-tilt{transition:none}
        }
      `}</style>

      <defs>
        <linearGradient id="cx-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff2d2d" />
          <stop offset="100%" stopColor="#ffa500" />
        </linearGradient>
        <radialGradient id="cx-halo">
          <stop offset="40%" stopColor="#00FFFF" stopOpacity=".45" />
          <stop offset="100%" stopColor="#00FFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="cx-root">
        <circle className="cx-glow" cx="40" cy="50" r="42" fill="url(#cx-halo)" />

        <g className="cx-tilt">
          {/* La table : le cercle qui relie les joueurs. */}
          <circle cx="40" cy="45" r="23" fill="none" stroke="#00FFFF" strokeWidth="2" strokeDasharray="4 5" opacity=".55" />

          {/* Les quatre joueurs. Un seul est allume a la fois. */}
          {HEADS.map((h, i) => (
            <g key={i} className={`cx-head cx-h${i}`}>
              <circle cx={h.cx} cy={h.cy} r="8.5" fill="url(#cx-fill)" stroke="#00FFFF" strokeWidth="1.8" />
              <circle cx={h.cx - 3} cy={h.cy - 1} r="1.6" fill="#0F0F0F" />
              <circle cx={h.cx + 3} cy={h.cy - 1} r="1.6" fill="#0F0F0F" />
              <path
                d={`M${h.cx - 3.5} ${h.cy + 3.5}q3.5 3 7 0`}
                stroke="#0F0F0F"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ))}

          {/* La bulle de question tourne de joueur en joueur. */}
          <g className="cx-bubble">
            <g className="cx-counter" transform="translate(40 22)">
              <path
                d="M-11 -12h22a4 4 0 0 1 4 4v11a4 4 0 0 1-4 4h-8l-4 5-4-5h-6a4 4 0 0 1-4-4v-11a4 4 0 0 1 4-4z"
                fill="#F1FEC8"
                stroke="#00FFFF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <text
                className="cx-mark"
                x="0"
                y="2.5"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                fontWeight="800"
                fontFamily="Outfit, Inter, sans-serif"
                fill="#0F0F0F"
              >
                ?
              </text>
            </g>
          </g>

          {/* Les verres, sanctions optionnelles. */}
          <g stroke="#00FFFF" strokeWidth="1.8" fill="none" strokeLinejoin="round" opacity=".8">
            <path d="M27 82l1.5 9h5l1.5-9z" />
            <path d="M45 82l1.5 9h5l1.5-9z" />
          </g>
        </g>
      </g>
    </svg>
  );
}
