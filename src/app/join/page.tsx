"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !nickname.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // First, validate the room exists by using the join endpoint
      const res = await fetch(`/api/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase(), nickname: nickname.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao entrar na sala.");
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,42,109,0.04)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-cyan-400 transition-colors w-fit"
        >
          <ArrowLeft className="w-3 h-3" />
          Voltar
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-mono font-bold text-zinc-100">Entrar na Sala</h1>
          <p className="text-sm text-zinc-500 font-mono">
            Use o código de convite enviado pelo host.
          </p>
        </div>

        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Código de Convite
            </label>
            <Input
              id="code"
              type="text"
              placeholder="Ex: KRVX4P"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              maxLength={6}
              autoFocus
              autoComplete="off"
              className="tracking-[0.4em] text-center text-lg uppercase"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="nickname" className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Seu Codinome
            </label>
            <Input
              id="nickname"
              type="text"
              placeholder="Ex: GatoNeon"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              autoComplete="off"
            />
          </div>

          {error && (
            <p className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-sm px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="secondary"
            disabled={loading || code.length < 6 || !nickname.trim()}
            className="w-full mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar na Sala"
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
