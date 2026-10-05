# JuegoFamiliaEch

JuegoFamiliaEch es el nombre de trabajo de un juego web grupal presencial para familias y otros grupos. Cada participante entra desde su propio teléfono a una sala compartida y el software coordina turnos, preguntas y dinámicas para favorecer conversaciones reales cara a cara.

> El proyecto es original e independiente. No se copiarán marca, diseño, textos, preguntas ni otros contenidos de Huellia u otros juegos comerciales.

## Visión del MVP

- Crear una sala desde el navegador.
- Compartirla por código corto o QR.
- Entrar sin cuenta, usando un nombre.
- Sincronizar jugadores y turnos en tiempo real.
- Jugar mazos de preguntas originales por categoría e intensidad.
- Mantener los teléfonos como apoyo de la conversación, no como centro de atención.
- Permitir una pantalla central opcional para TV, tableta o computador.
- Funcionar bien como PWA en iPhone y Android.

## Roadmap

### Fase 0 — Producto y arquitectura
Definir reglas, alcance del MVP, arquitectura, modelo de datos, límites de propiedad intelectual y criterios de terminado.

### Fase 1 — Base web jugable
Next.js + TypeScript, interfaz mobile-first, dominio del juego, motor local de turnos y una demo con preguntas originales.

### Fase 2 — Salas multijugador en tiempo real
Crear/unirse a sala, código corto, presencia, reconexión, host, sincronización y base de datos con Supabase.

### Fase 3 — Bucle completo de juego
Lobby, orden de turnos, revelar pregunta, saltar, profundizar, siguiente jugador, fin de partida y protección frente a acciones duplicadas.

### Fase 4 — UX presencial
QR, modo "teléfono boca abajo", vibración/háptica cuando corresponda, accesibilidad, feedback de conexión y experiencia optimizada para grupos en círculo.

### Fase 5 — Contenido original
Mazos propios por categorías, intensidad, edades/roles y reglas para evitar repeticiones. Objetivo inicial: 150+ preguntas originales revisadas.

### Fase 6 — Pantalla central
Modo TV/tableta/computador sincronizado con la sala, con turnos y preguntas visibles para todo el grupo.

### Fase 7 — Recuerdos y reacciones
Guardar momentos con consentimiento, reacciones ligeras y recap final de la sesión. Sin grabar audio por defecto.

### Fase 8 — PWA y resiliencia
Instalable, reconexión, recuperación de sala, manejo de pestaña suspendida, degradación elegante y pruebas móviles reales.

### Fase 9 — Calidad, CI y seguridad
Lint, typecheck, tests, E2E, GitHub Actions, RLS, validación de inputs, rate limiting y revisión de privacidad.

### Fase 10 — Producción
Deploy, dominio, analítica respetuosa, observabilidad, política de privacidad, términos y beta cerrada con familias reales.

### Fase 11 — Expansión opcional
Preguntas de seguimiento generadas por IA, packs (familia, amigos, pareja, equipos), cuentas opcionales y monetización.

## Stack inicial

- Next.js (App Router)
- TypeScript
- React
- Cloudflare Workers + Durable Objects (SQLite + WebSockets) a partir de la Fase 2
- PWA
- Vitest / Playwright
- GitHub Actions

## Principios de producto

1. La conversación ocurre entre personas; la pantalla solo guía.
2. Entrar a una partida debe tomar segundos.
3. Nada importante depende de crear una cuenta.
4. El host coordina, pero no monopoliza la experiencia.
5. Todo contenido del juego será original o debidamente licenciado.
6. Privacidad por defecto: guardar recuerdos será opcional y explícito.
