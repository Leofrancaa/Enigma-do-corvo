import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-dvh overflow-hidden scanlines">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.06)_0%,transparent_70%)]" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-2xl">
        {/* Corvo symbol */}
        <div className="text-6xl text-cyan-400 neon-text select-none" aria-hidden="true">
          &#x1F426;
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-zinc-100">
            CIFRA URBANA
          </h1>
          <p className="text-xl sm:text-2xl font-mono text-cyan-400 neon-text tracking-widest uppercase">
            O Enigma do Corvo
          </p>
        </div>

        <p className="text-zinc-400 text-sm sm:text-base max-w-md leading-relaxed">
          Uma metrópole distópica. Crimes impossíveis. Um mestre da criptografia nas sombras.
          Reúna os detetives. Decifre o código. Encontre o Corvo.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button asChild size="lg" variant="neon" className="min-w-48">
            <Link href="/host">Criar Sala</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="min-w-48">
            <Link href="/join">Entrar com Código</Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-mono text-zinc-600 justify-center">
          <span>2-6 jogadores</span>
          <span className="text-zinc-700">|</span>
          <span>Cooperativo</span>
          <span className="text-zinc-700">|</span>
          <span>120 casos</span>
          <span className="text-zinc-700">|</span>
          <span>Cyberpunk</span>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-400/30 to-transparent" />
    </main>
  );
}
