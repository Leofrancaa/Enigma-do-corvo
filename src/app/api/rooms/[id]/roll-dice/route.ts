import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getPlayerBySession } from "@/lib/db/queries";
import { db } from "@/lib/db/client";
import { rooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rollDice } from "@/lib/game/rules";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const sessionId = await getSessionId();
    if (!sessionId) return NextResponse.json({ error: "Sessão não encontrada." }, { status: 401 });

    const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
    if (!room) return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
    if (room.status !== "INVESTIGATION") {
      return NextResponse.json({ error: "Não é fase de investigação." }, { status: 409 });
    }

    const player = await getPlayerBySession(roomId, sessionId);
    if (!player) return NextResponse.json({ error: "Jogador não encontrado." }, { status: 403 });
    if (player.id !== room.currentPlayerId) {
      return NextResponse.json({ error: "Não é a sua vez." }, { status: 403 });
    }
    if (room.currentDice !== null) {
      return NextResponse.json({ error: "Você já rolou o dado neste turno.", dice: room.currentDice }, { status: 409 });
    }

    const dice = rollDice();
    await db.update(rooms).set({ currentDice: dice }).where(eq(rooms.id, roomId));

    return NextResponse.json({ dice });
  } catch (err) {
    console.error("[POST /api/rooms/[id]/roll-dice]", err);
    return NextResponse.json({ error: "Erro ao rolar dado." }, { status: 500 });
  }
}
