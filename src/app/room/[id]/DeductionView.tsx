"use client";

import { useGameStore } from "@/stores/useGameStore";
import { DeductionForm } from "@/components/panels/DeductionForm";
import { CluesPanel } from "@/components/panels/CluesPanel";

export function DeductionView() {
  const { snapshot } = useGameStore();
  if (!snapshot) return null;
  const { room } = snapshot;

  return (
    <main className="relative flex flex-col items-center justify-start min-h-dvh px-4 py-8 scanlines overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,42,109,0.06)_0%,transparent_60%)]" />

      <div className="relative z-10 w-full max-w-4xl flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <p className="text-xs font-mono text-pink-400 uppercase tracking-widest">Fase Final</p>
          <h1 className="text-2xl font-mono font-bold text-zinc-100">Hora da Dedução</h1>
          <p className="text-sm text-zinc-500 font-mono">
            Analise as pistas e envie seu palpite final.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clues review */}
          <div className="border border-zinc-800 rounded-sm bg-zinc-950 overflow-hidden max-h-[500px]">
            <CluesPanel />
          </div>

          {/* Deduction form */}
          <div className="border border-zinc-800 rounded-sm bg-zinc-950">
            <DeductionForm isFinal />
          </div>
        </div>
      </div>
    </main>
  );
}
