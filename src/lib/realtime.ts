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

export type RoomGameState = {
  deckVersion: string;
  currentPlayerId: string;
  questionIndex: number;
  turnNumber: number;
  revealed: boolean;
};

export type RoomSnapshot = {
  code: string;
  status: "lobby" | "playing" | "finished";
  hostId: string;
  createdAt: string;
  version: number;
  canStart: boolean;
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
  | { type: "start" }
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
    HOST_ONLY: "Solo el anfitrión puede iniciar la partida.",
    ROOM_NOT_READY: "Todos deben estar conectados y marcarse como listos.",
    GAME_ALREADY_STARTED: "La partida ya comenzó.",
    PLAYER_NOT_FOUND: "Tu jugador ya no está en esta sala.",
  };
  return messages[code] ?? code;
}
