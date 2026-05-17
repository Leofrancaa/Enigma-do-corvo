"use client";

import type { Player } from "@/types/game";
import { Badge } from "@/components/ui/badge";

interface Props {
  player: Player;
}

export function TicketsBar({ player }: Props) {
  return (
    <div className="flex items-center gap-3 text-xs font-mono">
      <span className="text-zinc-600">Fichas:</span>
      <div className="flex gap-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
          <span className="text-zinc-300">{player.ticketsDrone}</span>
          <span className="text-zinc-600">drone</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />
          <span className="text-zinc-300">{player.ticketsHyperloop}</span>
          <span className="text-zinc-600">hyperloop</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
          <span className="text-zinc-300">{player.ticketsMagrail}</span>
          <span className="text-zinc-600">magrail</span>
        </span>
      </div>
    </div>
  );
}
