import { NextRequest, NextResponse } from "next/server";
import { selectCharacterSchema } from "@/lib/validation/zod-schemas";
import { getSessionId } from "@/lib/session";
import { getPlayerBySession } from "@/lib/db/queries";
import { setPlayerCharacter, insertPlayerAction } from "@/lib/db/mutations";
import { db } from "@/lib/db/client";
import { players, rooms } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const body = await req.json();
    const parsed = selectCharacterSchema.safeParse({ ...body, roomId });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { characterId, clientActionId } = parsed.data;
    const sessionId = await getSessionId();
    if (!sessionId) return NextResponse.json({ error: "Sessão não encontrada." }, { status: 401 });

    const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
    if (!room) return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
    if (room.status !== "CHARACTER_SELECT") {
      return NextResponse.json({ error: "Não é hora de selecionar personagem." }, { status: 409 });
    }

    const player = await getPlayerBySession(roomId, sessionId);
    if (!player) return NextResponse.json({ error: "Jogador não encontrado." }, { status: 403 });

    // Check if character is taken by another player (UNIQUE constraint handles it at DB level)
    const taken = await db.query.players.findFirst({
      where: and(
        eq(players.roomId, roomId),
        eq(players.characterId, characterId)
      ),
    });
    if (taken && taken.id !== player.id) {
      return NextResponse.json({ error: "Personagem já escolhido por outro jogador." }, { status: 409 });
    }

    await setPlayerCharacter(player.id, characterId);

    await insertPlayerAction({
      clientActionId,
      roomId,
      playerId: player.id,
      type: "select_character",
      payload: { characterId },
      turn: room.currentTurn,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "23505") {
      return NextResponse.json({ error: "Personagem já escolhido por outro jogador." }, { status: 409 });
    }
    console.error("[POST /api/rooms/[id]/character]", err);
    return NextResponse.json({ error: "Erro ao selecionar personagem." }, { status: 500 });
  }
}
