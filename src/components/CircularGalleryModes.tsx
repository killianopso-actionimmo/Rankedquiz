"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { TimeAttackLogo } from "@/components/logos/TimeAttackLogo";
import { JetPunkLogo } from "@/components/logos/JetPunkLogo";
import { ThematicLogo } from "@/components/logos/ThematicLogo";
import { OneVsOneLogo } from "@/components/logos/OneVsOneLogo";
import { RankedLogo } from "@/components/logos/RankedLogo";
import { ChaosLogo } from "@/components/logos/ChaosLogo";
import { GAME_MODES } from "@/data/modes";
import type { GameMode } from "@/types/quiz";

const LOGOS: Record<GameMode["id"], (p: { className?: string }) => React.ReactElement> = {
  "time-attack": TimeAttackLogo,
  jetpunk: JetPunkLogo,
  thematique: ThematicLogo,
  duel: OneVsOneLogo,
  ranked: RankedLogo,
  chaos: ChaosLogo,
};

/**
 * Teinte de la lueur / du liseré.
 *
 * Volontairement identique pour les cinq modes : le liseré prolonge le dégradé
 * intérieur de la carte (blanc -> vanilla), il n'a pas à varier d'un mode à
 * l'autre. `mode.accent` reste utilisé ailleurs (ModeCard), il n'est simplement
 * plus discriminant ici.
 */
const RING = {
  glow: "rgb(var(--c-vanilla-dark) / .55)",
  ring: "rgb(var(--c-vanilla-dark))",
};
const ACCENT: Record<GameMode["accent"], { glow: string; ring: string }> = {
  primary: RING,
  secondary: RING,
  highlight: RING,
};

/** Au-delà de ce déplacement, le geste est un drag : le clic est annulé. */
const DRAG_THRESHOLD = 5;
/** Projection de la vitesse au relâchement (ms) : donne l'inertie. */
const INERTIA_MS = 140;
/** Plafond de la projection, en nombre de cartes : un flick ne doit pas
 *  traverser toute la galerie d'un coup. */
const MAX_THROW_CARDS = 1.5;
/** Silence après la molette avant de re-caler sur une carte. */
const SETTLE_MS = 130;

/**
 * Carte centrée à l'arrivée sur la page.
 *
 * À scrollLeft 0 c'est la première carte qui est centrée, et tout le padding
 * gauche — une demi-largeur de viewport — reste vide. En démarrant sur la
 * deuxième carte, la galerie s'ouvre avec une carte de chaque côté.
 * Recherché par id : un réordonnancement de GAME_MODES ne doit pas déplacer
 * silencieusement le point de départ.
 */
const INITIAL_MODE_ID = "jetpunk";

/**
 * Galerie circulaire des modes de jeu.
 *
 * Le scroll est natif (overflow-x + scroll-snap) : sur mobile on hérite du
 * momentum système, qu'aucune réimplémentation JS n'égale. La géométrie en arc
 * est appliquée par écriture directe de variables CSS dans une frame rAF, sans
 * passer par le state React -- un setState par frame ferait re-render 5 cartes
 * à 60fps pour rien.
 *
 * Les positions des cartes sont mesurées une fois (puis à chaque resize) et
 * mises en cache : lire offsetLeft dans la même boucle que l'écriture des
 * styles forcerait un reflow synchrone à chaque carte (layout thrashing).
 */
export function CircularGalleryModes() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const reduced = useReducedMotion() ?? false;

  /** Centres des cartes en coordonnées de contenu + demi-largeur du viewport. */
  const metricsRef = useRef<{ centers: number[]; half: number }>({ centers: [], half: 0 });

  const drag = useRef({
    active: false,
    startX: 0,
    startScroll: 0,
    moved: false,
    lastX: 0,
    lastT: 0,
    velocity: 0,
  });
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measure = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    metricsRef.current = {
      centers: slotsRef.current.map((s) => (s ? s.offsetLeft + s.offsetWidth / 2 : 0)),
      half: scroller.clientWidth / 2,
    };
  }, []);

  /** Écrit --d (position signée -1..1) et --ad (magnitude) sur chaque carte. */
  const applyGeometry = useCallback(() => {
    rafRef.current = null;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const { centers, half } = metricsRef.current;
    if (!half) return;

    const viewCenter = scroller.scrollLeft + half;
    let nearest = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < slotsRef.current.length; i++) {
      const slot = slotsRef.current[i];
      if (!slot) continue;
      const offset = centers[i] - viewCenter;
      const d = Math.max(-1, Math.min(1, offset / half));
      slot.style.setProperty("--d", d.toFixed(4));
      slot.style.setProperty("--ad", Math.abs(d).toFixed(4));
      const abs = Math.abs(offset);
      if (abs < nearestDist) {
        nearestDist = abs;
        nearest = i;
      }
    }

    if (nearest !== activeRef.current) {
      activeRef.current = nearest;
      setActive(nearest);
    }
  }, []);

  const schedule = useCallback(() => {
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(applyGeometry);
  }, [applyGeometry]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const scroller = scrollerRef.current;
      const { centers, half } = metricsRef.current;
      const i = Math.max(0, Math.min(centers.length - 1, index));
      if (!scroller || centers[i] === undefined) return;
      scroller.scrollTo({ left: centers[i] - half, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced]
  );

  /** Recale sur la carte la plus proche d'une position de scroll donnée. */
  const settleAt = useCallback(
    (scrollLeft: number) => {
      const { centers, half } = metricsRef.current;
      let best = 0;
      let bestDist = Infinity;
      centers.forEach((c, i) => {
        const dist = Math.abs(c - half - scrollLeft);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      scrollToIndex(best);
    },
    [scrollToIndex]
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    measure();

    // Positionnement initial en écriture directe : scrollTo({behavior:"smooth"})
    // ferait défiler la galerie sous les yeux de l'utilisateur au chargement.
    const startIndex = GAME_MODES.findIndex((m) => m.id === INITIAL_MODE_ID);
    const { centers, half } = metricsRef.current;
    if (startIndex > 0 && centers[startIndex] !== undefined) {
      scroller.scrollLeft = centers[startIndex] - half;
      activeRef.current = startIndex;
      setActive(startIndex);
    }

    applyGeometry();

    const ro = new ResizeObserver(() => {
      measure();
      schedule();
    });
    ro.observe(scroller);

    /**
     * La molette est gérée à la main pour deux raisons : ne consommer que les
     * gestes à dominante horizontale (le vertical doit rester à la page), et
     * couper la propagation vers Lenis, qui écoute au niveau du document et
     * appellerait preventDefault sur l'événement.
     */
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      e.stopPropagation();
      scroller.style.scrollSnapType = "none";
      scroller.scrollLeft += e.deltaX;
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => {
        scroller.style.scrollSnapType = "";
        settleAt(scroller.scrollLeft);
      }, SETTLE_MS);
    };
    scroller.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      ro.disconnect();
      scroller.removeEventListener("wheel", onWheel);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, [measure, applyGeometry, schedule, settleAt]);

  // Le drag souris ne concerne pas le tactile : le scroll natif y est meilleur.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: scroller.scrollLeft,
      moved: false,
      lastX: e.clientX,
      lastT: performance.now(),
      velocity: 0,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const scroller = scrollerRef.current;
    if (!d.active || !scroller) return;
    const dx = e.clientX - d.startX;

    // La capture n'est prise qu'une fois le seuil franchi. La poser des le
    // pointerdown retargeterait mouseup et click sur le scroller : le <Link>
    // ne recevrait jamais son clic et aucune carte ne serait cliquable.
    if (!d.moved) {
      if (Math.abs(dx) <= DRAG_THRESHOLD) return;
      d.moved = true;
      scroller.style.scrollSnapType = "none";
      scroller.setPointerCapture(e.pointerId);
    }

    scroller.scrollLeft = d.startScroll - dx;

    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) {
      d.velocity = (d.lastX - e.clientX) / dt;
      d.lastX = e.clientX;
      d.lastT = now;
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const scroller = scrollerRef.current;
    if (!d.active || !scroller) return;
    d.active = false;
    if (!d.moved) return; // simple clic : rien à recaler, le <Link> fait son travail

    if (scroller.hasPointerCapture(e.pointerId)) scroller.releasePointerCapture(e.pointerId);
    scroller.style.scrollSnapType = "";

    const { centers } = metricsRef.current;
    const step = centers.length > 1 ? centers[1] - centers[0] : 0;
    const maxThrow = step * MAX_THROW_CARDS;
    const throwPx = Math.max(-maxThrow, Math.min(maxThrow, d.velocity * INERTIA_MS));
    settleAt(scroller.scrollLeft + throwPx);

    // Le navigateur n'émet pas toujours un click après un drag (mousedown et
    // mouseup sur des cibles différentes). Remettre le drapeau à zéro depuis le
    // handler de click le laisserait donc bloqué à true et avalerait le clic
    // *suivant*. On le purge après la phase de click du geste courant.
    setTimeout(() => (drag.current.moved = false), 0);
  };

  // Un drag ne doit pas déclencher le lien : on intercepte en phase capture,
  // avant que le clic n'atteigne le <Link>.
  const onClickCapture = (e: React.MouseEvent) => {
    if (!drag.current.moved) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    scrollToIndex(activeRef.current + (e.key === "ArrowRight" ? 1 : -1));
  };

  return (
    <div className="cg">
      <style>{`
        .cg{--cg-w:15rem;--cg-gap:.875rem;--cg-arc:26;--cg-rot:20}
        @media (min-width:640px){.cg{--cg-w:16.5rem;--cg-gap:1.25rem;--cg-arc:32}}
        @media (min-width:1024px){.cg{--cg-w:18.25rem;--cg-gap:1.75rem;--cg-arc:38}}

        .cg-scroller{display:flex;gap:var(--cg-gap);overflow-x:auto;overflow-y:hidden;
          /* Les paddings latéraux permettent aux cartes extrêmes d'atteindre le centre. */
          padding:2.25rem calc(50% - var(--cg-w) / 2) 2.75rem;
          scroll-snap-type:x mandatory;overscroll-behavior-x:contain;
          perspective:1100px;cursor:grab;user-select:none;
          scrollbar-width:none;-ms-overflow-style:none}
        .cg-scroller::-webkit-scrollbar{display:none}
        .cg-scroller:active{cursor:grabbing}
        .cg-scroller:focus-visible{outline:none}

        /* Géométrie en arc. Aucune transition ici : la valeur est réécrite à
           chaque frame de scroll, un easing la ferait traîner. */
        .cg-slot{flex:0 0 var(--cg-w);width:var(--cg-w);scroll-snap-align:center;list-style:none;
          transform:translateY(calc(var(--ad,1) * var(--cg-arc) * 1px))
                    rotateY(calc(var(--d,0) * var(--cg-rot) * -1deg))
                    scale(calc(1 - var(--ad,1) * .16));
          opacity:calc(1 - var(--ad,1) * .42);
          will-change:transform;transform-style:preserve-3d}

        .cg-card{display:flex;flex-direction:column;align-items:center;gap:.5rem;
          position:relative;height:100%;padding:1.5rem 1rem 1.25rem;
          border:1px solid rgb(var(--c-vanilla-dark));border-radius:var(--radius-lg);
          background:linear-gradient(160deg,rgb(var(--surface-card)) 0%,
            rgb(var(--surface-card)) 50%,rgb(var(--c-vanilla)) 100%);
          box-shadow:var(--shadow-subtle);
          transition:transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s ease,border-color .3s ease;
          -webkit-tap-highlight-color:transparent}
        .cg-slot:hover .cg-card,.cg-card:focus-visible{transform:translateY(-5px) scale(1.05);
          box-shadow:0 18px 38px var(--cg-glow);border-color:var(--cg-ring)}
        .cg-card:focus-visible{outline:2px solid var(--cg-ring);outline-offset:3px}
        .cg-slot[data-active="true"] .cg-card{border-color:var(--cg-ring);
          box-shadow:0 14px 32px var(--cg-glow)}

        .cg-logo{height:5.5rem;display:flex;align-items:center;justify-content:center}
        @media (min-width:640px){.cg-logo{height:6.5rem}}
        .cg-logo>svg{height:100%;width:auto}

        /* Les six logos cumulent 29 animations infinies. Sur mobile le carrousel
           n'en montre qu'une ou deux a la fois, mais sur grand ecran toutes les
           cartes tiennent a l'ecran et tout tourne en meme temps. On ne laisse
           animer que la carte centree : les voisines sont de toute facon
           reduites et attenuees a 42%, leur mouvement ne se lit pas. */
        .cg-slot:not([data-active="true"]) .cg-logo *{animation-play-state:paused}

        .cg-badge{position:absolute;top:-.6rem;right:1rem;border-radius:999px;
          padding:.15rem .55rem;font-size:.625rem;font-weight:800;letter-spacing:.04em;
          text-transform:uppercase;color:rgb(var(--c-on-accent));background:var(--cg-ring)}

        .cg-dots{display:flex;justify-content:center;gap:.4rem;margin-top:-.75rem}
        .cg-dot{height:.375rem;width:.375rem;border-radius:999px;background:rgb(var(--surface-border));
          transition:width .3s cubic-bezier(.22,1,.36,1),background-color .3s ease}
        .cg-dot[aria-current="true"]{width:1.375rem;background:var(--cg-ring)}

        /* On attenue au lieu de supprimer : sans arc du tout la galerie n'a plus
           rien de circulaire. On garde l'echelle et l'opacite (peu problematiques
           pour le vestibulaire) et on coupe la rotation, plus agressive. */
        @media (prefers-reduced-motion:reduce){
          .cg{--cg-arc:10;--cg-rot:0}
          .cg-card,.cg-dot{transition:none}
          .cg-slot:hover .cg-card,.cg-card:focus-visible{transform:scale(1.02)}
        }
      `}</style>

      <div
        ref={scrollerRef}
        className="cg-scroller"
        role="group"
        aria-roledescription="carrousel"
        aria-label="Modes de jeu"
        tabIndex={0}
        onScroll={schedule}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onKeyDown={onKeyDown}
      >
        <ul className="contents">
          {GAME_MODES.map((mode, i) => {
            const Logo = LOGOS[mode.id];
            const accent = ACCENT[mode.accent];
            return (
              <li
                key={mode.id}
                ref={(el) => {
                  slotsRef.current[i] = el;
                }}
                className="cg-slot"
                data-active={i === active}
                style={
                  {
                    "--cg-glow": accent.glow,
                    "--cg-ring": accent.ring,
                  } as React.CSSProperties
                }
              >
                <Link href={mode.href} className="cg-card" draggable={false}>
                  {mode.badge && <span className="cg-badge">{mode.badge}</span>}
                  <div className="cg-logo">
                    <Logo />
                  </div>
                  <h3 className="font-display text-lg font-bold leading-snug text-ink">
                    {mode.title}
                  </h3>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="cg-dots">
        {GAME_MODES.map((mode, i) => (
          <button
            key={mode.id}
            type="button"
            className="cg-dot"
            aria-current={i === active}
            aria-label={`Aller à ${mode.title}`}
            style={{ "--cg-ring": ACCENT[mode.accent].ring } as React.CSSProperties}
            onClick={() => scrollToIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
