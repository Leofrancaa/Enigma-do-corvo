import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getPlayerBySession } from "@/lib/db/queries";
import { db } from "@/lib/db/client";
import { rooms, players } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { assertTransition } from "@/lib/game/state-machine";
import { CHARACTER_START, DEFAULT_START } from "@/lib/game/board";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const sessionId = await getSessionId();
    if (!sessionId) return NextResponse.json({ error: "Sessão não encontrada." }, { status: 401 });

    const room = await db.query.rooms.findFirst({
      where: eq(rooms.id, roomId),
      with: { players: { with: { character: true } } },
    });
    if (!room) return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });

    const player = await getPlayerBySession(roomId, sessionId);
    if (!player?.isHost) {
      return NextResponse.json({ error: "Apenas o host pode avançar." }, { status: 403 });
    }

    assertTransition(room.status, "INVESTIGATION");

    // Set initial grid positions based on character
    for (const p of room.players) {
      const slug = p.character?.slug ?? "";
      const [row, col] = CHARACTER_START[slug] ?? DEFAULT_START;
      await db.update(players).set({ gridRow: row, gridCol: col, inLocationSlug: null }).where(eq(players.id, p.id));
    }

    await db.update(rooms).set({ status: "INVESTIGATION" }).where(eq(rooms.id, roomId));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/rooms/[id]/case-intro]", err);
    return NextResponse.json({ error: "Erro ao iniciar investigação." }, { status: 500 });
  }
}
