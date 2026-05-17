"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, X, Loader2 } from "lucide-react";
import type { Player } from "@/types/game";

interface SolutionData {
  solutionWho: string;
  solutionHow: string;
  solutionWhy: string;
  solutionExplanation: string;
  solutionWhereName: string;
}

export function ResolutionView() {
  const { snapshot } = useGameStore();
  const [solution, setSolution] = useState<SolutionData | null>(null);
  const [ending, setEnding] = useState(false);

  const { room, me } = snapshot ?? {};

  useEffect(() => {
    if (!room?.id) return;
    fetch(`/api/rooms/${room.id}/resolution`)
      .then((r) => r.json())
      .then((d) => setSolution(d))
      .catch(() => {});
  }, [room?.id]);

  async function handleEnd() {
    setEnding(true);
    try {
      await fetch(`/api/rooms/${room!.id}/end`, { method: "POST" });
    } catch {
      //
    } finally {
      setEnding(false);
    }
  }

  if (!room) return null;

  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <main className="relative flex flex-col items-center justify-start min-h-dvh px-6 py-10 scanlines overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.04)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-8">
        {/* Header */}
        <div className="text-center flex flex-col gap-2">
          <p className="text-xs font-mono text-amber-400 uppercase tracking-widest">Caso Encerrado</p>
          <h1 className="text-2xl font-mono font-bold text-zinc-100">
            {room.case?.title ?? "Resolução"}
          </h1>
        </div>

        {/* Solution */}
        {solution ? (
          <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-sm p-5">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Solução</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Quem", value: solution.solutionWho },
                { label: "Onde", value: solution.solutionWhereName },
                { label: "Como", value: solution.solutionHow },
                { label: "Por quê", value: solution.solutionWhy },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-xs font-mono text-zinc-600 uppercase">{label}</span>
                  <span className="text-sm font-mono text-amber-400">{value}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-800 pt-3">
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2">Explicação</p>
              <p className="text-sm text-zinc-300 leading-relaxed font-serif">
                {solution.solutionExplanation}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 bg-zinc-900 border border-zinc-800 rounded-sm">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
          </div>
        )}

        {/* Scoreboard */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Pontuação Final</p>
          <div className="flex flex-col gap-2">
            {sortedPlayers.map((p: Player, idx: number) => {
              const isMe = p.id === me?.id;
              return (
                <div
                  key={p.id}
                  className={[
                    "flex items-center justify-between px-4 py-2.5 rounded-sm border",
                    idx === 0
                      ? "border-amber-400/40 bg-amber-400/5"
                      : "border-zinc-800 bg-zinc-900",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-zinc-600 w-5">{idx + 1}.</span>
                    <span className={`text-sm font-mono ${isMe ? "text-amber-400" : "text-zinc-200"}`}>
                      {p.nickname}
                    </span>
                    {idx === 0 && <Trophy className="w-3 h-3 text-yellow-400" />}
                  </div>
                  <Badge variant={p.score > 0 ? "success" : "zinc"}>
                    {p.score} pts
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        {me?.isHost && (
          <div className="flex gap-3">
            <Button variant="neon" onClick={handleEnd} disabled={ending} className="flex-1">
              {ending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Encerrando...
                </>
              ) : (
                "Encerrar Sala"
              )}
            </Button>
          </div>
        )}

        {!me?.isHost && (
          <p className="text-xs font-mono text-zinc-600 text-center">
            Aguardando o host encerrar a sala...
          </p>
        )}
      </div>
    </main>
  );
}
