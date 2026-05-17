"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Lock, Star, Siren } from "lucide-react";

interface CaseOption {
  id: string;
  slug: string;
  title: string;
  difficulty: "facil" | "medio" | "dificil";
  maxTurns: number;
  recommendedPlayersMin: number;
  recommendedPlayersMax: number;
}

const DIFFICULTY_ORDER: Record<string, number> = { facil: 0, medio: 1, dificil: 2 };

const DIFFICULTY_LABEL: Record<string, string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  facil: "text-emerald-400 border-emerald-500/40 bg-emerald-500/5",
  medio: "text-amber-400 border-amber-500/40 bg-amber-500/5",
  dificil: "text-red-400 border-red-500/40 bg-red-500/5",
};

const DIFFICULTY_BADGE: Record<string, string> = {
  facil: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  medio: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  dificil: "bg-red-500/20 text-red-400 border border-red-500/30",
};

export default function HostPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [cases, setCases] = useState<CaseOption[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/cases")
      .then((r) => r.json())
      .then((data) => {
        const sorted = (data.cases as CaseOption[]).sort(
          (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]
        );
        setCases(sorted);
        if (sorted.length > 0) setSelectedCaseId(sorted[0].id);
      })
      .catch(() => setError("Não foi possível carregar os casos."))
      .finally(() => setLoadingCases(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim() || !selectedCaseId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim(), caseId: selectedCaseId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar sala.");
        return;
      }

      router.push(`/room/${data.roomId}`);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const canCreate = nickname.trim().length >= 2 && !!selectedCaseId && !loading;

  return (
    <main className="relative flex flex-col items-center justify-center min-h-dvh px-6 py-12 scanlines">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.04)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col gap-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-amber-400 transition-colors w-fit"
        >
          <ArrowLeft className="w-3 h-3" />
          Voltar
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-mono font-bold text-zinc-100">Abrir Investigação</h1>
          <p className="text-sm text-zinc-500 font-mono">
            Você será o Detetive-Chefe desta partida.
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-7">
          {/* Nickname */}
          <div className="flex flex-col gap-2">
            <label htmlFor="nickname" className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Seu Codinome
            </label>
            <Input
              id="nickname"
              type="text"
              placeholder="Ex: DetetiveFaro"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              autoFocus
              autoComplete="off"
            />
          </div>

          {/* Case selection */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Siren className="w-3 h-3" />
              Escolha o Caso
            </label>

            {loadingCases ? (
              <div className="flex items-center gap-2 py-4 text-zinc-500 font-mono text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                Carregando casos...
              </div>
            ) : cases.length === 0 ? (
              <p className="text-xs font-mono text-red-400 py-2">
                Nenhum caso encontrado. Execute <code>pnpm db:seed-cases</code>.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {cases.map((c) => {
                  const isSelected = c.id === selectedCaseId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`w-full text-left flex flex-col gap-1.5 border rounded-sm px-4 py-3 transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/8 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={`text-sm font-mono font-bold ${isSelected ? "text-amber-400" : "text-zinc-200"}`}>
                          {c.title}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-mono px-2 py-0.5 rounded-sm ${DIFFICULTY_BADGE[c.difficulty]}`}>
                            {DIFFICULTY_LABEL[c.difficulty]}
                          </span>
                          {isSelected && (
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-zinc-600">
                        <span>{c.maxTurns} turnos</span>
                        <span>·</span>
                        <span>{c.recommendedPlayersMin}–{c.recommendedPlayersMax} jogadores</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="neon"
            disabled={!canCreate}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando sala...
              </>
            ) : (
              "Criar Sala e Aguardar Equipe"
            )}
          </Button>
        </form>

        <p className="text-xs text-zinc-600 font-mono text-center">
          Um código de 6 caracteres será gerado para convidar os outros investigadores.
        </p>
      </div>
    </main>
  );
}
