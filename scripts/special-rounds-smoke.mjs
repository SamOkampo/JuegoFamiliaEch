const base =
  process.env.GAME_API_URL ??
  "https://juego-familia-ech.socampoecheverry.workers.dev";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function createOrJoin(path, name) {
  const response = await fetch(base + path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await response.json();
  assert(response.status === 201, path + " " + JSON.stringify(data));
  return data;
}

function wsUrl(code, params) {
  const url = new URL(base + "/api/rooms/" + code + params.route);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  for (const [key, value] of Object.entries(params.auth)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

function open(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const timeout = setTimeout(() => reject(new Error("WebSocket timeout")), 10000);
    ws.addEventListener("open", () => {
      clearTimeout(timeout);
      resolve(ws);
    }, { once: true });
    ws.addEventListener("error", () => {
      clearTimeout(timeout);
      reject(new Error("WebSocket connect failed"));
    }, { once: true });
  });
}

function expectMessage(ws, predicate, label) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.removeEventListener("message", handler);
      reject(new Error("Timed out: " + label));
    }, 12000);

    function handler(message) {
      try {
        const data = JSON.parse(String(message.data));
        if (predicate(data)) {
          clearTimeout(timeout);
          ws.removeEventListener("message", handler);
          resolve(data);
        }
      } catch {
        // Ignore pongs and unrelated frames.
      }
    }
    ws.addEventListener("message", handler);
  });
}

function waitSnapshot(ws, predicate, label) {
  return expectMessage(
    ws,
    (event) => event.type === "snapshot" && event.room && predicate(event.room),
    label,
  ).then((event) => event.room);
}

function send(ws, type, data = {}) {
  ws.send(JSON.stringify({ type, ...data }));
}

async function execute(ws, type, data, predicate, label) {
  const done = waitSnapshot(ws, predicate, label);
  send(ws, type, data);
  return done;
}

function expectError(ws, type, data, error) {
  const done = expectMessage(
    ws,
    (event) => event.type === "error" && event.error === error,
    type + " -> " + error,
  );
  send(ws, type, data);
  return done;
}

const random = Math.random().toString(36).slice(2, 8).toUpperCase();
const host = await createOrJoin("/api/rooms", "Host" + random);
const guest = await createOrJoin("/api/rooms/" + host.code + "/join", "Guest" + random);
const hostWs = await open(wsUrl(host.code, {
  route: "/ws",
  auth: { playerId: host.playerId, token: host.token },
}));
const guestWs = await open(wsUrl(guest.code, {
  route: "/ws",
  auth: { playerId: guest.playerId, token: guest.token },
}));
let display;

try {
  await expectError(guestWs, "special-now", {
    kind: "likely", expectedTurnNumber: 1,
  }, "HOST_ONLY");

  const settings = {
    groupType: "family",
    youngestAge: 12,
    maxIntensity: 2,
    specialEvery: 3,
    specialModes: ["everyone", "chain", "gold", "challenge", "likely"],
  };
  await execute(hostWs, "settings", { settings },
    (room) => room.settings.specialModes.length === 5 &&
      room.settings.specialEvery === 3, "settings synchronized");

  await execute(hostWs, "ready", { ready: true },
    (room) => room.players.find((p) => p.id === host.playerId)?.ready, "host ready");
  await execute(hostWs, "sync", {},
    (room) => room.players.length === 2, "sync players");
  await execute(hostWs, "ready", { ready: true },
    (room) => room.players.find((p) => p.id === host.playerId)?.ready, "host still ready");
  await execute(guestWs, "ready", { ready: true },
    (room) => room.canStart, "both ready");

  const started = await execute(hostWs, "start",
    { deckVersion: "core-v2-160", questionPool: Array.from({length:24}, (_, i) => i) },
    (room) => room.status === "playing" && room.game?.turnNumber === 1,
    "game starts");

  assert(started.game.special === null, "Turn 1 should be ordinary");
  await expectError(guestWs, "special-now", {
    kind: "likely", expectedTurnNumber: 1,
  }, "HOST_ONLY");

  const tokenPromise = expectMessage(
    hostWs, (x) => x.type === "display-token", "display token",
  );
  send(hostWs, "display-token");
  const token = (await tokenPromise).token;
  display = await open(wsUrl(host.code, {
    route: "/display/ws", auth: { token },
  }));

  const first = await execute(hostWs, "special-now",
    { kind: "likely", expectedTurnNumber: 1 },
    (room) => room.game?.special?.kind === "likely",
    "manual likelihood card");

  assert(first.game.questionIndex === null, "Special must not expose ordinary question");
  assert(first.game.special.tally === null, "Ballots must remain private");

  await expectError(display, "special-vote",
    { choice: host.playerId, expectedTurnNumber: 1 }, "DISPLAY_READ_ONLY");

  await expectError(hostWs, "special-vote",
    { choice: "not-a-participant", expectedTurnNumber: 1 },
    "INVALID_SPECIAL_VOTE");

  const ack1 = expectMessage(hostWs, (x) => x.type === "special-vote-set", "host vote ack");
  const firstVote = waitSnapshot(hostWs,
    (r) => r.game?.special?.voteCount === 1, "one secret vote");
  send(hostWs, "special-vote", { choice: guest.playerId, expectedTurnNumber: 1 });
  await ack1;
  const hidden = await firstVote;
  assert(hidden.game.special.tally === null, "Tally must be hidden after first vote");

  const hiddenBoth = await execute(guestWs, "special-vote",
    { choice: guest.playerId, expectedTurnNumber: 1 },
    (r) => r.game?.special?.voteCount === 2,
    "both ballots submitted");
  assert(hiddenBoth.game.special.tally === null, "No tally leak to voters");

  const displayHidden = await execute(display, "sync", {},
    (r) => r.game?.special?.voteCount === 2, "display sees sealed ballots");
  assert(displayHidden.game.special.tally === null, "No tally leak to TV");

  await expectError(guestWs, "special-reveal",
    { expectedTurnNumber: 1 }, "HOST_ONLY");

  const revealed = await execute(hostWs, "special-reveal",
    { expectedTurnNumber: 1 },
    (r) => r.game?.special?.revealed === true,
    "host reveals vote");
  assert(revealed.game.special.tally[guest.playerId] === 2,
    "Aggregated result should contain two votes");

  const second = await execute(hostWs, "next-turn", { expectedTurnNumber: 1 },
    (r) => r.game?.turnNumber === 2, "advance past special");
  assert(second.game.special === null, "Turn 2 is normal");
  assert(second.game.usedQuestionCount === 1,
    "Manual surprise must not waste an unrevealed question");

  await execute(hostWs, "reveal", {expectedTurnNumber: 2},
    (r) => r.game?.turnNumber === 2 && r.game?.revealed,
    "turn 2 reveal");

  const third = await execute(hostWs, "next-turn", {expectedTurnNumber: 2},
    (r) => r.game?.turnNumber === 3, "automatic turn 3");
  assert(third.game.special?.kind === "everyone",
    "Every third turn uses enabled kind in order");

  const group1 = await execute(hostWs, "special-vote",
    { choice: "1", expectedTurnNumber: 3 },
    (r) => r.game?.special?.voteCount === 1, "group first vote");
  assert(group1.game.special.tally === null, "Group vote hidden");
  await execute(guestWs, "special-vote",
    { choice: "1", expectedTurnNumber: 3 },
    (r) => r.game?.special?.voteCount === 2, "group second vote");
  const groupRevealed = await execute(hostWs, "special-reveal",
    {expectedTurnNumber: 3},
    (r) => r.game?.special?.revealed,
    "group result reveal");
  assert(groupRevealed.game.special.tally["1"] === 2,
    "Group vote result should be accurate");

  await execute(hostWs, "next-turn", {expectedTurnNumber: 3},
    (r) => r.game?.turnNumber === 4 && r.game.special === null,
    "pass group turn");
  await execute(hostWs, "reveal", {expectedTurnNumber: 4},
    (r) => r.game?.turnNumber === 4 && r.game.revealed,
    "turn 4 reveal");
  await execute(hostWs, "next-turn", {expectedTurnNumber: 4},
    (r) => r.game?.turnNumber === 5, "turn 5");
  await execute(hostWs, "reveal", {expectedTurnNumber: 5},
    (r) => r.game?.turnNumber === 5 && r.game.revealed,
    "turn 5 reveal");
  const sixth = await execute(hostWs, "next-turn", {expectedTurnNumber: 5},
    (r) => r.game?.turnNumber === 6 && r.game.special !== null,
    "turn 6 chain");
  assert(sixth.game.special.kind === "chain", "Second automatic kind is chain");

  const contributed = await execute(guestWs, "special-contribute",
    {expectedTurnNumber: 6},
    (r) => r.game?.special?.contributorCount === 1, "chain contribution");
  assert(contributed.game.special.tally === null, "Chain has no voting tally");
  const duplicated = await execute(hostWs, "sync", {},
    (r) => r.game?.special?.contributorCount === 1, "contribution stays one");
  assert(duplicated.game.special.contributorCount === 1, "Contributors unique");

  await execute(hostWs, "next-turn", {expectedTurnNumber: 6},
    (r) => r.game?.turnNumber === 7, "turn 7");
  await execute(hostWs, "special-now", {kind:"gold", expectedTurnNumber:7},
    (r) => r.game?.special?.kind === "gold", "gold card");
  await execute(hostWs, "next-turn", {expectedTurnNumber:7},
    (r) => r.game?.turnNumber === 8, "turn 8");
  await execute(hostWs, "special-now", {kind:"challenge", expectedTurnNumber:8},
    (r) => r.game?.special?.kind === "challenge", "optional challenge");
  const ninth = await execute(hostWs, "next-turn", {expectedTurnNumber:8},
    (r) => r.game?.turnNumber === 9, "turn 9 after optional challenge");
  assert(ninth.game.special?.kind === "gold", "Third automatic kind is gold");
  assert(ninth.game.specialHistory.length >= 6, "History tracks each special round");

  console.log(
    "SPECIAL_ROUNDS_SMOKE_PASS",
    host.code,
    "turns", ninth.game.turnNumber,
    "specials", ninth.game.specialHistory.length,
  );
} finally {
  for (const ws of [display, hostWs, guestWs]) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try { ws.close(); } catch {}
    }
  }
}
