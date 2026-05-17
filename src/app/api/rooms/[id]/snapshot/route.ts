import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getRoomSnapshot } from "@/lib/db/queries";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const sessionId = await getSessionId();

    if (!sessionId) {
      return NextResponse.json({ error: "Sessão não encontrada." }, { status: 401 });
    }

    const snapshot = await getRoomSnapshot(roomId, sessionId);

    if (!snapshot) {
      return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
    }

    return NextResponse.json(snapshot);
  } catch (err) {
    console.error("[GET /api/rooms/[id]/snapshot]", err);
    return NextResponse.json({ error: "Erro ao buscar estado da sala." }, { status: 500 });
  }
}
