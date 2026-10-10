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


async function makeRoom(tag, settings) {
  const host = await createOrJoin("/api/rooms", "ContentHost" + tag);
  const guest = await createOrJoin("/api/rooms/" + host.code + "/join", "ContentGuest" + tag);
  const hostWs = await open(wsUrl(host.code, { route: "/ws", auth: { playerId: host.playerId, token: host.token } }));
  const guestWs = await open(wsUrl(host.code, { route: "/ws", auth: { playerId: guest.playerId, token: guest.token } }));

  await execute(hostWs, "settings", { settings },
    (room) => room.settings.specialPacks?.join(",") === settings.specialPacks.join(","),
    "packs are synchronized");
  await execute(hostWs, "ready", { ready: true },
    (room) => room.players.find((p) => p.id === host.playerId)?.ready,
    "host ready");
  await execute(guestWs, "ready", { ready: true },
    (room) => room.canStart, "guest ready");
  const start = await execute(hostWs, "start", {
    deckVersion: "core-v3-210-co",
    questionPool: Array.from({length:32}, (_, i) => i),
  }, (room) => room.status === "playing" && room.game?.turnNumber === 1,
  "game starts");
  return { host, guest, hostWs, guestWs, start };
}

async function next(ws, turn) {
  return execute(ws, "next-turn", { expectedTurnNumber: turn },
    (room) => room.game?.turnNumber === turn + 1,
    "next special turn " + (turn + 1));
}

const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
const connections = [];

try {
  const safe = await makeRoom("SAFE" + suffix, {
    groupType: "family", youngestAge: 8, maxIntensity: 1,
    specialEvery: 0,
    specialModes: ["likely", "everyone", "challenge", "chain", "gold"],
    specialPacks: ["conexiones"],
  });
  connections.push(safe.hostWs, safe.guestWs);
  for (let i = 0; i < 5; i += 1) {
    const kind = ["likely", "everyone", "challenge", "chain", "gold"][i];
    const turn = i + 1;
    const snapshot = await execute(safe.hostWs, "special-now",
      { kind, expectedTurnNumber: turn },
      (room) => room.game?.special?.kind === kind,
      "eligible family-8 gentle " + kind);
    assert(snapshot.game.special.cardIndex === 14,
      "Must select only the age-8 gentle card in Conexiones: " +
       JSON.stringify(snapshot.game.special));
    if (i < 4) await next(safe.hostWs, turn);
  }
  const noPack = await makeRoom("NONE" + suffix, {
    groupType: "family", youngestAge: 8, maxIntensity: 1,
    specialEvery: 0, specialModes: ["likely"], specialPacks: [],
  });
  connections.push(noPack.hostWs, noPack.guestWs);
  await expectError(noPack.hostWs, "special-now",
    { kind: "likely", expectedTurnNumber: 1 }, "SPECIAL_NO_ELIGIBLE_CARD");

  const all = await makeRoom("ALL" + suffix, {
    groupType: "mixed", youngestAge: 16, maxIntensity: 3,
    specialEvery: 0, specialModes: ["likely"],
    specialPacks: ["classic", "fiesta", "conexiones"],
  });
  connections.push(all.hostWs, all.guestWs);
  const seen = new Set();
  let previous = null;
  for (let i = 0; i < 21; i += 1) {
    const turn = i + 1;
    const snapshot = await execute(all.hostWs, "special-now",
      { kind: "likely", expectedTurnNumber: turn },
      (room) => room.game?.special?.kind === "likely",
      "unique special card " + turn);
    const index = snapshot.game.special.cardIndex;
    if (i < 20) {
      assert(!seen.has(index), "Repeated eligible card before exhausting pack: " + index);
      seen.add(index);
    } else {
      assert(index !== previous, "Consecutive repetition after exhausting pack");
    }
    previous = index;
    if (i < 20) await next(all.hostWs, turn);
  }
  assert(seen.size === 20, "All 20 cards for likely mode must be presented before repeating");
  console.log("SPECIAL_CONTENT_SMOKE_PASS", {total:100,unique:seen.size,filters:"age,group,intensity,pack",safeSelection:14});
} finally {
  for (const ws of connections) {
    if (ws.readyState === WebSocket.OPEN) {
      try { ws.close(); } catch { }
    }
  }
}
