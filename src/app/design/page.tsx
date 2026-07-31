"use client";

import { useState } from "react";
import {
  AnswerButton,
  Button,
  Card,
  CardSubtitle,
  CardTitle,
  Choice,
  DifficultyTag,
  Footer,
  Input,
  Label,
  Navbar,
  ProgressBar,
  ScoreDisplay,
  Select,
  Streak,
  Tag,
  Timer,
  Trophy,
  type AnswerState,
} from "@/components/ui";

/* ==========================================================================
   PAGE SHOWCASE — /design
   Reference vivante du design system. Chaque bloc ci-dessous est copiable
   tel quel dans le reste du site.
   ======================================================================== */

const PALETTE = [
  {
    group: "Primaire (Vanilla)",
    swatches: [
      { name: "vanilla", hex: "#F1FEC8", cls: "bg-vanilla", token: "--c-vanilla" },
      { name: "vanilla-dark", hex: "#D4E89B", cls: "bg-vanilla-dark", token: "--c-vanilla-dark" },
    ],
  },
  {
    group: "Interactif (Cyan)",
    swatches: [
      { name: "primary", hex: "#00FFFF", cls: "bg-primary", token: "--c-cyan" },
      { name: "primary-dark", hex: "#00CCCC", cls: "bg-primary-dark", token: "--c-cyan-dark" },
    ],
  },
  {
    group: "Statuts Quiz",
    swatches: [
      { name: "success", hex: "#51CF66", cls: "bg-success", token: "--c-success" },
      { name: "danger", hex: "#FF6B6B", cls: "bg-danger", token: "--c-danger" },
      { name: "info", hex: "#6BA3FF", cls: "bg-info", token: "--c-info" },
      { name: "highlight", hex: "#FFD93D", cls: "bg-highlight", token: "--c-highlight" },
      { name: "flame", hex: "#FF8A00", cls: "bg-flame", token: "--c-flame" },
    ],
  },
  {
    group: "Neutres",
    swatches: [
      { name: "ink", hex: "#1A1A1A", cls: "bg-ink", token: "--c-ink" },
      { name: "ink-soft", hex: "#666666", cls: "bg-ink-soft", token: "--c-ink-soft" },
      { name: "card", hex: "#FFFFFF", cls: "bg-background-card", token: "--surface-card" },
      { name: "sunken", hex: "#F9FAFB", cls: "bg-background-sunken", token: "--surface-sunken" },
      { name: "line", hex: "#E0E0E0", cls: "bg-line", token: "--surface-border" },
    ],
  },
  {
    group: "Rangs",
    swatches: [
      { name: "bronze", hex: "#CD7F32", cls: "bg-rank-bronze", token: "--c-bronze" },
      { name: "silver", hex: "#94A3B8", cls: "bg-rank-silver", token: "--c-silver" },
      { name: "gold", hex: "#FFD93D", cls: "bg-rank-gold", token: "--c-gold" },
      { name: "diamond", hex: "#00FFFF", cls: "bg-rank-diamond", token: "--c-diamond" },
    ],
  },
];

const ANSWERS = [
  { letter: "A", label: "Le cyan #00FFFF" },
  { letter: "B", label: "Le vanilla #F1FEC8" },
  { letter: "C", label: "Le rouge #FF6B6B" },
  { letter: "D", label: "Le jaune #FFD93D" },
];
const CORRECT_INDEX = 0;

export default function DesignSystemPage() {
  const [dark, setDark] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const revealed = picked !== null;

  const answerState = (i: number): AnswerState => {
    if (!revealed) return "default";
    if (i === CORRECT_INDEX) return "correct";
    if (i === picked) return "incorrect";
    return "default";
  };

  return (
    <div className={dark ? "dark" : undefined}>
      <div className="min-h-screen bg-background text-ink">
        <Navbar
          activeHref="/design"
          items={[
            { href: "/", label: "Accueil" },
            { href: "/play", label: "Jouer" },
            { href: "/leaderboard", label: "Classement" },
            { href: "/badges", label: "Badges" },
            { href: "/design", label: "Design" },
          ]}
          right={
            <Button size="sm" variant="ghost" onClick={() => setDark((d) => !d)}>
              {dark ? "☀️ Clair" : "🌙 Sombre"}
            </Button>
          }
        />

        <main className="mx-auto max-w-6xl space-y-token-8 px-token-4 py-token-8">
          {/* ---------------------------------------------------- HERO */}
          <Section
            title="Hero"
            note="Fond vanilla doux, titre en gradient signature, CTA cyan."
          >
            <div className="overflow-hidden rounded-lg border border-vanilla-dark bg-vanilla p-token-8 text-center">
              <Tag tone="primary">Nouvelle saison</Tag>
              <h1 className="mt-token-4 font-display text-4xl font-bold tracking-tight text-ink-accent sm:text-5xl">
                Monte au classement.
              </h1>
              <p className="mx-auto mt-token-4 max-w-md text-base text-ink-accent/70">
                5 modes de jeu, 3 niveaux de difficulte, un seul classement.
              </p>
              <div className="mt-token-6 flex flex-wrap justify-center gap-token-4">
                <Button size="lg">Jouer maintenant</Button>
                <Button size="lg" variant="ghost">
                  Voir le classement
                </Button>
              </div>
            </div>
          </Section>

          {/* ------------------------------------------------- PALETTE */}
          <Section title="Palette" note="Aucune couleur hors de cette liste.">
            <div className="space-y-token-6">
              {PALETTE.map((group) => (
                <div key={group.group}>
                  <h3 className="mb-token-2 text-xs font-bold uppercase tracking-wider text-ink-soft">
                    {group.group}
                  </h3>
                  <div className="grid grid-cols-2 gap-token-4 sm:grid-cols-3 lg:grid-cols-5">
                    {group.swatches.map((s) => (
                      <div
                        key={s.name}
                        className="overflow-hidden rounded-md border border-line bg-background-card"
                      >
                        <div className={`h-16 w-full ${s.cls}`} />
                        <div className="p-token-2">
                          <p className="text-sm font-semibold text-ink">{s.name}</p>
                          <p className="font-mono text-xs text-ink-soft">{s.hex}</p>
                          <p className="font-mono text-[10px] text-ink-faint">{s.token}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ------------------------------------------------- BOUTONS */}
          <Section title="Boutons" note="5 variantes x 3 tailles x 5 etats.">
            <div className="space-y-token-6">
              <Row label="Variantes">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="success">Success</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="ghost">Ghost</Button>
              </Row>
              <Row label="Tailles">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </Row>
              <Row label="Etats">
                <Button>Default</Button>
                <Button className="bg-primary-dark shadow-none translate-y-[3px]">Active</Button>
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
              </Row>
              <p className="text-sm text-ink-soft">
                Hover et focus : survole / tabule dans la ligne ci-dessus.
              </p>
            </div>
          </Section>

          {/* --------------------------------------------------- CARTES */}
          <Section title="Cartes" note="3 variantes, meme padding (24px) et meme rayon.">
            <div className="grid gap-token-4 md:grid-cols-3">
              <Card variant="question">
                <Tag tone="vanilla">Question</Tag>
                <CardTitle className="mt-token-2">Carte question</CardTitle>
                <CardSubtitle>Surface blanche + bordure vanilla dark.</CardSubtitle>
              </Card>
              <Card variant="ranking" interactive>
                <div className="flex items-center gap-token-4">
                  <Trophy rank="gold" icon="1" />
                  <div>
                    <CardTitle>Carte classement</CardTitle>
                    <CardSubtitle>Fond alternatif, hover cyan.</CardSubtitle>
                  </div>
                </div>
              </Card>
              <Card variant="badge">
                <div className="flex items-center gap-token-4">
                  <Trophy rank="diamond" icon="🏅" />
                  <div>
                    <CardTitle>Carte badge</CardTitle>
                    <CardSubtitle>Ombre forte pour les trophees.</CardSubtitle>
                  </div>
                </div>
              </Card>
            </div>
          </Section>

          {/* ------------------------------------------ PAGE QUESTION */}
          <Section title="Page question" note="Le rendu de reference du quiz.">
            <Card variant="question" className="mx-auto max-w-2xl">
              <div className="flex flex-wrap items-center justify-between gap-token-4">
                <div className="flex items-center gap-token-2">
                  <Tag tone="primary">Mode Blitz</Tag>
                  <DifficultyTag level="moyen" />
                </div>
                <div className="flex items-center gap-token-4">
                  <Streak count={7} />
                  <Timer seconds={revealed ? 3 : 12} />
                </div>
              </div>

              <ProgressBar className="mt-token-6" value={4} max={10} label="Question 4 sur 10" />

              <h2 className="mt-token-6 font-display text-2xl font-bold leading-snug text-ink">
                Quelle couleur porte les actions principales du site ?
              </h2>

              <div className="mt-token-6 grid gap-token-4 sm:grid-cols-2">
                {ANSWERS.map((a, i) => (
                  <AnswerButton
                    key={a.letter}
                    letter={a.letter}
                    label={a.label}
                    state={answerState(i)}
                    disabled={revealed}
                    onClick={() => setPicked(i)}
                  />
                ))}
              </div>

              <div className="mt-token-6 flex items-center justify-between border-t border-line pt-token-4">
                <ScoreDisplay correct={3} total={4} />
                {revealed ? (
                  <div className="flex gap-token-2">
                    <Button variant="ghost" size="sm" onClick={() => setPicked(null)}>
                      Rejouer
                    </Button>
                    <Button variant="success">Question suivante</Button>
                  </div>
                ) : (
                  <Button disabled>Question suivante</Button>
                )}
              </div>
            </Card>
          </Section>

          {/* --------------------------------------------- CLASSEMENT */}
          <Section title="Classement" note="Fond alternatif, accent cyan sur le joueur courant.">
            <div className="space-y-token-2">
              {[
                { rank: "gold", pos: 1, name: "Nova", pts: 4820, me: false },
                { rank: "silver", pos: 2, name: "Kilian", pts: 4410, me: true },
                { rank: "bronze", pos: 3, name: "Ayla", pts: 4102, me: false },
              ].map((r) => (
                <Card
                  key={r.pos}
                  variant="ranking"
                  className={`flex items-center gap-token-4 py-token-4 ${
                    r.me ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  <Trophy rank={r.rank as "gold" | "silver" | "bronze"} icon={r.pos} />
                  <span className="flex-1 font-display text-base font-bold text-ink">
                    {r.name}
                    {r.me && <Tag tone="primary" className="ml-token-2">Toi</Tag>}
                  </span>
                  <Streak count={12 - r.pos} />
                  <span className="font-display text-base font-bold tabular-nums text-ink">
                    {r.pts}
                  </span>
                </Card>
              ))}
            </div>
          </Section>

          {/* ------------------------------------------------ FORMULAIRE */}
          <Section title="Formulaires" note="Focus cyan sur tous les controles.">
            <Card className="max-w-lg space-y-token-6">
              <div>
                <Label htmlFor="pseudo">Pseudo</Label>
                <Input id="pseudo" placeholder="Ton pseudo de joueur" defaultValue="" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue="pas-un-email" error="Adresse email invalide." />
              </div>
              <div>
                <Label htmlFor="diff" hint="(3 niveaux)">
                  Difficulte
                </Label>
                <Select id="diff" defaultValue="moyen">
                  <option value="facile">Facile</option>
                  <option value="moyen">Moyen</option>
                  <option value="difficile">Difficile</option>
                </Select>
              </div>
              <div className="flex flex-wrap gap-token-6">
                <Choice label="Sons actifs" defaultChecked />
                <Choice type="radio" name="mode" label="Solo" defaultChecked />
                <Choice type="radio" name="mode" label="Duel" />
                <Choice label="Desactive" disabled />
              </div>
              <Button fullWidth>Enregistrer</Button>
            </Card>
          </Section>

          {/* ------------------------------------------------ ETATS DIVERS */}
          <Section title="Badges, flammes, chargement">
            <div className="flex flex-wrap items-center gap-token-4">
              <DifficultyTag level="facile" />
              <DifficultyTag level="moyen" />
              <DifficultyTag level="difficile" />
              <Tag tone="info">Info</Tag>
              <Streak count={3} />
              <Streak count={30} />
              <Timer seconds={18} />
              <Timer seconds={3} />
              <ScoreDisplay correct={8} total={10} />
              <Trophy rank="bronze" />
              <Trophy rank="silver" />
              <Trophy rank="gold" />
              <Trophy rank="diamond" />
            </div>
            <div className="mt-token-6 max-w-sm space-y-token-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          </Section>
        </main>

        <Footer
          columns={[
            {
              title: "Jeu",
              links: [
                { href: "/play", label: "Modes" },
                { href: "/leaderboard", label: "Classement" },
                { href: "/badges", label: "Badges" },
              ],
            },
            {
              title: "Ressources",
              links: [
                { href: "/design", label: "Design system" },
                { href: "#", label: "Regles" },
              ],
            },
            {
              title: "Legal",
              links: [
                { href: "#", label: "Confidentialite" },
                { href: "#", label: "Conditions" },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- helpers */
function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-token-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
        {note && <p className="text-sm text-ink-soft">{note}</p>}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-token-2 text-xs font-bold uppercase tracking-wider text-ink-soft">{label}</p>
      <div className="flex flex-wrap items-center gap-token-4">{children}</div>
    </div>
  );
}
