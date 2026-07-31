"use client";

import { createClient } from "@/lib/supabase";
import type { ChaosMessage } from "@/types/chaos";

/**
 * Transport temps reel du salon QUIZ CHAOS.
 *
 * Canal ephemere : aucune table, aucune migration. On passe par le broadcast
 * Supabase Realtime (`chaos-<CODE>`), qui suffit ici puisque l'hote detient
 * l'etat et le rediffuse a chaque changement.
 *
 * Fallback `BroadcastChannel` quand Supabase n'est pas configure : la partie
 * reste jouable entre plusieurs onglets du meme navigateur (utile en dev).
 */

export interface ChaosTransport {
  send: (msg: ChaosMessage) => void;
  close: () => void;
  /** "supabase" = multi-appareils, "local" = onglets du meme navigateur. */
  kind: "supabase" | "local";
}

/** Caracteres sans ambiguite visuelle (pas de 0/O, 1/I). */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateRoomCode(length = 4): string {
  let out = "";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

export function generatePlayerId(): string {
  return crypto.randomUUID();
}

/** URL a encoder dans le QR code. */
export function joinUrl(code: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/play/chaos/join/${code}`;
}

export function connectChaosRoom(
  code: string,
  onMessage: (msg: ChaosMessage) => void,
): ChaosTransport {
  const supabase = createClient();
  let bcFallback: BroadcastChannel | null = null;

  if (supabase) {
    console.log("[Chaos] Attempting Supabase Realtime for", code);
    const channel = supabase.channel(`chaos-${code}`, {
      config: { broadcast: { self: false } },
    });

    let ready = false;
    const pending: ChaosMessage[] = [];

    const push = (msg: ChaosMessage) => {
      if (bcFallback) {
        bcFallback.postMessage(msg);
      } else {
        console.log("[Chaos] Sending via Supabase:", msg.t);
        void channel.send({ type: "broadcast", event: "chaos", payload: msg });
      }
    };

    channel
      .on("broadcast", { event: "chaos" }, ({ payload }: { payload: ChaosMessage }) => {
        console.log("[Chaos] Received from Supabase:", payload.t);
        onMessage(payload);
      })
      .subscribe((status: string) => {
        console.log("[Chaos] Supabase channel status:", status);
        if (status === "SUBSCRIBED") {
          ready = true;
          console.log("[Chaos] ✓ Supabase Realtime connected!");
          while (pending.length) push(pending.shift()!);
        } else if (status === "CHANNEL_ERROR" || status === "CLOSED") {
          console.log("[Chaos] Supabase failed, activating BroadcastChannel fallback...");
          void supabase.removeChannel(channel);
          bcFallback = new BroadcastChannel(`chaos-${code}`);
          console.log("[Chaos] ✓ BroadcastChannel active (local mode)");
          bcFallback.onmessage = (e) => onMessage(e.data as ChaosMessage);
          ready = true;
          while (pending.length) {
            const msg = pending.shift();
            if (msg) bcFallback.postMessage(msg);
          }
        }
      });

    return {
      kind: "supabase",
      send: (msg) => (ready ? push(msg) : pending.push(msg)),
      close: () => {
        if (bcFallback) bcFallback.close();
        void supabase.removeChannel(channel);
      },
    };
  }

  console.log("[Chaos] Supabase not configured, using BroadcastChannel (local only)");

  // ------------------------------------------------------------- fallback dev
  const bc = new BroadcastChannel(`chaos-${code}`);
  bc.onmessage = (e) => onMessage(e.data as ChaosMessage);
  return {
    kind: "local",
    send: (msg) => bc.postMessage(msg),
    close: () => bc.close(),
  };
}

/* --------------------------------------------------------------- PERSISTANCE

   L'identite du joueur survit a un refresh (ecran verrouille, onglet recharge)
   pour qu'il retrouve sa place au lieu de creer un doublon dans le salon.      */

const IDENTITY_KEY = (code: string) => `chaos:player:${code}`;

export interface StoredIdentity {
  id: string;
  name: string;
  avatar: string;
}

export function loadIdentity(code: string): StoredIdentity | null {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY(code));
    return raw ? (JSON.parse(raw) as StoredIdentity) : null;
  } catch {
    return null;
  }
}

export function saveIdentity(code: string, identity: StoredIdentity): void {
  try {
    localStorage.setItem(IDENTITY_KEY(code), JSON.stringify(identity));
  } catch {
    /* quota / mode prive : on joue quand meme, on perd juste la reconnexion */
  }
}
