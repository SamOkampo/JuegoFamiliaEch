const api = process.env.GAME_API_URL ??
  "https://juego-familia-ech.socampoecheverry.workers.dev";

function assert(value, label) {
  if (!value) throw new Error(label);
}
async function post(path, body) {
  const response = await fetch(api + path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: response.status, data: await response.json() };
}
function wsUrl(session) {
  const url = new URL(api + "/api/rooms/" + session.code + "/ws");
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("playerId", session.playerId);
  url.searchParams.set("token", session.token);
  return url;
}
function open(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const timer = setTimeout(() => reject(new Error("WebSocket timeout")), 10000);
    ws.addEventListener("open", () => {
      clearTimeout(timer);
      resolve(ws);
    }, { once: true });
    ws.addEventListener("error", () => {
      clearTimeout(timer);
      reject(new Error("WebSocket open failed"));
    }, { once: true });
  });
}
function wait(ws, predicate, description) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeEventListener("message", handler);
      reject(new Error("Timed out: " + description));
    }, 12000);
    function handler(event) {
      try {
        const message = JSON.parse(String(event.data));
        if (predicate(message)) {
          clearTimeout(timer);
          ws.removeEventListener("message", handler);
          resolve(message);
        }
      } catch {
        // Ignore non-JSON frames.
      }
    }
    ws.addEventListener("message", handler);
  });
}
async function action(ws, event, predicate, description) {
  const pending = wait(ws, predicate, description);
  ws.send(JSON.stringify(event));
  return pending;
}

const suffix = Math.random().toString(36).slice(2, 8);
const rejected = await post("/api/rooms", {
  name: "Invalid" + suffix,
  mode: "other-family",
});
assert(rejected.status === 400 && rejected.data.error === "INVALID_ROOM_MODE",
  "Unrecognized family modes must be rejected");

const hostCreate = await post("/api/rooms", {
  name: "Host" + suffix, mode: "echeverry",
});
assert(hostCreate.status === 201, "Create Echeverry room");
const host = hostCreate.data;
assert(host.room.mode === "echeverry", "Family mode must persist");

const join = await post("/api/rooms/" + host.code + "/join", {
  name: "Guest" + suffix,
});
assert(join.status === 201, "Guest joins");
assert(join.data.room.mode === "echeverry", "Guest inherits family mode");
const guest = join.data;

const hostWs = await open(wsUrl(host));
const guestWs = await open(wsUrl(guest));

try {
  const hostReady = await action(hostWs, { type: "ready", ready: true },
    (x) => x.type === "snapshot" &&
      x.room?.players.some((p) => p.id === host.playerId && p.ready),
    "host ready");
  assert(hostReady.room.mode === "echeverry", "Snapshot retains mode");

  await action(guestWs, { type: "ready", ready: true },
    (x) => x.type === "snapshot" && x.room?.canStart,
    "guest ready");

  const mismatch = await action(hostWs, {
    type: "start",
    deckVersion: "core-v3-210-co",
    questionPool: [0, 2],
  }, (x) => x.type === "error" && x.error === "DECK_VERSION_MISMATCH",
  "reject generic deck");
  assert(mismatch.error === "DECK_VERSION_MISMATCH", "Wrong deck blocked");

  const inappropriate = await action(hostWs, {
    type: "start",
    deckVersion: "echeverry-v1",
    questionPool: [0, 14],
  }, (x) => x.type === "error" && x.error === "INVALID_QUESTION_POOL",
  "under-age prompt blocked");
  assert(inappropriate.error === "INVALID_QUESTION_POOL",
    "Server prevents age-gate bypass");

  const started = await action(hostWs, {
    type: "start",
    deckVersion: "echeverry-v1",
    questionPool: [0, 2, 3, 4, 5],
  }, (x) => x.type === "snapshot" && x.room?.status === "playing",
  "start dedicated family game");

  assert(started.room.game.deckVersion === "echeverry-v1",
    "Game uses dedicated deck");
  assert(started.room.game.questionIndex === null,
    "Question hidden before reveal");

  const revealed = await action(hostWs, {
    type: "reveal",
    expectedTurnNumber: 1,
  }, (x) => x.type === "snapshot" &&
    x.room?.game?.revealed === true,
  "reveal family question");
  assert(revealed.room.game.questionIndex >= 0 &&
    revealed.room.game.questionIndex < 50,
    "Family index always belongs to dedicated deck");

  const regular = await post("/api/rooms", {
    name: "Standard" + suffix,
  });
  assert(regular.status === 201 &&
    regular.data.room.mode === "standard",
    "Other rooms remain standard");

  console.log("FAMILY_ECHEVERRY_SMOKE_PASS", host.code);
} finally {
  hostWs.close();
  guestWs.close();
}
