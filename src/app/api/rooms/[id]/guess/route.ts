import { NextRequest, NextResponse } from "next/server";
import { guessSchema } from "@/lib/validation/zod-schemas";
import { getSessionId } from "@/lib/session";
import { getPlayerBySession } from "@/lib/db/queries";
import { insertPlayerAction, decrementErrors } from "@/lib/db/mutations";
import { db } from "@/lib/db/client";
import { cases, guesses, rooms } from "@/lib/db/schema";
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

    const { answers, isFinal, clientActionId } = parsed.data;
    const sessionId = await getSessionId();
    if (!sessionId) return NextResponse.json({ error: "Sessão não encontrada." }, { status: 401 });

    const room = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
    if (!room) return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });

    const allowedStatuses = isFinal ? ["DEDUCTION"] : ["INVESTIGATION", "DEDUCTION"];
    if (!allowedStatuses.includes(room.status)) {
      return NextResponse.json({ error: "Não é possível fazer dedução agora." }, { status: 409 });
    }

    const player = await getPlayerBySession(roomId, sessionId);
    if (!player) return NextResponse.json({ error: "Jogador não encontrado." }, { status: 403 });

    if (!room.caseId) return NextResponse.json({ error: "Caso não atribuído à sala." }, { status: 500 });

    // Fetch the full case with questions (including answers — server only)
    const caseData = await db.query.cases.findFirst({ where: eq(cases.id, room.caseId) });
    if (!caseData) return NextResponse.json({ error: "Caso não encontrado." }, { status: 500 });

    const questions = (caseData.questions as Array<{ id: string; label: string; answer: string }>) ?? [];

    // Check each answer case-insensitively
    let correctCount = 0;
    const totalCount = questions.length;
    const resultDetails: Record<string, { correct: boolean; correctAnswer: string }> = {};

    for (const q of questions) {
      const submitted = (answers[q.id] ?? "").trim().toLowerCase();
      const expected = q.answer.trim().toLowerCase();
      // Accept if submitted answer contains the key term or vice versa
      const correct = submitted === expected
        || submitted.includes(expected)
        || expected.includes(submitted);
      if (correct) correctCount++;
      resultDetails[q.id] = { correct, correctAnswer: q.answer };
    }

    const isCorrect = correctCount === totalCount && totalCount > 0;

    const score = computeScore({
      correctFields: correctCount,
      totalTurns: room.currentTurn,
      maxTurns: room.maxTurns,
      errorsUsed: room.maxTurns - room.errorsRemaining,
      maxErrors: 3,
    });

    // Insert guess with dynamic answers
    await db.insert(guesses).values({
      roomId,
      playerId: player.id,
      answers: answers as any,
      correctCount,
      totalCount,
      isFinal,
      isCorrect,
      scoreAwarded: score,
    });

    await insertPlayerAction({
      clientActionId,
      roomId,
      playerId: player.id,
      type: isFinal ? "final_guess" : "partial_guess",
      payload: { answers, isCorrect, correctCount, totalCount },
      turn: room.currentTurn,
    });

    // Partial guess penalty
    if (!isFinal && !isCorrect) {
      await decrementErrors(roomId);
      const refreshed = await db.query.rooms.findFirst({ where: eq(rooms.id, roomId) });
      if (refreshed && refreshed.errorsRemaining <= 0) {
        await db.update(rooms).set({ status: "RESOLUTION" }).where(eq(rooms.id, roomId));
        return NextResponse.json({
          isCorrect, correctCount, totalCount, score,
          resultDetails,
          transitionedTo: "RESOLUTION",
        });
      }
    }

    return NextResponse.json({ isCorrect, correctCount, totalCount, score, resultDetails });
  } catch (err) {
    console.error("[POST /api/rooms/[id]/guess]", err);
    return NextResponse.json({ error: "Erro ao registrar dedução." }, { status: 500 });
  }
}
