import { redirect } from "next/navigation";
import { getSessionId } from "@/lib/session";
import { getRoomSnapshot } from "@/lib/db/queries";
import { RoomShell } from "./RoomShell";
import type { GameSnapshot } from "@/types/game";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RoomPage({ params }: Props) {
  const { id: roomId } = await params;
  const sessionId = await getSessionId();

  if (!sessionId) redirect("/");

  const snapshot = await getRoomSnapshot(roomId, sessionId);
  if (!snapshot) redirect("/");
  if (!snapshot.me) redirect("/");

  // Dates are serialized to strings by Next.js RSC boundary — cast is safe
  return <RoomShell initialSnapshot={snapshot as unknown as GameSnapshot} sessionId={sessionId} roomId={roomId} />;
}
