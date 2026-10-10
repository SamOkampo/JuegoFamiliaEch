export const QUESTION_DECK_VERSION = "core-v3-210-co";

export type QuestionCategory =
  | "recuerdos"
  | "infancia"
  | "familia"
  | "risas"
  | "suenos"
  | "nosotros"
  | "gratitud"
  | "profundas"
  | "espiritualidad"
  | "chismes"
  | "amores"
  | "fiestas";

export type GroupType = "family" | "friends" | "couple" | "mixed";
export type QuestionIntensity = 1 | 2 | 3;
export type AgeBand = 8 | 12 | 16 | 18;

export type Question = {
  id: string;
  category: QuestionCategory;
  intensity: QuestionIntensity;
  minAge: AgeBand;
  audiences: GroupType[];
  text: string;
};

export type QuestionFilter = {
  groupType: GroupType;
  youngestAge: AgeBand;
  maxIntensity: QuestionIntensity;
};

export const DEFAULT_QUESTION_FILTER: QuestionFilter = {
  groupType: "family",
  youngestAge: 12,
  maxIntensity: 2,
};

export const QUESTION_CATEGORY_LABELS: Record<QuestionCategory, string> = {
  recuerdos: "Recuerdos",
  infancia: "Infancia",
  familia: "Familia",
  risas: "Risas",
  suenos: "Sueños",
  nosotros: "Nosotros",
  gratitud: "Gratitud",
  profundas: "Profundas",
  espiritualidad: "Fe y espiritualidad",
  chismes: "Chismes sanos",
  amores: "Primeros amores",
  fiestas: "Fiestas y anécdotas",
};

export const GROUP_TYPE_LABELS: Record<GroupType, string> = {
  family: "Familia",
  friends: "Amigos",
  couple: "Pareja",
  mixed: "Grupo mixto",
};

export const QUESTIONS: Question[] = [
  {
    "id": "rec-001",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué comida te lleva de inmediato a un momento feliz que habías olvidado?"
  },
  {
    "id": "rec-002",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué canción te recuerda con claridad una etapa concreta de tu vida?"
  },
  {
    "id": "rec-003",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué lugar de tu pasado podrías dibujar casi de memoria?"
  },
  {
    "id": "rec-004",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cuál fue una pequeña victoria que en su momento te hizo sentir gigante?"
  },
  {
    "id": "rec-005",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué tarde sin ningún plan terminó convirtiéndose en un gran recuerdo?"
  },
  {
    "id": "rec-006",
    "category": "recuerdos",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué objeto viejo te cuesta botar porque guarda una historia importante?"
  },
  {
    "id": "rec-007",
    "category": "recuerdos",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué viaje o paseo recuerdas más por lo que pasó que por el destino?"
  },
  {
    "id": "rec-008",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué olor te devuelve a una casa, persona o época específica?"
  },
  {
    "id": "rec-009",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué cumpleaños recuerdas por un detalle pequeño y no por los regalos?"
  },
  {
    "id": "rec-010",
    "category": "recuerdos",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Quién te dijo una frase que todavía recuerdas años después?"
  },
  {
    "id": "rec-011",
    "category": "recuerdos",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué decisión aparentemente pequeña terminó cambiando bastante tu camino?"
  },
  {
    "id": "rec-012",
    "category": "recuerdos",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué despedida te enseñó algo sobre valorar el tiempo con la gente?"
  },
  {
    "id": "rec-013",
    "category": "recuerdos",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cuándo recibiste una ayuda inesperada que todavía agradeces?"
  },
  {
    "id": "rec-014",
    "category": "recuerdos",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué error del pasado terminó abriéndote una puerta que no esperabas?"
  },
  {
    "id": "rec-015",
    "category": "recuerdos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué día de lluvia, frío o encierro terminó siendo mejor de lo esperado?"
  },
  {
    "id": "rec-016",
    "category": "recuerdos",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿En qué momento recuerdas haber sido más valiente de lo que pensabas?"
  },
  {
    "id": "rec-017",
    "category": "recuerdos",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué tradición de otra época te gustaría traer de vuelta por un día?"
  },
  {
    "id": "rec-018",
    "category": "recuerdos",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué foto de tu vida tiene una historia mucho más grande de lo que muestra?"
  },
  {
    "id": "rec-019",
    "category": "recuerdos",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué cambio de casa, colegio, trabajo o rutina terminó marcando una etapa?"
  },
  {
    "id": "rec-020",
    "category": "recuerdos",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué día aparentemente normal hoy te parece mucho más valioso de lo que parecía entonces?"
  },
  {
    "id": "inf-001",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿A qué jugaban por horas en el barrio: golosa, yermis, escondidas o un invento de ustedes?"
  },
  {
    "id": "inf-002",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué dibujo animado, programa o personaje esperabas con emoción?"
  },
  {
    "id": "inf-003",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Cuál era tu rincón favorito del colegio, la casa o el barrio?"
  },
  {
    "id": "inf-004",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué te emocionaba más para las onces: una mogolla, una chocolatina o algo hecho en casa?"
  },
  {
    "id": "inf-005",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Dónde estaba tu escondite favorito cuando querías estar solo o jugar?"
  },
  {
    "id": "inf-006",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué miedo de niño hoy te parece curioso o incluso gracioso?"
  },
  {
    "id": "inf-007",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué invento imposible estabas convencido de que algún día existiría?"
  },
  {
    "id": "inf-008",
    "category": "infancia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué frase típica de tu mamá, tu papá o tus abuelos te daba risa de niño y hoy repites?"
  },
  {
    "id": "inf-009",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué travesura de infancia te hizo pensar «ahora sí me van a regañar» y terminó en un cuento buenísimo?"
  },
  {
    "id": "inf-010",
    "category": "infancia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué amistad de infancia te enseñó algo que todavía usas hoy?"
  },
  {
    "id": "inf-011",
    "category": "infancia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué profesor, vecino o familiar adulto hizo que te sintieras tomado en serio?"
  },
  {
    "id": "inf-012",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué logro de niño te hizo sentir especialmente orgulloso?"
  },
  {
    "id": "inf-013",
    "category": "infancia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué regla de tu casa entendiste solo cuando creciste?"
  },
  {
    "id": "inf-014",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué costumbre de vacaciones o fines de semana extrañas más?"
  },
  {
    "id": "inf-015",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué sonido u olor define mejor para ti la palabra infancia?"
  },
  {
    "id": "inf-016",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué apodo de niño tenía una historia que vale la pena contar?"
  },
  {
    "id": "inf-017",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué juguete u objeto usabas de una forma completamente distinta a la prevista?"
  },
  {
    "id": "inf-018",
    "category": "infancia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué deseabas con muchísima fuerza cuando eras pequeño y qué piensas de eso hoy?"
  },
  {
    "id": "inf-019",
    "category": "infancia",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué aprendiste de niño después de equivocarte y no porque alguien te lo explicara?"
  },
  {
    "id": "inf-020",
    "category": "infancia",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "Si pudieras sentarte diez minutos con tu versión de diez años, ¿qué crees que esa versión te preguntaría?"
  },
  {
    "id": "fam-001",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué costumbre de esta familia te gustaría conservar durante muchos años?"
  },
  {
    "id": "fam-002",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué frase tan colombiana dice alguien en tu familia que merecería estar estampada en una camiseta?"
  },
  {
    "id": "fam-003",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Quién tiene un talento poco reconocido dentro de la familia y cuál es?"
  },
  {
    "id": "fam-004",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué receta o comida sientes que cuenta parte de nuestra historia?"
  },
  {
    "id": "fam-005",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Cómo era el domingo perfecto en tu familia: paseo, almuerzo largo, ciclovía o quedarse en casa?"
  },
  {
    "id": "fam-006",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué historia familiar debería conocer cualquier persona que llegue nueva al grupo?"
  },
  {
    "id": "fam-007",
    "category": "familia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué gesto pequeño hace alguien de la familia que te hace sentir cuidado?"
  },
  {
    "id": "fam-008",
    "category": "familia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué papel sueles ocupar cuando la familia tiene que resolver un problema?"
  },
  {
    "id": "fam-009",
    "category": "familia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué cualidad de alguien que está aquí te gustaría aprender a practicar más?"
  },
  {
    "id": "fam-010",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué momento familiar reciente te gustaría guardar en una cápsula del tiempo?"
  },
  {
    "id": "fam-011",
    "category": "familia",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué hemos aprendido como familia después de una etapa difícil?"
  },
  {
    "id": "fam-012",
    "category": "familia",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué forma de pedir perdón funciona mejor entre nosotros?"
  },
  {
    "id": "fam-013",
    "category": "familia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué tradición nueva tendría sentido empezar este año?"
  },
  {
    "id": "fam-014",
    "category": "familia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué rasgo de generaciones anteriores reconoces hoy en ti?"
  },
  {
    "id": "fam-015",
    "category": "familia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Cuál ha sido uno de los momentos más absurdos o inesperados que hemos vivido juntos?"
  },
  {
    "id": "fam-016",
    "category": "familia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿En qué momento sentiste con claridad que tu familia estaba de tu lado?"
  },
  {
    "id": "fam-017",
    "category": "familia",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué valor familiar te gustaría que siguiera presente dentro de veinte años?"
  },
  {
    "id": "fam-018",
    "category": "familia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué cosa hacemos bien juntos y casi nunca reconocemos?"
  },
  {
    "id": "fam-019",
    "category": "familia",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué podríamos hacer para escucharnos mejor cuando no estamos de acuerdo?"
  },
  {
    "id": "fam-020",
    "category": "familia",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "mixed"
    ],
    "text": "¿Qué te gustaría que una futura generación dijera de la forma en que nos tratábamos?"
  },
  {
    "id": "ris-001",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "A ver, suelta el cuento: ¿cuál fue una metida de pata tuya que hoy te da muchísima risa?"
  },
  {
    "id": "ris-002",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué baile improvisado o ridículo recuerdas con más cariño?"
  },
  {
    "id": "ris-003",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cuál ha sido una compra extraña que terminó dando mucha historia?"
  },
  {
    "id": "ris-004",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué moda o pinta del pasado te cuesta creer que defendías?"
  },
  {
    "id": "ris-005",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué autocorrector, mensaje o llamada generó una confusión buenísima?"
  },
  {
    "id": "ris-006",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué desastre en la cocina terminó siendo más chistoso que grave?"
  },
  {
    "id": "ris-007",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cuándo te perdiste o confundiste de lugar de una forma graciosa?"
  },
  {
    "id": "ris-008",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué apodo es tan absurdo que merece una explicación completa?"
  },
  {
    "id": "ris-009",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué imitación haces sorprendentemente bien aunque no sirva para nada?"
  },
  {
    "id": "ris-010",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué palabra o expresión pronunciaste mal durante años sin darte cuenta?"
  },
  {
    "id": "ris-011",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué juego o deporte te salió tan mal que terminó siendo divertido?"
  },
  {
    "id": "ris-012",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué superstición o creencia rara tuviste alguna vez?"
  },
  {
    "id": "ris-013",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué ha hecho una mascota o un animal que todavía te hace reír al recordarlo?"
  },
  {
    "id": "ris-014",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cuál es la historia más graciosa que te ha pasado estando medio dormido?"
  },
  {
    "id": "ris-015",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué coincidencia parecía tan perfecta que daba risa?"
  },
  {
    "id": "ris-016",
    "category": "risas",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué momento vergonzoso e inofensivo terminó siendo una gran anécdota?"
  },
  {
    "id": "ris-017",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué foto antigua merece una explicación antes de que alguien la vea?"
  },
  {
    "id": "ris-018",
    "category": "risas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué talento inútil podría ganar un concurso entre quienes están aquí?"
  },
  {
    "id": "ris-019",
    "category": "risas",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cuándo una risa cambió por completo el ambiente de un día pesado?"
  },
  {
    "id": "ris-020",
    "category": "risas",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué necesitamos hacer más seguido para reírnos juntos sin planearlo tanto?"
  },
  {
    "id": "sue-001",
    "category": "suenos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué lugar te gustaría conocer aunque fuera solo una vez?"
  },
  {
    "id": "sue-002",
    "category": "suenos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué habilidad nueva aprenderías por puro gusto si tuvieras tiempo?"
  },
  {
    "id": "sue-003",
    "category": "suenos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué pequeño proyecto te haría ilusión empezar este año?"
  },
  {
    "id": "sue-004",
    "category": "suenos",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cómo sería un día ideal de tu vida dentro de cinco años?"
  },
  {
    "id": "sue-005",
    "category": "suenos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué detalle tendría la casa o espacio donde te gustaría vivir algún día?"
  },
  {
    "id": "sue-006",
    "category": "suenos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué oficio o profesión te da curiosidad aunque nunca la hayas considerado en serio?"
  },
  {
    "id": "sue-007",
    "category": "suenos",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué causa o problema te gustaría ayudar a mejorar en el futuro?"
  },
  {
    "id": "sue-008",
    "category": "suenos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué aventura te gustaría vivir con alguien que está aquí?"
  },
  {
    "id": "sue-009",
    "category": "suenos",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué cosa te gustaría haber aprendido de aquí a un año?"
  },
  {
    "id": "sue-010",
    "category": "suenos",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿A qué tipo de persona te gustaría conocer o escuchar en una conversación larga?"
  },
  {
    "id": "sue-011",
    "category": "suenos",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué sueño pausaste por falta de tiempo y todavía te gustaría revisar?"
  },
  {
    "id": "sue-012",
    "category": "suenos",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué riesgo razonable crees que podría valer la pena asumir algún día?"
  },
  {
    "id": "sue-013",
    "category": "suenos",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué te gustaría construir o dejar que siguiera existiendo después de ti?"
  },
  {
    "id": "sue-014",
    "category": "suenos",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "Si tuvieras un mes completamente libre, ¿en qué lo invertirías?"
  },
  {
    "id": "sue-015",
    "category": "suenos",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "Si el dinero no fuera el problema principal, ¿qué proyecto intentarías?"
  },
  {
    "id": "sue-016",
    "category": "suenos",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué te gustaría que tu versión futura agradeciera de una decisión que tomes ahora?"
  },
  {
    "id": "sue-017",
    "category": "suenos",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué sueño se volvió más importante para ti con los años y cuál dejó de serlo?"
  },
  {
    "id": "sue-018",
    "category": "suenos",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué experiencia te gustaría regalarle algún día a alguien que quieres?"
  },
  {
    "id": "sue-019",
    "category": "suenos",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué meta te emociona aunque todavía no tengas claro cómo alcanzarla?"
  },
  {
    "id": "sue-020",
    "category": "suenos",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué tendría que pasar para que dentro de diez años dijeras: valió la pena intentarlo?"
  },
  {
    "id": "nos-001",
    "category": "nosotros",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué plan sencillo deberíamos repetir más seguido juntos?"
  },
  {
    "id": "nos-002",
    "category": "nosotros",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué tradición podríamos inventar desde cero como grupo?"
  },
  {
    "id": "nos-003",
    "category": "nosotros",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué hacemos especialmente bien cuando trabajamos en equipo?"
  },
  {
    "id": "nos-004",
    "category": "nosotros",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué lugar sentimos como nuestro aunque no nos pertenezca?"
  },
  {
    "id": "nos-005",
    "category": "nosotros",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué canción podría ser la banda sonora de este grupo por una semana?"
  },
  {
    "id": "nos-006",
    "category": "nosotros",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué comida representa mejor una reunión nuestra?"
  },
  {
    "id": "nos-007",
    "category": "nosotros",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué reto divertido podríamos intentar todos juntos?"
  },
  {
    "id": "nos-008",
    "category": "nosotros",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué celebración pequeña deberíamos tomarnos más en serio?"
  },
  {
    "id": "nos-009",
    "category": "nosotros",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué recuerdo compartido demuestra mejor cómo somos cuando estamos juntos?"
  },
  {
    "id": "nos-010",
    "category": "nosotros",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué persona suele notar primero cuando alguien del grupo necesita apoyo?"
  },
  {
    "id": "nos-011",
    "category": "nosotros",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué podríamos hacer para que las reuniones tengan menos pantallas y más conversación?"
  },
  {
    "id": "nos-012",
    "category": "nosotros",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué habilidad combinada tendría este grupo si funcionáramos como un solo equipo?"
  },
  {
    "id": "nos-013",
    "category": "nosotros",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué diferencia entre nosotros termina siendo una ventaja?"
  },
  {
    "id": "nos-014",
    "category": "nosotros",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué hábito colectivo nos haría bien probar durante un mes?"
  },
  {
    "id": "nos-015",
    "category": "nosotros",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué conversación nos gustaría repetir dentro de un año para ver qué cambió?"
  },
  {
    "id": "nos-016",
    "category": "nosotros",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué podemos hacer mejor cuando alguien piensa distinto al resto?"
  },
  {
    "id": "nos-017",
    "category": "nosotros",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué nos gustaría recordar de esta etapa cuando todos estemos en otro momento de la vida?"
  },
  {
    "id": "nos-018",
    "category": "nosotros",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué promesa pequeña y realista podríamos hacernos como grupo?"
  },
  {
    "id": "nos-019",
    "category": "nosotros",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué hace que una persona se sienta bienvenida cuando llega a este grupo?"
  },
  {
    "id": "nos-020",
    "category": "nosotros",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué queremos que nunca se pierda de la forma en que estamos juntos hoy?"
  },
  {
    "id": "gra-001",
    "category": "gratitud",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué gesto pequeño de hoy merece más agradecimiento del que recibió?"
  },
  {
    "id": "gra-002",
    "category": "gratitud",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué persona te facilitó algo importante sin saberlo?"
  },
  {
    "id": "gra-003",
    "category": "gratitud",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué objeto cotidiano agradeces tener porque te resuelve la vida?"
  },
  {
    "id": "gra-004",
    "category": "gratitud",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué rutina sencilla te da más estabilidad de la que parece?"
  },
  {
    "id": "gra-005",
    "category": "gratitud",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué lugar te hace sentir tranquilo apenas llegas?"
  },
  {
    "id": "gra-006",
    "category": "gratitud",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué comida preparada por alguien te hace sentir cuidado?"
  },
  {
    "id": "gra-007",
    "category": "gratitud",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué consejo agradeces aunque al principio no te gustara escucharlo?"
  },
  {
    "id": "gra-008",
    "category": "gratitud",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué segunda oportunidad terminó siendo valiosa para ti?"
  },
  {
    "id": "gra-009",
    "category": "gratitud",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué momento reciente te recordó que no todo tiene que ser extraordinario para ser bueno?"
  },
  {
    "id": "gra-010",
    "category": "gratitud",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué cualidad de una persona presente agradeces especialmente?"
  },
  {
    "id": "gra-011",
    "category": "gratitud",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué ayuda recibiste en un momento en que realmente la necesitabas?"
  },
  {
    "id": "gra-012",
    "category": "gratitud",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué oportunidad pequeña terminó abriendo algo importante?"
  },
  {
    "id": "gra-013",
    "category": "gratitud",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué habilidad propia agradeces haber desarrollado con el tiempo?"
  },
  {
    "id": "gra-014",
    "category": "gratitud",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué detalle de tu casa o barrio sueles dar por sentado y en realidad valoras mucho?"
  },
  {
    "id": "gra-015",
    "category": "gratitud",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué aprendizaje difícil hoy agradeces haber tenido?"
  },
  {
    "id": "gra-016",
    "category": "gratitud",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué conversación te dejó más tranquilo o acompañado recientemente?"
  },
  {
    "id": "gra-017",
    "category": "gratitud",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué persona del pasado merece un agradecimiento que quizá nunca escuchó?"
  },
  {
    "id": "gra-018",
    "category": "gratitud",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué parte de tu rutina actual habría parecido un lujo a tu versión de hace algunos años?"
  },
  {
    "id": "gra-019",
    "category": "gratitud",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué cosa sencilla te devuelve el ánimo cuando el día viene torcido?"
  },
  {
    "id": "gra-020",
    "category": "gratitud",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Por qué aspecto de esta etapa de tu vida crees que sentirás gratitud en el futuro?"
  },
  {
    "id": "pro-001",
    "category": "profundas",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué valor intentas cuidar incluso cuando nadie está mirando?"
  },
  {
    "id": "pro-002",
    "category": "profundas",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué cambio te cuesta aceptar aunque sabes que puede ser necesario?"
  },
  {
    "id": "pro-003",
    "category": "profundas",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué has aprendido a soltar para vivir con un poco más de calma?"
  },
  {
    "id": "pro-004",
    "category": "profundas",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué parte de tu forma de ser te tomó tiempo aprender a apreciar?"
  },
  {
    "id": "pro-005",
    "category": "profundas",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué límite personal aprendiste a poner demasiado tarde?"
  },
  {
    "id": "pro-006",
    "category": "profundas",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿En qué situación te cuesta pedir ayuda aunque la necesites?"
  },
  {
    "id": "pro-007",
    "category": "profundas",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué significa para ti perdonar sin fingir que nada pasó?"
  },
  {
    "id": "pro-008",
    "category": "profundas",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cómo ha cambiado tu definición de éxito con el tiempo?"
  },
  {
    "id": "pro-009",
    "category": "profundas",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué acto de valentía puede parecer pequeño desde afuera pero grande para quien lo vive?"
  },
  {
    "id": "pro-010",
    "category": "profundas",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué te gustaría hacer con más intención porque sabes que el tiempo es limitado?"
  },
  {
    "id": "pro-011",
    "category": "profundas",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué error dejaste de ver como fracaso y empezaste a ver como aprendizaje?"
  },
  {
    "id": "pro-012",
    "category": "profundas",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué te gustaría que la gente entendiera mejor de ti sin tener que explicarlo tantas veces?"
  },
  {
    "id": "pro-013",
    "category": "profundas",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué cosa importante proteges aunque a veces implique decir que no?"
  },
  {
    "id": "pro-014",
    "category": "profundas",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué lección te enseñó una etapa que no habrías elegido vivir?"
  },
  {
    "id": "pro-015",
    "category": "profundas",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cómo reaccionas cuando no tienes certeza sobre lo que viene?"
  },
  {
    "id": "pro-016",
    "category": "profundas",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué verdad sobre ti te costó tiempo admitir pero te ayudó a avanzar?"
  },
  {
    "id": "pro-017",
    "category": "profundas",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿En qué etapa de tu vida sientes que estás ahora y qué nombre le pondrías?"
  },
  {
    "id": "pro-018",
    "category": "profundas",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué ya no necesitas demostrarle a nadie?"
  },
  {
    "id": "pro-019",
    "category": "profundas",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué te dirías con más amabilidad si hablaras contigo como hablas con alguien que quieres?"
  },
  {
    "id": "pro-020",
    "category": "profundas",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué conversación te gustaría tener con más calma y menos orgullo?"
  },
  {
    "id": "inf-021",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué era lo mejor del recreo: jugar, comprar algo en la tienda o encontrarte con tus amigos?"
  },
  {
    "id": "inf-022",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Cuál fue ese paseo de olla, paseo familiar o salida del colegio que todavía recuerdas?"
  },
  {
    "id": "inf-023",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué hacías apenas escuchabas que habían llegado las onces?"
  },
  {
    "id": "inf-024",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Quién era el campeón o la campeona de las escondidas en tu cuadra?"
  },
  {
    "id": "inf-025",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué canción, ronda o juego de palmas te sabes todavía sin pensarlo?"
  },
  {
    "id": "inf-026",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Cuál era la disculpa más creativa que inventabas cuando no hacías la tarea?"
  },
  {
    "id": "inf-027",
    "category": "infancia",
    "intensity": 2,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué hacía tu abuela, tu abuelo o una persona cercana que te hacía sentir en casa?"
  },
  {
    "id": "inf-028",
    "category": "infancia",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Recuerdas tu primer día de colegio? ¿Qué fue lo más curioso de ese día?"
  },
  {
    "id": "inf-029",
    "category": "infancia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Cuál fue tu primer parche de amigos y qué locuras inocentes hacían?"
  },
  {
    "id": "inf-030",
    "category": "infancia",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué secreto de infancia era un drama en ese momento y ahora te parece una bobada?"
  },
  {
    "id": "esp-001",
    "category": "espiritualidad",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Hay una oración, una frase o una idea que te dé tranquilidad cuando tienes un día pesado?"
  },
  {
    "id": "esp-002",
    "category": "espiritualidad",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué agradeces hoy, así sea algo pequeñito que casi nadie nota?"
  },
  {
    "id": "esp-003",
    "category": "espiritualidad",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cuál es una tradición espiritual o familiar que te gusta y por qué?"
  },
  {
    "id": "esp-004",
    "category": "espiritualidad",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Alguna vez sentiste una paz difícil de explicar en medio de un problema?"
  },
  {
    "id": "esp-005",
    "category": "espiritualidad",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué te enseñó una persona mayor sobre la fe, la esperanza o la vida?"
  },
  {
    "id": "esp-006",
    "category": "espiritualidad",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué canción, salmo, reflexión o silencio te ha acompañado en un momento difícil?"
  },
  {
    "id": "esp-007",
    "category": "espiritualidad",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "Si pudieras hacerle una pregunta a Dios, al universo o a la vida, ¿cuál sería?"
  },
  {
    "id": "esp-008",
    "category": "espiritualidad",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Te ha pasado algo que te haya hecho cambiar tu manera de ver la espiritualidad?"
  },
  {
    "id": "esp-009",
    "category": "espiritualidad",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué significa para ti perdonar sin dejar de cuidarte?"
  },
  {
    "id": "esp-010",
    "category": "espiritualidad",
    "intensity": 2,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué consejo espiritual o de vida te gustaría dejarles a los más pequeños de la familia?"
  },
  {
    "id": "chi-001",
    "category": "chismes",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "A ver, chisme sano: ¿qué malentendido del colegio terminó siendo un cuento para reírse?"
  },
  {
    "id": "chi-002",
    "category": "chismes",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué noticia buena se regó por toda la familia antes de que pudieran contarla?"
  },
  {
    "id": "chi-003",
    "category": "chismes",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Alguna vez te hicieron una fiesta sorpresa y todo el mundo sabía menos tú?"
  },
  {
    "id": "chi-004",
    "category": "chismes",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué chisme inocente del barrio terminó siendo puro cuento?"
  },
  {
    "id": "chi-005",
    "category": "chismes",
    "intensity": 2,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Cuál es el rumor más absurdo que escuchaste sobre ti y que hoy te da risa?"
  },
  {
    "id": "chi-006",
    "category": "chismes",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Cuándo supiste que alguien estaba tragado y se le notaba a kilómetros?"
  },
  {
    "id": "chi-007",
    "category": "chismes",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué historia divertida salió de un mensaje enviado al chat equivocado?"
  },
  {
    "id": "chi-008",
    "category": "chismes",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué cosa tuya cree saber toda la familia, pero en realidad la historia es otra?"
  },
  {
    "id": "chi-009",
    "category": "chismes",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Qué secreto bonito guardaste hasta poder darle una sorpresa a alguien?"
  },
  {
    "id": "chi-010",
    "category": "chismes",
    "intensity": 2,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "mixed"
    ],
    "text": "¿Alguna vez dijiste «no le cuente a nadie» y al rato todo el mundo ya sabía?"
  },
  {
    "id": "amo-001",
    "category": "amores",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Te acuerdas de tu primera traga? ¿Qué te gustaba tanto de esa persona?"
  },
  {
    "id": "amo-002",
    "category": "amores",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cuál fue tu primera serenata, carta o detalle romántico, aunque fuera de colegio?"
  },
  {
    "id": "amo-003",
    "category": "amores",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Alguna vez alguien te gustó y todo el salón se dio cuenta antes que tú?"
  },
  {
    "id": "amo-004",
    "category": "amores",
    "intensity": 2,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cómo fue tu primer novio o novia, si te nace compartir esa historia?"
  },
  {
    "id": "amo-005",
    "category": "amores",
    "intensity": 2,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cuál fue la cita más cómica o inesperada que has tenido?"
  },
  {
    "id": "amo-006",
    "category": "amores",
    "intensity": 2,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué consejo amoroso te dio una tía o un amigo y resultó útil, o todo lo contrario?"
  },
  {
    "id": "amo-007",
    "category": "amores",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Recuerdas la primera vez que te rompieron el corazón? Puedes pasar si prefieres."
  },
  {
    "id": "amo-008",
    "category": "amores",
    "intensity": 2,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué hiciste para llamar la atención de alguien y ahora te da pena de la buena?"
  },
  {
    "id": "amo-009",
    "category": "amores",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cuál fue una señal clarísima de que estabas tragado y no lo querías aceptar?"
  },
  {
    "id": "amo-010",
    "category": "amores",
    "intensity": 3,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "Si pudieras darle un consejo amable a tu yo de su primer amor, ¿cuál sería?"
  },
  {
    "id": "fie-001",
    "category": "fiestas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué canción de una fiesta familiar logra que hasta los más serios bailen?"
  },
  {
    "id": "fie-002",
    "category": "fiestas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué celebración terminó en carcajadas por algo completamente inesperado?"
  },
  {
    "id": "fie-003",
    "category": "fiestas",
    "intensity": 1,
    "minAge": 8,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Quién se sabía todos los pasos de baile en las fiestas de antes?"
  },
  {
    "id": "fie-004",
    "category": "fiestas",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué fiesta de quince, matrimonio o cumpleaños recuerdas por una historia curiosa?"
  },
  {
    "id": "fie-005",
    "category": "fiestas",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cuál fue tu primer baile en una fiesta y cómo te fue?"
  },
  {
    "id": "fie-006",
    "category": "fiestas",
    "intensity": 2,
    "minAge": 12,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿En qué fiesta terminaste cantando a grito herido una canción que te sabías completa?"
  },
  {
    "id": "fie-007",
    "category": "fiestas",
    "intensity": 2,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Qué plan de parche prometía ser tranquilo y terminó en tremenda aventura?"
  },
  {
    "id": "fie-008",
    "category": "fiestas",
    "intensity": 2,
    "minAge": 16,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "¿Cuál fue una fiesta que empezó mal y terminó siendo de las mejores?"
  },
  {
    "id": "fie-009",
    "category": "fiestas",
    "intensity": 3,
    "minAge": 18,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "Solo entre adultos: ¿cómo fue tu primera borrachera, si quieres contarla, y qué aprendiste de esa experiencia?"
  },
  {
    "id": "fie-010",
    "category": "fiestas",
    "intensity": 3,
    "minAge": 18,
    "audiences": [
      "family",
      "friends",
      "couple",
      "mixed"
    ],
    "text": "Solo entre adultos: ¿qué anécdota te dejó una noche en que alguien se pasó de tragos, sin poner a nadie en evidencia?"
  }
];

export function questionMatchesFilter(
  question: Question,
  filter: QuestionFilter,
): boolean {
  return (
    question.audiences.includes(filter.groupType) &&
    question.minAge <= filter.youngestAge &&
    question.intensity <= filter.maxIntensity
  );
}

export function getQuestionPoolIndexes(
  questions: readonly Question[],
  filter: QuestionFilter,
): number[] {
  const indexes: number[] = [];
  questions.forEach((question, index) => {
    if (questionMatchesFilter(question, filter)) indexes.push(index);
  });
  return indexes;
}

export function normalizeQuestionTextForQuality(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
