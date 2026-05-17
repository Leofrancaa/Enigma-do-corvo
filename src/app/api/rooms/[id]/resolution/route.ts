import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getPlayerBySession, getCaseSolution, getSolutionLocation } from "@/lib/db/queries";
import { db } from "@/lib/db/client";
import { rooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const sessionId = await getSessionId();
    if (!sessionId) return NextResponse.json({ error: "Sessão não encontrada." }, { status: 401 });

    const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
    if (!room) return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });

    // Only reveal solution in RESOLUTION or ENDED state
    if (room.status !== "RESOLUTION" && room.status !== "ENDED") {
      return NextResponse.json({ error: "Solução não disponível ainda." }, { status: 403 });
    }

    const player = await getPlayerBySession(roomId, sessionId);
    if (!player) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

    const solution = await getCaseSolution(room.caseId!);
    const solutionLocation = await getSolutionLocation(room.caseId!);

    if (!solution) return NextResponse.json({ error: "Solução não encontrada." }, { status: 404 });

    return NextResponse.json({
      ...solution,
      solutionWhereName: solutionLocation?.name ?? "Desconhecido",
    });
  } catch (err) {
    console.error("[GET /api/rooms/[id]/resolution]", err);
    return NextResponse.json({ error: "Erro ao buscar resolução." }, { status: 500 });
  }
}
