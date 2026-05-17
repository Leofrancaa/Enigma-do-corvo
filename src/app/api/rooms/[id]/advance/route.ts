import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getPlayerBySession } from "@/lib/db/queries";
import { db } from "@/lib/db/client";
import { rooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { assertTransition } from "@/lib/game/state-machine";
import type { RoomStatus } from "@/types/game";

// Mapa de qual status avança para qual
const ADVANCE_MAP: Partial<Record<RoomStatus, RoomStatus>> = {
  CHARACTER_SELECT: "CASE_INTRO",
  RESOLUTION: "ENDED",
};

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

    const player = await getPlayerBySession(roomId, sessionId);
    if (!player?.isHost) {
      return NextResponse.json({ error: "Apenas o host pode avançar." }, { status: 403 });
    }

    const nextStatus = ADVANCE_MAP[room.status as RoomStatus];
    if (!nextStatus) {
      return NextResponse.json({ error: `Não é possível avançar do status ${room.status}.` }, { status: 409 });
    }

    assertTransition(room.status, nextStatus);
    await db.update(rooms).set({ status: nextStatus }).where(eq(rooms.id, roomId));

    return NextResponse.json({ ok: true, newStatus: nextStatus });
  } catch (err) {
    console.error("[POST /api/rooms/[id]/advance]", err);
    return NextResponse.json({ error: "Erro ao avançar fase." }, { status: 500 });
  }
}
