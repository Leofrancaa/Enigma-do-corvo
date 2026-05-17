import { NextRequest, NextResponse } from "next/server";
import { guessSchema } from "@/lib/validation/zod-schemas";
import { getSessionId } from "@/lib/session";
import { getPlayerBySession, getCaseSolution, getSolutionLocation } from "@/lib/db/queries";
import { insertGuess, insertPlayerAction, decrementErrors } from "@/lib/db/mutations";
import { db } from "@/lib/db/client";
import { rooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { computeScore } from "@/lib/game/rules";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const body = await req.json();
    const parsed = guessSchema.safeParse({ ...body, roomId });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { who, whereId, how, why, isFinal, clientActionId } = parsed.data;
    const sessionId = await getSessionId();
    if (!sessionId) return NextResponse.json({ error: "Sessão não encontrada." }, { status: 401 });

    const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
    if (!room) return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });

    const allowedStatuses = isFinal
      ? ["DEDUCTION"]
      : ["INVESTIGATION", "DEDUCTION"];

    if (!allowedStatuses.includes(room.status)) {
      return NextResponse.json({ error: "Não é possível fazer palpite agora." }, { status: 409 });
    }

    const player = await getPlayerBySession(roomId, sessionId);
    if (!player) return NextResponse.json({ error: "Jogador não encontrado." }, { status: 403 });

    const solution = await getCaseSolution(room.caseId!);
    const solutionLocation = await getSolutionLocation(room.caseId!);

    if (!solution || !solutionLocation) {
      return NextResponse.json({ error: "Solução do caso não encontrada." }, { status: 500 });
    }

    const whoCorrect = who.trim().toLowerCase() === solution.solutionWho.toLowerCase();
    const whereCorrect = whereId === solutionLocation.id;
    const howCorrect = how.trim().toLowerCase() === solution.solutionHow.toLowerCase();
    const whyCorrect = why.trim().toLowerCase() === solution.solutionWhy.toLowerCase();

    const correctCount = [whoCorrect, whereCorrect, howCorrect, whyCorrect].filter(Boolean).length;
    const isCorrect = correctCount === 4;

    const score = computeScore({
      correctFields: correctCount,
      totalTurns: room.currentTurn,
      maxTurns: room.maxTurns,
      errorsUsed: (room.maxTurns - room.errorsRemaining), // approximate
      maxErrors: 3,
    });

    await insertGuess({
      roomId,
      playerId: player.id,
      who,
      whereId,
      how,
      why,
      isFinal,
      isCorrect,
      scoreAwarded: score,
    });

    await insertPlayerAction({
      clientActionId,
      roomId,
      playerId: player.id,
      type: isFinal ? "final_guess" : "partial_guess",
      payload: { who, whereId, how, why, isCorrect, correctCount },
      turn: room.currentTurn,
    });

    // Partial guess penalty
    if (!isFinal && !isCorrect) {
      await decrementErrors(roomId);
      const refreshed = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
      if (refreshed && refreshed.errorsRemaining <= 0) {
        await db.update(rooms).set({ status: "RESOLUTION" }).where(eq(rooms.id, roomId));
        return NextResponse.json({
          isCorrect,
          correctCount,
          score,
          transitionedTo: "RESOLUTION",
          message: "Erros esgotados. Resolução automática.",
        });
      }
    }

    return NextResponse.json({ isCorrect, correctCount, score });
  } catch (err) {
    console.error("[POST /api/rooms/[id]/guess]", err);
    return NextResponse.json({ error: "Erro ao registrar palpite." }, { status: 500 });
  }
}
