# Estado del proyecto

## Checkpoint actual

- Fase 0 completada salvo nombre comercial definitivo.
- Fase 1 integrada en `main` mediante PR #1 con CI verde.
- Fase 2 en desarrollo en `phase-2-cloudflare-realtime`.
- Backend Cloudflare creado y desplegado como `juego-familia-ech`.
- Durable Object `GameRoom` provisionado con SQLite.
- API de crear/unirse a sala implementada.
- Lobby con WebSocket Hibernation, presencia y reconexión implementado.
- Frontend `/online` y `/room/[code]` conectado al Worker.

## Infraestructura actual

- Frontend: Next.js + TypeScript.
- Realtime/backend: Cloudflare Worker.
- Coordinación de salas: Durable Objects.
- Persistencia por sala: SQLite del Durable Object.
- Endpoint: `https://juego-familia-ech.socampoecheverry.workers.dev`.
- Sin Supabase para este proyecto.

## Siguiente bloque

1. Pasar CI de la rama de Fase 2.
2. Verificar dos o más clientes conectados a la misma sala.
3. Añadir estado listo/no listo.
4. Permitir al host iniciar partida.
5. Sincronizar primer turno y pregunta.
6. Añadir transferencia de host/reentrada robusta.

## Decisiones vigentes

- Mobile-first y sin cuenta para entrar al MVP.
- Una sala se coordina desde un único Durable Object para evitar carreras de estado.
- WebSocket Hibernation para mantener conexiones con menor coste cuando la sala está inactiva.
- Las salas expiran automáticamente tras 12 horas.
- Los tokens de jugador son credenciales locales de sesión y nunca deben guardarse en Git.
- Contenido propio o licenciado únicamente.
