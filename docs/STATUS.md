# Estado del proyecto

## Checkpoint actual

- Fases 1 a 5 están integradas en `main`.
- Fase 6 — Pantalla central está implementada en `phase-6-central-display` y pendiente de CI/merge.
- El anfitrión puede solicitar un token de display desde su WebSocket autenticado.
- El enlace usa `/display/CODIGO#token=...`; el secreto queda en el fragmento del navegador y no se envía al servidor web del frontend.
- La pantalla central se conecta a un endpoint WebSocket independiente y de solo lectura.
- El Worker rechaza cualquier comando de juego enviado desde un display con `DISPLAY_READ_ONLY`.
- El display recibe el mismo snapshot público que los jugadores: lobby, jugadores, turno, pregunta únicamente tras revelar y recap.
- La pregunta permanece oculta en la pantalla central hasta que la persona del turno/host la revela.
- UI diseñada para verse a distancia en TV, computador o iPad, con opción local de pantalla completa.
- El smoke Cloudflare de Fase 6 valida sincronización del display y que no pueda modificar el juego.
- Worker de Fase 6 desplegado al 100% en Cloudflare: `9c88f418-9ce6-4092-9ff8-a43243f91650`.

## Seguridad del display

- El código de sala no basta para observar la partida.
- Se requiere un token aleatorio independiente.
- El token solo se entrega a quien actualmente sea host.
- Los query strings del Worker siguen redactados en observabilidad.
- El display no tiene `playerId`, no cuenta como jugador y no cambia presencia/listo al conectarse o desconectarse.
- Transferir el host no transfiere privilegios al display; el nuevo host puede solicitar el mismo enlace seguro.

## Gate actual

1. Pasar CI completo de Fase 6.
2. Verificar smoke Cloudflare de display read-only.
3. Pasar build + E2E móvil/display.
4. Fusionar a `main`.

## Próxima fase

Fase 7 — Recuerdos y reacciones:
- reacciones ligeras;
- “guardar este momento” con acción explícita;
- recap enriquecido;
- retención y consentimiento documentados.
