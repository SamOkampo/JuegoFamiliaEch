export type QuestionCategory =
  | "recuerdos"
  | "familia"
  | "risas"
  | "suenos"
  | "nosotros";

export type Question = {
  id: string;
  category: QuestionCategory;
  intensity: 1 | 2 | 3;
  text: string;
};

export const QUESTIONS: Question[] = [
  {
    id: "rec-001",
    category: "recuerdos",
    intensity: 1,
    text: "¿Qué comida te transporta inmediatamente a un momento feliz de tu infancia?",
  },
  {
    id: "fam-001",
    category: "familia",
    intensity: 1,
    text: "¿Qué pequeña costumbre de nuestra familia te gustaría que nunca desapareciera?",
  },
  {
    id: "ris-001",
    category: "risas",
    intensity: 1,
    text: "¿Cuál es una confusión o metida de pata tuya que hoy ya te da risa contar?",
  },
  {
    id: "sue-001",
    category: "suenos",
    intensity: 2,
    text: "¿Qué te imaginabas haciendo de adulto cuando eras niño y qué quedó de ese sueño?",
  },
  {
    id: "nos-001",
    category: "nosotros",
    intensity: 2,
    text: "¿Qué plan sencillo crees que deberíamos hacer más seguido juntos?",
  },
  {
    id: "rec-002",
    category: "recuerdos",
    intensity: 2,
    text: "¿Qué día de tu vida repetirías solo para volver a sentirlo, aunque no pudieras cambiar nada?",
  },
  {
    id: "fam-002",
    category: "familia",
    intensity: 2,
    text: "¿Qué has aprendido de alguien de esta familia sin que esa persona te lo enseñara directamente?",
  },
  {
    id: "ris-002",
    category: "risas",
    intensity: 1,
    text: "¿Qué apodo familiar tiene la historia más extraña o divertida?",
  },
  {
    id: "sue-002",
    category: "suenos",
    intensity: 3,
    text: "¿Qué sueño todavía te importa, aunque casi nunca hables de él?",
  },
  {
    id: "nos-002",
    category: "nosotros",
    intensity: 3,
    text: "¿Qué te gustaría que recordáramos de esta etapa de nuestra familia dentro de diez años?",
  },
  {
    id: "fam-003",
    category: "familia",
    intensity: 3,
    text: "¿Qué cualidad de alguien que está aquí admiras y quizá no le dices lo suficiente?",
  },
  {
    id: "rec-003",
    category: "recuerdos",
    intensity: 2,
    text: "¿Cuál fue una primera vez que te dio miedo pero terminó siendo importante para ti?",
  }
];
