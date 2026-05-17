"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Clue, ClueType } from "@/types/game";

const TYPE_LABELS: Record<ClueType, string> = {
  analogia: "Analogia",
  anagrama: "Anagrama",
  cifra: "Cifra",
  referencia: "Referência",
  depoimento: "Depoimento",
  evidencia: "Evidência",
  plot_twist: "Reviravolta",
};

const TYPE_VARIANT: Record<ClueType, "default" | "magenta" | "zinc" | "success"> = {
  analogia: "zinc",
  anagrama: "default",
  cifra: "default",
  referencia: "zinc",
  depoimento: "magenta",
  evidencia: "zinc",
  plot_twist: "magenta",
};

export function CluesPanel() {
  const { snapshot } = useGameStore();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (!snapshot) return null;

  const clues = snapshot.discoveredClues;

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
          Pistas
        </span>
        <Badge variant="zinc">{clues.length}</Badge>
      </div>

      <div className="flex-1 overflow-y-auto">
        {clues.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-xs font-mono text-zinc-600 text-center px-4">
            Nenhuma pista descoberta ainda.
            <br />
            Visite locais para coletar pistas.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-800/50">
            {clues.map((clue: Clue) => {
              const isOpen = expanded.has(clue.id);
              return (
                <button
                  key={clue.id}
                  onClick={() => toggle(clue.id)}
                  className="flex flex-col gap-2 px-4 py-3 text-left hover:bg-zinc-900/50 transition-colors w-full"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={TYPE_VARIANT[clue.type]} className="text-xs shrink-0">
                      {TYPE_LABELS[clue.type]}
                    </Badge>
                    {isOpen ? (
                      <ChevronUp className="w-3 h-3 text-zinc-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-zinc-600 shrink-0" />
                    )}
                  </div>
                  <p className={`text-xs font-mono text-zinc-300 leading-relaxed ${!isOpen ? "line-clamp-2" : ""}`}>
                    {clue.displayContent}
                  </p>
                  {isOpen && clue.decodedHint && (
                    <p className="text-xs font-mono text-amber-400/70 italic border-t border-zinc-800 pt-2 mt-1">
                      Dica: {clue.decodedHint}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
