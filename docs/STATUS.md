# Estado del proyecto

## Checkpoint actual

- Fases 1 a 9 están integradas en `main`.
- Fase 10 — Producción está en progreso en `phase-10-production-readiness`.
- El repositorio ya contiene configuración de deploy del frontend Next.js a Cloudflare Workers mediante OpenNext.
- CI valida tanto `next build` como `npm run build:cloudflare`.
- Se añadieron rutas públicas `/privacy` y `/terms` para beta cerrada.
- Se añadió telemetría cliente sanitizada sin mensajes, stacks, URLs completas ni códigos de sala.
- El Worker registra métricas server-side como logs estructurados de Workers Observability de:
  - sala creada;
  - jugador unido;
  - partida iniciada;
  - partida finalizada.
- La definición de activación/finalización y la arquitectura de producción están en `docs/PRODUCTION.md`.
- El backend mantiene Cloudflare Workers Observability y redacción de query strings.

## Fase 10 — completado desde código/GitHub

- Configuración de hosting frontend lista para Cloudflare Workers.
- Build de hosting añadido al gate CI.
- Analítica mínima y respetuosa implementada.
- Métricas de activación/finalización implementadas.
- Error monitoring backend + cliente sanitizado.
- Privacidad beta publicada.
- Términos beta publicados.

## Pendientes externos/humanos de Fase 10

- Ejecutar el deploy real del frontend con credenciales de Cloudflare o Workers Builds.
- Elegir y conectar dominio definitivo.
- Definir nombre/identidad comercial definitiva.
- Smoke físico iPhone Safari + Android Chrome.
- Beta con grupos reales.
- Revisión jurídica final y canal formal de contacto antes de lanzamiento abierto.

## Gate actual

Pendiente desplegar el Worker backend de Fase 10, pasar CI del PR y verificar eventos reales. Analytics Engine queda como mejora opcional porque la cuenta aún no tiene esa capacidad habilitada.
