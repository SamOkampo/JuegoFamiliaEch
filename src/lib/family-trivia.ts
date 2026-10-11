/**
 * Preguntas tipo trivia cultural familiar.
 * Estas preguntas son plantillas: NO contienen afirmaciones sobre una familia
 * particular ni respuestas inventadas. El chat familiar y las respuestas
 * verificadas nunca se deben guardar en el repositorio público.
 */
export const FAMILY_TRIVIA_CATEGORIES = [
  "generaciones",
  "origen",
  "tradiciones",
  "recuerdos",
  "curiosidades",
] as const;

export type FamilyTriviaCategory = typeof FAMILY_TRIVIA_CATEGORIES[number];

export type FamilyTriviaPrompt = {
  id: string;
  category: FamilyTriviaCategory;
  question: string;
  verificationHint: string;
  age: 8 | 12 | 16;
  /** True if an actual family member should first confirm the answer. */
  requiresFamilyFact: true;
};

export const FAMILY_TRIVIA_QUESTIONS: readonly FamilyTriviaPrompt[] = [
  { id:"gen-01",category:"generaciones",question:"¿Cuántos nietos tienen los abuelos?",verificationHint:"Confirmar el conteo actual entre los familiares, sin suponer nombres.",age:8,requiresFamilyFact:true },
  { id:"gen-02",category:"generaciones",question:"¿Cuántos hijos e hijas tuvieron los abuelos?",verificationHint:"Verificar el número con la familia.",age:8,requiresFamilyFact:true },
  { id:"gen-03",category:"generaciones",question:"¿Quién fue el primer nieto o la primera nieta de la familia?",verificationHint:"Confirmar con los abuelos y evitar inferir por edades aproximadas.",age:8,requiresFamilyFact:true },
  { id:"gen-04",category:"generaciones",question:"¿Cuántos primos y primas forman parte de nuestra generación?",verificationHint:"Acordar qué rama familiar participa y contar sin duplicar.",age:8,requiresFamilyFact:true },
  { id:"gen-05",category:"generaciones",question:"¿Cuántas generaciones de la familia suelen reunirse hoy?",verificationHint:"Contar generaciones presentes en la reunión.",age:8,requiresFamilyFact:true },
  { id:"gen-06",category:"generaciones",question:"¿Quién es el mayor de los hermanos de la generación de nuestros padres?",verificationHint:"Confirmar el orden de nacimiento con la familia.",age:8,requiresFamilyFact:true },
  { id:"origen-01",category:"origen",question:"¿De qué pueblo, ciudad o región son originalmente nuestros abuelos?",verificationHint:"Escuchar la versión de los mayores antes de decidir.",age:8,requiresFamilyFact:true },
  { id:"origen-02",category:"origen",question:"¿En qué ciudad se conocieron nuestros abuelos?",verificationHint:"Preguntar a quienes vivieron o conocen la historia.",age:12,requiresFamilyFact:true },
  { id:"origen-03",category:"origen",question:"¿Cuál es el apellido que más se repite en nuestro árbol familiar?",verificationHint:"Comprobar con el árbol o una lista familiar voluntaria.",age:12,requiresFamilyFact:true },
  { id:"origen-04",category:"origen",question:"¿En qué lugar se celebró una de las primeras grandes reuniones de la familia?",verificationHint:"Contrastar recuerdos si hay versiones distintas.",age:8,requiresFamilyFact:true },
  { id:"origen-05",category:"origen",question:"¿De qué región proviene una receta típica de nuestra familia?",verificationHint:"Confirmar con quien la prepara y conoce su origen.",age:8,requiresFamilyFact:true },
  { id:"origen-06",category:"origen",question:"¿Qué lugar visitaban nuestros abuelos cuando eran jóvenes?",verificationHint:"Preguntarles si desean compartirlo; no inventar destinos.",age:12,requiresFamilyFact:true },
  { id:"trad-01",category:"tradiciones",question:"¿Qué comida nunca suele faltar en las reuniones familiares?",verificationHint:"Aceptar respuestas habituales verificadas por el grupo.",age:8,requiresFamilyFact:true },
  { id:"trad-02",category:"tradiciones",question:"¿Cuál es la celebración que más reúne a nuestra familia?",verificationHint:"Confirmar entre participantes qué se celebra con mayor asistencia.",age:8,requiresFamilyFact:true },
  { id:"trad-03",category:"tradiciones",question:"¿Qué canción hace que nuestra familia empiece a cantar o bailar?",verificationHint:"La familia puede aceptar varias canciones tradicionales.",age:8,requiresFamilyFact:true },
  { id:"trad-04",category:"tradiciones",question:"¿Quién suele preparar el plato que todos esperan en diciembre?",verificationHint:"Usar la respuesta actual; no asumir roles por género.",age:8,requiresFamilyFact:true },
  { id:"trad-05",category:"tradiciones",question:"¿Qué juego jugaban nuestros padres o tíos cuando eran pequeños?",verificationHint:"Pedir una respuesta de primera mano.",age:8,requiresFamilyFact:true },
  { id:"trad-06",category:"tradiciones",question:"¿Qué expresión o refrán se repite mucho en nuestra familia?",verificationHint:"Verificar quién lo recuerda; hay respuestas posibles distintas.",age:8,requiresFamilyFact:true },
  { id:"rec-01",category:"recuerdos",question:"¿En qué lugar fue una de nuestras reuniones familiares más recordadas?",verificationHint:"El grupo puede elegir entre recuerdos compartidos.",age:8,requiresFamilyFact:true },
  { id:"rec-02",category:"recuerdos",question:"¿Qué anécdota cuentan los abuelos una y otra vez?",verificationHint:"Permitir a los abuelos contar la historia con sus palabras.",age:8,requiresFamilyFact:true },
  { id:"rec-03",category:"recuerdos",question:"¿Cuál fue un viaje que varios integrantes de la familia hicieron juntos?",verificationHint:"Confirmar lugar y participantes solo si quieren recordarlo.",age:8,requiresFamilyFact:true },
  { id:"rec-04",category:"recuerdos",question:"¿Quién recuerda cuál era el apodo cariñoso de un familiar cuando era pequeño?",verificationHint:"Usar apodos respetuosos y evitar burlas.",age:8,requiresFamilyFact:true },
  { id:"rec-05",category:"recuerdos",question:"¿Qué objeto o fotografía suele aparecer cuando recordamos a la familia?",verificationHint:"Compartir solo fotos con autorización de quienes aparecen.",age:8,requiresFamilyFact:true },
  { id:"rec-06",category:"recuerdos",question:"¿Qué evento familiar se recuerda por una sorpresa divertida?",verificationHint:"Aceptar recuerdos distintos sin exigir una única respuesta.",age:8,requiresFamilyFact:true },
  { id:"cur-01",category:"curiosidades",question:"¿Cuántas personas de la familia comparten mes de cumpleaños?",verificationHint:"Contar meses sin pedir fechas completas de nacimiento.",age:8,requiresFamilyFact:true },
  { id:"cur-02",category:"curiosidades",question:"¿Qué nombre de pila se repite entre varias generaciones?",verificationHint:"Confirmar entre los familiares antes de puntuar.",age:8,requiresFamilyFact:true },
  { id:"cur-03",category:"curiosidades",question:"¿Qué integrante de la familia ha vivido en más ciudades?",verificationHint:"Dejar que quienes quieran compartirlo respondan.",age:12,requiresFamilyFact:true },
  { id:"cur-04",category:"curiosidades",question:"¿Quién conoce más recetas que se transmitieron entre generaciones?",verificationHint:"Mejor conversarlo como reconocimiento, sin clasificar ni ridiculizar.",age:8,requiresFamilyFact:true },
  { id:"cur-05",category:"curiosidades",question:"¿Qué actividad artística, musical o deportiva aparece entre varias generaciones?",verificationHint:"Comparar recuerdos familiares, no buscar perfiles externos.",age:8,requiresFamilyFact:true },
  { id:"cur-06",category:"curiosidades",question:"¿Cuál es un talento inesperado que se ha repetido en la familia?",verificationHint:"Cada persona puede contar lo que sabe y cambiar de pregunta.",age:8,requiresFamilyFact:true },
] as const;

export function familyTriviaForAge(youngestAge: 8 | 12 | 16) {
  return FAMILY_TRIVIA_QUESTIONS.filter((question) => question.age <= youngestAge);
}
