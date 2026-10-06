# Auditoría de seguridad y abuso — Fase 9

## Alcance

Esta auditoría cubre el Worker público, los Durable Objects, los WebSockets de jugadores y display, los datos efímeros de sala y el frontend PWA.

El objetivo es impedir que un cliente no confiable pueda leer una sala privada, actuar como host, mutar el juego fuera de su turno, abusar de los endpoints o enviar payloads arbitrariamente grandes.

## Modelo de confianza

El navegador es **no confiable**. Toda decisión relevante se valida de nuevo en Cloudflare.

La autoridad queda así:

| Acción | Requisito |
| --- | --- |
| Crear sala | HTTP válido + rate limit |
| Unirse | código existente + nombre válido + rate limit |
| Leer estado | `playerId` + token correctos |
| Abrir socket jugador | `playerId` + token correctos |
| Cambiar ready | jugador autenticado |
| Cambiar filtros | host autenticado |
| Obtener token de display | host autenticado |
| Iniciar/finalizar | host autenticado |
| Revelar/cambiar/siguiente | jugador del turno o host + turno esperado |
| Reaccionar/guardar | jugador autenticado + turno esperado + pregunta revelada |
| Display | token de display independiente; solo lectura |
| Endpoints `/internal/*` | solo alcanzables mediante bindings de Durable Objects |

Los snapshots públicos de una sala nunca incluyen tokens de jugador, token de display ni IDs de quienes guardaron un recuerdo.

## Validación de inputs

HTTP:

- solo `application/json`;
- máximo 4 KiB por body;
- JSON debe ser un objeto;
- nombres: 1–24 caracteres, NFC, espacios normalizados;
- controles invisibles/BiDi y nombres sin letras/números son rechazados;
- UUID y tokens internos deben respetar el formato generado por el servidor.

WebSocket:

- máximo 2 KiB por frame de aplicación;
- lista cerrada de tipos de evento;
- booleanos no se convierten desde strings;
- settings se validan contra valores permitidos;
- pool de preguntas: 2–160 índices enteros, únicos y dentro de 0–159;
- reacciones están limitadas al enum permitido;
- eventos ligados a turno requieren `expectedTurnNumber` entero.

## Rate limiting

### HTTP por origen de red

Se usa un Durable Object `RateLimiter` separado del estado de juego.

El identificador de red se convierte a SHA-256 antes de elegir el Durable Object; no se guarda la IP en texto claro.

Límites actuales por ventana de 60 s:

- crear sala: 12;
- unirse: 60;
- leer estado autenticado: 180;
- upgrade WebSocket jugador: 120;
- upgrade WebSocket display: 60.

Los buckets de rate limit se eliminan tras 20 minutos de inactividad.

### WebSocket

Cada socket permite 60 frames de aplicación por 10 segundos. El estado del contador vive en el attachment del WebSocket hibernable.

Al superar el límite se responde `RATE_LIMITED` con `retryAfterMs`. El evento abusivo no se procesa.

## Autorización y sesiones

- Tokens de jugador tienen 24 bytes aleatorios codificados en base64url.
- Códigos de sala no son credenciales.
- La conexión WebSocket autentica el par `playerId + token`.
- Un display usa un secreto distinto y nunca obtiene privilegios de jugador.
- Al salir explícitamente, otros sockets abiertos del mismo jugador se cierran para revocar la sesión.
- Si una pestaña vieja se cierra durante un refresh pero existe otro socket del mismo jugador, no se marca al jugador como desconectado por error.
- Los queries de Worker permanecen redactados en observabilidad.

## Privacidad y abuso

No se guarda texto de respuestas, audio, fotos ni video.

El estado de una sala expira a las 12 horas. Los contadores antiabuso son independientes y expiran tras 20 minutos de inactividad.

El rate limiting usa un hash de IP solo para mitigación de abuso. No se expone al resto de la aplicación ni se incorpora a analítica.

No se usan reacciones, recuerdos o nombres para perfilado.

## Headers

Frontend:

- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `X-Frame-Options: DENY`;
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

API Worker:

- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: no-referrer`;
- permisos de cámara, micrófono y geolocalización deshabilitados.

No se añadió CSP en esta fase para evitar romper el runtime de Next.js sin una estrategia de nonce explícita. Debe reevaluarse antes de producción.

## CI y pruebas

El PR de Fase 9 no se fusiona hasta pasar:

- TypeScript;
- tests unitarios del motor/editorial/PWA;
- tests unitarios de validación y rate limit del Worker;
- smoke crear/unirse/jugar contra Cloudflare;
- integración de autorización/abuso contra el Worker desplegado;
- validación sintáctica de Worker y service worker;
- build de producción;
- E2E WebKit/iPhone y Chromium/Android.

El repositorio no tiene un ruleset de GitHub administrable desde la conexión actual. El flujo de trabajo del proyecto trata CI verde como gate obligatorio de merge; activar branch protection nativa sigue siendo una mejora de administración de repositorio, no una ausencia de validación en el código.
