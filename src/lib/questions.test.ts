import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_QUESTION_FILTER,
  getQuestionPoolIndexes,
  normalizeQuestionTextForQuality,
  QUESTION_CATEGORY_LABELS,
  QUESTIONS,
  questionMatchesFilter,
  type QuestionCategory,
  type QuestionFilter,
} from "./questions";

test("core deck contains 160 original question records", () => {
  assert.equal(QUESTIONS.length, 160);
  assert.equal(new Set(QUESTIONS.map((question) => question.id)).size, 160);
});

test("question texts are unique after editorial normalization", () => {
  const normalized = QUESTIONS.map((question) =>
    normalizeQuestionTextForQuality(question.text),
  );
  assert.equal(new Set(normalized).size, QUESTIONS.length);
});

test("every category has exactly 20 questions", () => {
  const categories = Object.keys(
    QUESTION_CATEGORY_LABELS,
  ) as QuestionCategory[];

  for (const category of categories) {
    assert.equal(
      QUESTIONS.filter((question) => question.category === category).length,
      20,
      category,
    );
  }
});

test("question metadata stays within supported editorial bounds", () => {
  for (const question of QUESTIONS) {
    assert.ok([1, 2, 3].includes(question.intensity), question.id);
    assert.ok([8, 12, 16].includes(question.minAge), question.id);
    assert.ok(question.audiences.length > 0, question.id);
    assert.ok(question.text.length >= 20, question.id);
    assert.ok(question.text.length <= 180, question.id);
  }
});

test("default family filter creates a useful safe pool", () => {
  const indexes = getQuestionPoolIndexes(QUESTIONS, DEFAULT_QUESTION_FILTER);
  assert.ok(indexes.length >= 80);

  for (const index of indexes) {
    assert.equal(
      questionMatchesFilter(QUESTIONS[index], DEFAULT_QUESTION_FILTER),
      true,
    );
  }
});

test("age and intensity filters exclude questions above the selected limits", () => {
  const filter: QuestionFilter = {
    groupType: "friends",
    youngestAge: 8,
    maxIntensity: 1,
  };

  const indexes = getQuestionPoolIndexes(QUESTIONS, filter);
  assert.ok(indexes.length > 20);

  for (const index of indexes) {
    const question = QUESTIONS[index];
    assert.ok(question.minAge <= 8);
    assert.ok(question.intensity <= 1);
    assert.ok(question.audiences.includes("friends"));
  }
});
