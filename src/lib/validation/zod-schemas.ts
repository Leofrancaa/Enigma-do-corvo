import { z } from "zod";

const uuidSchema = z.string().uuid();

const nicknameSchema = z
  .string()
  .min(2, "Mínimo 2 caracteres")
  .max(20, "Máximo 20 caracteres")
  .regex(/^[\p{L}\p{N} _-]+$/u, "Apenas letras, números, espaços, _ e -");

// ─── Room ─────────────────────────────────────────────────────────────────────

export const createRoomSchema = z.object({
  nickname: nicknameSchema,
  caseId: uuidSchema.optional(),
});

export const joinRoomSchema = z.object({
  code: z.string().length(6).toUpperCase(),
  nickname: nicknameSchema,
});

export const startGameSchema = z.object({
  roomId: uuidSchema,
  caseId: uuidSchema.optional(),
});

export const endGameSchema = z.object({
  roomId: uuidSchema,
});

// ─── Character ───────────────────────────────────────────────────────────────

export const selectCharacterSchema = z.object({
  roomId: uuidSchema,
  characterId: uuidSchema,
  clientActionId: uuidSchema,
});

// ─── Movement ────────────────────────────────────────────────────────────────

export const moveSchema = z.object({
  roomId: uuidSchema,
  toLocationId: uuidSchema,
  transportType: z.enum(["drone", "hyperloop", "magrail"]),
  clientActionId: uuidSchema,
});

// ─── Guess ───────────────────────────────────────────────────────────────────

export const guessSchema = z.object({
  roomId: uuidSchema,
  answers: z.record(z.string(), z.string().min(1).max(300)),
  isFinal: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
  clientActionId: uuidSchema,
});

// ─── Force Deduction ─────────────────────────────────────────────────────────

export const forceDeductionSchema = z.object({
  roomId: uuidSchema,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
export type StartGameInput = z.infer<typeof startGameSchema>;
export type MoveInput = z.infer<typeof moveSchema>;
export type GuessInput = z.infer<typeof guessSchema>;
export type SelectCharacterInput = z.infer<typeof selectCharacterSchema>;
