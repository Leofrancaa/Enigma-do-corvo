import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-dvh overflow-hidden scanlines">
      {/* Background — subtle warm grid, like a detective pinboard */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,158,11,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Warm radial glow — lamp light from above */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.07)_0%,transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(220,38,38,0.04)_0%,transparent_60%)]" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-2xl">
        {/* Badge icon */}
        <div className="text-6xl neon-text select-none" aria-hidden="true">
          🔍
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-zinc-100">
            CIFRA URBANA
          </h1>
          <p className="text-xl sm:text-2xl font-mono text-amber-400 neon-text tracking-widest uppercase">
            Departamento de Investigação
          </p>
        </div>

        <p className="text-zinc-400 text-sm sm:text-base max-w-md leading-relaxed">
          Uma cidade com segredos enterrados fundo. Crimes que a polícia comum não consegue resolver.
          Reúna os detetives. Analise as pistas. Feche o caso.
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
          <span>2-6 Investigadores</span>
          <span className="text-zinc-700">|</span>
          <span>Cooperativo</span>
          <span className="text-zinc-700">|</span>
          <span>2 Casos</span>
          <span className="text-zinc-700">|</span>
          <span>Investigação Policial</span>
        </div>
      </div>

      {/* Bottom crime tape decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-500/30 to-transparent" />
    </main>
  );
}
