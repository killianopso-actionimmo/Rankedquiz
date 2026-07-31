# Design System — Ranked Quiz

Source unique de verite : **`src/app/tokens.css`**.
Aucune couleur hardcodee ailleurs. Jamais.

Showcase vivant : **`/design`** (`src/app/design/page.tsx`).

---

## 1. Architecture

```
src/app/tokens.css        → toutes les CSS variables (couleurs, spacing, radius, shadows)
src/app/globals.css       → importe tokens.css, focus global, classes utilitaires
tailwind.config.ts        → mappe les variables vers les classes Tailwind
src/components/ui/*       → composants qui consomment UNIQUEMENT ces classes
src/app/design/page.tsx   → showcase / reference visuelle
```

Changer la palette = editer **un seul fichier** (`tokens.css`). Rien d'autre.

---

## 2. Palette

| Role | Hex | Variable | Classe Tailwind |
|---|---|---|---|
| Vanilla clair | `#F1FEC8` | `--c-vanilla` | `bg-vanilla` / `bg-secondary` |
| Vanilla dark | `#D4E89B` | `--c-vanilla-dark` | `bg-vanilla-dark` / `border-vanilla-dark` |
| Cyan (CTA) | `#00FFFF` | `--c-cyan` | `bg-primary` |
| Cyan dark (hover) | `#00CCCC` | `--c-cyan-dark` | `bg-primary-dark` |
| Correct | `#51CF66` | `--c-success` | `bg-success` / `text-success` |
| Incorrect | `#FF6B6B` | `--c-danger` | `bg-danger` / `text-danger` |
| Neutre / info | `#6BA3FF` | `--c-info` | `bg-info` |
| Highlight | `#FFD93D` | `--c-highlight` | `bg-highlight` |
| Flamme / streak | `#FF8A00` | `--c-flame` | `bg-flame` / `bg-flame-gradient` |
| Texte principal | `#1A1A1A` | `--c-ink` | `text-ink` |
| Texte secondaire | `#666666` | `--c-ink-soft` | `text-ink-soft` |
| Surface | `#FFFFFF` | `--surface-card` | `bg-background-card` |
| Fond de page | `#F9FAFB` | `--surface-page` | `bg-background` |
| Bordure | `#E0E0E0` | `--surface-border` | `border-line` |

Rangs : `bg-rank-bronze`, `bg-rank-silver`, `bg-rank-gold` (= highlight), `bg-rank-diamond` (= cyan).

### Format des variables

Chaque couleur existe en deux formes :

```css
--c-cyan: 0 255 255;              /* canaux RGB → Tailwind + opacite */
--color-primary: rgb(var(--c-cyan)); /* couleur prete pour du CSS custom */
```

Le format canaux permet les modificateurs d'opacite Tailwind :
`bg-primary/15`, `border-success/40`, `shadow-[0_0_0_3px_rgb(var(--c-cyan)/0.25)]`.

---

## 3. Regles de contraste (non negociables)

Cyan, vanilla, success, danger et highlight sont des couleurs **claires**.
Le texte pose dessus est **toujours `text-ink-accent` (#1A1A1A)**, jamais blanc.

> ⚠️ `text-ink` bascule en clair en dark mode. Sur un fond accent (qui, lui, ne
> bascule pas), il devient illisible. Regle : **fond accent → `text-ink-accent`**
> (token `--c-on-accent`, fige a #1A1A1A). `text-ink` reste correct sur les
> surfaces (`bg-background-card`, `bg-background-sunken`) et sur les fonds
> accent translucides du type `bg-success/18`.

| Fond | Texte | Ratio |
|---|---|---|
| `#00FFFF` cyan | `#1A1A1A` | 15.9:1 ✅ |
| `#F1FEC8` vanilla | `#1A1A1A` | 17.8:1 ✅ |
| `#51CF66` success | `#1A1A1A` | 10.6:1 ✅ |
| `#FF6B6B` danger | `#1A1A1A` | 8.1:1 ✅ |
| `#FFD93D` highlight | `#1A1A1A` | 13.6:1 ✅ |

En consequence : **le cyan n'est jamais utilise comme couleur de texte sur fond
blanc** (1.2:1). Pour du texte accentue, utiliser `text-primary-dark` sur fond
sombre, ou reserver le cyan aux fonds / bordures / ombres.

---

## 4. Echelles

**Spacing** (base 4px) — `p-token-1` (4) · `token-2` (8) · `token-4` (16) · `token-6` (24) · `token-8` (32).
Les utilitaires Tailwind standards (`p-4`, `gap-2`) restent disponibles ; les
classes `token-*` signalent explicitement une valeur du systeme.

**Graisses** — `font-regular` (400) · `font-semibold` (600) · `font-bold` (700).
Titres : `font-display font-bold`. Corps : `font-sans font-regular`.

**Rayons** — `rounded-sm` (8px, inputs) · `rounded-md` (14px, boutons) · `rounded-lg` (20px, cartes) · `rounded-full`.

**Ombres** — `shadow-subtle` · `shadow-medium` · `shadow-strong`.
Glows d'etat : `shadow-glow-cyan` · `shadow-glow-success` · `shadow-glow-danger`.

**Transitions** — `duration-[var(--duration-fast)]` (120ms, hover) ·
`duration-[var(--duration-base)]` (200ms, changements d'etat) · `ease-token`.

---

## 5. Etats — regle unique pour tout le site

| Etat | Traitement |
|---|---|
| Default | comme specifie par la variante |
| Hover | `hover:brightness-110` **ou** passage a la nuance `-dark` **ou** `shadow-medium` |
| Active | translation de 3px vers le bas + suppression de l'ombre 3D |
| Selected | couleur primaire + `font-bold` + glow |
| Disabled | `opacity-50` + fond `background-sunken` + texte `ink-soft` |
| Focus | outline cyan 2px, offset 2px — **defini globalement dans `globals.css`**, ne pas redefinir |
| Loading | spinner 16px `border-current` ou `.skeleton` (sweep 1.6s) |

---

## 6. Composants

```tsx
import { Button, Card, AnswerButton, ProgressBar, Timer, Streak } from "@/components/ui";
```

### Button
```tsx
<Button>Jouer</Button>                        // primary (cyan)
<Button variant="secondary">Options</Button>  // vanilla
<Button variant="success">Valider</Button>
<Button variant="danger">Supprimer</Button>
<Button variant="ghost">Retour</Button>
<Button size="sm|md|lg" loading disabled fullWidth icon={<Icon />} />
```

### Card
```tsx
<Card variant="question" />  // blanc + bordure vanilla dark
<Card variant="ranking" />   // fond alternatif
<Card variant="badge" />     // ombre forte
<Card variant="plain" interactive />  // hover cyan + elevation
```

### AnswerButton — le composant critique du quiz
```tsx
<AnswerButton letter="A" label="..." state="default|selected|correct|incorrect" />
```
Ne jamais styler une reponse a la main : passer par `state`.

### Quiz
```tsx
<ProgressBar value={4} max={10} label="Question 4 sur 10" />  // gradient vanilla → cyan
<Timer seconds={12} urgentBelow={5} />   // rouge sous le seuil
<ScoreDisplay correct={8} total={10} />  // chiffre correct en vert
<Streak count={7} />                     // gradient highlight → flame → danger
<DifficultyTag level="facile|moyen|difficile" />  // vert / jaune / rouge
<Trophy rank="bronze|silver|gold|diamond" />
<Tag tone="primary|vanilla|success|danger|info|highlight|neutral" />
```

### Formulaires
```tsx
<Label htmlFor="x" hint="(optionnel)">Pseudo</Label>
<Input id="x" error="Message d'erreur" />
<Select>...</Select>
<Choice label="Sons" />                    // checkbox
<Choice type="radio" name="mode" label="Solo" />
```

### Navigation
```tsx
<Navbar items={[{ href, label }]} activeHref="/play" right={<Button/>} />
<Footer columns={[{ title, links: [{ href, label }] }]} />
```

---

## 7. Dark mode

Deja cable. Ajouter la classe `dark` sur un ancetre (`<html>` de preference).

Seules les **surfaces** basculent (`--surface-page`, `--surface-card`,
`--surface-text`, `--surface-border`…). La palette d'accents — cyan, vanilla,
success, danger — reste **identique** dans les deux themes : c'est ce qui garantit
la coherence de marque. Un composant ecrit avec `bg-background-card text-ink
border-line` fonctionne dans les deux modes sans une seule variante `dark:`.

---

## 8. Checklist avant merge

- [ ] Zero hex dans le JSX/TSX (`grep -rn "#[0-9A-Fa-f]\{6\}" src/components src/app --include=*.tsx`)
- [ ] Texte sur fond accent opaque = `text-ink-accent`, jamais `text-white` ni `text-ink`
- [ ] Etat de reponse pilote par `state`, pas par des classes manuelles
- [ ] Focus non supprime (`outline-none` uniquement s'il est remplace par le ring cyan)
- [ ] Espacements pris dans l'echelle 4 / 8 / 16 / 24 / 32
