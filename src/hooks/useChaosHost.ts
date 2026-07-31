"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildChaosQueue, shuffle } from "@/data/chaosQuestions";
import {
  connectChaosRoom,
  generateRoomCode,
  generatePlayerId,
  type ChaosTransport,
} from "@/lib/chaosRoom";
import {
  CHAOS_MAX_PLAYERS,
  type ChaosDeck,
  type ChaosMessage,
  type ChaosState,
} from "@/types/chaos";

/**
 * Logique de l'ecran central (TV). C'est lui qui detient l'etat : les joueurs
 * n'envoient que des intentions ("je rejoins", "suivant", "ajoute ca"), l'hote
 * tranche et rediffuse l'etat complet. Un seul point de verite = pas de
 * divergence entre les 9 ecrans.
 */

/** Gorgees tirees au sort pour une question (sanctions activees). */
const rollSips = () => 1 + Math.floor(Math.random() * 5);

export function useChaosHost() {
  const [state, setState] = useState<ChaosState | null>(null);
  const stateRef = useRef<ChaosState | null>(null);
  const transportRef = useRef<ChaosTransport | null>(null);

  /** Applique + diffuse. Toute mutation d'etat passe par ici. */
  const commit = useCallback((next: ChaosState) => {
    const stamped = { ...next, updatedAt: Date.now() };
    stateRef.current = stamped;
    setState(stamped);
    transportRef.current?.send({ t: "state", state: stamped });
  }, []);

  const handleMessage = useCallback(
    (msg: ChaosMessage) => {
      const current = stateRef.current;
      if (!current) return;

      switch (msg.t) {
        case "hello":
          // Un ecran vient d'arriver (ou de se reconnecter) : on le resynchronise.
          transportRef.current?.send({ t: "state", state: current });
          break;

        case "join": {
          const known = current.players.some((p) => p.id === msg.player.id);
          if (!known && current.players.length >= CHAOS_MAX_PLAYERS) {
            transportRef.current?.send({ t: "state", state: current });
            return;
          }
          const players = known
            ? current.players.map((p) => (p.id === msg.player.id ? msg.player : p))
            : [...current.players, msg.player];
          // Rejoindre en cours de partie : on passe apres tout le monde.
          const order =
            current.phase === "playing" && !known
              ? [...current.order, msg.player.id]
              : current.order;
          commit({ ...current, players, order });
          break;
        }

        case "next": {
          if (current.phase !== "playing") return;
          const askerId = current.order[current.index % current.order.length];
          // Seul celui qui pose la question controle le rythme.
          if (msg.playerId !== askerId) return;
          const index = current.index + 1;
          if (index >= current.queue.length) {
            commit({ ...current, phase: "finished", index: current.queue.length - 1 });
            return;
          }
          commit({ ...current, index, sips: current.drinks ? rollSips() : null });
          break;
        }

        case "add": {
          const text = msg.text.trim().slice(0, 60);
          if (!text) return;
          commit({
            ...current,
            queue: [
              ...current.queue,
              {
                id: `custom-${Date.now()}`,
                text,
                round: 5,
                custom: true,
                author: msg.author,
              },
            ],
          });
          break;
        }

        case "state":
          // L'hote ignore les etats venus d'ailleurs : il est la source.
          break;
      }
    },
    [commit],
  );

  /** Cree le salon et ouvre le canal. Appele au choix du deck. */
  const createRoom = useCallback(
    (deck: ChaosDeck) => {
      const code = generateRoomCode();
      const hostId = generatePlayerId();
      transportRef.current?.close();
      transportRef.current = connectChaosRoom(code, handleMessage);

      commit({
        code,
        deck,
        phase: "lobby",
        players: [
          {
            id: hostId,
            name: "Vous",
            avatar: "av:0",
            joinedAt: Date.now(),
          },
        ],
        order: [],
        index: 0,
        queue: buildChaosQueue(deck),
        drinks: false,
        sips: null,
        updatedAt: Date.now(),
      });
    },
    [commit, handleMessage],
  );

  const setDrinks = useCallback(
    (drinks: boolean) => {
      const current = stateRef.current;
      if (!current) return;
      commit({
        ...current,
        drinks,
        sips: drinks && current.phase === "playing" ? rollSips() : null,
      });
    },
    [commit],
  );

  const start = useCallback(() => {
    const current = stateRef.current;
    if (!current || current.players.length < 2) return;
    commit({
      ...current,
      phase: "playing",
      order: shuffle(current.players.map((p) => p.id)),
      index: 0,
      sips: current.drinks ? rollSips() : null,
    });
  }, [commit]);

  /** Filet de securite depuis la TV (telephone HS, joueur parti aux toilettes). */
  const skip = useCallback(() => {
    const current = stateRef.current;
    if (!current || current.phase !== "playing") return;
    const index = current.index + 1;
    if (index >= current.queue.length) {
      commit({ ...current, phase: "finished", index: current.queue.length - 1 });
      return;
    }
    commit({ ...current, index, sips: current.drinks ? rollSips() : null });
  }, [commit]);

  const closeRoom = useCallback(() => {
    transportRef.current?.close();
    transportRef.current = null;
    stateRef.current = null;
    setState(null);
  }, []);

  useEffect(() => () => transportRef.current?.close(), []);

  return {
    state,
    createRoom,
    setDrinks,
    start,
    skip,
    closeRoom,
  };
}
