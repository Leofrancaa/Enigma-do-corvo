import { and, eq, inArray } from "drizzle-orm";
import { db } from "./client";
import {
  cases,
  characters,
  clues,
  discoveredClues,
  locationConnections,
  locations,
  players,
  rooms,
} from "./schema";

// ─── World Map (fixed, same for every game) ──────────────────────────────────

export async function getWorldMap() {
  const locs = await db.select().from(locations);
  const conns = await db.select().from(locationConnections);
  return { locations: locs, connections: conns };
}

export async function getStartHub() {
  return db.query.locations.findFirst({
    where: eq(locations.isStartHub, true),
  });
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

export async function getRoomByCode(code: string) {
  return db.query.rooms.findFirst({
    where: eq(rooms.code, code.toUpperCase()),
  });
}

export async function getRoomById(roomId: string) {
  return db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    with: {
      case: true,
      players: {
        with: { character: true, currentLocation: true },
      },
    },
  });
}

export async function getRoomSnapshot(roomId: string, sessionId: string) {
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    with: {
      case: {
        // Omit solution fields — never sent to client.
        // questions is included but only {id, label} — answer is stripped below
        columns: {
          id: true,
          slug: true,
          title: true,
          narrativeIntro: true,
          difficulty: true,
          maxTurns: true,
          maxErrors: true,
          recommendedPlayersMin: true,
          recommendedPlayersMax: true,
          questions: true,
          createdAt: true,
        },
      },
      players: {
        with: { character: true, currentLocation: true },
      },
    },
  });

  if (!room) return null;

  // Fixed world map — same every game
  const worldMap = await getWorldMap();

  // Pistas individuais: cada jogador só vê as pistas que ELE mesmo descobriu
  const me = room.players.find((p) => p.sessionId === sessionId) ?? null;
  const discovered = await db.query.discoveredClues.findMany({
    where: me
      ? and(eq(discoveredClues.roomId, roomId), eq(discoveredClues.playerId, me.id))
      : eq(discoveredClues.roomId, roomId),
    with: { clue: true },
    orderBy: (dc, { asc }) => [asc(dc.discoveredAt)],
  });

  // All characters (for character select UI)
  const allCharacters = await db.select().from(characters).orderBy(characters.name);

  // Flatten discoveredClues: the DB join returns { clue: Clue, ... }
  // but the client types expect flat Clue objects with discoveredAt
  const flatClues = discovered.map((d) => ({
    ...d.clue,
    discoveredAt: d.discoveredAt instanceof Date
      ? d.discoveredAt.toISOString()
      : String(d.discoveredAt),
  }));

  // Strip answer from questions — client never receives correct answers
  if (room.case && Array.isArray((room.case as any).questions)) {
    (room.case as any).questions = ((room.case as any).questions as Array<{ id: string; label: string; answer?: string }>)
      .map(({ id, label }) => ({ id, label }));
  }

  return { room, worldMap, discoveredClues: flatClues, allCharacters, me };
}

// ─── Players ──────────────────────────────────────────────────────────────────

export async function getPlayerBySession(roomId: string, sessionId: string) {
  return db.query.players.findFirst({
    where: and(eq(players.roomId, roomId), eq(players.sessionId, sessionId)),
  });
}

// ─── Characters ───────────────────────────────────────────────────────────────

export async function getAllCharacters() {
  return db.select().from(characters).orderBy(characters.name);
}

// ─── Cases ────────────────────────────────────────────────────────────────────

export async function getAvailableCases() {
  return db
    .select({
      id: cases.id,
      slug: cases.slug,
      title: cases.title,
      difficulty: cases.difficulty,
      maxTurns: cases.maxTurns,
      recommendedPlayersMin: cases.recommendedPlayersMin,
      recommendedPlayersMax: cases.recommendedPlayersMax,
    })
    .from(cases);
}

// ─── Clues ────────────────────────────────────────────────────────────────────

/** All connections (world-fixed, no caseId filter needed) */
export async function getLocationConnections() {
  return db.select().from(locationConnections);
}

export async function getUndiscoveredCluesForLocation(
  roomId: string,
  locationId: string,
  caseId: string
) {
  const allClues = await db
    .select()
    .from(clues)
    .where(and(eq(clues.caseId, caseId), eq(clues.locationId, locationId)));

  if (allClues.length === 0) return [];

  const discoveredInRoom = await db
    .select({ clueId: discoveredClues.clueId })
    .from(discoveredClues)
    .where(
      and(
        eq(discoveredClues.roomId, roomId),
        inArray(
          discoveredClues.clueId,
          allClues.map((c) => c.id)
        )
      )
    );

  const discoveredIds = new Set(discoveredInRoom.map((d) => d.clueId));
  return allClues.filter((c) => !discoveredIds.has(c.id));
}

/** Versão por slug do local (para o novo sistema de grade) */
export async function getUndiscoveredCluesForLocationSlug(
  roomId: string,
  locationSlug: string,
  caseId: string
) {
  // Find the location by slug first
  const loc = await db.query.locations.findFirst({
    where: eq(locations.slug, locationSlug),
  });
  if (!loc) return [];
  return getUndiscoveredCluesForLocation(roomId, loc.id, caseId);
}

// ─── Solution (server-only — never call from client route without auth) ───────

export async function getCaseSolution(caseId: string) {
  const result = await db
    .select({
      solutionWho: cases.solutionWho,
      solutionHow: cases.solutionHow,
      solutionWhy: cases.solutionWhy,
      solutionExplanation: cases.solutionExplanation,
      solutionWhereId: cases.solutionWhereId,
    })
    .from(cases)
    .where(eq(cases.id, caseId))
    .limit(1);
  return result[0] ?? null;
}

export async function getSolutionLocation(caseId: string) {
  const cs = await db.query.cases.findFirst({
    where: eq(cases.id, caseId),
    columns: { solutionWhereId: true },
  });
  if (!cs?.solutionWhereId) return null;
  return db.query.locations.findFirst({
    where: eq(locations.id, cs.solutionWhereId),
  });
}
