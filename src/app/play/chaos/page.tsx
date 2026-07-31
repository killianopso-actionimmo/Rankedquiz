"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Beer, Home, Share2, SkipForward, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Choice } from "@/components/ui/Field";
import { cn } from "@/components/ui/cn";
import { ChaosAvatar } from "@/components/chaos/ChaosAvatar";
import { ChaosLogo } from "@/components/logos/ChaosLogo";
import { CHAOS_DECK_META, CHAOS_TOTAL_QUESTIONS } from "@/data/chaosQuestions";
import { useChaosHost } from "@/hooks/useChaosHost";
import { joinUrl } from "@/lib/chaosRoom";
import { shareRecapCard } from "@/lib/chaosShare";
import {
  CHAOS_MAX_PLAYERS,
  CHAOS_MIN_PLAYERS,
  CHAOS_QUESTIONS_PER_ROUND,
  chaosAsker,
  chaosPositionInRound,
  chaosRoundOf,
  type ChaosDeck,
} from "@/types/chaos";

/**
 * ECRAN CENTRAL (TV / ordi) — QUIZ CHAOS.
 *
 * Cet ecran ne joue pas : il affiche. Toute la commande est sur le telephone du
 * joueur dont c'est le tour. Le seul controle laisse ici est un "Passer"
 * discret, filet de securite si un telephone lache en pleine partie.
 */
export default function ChaosHostPage() {
  const { state, createRoom, setDrinks, start, skip, closeRoom } = useChaosHost();
  const [sharing, setSharing] = useState(false);

  // Le salon n'existe qu'apres un clic cote client : pas de rendu serveur ici,
  // `window.location` est donc lisible pendant le rendu.
  const url = state ? joinUrl(state.code) : "";

  const asker = state ? chaosAsker(state) : null;
  const question = state?.queue[state.index] ?? null;

  /* --------------------------------------------------------- choix du deck */
  if (!state) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-token-8 px-token-4 py-token-8">
        <header className="flex flex-col items-center gap-token-2 text-center">
          <ChaosLogo className="h-28 w-24" />
          <h1 className="bg-quiz-gradient bg-clip-text font-display text-4xl font-bold text-transparent sm:text-6xl">
            QUIZ CHAOS
          </h1>
          <p className="max-w-md text-balance text-sm text-ink-soft sm:text-base">
            2 a 8 joueurs. Chacun pose les questions a son tour, tout le monde repond
            a voix haute. Ton telephone ne sert qu&apos;a passer a la suivante.
          </p>
        </header>

        <div className="grid w-full max-w-3xl gap-token-4 sm:grid-cols-2">
          {(Object.keys(CHAOS_DECK_META) as ChaosDeck[]).map((deck) => {
            const meta = CHAOS_DECK_META[deck];
            return (
              <button
                key={deck}
                onClick={() => createRoom(deck)}
                className={cn(
                  "group flex flex-col gap-token-2 rounded-lg border border-line bg-background-card p-token-6 text-left",
                  "shadow-subtle transition-all duration-[var(--duration-base)] ease-token",
                  "hover:-translate-y-1 hover:shadow-medium",
                  deck === "discover" ? "hover:border-secondary-dark" : "hover:border-danger",
                )}
              >
                <span
                  className={cn(
                    "w-fit rounded-full px-token-4 py-token-1 font-display text-sm font-bold text-ink-accent",
                    deck === "discover" ? "bg-secondary" : "bg-danger",
                  )}
                >
                  {meta.label}
                </span>
                <span className="font-display text-xl font-bold">{meta.tagline}</span>
                <span className="text-sm leading-snug text-ink-soft">{meta.detail}</span>
                <span className="mt-token-2 text-xs font-semibold uppercase tracking-widest text-ink-faint">
                  {CHAOS_TOTAL_QUESTIONS} questions · 5 rounds
                </span>
              </button>
            );
          })}
        </div>

        <Link href="/" className="text-sm text-ink-soft underline-offset-4 hover:underline">
          Retour a l&apos;accueil
        </Link>
      </main>
    );
  }

  const meta = CHAOS_DECK_META[state.deck];

  /* ---------------------------------------------------------------- LOBBY */
  if (state.phase === "lobby") {
    const enough = state.players.length >= CHAOS_MIN_PLAYERS;
    return (
      <main className="flex flex-1 flex-col gap-token-6 px-token-4 py-token-8">
        <HostHeader deck={meta.label} code={state.code} />

        <div className="grid flex-1 gap-token-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          {/* QR — le seul setup demande aux joueurs */}
          <section className="flex flex-col items-center gap-token-4 rounded-lg border border-line bg-background-card p-token-6 shadow-subtle">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-ink-soft">
              Scannez pour rejoindre
            </p>
            <div className="rounded-lg bg-white p-token-4">
              {url && <QRCodeSVG value={url} size={200} level="M" marginSize={0} />}
            </div>
            <p className="text-center font-display text-5xl font-bold tracking-[0.2em] text-primary">
              {state.code}
            </p>
            <p className="break-all text-center text-xs text-ink-faint">{url}</p>
          </section>

          {/* Joueurs + reglages */}
          <section className="flex flex-col gap-token-4">
            <div className="flex items-center gap-token-2 text-sm font-semibold uppercase tracking-widest text-ink-soft">
              <Users className="h-4 w-4" />
              Joueurs {state.players.length}/{CHAOS_MAX_PLAYERS}
            </div>

            <div className="flex flex-1 flex-wrap content-start justify-center gap-token-6">
              <AnimatePresence initial={false}>
                {state.players.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ type: "spring", stiffness: 320, damping: 24 }}
                    className="flex w-24 flex-col items-center gap-token-2 sm:w-28"
                  >
                    <ChaosAvatar avatar={p.avatar} name={p.name} className="w-full" />
                    <span className="w-full truncate text-center text-sm font-semibold">
                      {p.name}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {state.players.length === 0 && (
                <p className="w-full py-token-8 text-center text-sm text-ink-faint">
                  En attente du premier joueur…
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-token-4 rounded-lg border border-line bg-background-card p-token-4">
              <div className="flex items-center gap-token-2 text-sm">
                <Beer className="h-4 w-4 text-ink-soft" />
                <Choice
                  label="Sanctions gorgees"
                  checked={state.drinks}
                  onChange={(e) => setDrinks(e.target.checked)}
                  className="whitespace-nowrap font-semibold"
                />
                <span className="text-ink-faint">— optionnel, 1 a 5 gorgees par question</span>
              </div>

              <Button size="lg" disabled={!enough} onClick={start}>
                {enough ? "START" : `Encore ${CHAOS_MIN_PLAYERS - state.players.length} joueur`}
              </Button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------------- PARTIE */
  if (state.phase === "playing" && question) {
    const round = chaosRoundOf(state);
    const pos = chaosPositionInRound(state);
    return (
      <main className="flex flex-1 flex-col gap-token-6 px-token-4 py-token-6">
        <HostHeader
          deck={meta.label}
          code={state.code}
          progress={
            question.custom
              ? "Questions du groupe"
              : `Round ${round}/5 · Question ${pos}/${CHAOS_QUESTIONS_PER_ROUND}`
          }
        />

        <RoundBar round={round} pos={pos} custom={question.custom} />

        <section className="flex flex-1 flex-col items-center justify-center gap-token-6 text-center">
          {/* Pas d'AnimatePresence ici : quand le changement de question vient du
              canal temps reel (donc hors evenement React), la sortie ne se
              termine jamais et l'ecran reste fige sur l'ancienne question. Un
              motion.div keye rejoue l'entree, sans risque de blocage. */}
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-token-6"
          >
            {asker && (
              <div className="flex flex-col items-center gap-token-2">
                <ChaosAvatar
                  avatar={asker.avatar}
                  name={asker.name}
                  active
                  className="w-40 sm:w-52"
                />
                <p className="font-display text-2xl font-bold sm:text-3xl">{asker.name}</p>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                  pose la question
                </p>
              </div>
            )}

            <h2 className="max-w-4xl text-balance font-display text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {question.text}
            </h2>

            {question.custom && question.author && (
              <p className="text-sm text-ink-soft">
                Question maison, signee{" "}
                <span className="font-semibold text-primary">{question.author}</span>
              </p>
            )}

            {state.drinks && state.sips !== null && (
              <p className="flex items-center gap-token-2 rounded-full bg-secondary px-token-6 py-token-2 font-display text-lg font-bold text-ink-accent">
                <Beer className="h-5 w-5" />
                {state.sips} gorgee{state.sips > 1 ? "s" : ""} en jeu
              </p>
            )}
          </motion.div>
        </section>

        <footer className="flex items-center justify-between gap-token-4 text-sm text-ink-faint">
          <p>Repondez a voix haute. {asker?.name ?? "Le joueur"} decide quand on passe.</p>
          <button
            onClick={skip}
            className="flex items-center gap-token-1 text-xs uppercase tracking-widest opacity-40 transition-opacity hover:opacity-100"
          >
            <SkipForward className="h-3.5 w-3.5" />
            Passer
          </button>
        </footer>
      </main>
    );
  }

  /* --------------------------------------------------------------- FIN */
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-token-6 px-token-4 py-token-8 text-center">
      <ChaosLogo className="h-24 w-20" />
      <h1 className="font-display text-4xl font-bold sm:text-5xl">C&apos;est fini.</h1>
      <p className="max-w-md text-balance text-ink-soft">
        {state.index + 1} questions posees, {state.players.length}{" "}
        survivants. Vous avez maintenant beaucoup trop d&apos;informations les uns sur
        les autres.
      </p>

      <div className="flex max-w-2xl flex-wrap items-center justify-center gap-token-4">
        {state.players.map((p) => (
          <div key={p.id} className="flex w-20 flex-col items-center gap-token-1">
            <ChaosAvatar avatar={p.avatar} name={p.name} className="w-full" />
            <span className="truncate text-xs font-semibold">{p.name}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-token-4">
        <Button
          icon={<Share2 className="h-4 w-4" />}
          loading={sharing}
          onClick={async () => {
            setSharing(true);
            await shareRecapCard(state);
            setSharing(false);
          }}
        >
          Partager la carte
        </Button>
        <Button variant="ghost" onClick={closeRoom}>
          Nouvelle partie
        </Button>
        <Link href="/">
          <Button variant="ghost" icon={<Home className="h-4 w-4" />}>
            Accueil
          </Button>
        </Link>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------- SOUS-BLOCS */

function HostHeader({
  deck,
  code,
  progress,
}: {
  deck: string;
  code: string;
  progress?: string;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-token-2 border-b border-line pb-token-4">
      <div className="flex items-center gap-token-2">
        <ChaosLogo className="h-10 w-8" />
        <span className="font-display text-lg font-bold tracking-wide">
          QUIZ CHAOS <span className="text-ink-faint">·</span>{" "}
          <span className="text-primary">{deck}</span>
        </span>
      </div>
      <div className="flex items-center gap-token-4 text-sm font-semibold uppercase tracking-widest text-ink-soft">
        {progress && <span>{progress}</span>}
        <span className="text-ink-faint">Salon {code}</span>
      </div>
    </header>
  );
}

/** Progression visuelle : 5 rounds, la case active se remplit question par question. */
function RoundBar({ round, pos, custom }: { round: number; pos: number; custom?: boolean }) {
  const fills = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const r = i + 1;
        if (custom) return 1;
        if (r < round) return 1;
        if (r > round) return 0;
        return pos / CHAOS_QUESTIONS_PER_ROUND;
      }),
    [round, pos, custom],
  );

  return (
    <div className="flex gap-token-2">
      {fills.map((fill, i) => (
        <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-background-sunken">
          <motion.div
            className="h-full rounded-full bg-quiz-gradient"
            initial={false}
            animate={{ width: `${fill * 100}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      ))}
    </div>
  );
}
