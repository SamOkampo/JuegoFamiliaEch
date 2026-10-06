import assert from "node:assert/strict";
import test from "node:test";
import { buildCentralDisplayUrl, buildRoomInviteUrl, buildRoomShareText } from "./presential";

test("buildRoomInviteUrl creates a join deep link", () => {
  assert.equal(
    buildRoomInviteUrl("https://example.com/", " ab-c12 "),
    "https://example.com/online?room=ABC12",
  );
});

test("buildRoomShareText normalizes the room code", () => {
  assert.equal(
    buildRoomShareText("ab12cd"),
    "Únete a mi sala AB12CD en JuegoFamiliaEch.",
  );
});


test("buildCentralDisplayUrl keeps the display token in the URL fragment", () => {
  assert.equal(
    buildCentralDisplayUrl("https://example.com/", "ab12cd", "secret token"),
    "https://example.com/display/AB12CD#token=secret%20token",
  );
});
