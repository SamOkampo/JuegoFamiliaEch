import { DurableObject } from "cloudflare:workers";

const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_PLAYERS = 12;
const ROOM_TTL_MS = 12 * 60 * 60 * 1000;

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
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
  const cors = corsHeaders();
  for (const [key, value] of Object.entries(cors)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
    webSocket: response.webSocket,
  });
}

function cleanPlayerName(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 24);
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

function publicSnapshot(room) {
  return {
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    createdAt: room.createdAt,
    version: room.version,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      connected: Boolean(player.connected),
      joinedAt: player.joinedAt,
    })),
  };
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export class GameRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.room = null;

    ctx.blockConcurrencyWhile(async () => {
      this.room = (await ctx.storage.get("room")) ?? null;
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
        // The close/error handlers will clean up stale connections.
      }
    }
  }

  async initialize(request) {
    if (this.room) {
      return json({ error: "ROOM_EXISTS" }, 409);
    }

    const body = await readJson(request);
    const name = cleanPlayerName(body?.name);
    const code = normalizeRoomCode(body?.code);
    const playerId = String(body?.playerId ?? "");
    const token = String(body?.token ?? "");

    if (!name || code.length !== 6 || !playerId || !token) {
      return json({ error: "INVALID_ROOM_INIT" }, 400);
    }

    const now = Date.now();
    this.room = {
      code,
      status: "lobby",
      hostId: playerId,
      createdAt: new Date(now).toISOString(),
      expiresAt: now + ROOM_TTL_MS,
      version: 1,
      players: [
        {
          id: playerId,
          name,
          token,
          connected: false,
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

    const body = await readJson(request);
    const name = cleanPlayerName(body?.name);
    const playerId = String(body?.playerId ?? "");
    const token = String(body?.token ?? "");

    if (!name || !playerId || !token) {
      return json({ error: "INVALID_PLAYER" }, 400);
    }

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
      joinedAt: new Date(now).toISOString(),
      lastSeenAt: now,
    });
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
    server.serializeAttachment({ playerId });

    player.connected = true;
    player.lastSeenAt = Date.now();
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

    return json({ error: "NOT_FOUND" }, 404);
  }

  async webSocketMessage(ws, message) {
    const attachment = ws.deserializeAttachment();
    const playerId = attachment?.playerId ?? "";

    if (message === "ping") {
      ws.send("pong");
      return;
    }

    let event = null;
    try {
      event = JSON.parse(String(message));
    } catch {
      ws.send(JSON.stringify({ type: "error", error: "INVALID_MESSAGE" }));
      return;
    }

    if (event?.type === "sync" && this.room) {
      ws.send(
        JSON.stringify({
          type: "snapshot",
          room: publicSnapshot(this.room),
        }),
      );
      return;
    }

    if (event?.type === "leave" && this.room) {
      const player = this.room.players.find((item) => item.id === playerId);
      if (player) {
        player.connected = false;
        player.lastSeenAt = Date.now();
        this.room.version += 1;
        await this.persist();
        await this.broadcastSnapshot();
      }
      ws.close(1000, "left room");
      return;
    }

    ws.send(JSON.stringify({ type: "error", error: "UNSUPPORTED_MESSAGE" }));
  }

  async webSocketClose(ws, code, reason) {
    const attachment = ws.deserializeAttachment();
    const playerId = attachment?.playerId ?? "";

    if (this.room) {
      const player = this.room.players.find((item) => item.id === playerId);
      if (player) {
        player.connected = false;
        player.lastSeenAt = Date.now();
        this.room.version += 1;
        await this.persist();
        await this.broadcastSnapshot();
      }
    }

    try {
      ws.close(code, reason);
    } catch {
      // Socket may already be closed by the runtime.
    }
  }

  async webSocketError(ws) {
    const attachment = ws.deserializeAttachment();
    const playerId = attachment?.playerId ?? "";

    if (this.room) {
      const player = this.room.players.find((item) => item.id === playerId);
      if (player) {
        player.connected = false;
        player.lastSeenAt = Date.now();
        this.room.version += 1;
        await this.persist();
        await this.broadcastSnapshot();
      }
    }
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
  const body = await readJson(request);
  const name = cleanPlayerName(body?.name);

  if (!name) {
    return json({ error: "NAME_REQUIRED" }, 400);
  }

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
  const body = await readJson(request);
  const name = cleanPlayerName(body?.name);

  if (!name) {
    return json({ error: "NAME_REQUIRED" }, 400);
  }

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
        phase: "2.1-cloudflare-realtime",
        durableObjects: true,
      });
    }

    if (request.method === "POST" && url.pathname === "/api/rooms") {
      return createRoom(request, env);
    }

    const joinMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})\/join$/i);
    if (request.method === "POST" && joinMatch) {
      const code = normalizeRoomCode(joinMatch[1]);
      return joinRoom(request, env, code);
    }

    const stateMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})\/state$/i);
    if (request.method === "GET" && stateMatch) {
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

    return json({
      service: "JuegoFamiliaEch",
      message: "Realtime backend online.",
      endpoints: [
        "POST /api/rooms",
        "POST /api/rooms/:code/join",
        "GET /api/rooms/:code/state",
        "GET /api/rooms/:code/ws",
      ],
    });
  },
};
