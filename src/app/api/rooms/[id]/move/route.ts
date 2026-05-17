import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionId } from "@/lib/session";
import { getPlayerBySession, getLocationConnections, getUndiscoveredCluesForLocation } from "@/lib/db/queries";
import { revealClues, insertPlayerAction, advanceTurn } from "@/lib/db/mutations";
import { db } from "@/lib/db/client";
import { players, rooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { canMove, getNextPlayerId } from "@/lib/game/rules";

const moveSchema = z.object({
  toLocationId: z.string().uuid(),
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

    const { toLocationId, clientActionId } = parsed.data;
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

    const connections = await getLocationConnections();

    const moveResult = canMove(
      player.id,
      room.currentPlayerId,
      player.currentLocationId,
      toLocationId,
      room.currentDice,
      connections
    );

    if (!moveResult.ok) {
      return NextResponse.json({ error: moveResult.reason }, { status: 400 });
    }

    // Move player and clear dice
    await db
      .update(players)
      .set({ currentLocationId: toLocationId })
      .where(eq(players.id, player.id));

    // Reveal undiscovered clues at destination
    const undiscovered = await getUndiscoveredCluesForLocation(roomId, toLocationId, room.caseId!);
    await revealClues(roomId, player.id, undiscovered.map((c) => c.id));

    await insertPlayerAction({
      clientActionId,
      roomId,
      playerId: player.id,
      type: "move",
      payload: { fromLocationId: player.currentLocationId, toLocationId, dice: room.currentDice },
      turn: room.currentTurn,
    });

    // Advance turn and reset dice
    const nextPlayerId = getNextPlayerId(room.players, player.id);
    const nextTurn = room.currentTurn + 1;

    if (nextPlayerId) {
      await db
        .update(rooms)
        .set({ currentPlayerId: nextPlayerId, currentTurn: nextTurn, currentDice: null })
        .where(eq(rooms.id, roomId));
    }

    // Check turn limit
    if (nextTurn >= room.maxTurns) {
      await db.update(rooms).set({ status: "DEDUCTION" }).where(eq(rooms.id, roomId));
      return NextResponse.json({ ok: true, revealedClues: undiscovered.length, transitionedTo: "DEDUCTION" });
    }

    return NextResponse.json({ ok: true, revealedClues: undiscovered.length });
  } catch (err) {
    console.error("[POST /api/rooms/[id]/move]", err);
    return NextResponse.json({ error: "Erro ao mover jogador." }, { status: 500 });
  }
}
