import type { LocationConnection } from "@/types/game";

// ─── Movement ────────────────────────────────────────────────────────────────

/** BFS: retorna todos os nós alcançáveis a partir de fromId em até maxHops saltos */
export function getReachableNodes(
  fromId: string,
  maxHops: number,
  connections: LocationConnection[]
): string[] {
  if (maxHops <= 0 || !fromId) return [];

  const visited = new Set<string>([fromId]);
  const queue: Array<{ id: string; hops: number }> = [{ id: fromId, hops: 0 }];
  const reachable: string[] = [];

  while (queue.length > 0) {
    const item = queue.shift()!;
    if (item.hops >= maxHops) continue;

    const neighbors = connections
      .filter((c) => c.fromId === item.id || c.toId === item.id)
      .map((c) => (c.fromId === item.id ? c.toId : c.fromId));

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        reachable.push(neighbor);
        queue.push({ id: neighbor, hops: item.hops + 1 });
      }
    }
  }

  return reachable;
}

/** Valida se um movimento é permitido dado o resultado do dado */
export function canMove(
  playerId: string,
  currentPlayerId: string | null,
  fromLocationId: string | null,
  toLocationId: string,
  diceResult: number | null,
  connections: LocationConnection[]
): { ok: boolean; reason?: string } {
  if (playerId !== currentPlayerId) {
    return { ok: false, reason: "Não é a sua vez." };
  }
  if (!fromLocationId) {
    return { ok: false, reason: "Jogador sem posição inicial." };
  }
  if (!diceResult) {
    return { ok: false, reason: "Role o dado antes de mover." };
  }

  const reachable = getReachableNodes(fromLocationId, diceResult, connections);
  if (!reachable.includes(toLocationId)) {
    return { ok: false, reason: "Destino fora do alcance do dado." };
  }

  return { ok: true };
}

/** Gera resultado de dado (1-6) no servidor */
export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

export function computeScore(params: {
  correctFields: number;
  totalTurns: number;
  maxTurns: number;
  errorsUsed: number;
  maxErrors: number;
}): number {
  const { correctFields, totalTurns, maxTurns, errorsUsed, maxErrors } = params;
  if (correctFields === 0) return 0;
  const baseScore = correctFields * 250;
  const turnBonus = Math.max(0, Math.floor(((maxTurns - totalTurns) / maxTurns) * 200));
  const errorBonus = Math.max(0, (maxErrors - errorsUsed) * 100);
  return baseScore + turnBonus + errorBonus;
}

export function getNextPlayerId(
  players: Array<{ id: string; turnOrder: number | null; isConnected: boolean }>,
  currentPlayerId: string | null
): string | null {
  const active = players
    .filter((p) => p.isConnected && p.turnOrder !== null)
    .sort((a, b) => (a.turnOrder ?? 0) - (b.turnOrder ?? 0));
  if (active.length === 0) return null;
  if (!currentPlayerId) return active[0].id;
  const idx = active.findIndex((p) => p.id === currentPlayerId);
  return active[(idx + 1) % active.length].id;
}
