import { and, eq, inArray } from "drizzle-orm";
import { db } from "./client";
import {
  cases,
  characters,
  clues,
  discoveredClues,
  locationConnections,
  locations,
  playerActions,
  players,
  rooms,
} from "./schema";

export async function getRoomByCode(code: string) {
  return db.query.rooms.findFirst({
    where: eq(rooms.code, code.toUpperCase()),
  });
}

export async function getRoomById(roomId: string) {
  return db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    with: {
      case: {
        with: {
          locations: true,
          connections: true,
        },
      },
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
        columns: {
          id: true,
          slug: true,
          title: true,
          narrativeIntro: true,
          difficulty: true,
          maxTurns: true,
          maxErrors: true,
          // solution fields intentionally omitted
        },
        with: {
          locations: true,
          connections: true,
        },
      },
      players: {
        with: { character: true, currentLocation: true },
      },
    },
  });

  if (!room) return null;

  // Discovered clues visible to everyone in the room
  const discovered = await db.query.discoveredClues.findMany({
    where: eq(discoveredClues.roomId, roomId),
    with: { clue: true },
  });

  // All characters (for character select)
  const allCharacters = await db.select().from(characters).orderBy(characters.name);

  // My player record
  const me = room.players.find((p) => p.sessionId === sessionId) ?? null;

  return { room, discoveredClues: discovered, allCharacters, me };
}

export async function getPlayerBySession(roomId: string, sessionId: string) {
  return db.query.players.findFirst({
    where: and(eq(players.roomId, roomId), eq(players.sessionId, sessionId)),
  });
}

export async function getAllCharacters() {
  return db.select().from(characters).orderBy(characters.name);
}

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

export async function getCaseWithLocations(caseId: string) {
  return db.query.cases.findFirst({
    where: eq(cases.id, caseId),
    with: {
      locations: true,
      connections: true,
    },
  });
}

export async function getCluesForRoom(roomId: string) {
  // Only return clues discovered in this room
  const discovered = await db.query.discoveredClues.findMany({
    where: eq(discoveredClues.roomId, roomId),
    with: { clue: true },
    orderBy: (dc, { asc }) => [asc(dc.discoveredAt)],
  });
  return discovered.map((d) => ({ ...d.clue, discoveredAt: d.discoveredAt }));
}

export async function getLocationConnections(caseId: string) {
  return db
    .select()
    .from(locationConnections)
    .where(eq(locationConnections.caseId, caseId));
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

export async function getCaseSolution(caseId: string) {
  const result = await db
    .select({
      solutionWho: cases.solutionWho,
      solutionHow: cases.solutionHow,
      solutionWhy: cases.solutionWhy,
      solutionExplanation: cases.solutionExplanation,
    })
    .from(cases)
    .where(eq(cases.id, caseId))
    .limit(1);
  return result[0] ?? null;
}

export async function getSolutionLocation(caseId: string) {
  return db.query.locations.findFirst({
    where: and(eq(locations.caseId, caseId), eq(locations.isSolutionWhere, true)),
  });
}
