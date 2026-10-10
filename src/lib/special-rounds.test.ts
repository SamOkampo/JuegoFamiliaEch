import assert from "node:assert/strict";
import test from "node:test";
import {
  SPECIAL_CARDS,
  SPECIAL_KINDS,
  SPECIAL_PACKS,
  SPECIAL_DECK_VERSION,
  eligibleSpecialCardIndexes,
  countSpecialCards,
  specialCard,
} from "./special-rounds";
import type { SpecialCardFilters } from "./special-rounds";

const groups = ["family", "friends", "couple", "mixed"] as const;
const normalize = (value: string) => value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

test("100 distinct original special cards across five kinds and three packs", () => {
  assert.equal(SPECIAL_DECK_VERSION, "special-v4-100-co");
  assert.deepEqual(SPECIAL_PACKS, ["classic", "fiesta", "conexiones"]);
  const ids = new Set<string>();
  const prompts = new Set<string>();

  for (const kind of SPECIAL_KINDS) {
    assert.equal(SPECIAL_CARDS[kind].length, 20);
    const packCounts = new Map<string, number>();
    for (const card of SPECIAL_CARDS[kind]) {
      assert.match(card.id, new RegExp("^" + kind + "-\\d{2}$"));
      assert.ok(card.prompt.length >= 27, card.id + ": prompt too short");
      assert.ok(card.hint.length >= 28, card.id + ": hint too short");
      assert.ok(card.seconds >= 15 && card.seconds <= 60);
      assert.ok([8, 12, 16].includes(card.minAge));
      assert.ok([1, 2, 3].includes(card.intensity));
      assert.ok(SPECIAL_PACKS.includes(card.pack));
      assert.ok(card.audiences.length > 0);
      assert.ok(card.audiences.every((audience) => groups.includes(audience)));
      assert.equal(new Set(card.audiences).size, card.audiences.length);
      assert.equal(Boolean(card.choices), kind === "everyone");
      if (card.choices) {
        assert.equal(card.choices.length, 2);
        assert.ok(card.choices[0] !== card.choices[1]);
      }
      assert.equal(ids.has(card.id), false, card.id + ": duplicate id");
      assert.equal(prompts.has(normalize(card.prompt)), false, card.id + ": duplicate prompt");
      ids.add(card.id);
      prompts.add(normalize(card.prompt));
      packCounts.set(card.pack, (packCounts.get(card.pack) ?? 0) + 1);
    }
    assert.deepEqual(Object.fromEntries(packCounts), { classic: 8, fiesta: 6, conexiones: 6 });
  }
  assert.equal(ids.size, 100);
  assert.equal(prompts.size, 100);
  assert.equal(specialCard("gold", 20), null);
});

test("filtering blocks too-old, too-intense and wrong-audience prompts", () => {
  for (const groupType of groups) {
    for (const youngestAge of [8, 12, 16] as const) {
      for (const maxIntensity of [1, 2, 3] as const) {
        for (const pack of SPECIAL_PACKS) {
          const settings: SpecialCardFilters = {
            groupType, youngestAge, maxIntensity, specialPacks: [pack],
          };
          for (const kind of SPECIAL_KINDS) {
            const indexes = eligibleSpecialCardIndexes(kind, settings);
            assert.ok(indexes.length >= 1, JSON.stringify({ kind, settings }));
            for (const index of indexes) {
              const card = specialCard(kind, index);
              assert.ok(card);
              assert.ok(card.minAge <= youngestAge);
              assert.ok(card.intensity <= maxIntensity);
              assert.ok(card.audiences.includes(groupType));
              assert.equal(card.pack, pack);
            }
          }
        }
      }
    }
  }
});

test("pack selections respect empty or combined sets", () => {
  const settings: SpecialCardFilters = {
    groupType: "family", youngestAge: 16, maxIntensity: 3,
    specialPacks: ["classic", "fiesta", "conexiones"],
  };
  assert.equal(countSpecialCards(settings), 80); // four friends-only cards per mode are excluded
  assert.equal(countSpecialCards({ ...settings, specialPacks: [] }), 0);
  for (const kind of SPECIAL_KINDS) {
    assert.ok(eligibleSpecialCardIndexes(kind, { ...settings, specialPacks: ["classic"] }).length >= 4);
  }
});
