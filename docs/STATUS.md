# Estado del proyecto

## Checkpoint actual

- Fases 1, 2, 3 y 4 están integradas en `main`.
- PR #3 de Fase 4 pasó CI completo y fue fusionado en `a351a0c1ee3d67329a7c6255be98540a4621dd0d`.
- Backend realtime: Cloudflare Worker + Durable Object `GameRoom` + SQLite.
- Flujo de sala completo: crear, QR/deep link, unirse, listo/no listo, iniciar, turnos, revelar/cambiar, pasar turno, finalizar y recap.
- El deep link usa `/online?room=CODIGO` para precargar la sala antes de pedir el nombre.
- El lobby genera el QR localmente en el navegador; no depende de un servicio externo.
- Compartir invitación usa Web Share API con fallback a copiar enlace.
- Háptica opcional persistida en el navegador; plataformas sin Vibration API continúan sin error.
- Modo escuchar/teléfono boca abajo disponible después de revelar la pregunta.
- UX móvil incluye safe areas, targets táctiles >=44 px, foco visible, reduced-motion y high-contrast preferences.
- CI incluye un smoke de dos clientes contra el Worker desplegado y E2E móvil con iPhone/WebKit y Android/Chromium.
- El smoke físico en hardware real queda como gate de beta/producción, documentado en `docs/MOBILE_QA.md`.

## Infraestructura actual

- Frontend: Next.js + TypeScript.
- Realtime/backend: Cloudflare Worker.
- Coordinación de salas: Durable Objects.
- Persistencia por sala: SQLite del Durable Object.
- Endpoint backend: `https://juego-familia-ech.socampoecheverry.workers.dev`.
- Sin Supabase para este proyecto.

## Gate actual

Fase 4 está cerrada a nivel de código y CI. El próximo trabajo de producto es Fase 5 — Contenido original.

## Próxima fase

Fase 5 — Contenido original:
- 150+ preguntas originales.
- categorías y niveles de intensidad.
- filtros por grupo/edad cuando corresponda.
- revisión de duplicados/calidad.
- política editorial.

## Decisiones vigentes

- Mobile-first y sin cuenta para entrar al MVP.
- Una sala se coordina desde un único Durable Object para evitar carreras de estado.
- WebSocket Hibernation para reducir coste cuando la sala está inactiva.
- Las salas expiran automáticamente tras 12 horas.
- Los tokens de jugador son credenciales locales de sesión y nunca deben guardarse en Git.
- Contenido propio o licenciado únicamente.
