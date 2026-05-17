import { NextRequest, NextResponse } from "next/server";
import { joinRoomSchema } from "@/lib/validation/zod-schemas";
import { getOrCreateSessionId } from "@/lib/session";
import { getRoomByCode, getPlayerBySession } from "@/lib/db/queries";
import { createPlayer } from "@/lib/db/mutations";
import { eq, count } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { players } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = joinRoomSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { code, nickname } = parsed.data;
    const sessionId = await getOrCreateSessionId();

    const room = await getRoomByCode(code);
    if (!room) {
      return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
    }

    if (room.status !== "LOBBY") {
      return NextResponse.json({ error: "Esta partida já começou." }, { status: 409 });
    }

    // Check if already in room
    const existing = await getPlayerBySession(room.id, sessionId);
    if (existing) {
      return NextResponse.json({ roomId: room.id });
    }

    // Max 6 players
    const [{ value: playerCount }] = await db
      .select({ value: count() })
      .from(players)
      .where(eq(players.roomId, room.id));

    if (Number(playerCount) >= 6) {
      return NextResponse.json({ error: "Sala cheia (máx. 6 jogadores)." }, { status: 409 });
    }

    await createPlayer({ roomId: room.id, sessionId, nickname, isHost: false });

    return NextResponse.json({ roomId: room.id });
  } catch (err) {
    console.error("[POST /api/rooms/[id]/join]", err);
    return NextResponse.json({ error: "Erro ao entrar na sala." }, { status: 500 });
  }
}
