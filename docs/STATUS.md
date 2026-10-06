# Estado del proyecto

## Checkpoint actual

- Fases 1, 2, 3, 4, 5, 6, 7 y 8 están integradas en `main`.
- Fase 8 fue fusionada en `5a46d4c14d1911bad49a1730ff225b3a34f84bdd` después de CI completamente verde.
- La aplicación ya publica manifest, metadata iOS, iconos PNG propios y modo standalone.
- Existe instalación programática cuando el navegador ofrece `beforeinstallprompt` y guía de “Añadir a pantalla de inicio” como fallback.
- `public/sw.js` mantiene un app shell mínimo y una página `/offline` para navegación degradada.
- El service worker usa network-first para páginas y cache-first para assets estáticos; no crea una partida offline paralela.
- La sesión de jugador sobrevive a refresh mediante `localStorage` y vuelve a pedir el snapshot autoritativo al Worker.
- La pantalla central conserva el token en el fragmento de URL y también se recupera tras refresh.
- Jugadores y display comparten una estrategia WebSocket resiliente:
  - backoff 1 → 2 → 4 → 8 segundos;
  - heartbeat cada 20 segundos mientras la página está visible;
  - cierre de socket estancado tras 60 segundos sin actividad;
  - reconexión inmediata al recuperar internet;
  - pausa de reintentos mientras el navegador está offline;
  - resync al volver a foreground o focus.
- Un aviso global informa cuando no hay internet y cuando la conexión vuelve.
- La estrategia completa está documentada en `docs/PWA_RESILIENCE.md`.

## Validación de Fase 8

CI pasó en verde:

- Typecheck.
- 17 unit/editorial/resilience tests.
- Smoke multiplayer contra Cloudflare.
- Sintaxis del Worker.
- Sintaxis del service worker.
- Production build.
- E2E iPhone/WebKit.
- E2E Android/Chromium.
- Manifest e iconos.
- Refresh conservando sesión.
- Pérdida y recuperación de red.
- Fallback de navegación offline mediante service worker.

## Infraestructura actual

- Frontend: Next.js + TypeScript + PWA.
- Realtime/backend: Cloudflare Worker.
- Coordinación de salas: Durable Objects.
- Persistencia por sala: SQLite del Durable Object.
- Endpoint backend: `https://juego-familia-ech.socampoecheverry.workers.dev`.
- Sin Supabase para este proyecto.

## Gate actual

Fase 8 está cerrada a nivel de código, PWA, resiliencia, CI y merge.

## Próxima fase

Fase 9 — Calidad, CI y seguridad:
- ampliar unit/integration/E2E;
- validación de inputs;
- rate limiting;
- auditoría de autorización de salas/Durable Objects;
- revisión de privacidad y abuso.
