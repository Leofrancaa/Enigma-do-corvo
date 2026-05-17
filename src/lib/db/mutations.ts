import { and, eq, sql } from "drizzle-orm";
import { db } from "./client";
import {
  discoveredClues,
  guesses,
  playerActions,
  players,
  rooms,
} from "./schema";
import { generateRoomCode } from "@/lib/utils/code-generator";

// ─── Room ─────────────────────────────────────────────────────────────────────

export async function createRoom(
  hostSessionId: string,
  caseId?: string
): Promise<{ id: string; code: string }> {
  let code = generateRoomCode();
  let attempts = 0;

  while (attempts < 5) {
    try {
      const [room] = await db
        .insert(rooms)
        .values({ code, hostSessionId, ...(caseId ? { caseId } : {}) })
        .returning({ id: rooms.id, code: rooms.code });
      return room;
    } catch (err: unknown) {
      // Só tenta novamente em violação de unique (código duplicado)
      const isUniqueViolation =
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code: string }).code === "23505";

      if (!isUniqueViolation) {
        // Lança o erro real para aparecer nos logs da Vercel
        throw err;
      }

      code = generateRoomCode();
      attempts++;
    }
  }
  throw new Error("Falha ao gerar código único para a sala após 5 tentativas.");
}

export async function updateRoomStatus(
  roomId: string,
  status: (typeof rooms.$inferInsert)["status"]
) {
  await db.update(rooms).set({ status }).where(eq(rooms.id, roomId));
}

export async function startRoom(
  roomId: string,
  caseId: string,
  maxTurns: number,
  maxErrors: number,
  firstPlayerId: string
) {
  await db
    .update(rooms)
    .set({
      status: "CHARACTER_SELECT",
      caseId,
      maxTurns,
      errorsRemaining: maxErrors,
      currentPlayerId: firstPlayerId,
      startedAt: new Date(),
    })
    .where(eq(rooms.id, roomId));
}

export async function advanceTurn(
  roomId: string,
  nextPlayerId: string,
  newTurn: number
) {
  await db
    .update(rooms)
    .set({ currentPlayerId: nextPlayerId, currentTurn: newTurn })
    .where(eq(rooms.id, roomId));
}

export async function decrementErrors(roomId: string) {
  await db
    .update(rooms)
    .set({ errorsRemaining: sql`${rooms.errorsRemaining} - 1` })
    .where(eq(rooms.id, roomId));
}

export async function endRoom(roomId: string) {
  await db
    .update(rooms)
    .set({ status: "ENDED", endedAt: new Date() })
    .where(eq(rooms.id, roomId));
}

// ─── Player ───────────────────────────────────────────────────────────────────

export async function createPlayer(data: {
  roomId: string;
  sessionId: string;
  nickname: string;
  isHost: boolean;
}) {
  const [player] = await db.insert(players).values(data).returning();
  return player;
}

export async function updatePlayerConnection(playerId: string, isConnected: boolean) {
  await db
    .update(players)
    .set({ isConnected })
    .where(eq(players.id, playerId));
}

export async function updatePlayerLocation(playerId: string, locationId: string) {
  await db.update(players).set({ currentLocationId: locationId }).where(eq(players.id, playerId));
}

export async function setPlayerCharacter(playerId: string, characterId: string) {
  await db.update(players).set({ characterId }).where(eq(players.id, playerId));
}

export async function promotePlayerToHost(playerId: string, roomId: string) {
  // Remove host from all, then set new host
  await db.update(players).set({ isHost: false }).where(eq(players.roomId, roomId));
  await db.update(players).set({ isHost: true }).where(eq(players.id, playerId));
  await db.update(rooms).set({ hostSessionId: sql`(SELECT session_id FROM players WHERE id = ${playerId})` }).where(eq(rooms.id, roomId));
}

// ─── Discovered Clues ─────────────────────────────────────────────────────────

export async function revealClues(
  roomId: string,
  playerId: string,
  clueIds: string[]
) {
  if (clueIds.length === 0) return;
  await db
    .insert(discoveredClues)
    .values(clueIds.map((clueId) => ({ roomId, playerId, clueId })))
    .onConflictDoNothing();
}

// ─── Player Actions (idempotent) ──────────────────────────────────────────────

export async function insertPlayerAction(data: {
  clientActionId: string;
  roomId: string;
  playerId: string;
  type: (typeof playerActions.$inferInsert)["type"];
  payload?: unknown;
  turn: number;
}) {
  await db
    .insert(playerActions)
    .values({ ...data, payload: data.payload as any })
    .onConflictDoNothing(); // idempotent by clientActionId
}

// ─── Guesses ─────────────────────────────────────────────────────────────────

export async function insertGuess(data: {
  roomId: string;
  playerId: string;
  who: string;
  whereId: string;
  how: string;
  why: string;
  isFinal: boolean;
  isCorrect: boolean;
  scoreAwarded: number;
}) {
  const [guess] = await db.insert(guesses).values(data).returning();
  return guess;
}
