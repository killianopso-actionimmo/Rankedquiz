import type { Config } from "tailwindcss";

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
        background: {
          DEFAULT: "#F4F5FA",
          deep: "#171B2E",
          card: "#FFFFFF",
        },
        ink: {
          DEFAULT: "#1B1F3B",
          soft: "#6B7280",
          faint: "#9CA3AF",
        },
        primary: {
          DEFAULT: "#0047AB",
          light: "#2E6BE6",
          dark: "#003380",
        },
        secondary: {
          DEFAULT: "#FF1493",
          light: "#FF57B0",
          dark: "#C10E70",
        },
        highlight: {
          DEFAULT: "#FFBC00",
          light: "#FFD666",
          dark: "#CC9600",
        },
        success: {
          DEFAULT: "#22C55E",
          light: "#4ADE80",
          dark: "#16A34A",
          bg: "#DCFCE7",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#F87171",
          dark: "#DC2626",
          bg: "#FEE2E2",
        },
        rank: {
          bronze: "#CD7F32",
          silver: "#94A3B8",
          gold: "#FFBC00",
          diamond: "#00B8D9",
        },
      },
      fontFamily: {
        display: ["var(--font-outfit)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "duel-gradient": "linear-gradient(135deg, #0047AB 0%, #1A227E 50%, #FF1493 100%)",
        "gold-gradient": "linear-gradient(135deg, #FFBC00 0%, #FF8A00 100%)",
        "daily-gradient": "linear-gradient(135deg, #FFBC00 0%, #FF8A00 45%, #FF1493 100%)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(27,31,59,0.04), 0 2px 10px rgba(27,31,59,0.06)",
        "card-hover": "0 2px 4px rgba(27,31,59,0.05), 0 10px 24px rgba(27,31,59,0.10)",
        "btn-primary": "0 4px 0 0 #003380",
        "btn-secondary": "0 4px 0 0 #C10E70",
        "btn-highlight": "0 4px 0 0 #CC9600",
        "btn-success": "0 4px 0 0 #16A34A",
        "btn-ghost": "0 4px 0 0 #D8DAE8",
        "neon-blue": "0 0 8px rgba(0,71,171,0.6), 0 0 24px rgba(0,71,171,0.35)",
        "neon-magenta": "0 0 8px rgba(255,20,147,0.6), 0 0 24px rgba(255,20,147,0.35)",
        "neon-gold": "0 0 8px rgba(255,188,0,0.6), 0 0 24px rgba(255,188,0,0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
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
      },
    },
  },
  plugins: [],
};

export default config;
