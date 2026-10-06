# Estado del proyecto

## Checkpoint actual

- Fases 1, 2, 3, 4, 5 y 6 están integradas en `main`.
- Fase 6 fue fusionada en `cfce25f8ef37c81145bc8306c9a5495b84902731` después de CI completamente verde.
- Existe una pantalla central segura en `/display/:code` para TV, computador o iPad.
- El anfitrión solicita un token de display desde su WebSocket autenticado.
- El enlace usa `/display/CODIGO#token=...`; el secreto queda en el fragmento del navegador.
- La pantalla central usa un WebSocket separado de solo lectura y no tiene `playerId`.
- El Worker rechaza cualquier comando de juego desde display con `DISPLAY_READ_ONLY`.
- El display sincroniza lobby, jugadores/listo, turno, pregunta revelada y recap final.
- La pregunta sigue oculta en display hasta que se revela desde un jugador autorizado.
- La pantalla central no altera presencia, ready, host, turnos ni estado de la partida.
- UI preparada para verse a distancia y con modo pantalla completa local.
- El smoke Cloudflare verificó sincronización player/display y que el display no puede mutar el juego.
- Typecheck, unit tests, smoke Cloudflare, build y E2E mobile/display pasaron en verde.
- Worker Fase 6 desplegado al 100% en Cloudflare: `9c88f418-9ce6-4092-9ff8-a43243f91650`.

## Infraestructura actual

- Frontend: Next.js + TypeScript.
- Realtime/backend: Cloudflare Worker.
- Coordinación de salas: Durable Objects.
- Persistencia por sala: SQLite del Durable Object.
- Endpoint backend: `https://juego-familia-ech.socampoecheverry.workers.dev`.
- Sin Supabase para este proyecto.

## Gate actual

Fase 6 está cerrada a nivel de código, seguridad, CI, despliegue del Worker y merge.

## Próxima fase

Fase 7 — Recuerdos y reacciones:
- reacciones ligeras;
- “guardar este momento” solo con acción explícita;
- recap enriquecido;
- política de retención;
- consentimiento antes de cualquier futura captura multimedia.

## Decisiones vigentes

- La pantalla central es observador de solo lectura, no jugador.
- El código de sala por sí solo no autoriza un display.
- Los tokens de display no se exponen en snapshots públicos.
- Query strings del Worker continúan redactados en observabilidad.
- Todo contenido core sigue siendo original o expresamente licenciado.
