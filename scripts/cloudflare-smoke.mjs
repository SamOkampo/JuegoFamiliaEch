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

function playerWsUrl(session) {
  const url = new URL(
    baseUrl + "/api/rooms/" + session.code + "/ws",
  );
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("playerId", session.playerId);
  url.searchParams.set("token", session.token);
  return url.toString();
}

function displayWsUrl(code, token) {
  const url = new URL(
    baseUrl + "/api/rooms/" + code + "/display/ws",
  );
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("token", token);
  return url.toString();
}

function openUrlSocket(url) {
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

function openPlayerSocket(session) {
  return openUrlSocket(playerWsUrl(session));
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
        // Ignore non-JSON frames.
      }
    }

    ws.addEventListener("message", onMessage);
  });
}

function waitForSnapshot(ws, predicate, label) {
  return waitForMessage(
    ws,
    (payload) =>
      payload.type === "snapshot" &&
      payload.room &&
      predicate(payload.room),
    label,
  ).then((payload) => payload.room);
}

function send(ws, event) {
  ws.send(JSON.stringify(event));
}

const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
let hostSocket;
let guestSocket;
let displaySocket;

try {
  const host = await post("/api/rooms", { name: "Host" + suffix });
  const guest = await post("/api/rooms/" + host.code + "/join", {
    name: "Guest" + suffix,
  });

  hostSocket = await openPlayerSocket(host);
  guestSocket = await openPlayerSocket(guest);

  const displayTokenMessage = waitForMessage(
    hostSocket,
    (payload) =>
      payload.type === "display-token" &&
      typeof payload.token === "string" &&
      payload.token.length > 10,
    "host display token",
  );
  send(hostSocket, { type: "display-token" });
  const { token: displayToken } = await displayTokenMessage;

  displaySocket = await openUrlSocket(
    displayWsUrl(host.code, displayToken),
  );

  const initialDisplay = waitForSnapshot(
    displaySocket,
    (room) => room.code === host.code && room.status === "lobby",
    "display lobby snapshot",
  );
  send(displaySocket, { type: "sync" });
  await initialDisplay;

  const displayDenied = waitForMessage(
    displaySocket,
    (payload) =>
      payload.type === "error" &&
      payload.error === "DISPLAY_READ_ONLY",
    "display read-only rejection",
  );
  send(displaySocket, { type: "ready", ready: true });
  await displayDenied;

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
  const displayStarted = waitForSnapshot(
    displaySocket,
    (room) => room.status === "playing" && room.game?.turnNumber === 1,
    "display game start",
  );

  send(hostSocket, {
    type: "start",
    deckVersion: "core-v2-160",
    questionPool: [0, 1, 2, 3, 4, 5],
  });

  const [startedRoom, displayStartedRoom] = await Promise.all([
    started,
    displayStarted,
  ]);
  assert(startedRoom.game, "Expected game state after start");
  assert(
    displayStartedRoom.game?.questionIndex === null,
    "Display must not see the question before reveal",
  );

  const controller =
    startedRoom.game.currentPlayerId === host.playerId
      ? hostSocket
      : guestSocket;

  const revealed = waitForSnapshot(
    guestSocket,
    (room) => room.game?.revealed === true && room.game?.questionIndex !== null,
    "question reveal",
  );
  const displayRevealed = waitForSnapshot(
    displaySocket,
    (room) => room.game?.revealed === true && room.game?.questionIndex !== null,
    "display question reveal",
  );

  send(controller, {
    type: "reveal",
    expectedTurnNumber: startedRoom.game.turnNumber,
  });

  const [revealedRoom, displayRevealedRoom] = await Promise.all([
    revealed,
    displayRevealed,
  ]);

  assert(
    revealedRoom.game.questionIndex === displayRevealedRoom.game.questionIndex,
    "Display and players must receive the same revealed question",
  );

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
      displaySocket,
      (room) => room.status === "finished",
      "display host finish",
    );
    send(hostSocket, { type: "finish" });
    await finished;
  }

  console.log(
    "Cloudflare multiplayer + read-only display smoke passed for room",
    host.code,
  );
} finally {
  try {
    if (displaySocket?.readyState === WebSocket.OPEN) {
      displaySocket.close();
    }
  } catch {}
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
