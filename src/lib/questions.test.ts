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

test("core deck contains 210 Colombian original question records", () => {
  assert.equal(QUESTIONS.length, 210);
  assert.equal(new Set(QUESTIONS.map((question) => question.id)).size, 210);
});

test("question texts are unique after editorial normalization", () => {
  const normalized = QUESTIONS.map((question) =>
    normalizeQuestionTextForQuality(question.text),
  );
  assert.equal(new Set(normalized).size, QUESTIONS.length);
});

test("eight original categories have 20 questions, childhood 30, and four new categories have 10", () => {
  const categories = Object.keys(
    QUESTION_CATEGORY_LABELS,
  ) as QuestionCategory[];

  for (const category of categories) {
    const expected = category === "infancia" ? 30 :
      ["espiritualidad", "chismes", "amores", "fiestas"].includes(category) ? 10 : 20;
    assert.equal(QUESTIONS.filter((q) => q.category === category).length, expected, category);
  }
});

test("question metadata stays within supported editorial bounds", () => {
  for (const question of QUESTIONS) {
    assert.ok([1, 2, 3].includes(question.intensity), question.id);
    assert.ok([8, 12, 16, 18].includes(question.minAge), question.id);
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

test("new Colombian themes are balanced, optional and age-appropriate", () => {
  for (const category of ["espiritualidad", "chismes", "amores", "fiestas"] as const) {
    assert.equal(QUESTIONS.filter((item) => item.category === category).length, 10);
  }
  assert.ok(QUESTIONS.some((item) => item.text.includes("primera traga")));
  assert.ok(QUESTIONS.some((item) => item.text.includes("primer novio o novia")));
  assert.ok(QUESTIONS.some((item) => item.text.includes("primera borrachera")));

  const alcoholQuestions = QUESTIONS.filter((item) =>
    /borrachera|pasó de tragos/i.test(item.text),
  );
  assert.equal(alcoholQuestions.length, 2);
  assert.ok(alcoholQuestions.every((item) =>
    item.minAge === 18 && item.intensity === 3 && item.category === "fiestas",
  ));

  for (const age of [8, 12, 16] as const) {
    const indexes = getQuestionPoolIndexes(QUESTIONS, {
      groupType: "family", youngestAge: age, maxIntensity: 3,
    });
    assert.ok(indexes.every((index) => QUESTIONS[index].minAge < 18));
  }
  const adultIndexes = getQuestionPoolIndexes(QUESTIONS, {
    groupType: "family", youngestAge: 18, maxIntensity: 3,
  });
  assert.equal(adultIndexes.filter((index) => QUESTIONS[index].minAge === 18).length, 2);
});

test("spiritual and gossip questions offer non-coercive conversation choices", () => {
  const spiritual = QUESTIONS.filter((item) => item.category === "espiritualidad");
  const gossip = QUESTIONS.filter((item) => item.category === "chismes");
  assert.equal(spiritual.length, 10);
  assert.equal(gossip.length, 10);
  assert.ok(spiritual.some((item) => /fe|Dios|oración|espiritualidad/i.test(item.text)));
  assert.ok(gossip.some((item) => /chisme|malentendido|rumor/i.test(item.text)));
});
