import assert from "node:assert/strict";
import test from "node:test";
import { telemetrySurface } from "./telemetry";

test("telemetry surface removes room and display identifiers", () => {
  assert.equal(telemetrySurface("/"), "home");
  assert.equal(telemetrySurface("/online?room=ABC123"), "online");
  assert.equal(telemetrySurface("/room/ABC123"), "room");
  assert.equal(telemetrySurface("/display/ABC123"), "display");
  assert.equal(telemetrySurface("/privacy"), "privacy");
  assert.equal(telemetrySurface("/terms"), "terms");
  assert.equal(telemetrySurface("/anything-else"), "other");
});
