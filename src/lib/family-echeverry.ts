import type { Question, QuestionFilter } from "./questions";

// Written from high-level themes of a private family chat.
// No copied WhatsApp messages, phone numbers, contact data or private anecdotes.
// The source export stays outside this public repository.
export const ECHEVERRY_DECK_VERSION = "echeverry-v1";
export const FAMILY_ECHEVERRY_QUESTIONS: Question[] = [
  {
    "id": "ech-chismes-01",
    "category": "chismes",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Quién de los Echeverry siempre termina enterándose primero de una noticia familiar?"
  },
  {
    "id": "ech-chismes-02",
    "category": "chismes",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family"
    ],
    "text": "¿Cuál ha sido el chisme más inofensivo que terminó haciendo reír a toda la familia?"
  },
  {
    "id": "ech-chismes-03",
    "category": "chismes",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "Si alguien escribe «tengo algo que contarles» en el grupo, ¿a quién imaginas preguntando primero qué pasó?"
  },
  {
    "id": "ech-chismes-04",
    "category": "chismes",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Qué noticia familiar te gustaría que anunciáramos juntos en la próxima reunión?"
  },
  {
    "id": "ech-chismes-05",
    "category": "chismes",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Quién es más probable que tenga una anécdota buenísima y la cuente solo cuando todos estén reunidos?"
  },
  {
    "id": "ech-chismes-06",
    "category": "chismes",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family"
    ],
    "text": "¿Cuál fue una sorpresa familiar que nadie vio venir, pero acabó siendo un buen recuerdo?"
  },
  {
    "id": "ech-chismes-07",
    "category": "chismes",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Qué conversación de sobremesa de los Echeverry merecería su propio programa de televisión?"
  },
  {
    "id": "ech-chismes-08",
    "category": "chismes",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "Si los Echeverry tuvieran un noticiero, ¿quién sería el presentador y quién daría la primicia?"
  },
  {
    "id": "ech-chismes-09",
    "category": "chismes",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Qué historia familiar cambia un poquito cada vez que alguien la vuelve a contar?"
  },
  {
    "id": "ech-chismes-10",
    "category": "chismes",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Cuál es ese chisme divertido que se puede contar delante de los niños sin incomodar a nadie?"
  },
  {
    "id": "ech-amores-01",
    "category": "amores",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family"
    ],
    "text": "¿Quién se acuerda de cómo fue su primer enamoramiento o su primer traga?"
  },
  {
    "id": "ech-amores-02",
    "category": "amores",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family"
    ],
    "text": "¿Cuál fue el detalle romántico más bonito que viste hacer a alguien de la familia?"
  },
  {
    "id": "ech-amores-03",
    "category": "amores",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family"
    ],
    "text": "¿Cómo se daban cuenta antes los Echeverry de que a alguien le gustaba otra persona?"
  },
  {
    "id": "ech-amores-04",
    "category": "amores",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family"
    ],
    "text": "¿Qué canción te recuerda a un amor de juventud o a alguien especial?"
  },
  {
    "id": "ech-amores-05",
    "category": "amores",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family"
    ],
    "text": "¿Cuál ha sido la cita más inesperada o graciosa que puedes contar con tranquilidad?"
  },
  {
    "id": "ech-amores-06",
    "category": "amores",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family"
    ],
    "text": "¿Quién de la familia daría el consejo amoroso más divertido y quién el más sensato?"
  },
  {
    "id": "ech-amores-07",
    "category": "amores",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family"
    ],
    "text": "¿Qué señal te hacía pensar, cuando eras joven, que alguien estaba tragado de ti?"
  },
  {
    "id": "ech-amores-08",
    "category": "amores",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family"
    ],
    "text": "¿Quién recuerda una serenata, carta o declaración de amor que todavía haga sonreír?"
  },
  {
    "id": "ech-amores-09",
    "category": "amores",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family"
    ],
    "text": "¿Qué cosa pequeña demuestra cariño de verdad dentro de esta familia?"
  },
  {
    "id": "ech-amores-10",
    "category": "amores",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family"
    ],
    "text": "Si pudieras contarle a tu yo de su primer amor una sola cosa, ¿qué le dirías?"
  },
  {
    "id": "ech-primeras-01",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Quién se anima a contar cómo fue su primer día en el colegio?"
  },
  {
    "id": "ech-primeras-02",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Recuerdas la primera vez que saliste de paseo sin tus papás o cuidadores?"
  },
  {
    "id": "ech-primeras-03",
    "category": "infancia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family"
    ],
    "text": "¿Cuál fue tu primera travesura que hoy sí se puede contar en familia?"
  },
  {
    "id": "ech-primeras-04",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Cuál fue el primer plato que cocinaste y cómo reaccionaron quienes lo probaron?"
  },
  {
    "id": "ech-primeras-05",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Cómo fue la primera fiesta o baile en que realmente te soltaste?"
  },
  {
    "id": "ech-primeras-06",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Qué recuerdo tienes de tu primer trabajo, negocio o forma de ganarte unos pesos?"
  },
  {
    "id": "ech-primeras-07",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Cuál fue la primera vez que viajaste a un lugar que te dejó sorprendido?"
  },
  {
    "id": "ech-primeras-08",
    "category": "infancia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family"
    ],
    "text": "¿Quién se acuerda de su primera llamada o mensaje para alguien que le gustaba?"
  },
  {
    "id": "ech-primeras-09",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Qué hiciste la primera vez que te tocó organizar una reunión familiar?"
  },
  {
    "id": "ech-primeras-10",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Qué fue lo primero que compraste con dinero ahorrado por ti?"
  },
  {
    "id": "ech-grupo-01",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Qué sticker representa mejor a la Familia Echeverry y quién suele mandar los más graciosos?"
  },
  {
    "id": "ech-grupo-02",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Quién tiene el talento de responder con una foto o un emoji justo en el momento indicado?"
  },
  {
    "id": "ech-grupo-03",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Qué tipo de mensaje consigue que hasta los familiares más silenciosos aparezcan en el chat?"
  },
  {
    "id": "ech-grupo-04",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Quién sería capaz de convertir una simple felicitación de cumpleaños en toda una celebración?"
  },
  {
    "id": "ech-grupo-05",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Cuál es el mensaje más bonito que te gusta recibir de la familia, sin necesidad de repetir uno real?"
  },
  {
    "id": "ech-grupo-06",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "Si el grupo de WhatsApp fuera una película, ¿qué nombre le pondrías?"
  },
  {
    "id": "ech-grupo-07",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Qué foto de una reunión harías imprimir para conservarla durante muchos años?"
  },
  {
    "id": "ech-grupo-08",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Quién logra que la familia termine organizando un encuentro aunque al comienzo nadie tenga fecha?"
  },
  {
    "id": "ech-grupo-09",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Qué saludo o bendición escuchabas en casa y te gustaría que siguiera pasando de generación en generación?"
  },
  {
    "id": "ech-grupo-10",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Cuál es una costumbre familiar que merece quedarse para siempre?"
  },
  {
    "id": "ech-encuentros-01",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Qué cumpleaños de los Echeverry recuerdas por las risas y no por los regalos?"
  },
  {
    "id": "ech-encuentros-02",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Qué plato debería aparecer obligatoriamente en una reunión grande de esta familia?"
  },
  {
    "id": "ech-encuentros-03",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Cuál ha sido el paseo familiar con la anécdota más divertida para contar después?"
  },
  {
    "id": "ech-encuentros-04",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "Si hoy organizaran un almuerzo Echeverry, ¿quién ayudaría a cocinar y quién sería el primero en probar?"
  },
  {
    "id": "ech-encuentros-05",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Quién tiene una historia de una reunión en la que el plan terminó siendo completamente distinto?"
  },
  {
    "id": "ech-encuentros-06",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Cuál es una canción que pondría a bailar o cantar a varias generaciones de la familia?"
  },
  {
    "id": "ech-encuentros-07",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Qué costumbre de Navidad o Año Nuevo te gustaría revivir con todos?"
  },
  {
    "id": "ech-encuentros-08",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Cuál es el recuerdo más gracioso relacionado con una foto familiar?"
  },
  {
    "id": "ech-encuentros-09",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "¿Qué persona suele conseguir que todo el mundo se sienta incluido en una reunión?"
  },
  {
    "id": "ech-encuentros-10",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family"
    ],
    "text": "Si todos los Echeverry pudieran reunirse mañana, ¿qué actividad te gustaría hacer juntos primero?"
  }
];

export function echeverryQuestionPool(filters: QuestionFilter): number[] {
  return FAMILY_ECHEVERRY_QUESTIONS.flatMap((question, index) =>
    question.minAge <= filters.youngestAge &&
    question.intensity <= filters.maxIntensity
      ? [index]
      : [],
  );
}
