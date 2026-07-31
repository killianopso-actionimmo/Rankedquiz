"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Beer, Check, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { ChaosAvatar } from "@/components/chaos/ChaosAvatar";
import { IdentityForm } from "@/components/chaos/IdentityForm";
import { ChaosLogo } from "@/components/logos/ChaosLogo";
import { CHAOS_DECK_META } from "@/data/chaosQuestions";
import { useChaosPlayer } from "@/hooks/useChaosPlayer";
import { CHAOS_MIN_PLAYERS, chaosAsker } from "@/types/chaos";

const MAX_CUSTOM_LENGTH = 50;

/**
 * ECRAN JOUEUR (mobile).
 *
 * Trois etats seulement, et c'est voulu : je m'inscris, j'attends, je pose.
 * Quand ce n'est pas mon tour l'ecran est quasi vide — le jeu se passe a table,
 * pas dans la main.
 */
export default function ChaosJoinPage() {
  const params = useParams<{ code: string }>();
  const code = (params?.code ?? "").toUpperCase();

  const { state, identity, registered, status, join, next, addQuestion } = useChaosPlayer(code);

  const name = identity?.name ?? "";
  const avatar = identity?.avatar ?? "av:0";

  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState("");
  const [customSent, setCustomSent] = useState(false);

  /* -------------------------------------------------------- connexion KO */
  if (status === "lost" && !state) {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-bold">Salon introuvable</h1>
        <p className="text-sm text-ink-soft">
          Le salon <span className="font-bold text-primary">{code}</span> ne repond pas.
          Verifie que l&apos;ecran central est toujours ouvert, puis rescanne le QR.
        </p>
        <Link href="/play/chaos">
          <Button variant="ghost">Ouvrir un salon</Button>
        </Link>
      </Shell>
    );
  }

  if (!state) {
    return (
      <Shell>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-ink-soft">Connexion au salon {code}…</p>
      </Shell>
    );
  }

  const meta = CHAOS_DECK_META[state.deck];

  /* ------------------------------------------------------------ INSCRIPTION */
  if (!registered) {
    return (
      <Shell wide>
        <header className="flex flex-col items-center gap-token-1 text-center">
          <ChaosLogo className="h-16 w-14" />
          <h1 className="font-display text-2xl font-bold">QUIZ CHAOS</h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {meta.label} · salon {state.code}
          </p>
        </header>

        {/* `key` : si une identite stockee arrive apres coup, le formulaire est
            remonte avec les bonnes valeurs initiales — pas d'effet de synchro. */}
        <IdentityForm
          key={identity?.id ?? "new"}
          initialName={name}
          initialAvatar={avatar}
          submitLabel="Rejoindre"
          onSubmit={join}
        />
      </Shell>
    );
  }

  /* ----------------------------------------------------------------- LOBBY */
  if (state.phase === "lobby") {
    const missing = CHAOS_MIN_PLAYERS - state.players.length;
    return (
      <Shell>
        <ChaosAvatar avatar={avatar} name={name} active className="w-32" />
        <h1 className="font-display text-2xl font-bold">Tu es dans la place, {name}.</h1>
        <p className="text-sm text-ink-soft">
          {missing > 0
            ? `Il manque encore ${missing} joueur${missing > 1 ? "s" : ""}.`
            : `${state.players.length} joueurs prets. Ca part des que l'ecran central lance.`}
        </p>
        <p className="text-xs text-ink-faint">
          Garde ton telephone a portee : tu ne t&apos;en sers que quand c&apos;est ton tour.
        </p>
      </Shell>
    );
  }

  /* ------------------------------------------------------------------- FIN */
  if (state.phase === "finished") {
    return (
      <Shell>
        <ChaosAvatar avatar={avatar} name={name} className="w-24" />
        <h1 className="font-display text-2xl font-bold">Partie terminee</h1>
        <p className="text-sm text-ink-soft">
          La carte souvenir est sur l&apos;ecran central. Range ton telephone.
        </p>
        <Link href="/play/chaos">
          <Button variant="ghost">Relancer un salon</Button>
        </Link>
      </Shell>
    );
  }

  /* --------------------------------------------------------------- EN JEU */
  const asker = chaosAsker(state);
  const question = state.queue[state.index];
  const myTurn = asker?.id === identity?.id;

  if (myTurn) {
    return (
      <Shell>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          C&apos;est ton tour
        </p>

        {/* Pas d'AnimatePresence : quand la question change via le canal temps
            reel (hors evenement React), la sortie ne se termine jamais et
            l'ecran se fige. Un motion.div keye rejoue juste l'entree. */}
        <motion.div
          key={question?.id}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-token-6"
        >
          <ChaosAvatar avatar={avatar} name={name} active className="w-48" />
          <h1 className="text-balance font-display text-3xl font-bold leading-tight">
            {question?.text}
          </h1>
          {state.drinks && state.sips !== null && (
            <p className="flex items-center gap-token-2 rounded-full bg-secondary px-token-4 py-token-1 text-sm font-bold text-ink-accent">
              <Beer className="h-4 w-4" />
              {state.sips} gorgee{state.sips > 1 ? "s" : ""}
            </p>
          )}
        </motion.div>

        <p className="text-xs text-ink-faint">
          Laisse-les debattre autant qu&apos;ils veulent. Tu passes quand tu veux.
        </p>

        <Button size="lg" fullWidth icon={<ArrowRight className="h-5 w-5" />} onClick={next}>
          SUIVANT
        </Button>
      </Shell>
    );
  }

  /* Pas mon tour : ecran volontairement vide. */
  return (
    <Shell>
      {asker && <ChaosAvatar avatar={asker.avatar} name={asker.name} className="w-24 opacity-90" />}
      <h1 className="font-display text-xl font-bold">
        {asker ? `${asker.name} pose la question` : "En attente…"}
      </h1>
      <p className="text-sm text-ink-soft">Regarde l&apos;ecran, reponds a voix haute.</p>

      <AnimatePresence mode="wait">
        {customOpen ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex w-full flex-col gap-token-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!customText.trim()) return;
              addQuestion(customText);
              setCustomText("");
              setCustomOpen(false);
              setCustomSent(true);
            }}
          >
            <Label htmlFor="chaos-custom">Ta question maison</Label>
            <Input
              id="chaos-custom"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="C'est qui…"
              maxLength={MAX_CUSTOM_LENGTH}
              autoFocus
            />
            <p className="text-right text-xs text-ink-faint">
              {customText.length}/{MAX_CUSTOM_LENGTH}
            </p>
            <div className="flex gap-token-2">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                icon={<X className="h-4 w-4" />}
                onClick={() => setCustomOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" fullWidth disabled={!customText.trim()}>
                Ajouter
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button
              variant="ghost"
              size="sm"
              icon={customSent ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              onClick={() => {
                setCustomSent(false);
                setCustomOpen(true);
              }}
            >
              {customSent ? "Question ajoutee a la file" : "Ajouter une question trash"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
}

/** Conteneur mobile commun : plein ecran, centre, rien d'autre. */
function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <main
      className={`mx-auto flex w-full flex-1 flex-col items-center justify-center gap-token-4 px-token-6 py-token-8 text-center ${
        wide ? "max-w-md" : "max-w-sm"
      }`}
    >
      {children}
    </main>
  );
}
