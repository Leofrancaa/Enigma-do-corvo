"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { Player } from "@/types/game";

const DIFFICULTY_LABEL = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

export function CaseIntroView() {
  const { snapshot } = useGameStore();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!snapshot) return null;
  const { room, me } = snapshot;
  const isHost = me?.isHost ?? false;
  const caseData = room.case;

  async function handleBeginInvestigation() {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${room.id}/case-intro`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Erro ao iniciar investigação.");
    } catch {
      setError("Erro de conexão.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <main className="relative flex flex-col items-center justify-start min-h-dvh px-6 py-10 scanlines overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.03)_0%,transparent_60%)]" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-8">
        {/* Case header */}
        <div className="flex flex-col gap-3 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-2">
            <Badge variant="magenta">Novo Caso</Badge>
            {caseData?.difficulty && (
              <Badge variant="zinc">
                {DIFFICULTY_LABEL[caseData.difficulty] ?? caseData.difficulty}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-mono font-bold text-zinc-100">
            {caseData?.title ?? "Carregando caso..."}
          </h1>
          <div className="flex gap-4 text-xs font-mono text-zinc-500">
            <span>{caseData?.maxTurns} turnos</span>
            <span>|</span>
            <span>{room.players.length} detetives</span>
          </div>
        </div>

        {/* Narrative */}
        {caseData?.narrativeIntro && (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
              Briefing do Caso
            </p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-sm p-5">
              <p className="text-sm text-zinc-300 leading-relaxed font-serif whitespace-pre-wrap">
                {caseData.narrativeIntro}
              </p>
            </div>
          </div>
        )}

        {/* Objective */}
        <div className="flex flex-col gap-3 bg-zinc-900 border border-amber-400/20 rounded-sm p-4">
          <p className="text-xs font-mono text-amber-400 uppercase tracking-wider">Objetivo</p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {["Quem?", "Onde?", "Como?", "Por quê?"].map((q) => (
              <div key={q} className="flex items-center gap-2 text-zinc-500">
                <span className="text-zinc-700">›</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Players ready */}
        <div className="flex flex-wrap gap-2">
          {room.players.map((p: Player) => (
            <div key={p.id} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-sm px-2.5 py-1">
              <CheckCircle2 className="w-3 h-3 text-zinc-700" />
              <span className="text-xs font-mono text-zinc-500">{p.nickname}</span>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2 text-center">
            {error}
          </p>
        )}

        {isHost ? (
          <Button variant="neon" onClick={handleBeginInvestigation} disabled={starting} className="w-full">
            {starting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Iniciando investigação...
              </>
            ) : (
              "Iniciar Investigacao"
            )}
          </Button>
        ) : (
          <p className="text-xs font-mono text-zinc-600 text-center">
            Aguardando o host iniciar a investigação...
          </p>
        )}
      </div>
    </main>
  );
}
