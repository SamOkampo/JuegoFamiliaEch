import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDisplayWebSocketUrl,
  buildRoomWebSocketUrl,
  normalizeRoomCode,
  type RoomSession,
} from "./realtime";

test("normalizeRoomCode removes separators and uppercases", () => {
  assert.equal(normalizeRoomCode(" ab-c 12 "), "ABC12");
  assert.equal(normalizeRoomCode("abcdefghi"), "ABCDEF");
});

test("buildRoomWebSocketUrl upgrades https to wss and includes credentials", () => {
  const session: RoomSession = {
    code: "ABC123",
    playerId: "player-1",
    token: "secret-token",
    name: "Samuel",
  };

  const url = new URL(
    buildRoomWebSocketUrl(session, "https://example.workers.dev"),
  );

  assert.equal(url.protocol, "wss:");
  assert.equal(url.pathname, "/api/rooms/ABC123/ws");
  assert.equal(url.searchParams.get("playerId"), "player-1");
  assert.equal(url.searchParams.get("token"), "secret-token");
});


test("buildDisplayWebSocketUrl uses a dedicated read-only display endpoint", () => {
  const url = new URL(
    buildDisplayWebSocketUrl(
      "abc123",
      "display-secret",
      "https://example.workers.dev",
    ),
  );

  assert.equal(url.protocol, "wss:");
  assert.equal(url.pathname, "/api/rooms/ABC123/display/ws");
  assert.equal(url.searchParams.get("token"), "display-secret");
  assert.equal(url.searchParams.has("playerId"), false);
});
