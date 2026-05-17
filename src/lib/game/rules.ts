import type { transportTypeEnum } from "@/lib/db/schema";

type TransportType = (typeof transportTypeEnum.enumValues)[number];

export interface PlayerTickets {
  ticketsDrone: number;
  ticketsHyperloop: number;
  ticketsMagrail: number;
}

export interface ConnectionEdge {
  fromId: string;
  toId: string;
  transportType: TransportType;
}

export function canMove(
  playerId: string,
  currentPlayerId: string | null,
  fromLocationId: string | null,
  toLocationId: string,
  transportType: TransportType,
  tickets: PlayerTickets,
  connections: ConnectionEdge[]
): { ok: boolean; reason?: string } {
  if (playerId !== currentPlayerId) {
    return { ok: false, reason: "Não é a sua vez." };
  }

  if (!fromLocationId) {
    return { ok: false, reason: "Jogador sem posição inicial." };
  }

  const hasConnection = connections.some(
    (c) =>
      ((c.fromId === fromLocationId && c.toId === toLocationId) ||
        (c.toId === fromLocationId && c.fromId === toLocationId)) &&
      c.transportType === transportType
  );

  if (!hasConnection) {
    return { ok: false, reason: "Rota inválida para este tipo de transporte." };
  }

  const ticketKey = `tickets${transportType.charAt(0).toUpperCase()}${transportType.slice(1)}` as keyof PlayerTickets;
  if (tickets[ticketKey] <= 0) {
    return { ok: false, reason: `Sem fichas de ${transportType}.` };
  }

  return { ok: true };
}

export function deductTicket(
  tickets: PlayerTickets,
  transportType: TransportType
): PlayerTickets {
  const key =
    `tickets${transportType.charAt(0).toUpperCase()}${transportType.slice(1)}` as keyof PlayerTickets;
  return { ...tickets, [key]: tickets[key] - 1 };
}

export function computeScore(params: {
  correctFields: number; // 0-4
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
  const next = active[(idx + 1) % active.length];
  return next.id;
}
