# Estado del proyecto

## Checkpoint actual

- Fases 1 a 9 están cerradas e integradas en `main`.
- Fase 10 — Producción sigue abierta porque conserva gates externos/humanos.
- El bloque de producción que sí podía resolverse desde código/GitHub quedó fusionado en `6f08f6982398545e299c7d5610a34c887d43049b` después de CI verde.
- PR #9 quedó fusionado.
- Worker backend de Fase 10 desplegado al 100% en Cloudflare: `372fa9f9-6abf-4dbc-af3c-46b6fdcd46a4`.

## Producción ya preparada

- Frontend Next.js preparado para Cloudflare Workers mediante OpenNext.
- `wrangler.jsonc` y `open-next.config.ts` integrados.
- Scripts disponibles:
  - `npm run build:cloudflare`;
  - `npm run preview:cloudflare`;
  - `npm run deploy:web`.
- CI pasa tanto `next build` como el build Cloudflare.
- Rutas públicas de beta:
  - `/privacy`;
  - `/terms`.
- Enlaces legales visibles desde landing y entrada multijugador.
- Workers Observability continúa habilitado con query strings redactadas.
- Métricas server-side estructuradas:
  - `room_created`;
  - `player_joined`;
  - `game_started`;
  - `game_finished`.
- Métrica agregada de instalación PWA.
- Error monitoring cliente sanitizado:
  - runtime;
  - promise;
  - resource.
- No se envían mensajes de error, stack traces, códigos de sala, nombres, tokens ni respuestas.
- Telemetría protegida por allowlist y rate limiting.
- Definiciones de activación/finalización documentadas en `docs/PRODUCTION.md`.
- Analytics Engine queda como mejora opcional: la cuenta Cloudflare todavía no lo tiene habilitado, pero las métricas actuales funcionan mediante logs estructurados de Workers Observability.

## Validación del bloque Fase 10

CI #46 pasó completamente en verde:

- Typecheck.
- Unit tests.
- Worker security unit tests.
- Smoke realtime contra Cloudflare.
- Security integration smoke.
- Sintaxis Worker/service worker.
- Next.js production build.
- OpenNext/Cloudflare frontend build.
- E2E WebKit/iPhone.
- E2E Chromium/Android.

## Fase 10 — pendientes externos/humanos

- [ ] Ejecutar el deploy real del frontend `juego-familia-ech-web` con credenciales de Cloudflare o Workers Builds.
- [ ] Elegir el nombre comercial definitivo.
- [ ] Elegir/comprar o indicar el dominio definitivo y conectarlo.
- [ ] Hacer smoke físico con iPhone Safari real + Android Chrome real.
- [ ] Probar una beta con grupos humanos reales y registrar feedback.
- [ ] Revisión jurídica final y canal formal de contacto antes de lanzamiento comercial abierto.

## Infraestructura actual

- Frontend: Next.js + TypeScript + PWA, build Cloudflare validado.
- Realtime/backend: Cloudflare Worker.
- Coordinación de salas: Durable Objects.
- Persistencia por sala: SQLite del Durable Object.
- Rate limiting: Durable Object SQLite independiente.
- Backend: `https://juego-familia-ech.socampoecheverry.workers.dev`.

## Gate actual

Fase 10 no se declara cerrada todavía. El siguiente paso técnico de mayor impacto es desplegar el frontend preparado en Cloudflare Workers; después corresponde dominio y QA físico.
