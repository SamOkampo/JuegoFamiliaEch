import assert from "node:assert/strict";
import test from "node:test";
import { calculateVoteOutcome } from "./vote-results";

const choices = [
  { id: "a", label: "Ana" },
  { id: "b", label: "Luis" },
  { id: "c", label: "Sara" },
];

test("single winner reveals leader without counting abstentions as winner", () => {
  assert.deepEqual(calculateVoteOutcome({ a: 4, b: 2, c: 0, abstain: 1 }, choices), {
    winners: ["Ana"], abstentions: 1, ballots: 7, highestVotes: 4,
    isTie: false, isEmpty: false,
  });
});

test("detects tie among top voted options", () => {
  const outcome = calculateVoteOutcome({ a: 3, b: 3, c: 1 }, choices);
  assert.deepEqual(outcome.winners, ["Ana", "Luis"]);
  assert.equal(outcome.isTie, true);
  assert.equal(outcome.ballots, 7);
});

test("everyone abstaining produces no winner", () => {
  const outcome = calculateVoteOutcome({ abstain: 5 }, choices);
  assert.equal(outcome.isEmpty, true);
  assert.deepEqual(outcome.winners, []);
  assert.equal(outcome.ballots, 5);
});

test("zero votes never declares a winner", () => {
  const outcome = calculateVoteOutcome(null, choices);
  assert.equal(outcome.isEmpty, true);
  assert.equal(outcome.ballots, 0);
});
