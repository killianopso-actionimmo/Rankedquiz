"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  connectChaosRoom,
  generatePlayerId,
  loadIdentity,
  saveIdentity,
  type ChaosTransport,
  type StoredIdentity,
} from "@/lib/chaosRoom";
import type { ChaosMessage, ChaosState } from "@/types/chaos";

/**
 * Cote joueur : on ecoute l'etat diffuse par l'hote et on lui envoie des
 * intentions. Aucun etat de jeu n'est calcule ici — le telephone ne fait
 * qu'afficher et transmettre.
 */

/** Le `hello` peut arriver avant que l'hote soit abonne : on relance. */
const HELLO_RETRY_MS = 1200;
const HELLO_MAX_TRIES = 12;

export type ChaosPlayerStatus = "connecting" | "connected" | "lost";

export function useChaosPlayer(code: string) {
  const [state, setState] = useState<ChaosState | null>(null);
  const [identity, setIdentity] = useState<StoredIdentity | null>(null);
  const [status, setStatus] = useState<ChaosPlayerStatus>("connecting");

  const transportRef = useRef<ChaosTransport | null>(null);
  const identityRef = useRef<StoredIdentity | null>(null);

  useEffect(() => {
    if (!code) return;

    // Lecture d'un store externe (localStorage) au montage : c'est exactement
    // le cas d'usage d'un effet, meme si la regle generique s'en mefie.
    const stored = loadIdentity(code);
    identityRef.current = stored;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restauration one-shot de l'identite
    setIdentity(stored);

    let connected = false;
    const transport = connectChaosRoom(code, (msg: ChaosMessage) => {
      if (msg.t !== "state") return;
      connected = true;
      setState(msg.state);
      setStatus("connected");
    });
    transportRef.current = transport;

    let tries = 0;
    const ping = () => {
      transport.send({ t: "hello" });
      // Le joueur deja connu se re-annonce : l'hote le retrouve sans doublon.
      if (identityRef.current) {
        transport.send({
          t: "join",
          player: { ...identityRef.current, joinedAt: Date.now() },
        });
      }
    };
    ping();

    const timer = setInterval(() => {
      if (connected) {
        clearInterval(timer);
        return;
      }
      tries += 1;
      if (tries > HELLO_MAX_TRIES) {
        clearInterval(timer);
        setStatus("lost");
        return;
      }
      ping();
    }, HELLO_RETRY_MS);

    return () => {
      clearInterval(timer);
      transport.close();
      transportRef.current = null;
    };
  }, [code]);

  const join = useCallback(
    (name: string, avatar: string) => {
      const next: StoredIdentity = {
        id: identityRef.current?.id ?? generatePlayerId(),
        name: name.trim().slice(0, 14),
        avatar,
      };
      identityRef.current = next;
      setIdentity(next);
      saveIdentity(code, next);
      transportRef.current?.send({ t: "join", player: { ...next, joinedAt: Date.now() } });
    },
    [code],
  );

  const next = useCallback(() => {
    const me = identityRef.current;
    if (!me) return;
    transportRef.current?.send({ t: "next", playerId: me.id });
  }, []);

  const addQuestion = useCallback((text: string) => {
    const me = identityRef.current;
    if (!me) return;
    transportRef.current?.send({ t: "add", text, author: me.name });
  }, []);

  /** Le joueur est-il bien enregistre cote hote ? */
  const registered = Boolean(
    identity && state?.players.some((p) => p.id === identity.id),
  );

  return { state, identity, registered, status, join, next, addQuestion };
}
