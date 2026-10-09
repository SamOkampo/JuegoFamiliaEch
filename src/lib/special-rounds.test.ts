import assert from "node:assert/strict";
import test from "node:test";
import { SPECIAL_CARDS, SPECIAL_KINDS, specialCard } from "./special-rounds";

test("five special modes each have four original, complete cards", () => {
  const prompts = new Set<string>();
  assert.equal(SPECIAL_KINDS.length, 5);
  for (const kind of SPECIAL_KINDS) {
    assert.equal(SPECIAL_CARDS[kind].length, 4);
    for (const card of SPECIAL_CARDS[kind]) {
      assert.ok(card.prompt.length >= 35);
      assert.ok(card.hint.length >= 20);
      assert.ok(card.seconds >= 15 && card.seconds <= 60);
      assert.equal(prompts.has(card.prompt), false);
      prompts.add(card.prompt);
      assert.equal(Boolean(card.choices), kind === "everyone");
    }
  }
  assert.equal(prompts.size, 20);
  assert.equal(specialCard("gold", 4), null);
});
