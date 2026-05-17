"use client";

import { useGameStore } from "@/stores/useGameStore";
import { Badge } from "@/components/ui/badge";
import type { Player } from "@/types/game";

export function PlayersPanel() {
  const { snapshot, onlineSessionIds } = useGameStore();
  if (!snapshot) return null;

  const { room, me } = snapshot;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
          Detetives
        </span>
      </div>
      <div className="flex flex-col divide-y divide-zinc-800/50">
        {room.players.map((p: Player) => {
          const isOnline = onlineSessionIds.includes(p.sessionId);
          const isTurn = p.id === room.currentPlayerId;
          const isMe = p.id === me?.id;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-4 py-2.5 ${isTurn ? "bg-cyan-400/5 border-l-2 border-cyan-400" : ""}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOnline ? "bg-emerald-400" : "bg-zinc-600"}`} />
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-xs font-mono truncate ${isMe ? "text-cyan-400" : "text-zinc-300"}`}>
                    {p.nickname}
                  </span>
                  {isTurn && <Badge variant="default" className="text-xs py-0 shrink-0">Vez</Badge>}
                </div>
                {p.character && (
                  <span className="text-xs font-mono text-zinc-600 truncate">
                    {p.character.name}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
