# Estado del proyecto

## Checkpoint actual

- Fases 1 a 7 están integradas en `main`.
- Fase 8 — PWA y resiliencia está implementada en `phase-8-pwa-resilience` y pendiente de CI/merge.
- La app publica `/manifest.webmanifest`, metadata iOS y modo standalone.
- Los iconos PNG de 180, 192 y 512 px se generan dentro del propio proyecto.
- Existe instalación programática cuando el navegador ofrece `beforeinstallprompt` y guía manual cuando no.
- `public/sw.js` mantiene un app shell mínimo y entrega `/offline` cuando falla una navegación.
- El service worker no intercepta el backend realtime ni crea una partida offline paralela.
- La sesión de sala persiste en `localStorage`; al recargar se reconecta y se pide un snapshot autoritativo.
- El display conserva su token en el fragmento de URL y también recupera conexión tras refresh.
- Jugadores y display usan un WebSocket resiliente compartido:
  - backoff 1 → 2 → 4 → 8 s;
  - heartbeat cada 20 s mientras la página está visible;
  - cierre de sockets estancados tras 60 s;
  - reconexión inmediata al evento `online`;
  - pausa de reintentos mientras el navegador está offline;
  - `visibilitychange` y `focus` fuerzan ping + sync.
- Un aviso global informa estado offline y recuperación de conexión.
- La estrategia completa está documentada en `docs/PWA_RESILIENCE.md`.

## Gate actual

1. Typecheck y unit tests, incluido backoff.
2. Smoke realtime Cloudflare.
3. Validación sintáctica Worker + service worker.
4. Production build.
5. E2E iPhone/WebKit + Android/Chromium:
   - manifest e iconos;
   - refresh con sesión;
   - pérdida/recuperación de red;
   - fallback de navegación offline en Chromium.
6. Fusionar Fase 8 a `main`.

## Próxima fase

Fase 9 — Calidad, CI y seguridad:
- ampliar unit/integration/E2E;
- rate limiting;
- validación de inputs;
- auditoría de autorización;
- privacidad y abuso.
