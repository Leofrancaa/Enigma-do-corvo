"use client";

import { useEffect, useCallback } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { useRoomRealtime } from "@/lib/realtime/useRoomRealtime";
import type { GameSnapshot } from "@/types/game";
import { LobbyView } from "./LobbyView";
import { CharacterSelectView } from "./CharacterSelectView";
import { CaseIntroView } from "./CaseIntroView";
import { GameView } from "./GameView";
import { DeductionView } from "./DeductionView";
import { ResolutionView } from "./ResolutionView";

interface Props {
  initialSnapshot: GameSnapshot;
  sessionId: string;
  roomId: string;
}

export function RoomShell({ initialSnapshot, sessionId, roomId }: Props) {
  const { snapshot, setSnapshot, setLoading, setOnlineSessionIds } = useGameStore();

  useEffect(() => {
    setSnapshot(initialSnapshot);
  }, [initialSnapshot, setSnapshot]);

  const fetchSnapshot = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/snapshot`);
      if (res.ok) {
        const data: GameSnapshot = await res.json();
        setSnapshot(data);
      }
    } catch {
      // ignore transient errors, will retry on next realtime event
    }
  }, [roomId, setSnapshot]);

  useRoomRealtime({
    roomId,
    sessionId,
    playerId: snapshot?.me?.id ?? initialSnapshot.me?.id ?? null,
    onSnapshotNeeded: fetchSnapshot,
    onPresenceChange: setOnlineSessionIds,
  });

  const status = snapshot?.room.status ?? initialSnapshot.room.status;

  switch (status) {
    case "LOBBY":
      return <LobbyView />;
    case "CHARACTER_SELECT":
      return <CharacterSelectView />;
    case "CASE_INTRO":
      return <CaseIntroView />;
    case "INVESTIGATION":
      return <GameView />;
    case "DEDUCTION":
      return <DeductionView />;
    case "RESOLUTION":
    case "ENDED":
      return <ResolutionView />;
    default:
      return (
        <div className="flex items-center justify-center min-h-dvh text-zinc-500 font-mono text-sm">
          Carregando...
        </div>
      );
  }
}
