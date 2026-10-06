# Estado del proyecto

## Checkpoint actual

- Fases 1 a 6 están integradas en `main`.
- Fase 7 — Recuerdos y reacciones está implementada en `phase-7-memories-reactions` y pendiente de CI/merge.
- Cada jugador puede dejar una reacción ligera por turno: ❤️, 😂, 👏 o 😮.
- Las reacciones se agregan en tiempo real y aparecen también en la pantalla central.
- “Guardar este momento” es una acción explícita por jugador y puede desmarcarse durante el mismo turno.
- Un momento guardado conserva solo el turno, jugador del turno, pregunta, timestamp y cantidad de personas que lo guardaron.
- No se almacena el contenido de la respuesta.
- El recap final incluye momentos guardados y totales de reacciones.
- La pantalla central sigue siendo de solo lectura y puede mostrar esos agregados sin mutar el juego.
- El estado de recuerdos/reacciones vive únicamente dentro del Durable Object de la sala.
- La sala completa expira a las 12 horas desde su creación; al expirar se borran nombres, tokens, reacciones, recuerdos y recap.
- No existe grabación de audio, foto o video en esta fase.
- Política de retención y consentimiento futuro: `docs/PRIVACY_RETENTION.md`.

## Privacidad de Fase 7

- Reaccionar no equivale a guardar.
- Guardar no equivale a consentir grabación.
- No se captura texto libre de respuestas.
- Cualquier futura captura multimedia deberá estar apagada por defecto y requerir consentimiento específico antes de empezar.
- El consentimiento para una grabación grupal no puede otorgarlo únicamente el anfitrión por los demás participantes identificables.

## Gate actual

1. Desplegar el Worker de Fase 7.
2. Pasar smoke Cloudflare con reacción + guardar momento + display read-only.
3. Pasar typecheck, unit tests, build y E2E.
4. Fusionar a `main`.

## Próxima fase

Fase 8 — PWA y resiliencia:
- manifest e instalación;
- iconos/splash propios;
- recuperación tras refresh/suspensión;
- estado offline/degradado;
- estrategia de reconexión.
