import type { Question } from "./questions";

export type Player = {
  id: string;
  name: string;
};

export function cleanPlayerName(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, 24);
}

export function nextPlayerIndex(currentIndex: number, playerCount: number): number {
  if (playerCount <= 0) return 0;
  return (currentIndex + 1) % playerCount;
}

export function nextQuestionIndex(currentIndex: number, questionCount: number): number {
  if (questionCount <= 0) return 0;
  return (currentIndex + 1) % questionCount;
}

export function getQuestion(
  questions: Question[],
  questionIndex: number,
): Question | undefined {
  if (questions.length === 0) return undefined;
  return questions[questionIndex % questions.length];
}
