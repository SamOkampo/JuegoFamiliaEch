export const SPECIAL_KINDS = [
  "likely",
  "everyone",
  "challenge",
  "chain",
  "gold",
] as const;

export type SpecialKind = (typeof SPECIAL_KINDS)[number];

export const SPECIAL_LABELS: Record<SpecialKind, string> = {
  likely: "¿Quién es más probable?",
  everyone: "Todos responden",
  challenge: "Reto sorpresa",
  chain: "Recuerdo en cadena",
  gold: "Carta dorada",
};

export const SPECIAL_EMOJI: Record<SpecialKind, string> = {
  likely: "🗳️",
  everyone: "⚡",
  challenge: "🎭",
  chain: "🧩",
  gold: "✨",
};

export type SpecialCard = {
  prompt: string;
  hint: string;
  choices?: readonly [string, string];
  seconds: number;
};

export const SPECIAL_CARDS: Record<SpecialKind, readonly SpecialCard[]> = {
  likely: [
    { prompt: "¿Quién es más probable que llegue tarde a su propia boda?", hint: "Elige a alguien del grupo, sin revelar tu voto todavía.", seconds: 30 },
    { prompt: "¿Quién es más probable que organice un viaje sorpresa?", hint: "Todos votan en secreto desde sus teléfonos.", seconds: 30 },
    { prompt: "¿Quién es más probable que se convierta en una celebridad?", hint: "Vota por alguien de la sala; puede ser por algo muy divertido.", seconds: 30 },
    { prompt: "¿Quién es más probable que se ría en un momento solemne?", hint: "Los resultados aparecen cuando el anfitrión los revela.", seconds: 30 },
  ],
  everyone: [
    { prompt: "¿Qué plan elegiría este grupo para un día libre?", choices: ["Playa 🏖️", "Montaña ⛰️"], hint: "Cada persona elige una opción; después vemos cómo quedó el grupo.", seconds: 30 },
    { prompt: "¿Cuál prefieren para una noche juntos?", choices: ["Película 🎬", "Juegos 🎲"], hint: "No hay respuesta correcta: ¡el grupo decide!", seconds: 30 },
    { prompt: "¿Una aventura inesperada o un plan tranquilo?", choices: ["Aventura 🚀", "Relax 🧘"], hint: "Vota antes de revelar el resultado.", seconds: 30 },
    { prompt: "¿Qué harían primero si ganaran un viaje?", choices: ["Explorar 🗺️", "Comer rico 🍽️"], hint: "Todos participan desde su propio celular.", seconds: 30 },
  ],
  challenge: [
    { prompt: "Imita con cariño a alguien de tu familia durante 15 segundos.", hint: "Solo si te sientes cómodo. Puedes omitir el reto sin explicar nada.", seconds: 15 },
    { prompt: "Cuenta una anécdota graciosa de hace años en 20 segundos.", hint: "Una historia que pueda contar todo el mundo. Se puede pasar.", seconds: 20 },
    { prompt: "Haz tu mejor actuación de presentador de noticias contando una buena noticia familiar.", hint: "Tienes 20 segundos; no hace falta hacerlo perfecto.", seconds: 20 },
    { prompt: "Haz que el grupo se ría usando únicamente gestos.", hint: "Sin presión: si no te apetece, pasa a la siguiente ronda.", seconds: 20 },
  ],
  chain: [
    { prompt: "Un viaje que todavía recordamos: construyamos la historia entre todos.", hint: "Una persona empieza y las demás añaden un detalle. Marca «Ya participé» cuando aportes algo.", seconds: 60 },
    { prompt: "Un momento en que nos reímos muchísimo.", hint: "Cada persona suma una pieza del recuerdo. No hace falta escribir la historia.", seconds: 60 },
    { prompt: "La celebración más inolvidable que compartimos.", hint: "Turnos libres para recordar detalles; cada uno puede participar o pasar.", seconds: 60 },
    { prompt: "Un día común que terminó siendo especial.", hint: "Reconstruyan juntos qué pasó, dónde estaban y qué sintieron.", seconds: 60 },
  ],
  gold: [
    { prompt: "Dile a alguien del grupo algo que admiras de esa persona.", hint: "Puede ser algo pequeño. Nadie está obligado a compartir.", seconds: 45 },
    { prompt: "Agradece a alguien por un gesto que quizás pasó desapercibido.", hint: "Un momento para hablar con calma. También puedes pasar.", seconds: 45 },
    { prompt: "Comparte una cualidad del grupo que te haga sentir acompañado.", hint: "Lo importante es escucharse, no hacerlo perfecto.", seconds: 45 },
    { prompt: "Si pudieras guardar un instante con estas personas, ¿cuál sería?", hint: "Una carta para cerrar los ojos y recordar. Sin presión.", seconds: 45 },
  ],
};

export function specialCard(kind: SpecialKind, index: number): SpecialCard | null {
  return SPECIAL_CARDS[kind]?.[index] ?? null;
}
