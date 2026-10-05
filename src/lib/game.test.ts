import assert from "node:assert/strict";
import test from "node:test";
import {
  cleanPlayerName,
  getQuestion,
  nextPlayerIndex,
  nextQuestionIndex,
} from "./game";
import { QUESTIONS } from "./questions";

test("cleanPlayerName trims, collapses spaces and limits length", () => {
  assert.equal(cleanPlayerName("  Ana   María  "), "Ana María");
  assert.equal(cleanPlayerName("x".repeat(40)).length, 24);
});

test("nextPlayerIndex cycles through the group", () => {
  assert.equal(nextPlayerIndex(0, 4), 1);
  assert.equal(nextPlayerIndex(3, 4), 0);
  assert.equal(nextPlayerIndex(0, 0), 0);
});

test("nextQuestionIndex cycles through the deck", () => {
  assert.equal(nextQuestionIndex(0, 3), 1);
  assert.equal(nextQuestionIndex(2, 3), 0);
});

test("getQuestion returns a deck item and handles an empty deck", () => {
  assert.equal(getQuestion(QUESTIONS, 0)?.id, QUESTIONS[0]?.id);
  assert.equal(getQuestion([], 0), undefined);
});
