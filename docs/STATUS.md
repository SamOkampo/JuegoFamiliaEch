# Estado del proyecto

## Checkpoint actual

- Fase 0 completada salvo nombre comercial definitivo.
- Fase 1 integrada en `main` mediante PR #1 con CI verde.
- Fases 2 y 3 implementadas en `phase-2-cloudflare-realtime`, pendientes del gate final de CI/merge y de una prueba E2E física con dos dispositivos.
- Backend Cloudflare desplegado como `juego-familia-ech`.
- Durable Object `GameRoom` provisionado con SQLite.
- Crear/unirse a sala, presencia, reconexión y transferencia básica de host implementados.
- Lobby listo/no listo sincronizado en tiempo real.
- El host inicia únicamente cuando hay 2+ jugadores conectados y listos.
- El servidor elige el primer jugador y la primera pregunta.
- Las preguntas permanecen ocultas hasta el evento sincronizado de revelar.
- Cambiar pregunta evita reutilizar preguntas ya vistas o saltadas.
- El siguiente turno usa `expectedTurnNumber` para rechazar dobles clics/eventos obsoletos.
- La partida termina por decisión del host o al agotar el mazo.
- Existe recap mínimo con personas, turnos y preguntas usadas.
- Salida explícita elimina credenciales locales y limpia el jugador del backend.
- El CI cancela ejecuciones obsoletas y valida typecheck, tests, sintaxis del Worker y build.

## Infraestructura actual

- Frontend: Next.js + TypeScript.
- Realtime/backend: Cloudflare Worker.
- Coordinación de salas: Durable Objects.
- Persistencia por sala: SQLite del Durable Object.
- Endpoint: `https://juego-familia-ech.socampoecheverry.workers.dev`.
- Sin Supabase para este proyecto.
- Query strings ocultos en observabilidad para no registrar tokens WebSocket.

## Gate actual

1. Obtener CI verde del head actual del PR #2.
2. Fusionar PR #2 a `main`.
3. Hacer prueba E2E física con dos navegadores/teléfonos en la misma sala.
4. Si la prueba física revela un bug, corregirlo antes de iniciar Fase 4.

## Próxima fase

Fase 4 — UX presencial:
- QR/deep link.
- háptica opcional.
- modo teléfono boca abajo.
- accesibilidad.
- pruebas Safari iPhone y Chrome Android.

## Decisiones vigentes

- Mobile-first y sin cuenta para entrar al MVP.
- Una sala se coordina desde un único Durable Object para evitar carreras de estado.
- WebSocket Hibernation para mantener conexiones con menor coste cuando la sala está inactiva.
- Las salas expiran automáticamente tras 12 horas.
- Los tokens de jugador son credenciales locales de sesión y nunca deben guardarse en Git.
- Contenido propio o licenciado únicamente.
