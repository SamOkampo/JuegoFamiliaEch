import assert from "node:assert/strict";
import test from "node:test";
import {
  INITIAL_RECONNECT_DELAY_MS,
  MAX_RECONNECT_DELAY_MS,
  nextReconnectDelay,
} from "./use-resilient-websocket";

test("reconnect delay doubles with an eight second ceiling", () => {
  assert.equal(
    nextReconnectDelay(INITIAL_RECONNECT_DELAY_MS),
    2000,
  );
  assert.equal(nextReconnectDelay(2000), 4000);
  assert.equal(nextReconnectDelay(4000), 8000);
  assert.equal(nextReconnectDelay(8000), MAX_RECONNECT_DELAY_MS);
  assert.equal(nextReconnectDelay(30_000), MAX_RECONNECT_DELAY_MS);
});
