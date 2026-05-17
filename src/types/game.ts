// Shared game types used across client and server

export type RoomStatus =
  | "LOBBY"
  | "CHARACTER_SELECT"
  | "CASE_INTRO"
  | "INVESTIGATION"
  | "DEDUCTION"
  | "RESOLUTION"
  | "ENDED"
  | "ABANDONED";

export type TransportType = "drone" | "hyperloop" | "magrail";
export type ClueType =
  | "analogia"
  | "anagrama"
  | "cifra"
  | "referencia"
  | "depoimento"
  | "evidencia"
  | "plot_twist";
export type RevealsField = "who" | "where" | "how" | "why" | "context";
export type Difficulty = "facil" | "medio" | "dificil";

export interface Character {
  id: string;
  name: string;
  slug: string;
  codename: string;
  specialty: string;
  personality: string;
  description: string;
  loreShort?: string;
  avatarUrl: string | null;
  portraitUrl: string | null;
}

export interface Location {
  id: string;
  caseId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  mapX: string;
  mapY: string;
  isStartHub: boolean;
  isSolutionWhere: boolean;
}

export interface LocationConnection {
  id: string;
  caseId: string;
  fromId: string;
  toId: string;
  transportType: TransportType;
}

export interface Clue {
  id: string;
  caseId: string;
  locationId: string;
  type: ClueType;
  displayContent: string;
  decodedHint: string | null;
  revealsField: RevealsField;
  order: number;
  discoveredAt?: string;
}

export interface Player {
  id: string;
  roomId: string;
  sessionId: string;
  nickname: string;
  characterId: string | null;
  character: Character | null;
  currentLocationId: string | null;
  currentLocation: Location | null;
  ticketsDrone: number;
  ticketsHyperloop: number;
  ticketsMagrail: number;
  score: number;
  isHost: boolean;
  isConnected: boolean;
  turnOrder: number | null;
  joinedAt: string;
}

export interface CasePublic {
  id: string;
  slug: string;
  title: string;
  narrativeIntro: string;
  difficulty: Difficulty;
  maxTurns: number;
  maxErrors: number;
  // locations and connections are world-fixed, see WorldMap
}

export interface WorldMap {
  locations: Location[];
  connections: LocationConnection[];
}

export interface Room {
  id: string;
  code: string;
  status: RoomStatus;
  caseId: string | null;
  case: CasePublic | null;
  currentTurn: number;
  maxTurns: number;
  errorsRemaining: number;
  currentPlayerId: string | null;
  players: Player[];
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  hostSessionId?: string;
}

export interface GameSnapshot {
  room: Room;
  worldMap: WorldMap;
  discoveredClues: Clue[];
  allCharacters?: Character[];
  me: Player | null;
}

// Realtime broadcast event types
export type GameEvent =
  | { type: "PLAYER_MOVED"; playerId: string; toLocationId: string; transportType: TransportType }
  | { type: "CLUE_DISCOVERED"; clueId: string; locationId: string }
  | { type: "TURN_ADVANCED"; currentPlayerId: string; turn: number }
  | { type: "STATUS_CHANGED"; status: RoomStatus }
  | { type: "PLAYER_CONNECTED"; playerId: string }
  | { type: "PLAYER_DISCONNECTED"; playerId: string }
  | { type: "HOST_CHANGED"; newHostId: string };
