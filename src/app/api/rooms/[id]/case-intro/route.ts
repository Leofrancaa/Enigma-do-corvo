import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getPlayerBySession, getCaseWithLocations } from "@/lib/db/queries";
import { db } from "@/lib/db/client";
import { rooms, players } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { assertTransition } from "@/lib/game/state-machine";

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

    assertTransition(room.status, "INVESTIGATION");

    // Set start hub location for all players
    const caseData = await getCaseWithLocations(room.caseId!);
    const hub = caseData?.locations.find((l) => l.isStartHub);

    if (hub) {
      const roomPlayers = await db.select().from(players).where(eq(players.roomId, roomId));
      for (const p of roomPlayers) {
        await db.update(players).set({ currentLocationId: hub.id }).where(eq(players.id, p.id));
      }
    }

    await db.update(rooms).set({ status: "INVESTIGATION" }).where(eq(rooms.id, roomId));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/rooms/[id]/case-intro]", err);
    return NextResponse.json({ error: "Erro ao iniciar investigação." }, { status: 500 });
  }
}
