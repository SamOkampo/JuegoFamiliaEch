import { DurableObject } from "cloudflare:workers";
import {
  AGE_BANDS,
  consumeFixedWindow,
  DECK_VERSION,
  GROUP_TYPES,
  INTENSITIES,
  isOpaqueToken,
  isUuid,
  MAX_WS_MESSAGE_BYTES,
  QUESTION_COUNT,
  REACTION_TYPES,
  readJsonObject,
  validateClientEvent,
  validatePlayerName,
  validateQuestionPool,
  validateRoomSettings,
} from "./security.mjs";

const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_PLAYERS = 12;
const ROOM_TTL_MS = 12 * 60 * 60 * 1000;
const SOCKET_EVENT_LIMIT = 60;
const SOCKET_EVENT_WINDOW_MS = 10_000;
const RATE_LIMIT_STORAGE_TTL_MS = 20 * 60 * 1000;
const DEFAULT_ROOM_SETTINGS = {
  groupType: "family",
  youngestAge: 12,
  maxIntensity: 2,
};

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...corsHeaders(),
    },
  });
}

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders())) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
    webSocket: response.webSocket,
  });
}

function writeProductMetric(env, event, { blobs = [], doubles = [] } = {}) {
  try {
    env.PRODUCT_ANALYTICS?.writeDataPoint({
      indexes: [event],
      blobs: [event, ...blobs],
      doubles,
    });
  } catch {
    // Analytics must never break gameplay.
  }
}

const CLIENT_TELEMETRY_EVENTS = [
  "client_error_runtime",
  "client_error_promise",
  "client_error_resource",
  "pwa_installed",
];

const CLIENT_TELEMETRY_SURFACES = [
  "home",
  "online",
  "room",
  "display",
  "offline",
  "privacy",
  "terms",
  "other",
];

async function recordClientTelemetry(request, env) {
  const parsed = await readJsonObject(request);
  if (!parsed.ok) return inputError(parsed);

  const event = String(parsed.data?.event ?? "");
  const surface = String(parsed.data?.surface ?? "");

  if (
    !CLIENT_TELEMETRY_EVENTS.includes(event) ||
    !CLIENT_TELEMETRY_SURFACES.includes(surface)
  ) {
    return json({ error: "INVALID_TELEMETRY" }, 400);
  }

  writeProductMetric(env, event, { blobs: [surface] });
  return json({ ok: true }, 202);
}

function normalizeRoomCode(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

function randomRoomCode() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let code = "";
  for (const byte of bytes) {
    code += ROOM_ALPHABET[byte % ROOM_ALPHABET.length];
  }
  return code;
}

function secureRandomIndex(length) {
  if (length <= 1) return 0;
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % length;
}

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function canStartRoom(room) {
  return (
    room.status === "lobby" &&
    room.players.length >= 2 &&
    room.players.every((player) => player.connected && player.ready)
  );
}

function nextPlayerId(room) {
  if (!room.game || room.players.length === 0) return null;

  const currentIndex = room.players.findIndex(
    (player) => player.id === room.game.currentPlayerId,
  );
  const start = currentIndex >= 0 ? currentIndex : 0;

  for (let offset = 1; offset <= room.players.length; offset += 1) {
    const candidate = room.players[(start + offset) % room.players.length];
    if (candidate?.connected) return candidate.id;
  }

  return room.players[(start + 1) % room.players.length]?.id ?? null;
}

function nextUnusedQuestionIndex(game) {
  const used = new Set(game.usedQuestionIndexes ?? []);
  const available = (game.questionPool ?? []).filter(
    (index) => !used.has(index),
  );

  if (available.length === 0) return null;
  return available[secureRandomIndex(available.length)];
}

function normalizeRoomSettings(value) {
  return {
    groupType: value.groupType,
    youngestAge: Number(value.youngestAge),
    maxIntensity: Number(value.maxIntensity),
  };
}

function emptyReactionCounts() {
  return {
    heart: 0,
    laugh: 0,
    clap: 0,
    wow: 0,
  };
}

function reactionCountsForTurn(game, turnNumber) {
  const counts = emptyReactionCounts();
  const reactions = game?.reactionsByTurn?.[String(turnNumber)] ?? {};

  for (const reaction of Object.values(reactions)) {
    if (REACTION_TYPES.includes(reaction)) counts[reaction] += 1;
  }

  return counts;
}

function reactionTotals(game) {
  const totals = emptyReactionCounts();

  for (const reactions of Object.values(game?.reactionsByTurn ?? {})) {
    for (const reaction of Object.values(reactions)) {
      if (REACTION_TYPES.includes(reaction)) totals[reaction] += 1;
    }
  }

  return totals;
}

function publicSavedMoments(game) {
  return (game?.savedMoments ?? []).map((moment) => ({
    turnNumber: moment.turnNumber,
    playerId: moment.playerId,
    questionIndex: moment.questionIndex,
    savedCount: moment.savedByPlayerIds.length,
    createdAt: moment.createdAt,
  }));
}

function finishGame(room, reason) {
  if (!room.game) return;

  room.status = "finished";
  room.game.revealed = true;
  room.game.finishedAt = new Date().toISOString();
  room.game.finishReason = reason;
}

function publicSnapshot(room) {
  return {
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    createdAt: room.createdAt,
    version: room.version,
    canStart: canStartRoom(room),
    settings: room.settings,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      connected: Boolean(player.connected),
      ready: Boolean(player.ready),
      joinedAt: player.joinedAt,
    })),
    game: room.game
      ? {
          deckVersion: room.game.deckVersion,
          currentPlayerId: room.game.currentPlayerId,
          questionIndex: room.game.revealed ? room.game.questionIndex : null,
          turnNumber: room.game.turnNumber,
          revealed: Boolean(room.game.revealed),
          usedQuestionCount: room.game.usedQuestionIndexes.length,
          questionPoolSize: room.game.questionPool.length,
          currentReactions: reactionCountsForTurn(
            room.game,
            room.game.turnNumber,
          ),
          reactionTotals: reactionTotals(room.game),
          savedMoments: publicSavedMoments(room.game),
          startedAt: room.game.startedAt,
          finishedAt: room.game.finishedAt ?? null,
          finishReason: room.game.finishReason ?? null,
        }
      : null,
  };
}

function inputError(result) {
  return json({ error: result.error }, result.status);
}

function socketError(ws, error, extra = {}) {
  ws.send(JSON.stringify({ type: "error", error, ...extra }));
}

function consumeSocketEvent(ws, attachment) {
  const result = consumeFixedWindow(
    attachment?.rateState ?? null,
    Date.now(),
    SOCKET_EVENT_LIMIT,
    SOCKET_EVENT_WINDOW_MS,
  );

  ws.serializeAttachment({
    ...attachment,
    rateState: result.state,
  });

  if (!result.allowed) {
    socketError(ws, "RATE_LIMITED", {
      retryAfterMs: result.retryAfterMs,
    });
    return false;
  }

  return true;
}

async function rateLimitIdentity(request) {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 160);
  const source =
    ip === "unknown" ? "unknown\n" + userAgent : ip;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(source),
  );
  return [...new Uint8Array(digest)]
    .slice(0, 16)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function enforceHttpRateLimit(
  request,
  env,
  scope,
  limit,
  windowMs,
) {
  const identity = await rateLimitIdentity(request);
  const stub = env.RATE_LIMITS.getByName(identity);
  const response = await stub.fetch(
    new Request("https://rate-limit/internal/consume", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scope, limit, windowMs }),
    }),
  );
  const result = await response.json();

  if (result.allowed) return null;

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil(result.retryAfterMs / 1000),
  );
  const response429 = json(
    {
      error: "RATE_LIMITED",
      retryAfterMs: result.retryAfterMs,
    },
    429,
  );
  const headers = new Headers(response429.headers);
  headers.set("retry-after", String(retryAfterSeconds));
  return new Response(response429.body, {
    status: 429,
    headers,
  });
}

export class RateLimiter extends DurableObject {
  async fetch(request) {
    const url = new URL(request.url);
    if (
      request.method !== "POST" ||
      url.pathname !== "/internal/consume"
    ) {
      return new Response("Not found", { status: 404 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Bad request", { status: 400 });
    }

    const scope = String(body?.scope ?? "").slice(0, 64);
    const limit = Number(body?.limit);
    const windowMs = Number(body?.windowMs);

    if (
      !scope ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 1000 ||
      !Number.isInteger(windowMs) ||
      windowMs < 1000 ||
      windowMs > 60 * 60 * 1000
    ) {
      return new Response("Bad request", { status: 400 });
    }

    const key = "bucket:" + scope;
    const previous = (await this.ctx.storage.get(key)) ?? null;
    const result = consumeFixedWindow(
      previous,
      Date.now(),
      limit,
      windowMs,
    );

    await this.ctx.storage.put(key, result.state);
    await this.ctx.storage.setAlarm(Date.now() + RATE_LIMIT_STORAGE_TTL_MS);

    return new Response(JSON.stringify(result), {
      headers: { "content-type": "application/json" },
    });
  }

  async alarm() {
    await this.ctx.storage.deleteAll();
  }
}

export class GameRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.env = env;
    this.room = null;

    ctx.blockConcurrencyWhile(async () => {
      this.room = (await ctx.storage.get("room")) ?? null;

      if (this.room && !this.room.settings) {
        this.room.settings = { ...DEFAULT_ROOM_SETTINGS };
      }

      if (this.room && !this.room.displayToken) {
        this.room.displayToken = randomToken();
      }

      if (this.room?.game && !Array.isArray(this.room.game.questionPool)) {
        const legacyCount =
          this.room.game.deckVersion === "core-v1" ? 12 : QUESTION_COUNT;
        this.room.game.questionPool = Array.from(
          { length: legacyCount },
          (_, index) => index,
        );
      }

      if (this.room?.game && !this.room.game.reactionsByTurn) {
        this.room.game.reactionsByTurn = {};
      }

      if (this.room?.game && !Array.isArray(this.room.game.savedMoments)) {
        this.room.game.savedMoments = [];
      }

      if (this.room) {
        await ctx.storage.put("room", this.room);
      }
    });
  }

  async persist() {
    if (this.room) {
      await this.ctx.storage.put("room", this.room);
    }
  }

  findPlayer(playerId, token) {
    if (!this.room) return null;
    return (
      this.room.players.find(
        (player) => player.id === playerId && player.token === token,
      ) ?? null
    );
  }

  transferHostIfNeeded(previousHostId = this.room?.hostId) {
    if (!this.room || this.room.players.length === 0) return;

    const currentHost = this.room.players.find(
      (player) => player.id === previousHostId,
    );
    if (currentHost?.connected) return;

    const replacement =
      this.room.players.find((player) => player.connected) ??
      this.room.players[0];

    if (replacement) {
      this.room.hostId = replacement.id;
    }
  }

  canControlTurn(player) {
    if (!this.room?.game) return false;
    return (
      player.id === this.room.game.currentPlayerId ||
      player.id === this.room.hostId
    );
  }

  validateExpectedTurn(ws, event) {
    const expected = Number(event?.expectedTurnNumber);
    const actual = this.room?.game?.turnNumber;

    if (!Number.isInteger(expected) || expected !== actual) {
      ws.send(
        JSON.stringify({
          type: "error",
          error: "STALE_TURN",
          expectedTurnNumber: actual ?? null,
        }),
      );
      return false;
    }
    return true;
  }

  async broadcastSnapshot() {
    if (!this.room) return;
    const payload = JSON.stringify({
      type: "snapshot",
      room: publicSnapshot(this.room),
    });

    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(payload);
      } catch {
        // The close/error handlers clean up stale connections.
      }
    }
  }

  async initialize(request) {
    if (this.room) {
      return json({ error: "ROOM_EXISTS" }, 409);
    }

    const parsed = await readJsonObject(request);
    if (!parsed.ok) return inputError(parsed);

    const nameResult = validatePlayerName(parsed.data?.name);
    const code = normalizeRoomCode(parsed.data?.code);
    const playerId = String(parsed.data?.playerId ?? "");
    const token = String(parsed.data?.token ?? "");

    if (
      !nameResult.ok ||
      code.length !== 6 ||
      !isUuid(playerId) ||
      !isOpaqueToken(token)
    ) {
      return json({ error: "INVALID_ROOM_INIT" }, 400);
    }

    const name = nameResult.value;

    const now = Date.now();
    this.room = {
      code,
      status: "lobby",
      hostId: playerId,
      createdAt: new Date(now).toISOString(),
      expiresAt: now + ROOM_TTL_MS,
      version: 1,
      displayToken: randomToken(),
      settings: { ...DEFAULT_ROOM_SETTINGS },
      game: null,
      players: [
        {
          id: playerId,
          name,
          token,
          connected: false,
          ready: false,
          joinedAt: new Date(now).toISOString(),
          lastSeenAt: now,
        },
      ],
    };

    await this.persist();
    await this.ctx.storage.setAlarm(this.room.expiresAt);

    return json({ room: publicSnapshot(this.room) }, 201);
  }

  async join(request) {
    if (!this.room) {
      return json({ error: "ROOM_NOT_FOUND" }, 404);
    }
    if (this.room.status !== "lobby") {
      return json({ error: "ROOM_ALREADY_STARTED" }, 409);
    }
    if (this.room.players.length >= MAX_PLAYERS) {
      return json({ error: "ROOM_FULL" }, 409);
    }

    const parsed = await readJsonObject(request);
    if (!parsed.ok) return inputError(parsed);

    const nameResult = validatePlayerName(parsed.data?.name);
    const playerId = String(parsed.data?.playerId ?? "");
    const token = String(parsed.data?.token ?? "");

    if (
      !nameResult.ok ||
      !isUuid(playerId) ||
      !isOpaqueToken(token)
    ) {
      return json({ error: "INVALID_PLAYER" }, 400);
    }

    const name = nameResult.value;

    const duplicate = this.room.players.some(
      (player) => player.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    );
    if (duplicate) {
      return json({ error: "NAME_TAKEN" }, 409);
    }

    const now = Date.now();
    this.room.players.push({
      id: playerId,
      name,
      token,
      connected: false,
      ready: false,
      joinedAt: new Date(now).toISOString(),
      lastSeenAt: now,
    });

    this.transferHostIfNeeded();
    this.room.version += 1;

    await this.persist();
    await this.broadcastSnapshot();

    return json({ room: publicSnapshot(this.room) }, 201);
  }

  async authenticatedState(url) {
    if (!this.room) {
      return json({ error: "ROOM_NOT_FOUND" }, 404);
    }

    const playerId = url.searchParams.get("playerId") ?? "";
    const token = url.searchParams.get("token") ?? "";
    const player = this.findPlayer(playerId, token);

    if (!player) {
      return json({ error: "UNAUTHORIZED_PLAYER" }, 401);
    }

    return json({ room: publicSnapshot(this.room) });
  }

  async connectWebSocket(request, url) {
    if (!this.room) {
      return json({ error: "ROOM_NOT_FOUND" }, 404);
    }
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return json({ error: "EXPECTED_WEBSOCKET" }, 426);
    }

    const playerId = url.searchParams.get("playerId") ?? "";
    const token = url.searchParams.get("token") ?? "";
    const player = this.findPlayer(playerId, token);

    if (!player) {
      return json({ error: "UNAUTHORIZED_PLAYER" }, 401);
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({
      connectionType: "player",
      playerId,
      rateState: null,
    });

    player.connected = true;
    player.lastSeenAt = Date.now();

    this.transferHostIfNeeded();
    this.room.version += 1;
    await this.persist();

    server.send(
      JSON.stringify({
        type: "snapshot",
        room: publicSnapshot(this.room),
      }),
    );
    await this.broadcastSnapshot();

    return new Response(null, { status: 101, webSocket: client });
  }

  async connectDisplayWebSocket(request, url) {
    if (!this.room) {
      return json({ error: "ROOM_NOT_FOUND" }, 404);
    }
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return json({ error: "EXPECTED_WEBSOCKET" }, 426);
    }

    const token = url.searchParams.get("token") ?? "";
    if (!token || token !== this.room.displayToken) {
      return json({ error: "UNAUTHORIZED_DISPLAY" }, 401);
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({
      connectionType: "display",
      rateState: null,
    });
    server.send(
      JSON.stringify({
        type: "snapshot",
        room: publicSnapshot(this.room),
      }),
    );

    return new Response(null, { status: 101, webSocket: client });
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/internal/init") {
      return this.initialize(request);
    }
    if (request.method === "POST" && url.pathname === "/internal/join") {
      return this.join(request);
    }
    if (request.method === "GET" && url.pathname === "/internal/state") {
      return this.authenticatedState(url);
    }
    if (request.method === "GET" && url.pathname === "/internal/ws") {
      return this.connectWebSocket(request, url);
    }
    if (request.method === "GET" && url.pathname === "/internal/display/ws") {
      return this.connectDisplayWebSocket(request, url);
    }

    return json({ error: "NOT_FOUND" }, 404);
  }

  async webSocketMessage(ws, message) {
    const attachment = ws.deserializeAttachment();
    const connectionType = attachment?.connectionType ?? "player";
    const playerId = attachment?.playerId ?? "";

    if (!consumeSocketEvent(ws, attachment)) return;

    if (typeof message !== "string") {
      socketError(ws, "INVALID_MESSAGE");
      return;
    }

    if (
      new TextEncoder().encode(message).byteLength >
      MAX_WS_MESSAGE_BYTES
    ) {
      socketError(ws, "MESSAGE_TOO_LARGE");
      return;
    }

    if (message === "ping") {
      ws.send("pong");
      return;
    }

    let event = null;
    try {
      event = JSON.parse(message);
    } catch {
      socketError(ws, "INVALID_MESSAGE");
      return;
    }

    if (!this.room) {
      ws.send(JSON.stringify({ type: "error", error: "ROOM_NOT_FOUND" }));
      return;
    }

    if (connectionType === "display") {
      if (event?.type === "sync") {
        ws.send(
          JSON.stringify({
            type: "snapshot",
            room: publicSnapshot(this.room),
          }),
        );
      } else {
        ws.send(JSON.stringify({ type: "error", error: "DISPLAY_READ_ONLY" }));
      }
      return;
    }

    const player = this.room.players.find((item) => item.id === playerId);
    if (!player) {
      socketError(ws, "PLAYER_NOT_FOUND");
      return;
    }

    const validation = validateClientEvent(event);
    if (!validation.ok) {
      socketError(ws, validation.error);
      return;
    }

    if (event?.type === "sync") {
      ws.send(
        JSON.stringify({
          type: "snapshot",
          room: publicSnapshot(this.room),
        }),
      );
      return;
    }

    if (event?.type === "display-token") {
      if (player.id !== this.room.hostId) {
        ws.send(JSON.stringify({ type: "error", error: "HOST_ONLY" }));
        return;
      }

      ws.send(
        JSON.stringify({
          type: "display-token",
          token: this.room.displayToken,
        }),
      );
      return;
    }

    if (event?.type === "ready") {
      if (this.room.status !== "lobby") {
        ws.send(JSON.stringify({ type: "error", error: "GAME_ALREADY_STARTED" }));
        return;
      }

      player.ready = Boolean(event.ready);
      player.lastSeenAt = Date.now();
      this.room.version += 1;
      await this.persist();
      await this.broadcastSnapshot();
      return;
    }

    if (event?.type === "settings") {
      if (player.id !== this.room.hostId) {
        ws.send(JSON.stringify({ type: "error", error: "HOST_ONLY" }));
        return;
      }
      if (this.room.status !== "lobby") {
        ws.send(JSON.stringify({ type: "error", error: "GAME_ALREADY_STARTED" }));
        return;
      }

      this.room.settings = normalizeRoomSettings(event.settings);
      for (const member of this.room.players) {
        member.ready = false;
      }
      this.room.version += 1;
      await this.persist();
      await this.broadcastSnapshot();
      return;
    }

    if (event?.type === "start") {
      if (player.id !== this.room.hostId) {
        ws.send(JSON.stringify({ type: "error", error: "HOST_ONLY" }));
        return;
      }
      if (!canStartRoom(this.room)) {
        ws.send(JSON.stringify({ type: "error", error: "ROOM_NOT_READY" }));
        return;
      }
      if (event?.deckVersion !== DECK_VERSION) {
        ws.send(
          JSON.stringify({ type: "error", error: "DECK_VERSION_MISMATCH" }),
        );
        return;
      }

      const questionPool = validateQuestionPool(event?.questionPool);
      if (!questionPool) {
        ws.send(JSON.stringify({ type: "error", error: "INVALID_QUESTION_POOL" }));
        return;
      }

      const questionIndex =
        questionPool[secureRandomIndex(questionPool.length)];
      this.room.status = "playing";
      this.room.game = {
        deckVersion: DECK_VERSION,
        questionPool,
        currentPlayerId:
          this.room.players[secureRandomIndex(this.room.players.length)].id,
        questionIndex,
        usedQuestionIndexes: [questionIndex],
        turnNumber: 1,
        revealed: false,
        reactionsByTurn: {},
        savedMoments: [],
        startedAt: new Date().toISOString(),
        finishedAt: null,
        finishReason: null,
      };
      this.room.version += 1;
      writeProductMetric(this.env, "game_started", {
        blobs: [
          this.room.settings.groupType,
          String(this.room.settings.youngestAge),
          String(this.room.settings.maxIntensity),
        ],
        doubles: [
          this.room.players.length,
          questionPool.length,
        ],
      });
      await this.persist();
      await this.broadcastSnapshot();
      return;
    }

    if (
      event?.type === "reveal" ||
      event?.type === "skip-question" ||
      event?.type === "next-turn"
    ) {
      if (this.room.status !== "playing" || !this.room.game) {
        ws.send(JSON.stringify({ type: "error", error: "GAME_NOT_PLAYING" }));
        return;
      }
      if (!this.canControlTurn(player)) {
        ws.send(JSON.stringify({ type: "error", error: "TURN_CONTROL_ONLY" }));
        return;
      }
      if (!this.validateExpectedTurn(ws, event)) {
        return;
      }
    }

    if (event?.type === "reveal") {
      if (!this.room.game.revealed) {
        this.room.game.revealed = true;
        this.room.version += 1;
        await this.persist();
        await this.broadcastSnapshot();
      }
      return;
    }

    if (event?.type === "react") {
      if (this.room.status !== "playing" || !this.room.game) {
        ws.send(JSON.stringify({ type: "error", error: "GAME_NOT_PLAYING" }));
        return;
      }
      if (!this.room.game.revealed) {
        ws.send(JSON.stringify({ type: "error", error: "REVEAL_FIRST" }));
        return;
      }
      if (!this.validateExpectedTurn(ws, event)) return;

      const reaction = event?.reaction ?? null;
      if (reaction !== null && !REACTION_TYPES.includes(reaction)) {
        ws.send(JSON.stringify({ type: "error", error: "INVALID_REACTION" }));
        return;
      }

      const turnKey = String(this.room.game.turnNumber);
      const reactions =
        this.room.game.reactionsByTurn[turnKey] ??
        (this.room.game.reactionsByTurn[turnKey] = {});

      if (reaction === null) {
        delete reactions[player.id];
      } else {
        reactions[player.id] = reaction;
      }

      this.room.version += 1;
      await this.persist();
      ws.send(
        JSON.stringify({
          type: "reaction-set",
          turnNumber: this.room.game.turnNumber,
          reaction,
        }),
      );
      await this.broadcastSnapshot();
      return;
    }

    if (event?.type === "save-moment") {
      if (this.room.status !== "playing" || !this.room.game) {
        ws.send(JSON.stringify({ type: "error", error: "GAME_NOT_PLAYING" }));
        return;
      }
      if (!this.room.game.revealed || this.room.game.questionIndex === null) {
        ws.send(JSON.stringify({ type: "error", error: "REVEAL_FIRST" }));
        return;
      }
      if (!this.validateExpectedTurn(ws, event)) return;

      const shouldSave = event.saved;
      const turnNumber = this.room.game.turnNumber;
      let moment = this.room.game.savedMoments.find(
        (item) => item.turnNumber === turnNumber,
      );

      if (shouldSave) {
        if (!moment) {
          moment = {
            turnNumber,
            playerId: this.room.game.currentPlayerId,
            questionIndex: this.room.game.questionIndex,
            savedByPlayerIds: [],
            createdAt: new Date().toISOString(),
          };
          this.room.game.savedMoments.push(moment);
        }

        if (!moment.savedByPlayerIds.includes(player.id)) {
          moment.savedByPlayerIds.push(player.id);
        }
      } else if (moment) {
        moment.savedByPlayerIds = moment.savedByPlayerIds.filter(
          (id) => id !== player.id,
        );
        if (moment.savedByPlayerIds.length === 0) {
          this.room.game.savedMoments = this.room.game.savedMoments.filter(
            (item) => item.turnNumber !== turnNumber,
          );
        }
      }

      this.room.version += 1;
      await this.persist();
      ws.send(
        JSON.stringify({
          type: "moment-saved",
          turnNumber,
          saved: shouldSave,
        }),
      );
      await this.broadcastSnapshot();
      return;
    }

    if (event?.type === "skip-question") {
      const nextQuestion = nextUnusedQuestionIndex(this.room.game);
      if (nextQuestion === null) {
        finishGame(this.room, "deck-complete");
        writeProductMetric(this.env, "game_finished", {
          blobs: ["deck-complete"],
          doubles: [
            this.room.players.length,
            this.room.game.turnNumber,
            this.room.game.savedMoments.length,
          ],
        });
      } else {
        this.room.game.questionIndex = nextQuestion;
        this.room.game.usedQuestionIndexes.push(nextQuestion);
        this.room.game.revealed = false;
      }

      this.room.version += 1;
      await this.persist();
      await this.broadcastSnapshot();
      return;
    }

    if (event?.type === "next-turn") {
      if (!this.room.game.revealed) {
        ws.send(JSON.stringify({ type: "error", error: "REVEAL_FIRST" }));
        return;
      }

      const nextQuestion = nextUnusedQuestionIndex(this.room.game);
      const nextPlayer = nextPlayerId(this.room);

      if (nextQuestion === null || !nextPlayer) {
        finishGame(this.room, "deck-complete");
        writeProductMetric(this.env, "game_finished", {
          blobs: ["deck-complete"],
          doubles: [
            this.room.players.length,
            this.room.game.turnNumber,
            this.room.game.savedMoments.length,
          ],
        });
      } else {
        this.room.game.currentPlayerId = nextPlayer;
        this.room.game.questionIndex = nextQuestion;
        this.room.game.usedQuestionIndexes.push(nextQuestion);
        this.room.game.turnNumber += 1;
        this.room.game.revealed = false;
      }

      this.room.version += 1;
      await this.persist();
      await this.broadcastSnapshot();
      return;
    }

    if (event?.type === "finish") {
      if (player.id !== this.room.hostId) {
        ws.send(JSON.stringify({ type: "error", error: "HOST_ONLY" }));
        return;
      }
      if (this.room.status !== "playing" || !this.room.game) {
        ws.send(JSON.stringify({ type: "error", error: "GAME_NOT_PLAYING" }));
        return;
      }

      finishGame(this.room, "host-ended");
      writeProductMetric(this.env, "game_finished", {
        blobs: ["host-ended"],
        doubles: [
          this.room.players.length,
          this.room.game.turnNumber,
          this.room.game.savedMoments.length,
        ],
      });
      this.room.version += 1;
      await this.persist();
      await this.broadcastSnapshot();
      return;
    }

    if (event?.type === "leave") {
      const wasHost = player.id === this.room.hostId;
      this.room.players = this.room.players.filter(
        (item) => item.id !== player.id,
      );

      for (const candidate of this.ctx.getWebSockets()) {
        if (candidate === ws) continue;
        const candidateAttachment = candidate.deserializeAttachment();
        if (
          candidateAttachment?.connectionType === "player" &&
          candidateAttachment?.playerId === player.id
        ) {
          try {
            candidate.close(1000, "session revoked");
          } catch {
            // Ignore sockets already closing.
          }
        }
      }

      if (this.room.players.length === 0) {
        this.room = null;
        await this.ctx.storage.deleteAll();
        try {
          ws.close(1000, "room empty");
        } catch {
          // Socket may already be closing.
        }
        return;
      }

      if (wasHost) {
        this.room.hostId =
          this.room.players.find((item) => item.connected)?.id ??
          this.room.players[0].id;
      }

      if (
        this.room.status === "playing" &&
        this.room.game?.currentPlayerId === player.id
      ) {
        const replacement =
          this.room.players.find((item) => item.connected)?.id ??
          this.room.players[0].id;
        this.room.game.currentPlayerId = replacement;
      }

      this.room.version += 1;
      await this.persist();
      await this.broadcastSnapshot();

      try {
        ws.close(1000, "left room");
      } catch {
        // Socket may already be closing.
      }
      return;
    }

    ws.send(JSON.stringify({ type: "error", error: "UNSUPPORTED_MESSAGE" }));
  }

  async markDisconnected(ws) {
    const attachment = ws.deserializeAttachment();
    if (attachment?.connectionType === "display") return;

    const playerId = attachment?.playerId ?? "";

    if (!this.room) return;

    const anotherPlayerSocket = this.ctx
      .getWebSockets()
      .some((candidate) => {
        if (candidate === ws) return false;
        const candidateAttachment = candidate.deserializeAttachment();
        return (
          candidateAttachment?.connectionType === "player" &&
          candidateAttachment?.playerId === playerId
        );
      });

    if (anotherPlayerSocket) return;

    const player = this.room.players.find((item) => item.id === playerId);
    if (!player) return;

    const wasHost = player.id === this.room.hostId;
    player.connected = false;
    player.ready = false;
    player.lastSeenAt = Date.now();

    if (wasHost) {
      this.transferHostIfNeeded(player.id);
    }

    this.room.version += 1;
    await this.persist();
    await this.broadcastSnapshot();
  }

  async webSocketClose(ws, code, reason) {
    await this.markDisconnected(ws);
    try {
      ws.close(code, reason);
    } catch {
      // Socket may already be closed by the runtime.
    }
  }

  async webSocketError(ws) {
    await this.markDisconnected(ws);
  }

  async alarm() {
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.close(1001, "room expired");
      } catch {
        // Ignore already closed sockets.
      }
    }
    this.room = null;
    await this.ctx.storage.deleteAll();
  }
}

async function proxyToRoom(env, code, request) {
  const stub = env.GAME_ROOMS.getByName(code);
  return stub.fetch(request);
}

async function createRoom(request, env) {
  const parsed = await readJsonObject(request);
  if (!parsed.ok) return inputError(parsed);

  const nameResult = validatePlayerName(parsed.data?.name);
  if (!nameResult.ok) {
    return json({ error: nameResult.error }, 400);
  }

  const name = nameResult.value;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = randomRoomCode();
    const playerId = crypto.randomUUID();
    const token = randomToken();
    const stub = env.GAME_ROOMS.getByName(code);

    const initResponse = await stub.fetch(
      new Request("https://room/internal/init", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, name, playerId, token }),
      }),
    );

    if (initResponse.status === 409) continue;
    if (!initResponse.ok) return withCors(initResponse);

    const payload = await initResponse.json();
    writeProductMetric(env, "room_created", {
      doubles: [1],
    });
    return json(
      {
        code,
        playerId,
        token,
        room: payload.room,
      },
      201,
    );
  }

  return json({ error: "ROOM_CODE_EXHAUSTED" }, 503);
}

async function joinRoom(request, env, code) {
  const parsed = await readJsonObject(request);
  if (!parsed.ok) return inputError(parsed);

  const nameResult = validatePlayerName(parsed.data?.name);
  if (!nameResult.ok) {
    return json({ error: nameResult.error }, 400);
  }

  const name = nameResult.value;

  const playerId = crypto.randomUUID();
  const token = randomToken();
  const response = await proxyToRoom(
    env,
    code,
    new Request("https://room/internal/join", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, playerId, token }),
    }),
  );

  if (!response.ok) return withCors(response);

  const payload = await response.json();
  writeProductMetric(env, "player_joined", {
    doubles: [payload.room.players.length],
  });
  return json(
    {
      code,
      playerId,
      token,
      room: payload.room,
    },
    201,
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (url.pathname === "/health") {
      return json({
        ok: true,
        service: "juego-familia-ech",
        phase: "10-production-readiness",
        durableObjects: true,
      });
    }

    if (request.method === "POST" && url.pathname === "/api/telemetry") {
      const limited = await enforceHttpRateLimit(
        request,
        env,
        "client-telemetry",
        60,
        60_000,
      );
      if (limited) return limited;
      return recordClientTelemetry(request, env);
    }

    if (request.method === "POST" && url.pathname === "/api/rooms") {
      const limited = await enforceHttpRateLimit(
        request,
        env,
        "create-room",
        12,
        60_000,
      );
      if (limited) return limited;
      return createRoom(request, env);
    }

    const joinMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})\/join$/i);
    if (request.method === "POST" && joinMatch) {
      const limited = await enforceHttpRateLimit(
        request,
        env,
        "join-room",
        60,
        60_000,
      );
      if (limited) return limited;
      const code = normalizeRoomCode(joinMatch[1]);
      return joinRoom(request, env, code);
    }

    const stateMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})\/state$/i);
    if (request.method === "GET" && stateMatch) {
      const limited = await enforceHttpRateLimit(
        request,
        env,
        "room-state",
        180,
        60_000,
      );
      if (limited) return limited;
      const code = normalizeRoomCode(stateMatch[1]);
      const target = new URL("https://room/internal/state");
      target.search = url.search;
      const response = await proxyToRoom(
        env,
        code,
        new Request(target.toString(), { method: "GET" }),
      );
      return withCors(response);
    }

    const wsMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})\/ws$/i);
    if (request.method === "GET" && wsMatch) {
      const limited = await enforceHttpRateLimit(
        request,
        env,
        "player-ws-upgrade",
        120,
        60_000,
      );
      if (limited) return limited;
      const code = normalizeRoomCode(wsMatch[1]);
      const target = new URL("https://room/internal/ws");
      target.search = url.search;
      const response = await proxyToRoom(
        env,
        code,
        new Request(target.toString(), request),
      );
      return response;
    }

    const displayWsMatch = url.pathname.match(
      /^\/api\/rooms\/([A-Z0-9]{6})\/display\/ws$/i,
    );
    if (request.method === "GET" && displayWsMatch) {
      const limited = await enforceHttpRateLimit(
        request,
        env,
        "display-ws-upgrade",
        60,
        60_000,
      );
      if (limited) return limited;
      const code = normalizeRoomCode(displayWsMatch[1]);
      const target = new URL("https://room/internal/display/ws");
      target.search = url.search;
      return proxyToRoom(
        env,
        code,
        new Request(target.toString(), request),
      );
    }

    return json({
      service: "JuegoFamiliaEch",
      message: "Realtime backend online.",
      endpoints: [
        "POST /api/telemetry",
        "POST /api/rooms",
        "POST /api/rooms/:code/join",
        "GET /api/rooms/:code/state",
        "GET /api/rooms/:code/ws",
        "GET /api/rooms/:code/display/ws",
      ],
    });
  },
};
