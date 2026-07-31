import type { Config } from "tailwindcss";

/**
 * Toutes les valeurs pointent sur les CSS variables definies dans
 * `src/app/tokens.css`. Zero couleur hardcodee ici : pour changer la palette,
 * on ne touche QUE tokens.css.
 *
 * Le format `rgb(var(--c-x) / <alpha-value>)` conserve les modificateurs
 * d'opacite Tailwind (ex: `bg-primary/25`, `border-ink/10`).
 */
const c = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ---------- Surfaces (basculent en dark mode) ---------- */
        background: {
          DEFAULT: c("--surface-page"),
          card: c("--surface-card"),
          sunken: c("--surface-sunken"),
          deep: c("--c-dark-bg"),
          alt: c("--c-alt"),
        },
        surface: {
          DEFAULT: c("--surface-card"),
          border: c("--surface-border"),
        },

        /* ---------- Texte ---------- */
        ink: {
          DEFAULT: c("--surface-text"),
          soft: c("--surface-text-soft"),
          faint: c("--c-ink-faint"),
          invert: c("--c-dark-text"),
          /** Texte sur fond accent — ne bascule jamais en dark mode. */
          accent: c("--c-on-accent"),
        },

        /* ---------- Interactif : cyan ---------- */
        primary: {
          DEFAULT: c("--c-cyan"),
          light: c("--c-cyan"),
          dark: c("--c-cyan-dark"),
        },

        /* ---------- Alternatif : vanilla ---------- */
        secondary: {
          DEFAULT: c("--c-vanilla"),
          light: c("--c-vanilla"),
          dark: c("--c-vanilla-dark"),
        },
        vanilla: {
          DEFAULT: c("--c-vanilla"),
          dark: c("--c-vanilla-dark"),
        },

        /* ---------- Statuts ---------- */
        success: {
          DEFAULT: c("--c-success"),
          light: c("--c-success"),
          dark: c("--c-success"),
          bg: "rgb(var(--c-success) / 0.14)",
        },
        danger: {
          DEFAULT: c("--c-danger"),
          light: c("--c-danger"),
          dark: c("--c-danger"),
          bg: "rgb(var(--c-danger) / 0.14)",
        },
        info: {
          DEFAULT: c("--c-info"),
          bg: "rgb(var(--c-info) / 0.14)",
        },
        highlight: {
          DEFAULT: c("--c-highlight"),
          light: c("--c-highlight"),
          dark: c("--c-highlight"),
        },
        flame: {
          DEFAULT: c("--c-flame"),
        },

        /* ---------- Bordure ---------- */
        line: c("--surface-border"),

        /* ---------- Rangs / badges ---------- */
        rank: {
          bronze: c("--c-bronze"),
          silver: c("--c-silver"),
          gold: c("--c-gold"),
          diamond: c("--c-diamond"),
        },
      },

      fontFamily: {
        display: ["var(--font-outfit)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },

      fontWeight: {
        regular: "var(--font-regular)",
        semibold: "var(--font-semibold)",
        bold: "var(--font-bold)",
      },

      spacing: {
        "token-1": "var(--space-1)",
        "token-2": "var(--space-2)",
        "token-4": "var(--space-4)",
        "token-6": "var(--space-6)",
        "token-8": "var(--space-8)",
      },

      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl2: "var(--radius-lg)",
      },

      boxShadow: {
        subtle: "var(--shadow-subtle)",
        medium: "var(--shadow-medium)",
        strong: "var(--shadow-strong)",
        card: "var(--shadow-subtle)",
        "card-hover": "var(--shadow-medium)",
        "glow-cyan": "var(--glow-cyan)",
        "glow-success": "var(--glow-success)",
        "glow-danger": "var(--glow-danger)",
        /* Ombres "3D" sous les boutons */
        "btn-primary": "0 4px 0 0 rgb(var(--c-cyan-dark))",
        "btn-secondary": "0 4px 0 0 rgb(var(--c-vanilla-dark))",
        "btn-success": "0 4px 0 0 rgb(var(--c-success) / 0.55)",
        "btn-danger": "0 4px 0 0 rgb(var(--c-danger) / 0.55)",
        "btn-highlight": "0 4px 0 0 rgb(var(--c-highlight) / 0.55)",
        "btn-ghost": "0 4px 0 0 rgb(var(--surface-border))",
        /* Legacy — conserves pour ne rien casser */
        "neon-blue": "var(--glow-cyan)",
        "neon-magenta": "0 0 0 3px rgb(var(--c-vanilla-dark) / 0.35)",
        "neon-gold": "0 0 0 3px rgb(var(--c-highlight) / 0.35)",
      },

      backgroundImage: {
        /* Gradient signature : vanilla -> cyan */
        "quiz-gradient": "linear-gradient(90deg, rgb(var(--c-vanilla)) 0%, rgb(var(--c-cyan)) 100%)",
        "duel-gradient":
          "linear-gradient(135deg, rgb(var(--c-cyan)) 0%, rgb(var(--c-vanilla)) 60%, rgb(var(--c-highlight)) 100%)",
        "gold-gradient":
          "linear-gradient(135deg, rgb(var(--c-highlight)) 0%, rgb(var(--c-flame)) 100%)",
        "daily-gradient":
          "linear-gradient(135deg, rgb(var(--c-vanilla)) 0%, rgb(var(--c-highlight)) 50%, rgb(var(--c-flame)) 100%)",
        "flame-gradient":
          "linear-gradient(135deg, rgb(var(--c-highlight)) 0%, rgb(var(--c-flame)) 55%, rgb(var(--c-danger)) 100%)",
      },

      transitionTimingFunction: {
        token: "var(--ease-out)",
      },

      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.85", filter: "brightness(1.3)" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-6px)" },
          "75%": { transform: "translateX(6px)" },
        },
        "progress-stripe": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "40px 0" },
        },
        "tap-ping": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        breath: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        /* Loading discret : pas d'overkill */
        "skeleton-sweep": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },

      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float-y": "float-y 3s ease-in-out infinite",
        shake: "shake 0.4s ease-in-out",
        "progress-stripe": "progress-stripe 1s linear infinite",
        "tap-ping": "tap-ping 1.6s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s ease both",
        breath: "breath 15s ease-in-out infinite",
        pop: "pop 0.4s cubic-bezier(.22,1.6,.36,1) both",
        "skeleton-sweep": "skeleton-sweep 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
