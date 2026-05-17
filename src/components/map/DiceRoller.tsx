"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const DICE_FACES: Record<number, string> = {
  1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅",
};

interface Props {
  roomId: string;
  isMyTurn: boolean;
  currentDice: number | null;
  onRolled: (dice: number) => void;
}

export function DiceRoller({ roomId, isMyTurn, currentDice, onRolled }: Props) {
  const [rolling, setRolling] = useState(false);
  const [animDice, setAnimDice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRoll() {
    if (!isMyTurn || currentDice !== null || rolling) return;
    setRolling(true);
    setError(null);

    // Animação de rolagem
    let frames = 0;
    const interval = setInterval(() => {
      setAnimDice(Math.ceil(Math.random() * 6));
      frames++;
      if (frames >= 8) clearInterval(interval);
    }, 80);

    try {
      const res = await fetch(`/api/rooms/${roomId}/roll-dice`, { method: "POST" });
      const data = await res.json();
      clearInterval(interval);
      if (!res.ok) {
        setError(data.error ?? "Erro ao rolar dado.");
        setAnimDice(null);
      } else {
        setAnimDice(data.dice);
        onRolled(data.dice);
      }
    } catch {
      clearInterval(interval);
      setError("Erro de conexão.");
      setAnimDice(null);
    } finally {
      setRolling(false);
    }
  }

  const displayDice = currentDice ?? animDice;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Face do dado */}
      <div
        className={[
          "text-6xl select-none transition-transform",
          rolling ? "animate-bounce" : "",
          displayDice ? "text-amber-400" : "text-zinc-600",
        ].join(" ")}
        style={{ lineHeight: 1, fontFamily: "monospace" }}
      >
        {displayDice ? DICE_FACES[displayDice] : "⚀"}
      </div>

      {displayDice && (
        <p className="text-xs font-mono text-amber-400 font-bold tracking-widest">
          {currentDice ? `MOVA ATÉ ${currentDice} CASAS` : ""}
        </p>
      )}

      {error && (
        <p className="text-xs font-mono text-red-400">{error}</p>
      )}

      {isMyTurn && currentDice === null && (
        <Button
          variant="neon"
          size="sm"
          onClick={handleRoll}
          disabled={rolling}
          className="text-xs"
        >
          {rolling ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Rolando...
            </>
          ) : (
            "Rolar Dado"
          )}
        </Button>
      )}

      {isMyTurn && currentDice !== null && (
        <p className="text-xs font-mono text-zinc-500">Clique no destino no mapa</p>
      )}
    </div>
  );
}
