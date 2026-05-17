"use client";

import { useState, useMemo } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { MapCanvas } from "@/components/map/MapCanvas";
import { CluesPanel } from "@/components/panels/CluesPanel";
import { PlayersPanel } from "@/components/panels/PlayersPanel";
import { TicketsBar } from "@/components/panels/TicketsBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, List } from "lucide-react";
import type { LocationConnection, TransportType } from "@/types/game";

export function GameView() {
  const { snapshot } = useGameStore();
  const [moving, setMoving] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [showClues, setShowClues] = useState(false);
  const [forcing, setForcing] = useState(false);

  if (!snapshot) return null;

  const { room, me } = snapshot;
  const isMyTurn = me?.id === room.currentPlayerId;
  const currentPlayer = room.players.find((p) => p.id === room.currentPlayerId);
  const isHost = me?.isHost ?? false;

  const locations = room.case?.locations ?? [];
  const connections = room.case?.connections ?? [];

  // Compute reachable locations for the current player (me, on my turn)
  const reachable = useMemo(() => {
    if (!isMyTurn || !me?.currentLocationId) return [];

    const result: Array<{ locationId: string; transportType: TransportType }> = [];
    const myLoc = me.currentLocationId;

    for (const conn of connections as LocationConnection[]) {
      if (conn.fromId === myLoc || conn.toId === myLoc) {
        const targetId = conn.fromId === myLoc ? conn.toId : conn.fromId;
        const alreadyAdded = result.find((r) => r.locationId === targetId);
        if (!alreadyAdded) {
          const ticketKey = `tickets${conn.transportType.charAt(0).toUpperCase()}${conn.transportType.slice(1)}` as keyof typeof me;
          if ((me[ticketKey] as number) > 0) {
            result.push({ locationId: targetId, transportType: conn.transportType });
          }
        }
      }
    }
    return result;
  }, [isMyTurn, me, connections]);

  async function handleMove(toLocationId: string, transportType: TransportType) {
    if (moving) return;
    setMoving(true);
    setMoveError(null);
    try {
      const res = await fetch(`/api/rooms/${room.id}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toLocationId,
          transportType,
          clientActionId: crypto.randomUUID(),
        }),
      });
      const data = await res.json();
      if (!res.ok) setMoveError(data.error ?? "Erro ao mover.");
    } catch {
      setMoveError("Erro de conexão.");
    } finally {
      setMoving(false);
    }
  }

  async function forceDeduction() {
    setForcing(true);
    try {
      await fetch(`/api/rooms/${room.id}/deduction`, { method: "POST" });
    } catch {
      // will reflect via realtime
    } finally {
      setForcing(false);
    }
  }

  const turnsLeft = room.maxTurns - room.currentTurn;

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      {/* HUD top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <Badge variant="zinc" className="font-mono text-xs">
            Turno {room.currentTurn + 1}
          </Badge>
          <span className="text-xs font-mono text-zinc-500 hidden sm:block">
            {isMyTurn ? (
              <span className="text-cyan-400">Sua vez</span>
            ) : (
              <span>Vez de <span className="text-zinc-300">{currentPlayer?.nickname}</span></span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-zinc-600">Turnos:</span>
            <span className={turnsLeft <= 3 ? "text-red-400" : "text-zinc-300"}>{turnsLeft}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <AlertTriangle className="w-3 h-3 text-zinc-600" />
            <span className={room.errorsRemaining <= 1 ? "text-red-400" : "text-zinc-300"}>
              {room.errorsRemaining}
            </span>
          </div>

          {isHost && (
            <Button
              variant="outline"
              size="sm"
              onClick={forceDeduction}
              disabled={forcing}
              className="text-xs h-7"
            >
              {forcing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Deduzir"}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowClues((v) => !v)}
            className="h-7 w-7 text-zinc-400 hover:text-cyan-400"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Players sidebar (desktop) */}
        <div className="hidden lg:flex flex-col w-48 border-r border-zinc-800 shrink-0 overflow-y-auto bg-zinc-950">
          <PlayersPanel />
          {me && (
            <div className="px-4 py-3 border-t border-zinc-800">
              <TicketsBar player={me} />
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapCanvas
            locations={locations}
            connections={connections as LocationConnection[]}
            players={room.players}
            myPlayerId={me?.id ?? null}
            currentPlayerId={room.currentPlayerId}
            reachable={reachable}
            onLocationClick={handleMove}
          />

          {moving && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 bg-zinc-900 border border-cyan-400/30 rounded-sm px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-xs font-mono text-zinc-300">Movendo...</span>
              </div>
            </div>
          )}

          {moveError && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-900/80 border border-red-500/40 rounded-sm px-4 py-2">
              <span className="text-xs font-mono text-red-300">{moveError}</span>
            </div>
          )}
        </div>

        {/* Clues panel (desktop) */}
        <div className="hidden lg:flex flex-col w-64 border-l border-zinc-800 shrink-0 overflow-hidden bg-zinc-950">
          <CluesPanel />
        </div>
      </div>

      {/* Mobile: bottom sheet for clues */}
      {showClues && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-zinc-900 border-t border-zinc-800 rounded-t-lg max-h-[60vh] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Pistas</span>
            <button onClick={() => setShowClues(false)} className="text-zinc-600 hover:text-zinc-300 text-xs font-mono">
              Fechar
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            <CluesPanel />
          </div>
        </div>
      )}

      {/* Mobile bottom bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-zinc-900 border-t border-zinc-800 shrink-0">
        <PlayersPanel />
        {me && <TicketsBar player={me} />}
      </div>
    </div>
  );
}
