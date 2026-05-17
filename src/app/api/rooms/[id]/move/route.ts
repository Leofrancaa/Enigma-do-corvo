import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionId } from "@/lib/session";
import { getPlayerBySession, getUndiscoveredCluesForLocationSlug } from "@/lib/db/queries";
import { revealClues, insertPlayerAction, advanceTurn } from "@/lib/db/mutations";
import { db } from "@/lib/db/client";
import { players, rooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getReachableCells, getCell, isEntryCell, isRoomCell, cellSlug, ENTRY_CODE_TO_SLUG } from "@/lib/game/board";
import { rollDice, getNextPlayerId } from "@/lib/game/rules";

const moveSchema = z.object({
  toRow: z.number().int().min(0).max(25),
  toCol: z.number().int().min(0).max(29),
  clientActionId: z.string().uuid(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const body = await req.json();
    const parsed = moveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { toRow, toCol, clientActionId } = parsed.data;
    const sessionId = await getSessionId();
    if (!sessionId) return NextResponse.json({ error: "Sessão não encontrada." }, { status: 401 });

    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
      with: { players: true },
    });
    if (!room) return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
    if (room.status !== "INVESTIGATION") {
      return NextResponse.json({ error: "Não é fase de investigação." }, { status: 409 });
    }

    const player = await getPlayerBySession(roomId, sessionId);
    if (!player) return NextResponse.json({ error: "Jogador não encontrado." }, { status: 403 });
    if (player.id !== room.currentPlayerId) {
      return NextResponse.json({ error: "Não é a sua vez." }, { status: 403 });
    }
    if (!room.currentDice) {
      return NextResponse.json({ error: "Role o dado antes de mover." }, { status: 400 });
    }

    // Validate destination is reachable
    const reachable = getReachableCells(player.gridRow ?? 9, player.gridCol ?? 14, room.currentDice);
    const isReachable = reachable.some(([r, c]) => r === toRow && c === toCol);
    if (!isReachable) {
      return NextResponse.json({ error: "Destino fora do alcance do dado." }, { status: 400 });
    }

    // Determine if entering a location
    const cellCode = getCell(toRow, toCol);
    const entrySlug = isEntryCell(cellCode) ? ENTRY_CODE_TO_SLUG[cellCode] : null;

    // If entering a location, check if another player is already there
    if (entrySlug) {
      const occupied = room.players.some(
        (p: typeof room.players[0]) =>
          p.id !== player.id && p.inLocationSlug === entrySlug
      );
      if (occupied) {
        return NextResponse.json({ error: "Este local já está ocupado por outro detetive." }, { status: 409 });
      }
    }

    // Move player
    await db.update(players).set({
      gridRow: toRow,
      gridCol: toCol,
      inLocationSlug: entrySlug,
    }).where(eq(players.id, player.id));

    // Reveal clues when entering a location
    let revealedCount = 0;
    if (entrySlug && room.caseId) {
      const undiscovered = await getUndiscoveredCluesForLocationSlug(roomId, entrySlug, room.caseId);
      await revealClues(roomId, player.id, undiscovered.map((c) => c.id));
      revealedCount = undiscovered.length;
    }

    await insertPlayerAction({
      clientActionId,
      roomId,
      playerId: player.id,
      type: "move",
      payload: { fromRow: player.gridRow, fromCol: player.gridCol, toRow, toCol, entrySlug, dice: room.currentDice },
      turn: room.currentTurn,
    });

    // Advance turn, clear dice
    const nextPlayerId = getNextPlayerId(room.players, player.id);
    const nextTurn = room.currentTurn + 1;
    if (nextPlayerId) {
      await db.update(rooms).set({
        currentPlayerId: nextPlayerId,
        currentTurn: nextTurn,
        currentDice: null,
      }).where(eq(rooms.id, roomId));
    }

    if (nextTurn >= room.maxTurns) {
      await db.update(rooms).set({ status: "DEDUCTION" }).where(eq(rooms.id, roomId));
      return NextResponse.json({ ok: true, revealedClues: revealedCount, transitionedTo: "DEDUCTION" });
    }

    return NextResponse.json({ ok: true, revealedClues: revealedCount });
  } catch (err) {
    console.error("[POST /api/rooms/[id]/move]", err);
    return NextResponse.json({ error: "Erro ao mover jogador." }, { status: 500 });
  }
}
