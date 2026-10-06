const baseUrl =
  process.env.GAME_API_URL ??
  "https://juego-familia-ech.socampoecheverry.workers.dev";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function requestJson(path, options = {}) {
  const response = await fetch(baseUrl + path, options);
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  return { response, payload };
}

async function postJson(path, body) {
  return requestJson(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function playerWsUrl(session) {
  const url = new URL(baseUrl + "/api/rooms/" + session.code + "/ws");
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("playerId", session.playerId);
  url.searchParams.set("token", session.token);
  return url.toString();
}

function openSocket(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const timer = setTimeout(
      () => reject(new Error("WebSocket open timeout")),
      10000,
    );

    ws.addEventListener(
      "open",
      () => {
        clearTimeout(timer);
        resolve(ws);
      },
      { once: true },
    );

    ws.addEventListener(
      "error",
      () => {
        clearTimeout(timer);
        reject(new Error("WebSocket connection failed"));
      },
      { once: true },
    );
  });
}

function waitForMessage(ws, predicate, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeEventListener("message", onMessage);
      reject(new Error("Timed out waiting for " + label));
    }, 12000);

    function onMessage(event) {
      try {
        const payload = JSON.parse(String(event.data));
        if (predicate(payload)) {
          clearTimeout(timer);
          ws.removeEventListener("message", onMessage);
          resolve(payload);
        }
      } catch {
        // Ignore pong and non-JSON frames.
      }
    }

    ws.addEventListener("message", onMessage);
  });
}

function send(ws, value) {
  ws.send(typeof value === "string" ? value : JSON.stringify(value));
}

let hostSocket;
let guestSocket;

try {
  const invalidTelemetry = await postJson("/api/telemetry", {
    event: "raw_error_message",
    surface: "room",
  });
  assert(
    invalidTelemetry.response.status === 400 &&
      invalidTelemetry.payload?.error === "INVALID_TELEMETRY",
    "Telemetry must reject arbitrary event names",
  );

  const validTelemetry = await postJson("/api/telemetry", {
    event: "client_error_runtime",
    surface: "room",
  });
  assert(
    validTelemetry.response.status === 202 &&
      validTelemetry.payload?.ok === true,
    "Sanitized telemetry event should be accepted",
  );

  const wrongType = await requestJson("/api/rooms", {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: "{}",
  });
  assert(
    wrongType.response.status === 415 &&
      wrongType.payload?.error === "UNSUPPORTED_MEDIA_TYPE",
    "Non-JSON room creation must be rejected",
  );

  const invalidName = await postJson("/api/rooms", {
    name: "Sam\u202Euel",
  });
  assert(
    invalidName.response.status === 400 &&
      invalidName.payload?.error === "INVALID_NAME",
    "Invisible bidi controls in player names must be rejected",
  );

  const oversized = await postJson("/api/rooms", {
    name: "A".repeat(5000),
  });
  assert(
    oversized.response.status === 413 &&
      oversized.payload?.error === "REQUEST_TOO_LARGE",
    "Oversized HTTP JSON payload must be rejected",
  );

  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  const hostCreate = await postJson("/api/rooms", {
    name: "SecureHost" + suffix,
  });
  assert(hostCreate.response.status === 201, "Host room creation failed");
  const host = hostCreate.payload;

  const anonymousState = await requestJson(
    "/api/rooms/" + host.code + "/state",
  );
  assert(
    anonymousState.response.status === 401 &&
      anonymousState.payload?.error === "UNAUTHORIZED_PLAYER",
    "Room state must require player credentials",
  );

  const wrongState = await requestJson(
    "/api/rooms/" +
      host.code +
      "/state?playerId=" +
      encodeURIComponent(host.playerId) +
      "&token=" +
      encodeURIComponent("x".repeat(32)),
  );
  assert(
    wrongState.response.status === 401 &&
      wrongState.payload?.error === "UNAUTHORIZED_PLAYER",
    "Wrong player token must not expose room state",
  );

  const guestJoin = await postJson(
    "/api/rooms/" + host.code + "/join",
    { name: "SecureGuest" + suffix },
  );
  assert(guestJoin.response.status === 201, "Guest join failed");
  const guest = guestJoin.payload;

  hostSocket = await openSocket(playerWsUrl(host));
  guestSocket = await openSocket(playerWsUrl(guest));

  const guestHostOnly = waitForMessage(
    guestSocket,
    (payload) =>
      payload.type === "error" && payload.error === "HOST_ONLY",
    "guest host-only denial",
  );
  send(guestSocket, { type: "display-token" });
  await guestHostOnly;

  const invalidSettings = waitForMessage(
    hostSocket,
    (payload) =>
      payload.type === "error" &&
      payload.error === "INVALID_SETTINGS",
    "invalid settings rejection",
  );
  send(hostSocket, {
    type: "settings",
    settings: {
      groupType: "family",
      youngestAge: 7,
      maxIntensity: 2,
    },
  });
  await invalidSettings;

  const guestFinishDenied = waitForMessage(
    guestSocket,
    (payload) =>
      payload.type === "error" && payload.error === "HOST_ONLY",
    "guest finish denial",
  );
  send(guestSocket, { type: "finish" });
  await guestFinishDenied;

  const oversizedFrame = waitForMessage(
    hostSocket,
    (payload) =>
      payload.type === "error" &&
      payload.error === "MESSAGE_TOO_LARGE",
    "oversized websocket rejection",
  );
  send(
    hostSocket,
    JSON.stringify({
      type: "sync",
      padding: "x".repeat(3000),
    }),
  );
  await oversizedFrame;

  const rateLimited = waitForMessage(
    guestSocket,
    (payload) =>
      payload.type === "error" &&
      payload.error === "RATE_LIMITED" &&
      payload.retryAfterMs > 0,
    "websocket rate limit",
  );

  for (let index = 0; index < 70; index += 1) {
    send(guestSocket, "ping");
  }
  await rateLimited;

  console.log(
    "Security integration smoke passed for room",
    host.code,
  );
} finally {
  try {
    hostSocket?.close();
  } catch {}
  try {
    guestSocket?.close();
  } catch {}
}
