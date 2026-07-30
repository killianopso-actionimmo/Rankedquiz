"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";

/**
 * Livre 3D qui EST le bouton du Quiz du Jour.
 *
 * Ouverture "portes de saloon" : les deux couvertures pivotent autour du dos
 * central (transform-origin sur le bord interieur) et liberent l'interieur.
 * Le survol est gere en CSS pur (aucun state React, donc aucun rendu par frame) ;
 * seul le rebond du clic passe par framer-motion, qui doit sequencer la
 * navigation apres l'animation.
 *
 * C'est un vrai <button> : focus clavier, Espace/Entree, aria-label. L'ouverture
 * se declenche aussi sur :focus-visible pour ne pas reserver l'effet a la souris.
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
  /** Texte sur la couverture (2 lignes max). */
  label?: string;
  /** Livre verrouille : plus d'ouverture ni de clic. */
  disabled?: boolean;
  /** Whoosh au clic. */
  sound?: boolean;
  className?: string;
};

export function QuizDuJourBook({
  href = "/play/daily",
  onClick,
  label = "Quiz",
  disabled = false,
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

  return (
    <motion.button
      type="button"
      animate={controls}
      onClick={handleClick}
      onPointerEnter={() => router.prefetch(href)}
      disabled={disabled || busy}
      aria-busy={busy}
      aria-label={disabled ? "Quiz du jour déjà terminé" : "Ouvrir le quiz du jour"}
      className={`qdj-btn${className ? ` ${className}` : ""}`}
    >
      <style>{`
        .qdj-btn{--qdj-w:100px;--qdj-h:133px;background:none;border:0;padding:0;cursor:pointer;perspective:900px;display:block}
        .qdj-btn:disabled{cursor:default}
        .qdj-btn:focus-visible{outline:2px solid #00FFFF;outline-offset:10px;border-radius:8px}
        @media (min-width:640px){.qdj-btn{--qdj-w:120px;--qdj-h:160px}}
        @media (min-width:1024px){.qdj-btn{--qdj-w:150px;--qdj-h:200px}}

        .qdj-book{position:relative;width:var(--qdj-w);height:var(--qdj-h);transform-style:preserve-3d;
          transform:rotateX(6deg) rotateY(-14deg);transition:transform .7s cubic-bezier(.22,1,.36,1)}
        .qdj-btn:hover .qdj-book,.qdj-btn:focus-visible .qdj-book{transform:rotateX(3deg) rotateY(-6deg) scale(1.05)}
        .qdj-btn:disabled .qdj-book{transform:rotateX(6deg) rotateY(-14deg)}

        /* Interieur : reste en arriere-plan, revele quand les couvertures s'ecartent. */
        .qdj-inside{position:absolute;inset:0;border-radius:3px 6px 6px 3px;background:#1a1a1a;
          transform:translateZ(-10px);overflow:hidden;box-shadow:inset 0 0 24px rgba(0,255,255,.18)}
        .qdj-lines{position:absolute;inset:14% 12%;display:flex;flex-direction:column;gap:9%;opacity:0;
          transition:opacity .5s ease .18s}
        .qdj-btn:hover .qdj-lines,.qdj-btn:focus-visible .qdj-lines{opacity:1}
        .qdj-lines i{display:block;height:2px;border-radius:2px;background:#00FFFF;opacity:.55}
        .qdj-lines i:nth-child(2){width:72%}
        .qdj-lines i:nth-child(3){width:86%}
        .qdj-lines i:nth-child(4){width:60%}
        .qdj-lines i:nth-child(5){width:78%}

        /* Couvertures : charnieres sur les bords EXTERIEURS.
           Avec des charnieres au centre (vrai livre) les deux battants se replient
           vers le milieu et n'exposent que les bords : l'effet portes de saloon
           disparait. Ici ils s'ecartent et degagent le centre. */
        .qdj-cover{position:absolute;top:0;height:100%;width:50%;
          background:linear-gradient(135deg,#FF6633,#FF9933);
          transition:transform .7s cubic-bezier(.22,1,.36,1);backface-visibility:hidden;
          display:flex;align-items:center;justify-content:center}
        .qdj-cover-l{left:0;transform-origin:left center;border-radius:5px 0 0 5px;
          box-shadow:inset -6px 0 12px rgba(0,0,0,.22),-4px 6px 18px rgba(255,102,51,.32)}
        .qdj-cover-r{right:0;transform-origin:right center;border-radius:0 5px 5px 0;
          box-shadow:inset 6px 0 12px rgba(0,0,0,.12),4px 6px 18px rgba(255,102,51,.32)}
        /* 62deg et pas 80+ : au-dela les couvertures sont vues de profil et
           l'effet "portes de saloon" disparait completement. */
        .qdj-btn:hover .qdj-cover-l,.qdj-btn:focus-visible .qdj-cover-l{transform:rotateY(-62deg)}
        .qdj-btn:hover .qdj-cover-r,.qdj-btn:focus-visible .qdj-cover-r{transform:rotateY(62deg)}

        /* Dos cyan : seul element qui reste visible livre ouvert. */
        .qdj-spine{position:absolute;top:2%;bottom:2%;left:calc(50% - 1px);width:2px;border-radius:2px;
          background:#00FFFF;box-shadow:0 0 10px rgba(0,255,255,.7);transform:translateZ(1px)}

        .qdj-label{font-weight:800;font-size:calc(var(--qdj-w) * .115);line-height:1.15;letter-spacing:.04em;
          text-transform:uppercase;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.35);text-align:center;padding:0 8%}
        .qdj-cover-r .qdj-label{color:#00FFFF;font-size:calc(var(--qdj-w) * .1)}
        /* Livre verrouille : la couverture porte un compte a rebours, plus long. */
        /* Blanc et non cyan : le cyan sur l'orange de la couverture ne passe pas
           le contraste a cette taille. */
        .qdj-btn:disabled .qdj-cover-r .qdj-label{font-size:calc(var(--qdj-w) * .088);font-variant-numeric:tabular-nums;
          letter-spacing:0;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.55)}

        /* Epaisseur : ombre portee au sol, sous le livre. */
        .qdj-shadow{position:absolute;left:8%;right:8%;bottom:-9%;height:10%;border-radius:50%;
          background:radial-gradient(ellipse,rgba(0,0,0,.3),transparent 72%);
          transform:translateZ(-30px);transition:opacity .6s ease}
        .qdj-btn:hover .qdj-shadow,.qdj-btn:focus-visible .qdj-shadow{opacity:.55}

        @media (prefers-reduced-motion:reduce){
          .qdj-book,.qdj-cover,.qdj-lines,.qdj-shadow{transition:none}
          .qdj-btn:hover .qdj-cover-l,.qdj-btn:focus-visible .qdj-cover-l,
          .qdj-btn:hover .qdj-cover-r,.qdj-btn:focus-visible .qdj-cover-r{transform:none}
        }
      `}</style>

      <div className="qdj-book">
        <div className="qdj-shadow" />

        <div className="qdj-inside">
          <div className="qdj-lines">
            <i /><i /><i /><i /><i />
          </div>
        </div>

        <div className="qdj-cover qdj-cover-l">
          <span className="qdj-label">Quiz</span>
        </div>
        <div className="qdj-cover qdj-cover-r">
          <span className="qdj-label" suppressHydrationWarning>
            {label}
          </span>
        </div>

        <div className="qdj-spine" />
      </div>
    </motion.button>
  );
}
