import assert from "node:assert/strict";
import test from "node:test";
import {
  consumeFixedWindow,
  DECK_VERSION,
  MAX_JSON_BODY_BYTES,
  readJsonObject,
  validateClientEvent,
  validatePlayerName,
  validateQuestionPool,
  validateRoomSettings,
} from "../src/security.mjs";

test("player names normalize safely and reject controls/spoofing characters", () => {
  assert.deepEqual(validatePlayerName("  María   José  "), {
    ok: true,
    value: "María José",
  });
  assert.equal(validatePlayerName("Sam\u202Euel").ok, false);
  assert.equal(validatePlayerName("   ---   ").ok, false);
  assert.equal(validatePlayerName("a".repeat(25)).ok, false);
});

test("question pools reject duplicates and out-of-range indexes", () => {
  assert.deepEqual(validateQuestionPool([0, 2, 209]), [0, 2, 159]);
  assert.equal(validateQuestionPool([0, 0]), null);
  assert.equal(validateQuestionPool([-1, 2]), null);
  assert.equal(validateQuestionPool([0, 210]), null);
});

test("room settings are strict", () => {
  assert.equal(
    validateRoomSettings({
      groupType: "family",
      youngestAge: 12,
      maxIntensity: 2,
    }),
    true,
  );
  assert.equal(
    validateRoomSettings({
      groupType: "family",
      youngestAge: 7,
      maxIntensity: 2,
    }),
    false,
  );
});

test("client events reject malformed values before game logic", () => {
  assert.equal(validateClientEvent({ type: "ready", ready: "yes" }).ok, false);
  assert.deepEqual(
    validateClientEvent({
      type: "start",
      deckVersion: DECK_VERSION,
      questionPool: [0, 1, 2],
    }),
    { ok: true },
  );
  assert.equal(
    validateClientEvent({
      type: "save-moment",
      saved: "true",
      expectedTurnNumber: 1,
    }).ok,
    false,
  );
});

test("fixed-window limiter resets and reports retry time", () => {
  let result = consumeFixedWindow(null, 1000, 2, 10000);
  assert.equal(result.allowed, true);

  result = consumeFixedWindow(result.state, 1100, 2, 10000);
  assert.equal(result.allowed, true);

  result = consumeFixedWindow(result.state, 1200, 2, 10000);
  assert.equal(result.allowed, false);
  assert.equal(result.retryAfterMs, 9800);

  result = consumeFixedWindow(result.state, 11000, 2, 10000);
  assert.equal(result.allowed, true);
  assert.deepEqual(result.state, { startedAt: 11000, count: 1 });
});

test("JSON reader enforces media type, object shape and payload size", async () => {
  const unsupported = await readJsonObject(
    new Request("https://example.test", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "{}",
    }),
  );
  assert.equal(unsupported.status, 415);

  const invalid = await readJsonObject(
    new Request("https://example.test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "[]",
    }),
  );
  assert.equal(invalid.status, 400);

  const tooLarge = await readJsonObject(
    new Request("https://example.test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: "x".repeat(MAX_JSON_BODY_BYTES) }),
    }),
  );
  assert.equal(tooLarge.status, 413);
});

test("special-round controls validate mode, timing and vote choices", () => {
  assert.equal(
    validateRoomSettings({
      groupType: "family", youngestAge: 12, maxIntensity: 2,
      specialEvery: 3,
      specialModes: ["likely", "everyone", "challenge", "chain", "gold"],
    }),
    true,
  );
  assert.equal(
    validateRoomSettings({
      groupType: "family", youngestAge: 12, maxIntensity: 2,
      specialEvery: 1,
      specialModes: ["gold"],
    }),
    false,
  );
  assert.equal(
    validateRoomSettings({
      groupType: "family", youngestAge: 12, maxIntensity: 2,
      specialEvery: 3,
      specialModes: ["gold", "gold"],
    }),
    false,
  );
  assert.equal(
    validateClientEvent({
      type: "special-now",
      kind: "gold",
      expectedTurnNumber: 2,
    }).ok,
    true,
  );
  assert.equal(
    validateClientEvent({
      type: "special-now",
      kind: "untrusted",
      expectedTurnNumber: 2,
    }).ok,
    false,
  );
  assert.equal(
    validateClientEvent({
      type: "special-vote",
      choice: "../sensitive",
      expectedTurnNumber: 2,
    }).ok,
    false,
  );
  assert.equal(
    validateClientEvent({
      type: "special-vote",
      choice: "1",
      expectedTurnNumber: 2,
    }).ok,
    true,
  );
});

test("editorial packs reject spoofed names, duplicates and invalid settings", () => {
  const base = {
    groupType: "family",
    youngestAge: 8,
    maxIntensity: 1,
    specialEvery: 3,
    specialModes: ["likely", "everyone", "challenge", "chain", "gold"],
  };
  assert.equal(validateRoomSettings({ ...base, specialPacks: ["classic", "fiesta", "conexiones"] }), true);
  assert.equal(validateRoomSettings({ ...base, specialPacks: [] }), true);
  assert.equal(validateRoomSettings({ ...base, specialPacks: ["fiesta", "fiesta"] }), false);
  assert.equal(validateRoomSettings({ ...base, specialPacks: ["unknown"] }), false);
  assert.equal(validateRoomSettings({ ...base, specialPacks: "classic" }), false);
  assert.equal(validateClientEvent({
    type: "settings",
    settings: { ...base, specialPacks: ["conexiones"] },
  }).ok, true);
  assert.equal(validateClientEvent({
    type: "settings",
    settings: { ...base, specialPacks: ["<script>"] },
  }).ok, false);
});
