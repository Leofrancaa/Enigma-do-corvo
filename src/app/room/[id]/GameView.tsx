"use client";

import { useState, useMemo } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { MapCanvas } from "@/components/map/MapCanvas";
import { DiceRoller } from "@/components/map/DiceRoller";
import { CluesPanel } from "@/components/panels/CluesPanel";
import { PlayersPanel } from "@/components/panels/PlayersPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, List, Loader2, BookOpen, X, Search } from "lucide-react";
import { getReachableCells } from "@/lib/game/board";
import type { Player } from "@/types/game";

interface DeduceResult {
  isCorrect: boolean;
  correctCount: number;
  totalCount: number;
  resultDetails: Record<string, { correct: boolean; correctAnswer: string }>;
}

export function GameView() {
  const { snapshot } = useGameStore();
  const [moving, setMoving] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);
  const [showClues, setShowClues] = useState(false);
  const [showCase, setShowCase] = useState(false);
  const [localDice, setLocalDice] = useState<number | null>(null);

  // Private deduction modal state
  const [showDeduce, setShowDeduce] = useState(false);
  const [deduceAnswers, setDeduceAnswers] = useState<Record<string, string>>({});
  const [deducing, setDeducing] = useState(false);
  const [deduceError, setDeduceError] = useState<string | null>(null);
  const [deduceResult, setDeduceResult] = useState<DeduceResult | null>(null);

  if (!snapshot) return null;

  const { room, me } = snapshot;
  const isMyTurn = me?.id === room.currentPlayerId;
  const currentPlayer = room.players.find((p) => p.id === room.currentPlayerId);

  const locations = snapshot.worldMap?.locations ?? [];
  const questions: Array<{ id: string; label: string }> = (room.case as any)?.questions ?? [];

  const currentDice = (room as any).currentDice ?? localDice;

  const reachable = useMemo((): Array<[number, number]> => {
    if (!isMyTurn || !me || !currentDice) return [];
    return getReachableCells(me.gridRow ?? 9, me.gridCol ?? 13, currentDice);
  }, [isMyTurn, me?.gridRow, me?.gridCol, currentDice]);

  const playerDots = room.players.map((p: Player, idx: number) => ({
    id: p.id,
    gridRow: p.gridRow ?? 9,
    gridCol: p.gridCol ?? 13,
    nickname: p.nickname,
    colorIndex: idx,
    isMe: p.id === me?.id,
    avatarUrl: p.character?.avatarUrl,
  }));

  async function handleCellClick(row: number, col: number) {
    if (moving) return;
    setMoving(true);
    setMoveError(null);
    try {
      const res = await fetch(`/api/rooms/${room.id}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toRow: row, toCol: col, clientActionId: crypto.randomUUID() }),
      });
      const data = await res.json();
      if (!res.ok) setMoveError(data.error ?? "Erro ao mover.");
      else setLocalDice(null);
    } catch {
      setMoveError("Erro de conexão.");
    } finally {
      setMoving(false);
    }
  }

  function openDeduceModal() {
    setDeduceAnswers({});
    setDeduceResult(null);
    setDeduceError(null);
    setShowDeduce(true);
  }

  async function handleDeduce(e: React.FormEvent) {
    e.preventDefault();
    setDeducing(true);
    setDeduceError(null);
    try {
      const res = await fetch(`/api/rooms/${room.id}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: deduceAnswers,
          isFinal: false,
          isPrivate: true,
          clientActionId: crypto.randomUUID(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setDeduceError(data.error ?? "Erro ao verificar dedução."); return; }
      setDeduceResult(data);
    } catch {
      setDeduceError("Erro de conexão.");
    } finally {
      setDeducing(false);
    }
  }

  const deduceAllFilled = questions.length > 0 && questions.every((q) => (deduceAnswers[q.id] ?? "").trim().length > 0);
  const turnsLeft = room.maxTurns - room.currentTurn;

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      {/* HUD */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 backdrop-blur-sm shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Badge variant="zinc" className="font-mono text-xs">
            Turno {room.currentTurn + 1}
          </Badge>
          <span className="text-xs font-mono hidden sm:inline">
            {isMyTurn ? (
              <span className="text-amber-400 font-bold">Sua vez</span>
            ) : (
              <span className="text-zinc-500">Vez de <span className="text-zinc-300">{currentPlayer?.nickname}</span></span>
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
            <span className={room.errorsRemaining <= 1 ? "text-red-400" : "text-zinc-300"}>{room.errorsRemaining}</span>
          </div>
          <Button variant="outline" size="sm" onClick={openDeduceModal} className="text-xs h-7 gap-1">
            <Search className="w-3 h-3" />
            Deduzir
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowCase(true)} className="h-7 w-7 text-zinc-400" title="Reler o caso">
            <BookOpen className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowClues(v => !v)} className="h-7 w-7 text-zinc-400">
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar esquerda (desktop) */}
        <div className="hidden lg:flex flex-col w-44 border-r border-zinc-800 shrink-0 bg-zinc-950">
          <PlayersPanel />
          <div className="p-4 border-t border-zinc-800 flex flex-col items-center gap-2 mt-auto">
            <DiceRoller
              roomId={room.id}
              isMyTurn={isMyTurn}
              currentDice={(room as any).currentDice ?? null}
              onRolled={setLocalDice}
            />
          </div>
        </div>

        {/* Tabuleiro */}
        <div className="flex-1 relative bg-zinc-950 flex items-center justify-center overflow-hidden">
          <MapCanvas
            locations={locations}
            players={playerDots}
            reachable={reachable}
            onCellClick={handleCellClick}
          />

          {moving && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-20">
              <div className="flex items-center gap-2 bg-zinc-900 border border-amber-400/30 rounded-sm px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span className="text-xs font-mono text-zinc-300">Movendo...</span>
              </div>
            </div>
          )}

          {moveError && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-900/80 border border-red-500/40 rounded-sm px-4 py-2 z-20">
              <span className="text-xs font-mono text-red-300">{moveError}</span>
            </div>
          )}
        </div>

        {/* Pistas (desktop) */}
        <div className="hidden lg:flex flex-col w-64 border-l border-zinc-800 shrink-0 bg-zinc-950 overflow-hidden">
          <CluesPanel />
        </div>
      </div>

      {/* Mobile barra inferior */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-zinc-900 border-t border-zinc-800 shrink-0">
        <DiceRoller
          roomId={room.id}
          isMyTurn={isMyTurn}
          currentDice={(room as any).currentDice ?? null}
          onRolled={setLocalDice}
        />
        <Button variant="ghost" size="sm" onClick={() => setShowClues(v => !v)} className="text-xs text-zinc-400">
          Pistas ({snapshot.discoveredClues.length})
        </Button>
      </div>

      {/* Modal: Reler Caso */}
      {showCase && room.case && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowCase(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[80vh] bg-zinc-900 border border-amber-500/30 rounded-sm flex flex-col overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.15)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">Caso em Investigação</span>
              </div>
              <button onClick={() => setShowCase(false)} className="text-zinc-500 hover:text-zinc-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 shrink-0 border-b border-zinc-800">
              <h2 className="text-lg font-mono font-bold text-zinc-100">{room.case.title}</h2>
              <p className="text-xs font-mono text-zinc-500 mt-0.5">
                {room.case.difficulty === "facil" ? "Fácil" : room.case.difficulty === "medio" ? "Médio" : "Difícil"}
                {" · "}{room.case.maxTurns} turnos
              </p>
            </div>
            <div className="overflow-y-auto px-5 py-4 flex-1">
              <p className="text-sm font-mono text-zinc-300 leading-relaxed whitespace-pre-line">
                {room.case.narrativeIntro}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Dedução Particular */}
      {showDeduce && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowDeduce(false)}
        >
          <div
            className="relative w-full max-w-xl bg-zinc-900 border border-amber-500/30 rounded-sm flex flex-col overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.15)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">Dedução Particular</span>
              </div>
              <button onClick={() => setShowDeduce(false)} className="text-zinc-500 hover:text-zinc-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!deduceResult ? (
              <form onSubmit={handleDeduce} className="flex flex-col gap-4 p-5 overflow-y-auto max-h-[70vh]">
                <p className="text-xs font-mono text-zinc-500">
                  Sua dedução é privada — só você vê o resultado. Comunique ao grupo verbalmente.
                </p>
                {questions.length === 0 ? (
                  <p className="text-xs font-mono text-zinc-600 text-center py-4">
                    As perguntas do caso ainda não foram carregadas.
                  </p>
                ) : (
                  questions.map((q, idx) => (
                    <div key={q.id} className="flex flex-col gap-1.5">
                      <label className="text-xs font-mono text-amber-400/80 leading-snug">
                        {idx + 1}. {q.label}
                      </label>
                      <Input
                        value={deduceAnswers[q.id] ?? ""}
                        onChange={(e) => setDeduceAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Sua resposta..."
                        maxLength={300}
                      />
                    </div>
                  ))
                )}
                {deduceError && (
                  <p className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2">
                    {deduceError}
                  </p>
                )}
                <Button type="submit" disabled={deducing || !deduceAllFilled} className="w-full">
                  {deducing
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Verificando...</>
                    : "Verificar Dedução"
                  }
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-4 p-5 overflow-y-auto max-h-[70vh]">
                <div className={`text-center text-2xl font-mono font-bold py-2 ${deduceResult.isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                  {deduceResult.isCorrect ? "✓ Correto!" : "✗ Incorreto"}
                </div>
                <p className="text-xs font-mono text-zinc-400 text-center -mt-2">
                  {deduceResult.correctCount} de {deduceResult.totalCount} {deduceResult.totalCount === 1 ? "resposta correta" : "respostas corretas"}
                </p>
                <div className="flex flex-col gap-3">
                  {questions.map((q) => {
                    const detail = deduceResult.resultDetails[q.id];
                    return (
                      <div key={q.id} className={`border rounded-sm px-3 py-2.5 ${detail?.correct ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                        <p className="text-xs font-mono text-zinc-300 font-medium">{q.label}</p>
                        <p className="text-xs font-mono mt-1 text-zinc-500">Sua resposta: {deduceAnswers[q.id]}</p>
                        {!detail?.correct && detail?.correctAnswer && (
                          <p className="text-xs font-mono mt-0.5 text-emerald-400">Correto: {detail.correctAnswer}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs font-mono text-zinc-600 text-center">
                  Comunique o resultado ao grupo verbalmente.
                </p>
                <Button onClick={() => setShowDeduce(false)} variant="outline" className="w-full">
                  Fechar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile clues sheet */}
      {showClues && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-zinc-900 border-t border-zinc-800 rounded-t-lg max-h-[60vh] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Pistas</span>
            <button onClick={() => setShowClues(false)} className="text-zinc-600 text-xs font-mono">Fechar</button>
          </div>
          <div className="overflow-y-auto flex-1"><CluesPanel /></div>
        </div>
      )}
    </div>
  );
}
