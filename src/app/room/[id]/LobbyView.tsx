"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Loader2, Users } from "lucide-react";
import type { Player } from "@/types/game";

export function LobbyView() {
  const { snapshot, onlineSessionIds } = useGameStore();
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!snapshot) return null;

  const { room, me } = snapshot;
  const players = room.players;
  const isHost = me?.isHost ?? false;
  const canStart = isHost && players.length >= 2;

  async function copyCode() {
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleStart() {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${room.id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Erro ao iniciar.");
    } catch {
      setError("Erro de conexão.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-dvh px-6 scanlines">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.04)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-md flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-1 text-center">
          <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Sala de Espera</p>
          <h1 className="text-2xl font-mono font-bold text-zinc-100">CIFRA URBANA</h1>
        </div>

        {/* Invite Code */}
        <div className="flex flex-col gap-2 items-center">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Código de Convite</p>
          <button
            onClick={copyCode}
            className="group flex items-center gap-3 bg-zinc-900 border border-zinc-700 hover:border-cyan-400/50 rounded-sm px-6 py-3 transition-all cursor-pointer"
          >
            <span className="text-3xl font-mono font-bold tracking-[0.4em] text-cyan-400 neon-text">
              {room.code}
            </span>
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400 shrink-0 transition-colors" />
            )}
          </button>
          <p className="text-xs font-mono text-zinc-600">Clique para copiar</p>
        </div>

        {/* Players list */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider">
              <Users className="w-3 h-3" />
              Jogadores
            </div>
            <Badge variant="zinc">
              {players.length}/6
            </Badge>
          </div>

          <div className="flex flex-col gap-2">
            {players.map((p: Player) => {
              const isOnline = onlineSessionIds.includes(p.sessionId);
              const isMe = p.id === me?.id;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-sm px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-zinc-600"}`}
                    />
                    <span className="text-sm font-mono text-zinc-200">
                      {p.nickname}
                      {isMe && (
                        <span className="text-zinc-600 ml-1">(você)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.isHost && (
                      <Badge variant="default" className="text-xs">Host</Badge>
                    )}
                  </div>
                </div>
              );
            })}

            {players.length < 2 && (
              <p className="text-xs font-mono text-zinc-600 text-center py-2">
                Aguardando mais jogadores... (mínimo 2)
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {isHost && (
          <div className="flex flex-col gap-2">
            {error && (
              <p className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2 text-center">
                {error}
              </p>
            )}
            <Button
              variant="neon"
              onClick={handleStart}
              disabled={!canStart || starting}
              className="w-full"
            >
              {starting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                `Iniciar Partida${!canStart ? " (mín. 2)" : ""}`
              )}
            </Button>
          </div>
        )}

        {!isHost && (
          <p className="text-xs font-mono text-zinc-600 text-center">
            Aguardando o host iniciar a partida...
          </p>
        )}
      </div>
    </main>
  );
}
