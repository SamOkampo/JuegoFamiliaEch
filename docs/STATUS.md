# Estado del proyecto

## Checkpoint actual

- Fases 1, 2, 3 y 4 están integradas en `main`.
- Fase 5 — Contenido original está implementada en `phase-5-original-content` y pendiente de CI/merge.
- El mazo `core-v2-160` contiene 160 preguntas originales: 20 por cada una de ocho categorías.
- Cada pregunta incluye intensidad, edad mínima editorial y tipos de grupo compatibles.
- El anfitrión puede configurar tipo de grupo, edad de la persona más joven y profundidad máxima antes de iniciar.
- Los filtros se sincronizan por Durable Object; cambiarlos devuelve a todos al estado “No listo”.
- El cliente calcula el pool elegible y el Worker valida versión, rango, unicidad y tamaño antes de iniciar.
- Preguntas vistas o saltadas siguen sin repetirse durante la partida.
- CI editorial valida cantidad, IDs únicos, textos no duplicados, metadatos y cobertura de categorías/filtros.
- Política editorial: `docs/CONTENT_POLICY.md`.
- Worker de Fase 5 desplegado en Cloudflare; el último deployment se verifica antes del gate final.

## Infraestructura actual

- Frontend: Next.js + TypeScript.
- Realtime/backend: Cloudflare Worker.
- Coordinación de salas: Durable Objects.
- Persistencia por sala: SQLite del Durable Object.
- Endpoint backend: `https://juego-familia-ech.socampoecheverry.workers.dev`.
- Sin Supabase para este proyecto.

## Gate actual

1. Desplegar la versión final del Worker de Fase 5.
2. Pasar CI completo: typecheck, unit/editorial tests, smoke Cloudflare, build y mobile E2E.
3. Fusionar Fase 5 a `main`.

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
