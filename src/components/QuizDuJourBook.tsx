"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";

/**
 * Livre 3D qui EST le bouton du Quiz du Jour.
 *
 * Visuel importe du projet Claude Design "Icone Quiz du jour animee" : deux
 * couvertures orange a charnieres exterieures qui s'ecartent en portes de
 * saloon, dos cyan lumineux, signet cranté, interieur qui se revele.
 *
 * La geometrie du design est exprimee en pixels absolus sur une base de
 * 320x356. Plutot que de recalculer chaque valeur, le livre est mis a
 * l'echelle d'un bloc via --qdj-s : les proportions restent exactes a toutes
 * les tailles.
 *
 * Interaction : le design d'origine ouvre/ferme au clic. Ici le clic navigue
 * (c'est l'entree du mode Quiz du Jour), l'ouverture se fait au survol et au
 * focus clavier. Elle est aussi forcee pendant le rebond du clic, sinon sur
 * mobile — ou il n'y a pas de survol — le livre partirait sans jamais s'ouvrir.
 */

/** Whoosh synthetise a la volee : bruit blanc filtre, zero asset a telecharger. */
function playWhoosh() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const dur = 0.36;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 1.4;
    band.frequency.setValueAtTime(500, ctx.currentTime);
    band.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + dur * 0.45);
    band.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);

    src.connect(band).connect(gain).connect(ctx.destination);
    src.start();
    src.onended = () => ctx.close();
  } catch {
    /* Audio indisponible (politique navigateur, contexte non securise) : on ignore. */
  }
}

export type QuizDuJourBookProps = {
  /** Route ouverte au clic. Ignore si `onClick` est fourni. */
  href?: string;
  /** Remplace la navigation par un callback (scroll vers une section, modale...). */
  onClick?: () => void;
  /** Texte sur la couverture droite : date du jour, ou compte a rebours si termine. */
  label?: string;
  /** Livre verrouille : plus d'ouverture ni de clic. */
  disabled?: boolean;
  /** Serie en cours, affichee a l'interieur. Masquee si 0. */
  streak?: number;
  /** Whoosh au clic. */
  sound?: boolean;
  className?: string;
};

export function QuizDuJourBook({
  href = "/play/daily",
  onClick,
  label = "Quiz",
  disabled = false,
  streak = 0,
  sound = true,
  className,
}: QuizDuJourBookProps) {
  const router = useRouter();
  const controls = useAnimationControls();
  const prefersReduced = useReducedMotion() ?? false;
  const [busy, setBusy] = useState(false);
  // Ref en plus du state : le state n'est pas encore a jour si deux clics
  // tombent dans la meme frame.
  const busyRef = useRef(false);

  const handleClick = useCallback(async () => {
    if (disabled || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);

    if (sound) playWhoosh();

    const go = () => (onClick ? onClick() : router.push(href));

    if (prefersReduced) {
      go();
      busyRef.current = false;
      setBusy(false);
      return;
    }

    await controls.start({
      scale: [1, 1.15, 0.95, 1.04, 1],
      transition: { duration: 0.5, times: [0, 0.28, 0.52, 0.78, 1], ease: "easeOut" },
    });

    go();
    busyRef.current = false;
    setBusy(false);
  }, [disabled, sound, onClick, router, href, prefersReduced, controls]);

  // Le compte a rebours a besoin de chiffres alignes et sans interlettrage :
  // "12:04:59" en letter-spacing .16em deborde la couverture.
  const labelIsCountdown = disabled;

  return (
    <motion.button
      type="button"
      animate={controls}
      onClick={handleClick}
      onPointerEnter={() => router.prefetch(href)}
      disabled={disabled || busy}
      aria-busy={busy}
      data-open={busy || undefined}
      aria-label={disabled ? "Quiz du jour déjà terminé" : "Ouvrir le quiz du jour"}
      className={`qdj-btn${className ? ` ${className}` : ""}`}
    >
      <style>{`
        .qdj-btn{--qdj-s:.62;--qdj-swing:112deg;background:none;border:0;padding:0;cursor:pointer;display:block;
          width:calc(320px * var(--qdj-s));height:calc(356px * var(--qdj-s))}
        .qdj-btn:disabled{cursor:default}
        .qdj-btn:focus-visible{outline:2px solid #2ee6e6;outline-offset:12px;border-radius:14px}
        @media (min-width:640px){.qdj-btn{--qdj-s:.8}}
        @media (min-width:1024px){.qdj-btn{--qdj-s:1}}

        /* Mise a l'echelle du bloc : la geometrie interne reste en px absolus,
           exactement comme dans le fichier de design. */
        .qdj-scale{width:320px;height:356px;transform:scale(var(--qdj-s));transform-origin:top left;
          position:relative;perspective:1500px;perspective-origin:50% 45%}

        .qdj-glow{position:absolute;left:50%;top:50%;width:360px;height:300px;margin:-150px 0 0 -180px;
          border-radius:50%;filter:blur(4px);opacity:.5;transition:opacity .8s ease;
          background:radial-gradient(closest-side,rgba(255,138,61,.55),rgba(255,138,61,0) 72%);
          animation:qdj-pulse 5s ease-in-out infinite}
        .qdj-ground{position:absolute;left:50%;bottom:-14px;width:250px;height:26px;margin-left:-125px;
          border-radius:50%;opacity:1;transition:opacity .8s ease;
          background:radial-gradient(closest-side,rgba(20,23,26,.16),rgba(20,23,26,0) 75%)}

        .qdj-float{position:absolute;inset:0;transform-style:preserve-3d;
          animation:qdj-float 6.5s ease-in-out infinite}
        .qdj-lift{position:absolute;inset:0;transform-style:preserve-3d;
          transition:transform .8s cubic-bezier(.3,1.4,.5,1)}

        /* Dos central lumineux : seul element toujours visible. */
        .qdj-spine{position:absolute;left:50%;top:10px;width:16px;height:336px;margin-left:-8px;border-radius:8px;
          background:linear-gradient(180deg,#2ee6e6,#14c9c9);box-shadow:0 0 22px rgba(45,224,224,.75);z-index:1}

        .qdj-inside{position:absolute;inset:6px 12px;border-radius:12px;background:#fff;border:3px solid #2ee6e6;
          box-shadow:0 18px 34px rgba(20,23,26,.14),0 0 26px rgba(45,224,224,.35);overflow:hidden;z-index:2}
        .qdj-gutter{position:absolute;left:50%;top:14px;bottom:14px;width:3px;margin-left:-1.5px;
          background:rgba(45,224,224,.5);border-radius:2px}
        .qdj-pages{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;align-items:center;
          opacity:0;transition:opacity .45s ease .3s}

        .qdj-pl{min-width:0;display:flex;flex-direction:column;align-items:center;gap:10px;padding:0 10px;text-align:center}
        .qdj-mark{width:58px;height:58px;border-radius:14px;border:3px solid #2ee6e6;display:flex;align-items:center;
          justify-content:center;font-size:30px;font-weight:900;color:#fff;box-shadow:0 0 16px rgba(45,224,224,.45);
          background:linear-gradient(150deg,#ffa257,#f2650a)}
        .qdj-n{font-size:15px;font-weight:900;letter-spacing:.06em;color:#14171a;text-transform:uppercase;
          line-height:1.2;white-space:nowrap}
        .qdj-sub{font-size:12px;font-weight:600;color:#7b8489;letter-spacing:.04em}

        .qdj-pr{min-width:0;display:flex;flex-direction:column;align-items:center;gap:12px;padding:0 10px}
        .qdj-bars{display:flex;flex-direction:column;gap:7px;width:100%}
        .qdj-bars i{display:block;height:7px;border-radius:4px;background:rgba(242,101,10,.25)}
        .qdj-bars i:first-child{background:linear-gradient(90deg,#ffa257,#f2650a);box-shadow:0 0 8px rgba(242,101,10,.35)}
        .qdj-bars i:nth-child(2){width:74%}
        .qdj-bars i:nth-child(3){width:88%}
        .qdj-cta{display:flex;align-items:center;justify-content:center;padding:9px 14px;border-radius:999px;
          background:linear-gradient(150deg,#ffa257,#f2650a);border:2px solid #2ee6e6;color:#fff;font-size:12px;
          font-weight:900;letter-spacing:.08em;white-space:nowrap;text-transform:uppercase;
          box-shadow:0 6px 14px rgba(242,101,10,.3)}
        .qdj-streak{font-size:10px;font-weight:800;letter-spacing:.04em;color:#14c9c9;text-transform:uppercase;
          white-space:nowrap}

        /* Couvertures : charnieres sur les bords EXTERIEURS, elles s'ecartent
           et degagent le centre. */
        .qdj-cover{position:absolute;top:0;width:162px;height:356px;transform-style:preserve-3d;z-index:5;
          transition:transform 1s cubic-bezier(.26,1.5,.42,1)}
        .qdj-cover-l{left:0;transform-origin:left center}
        .qdj-cover-r{right:0;transform-origin:right center}

        .qdj-face{position:absolute;inset:0;backface-visibility:hidden;overflow:hidden;border:3px solid #2ee6e6;
          box-shadow:0 16px 30px rgba(234,92,5,.28),0 0 22px rgba(45,224,224,.3)}
        .qdj-cover-l .qdj-face{border-radius:14px 4px 4px 14px;border-right:none;
          background:linear-gradient(150deg,#ffa257 0%,#f9761d 55%,#ea5c05 100%)}
        .qdj-cover-r .qdj-face{border-radius:4px 14px 14px 4px;border-left:none;
          background:linear-gradient(210deg,#ffa257 0%,#f9761d 55%,#ea5c05 100%)}

        .qdj-sheen{position:absolute;inset:0;animation:qdj-sheen 4s ease-in-out infinite}
        .qdj-cover-l .qdj-sheen{background:linear-gradient(112deg,rgba(255,255,255,0) 38%,rgba(255,255,255,.5) 50%,rgba(255,255,255,0) 62%)}
        .qdj-cover-r .qdj-sheen{background:linear-gradient(-112deg,rgba(255,255,255,0) 38%,rgba(255,255,255,.5) 50%,rgba(255,255,255,0) 62%)}

        .qdj-inner{position:absolute;border:2px solid rgba(255,255,255,.35)}
        .qdj-cover-l .qdj-inner{inset:10px 0 10px 10px;border-right:none;border-radius:8px 0 0 8px}
        .qdj-cover-r .qdj-inner{inset:10px 10px 10px 0;border-left:none;border-radius:0 8px 8px 0}

        .qdj-q{position:absolute;top:108px;width:84px;height:84px;border-radius:22px;background:rgba(255,255,255,.14);
          border:3px solid #2ee6e6;display:flex;align-items:center;justify-content:center;font-size:46px;
          font-weight:900;color:#fff;box-shadow:0 0 20px rgba(45,224,224,.5)}
        .qdj-cover-l .qdj-q{right:-42px}
        .qdj-cover-r .qdj-q{left:-42px}

        .qdj-cap{position:absolute;bottom:30px;font-size:15px;font-weight:900;letter-spacing:.16em;color:#fff;
          text-transform:uppercase}
        .qdj-cover-l .qdj-cap{left:16px}
        .qdj-cover-r .qdj-cap{right:16px}
        /* Compte a rebours : chiffres alignes, pas d'interlettrage, sinon
           "12:04:59" deborde la couverture. */
        .qdj-cap[data-countdown]{font-size:13px;letter-spacing:0;font-variant-numeric:tabular-nums;
          text-shadow:0 1px 4px rgba(0,0,0,.45)}

        .qdj-dash{position:absolute;top:26px;display:flex;flex-direction:column;gap:5px}
        .qdj-cover-l .qdj-dash{left:16px}
        .qdj-cover-r .qdj-dash{right:16px;align-items:flex-end}
        .qdj-dash i{display:block;width:34px;height:5px;border-radius:3px;background:rgba(255,255,255,.75)}
        .qdj-dash i:last-child{width:20px;background:rgba(255,255,255,.45)}

        .qdj-back{position:absolute;inset:0;transform:rotateY(180deg);backface-visibility:hidden;background:#fff;
          border:3px solid #2ee6e6}
        .qdj-cover-l .qdj-back{border-radius:4px 14px 14px 4px;border-left:none}
        .qdj-cover-r .qdj-back{border-radius:14px 4px 4px 14px;border-right:none}
        .qdj-back::after{content:"";position:absolute;inset:14px;border-radius:8px;
          border:2px dashed rgba(242,101,10,.25)}

        /* Signet crante, sous le livre. */
        .qdj-ribbon{position:absolute;left:50%;top:300px;width:14px;height:78px;margin-left:-7px;z-index:3;
          background:linear-gradient(180deg,#2ee6e6,#12b8b8);box-shadow:0 0 14px rgba(45,224,224,.6);
          clip-path:polygon(0 0,100% 0,100% 100%,50% 74%,0 100%)}

        /* ------------------------------------------------------- ouverture */
        .qdj-btn:hover .qdj-cover-l,.qdj-btn:focus-visible .qdj-cover-l,
        .qdj-btn[data-open] .qdj-cover-l{transform:rotateY(calc(-1 * var(--qdj-swing)))}
        .qdj-btn:hover .qdj-cover-r,.qdj-btn:focus-visible .qdj-cover-r,
        .qdj-btn[data-open] .qdj-cover-r{transform:rotateY(var(--qdj-swing))}
        .qdj-btn:hover .qdj-lift,.qdj-btn:focus-visible .qdj-lift,
        .qdj-btn[data-open] .qdj-lift{transform:translateY(-10px) scale(1.03)}
        .qdj-btn:hover .qdj-pages,.qdj-btn:focus-visible .qdj-pages,
        .qdj-btn[data-open] .qdj-pages{opacity:1}
        .qdj-btn:hover .qdj-glow,.qdj-btn:focus-visible .qdj-glow,
        .qdj-btn[data-open] .qdj-glow{opacity:1}
        .qdj-btn:hover .qdj-ground,.qdj-btn:focus-visible .qdj-ground,
        .qdj-btn[data-open] .qdj-ground{opacity:.5}

        /* Livre verrouille : il reste ferme, la couverture porte le decompte. */
        .qdj-btn:disabled .qdj-cover-l,.qdj-btn:disabled .qdj-cover-r{transform:none}
        .qdj-btn:disabled .qdj-pages{opacity:0}
        .qdj-btn:disabled .qdj-lift{transform:none}
        .qdj-btn:disabled .qdj-face{filter:saturate(.55) brightness(.92)}

        @keyframes qdj-float{0%,100%{transform:translateY(0) rotateZ(0deg)}50%{transform:translateY(-9px) rotateZ(-.5deg)}}
        @keyframes qdj-pulse{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.85;transform:scale(1.05)}}
        @keyframes qdj-sheen{0%,100%{opacity:.12}50%{opacity:.4}}

        @media (prefers-reduced-motion:reduce){
          .qdj-float,.qdj-glow,.qdj-sheen{animation:none}
          .qdj-cover,.qdj-lift,.qdj-pages,.qdj-glow,.qdj-ground{transition:none}
        }
      `}</style>

      <div className="qdj-scale">
        <div className="qdj-glow" />
        <div className="qdj-ground" />

        <div className="qdj-float">
          <div className="qdj-lift">
            <div className="qdj-spine" />

            <div className="qdj-inside">
              <div className="qdj-gutter" />
              <div className="qdj-pages">
                <div className="qdj-pl">
                  <div className="qdj-mark">?</div>
                  <div className="qdj-n">3 Questions</div>
                  <div className="qdj-sub">un seul essai</div>
                </div>
                <div className="qdj-pr">
                  <div className="qdj-bars">
                    <i /><i /><i />
                  </div>
                  <div className="qdj-cta">Jouer</div>
                  {streak > 0 && (
                    <div className="qdj-streak" suppressHydrationWarning>
                      Série · {streak} j
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="qdj-cover qdj-cover-l">
              <div className="qdj-face">
                <div className="qdj-sheen" />
                <div className="qdj-inner" />
                <div className="qdj-q">?</div>
                <div className="qdj-cap">Quiz</div>
                <div className="qdj-dash">
                  <i /><i />
                </div>
              </div>
              <div className="qdj-back" />
            </div>

            <div className="qdj-cover qdj-cover-r">
              <div className="qdj-face">
                <div className="qdj-sheen" />
                <div className="qdj-inner" />
                <div className="qdj-q">?</div>
                <div
                  className="qdj-cap"
                  data-countdown={labelIsCountdown || undefined}
                  suppressHydrationWarning
                >
                  {label}
                </div>
                <div className="qdj-dash">
                  <i /><i />
                </div>
              </div>
              <div className="qdj-back" />
            </div>

            <div className="qdj-ribbon" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
