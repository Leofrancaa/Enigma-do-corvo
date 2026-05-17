"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { Location } from "@/types/game";

interface Props {
  isFinal?: boolean;
  onSuccess?: (result: { isCorrect: boolean; correctCount: number; score: number }) => void;
}

export function DeductionForm({ isFinal = false, onSuccess }: Props) {
  const { snapshot } = useGameStore();
  const [who, setWho] = useState("");
  const [whereId, setWhereId] = useState("");
  const [how, setHow] = useState("");
  const [why, setWhy] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!snapshot) return null;
  const { room } = snapshot;
  const locations: Location[] = room.case?.locations ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!who.trim() || !whereId || !how.trim() || !why.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${room.id}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          who: who.trim(),
          whereId,
          how: how.trim(),
          why: why.trim(),
          isFinal,
          clientActionId: crypto.randomUUID(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar palpite.");
        return;
      }
      setSubmitted(true);
      onSuccess?.(data);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center h-32 text-xs font-mono text-emerald-400">
        Palpite registrado. Aguardando resolução...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
          {isFinal ? "Palpite Final" : "Dedução Parcial"}
        </span>
        {isFinal && <Badge variant="magenta" className="text-xs">Final</Badge>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          Quem?
        </label>
        <Input
          value={who}
          onChange={(e) => setWho(e.target.value)}
          placeholder="Nome do suspeito..."
          maxLength={200}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          Onde?
        </label>
        <select
          value={whereId}
          onChange={(e) => setWhereId(e.target.value)}
          className="flex h-10 w-full rounded-sm border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-mono text-zinc-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:border-cyan-400"
        >
          <option value="">Selecione o local...</option>
          {locations.map((loc: Location) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          Como?
        </label>
        <Input
          value={how}
          onChange={(e) => setHow(e.target.value)}
          placeholder="Método ou arma..."
          maxLength={200}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          Por quê?
        </label>
        <Input
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          placeholder="Motivo do crime..."
          maxLength={200}
        />
      </div>

      {error && (
        <p className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant={isFinal ? "neon" : "secondary"}
        disabled={loading || !who.trim() || !whereId || !how.trim() || !why.trim()}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando...
          </>
        ) : (
          isFinal ? "Confirmar Dedução Final" : "Enviar Palpite"
        )}
      </Button>

      {!isFinal && (
        <p className="text-xs font-mono text-zinc-600 text-center">
          Palpites parciais errados consomem 1 erro.
        </p>
      )}
    </form>
  );
}
