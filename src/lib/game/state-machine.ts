import type { roomStatusEnum } from "@/lib/db/schema";

type RoomStatus = (typeof roomStatusEnum.enumValues)[number];

// Valid transitions: from -> allowed next states
const TRANSITIONS: Record<RoomStatus, RoomStatus[]> = {
  LOBBY: ["CHARACTER_SELECT", "ABANDONED"],
  CHARACTER_SELECT: ["CASE_INTRO", "LOBBY", "ABANDONED"],
  CASE_INTRO: ["INVESTIGATION", "ABANDONED"],
  INVESTIGATION: ["DEDUCTION", "RESOLUTION", "ABANDONED"],
  DEDUCTION: ["RESOLUTION", "ABANDONED"],
  RESOLUTION: ["LOBBY", "ENDED"],
  ENDED: [],
  ABANDONED: [],
};

export function canTransition(from: RoomStatus, to: RoomStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: RoomStatus, to: RoomStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid transition: ${from} -> ${to}`);
  }
}

export function isTerminal(status: RoomStatus): boolean {
  return status === "ENDED" || status === "ABANDONED";
}

export function isGameActive(status: RoomStatus): boolean {
  return (
    status === "INVESTIGATION" || status === "DEDUCTION" || status === "RESOLUTION"
  );
}
