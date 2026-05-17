import { NextRequest, NextResponse } from "next/server";
import { forceDeductionSchema } from "@/lib/validation/zod-schemas";
import { getSessionId } from "@/lib/session";
import { getPlayerBySession } from "@/lib/db/queries";
import { db } from "@/lib/db/client";
import { rooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { assertTransition } from "@/lib/game/state-machine";

export async function POST(
  req: NextRequest,
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
      return NextResponse.json({ error: "Apenas o host pode forçar dedução." }, { status: 403 });
    }

    assertTransition(room.status, "DEDUCTION");

    await db.update(rooms).set({ status: "DEDUCTION" }).where(eq(rooms.id, roomId));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/rooms/[id]/deduction]", err);
    return NextResponse.json({ error: "Erro ao iniciar dedução." }, { status: 500 });
  }
}
