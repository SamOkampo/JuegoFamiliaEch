# Estado del proyecto

## Checkpoint actual

- Fases 1, 2, 3, 4 y 5 están integradas en `main`.
- Fase 4 fue fusionada en `a351a0c1ee3d67329a7c6255be98540a4621dd0d`.
- Fase 5 fue fusionada en `f271dcdab50cbcdec6393526c3b35f11cdf21c0c` después de CI completamente verde.
- El mazo `core-v2-160` contiene 160 preguntas originales: 20 por cada una de ocho categorías.
- Cada pregunta incluye intensidad, edad mínima editorial y tipos de grupo compatibles.
- El anfitrión puede configurar tipo de grupo, edad de la persona más joven y profundidad máxima antes de iniciar.
- Los filtros se sincronizan por Durable Object; cambiarlos devuelve a todos al estado “No listo”.
- El cliente calcula el pool elegible y el Worker valida versión, rango, unicidad y tamaño antes de iniciar.
- Preguntas vistas o saltadas no se repiten durante la partida.
- CI editorial valida cantidad, IDs únicos, textos no duplicados, metadatos y cobertura de categorías/filtros.
- Política editorial: `docs/CONTENT_POLICY.md`.
- Worker `core-v2-160` desplegado al 100% en Cloudflare: `7e10918d-7209-4b13-b788-41efb1641622`.
- El smoke E2E de dos clientes contra Cloudflare y las pruebas móviles iPhone/WebKit + Android/Chromium pasaron en verde.

## Infraestructura actual

- Frontend: Next.js + TypeScript.
- Realtime/backend: Cloudflare Worker.
- Coordinación de salas: Durable Objects.
- Persistencia por sala: SQLite del Durable Object.
- Endpoint backend: `https://juego-familia-ech.socampoecheverry.workers.dev`.
- Sin Supabase para este proyecto.

## Gate actual

Fases 4 y 5 están cerradas a nivel de código, CI y merge. El smoke físico en hardware real sigue reservado para la beta/producción.

## Próxima fase

Fase 6 — Pantalla central:
- URL/modo display sin privilegios de jugador.
- turno/pregunta sincronizados.
- UI legible a distancia.

## Decisiones vigentes

- Todo el contenido core es original o deberá estar expresamente licenciado.
- Nunca se copia branding, preguntas o textos de Huellia.
- Un jugador siempre puede cambiar una pregunta sin justificarlo.
- Los filtros editoriales reducen riesgo, pero no sustituyen criterio humano del anfitrión.
- Cambios que reordenen índices requieren una nueva `QUESTION_DECK_VERSION`.
