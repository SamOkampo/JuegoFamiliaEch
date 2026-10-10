import assert from "node:assert/strict";
import test from "node:test";
import { FAMILY_ECHEVERRY_QUESTIONS, ECHEVERRY_DECK_VERSION, echeverryQuestionPool } from "./family-echeverry";
import { QUESTIONS } from "./questions";

test("family mode has exactly 50 distinct, original family-safe prompts", () => {
  assert.equal(ECHEVERRY_DECK_VERSION, "echeverry-v1");
  assert.equal(FAMILY_ECHEVERRY_QUESTIONS.length, 50);
  assert.equal(new Set(FAMILY_ECHEVERRY_QUESTIONS.map((q) => q.id)).size, 50);
  assert.equal(
    new Set(FAMILY_ECHEVERRY_QUESTIONS.map((q) => q.text.normalize("NFC").toLowerCase())).size,
    50,
  );
  for (const question of FAMILY_ECHEVERRY_QUESTIONS) {
    assert.ok(question.text.length >= 40);
    assert.ok(question.audiences.includes("family"));
    assert.ok(question.minAge === 8 || question.minAge === 12 || question.minAge === 16);
    assert.ok(question.intensity >= 1 && question.intensity <= 3);
    assert.doesNotMatch(question.text, /(?:\+57\s?|\b3\d{9}\b|https?:\/\/|@\w+|\[\d{1,2}\/\d{1,2}\/\d{2,4})/);
  }
});

test("age and intensity filtering never reveals an ineligible family prompt", () => {
  for (const age of [8, 12, 16, 18] as const) {
    for (const intensity of [1, 2, 3] as const) {
      const eligible = echeverryQuestionPool({
        youngestAge: age,
        maxIntensity: intensity,
        groupType: "family",
      });
      assert.ok(eligible.length >= 2);
      for (const index of eligible) {
        assert.ok(FAMILY_ECHEVERRY_QUESTIONS[index].minAge <= age);
        assert.ok(FAMILY_ECHEVERRY_QUESTIONS[index].intensity <= intensity);
      }
    }
  }
});

test("standard public deck remains unchanged by family mode", () => {
  assert.equal(QUESTIONS.length, 210);
  assert.ok(!QUESTIONS.some((question) => question.id.startsWith("ech-")));
});
