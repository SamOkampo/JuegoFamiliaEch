const baseUrl =
  process.env.GAME_API_URL ??
  "https://juego-familia-ech.socampoecheverry.workers.dev";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function post(path, body) {
  const response = await fetch(baseUrl + path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(path + " failed: " + JSON.stringify(payload));
  }
  return payload;
}

function wsUrl(session) {
  const url = new URL(
    baseUrl + "/api/rooms/" + session.code + "/ws",
  );
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("playerId", session.playerId);
  url.searchParams.set("token", session.token);
  return url.toString();
}

function openSocket(session) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl(session));
    const timer = setTimeout(() => reject(new Error("WebSocket open timeout")), 10000);

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

function waitForSnapshot(ws, predicate, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeEventListener("message", onMessage);
      reject(new Error("Timed out waiting for " + label));
    }, 12000);

    function onMessage(event) {
      try {
        const payload = JSON.parse(String(event.data));
        if (
          payload.type === "snapshot" &&
          payload.room &&
          predicate(payload.room)
        ) {
          clearTimeout(timer);
          ws.removeEventListener("message", onMessage);
          resolve(payload.room);
        }
      } catch {
        // Ignore non-JSON frames.
      }
    }

    ws.addEventListener("message", onMessage);
  });
}

function send(ws, event) {
  ws.send(JSON.stringify(event));
}

const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
let hostSocket;
let guestSocket;

try {
  const host = await post("/api/rooms", { name: "Host" + suffix });
  const guest = await post("/api/rooms/" + host.code + "/join", {
    name: "Guest" + suffix,
  });

  hostSocket = await openSocket(host);
  guestSocket = await openSocket(guest);

  const readyHost = waitForSnapshot(
    hostSocket,
    (room) => room.players.some((p) => p.id === host.playerId && p.ready),
    "host ready",
  );
  send(hostSocket, { type: "ready", ready: true });
  await readyHost;

  const readyAll = waitForSnapshot(
    hostSocket,
    (room) => room.canStart === true,
    "all players ready",
  );
  send(guestSocket, { type: "ready", ready: true });
  await readyAll;

  const started = waitForSnapshot(
    hostSocket,
    (room) => room.status === "playing" && room.game?.turnNumber === 1,
    "game start",
  );
  send(hostSocket, { type: "start" });
  const startedRoom = await started;

  assert(startedRoom.game, "Expected game state after start");
  const controller =
    startedRoom.game.currentPlayerId === host.playerId
      ? hostSocket
      : guestSocket;

  const revealed = waitForSnapshot(
    guestSocket,
    (room) => room.game?.revealed === true && room.game?.questionIndex !== null,
    "question reveal",
  );
  send(controller, {
    type: "reveal",
    expectedTurnNumber: startedRoom.game.turnNumber,
  });
  const revealedRoom = await revealed;

  const advanced = waitForSnapshot(
    hostSocket,
    (room) => room.game?.turnNumber === 2 || room.status === "finished",
    "next turn",
  );
  send(controller, {
    type: "next-turn",
    expectedTurnNumber: revealedRoom.game.turnNumber,
  });
  const advancedRoom = await advanced;

  if (advancedRoom.status === "playing") {
    const finished = waitForSnapshot(
      guestSocket,
      (room) => room.status === "finished",
      "host finish",
    );
    send(hostSocket, { type: "finish" });
    await finished;
  }

  console.log(
    "Cloudflare multiplayer smoke passed for room",
    host.code,
  );
} finally {
  try {
    if (hostSocket?.readyState === WebSocket.OPEN) {
      send(hostSocket, { type: "leave" });
      hostSocket.close();
    }
  } catch {}
  try {
    if (guestSocket?.readyState === WebSocket.OPEN) {
      send(guestSocket, { type: "leave" });
      guestSocket.close();
    }
  } catch {}
}
