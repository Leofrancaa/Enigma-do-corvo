import { NextRequest, NextResponse } from "next/server";
import { moveSchema } from "@/lib/validation/zod-schemas";
import { getSessionId } from "@/lib/session";
import { getPlayerBySession, getLocationConnections, getUndiscoveredCluesForLocation } from "@/lib/db/queries";
import { updatePlayerLocation, revealClues, insertPlayerAction, advanceTurn } from "@/lib/db/mutations";
import { db } from "@/lib/db/client";
import { rooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { canMove, deductTicket, getNextPlayerId } from "@/lib/game/rules";
import { assertTransition } from "@/lib/game/state-machine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const body = await req.json();
    const parsed = moveSchema.safeParse({ ...body, roomId });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { toLocationId, transportType, clientActionId } = parsed.data;
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
      transportType,
      player,
      connections
    );

    if (!moveResult.ok) {
      return NextResponse.json({ error: moveResult.reason }, { status: 400 });
    }

    const newTickets = deductTicket(player, transportType);

    // Discover undiscovered clues at the new location
    const undiscovered = await getUndiscoveredCluesForLocation(roomId, toLocationId, room.caseId!);

    await updatePlayerLocation(player.id, toLocationId, newTickets);
    await revealClues(roomId, player.id, undiscovered.map((c) => c.id));

    await insertPlayerAction({
      clientActionId,
      roomId,
      playerId: player.id,
      type: "move",
      payload: { fromLocationId: player.currentLocationId, toLocationId, transportType },
      turn: room.currentTurn,
    });

    // Advance turn
    const nextPlayerId = getNextPlayerId(room.players, player.id);
    const nextTurn = room.currentTurn + 1;
    if (nextPlayerId) {
      await advanceTurn(roomId, nextPlayerId, nextTurn);
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
