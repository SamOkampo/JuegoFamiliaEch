# Fase 13 — Contenido y variedad

**Objetivo:** ampliar el contenido de las rondas especiales sin imponer participación ni excluir a personas jóvenes o grupos mixtos.

## Catálogo v3

El catálogo único de origen es `worker/src/special-content.json`. El frontend Next.js lo usa directamente; un generador produce `worker/src/special-metadata.mjs` con solo los filtros necesarios para Cloudflare. CI comprueba que la copia compacta coincida **exactamente** con el JSON original, sin duplicar la edición manual.

- 100 cartas especiales originales: **20 por cada una** de las cinco modalidades.
- Tres colecciones seleccionables: **Clásicos (40), Fiesta (30), Conexiones (30)**.
- Cada carta tiene ID único estable, texto, instrucción, tiempo orientativo, grupo, edad mínima (8/12/16), intensidad (1/2/3), pack y dos opciones en votaciones de «Todos responden».
- Versión del contenido: `special-v3-100`; las 160 preguntas normales permanecen en `core-v2-160`.

### Clásicos
Preguntas y dinámicas fáciles de empezar que funcionan como rompehielos. Incluye versiones aptas para 8 años y nivel ligero.

### Fiesta
Votaciones, retos teatrales, humor amable y propuestas de planes grupales. Los retos son voluntarios.

### Conexiones
Historias colaborativas, gratitud y conversaciones pausadas, con cartas suaves también para participantes jóvenes.

## Filtros editoriales

Los filtros se aplican **en el Durable Object**, no solo en la pantalla del anfitrión:

`carta.minAge <= sala.youngestAge` y `carta.intensity <= sala.maxIntensity` y el `groupType` de la sala aparece en `carta.audiences` y `carta.pack` pertenece a los packs elegidos.

En el lobby se ve el número de cartas elegibles por pack y por modalidad. Cuando ningún pack está activo, no se inician sorpresas; una petición manual sin cartas responde `SPECIAL_NO_ELIGIBLE_CARD`, sin romper la partida.

## Prevención de repetición

- Cada turno especial registra su `kind`, `turnNumber` y `cardIndex` como historial efímero.
- Para cada modalidad, el servidor elige aleatoriamente **entre las cartas compatibles aún no utilizadas**.
- Solo después de agotar todas las compatibles se inicia un nuevo ciclo. Si hay dos o más disponibles, evita repetir inmediatamente la última carta de ese tipo.
- En rondas automáticas se intenta elegir una modalidad compatible distinta de la anterior siempre que haya alternativa.
- El ciclo se reinicia limpiamente al empezar una partida nueva en la misma sala, igual que el resto del estado de juego.
- Todos los datos de sala siguen sujetos a la expiración de 12 horas. No se guardan respuestas habladas.

## Política editorial

- No se pregunta por traumas, sexualidad, situación económica, enfermedades ni datos íntimos en modo infantil.
- Las cartas indican alternativas opcionales y se evita penalizar abstenciones o retos no realizados.
- Se favorece el lenguaje inclusivo de familias, amigos, parejas y grupos mixtos.
- Las cartas de nivel 3 solo aparecen cuando el anfitrión lo habilita.
- La revisión de seguridad textual y metadatos es comprobable automáticamente; la recepción del contenido por **familias humanas reales** se verificará durante la beta presencial, no se sustituye por CI.

## Gates de aceptación

- Unit tests del catálogo completo: 100 IDs/preguntas únicos, metadatos válidos, packs, sin duplicados.
- Cobertura de filtros: todas las combinaciones de edades, intensidades, grupos y packs ofrecen opciones seguras por modalidad.
- Worker security tests: validación de packs, duplicados, valores desconocidos y payload inválido.
- Smoke real en Cloudflare: pack Conexiones + familia de 8 años/nivel 1; bloqueo por packs vacíos; **20 selecciones seguidas sin repetir** para una modalidad, antes de iniciar nuevo ciclo.
- TypeScript, Next.js/OpenNext, pruebas móviles Playwright y smoke HTTP de producción.
- Publicación del backend y frontend a Cloudflare tras gates verdes.

**Fuera de Fase 13:** sesiones de prueba con menores y grupos familiares reales, registro de feedback y cambios editoriales derivados; son gates de la beta de Fase 14.
