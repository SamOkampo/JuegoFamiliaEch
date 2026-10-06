# Estado del proyecto

## Checkpoint actual

- Fases 1, 2, 3, 4, 5, 6 y 7 están integradas en `main`.
- Fase 7 fue fusionada en `45f041a25b6cd3e66af0a3555a0442c463e0742b` después de CI completamente verde.
- Cada jugador puede dejar una reacción ligera por turno: ❤️, 😂, 👏 o 😮.
- Solo se mantiene una reacción por jugador y turno; puede cambiarse o quitarse.
- “Guardar este momento” es una acción explícita y reversible durante el turno.
- Un momento guardado conserva únicamente metadatos mínimos: turno, jugador del turno, pregunta, timestamp y cantidad de personas que lo guardaron.
- No se almacena lo que la persona respondió.
- El recap final muestra momentos guardados y totales de reacciones.
- La pantalla central sincroniza esos agregados, pero sigue siendo de solo lectura.
- El smoke Cloudflare verificó reacción, guardado de momento, sincronización al display y rechazo de mutaciones desde el display.
- Typecheck, unit tests, smoke Cloudflare, sintaxis Worker, production build y E2E móvil/display pasaron en verde.
- Worker Fase 7 desplegado al 100% en Cloudflare: `1fa05f93-f176-4804-9b02-5f36e49dc0f1`.

## Retención y privacidad

- Todo el estado de la sala permanece dentro del Durable Object.
- La sala expira automáticamente a las 12 horas desde su creación.
- Al expirar se eliminan nombres, tokens, preguntas usadas, reacciones, momentos guardados, recap y token de display.
- No existe almacenamiento permanente, biblioteca de recuerdos ni cuentas en esta fase.
- No se capturan audio, fotos, video ni texto libre de respuestas.
- Política completa: `docs/PRIVACY_RETENTION.md`.
- Una futura captura multimedia deberá estar desactivada por defecto y requerir consentimiento específico antes de empezar.

## Infraestructura actual

- Frontend: Next.js + TypeScript.
- Realtime/backend: Cloudflare Worker.
- Coordinación de salas: Durable Objects.
- Persistencia por sala: SQLite del Durable Object.
- Endpoint backend: `https://juego-familia-ech.socampoecheverry.workers.dev`.
- Sin Supabase para este proyecto.

## Gate actual

Fase 7 está cerrada a nivel de código, privacidad, CI, despliegue y merge.

## Próxima fase

Fase 8 — PWA y resiliencia:
- manifest e instalación;
- iconos/splash propios;
- recuperación tras refresh;
- recuperación tras suspensión móvil;
- estado offline/degradado;
- estrategia de reconexión.
