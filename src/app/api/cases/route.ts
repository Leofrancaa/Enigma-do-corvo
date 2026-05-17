import { NextResponse } from "next/server";
import { getAvailableCases } from "@/lib/db/queries";

export async function GET() {
  try {
    const cases = await getAvailableCases();
    return NextResponse.json({ cases });
  } catch (err) {
    console.error("[GET /api/cases]", err);
    return NextResponse.json({ error: "Erro ao buscar casos." }, { status: 500 });
  }
}
