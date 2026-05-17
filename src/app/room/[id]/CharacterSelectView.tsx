"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { Character, Player } from "@/types/game";

export function CharacterSelectView() {
  const { snapshot } = useGameStore();
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!snapshot) return null;

  const { room, me } = snapshot;
  const characters: Character[] = (room as any).case?.characters ?? [];
  const allCharacters: Character[] = (snapshot as any).characters ?? [];

  // Which character IDs are taken
  const takenByPlayerId = new Map<string, string>();
  room.players.forEach((p: Player) => {
    if (p.characterId) takenByPlayerId.set(p.characterId, p.id);
  });

  const myCharacterId = me?.characterId;

  async function selectCharacter(charId: string) {
    if (selecting) return;
    setSelecting(charId);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${room.id}/character`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: charId,
          clientActionId: crypto.randomUUID(),
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Erro ao selecionar personagem.");
    } catch {
      setError("Erro de conexão.");
    } finally {
      setSelecting(null);
    }
  }

  // Characters come from snapshot.characters (loaded separately)
  const characterList: Character[] = (snapshot as any).allCharacters ?? [];

  return (
    <main className="relative flex flex-col items-center justify-start min-h-dvh px-6 py-10 scanlines overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,42,109,0.04)_0%,transparent_60%)]" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-8">
        <div className="flex flex-col gap-1 text-center">
          <p className="text-xs font-mono text-pink-400 uppercase tracking-widest">
            Fase 1
          </p>
          <h1 className="text-2xl font-mono font-bold text-zinc-100">
            Escolha seu Detetive
          </h1>
          <p className="text-sm text-zinc-500 font-mono">
            Cada jogador deve escolher um personagem único.
          </p>
        </div>

        {error && (
          <p className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2 text-center">
            {error}
          </p>
        )}

        {/* Players status */}
        <div className="flex flex-wrap gap-2 justify-center">
          {room.players.map((p: Player) => (
            <div key={p.id} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-sm px-3 py-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${p.characterId ? "bg-emerald-400" : "bg-zinc-600"}`} />
              <span className="text-xs font-mono text-zinc-400">{p.nickname}</span>
              {p.characterId && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </div>
          ))}
        </div>

        {/* Character grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {characterList.map((char: Character) => {
            const takenByOther =
              takenByPlayerId.has(char.id) && takenByPlayerId.get(char.id) !== me?.id;
            const isSelected = myCharacterId === char.id;
            const isLoading = selecting === char.id;

            return (
              <button
                key={char.id}
                onClick={() => !takenByOther && selectCharacter(char.id)}
                disabled={takenByOther || !!selecting}
                className={[
                  "flex gap-4 p-4 rounded-sm border text-left transition-all",
                  takenByOther
                    ? "border-zinc-800 bg-zinc-900/50 opacity-40 cursor-not-allowed"
                    : isSelected
                      ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_12px_rgba(0,229,255,0.15)]"
                      : "border-zinc-700 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800 cursor-pointer",
                ].join(" ")}
              >
                {/* Avatar placeholder */}
                <div className="w-12 h-12 shrink-0 rounded-sm bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl">
                  {char.avatarUrl ? (
                    <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover rounded-sm" />
                  ) : (
                    <span className="text-zinc-500">?</span>
                  )}
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono font-bold ${isSelected ? "text-cyan-400" : "text-zinc-100"}`}>
                      {char.name}
                    </span>
                    {isLoading && <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />}
                    {isSelected && !isLoading && (
                      <Badge variant="default" className="text-xs py-0">Você</Badge>
                    )}
                    {takenByOther && (
                      <Badge variant="zinc" className="text-xs py-0">Ocupado</Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                    {char.loreShort}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {characterList.length === 0 && (
          <p className="text-center text-sm font-mono text-zinc-600">
            Carregando personagens...
          </p>
        )}
      </div>
    </main>
  );
}
