"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function HostPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim() }),
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

  return (
    <main className="relative flex flex-col items-center justify-center min-h-dvh px-6 scanlines">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.04)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-cyan-400 transition-colors w-fit"
        >
          <ArrowLeft className="w-3 h-3" />
          Voltar
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-mono font-bold text-zinc-100">Criar Sala</h1>
          <p className="text-sm text-zinc-500 font-mono">
            Você será o host da partida.
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="nickname" className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Seu Codinome
            </label>
            <Input
              id="nickname"
              type="text"
              placeholder="Ex: SombraDigital"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              autoFocus
              autoComplete="off"
            />
          </div>

          {error && (
            <p className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" variant="neon" disabled={loading || !nickname.trim()} className="w-full mt-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando sala...
              </>
            ) : (
              "Criar Sala"
            )}
          </Button>
        </form>

        <p className="text-xs text-zinc-600 font-mono text-center">
          Um código de 6 caracteres será gerado para convidar outros jogadores.
        </p>
      </div>
    </main>
  );
}
