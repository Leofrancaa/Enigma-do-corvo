import { NextRequest, NextResponse } from "next/server";
import { createRoomSchema } from "@/lib/validation/zod-schemas";
import { getOrCreateSessionId } from "@/lib/session";
import { createRoom, createPlayer } from "@/lib/db/mutations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createRoomSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { nickname, caseId } = parsed.data;
    const sessionId = await getOrCreateSessionId();

    const room = await createRoom(sessionId, caseId);
    await createPlayer({ roomId: room.id, sessionId, nickname, isHost: true });

    return NextResponse.json({ roomId: room.id, code: room.code });
  } catch (err) {
    console.error("[POST /api/rooms]", err);
    return NextResponse.json({ error: "Erro ao criar sala." }, { status: 500 });
  }
}
