import type { SpecialKind, SpecialPack } from "./special-rounds";
import type {
  AgeBand,
  GroupType,
  QuestionIntensity,
} from "./questions";

export const GAME_API_URL =
  process.env.NEXT_PUBLIC_GAME_API_URL?.replace(/\/$/, "") ??
  "https://juego-familia-ech.socampoecheverry.workers.dev";

export type RoomPlayer = {
  id: string;
  name: string;
  connected: boolean;
  ready: boolean;
  joinedAt: string;
};

export type RoomSettings = {
  groupType: GroupType;
  youngestAge: AgeBand;
  maxIntensity: QuestionIntensity;
  specialEvery: 0 | 3;
  specialModes: SpecialKind[];
  specialPacks: SpecialPack[];
};

export type SpecialSnapshot = {
  kind: SpecialKind;
  cardIndex: number;
  turnNumber: number;
  startedAt: string;
  revealed: boolean;
  voteCount: number;
  contributorCount: number;
  tally: Record<string, number> | null;
  abstainCount: number | null;
};

export type PrivatePlayerState = {
  turnNumber: number | null;
  reaction: ReactionType | null;
  saved: boolean;
  specialChoice: string | null;
  contributed: boolean;
};

export type ReactionType = "heart" | "laugh" | "clap" | "wow";

export type ReactionCounts = Record<ReactionType, number>;

export type SavedMoment = {
  turnNumber: number;
  playerId: string;
  questionIndex: number;
  savedCount: number;
  createdAt: string;
};

export type RoomGameState = {
  deckVersion: string;
  currentPlayerId: string;
  questionIndex: number | null;
  turnNumber: number;
  revealed: boolean;
  usedQuestionCount: number;
  questionPoolSize: number;
  special: SpecialSnapshot | null;
  specialHistory: { kind: SpecialKind; turnNumber: number }[];
  currentReactions: ReactionCounts;
  reactionTotals: ReactionCounts;
  savedMoments: SavedMoment[];
  startedAt: string;
  finishedAt: string | null;
  finishReason: "deck-complete" | "host-ended" | null;
};

export type RoomSnapshot = {
  code: string;
  status: "lobby" | "playing" | "finished";
  hostId: string;
  createdAt: string;
  version: number;
  canStart: boolean;
  settings: RoomSettings;
  players: RoomPlayer[];
  game: RoomGameState | null;
};

export type RoomSession = {
  code: string;
  playerId: string;
  token: string;
  name: string;
};

type RoomAuthResponse = {
  code: string;
  playerId: string;
  token: string;
  room: RoomSnapshot;
};

export type ClientRoomEvent =
  | { type: "sync" }
  | { type: "ready"; ready: boolean }
  | { type: "settings"; settings: RoomSettings }
  | { type: "display-token" }
  | { type: "start"; deckVersion: string; questionPool: number[] }
  | { type: "reveal"; expectedTurnNumber: number }
  | { type: "skip-question"; expectedTurnNumber: number }
  | { type: "next-turn"; expectedTurnNumber: number }
  | { type: "special-now"; kind: SpecialKind; expectedTurnNumber: number }
  | { type: "special-vote"; choice: string; expectedTurnNumber: number }
  | { type: "special-reveal"; expectedTurnNumber: number }
  | { type: "special-contribute"; expectedTurnNumber: number }
  | {
      type: "react";
      reaction: ReactionType | null;
      expectedTurnNumber: number;
    }
  | {
      type: "save-moment";
      saved: boolean;
      expectedTurnNumber: number;
    }
  | { type: "play-again" }
  | { type: "finish" }
  | { type: "leave" };

export function normalizeRoomCode(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

async function postRoom(
  path: string,
  body: Record<string, string>,
): Promise<RoomAuthResponse> {
  const response = await fetch(GAME_API_URL + path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as
    | RoomAuthResponse
    | { error?: string };

  if (!response.ok || !("room" in payload)) {
    const code = "error" in payload ? payload.error : undefined;
    throw new Error(code ?? "No pudimos conectar con la sala.");
  }

  return payload;
}

export async function createOnlineRoom(
  name: string,
): Promise<{ session: RoomSession; room: RoomSnapshot }> {
  const payload = await postRoom("/api/rooms", { name });
  return {
    session: {
      code: payload.code,
      playerId: payload.playerId,
      token: payload.token,
      name,
    },
    room: payload.room,
  };
}

export async function joinOnlineRoom(
  code: string,
  name: string,
): Promise<{ session: RoomSession; room: RoomSnapshot }> {
  const normalized = normalizeRoomCode(code);
  if (normalized.length !== 6) {
    throw new Error("El código debe tener 6 caracteres.");
  }

  const payload = await postRoom("/api/rooms/" + normalized + "/join", { name });
  return {
    session: {
      code: payload.code,
      playerId: payload.playerId,
      token: payload.token,
      name,
    },
    room: payload.room,
  };
}

function storageKey(code: string): string {
  return "jfe:room:" + normalizeRoomCode(code);
}

export function saveRoomSession(session: RoomSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(session.code), JSON.stringify(session));
}

export function clearRoomSession(code: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(code));
}

export function loadRoomSession(code: string): RoomSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(storageKey(code));
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as Partial<RoomSession>;
    if (
      normalizeRoomCode(value.code ?? "") !== normalizeRoomCode(code) ||
      !value.playerId ||
      !value.token ||
      !value.name
    ) {
      return null;
    }

    return {
      code: normalizeRoomCode(value.code ?? ""),
      playerId: value.playerId,
      token: value.token,
      name: value.name,
    };
  } catch {
    return null;
  }
}

export function buildRoomWebSocketUrl(
  session: RoomSession,
  apiUrl = GAME_API_URL,
): string {
  const url = new URL(
    apiUrl.replace(/\/$/, "") +
      "/api/rooms/" +
      normalizeRoomCode(session.code) +
      "/ws",
  );
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("playerId", session.playerId);
  url.searchParams.set("token", session.token);
  return url.toString();
}

export function buildDisplayWebSocketUrl(
  code: string,
  token: string,
  apiUrl = GAME_API_URL,
): string {
  const url = new URL(
    apiUrl.replace(/\/$/, "") +
      "/api/rooms/" +
      normalizeRoomCode(code) +
      "/display/ws",
  );
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);
  return url.toString();
}

export function sendRoomEvent(
  socket: WebSocket | null,
  event: ClientRoomEvent,
): boolean {
  if (!socket || socket.readyState !== WebSocket.OPEN) return false;
  socket.send(JSON.stringify(event));
  return true;
}

export function roomErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    NAME_REQUIRED: "Escribe tu nombre para continuar.",
    ROOM_NOT_FOUND: "Esa sala no existe o ya expiró.",
    ROOM_ALREADY_STARTED: "La partida ya comenzó.",
    ROOM_FULL: "La sala ya está llena.",
    NAME_TAKEN: "Ese nombre ya está usado en la sala.",
    UNAUTHORIZED_PLAYER: "Tu acceso a esta sala ya no es válido.",
    HOST_ONLY: "Solo el anfitrión puede hacer eso.",
    ROOM_NOT_READY: "Todos deben estar conectados y marcarse como listos.",
    GAME_ALREADY_STARTED: "La partida ya comenzó.",
    GAME_NOT_PLAYING: "La partida no está activa.",
    PLAYER_NOT_FOUND: "Tu jugador ya no está en esta sala.",
    TURN_CONTROL_ONLY:
      "Solo la persona del turno o el anfitrión pueden controlar esta ronda.",
    STALE_TURN: "Ese turno ya cambió. Actualizamos la partida.",
    REVEAL_FIRST: "Revela la pregunta antes de pasar a la siguiente persona.",
    DECK_VERSION_MISMATCH:
      "Tu mazo de preguntas está desactualizado. Recarga la página.",
    INVALID_QUESTION_POOL:
      "Los filtros dejaron muy pocas preguntas. Ajusta edad o intensidad.",
    UNAUTHORIZED_DISPLAY:
      "El enlace de pantalla central no es válido o ya expiró.",
    DISPLAY_READ_ONLY:
      "La pantalla central es de solo lectura.",
    INVALID_REACTION:
      "Esa reacción no está disponible.",
    INVALID_NAME:
      "Usa un nombre de 1 a 24 caracteres, sin controles invisibles.",
    INVALID_JSON:
      "La solicitud no tiene un formato válido.",
    REQUEST_TOO_LARGE:
      "La solicitud es demasiado grande.",
    UNSUPPORTED_MEDIA_TYPE:
      "El servidor esperaba datos JSON.",
    INVALID_SETTINGS:
      "La configuración de la ronda no es válida.",
    MESSAGE_TOO_LARGE:
      "Ese mensaje es demasiado grande.",
    RATE_LIMITED:
      "Demasiadas acciones seguidas. Espera unos segundos e inténtalo otra vez.",
    GAME_NOT_FINISHED: "Primero termina la partida para volver al lobby.",
    SPECIAL_DISABLED: "Esta ronda especial está desactivada por el anfitrión.",
    SPECIAL_NO_ELIGIBLE_CARD: "Ninguna carta de esta modalidad cumple los filtros actuales. Cambia el pack, la edad o la intensidad.",
    SPECIAL_NOT_AVAILABLE: "Esta ronda ya terminó o todavía no está disponible.",
    SPECIAL_ACTIVE: "Termina u omite primero la ronda sorpresa.",
    INVALID_SPECIAL: "La ronda sorpresa elegida no es válida.",
    INVALID_SPECIAL_VOTE: "Esta opción de votación no es válida.",
  };
  return messages[code] ?? code;
}
