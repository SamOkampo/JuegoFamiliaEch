# Roadmap de desarrollo

Este documento convierte la visión del producto en entregas verificables. Una fase se considera terminada cuando sus criterios de aceptación están completos y el código correspondiente está integrado en `main`.

## Fase 0 — Producto y arquitectura

**Objetivo:** fijar qué estamos construyendo y qué no.

Criterios:
- [x] Visión del MVP definida.
- [x] Producto independiente: no copiar marca, estética, preguntas ni textos de Huellia.
- [x] Stack base elegido: Next.js + TypeScript + Cloudflare Workers/Durable Objects para realtime.
- [x] Roadmap inicial documentado.
- [ ] Definir nombre comercial e identidad antes de producción.

## Fase 1 — Base web jugable

**Objetivo:** disponer de una experiencia local que permita probar el bucle de conversación antes de introducir red.

Criterios:
- [x] Proyecto Next.js/TypeScript inicial.
- [x] UI mobile-first.
- [x] Alta y eliminación de jugadores.
- [x] Turnos cíclicos.
- [x] Revelar y cambiar pregunta.
- [x] Primer mazo de preguntas originales.
- [x] Tests unitarios del motor.
- [x] CI de build + typecheck.

## Fase 2 — Salas multijugador realtime

**Objetivo:** cada persona juega desde su dispositivo.

Criterios:
- [x] Worker `juego-familia-ech` creado en Cloudflare.
- [x] Durable Object `GameRoom` con almacenamiento SQLite.
- [x] Una sala = un Durable Object nombrado por código.
- [x] Crear sala con código corto.
- [x] Unirse por código.
- [x] Presencia por WebSocket con Hibernation API.
- [x] Reconexión automática del navegador.
- [x] Host inicial persistido.
- [x] Lobby sincronizado en tiempo real.
- [x] Transferencia básica del host al salir o desconectarse.
- [x] E2E multi-cliente contra el Worker desplegado; smoke físico multi-dispositivo pasa a gate de beta en Fase 10.

## Fase 3 — Bucle multijugador completo

- [x] Lobby y listo/no listo.
- [x] Inicio controlado por host.
- [x] Turnos consistentes entre clientes.
- [x] Revelar pregunta.
- [x] Cambiar pregunta sin repetir.
- [x] Siguiente turno idempotente mediante `expectedTurnNumber`.
- [x] Finalizar partida manualmente o al agotar el mazo.
- [x] Evitar repetición de preguntas durante una sesión.

## Fase 4 — UX presencial

- [x] QR de acceso.
- [x] Deep link a sala con código precargado.
- [x] Estado de conexión/reconexión visible y anunciado de forma accesible.
- [x] Háptica opcional al llegar el turno, persistida por navegador.
- [x] Modo “escuchen / teléfono boca abajo”.
- [x] Accesibilidad de contraste, foco, safe areas y tamaño táctil.
- [x] E2E automatizado WebKit/iPhone y Chromium/Android con Playwright.

## Fase 5 — Contenido original

- [x] 160 preguntas originales en `core-v2-160`.
- [x] Ocho categorías y tres niveles de intensidad.
- [x] Filtros sincronizados por grupo, edad mínima editorial e intensidad máxima.
- [x] CI valida IDs, duplicados normalizados, metadatos, categorías y pools de filtros.
- [x] Política editorial documentada en `docs/CONTENT_POLICY.md`.

## Fase 6 — Pantalla central

- [x] URL/modo display protegido por token emitido al anfitrión.
- [x] Sincronización realtime de lobby, turno, revelado y recap.
- [x] UI responsive de alto contraste optimizada para TV/iPad/computador.
- [x] WebSocket dedicado de solo lectura; comandos de juego son rechazados.

## Fase 7 — Recuerdos y reacciones

- [x] Reacciones ligeras por turno con agregados sincronizados.
- [x] “Guardar este momento” solo con acción explícita y reversible durante el turno.
- [x] Recap final enriquecido con reacciones y momentos guardados.
- [x] Retención definida: estado efímero eliminado con la sala a las 12 horas.
- [x] Política de consentimiento previo para futura captura multimedia documentada.

## Fase 8 — PWA y resiliencia

- [x] Manifest, metadata iOS e instalación/añadir a inicio.
- [x] Iconos PNG propios generados por la app y colores de splash/theme.
- [x] Recuperación tras refresh desde sesión local + snapshot autoritativo.
- [x] Recuperación tras suspensión/focus/visibility con heartbeat y resync.
- [x] Estado offline/degradado global + fallback de service worker.
- [x] Backoff 1/2/4/8 s, heartbeat, detección de socket estancado y reconexión inmediata al volver la red.

## Fase 9 — Calidad, CI y seguridad

- [x] Unit tests del motor, contenido, PWA y primitivas de seguridad del Worker.
- [x] Integration smoke de autorización, validación y abuso contra Cloudflare desplegado.
- [x] E2E/smoke real de crear sala, unirse y completar acciones de juego.
- [x] GitHub Actions usado como gate obligatorio del flujo de merge; el PR no se fusiona sin CI verde.
- [x] Validación estricta de HTTP, nombres, eventos WebSocket, settings y pools.
- [x] Rate limiting durable por red para HTTP y por socket para eventos realtime.
- [x] Matriz de autorización auditada y documentada en `docs/SECURITY_AUDIT.md`.
- [x] Revisión de privacidad/abuso, retención antiabuso y headers documentados.

## Fase 10 — Producción

- [ ] Hosting.
- [ ] Dominio.
- [x] Analítica mínima y respetuosa con logs estructurados de Workers Observability y sin PII de sala.
- [x] Observabilidad backend + conteo cliente sanitizado de clases de error.
- [x] Aviso de privacidad y términos beta publicados en `/privacy` y `/terms`.
- [ ] Beta con grupos reales.
- [ ] Smoke físico iPhone Safari + Android Chrome según `docs/MOBILE_QA.md`.
- [x] Eventos server-side para salas creadas, juegos iniciados y juegos finalizados.

## Fase 11 — Expansión

Solo después de validar el juego base:
- [ ] Seguimientos opcionales con IA.
- [ ] Packs adicionales.
- [ ] Cuentas opcionales.
- [ ] Biblioteca de recuerdos.
- [ ] Monetización.
