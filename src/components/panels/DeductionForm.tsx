"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { CaseQuestion } from "@/types/game";

interface Props {
  isFinal?: boolean;
  onSuccess?: (result: { correctCount: number; totalCount: number; score: number }) => void;
}

export function DeductionForm({ isFinal = false, onSuccess }: Props) {
  const { snapshot } = useGameStore();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!snapshot) return null;
  const { room } = snapshot;
  const questions: CaseQuestion[] = (room.case as any)?.questions ?? [];

  const allFilled = questions.length > 0 && questions.every((q) => (answers[q.id] ?? "").trim().length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allFilled) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${room.id}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          isFinal,
          clientActionId: crypto.randomUUID(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar dedução.");
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
      <div className="flex items-center justify-center h-32 text-xs font-mono text-emerald-400 text-center px-4">
        Dedução registrada. Aguardando resolução...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs font-mono text-zinc-600 px-4 text-center">
        As perguntas do caso ainda não foram carregadas.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
          {isFinal ? "Dedução Final" : "Palpite"}
        </span>
        {isFinal && <Badge variant="magenta" className="text-xs">Final</Badge>}
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-amber-400/80 leading-snug">
            {idx + 1}. {q.label}
          </label>
          <Input
            value={answers[q.id] ?? ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            placeholder="Sua resposta..."
            maxLength={300}
          />
        </div>
      ))}

      {error && (
        <p className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant={isFinal ? "neon" : "secondary"}
        disabled={loading || !allFilled}
        className="w-full"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</>
        ) : (
          isFinal ? "Confirmar Dedução Final" : "Enviar Palpite"
        )}
      </Button>

      {!isFinal && (
        <p className="text-xs font-mono text-zinc-600 text-center">
          Palpites errados consomem 1 erro.
        </p>
      )}
    </form>
  );
}
