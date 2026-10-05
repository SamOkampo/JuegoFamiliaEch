# Estado del proyecto

## Checkpoint actual

- Repositorio inicializado.
- Fase 0 sustancialmente completada.
- Fase 1 en desarrollo en `phase-1-web-foundation`.
- Primera demo local implementada: jugadores, turnos, revelar/cambiar preguntas y primer mazo original.
- Aún no existe backend ni sincronización entre dispositivos.

## Siguiente bloque

1. Añadir tests del motor local.
2. Añadir CI de build + typecheck.
3. Verificar que la Fase 1 compile en limpio.
4. Integrar Fase 1.
5. Empezar Fase 2 con Supabase y salas realtime.

## Decisiones vigentes

- Mobile-first.
- Sin cuenta para entrar al MVP.
- Supabase para Postgres + Realtime, salvo que una prueba técnica demuestre una razón fuerte para cambiar.
- El software guía la conversación; no intenta sustituirla.
- Contenido propio o licenciado únicamente.
