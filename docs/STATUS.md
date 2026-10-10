# Estado verificable — JuegoFamiliaEch

## Fases cerradas

- **Fases 1–9 y 11–13:** código fusionado en `main` y validación automatizada finalizada.
- **Fase 10:** web y API en producción técnica; quedan tareas externas de beta pública (nombre/dominio comercial, pruebas físicas, revisión legal y pruebas humanas).
- **Fase 13 — Contenido y variedad:** CERRADA técnicamente.

## Versión actual — edición colombiana

- **210 preguntas principales** (`core-v3-210-co`) con recuerdos de infancia, fe y espiritualidad, chismes sanos, primeros amores y fiestas. Los temas sobre embriaguez están restringidos a **18+** y máxima intensidad.
- **100 cartas especiales**, 20 por modalidad, en los packs **Clásicos**, **Fiesta** y **Conexiones**.
- Catálogo de especiales `special-v4-100-co`: tratamiento editorial colombiano.
- Filtros por tipo de grupo, edad, intensidad y packs aplicados por Cloudflare Durable Objects.
- Votaciones privadas, resultados y abstenciones; rondas manuales o cada tres turnos.
- Reparto de especiales sin repetir hasta agotar las cartas compatibles, evitando duplicados consecutivos cuando haya alternativas.
- Tutorial breve, animaciones accesibles, reconexión personal, pantalla central de solo lectura y repetir partida en la misma sala.
- Las respuestas habladas no se almacenan; las salas caducan a las 12 horas.

## Despliegue confirmado — 10 de octubre de 2026

- Código de Fase 13: [PR #16](https://github.com/SamOkampo/JuegoFamiliaEch/pull/16) y edición colombiana [PR #19](https://github.com/SamOkampo/JuegoFamiliaEch/pull/19).
- Commit de `main` validado: `ead2e3addb43c250f994d36d259da1a1f2f3ef1f`.
- GitHub Actions `main`: [CI 38022001169](https://github.com/SamOkampo/JuegoFamiliaEch/actions/runs/38022001169) **verde**, incluidas pruebas móviles WebKit/iPhone y Chromium/Android, seguridad, filtros, smoke multijugador y compilación Cloudflare.
- Smoke HTTP de producción: [38022001159](https://github.com/SamOkampo/JuegoFamiliaEch/actions/runs/38022001159) **verde**.
- Cloudflare frontend `juego-familia-ech-web`: versión `20a128f8-d020-4106-abd6-d25a29393d07`, despliegue al 100%.
- Cloudflare backend `juego-familia-ech`: versión `8600dced-d5e4-436e-974a-b0f790631f57`, despliegue al 100%.
- Web: https://juego-familia-ech-web.socampoecheverry.workers.dev/online
- API: https://juego-familia-ech.socampoecheverry.workers.dev

## Qué falta antes de lanzar comercialmente

1. Probar con iPhone Safari y Android Chrome **físicos**, incluyendo QR, reconexión y dos partidas consecutivas.
2. Beta presencial con 4–6 personas reales, de distintas edades; medir diversión, comprensión de reglas, repeticiones y preguntas incómodas.
3. Elegir marca y dominio comercial definitivo.
4. Revisar términos y política de privacidad jurídicamente, y publicar canal formal de contacto.

Las pruebas en emuladores y los smoke automatizados no sustituyen estas comprobaciones presenciales. Más detalles: `docs/PHASE_13_CONTENT.md`, `docs/MOBILE_QA.md` y `docs/PRODUCTION.md`.
