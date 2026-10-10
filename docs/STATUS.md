# Estado real del proyecto — 10 de octubre de 2026

## Resumen verificable

- **Fases 0–9 y 11–13: implementadas** y fusionadas en `main`.
- **Fase 10**: hosting real, analítica y documentos beta publicados; faltan dominio comercial, QA físico, revisión legal definitiva y beta presencial.
- **Fase 13 — Contenido y variedad: cerrada técnicamente**.
- PR de Fase 13: [#16](https://github.com/SamOkampo/JuegoFamiliaEch/pull/16). Commit de integración: `d9597e3778a63a23dc65a7f93ef15766f3e59483`.
- CI del PR: [run #75](https://github.com/SamOkampo/JuegoFamiliaEch/actions/runs/38018044641), verde.
- CI del merge a `main`: [run #76](https://github.com/SamOkampo/JuegoFamiliaEch/actions/runs/38018266277), verde.
- Backend fase 13: versión `095433a3-00a7-49fd-9d10-ff8ac3e76540`, 100 % en Cloudflare.
- Frontend fase 13: versión `97658ed4-121a-4464-9f6b-c797f2c39aa3`, 100 % en Cloudflare.

## Juego y contenidos

- Frontend: [JuegoFamiliaEch](https://juego-familia-ech-web.socampoecheverry.workers.dev/online).
- Backend: `https://juego-familia-ech.socampoecheverry.workers.dev`.
- Next.js + React + Cloudflare Workers, Durable Objects SQLite y WebSockets.
- Sin registro obligatorio, juego multijugador, pantalla central de solo lectura, PWA, reacciones y recuerdos efímeros.
- 160 preguntas tradicionales originales (mazo `core-v2-160`).
- **100 cartas especiales** (mazo `special-v3-100`): 20 cartas en cada una de las cinco modalidades.
- **Packs Clásicos, Fiesta y Conexiones**: selección sincronizada del anfitrión.
- Filtros editoriales por grupo, edad mínima e intensidad, aplicados por el Worker.
- Reparto de cartas sin repetición hasta agotar las opciones compatibles de cada modalidad.
- Catálogo editorial único en `worker/src/special-content.json`; metadatos del Worker generados y verificados automáticamente.

## Comprobaciones de Fase 13

- Unicidad de las 100 cartas y metadatos editoriales verificados por tests.
- Todas las combinaciones grupo/edad/intensidad/pack cuentan con opciones compatibles.
- Seguridad de settings de packs validada.
- Smoke real Cloudflare verifica cartas aptas para 8 años/nivel 1, manejo de cero packs y 20 cartas consecutivas sin repetir.
- Playwright WebKit/iPhone y Chromium/Android, TypeScript, build Next.js/OpenNext y CI en verde.
- Observabilidad y privacidad sin guardar respuestas habladas; retención por sala de 12 horas.

## Pendientes externos — beta presencial

1. Probar en al menos dos dispositivos físicos, iPhone Safari y Android Chrome.
2. Reunir 4–6 participantes reales con diferentes edades; evaluar ritmo y aceptación de preguntas, sin exponer datos personales.
3. Elegir marca y dominio comercial definitivo.
4. Revisión jurídica final y canal de contacto antes de lanzamiento comercial abierto.

Estos pendientes son parte del paso a beta pública y **no se presentan como pruebas realizadas**. Consulte `docs/PHASE_13_CONTENT.md` y `docs/MOBILE_QA.md`.
