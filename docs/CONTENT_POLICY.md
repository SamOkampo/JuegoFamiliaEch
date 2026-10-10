# Política editorial de preguntas

## Principio

El mazo de JuegoFamiliaEch es contenido original del proyecto. No se copian ni se adaptan de forma reconocible preguntas, textos, categorías editoriales propietarias, branding o mazos de Huellia ni de otros juegos comerciales sin licencia.

## Estructura del mazo

La versión `core-v3-210-co` contiene **210 preguntas**, con voz colombiana cercana: ocho categorías originales y cuatro temáticas nuevas, más diez relatos adicionales de infancia.

- Recuerdos
- Infancia
- Familia
- Risas
- Sueños
- Nosotros
- Gratitud
- Profundas
- Fe y espiritualidad
- Chismes sanos
- Primeros amores
- Fiestas y anécdotas

Cada pregunta tiene:

- un ID estable;
- categoría;
- intensidad 1, 2 o 3;
- edad mínima editorial: 8, 12, 16 o 18;
- tipos de grupo compatibles;
- texto original.

## Intensidad

**Nivel 1 — ligero.** Anécdotas, gustos, recuerdos cotidianos y conversación fácil. Debe poder aparecer en una mesa familiar con menores de 8+.

**Nivel 2 — conectar.** Requiere algo más de reflexión personal, pero no presupone trauma, conflicto ni intimidad sensible. Base editorial 12+.

**Nivel 3 — profundo.** Identidad, decisiones, límites, cambios, sueños o aprendizajes personales. Base editorial 16+; los recuerdos relacionados con exceso de alcohol se etiquetan 18+ y requieren un grupo con la persona más joven de al menos 18 años. Nunca debe obligar a revelar trauma, salud, sexualidad, religión, política, situación económica o información privada.

## Reglas de seguridad editorial

Una pregunta no debe:

- avergonzar o señalar a una persona del grupo;
- asumir que existe una relación sana, pareja, padre/madre o estructura familiar específica;
- pedir confesiones ilegales, sexuales o médicas;
- fomentar humillación, chantaje, presión social o comparación destructiva;
- pedir que alguien revele un trauma;
- presentar una respuesta como diagnóstico psicológico;
- forzar reconciliación, perdón o contacto con otra persona;
- convertir temas sensibles en reto, castigo o puntuación.

El jugador siempre puede cambiar una pregunta sin tener que explicar por qué. Fe y espiritualidad se plantean de forma inclusiva: se puede hablar de oración, creencias, filosofía o sencillamente esperanza; no se obliga a practicar una religión. El «chisme sano» no debe exponer intimidad de terceros, acusaciones ni humillar. Los primeros amores también se pueden omitir. La anécdota de una primera borrachera es **solo para adultos**, nunca propone beber ni glorifica el exceso.

## Grupos y edad

El filtro considera el tipo de grupo y la edad de la persona más joven. Si una pregunta supera la edad elegida o no está etiquetada para ese grupo, no entra en el pool de esa partida.

Los filtros no son una garantía legal ni sustituyen criterio del anfitrión; son una medida editorial para reducir preguntas inadecuadas.

## Revisión automática

CI verifica:

- 210 preguntas en el mazo core;
- IDs únicos;
- textos no duplicados después de normalización;
- 20 preguntas en cada categoría original salvo Infancia (30); 10 en cada una de las cuatro categorías nuevas;
- rangos válidos de edad (incluido filtro 18+) e intensidad, más bloqueo automático de preguntas de alcohol cuando hay menores;
- pools de filtros no vacíos y coherentes.

## Revisión humana

Antes de una beta amplia se debe leer el mazo completo, marcar formulaciones ambiguas y probar al menos una sesión familiar, una con amigos y una de adultos. Cualquier pregunta que genere presión innecesaria se reescribe o elimina.

## Versionado

Cambios editoriales que alteren índices del mazo requieren cambiar `QUESTION_DECK_VERSION` y la versión equivalente del Worker para que un cliente desactualizado no inicie una partida con índices incompatibles.

## Packs especiales (Fase 13)

- Clásicos, Fiesta y Conexiones: 100 cartas originales distribuidas en cinco modalidades.
- Cada carta tiene edad mínima (8/12/16), intensidad (1/2/3), audiencias permitidas y pack. El Worker valida los filtros antes de elegir la carta.
- Si no hay cartas elegibles, la ronda no se fuerza ni se sustituye por contenido inadecuado.
- Todos los retos se pueden pasar; abstenerse en votaciones está permitido.
- CI verifica la unicidad de preguntas, metadatos y cobertura de combinaciones. El ensayo editorial con grupos humanos queda pendiente de la beta presencial.
- El mazo especial tiene redacción colombiana amable en 22 cartas y versión `special-v4-100-co`. Fuente de verdad: `worker/src/special-content.json`. Guía de aceptación: `docs/PHASE_13_CONTENT.md`.
