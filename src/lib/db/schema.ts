import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── Enums ──────────────────────────────────────────────────────────────────

export const roomStatusEnum = pgEnum("room_status", [
  "LOBBY",
  "CHARACTER_SELECT",
  "CASE_INTRO",
  "INVESTIGATION",
  "DEDUCTION",
  "RESOLUTION",
  "ENDED",
  "ABANDONED",
]);

export const transportTypeEnum = pgEnum("transport_type", [
  "drone",
  "hyperloop",
  "magrail",
]);

export const clueTypeEnum = pgEnum("clue_type", [
  "analogia",
  "anagrama",
  "cifra",
  "referencia",
  "depoimento",
  "evidencia",
  "plot_twist",
]);

export const revealsFieldEnum = pgEnum("reveals_field", [
  "who",
  "where",
  "how",
  "why",
  "context",
]);

export const difficultyEnum = pgEnum("difficulty", ["facil", "medio", "dificil"]);

export const playerActionTypeEnum = pgEnum("player_action_type", [
  "move",
  "partial_guess",
  "final_guess",
  "skip_turn",
  "ready",
  "select_character",
  "start_game",
  "end_game",
  "force_deduction",
]);

// ─── Fixed World Map ─────────────────────────────────────────────────────────

// Locations are world-fixed (7 nodes, same for every game)
export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  subtitle: text("subtitle"),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  iconUrl: text("icon_url"),
  mapX: numeric("map_x", { precision: 5, scale: 4 }).notNull().default("0.5"),
  mapY: numeric("map_y", { precision: 5, scale: 4 }).notNull().default("0.5"),
  isStartHub: boolean("is_start_hub").notNull().default(false),
});

// Connections are also world-fixed
export const locationConnections = pgTable(
  "location_connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromId: uuid("from_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    toId: uuid("to_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    transportType: transportTypeEnum("transport_type").notNull(),
  },
  (t) => [index("idx_connections_from_id").on(t.fromId)]
);

// ─── Characters ───────────────────────────────────────────────────────────────

export const characters = pgTable("characters", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  codename: text("codename").notNull(),
  specialty: text("specialty").notNull(),
  personality: text("personality").notNull(),
  description: text("description").notNull(),
  avatarUrl: text("avatar_url"),
  portraitUrl: text("portrait_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Cases ────────────────────────────────────────────────────────────────────

export const cases = pgTable("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  narrativeIntro: text("narrative_intro").notNull(),
  difficulty: difficultyEnum("difficulty").notNull().default("medio"),
  maxTurns: integer("max_turns").notNull().default(20),
  maxErrors: integer("max_errors").notNull().default(3),
  recommendedPlayersMin: integer("recommended_players_min").notNull().default(2),
  recommendedPlayersMax: integer("recommended_players_max").notNull().default(6),
  solutionWho: text("solution_who").notNull(),
  solutionWhereId: uuid("solution_where_id").references(() => locations.id),
  solutionHow: text("solution_how").notNull(),
  solutionWhy: text("solution_why").notNull(),
  solutionExplanation: text("solution_explanation").notNull(),
  // Perguntas flexíveis: [{id, label, answer}] — cada caso define as suas
  questions: jsonb("questions").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Clues reference both a case and a fixed location
export const clues = pgTable(
  "clues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id, { onDelete: "cascade" }),
    type: clueTypeEnum("type").notNull(),
    displayContent: text("display_content").notNull(),
    decodedHint: text("decoded_hint"),
    revealsField: revealsFieldEnum("reveals_field").notNull(),
    order: integer("order").notNull().default(0),
  },
  (t) => [
    index("idx_clues_case_id").on(t.caseId),
    index("idx_clues_location_id").on(t.locationId),
  ]
);

// ─── Rooms & Players ──────────────────────────────────────────────────────────

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    hostSessionId: text("host_session_id").notNull(),
    status: roomStatusEnum("status").notNull().default("LOBBY"),
    caseId: uuid("case_id").references(() => cases.id),
    currentTurn: integer("current_turn").notNull().default(0),
    maxTurns: integer("max_turns").notNull().default(20),
    errorsRemaining: integer("errors_remaining").notNull().default(3),
    currentPlayerId: uuid("current_player_id"),
    currentDice: integer("current_dice"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_rooms_code").on(t.code),
    index("idx_rooms_status").on(t.status),
  ]
);

export const players = pgTable(
  "players",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    sessionId: text("session_id").notNull(),
    nickname: text("nickname").notNull(),
    characterId: uuid("character_id").references(() => characters.id),
    currentLocationId: uuid("current_location_id").references(() => locations.id),
    gridRow: integer("grid_row").notNull().default(10),
    gridCol: integer("grid_col").notNull().default(9),
    inLocationSlug: text("in_location_slug"),
    ticketsDrone: integer("tickets_drone").notNull().default(4),
    ticketsHyperloop: integer("tickets_hyperloop").notNull().default(3),
    ticketsMagrail: integer("tickets_magrail").notNull().default(2),
    score: integer("score").notNull().default(0),
    isHost: boolean("is_host").notNull().default(false),
    isConnected: boolean("is_connected").notNull().default(true),
    turnOrder: integer("turn_order"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("idx_players_room_session").on(t.roomId, t.sessionId),
    index("idx_players_room_id").on(t.roomId),
    uniqueIndex("idx_players_room_character")
      .on(t.roomId, t.characterId)
      .where(sql`character_id IS NOT NULL`),
  ]
);

export const discoveredClues = pgTable(
  "discovered_clues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    clueId: uuid("clue_id")
      .notNull()
      .references(() => clues.id, { onDelete: "cascade" }),
    discoveredAt: timestamp("discovered_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("idx_discovered_room_clue").on(t.roomId, t.clueId),
    index("idx_discovered_room_id").on(t.roomId),
  ]
);

export const playerActions = pgTable(
  "player_actions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientActionId: uuid("client_action_id").notNull().unique(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    type: playerActionTypeEnum("type").notNull(),
    payload: jsonb("payload"),
    turn: integer("turn").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("idx_actions_client_id").on(t.clientActionId),
    index("idx_actions_room_id").on(t.roomId),
  ]
);

export const guesses = pgTable(
  "guesses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    // Respostas dinâmicas: { questionId: "resposta do jogador" }
    answers: jsonb("answers").default({}),
    correctCount: integer("correct_count").default(0),
    totalCount: integer("total_count").default(0),
    isFinal: boolean("is_final").notNull().default(false),
    isCorrect: boolean("is_correct"),
    scoreAwarded: integer("score_awarded"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("idx_guesses_room_id").on(t.roomId)]
);

// ─── Relations ───────────────────────────────────────────────────────────────

export const locationsRelations = relations(locations, ({ many }) => ({
  connectionsFrom: many(locationConnections, { relationName: "from" }),
  connectionsTo: many(locationConnections, { relationName: "to" }),
  clues: many(clues),
}));

export const locationConnectionsRelations = relations(locationConnections, ({ one }) => ({
  from: one(locations, {
    fields: [locationConnections.fromId],
    references: [locations.id],
    relationName: "from",
  }),
  to: one(locations, {
    fields: [locationConnections.toId],
    references: [locations.id],
    relationName: "to",
  }),
}));

export const casesRelations = relations(cases, ({ one, many }) => ({
  solutionLocation: one(locations, {
    fields: [cases.solutionWhereId],
    references: [locations.id],
  }),
  clues: many(clues),
  rooms: many(rooms),
}));

export const cluesRelations = relations(clues, ({ one, many }) => ({
  case: one(cases, { fields: [clues.caseId], references: [cases.id] }),
  location: one(locations, { fields: [clues.locationId], references: [locations.id] }),
  discoveries: many(discoveredClues),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  case: one(cases, { fields: [rooms.caseId], references: [cases.id] }),
  currentPlayer: one(players, {
    fields: [rooms.currentPlayerId],
    references: [players.id],
    relationName: "currentPlayer",
  }),
  players: many(players),
  actions: many(playerActions),
  guesses: many(guesses),
  discoveredClues: many(discoveredClues),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  room: one(rooms, { fields: [players.roomId], references: [rooms.id] }),
  character: one(characters, { fields: [players.characterId], references: [characters.id] }),
  currentLocation: one(locations, {
    fields: [players.currentLocationId],
    references: [locations.id],
  }),
  actions: many(playerActions),
  guesses: many(guesses),
  discoveredClues: many(discoveredClues),
}));

export const discoveredCluesRelations = relations(discoveredClues, ({ one }) => ({
  room: one(rooms, { fields: [discoveredClues.roomId], references: [rooms.id] }),
  player: one(players, { fields: [discoveredClues.playerId], references: [players.id] }),
  clue: one(clues, { fields: [discoveredClues.clueId], references: [clues.id] }),
}));

export const playerActionsRelations = relations(playerActions, ({ one }) => ({
  room: one(rooms, { fields: [playerActions.roomId], references: [rooms.id] }),
  player: one(players, { fields: [playerActions.playerId], references: [players.id] }),
}));

export const guessesRelations = relations(guesses, ({ one }) => ({
  room: one(rooms, { fields: [guesses.roomId], references: [rooms.id] }),
  player: one(players, { fields: [guesses.playerId], references: [players.id] }),
  whereLocation: one(locations, { fields: [guesses.whereId], references: [locations.id] }),
}));
