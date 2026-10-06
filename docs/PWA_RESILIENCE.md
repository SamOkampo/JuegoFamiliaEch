# PWA y estrategia de resiliencia

## Objetivo

La Fase 8 hace que JuegoFamiliaEch pueda instalarse y recuperarse de interrupciones móviles sin convertir al navegador en una segunda fuente de verdad del juego.

Cloudflare/Durable Objects continúa siendo la fuente autoritativa de sala, turno, pregunta y recuerdos.

## Instalación

La app publica:

- `/manifest.webmanifest`;
- iconos PNG generados por el propio proyecto en 180, 192 y 512 px;
- modo `standalone`;
- `start_url=/online`;
- metadata para instalación en iOS;
- botón de instalación cuando el navegador expone `beforeinstallprompt`;
- guía de “Añadir a pantalla de inicio” cuando no existe prompt programático.

No se usa un servicio externo para generar iconos.

## Service worker

`public/sw.js` mantiene un app shell pequeño:

- inicio;
- entrada multijugador;
- página offline;
- manifest;
- iconos;
- assets estáticos de Next.

Las navegaciones usan **network-first**. Si la red falla, el service worker intenta la copia ya visitada y después `/offline`.

El service worker no intercepta el WebSocket de Cloudflare ni inventa eventos de partida.

## Refresh

La credencial de jugador de una sala continúa en `localStorage`. Al recargar:

1. la ruta `/room/:code` recupera la sesión local;
2. abre un WebSocket autenticado;
3. el servidor envía el snapshot autoritativo;
4. la UI reemplaza cualquier estado visual antiguo por ese snapshot.

El token del display permanece en el fragmento `#token=...`, por lo que una recarga del display conserva su capacidad de reconectar sin enviar el token al servidor HTTP del frontend.

## Suspensión móvil y cambios de red

Jugadores y display usan `useResilientWebSocket`.

La estrategia es:

- backoff: 1 s → 2 s → 4 s → 8 s máximo;
- heartbeat visible cada 20 s;
- socket considerado estancado después de 60 s sin actividad;
- `online` reconecta inmediatamente;
- `offline` corta reintentos hasta que vuelva la red;
- `visibilitychange` al volver a primer plano fuerza `ping + sync`;
- `focus` hace lo mismo;
- tras cada reconexión se solicita de nuevo un snapshot completo.

Esto cubre cambios Wi‑Fi/datos, pestaña suspendida y bloqueo/desbloqueo del teléfono sin avanzar el juego localmente.

## Modo degradado

Sin internet:

- la UI instalada puede seguir abriéndose;
- aparece un aviso global de conexión;
- una sala ya visible conserva su último snapshot en pantalla;
- los controles que requieren WebSocket no pueden mutar Cloudflare;
- al volver internet se reconecta y sincroniza el estado real.

No existe una “partida offline” paralela porque provocaría conflictos entre teléfonos.

## Privacidad

El service worker cachea interfaz y assets del mismo origen. No cachea respuestas de la API realtime externa ni credenciales de WebSocket.

Las reglas de recuerdos y retención de `docs/PRIVACY_RETENTION.md` no cambian.

## Validación CI

Playwright verifica en iPhone/WebKit y Android/Chromium:

- manifest;
- icono PNG;
- service worker;
- recuperación de sesión después de refresh;
- pérdida y recuperación de red.

Chromium además ejecuta una navegación totalmente offline para confirmar que el service worker entrega la página de fallback.
