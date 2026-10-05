# Estado del proyecto

## Checkpoint actual

- Fases 1, 2 y 3 están integradas en `main`.
- Fase 4 — UX presencial está implementada en `phase-4-presential-ux` y pendiente únicamente de CI/merge.
- Backend realtime: Cloudflare Worker + Durable Object `GameRoom` + SQLite.
- Flujo de sala completo: crear, QR/deep link, unirse, listo/no listo, iniciar, turnos, revelar/cambiar, pasar turno, finalizar y recap.
- El deep link usa `/online?room=CODIGO` para precargar la sala antes de pedir el nombre.
- El lobby genera un QR localmente en el navegador; no usa un servicio externo de QR.
- Existe compartir por Web Share API con fallback a copiar enlace.
- Háptica opcional persistida en el navegador; en plataformas sin Vibration API simplemente no vibra.
- Modo escuchar/teléfono boca abajo disponible después de revelar la pregunta.
- UX móvil endurecida con safe areas, targets táctiles >=44 px, foco visible, reduced-motion y high-contrast preferences.
- CI ahora incluye smoke de dos clientes reales contra el Worker desplegado y E2E móvil Playwright con iPhone/WebKit y Android/Chromium.

## Infraestructura actual

- Frontend: Next.js + TypeScript.
- Realtime/backend: Cloudflare Worker.
- Coordinación de salas: Durable Objects.
- Persistencia por sala: SQLite del Durable Object.
- Endpoint backend: `https://juego-familia-ech.socampoecheverry.workers.dev`.
- Sin Supabase para este proyecto.

## Gate actual

1. Obtener CI verde del PR de Fase 4.
2. Corregir cualquier fallo detectado.
3. Fusionar a `main`.
4. Considerar Fase 4 code-complete.
5. El smoke físico iPhone + Android se conserva como gate de beta/producción en Fase 10, documentado en `docs/MOBILE_QA.md`.

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
