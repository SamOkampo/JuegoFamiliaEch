# Estado del proyecto

## Checkpoint actual

- Fases 1, 2, 3, 4, 5, 6, 7, 8 y 9 están integradas en `main`.
- Fase 9 fue fusionada en `2f938d85ea9a021da11355941fd1335e6a0f0522` después de CI completamente verde.
- Worker Fase 9 desplegado al 100% en Cloudflare: `5a598185-49a7-478a-a998-f1ee13b6c235`.
- Cloudflare ahora usa dos Durable Objects:
  - `GameRoom` para estado de sala;
  - `RateLimiter` para mitigación de abuso.
- El identificador de red del rate limiter se deriva con SHA-256; la IP en texto claro no se almacena en la aplicación.
- Los buckets antiabuso se eliminan tras 20 minutos de inactividad.
- Límites HTTP actuales por 60 s:
  - crear sala: 12;
  - unirse: 60;
  - leer estado autenticado: 180;
  - upgrade WebSocket jugador: 120;
  - upgrade WebSocket display: 60.
- Cada WebSocket limita eventos a 60 frames por 10 s.
- HTTP exige JSON válido, objeto y máximo 4 KiB.
- WebSocket limita frames de aplicación a 2 KiB.
- Nombres se normalizan NFC y rechazan caracteres invisibles/BiDi.
- Settings, booleanos, turnos, reacciones y pools de preguntas se validan estrictamente.
- Estado y WebSocket de jugador requieren `playerId + token`.
- El código de sala no funciona como credencial.
- La pantalla central conserva token separado y privilegios de solo lectura.
- Salir explícitamente revoca otros sockets de la misma sesión.
- Un refresh con dos sockets temporales ya no marca al jugador offline mientras exista otra conexión válida.
- Frontend y API incluyen headers de seguridad base.
- Auditoría de autorización/abuso: `docs/SECURITY_AUDIT.md`.
- Política de retención actualizada: `docs/PRIVACY_RETENTION.md`.

## Validación de Fase 9

El PR #8 pasó completamente en verde:

- Typecheck.
- Unit tests del motor/editorial/PWA.
- Worker security unit tests.
- Smoke crear/unirse/jugar contra Cloudflare.
- Security integration smoke contra el Worker desplegado.
- Validación de permisos host/player/display.
- Rechazo de payload HTTP y WebSocket sobredimensionados.
- Validación de inputs malformados.
- Rate limiting WebSocket.
- Sintaxis del Worker.
- Sintaxis del service worker.
- Production build.
- E2E iPhone/WebKit.
- E2E Android/Chromium.

## GitHub Actions

GitHub Actions es el gate de merge usado por el proyecto y Fase 9 no se fusionó hasta tener CI verde.

La conexión GitHub disponible no posee permisos administrativos para crear branch protection/rulesets nativos. Por eso la protección administrativa de `main` no se modificó desde ChatGPT; no se ha afirmado lo contrario.

## Infraestructura actual

- Frontend: Next.js + TypeScript + PWA.
- Realtime/backend: Cloudflare Worker.
- Coordinación de salas: Durable Objects.
- Persistencia por sala: SQLite del Durable Object.
- Rate limiting: Durable Object SQLite independiente.
- Endpoint backend: `https://juego-familia-ech.socampoecheverry.workers.dev`.
- Sin Supabase para este proyecto.

## Gate actual

Fase 9 está cerrada a nivel de código, seguridad, privacidad, pruebas, despliegue Cloudflare, CI y merge.

## Próxima fase

Fase 10 — Producción:
- hosting/frontend público;
- dominio;
- analítica mínima y respetuosa;
- error monitoring;
- privacidad/términos;
- beta con grupos reales;
- smoke físico iPhone Safari + Android Chrome;
- métricas de activación y finalización de partida.
