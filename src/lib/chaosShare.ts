"use client";

import { CHAOS_DECK_META } from "@/data/chaosQuestions";
import type { ChaosState } from "@/types/chaos";

/**
 * Carte souvenir de fin de partie, generee au canvas puis partagee via l'API
 * Web Share (mobile) ou telechargee (desktop).
 *
 * Les couleurs sont ecrites en dur ici : un canvas ne resout pas les variables
 * CSS. Elles sont la copie exacte des tokens vanilla / cyan / ink.
 */

const VANILLA = "#F1FEC8";
const CYAN = "#00FFFF";
const INK = "#0F0F0F";
const INK_SOFT = "#9A9A9A";
const SURFACE = "#1A1A1A";

/** Meme sequence que les avatars generiques, en hex. */
const AVATAR_COLORS = [
  "#00FFFF", "#F1FEC8", "#FFD93D", "#51CF66", "#FF6B6B",
  "#6BA3FF", "#FF8A00", "#D4E89B", "#00CCCC", "#94A3B8",
  "#CD7F32", "#00FFFF", "#F1FEC8", "#FFD93D", "#51CF66",
];

const W = 1080;
const H = 1350;

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function buildRecapCard(state: ChaosState): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Fond + halo cyan diffus en haut
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, H);
  const halo = ctx.createRadialGradient(W / 2, 120, 0, W / 2, 120, 700);
  halo.addColorStop(0, "rgba(0,255,255,0.18)");
  halo.addColorStop(1, "rgba(0,255,255,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, 800);

  // Titre
  const title = ctx.createLinearGradient(0, 0, W, 0);
  title.addColorStop(0, VANILLA);
  title.addColorStop(1, CYAN);
  ctx.fillStyle = title;
  ctx.textAlign = "center";
  ctx.font = "800 104px Outfit, Inter, system-ui, sans-serif";
  ctx.fillText("QUIZ CHAOS", W / 2, 180);

  ctx.fillStyle = INK_SOFT;
  ctx.font = "600 34px Inter, system-ui, sans-serif";
  ctx.fillText(
    `MODE ${CHAOS_DECK_META[state.deck].label}  ·  SALON ${state.code}`,
    W / 2,
    236,
  );

  // Compteur de questions posees
  const asked = Math.min(state.index + 1, state.queue.length);
  ctx.fillStyle = CYAN;
  ctx.font = "800 220px Outfit, Inter, system-ui, sans-serif";
  ctx.fillText(String(asked), W / 2, 470);
  ctx.fillStyle = VANILLA;
  ctx.font = "700 40px Inter, system-ui, sans-serif";
  ctx.fillText("QUESTIONS POSEES", W / 2, 528);

  // Grille des joueurs
  const players = state.players.slice(0, 8);
  const cols = players.length <= 4 ? players.length || 1 : 4;
  const cell = 190;
  const gridW = cols * cell;
  const startX = (W - gridW) / 2 + cell / 2;
  const startY = 700;

  const photos = await Promise.all(
    players.map((p) => (p.avatar.startsWith("img:") ? loadImage(p.avatar.slice(4)) : null)),
  );

  players.forEach((player, i) => {
    const cx = startX + (i % cols) * cell;
    const cy = startY + Math.floor(i / cols) * (cell + 40);
    const r = 66;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const photo = photos[i];
    if (photo) {
      ctx.drawImage(photo, cx - r, cy - r, r * 2, r * 2);
    } else {
      const idx = Number(player.avatar.slice(3)) || 0;
      ctx.fillStyle = AVATAR_COLORS[idx % AVATAR_COLORS.length];
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = INK;
      ctx.font = "800 64px Outfit, Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(player.name.slice(0, 1).toUpperCase(), cx, cy + 4);
      ctx.textBaseline = "alphabetic";
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#E8E8E8";
    ctx.font = "700 30px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(player.name.slice(0, 12), cx, cy + r + 46);
  });

  // Pied de carte
  const customs = state.queue.filter((q) => q.custom).length;
  const footerY = H - 150;
  ctx.fillStyle = SURFACE;
  roundedRect(ctx, 80, footerY - 60, W - 160, 130, 28);
  ctx.fill();

  ctx.fillStyle = VANILLA;
  ctx.font = "700 34px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    customs > 0
      ? `${players.length} joueurs · ${customs} question${customs > 1 ? "s" : ""} maison`
      : `${players.length} joueurs autour de la table`,
    W / 2,
    footerY - 5,
  );
  ctx.fillStyle = INK_SOFT;
  ctx.font = "600 28px Inter, system-ui, sans-serif";
  ctx.fillText("ranked-quiz · mode QUIZ CHAOS", W / 2, footerY + 40);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

/** Partage natif si dispo, sinon telechargement. Renvoie false si rien n'a pu etre fait. */
export async function shareRecapCard(state: ChaosState): Promise<boolean> {
  const blob = await buildRecapCard(state);
  if (!blob) return false;

  const file = new File([blob], `quiz-chaos-${state.code}.png`, { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "QUIZ CHAOS" });
      return true;
    } catch {
      // Partage annule par l'utilisateur : on retombe sur le telechargement.
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
