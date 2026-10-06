# Estado del proyecto

## Checkpoint actual

- Fases 1 a 8 están integradas en `main`.
- Fase 9 — Calidad, CI y seguridad está implementada en `phase-9-quality-security` y pendiente de CI/merge.
- El Worker de Fase 9 está desplegado al 100% en Cloudflare: `5a598185-49a7-478a-a998-f1ee13b6c235`.
- Se añadió un Durable Object separado `RateLimiter` con almacenamiento SQLite.
- El rate limiter usa un identificador SHA-256 derivado de la IP de red; la IP en texto claro no se guarda en storage de la aplicación.
- Los buckets antiabuso se eliminan tras 20 minutos de inactividad.
- Límites HTTP actuales por 60 s:
  - crear sala: 12;
  - unirse: 60;
  - leer estado: 180;
  - upgrade WebSocket jugador: 120;
  - upgrade WebSocket display: 60.
- Cada WebSocket acepta hasta 60 frames de aplicación por 10 s antes de devolver `RATE_LIMITED`.
- HTTP exige `application/json`, objetos JSON y máximo 4 KiB.
- WebSocket limita frames de aplicación a 2 KiB.
- Nombres se normalizan NFC y rechazan controles invisibles/BiDi.
- Settings, booleanos, turnos, reacciones y pools de preguntas se validan de forma estricta.
- Estado de sala y WebSocket jugador siguen requiriendo `playerId + token`.
- El código de sala sigue siendo un localizador, no una credencial.
- El display mantiene token independiente y permisos de solo lectura.
- Salir explícitamente revoca otros sockets del mismo jugador.
- Cerrar una pestaña antigua durante refresh ya no marca al jugador offline si existe otro socket activo.
- Frontend y API añaden headers de seguridad básicos.
- Auditoría completa: `docs/SECURITY_AUDIT.md`.
- Retención antiabuso añadida a `docs/PRIVACY_RETENTION.md`.

## Gate actual

1. Unit tests, incluidos helpers de seguridad.
2. Smoke crear/unirse/jugar contra Cloudflare.
3. Integration smoke de autorización, payloads inválidos, privilegios y rate limit.
4. Typecheck, sintaxis Worker/service worker y production build.
5. E2E WebKit/iPhone + Chromium/Android.
6. Fusionar Fase 9 a `main` solo con CI verde.

## GitHub Actions

El repositorio no tiene un ruleset administrable desde la conexión GitHub actual; esa conexión no posee permisos de administración de branch protection. En este proyecto, CI verde se trata como gate obligatorio del merge y esta fase no se fusionará si falla.

## Próxima fase

Fase 10 — Producción:
- hosting/frontend público;
- dominio;
- analítica mínima;
- error monitoring;
- privacidad/términos;
- beta física;
- smoke real iPhone Safari + Android Chrome;
- métricas de activación/finalización.
