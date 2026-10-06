# Producción — Fase 10

## Objetivo

Cerrar la distancia entre un MVP técnicamente funcional y una beta cerrada que pueda abrirse con confianza.

## Lo que queda preparado en el repositorio

### Frontend en Cloudflare Workers

El frontend Next.js conserva su configuración normal y añade OpenNext como ruta de despliegue a Cloudflare Workers.

Archivos:

- `wrangler.jsonc`;
- `open-next.config.ts`.

Scripts:

- `npm run build:cloudflare`;
- `npm run preview:cloudflare`;
- `npm run deploy:web`.

El Worker web se llama `juego-familia-ech-web`. CI ejecuta el build de Cloudflare además del `next build` normal para detectar incompatibilidades antes de desplegar.

El despliegue real del frontend requiere autenticar Wrangler/Cloudflare en el entorno que ejecuta el deploy. Esa credencial no se guarda en el repositorio.

### Backend

El backend realtime continúa en:

`https://juego-familia-ech.socampoecheverry.workers.dev`

La observabilidad de Workers permanece habilitada y las query strings se redactan porque los upgrades WebSocket transportan credenciales técnicas.

## Analítica mínima

Los eventos se emiten como logs estructurados de Cloudflare Workers Observability. No dependen de herramientas publicitarias de terceros.

Existe soporte opcional para el dataset `juego_familia_ech_product` de Workers Analytics Engine cuando esa capacidad se habilite en la cuenta.

Eventos servidor:

- `room_created`;
- `player_joined`;
- `game_started`;
- `game_finished`.

Métricas disponibles incluyen tamaño del grupo, tamaño del pool, número de turnos y recuerdos guardados. No se escriben nombres, códigos de sala, player IDs, tokens ni respuestas.

Eventos cliente permitidos:

- `client_error_runtime`;
- `client_error_promise`;
- `client_error_resource`;
- `pwa_installed`.

El navegador envía únicamente el tipo de evento y una superficie genérica como `room` o `display`; nunca la URL completa ni el código de la sala.

### Activación y finalización

Para beta:

- **Sala creada** = `room_created`.
- **Activación de juego** = `game_started`.
- **Finalización** = `game_finished`.

La tasa de activación puede calcularse como partidas iniciadas / salas creadas. La tasa de finalización puede calcularse como partidas finalizadas / partidas iniciadas.

## Error monitoring

Backend:

- Cloudflare Workers Observability habilitado;
- métricas de producto y errores se emiten como logs estructurados;
- logs/traces de ejecución disponibles desde Cloudflare;
- query strings redactadas.

Frontend:

- se cuentan clases generales de error por superficie;
- no se transmiten mensajes de error, stack traces ni contenido de usuario desde el navegador.

Esto prioriza privacidad durante la beta. Si en el futuro se adopta un proveedor dedicado de error monitoring, deberá mantener redacción equivalente.

## Privacidad y términos

Rutas públicas:

- `/privacy`;
- `/terms`.

Los textos actuales son para beta cerrada. Antes de lanzamiento comercial abierto hace falta revisión jurídica y publicar un canal formal de contacto.

## Trabajo que no puede cerrarse solo desde GitHub

1. Elegir el nombre comercial definitivo.
2. Elegir/comprar el dominio o indicar uno ya disponible.
3. Conectar ese dominio al Worker web.
4. Autorizar el deploy del frontend mediante credenciales de Cloudflare/Workers Builds.
5. Ejecutar smoke físico en iPhone Safari y Android Chrome reales.
6. Hacer al menos una beta con un grupo humano real y registrar feedback.

El código, CI, páginas legales, telemetría, métricas y configuración de hosting sí pueden prepararse desde el repositorio.
