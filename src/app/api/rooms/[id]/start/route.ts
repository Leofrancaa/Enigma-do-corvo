import { NextRequest, NextResponse } from "next/server";
import { startGameSchema } from "@/lib/validation/zod-schemas";
import { getSessionId } from "@/lib/session";
import { getRoomById, getPlayerBySession, getAvailableCases } from "@/lib/db/queries";
import { startRoom, insertPlayerAction, updatePlayerLocation } from "@/lib/db/mutations";
import { db } from "@/lib/db/client";
import { players } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { assertTransition } from "@/lib/game/state-machine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const body = await req.json();
    const parsed = startGameSchema.safeParse({ ...body, roomId });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const sessionId = await getSessionId();
    if (!sessionId) {
      return NextResponse.json({ error: "Sessão não encontrada." }, { status: 401 });
    }

    const room = await getRoomById(roomId);
    if (!room) return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });

    const player = await getPlayerBySession(roomId, sessionId);
    if (!player?.isHost) {
      return NextResponse.json({ error: "Apenas o host pode iniciar." }, { status: 403 });
    }

    assertTransition(room.status, "CHARACTER_SELECT");

    const roomPlayers = await db.select().from(players).where(eq(players.roomId, roomId));
    if (roomPlayers.length < 2) {
      return NextResponse.json({ error: "Mínimo 2 jogadores para iniciar." }, { status: 400 });
    }

    // Pick case
    let caseId = parsed.data.caseId;
    if (!caseId) {
      const allCases = await getAvailableCases();
      if (allCases.length === 0) {
        return NextResponse.json({ error: "Nenhum caso disponível." }, { status: 500 });
      }
      const idx = Math.floor(Math.random() * allCases.length);
      caseId = allCases[idx].id;
    }

    // Assign turn order
    const shuffled = [...roomPlayers].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length; i++) {
      await db.update(players).set({ turnOrder: i }).where(eq(players.id, shuffled[i].id));
    }

    const firstPlayerId = shuffled[0].id;

    await startRoom(roomId, caseId, 20, 3, firstPlayerId);

    await insertPlayerAction({
      clientActionId: crypto.randomUUID(),
      roomId,
      playerId: player.id,
      type: "start_game",
      payload: { caseId },
      turn: 0,
    });

    return NextResponse.json({ ok: true, caseId });
  } catch (err) {
    console.error("[POST /api/rooms/[id]/start]", err);
    return NextResponse.json({ error: "Erro ao iniciar partida." }, { status: 500 });
  }
}
