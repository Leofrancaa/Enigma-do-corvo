"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Clue, GameSnapshot, Player, Room } from "@/types/game";

interface GameState {
  snapshot: GameSnapshot | null;
  isLoading: boolean;
  onlineSessionIds: string[];

  setSnapshot: (s: GameSnapshot) => void;
  setLoading: (v: boolean) => void;
  setOnlineSessionIds: (ids: string[]) => void;
  updatePlayerConnected: (playerId: string, connected: boolean) => void;
  addDiscoveredClue: (clue: Clue) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>()(
  immer((set) => ({
    snapshot: null,
    isLoading: true,
    onlineSessionIds: [],

    setSnapshot: (s) =>
      set((state) => {
        state.snapshot = s as any;
        state.isLoading = false;
      }),

    setLoading: (v) =>
      set((state) => {
        state.isLoading = v;
      }),

    setOnlineSessionIds: (ids) =>
      set((state) => {
        state.onlineSessionIds = ids;
      }),

    updatePlayerConnected: (playerId, connected) =>
      set((state) => {
        if (!state.snapshot) return;
        const p = state.snapshot.room.players.find((pl: Player) => pl.id === playerId);
        if (p) p.isConnected = connected;
      }),

    addDiscoveredClue: (clue) =>
      set((state) => {
        if (!state.snapshot) return;
        const exists = state.snapshot.discoveredClues.some((c: Clue) => c.id === clue.id);
        if (!exists) state.snapshot.discoveredClues.push(clue as any);
      }),

    reset: () =>
      set((state) => {
        state.snapshot = null;
        state.isLoading = true;
        state.onlineSessionIds = [];
      }),
  }))
);
