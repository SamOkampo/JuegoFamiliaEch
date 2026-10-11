import assert from "node:assert/strict";
import test from "node:test";
import { FAMILY_TRIVIA_CATEGORIES, FAMILY_TRIVIA_QUESTIONS, familyTriviaForAge } from "./family-trivia";

test("30 verified-fact-required prompts span five family culture categories", () => {
  assert.equal(FAMILY_TRIVIA_QUESTIONS.length, 30);
  assert.equal(new Set(FAMILY_TRIVIA_QUESTIONS.map((q) => q.id)).size, 30);
  assert.deepEqual(
    new Set(FAMILY_TRIVIA_QUESTIONS.map((q) => q.category)),
    new Set(FAMILY_TRIVIA_CATEGORIES),
  );
  assert.ok(FAMILY_TRIVIA_QUESTIONS.every((q) =>
    q.requiresFamilyFact && q.question.endsWith("?") && q.verificationHint.length >= 20,
  ));
});

test("questions do not assert unverified family counts or private answers", () => {
  const count = FAMILY_TRIVIA_QUESTIONS.find((q) => q.id === "gen-01");
  assert.match(count?.question ?? "", /Cuántos nietos tienen los abuelos/);
  assert.equal("answer" in (count ?? {}), false);
});

test("age filter respects youngest player", () => {
  assert.ok(familyTriviaForAge(8).length > 0);
  assert.ok(familyTriviaForAge(8).every((q) => q.age === 8));
  assert.ok(familyTriviaForAge(12).length >= familyTriviaForAge(8).length);
  assert.equal(familyTriviaForAge(16).length, 30);
});
