# Estado del proyecto

## Checkpoint actual

- Fase 0 completada salvo nombre comercial definitivo.
- Fase 1 integrada en `main` mediante PR #1 con CI verde.
- Fase 2 casi cerrada en `phase-2-cloudflare-realtime`; queda la validación E2E con varios dispositivos reales.
- Backend Cloudflare desplegado como `juego-familia-ech`.
- Durable Object `GameRoom` provisionado con SQLite.
- Crear/unirse a sala, presencia, reconexión y transferencia básica de host implementados.
- Lobby listo/no listo sincronizado en tiempo real.
- El host puede iniciar cuando todos están conectados y listos.
- El Durable Object selecciona un primer jugador y una primera pregunta y los sincroniza a todos los teléfonos.
- Salida explícita de sala elimina credenciales locales y limpia el jugador del backend.
- El CI ahora cancela ejecuciones obsoletas y valida también la sintaxis del Worker.

## Infraestructura actual

- Frontend: Next.js + TypeScript.
- Realtime/backend: Cloudflare Worker.
- Coordinación de salas: Durable Objects.
- Persistencia por sala: SQLite del Durable Object.
- Endpoint: `https://juego-familia-ech.socampoecheverry.workers.dev`.
- Sin Supabase para este proyecto.
- Query strings ocultos en observabilidad para no registrar tokens WebSocket.

## Gate actual

1. Esperar CI verde del PR #2.
2. Fusionar PR #2.
3. Hacer prueba E2E real con dos navegadores/teléfonos en la misma sala.
4. Si pasa, cerrar formalmente Fase 2 y seguir con Fase 3.

## Próximo bloque de Fase 3

1. Revelar pregunta de forma sincronizada.
2. Cambiar pregunta sin repetir.
3. Siguiente turno idempotente.
4. Finalizar partida y recap mínimo.

## Decisiones vigentes

- Mobile-first y sin cuenta para entrar al MVP.
- Una sala se coordina desde un único Durable Object para evitar carreras de estado.
- WebSocket Hibernation para mantener conexiones con menor coste cuando la sala está inactiva.
- Las salas expiran automáticamente tras 12 horas.
- Los tokens de jugador son credenciales locales de sesión y nunca deben guardarse en Git.
- Contenido propio o licenciado únicamente.
