# Fase 12 — Experiencia premium

Objetivo: reducir la fricción para familias nuevas, enriquecer las revelaciones y permitir repetir una partida sin reiniciar la sala. Esta fase no añade cuentas, monetización ni contenido nuevo: la expansión editorial corresponde a la Fase 13.

## Funciones implementadas

### Tutorial interactivo en 30 segundos
En `/online`, se muestran tres pasos breves para visitantes nuevos: crear/unirse, preparar/revelar y conversar/repetir. Puede saltarse en cualquier momento, se recuerda localmente y se puede volver a abrir. No tapa los formularios para crear salas.

### Votaciones accesibles y revelación premium
Las dos modalidades con voto aceptan `Prefiero pasar` y cuentan esa elección sin tratarla como ganadora. Las votaciones siguen siendo secretas hasta que el host las revela. Los resultados distinguen:
- una opción ganadora;
- empate entre las opciones más votadas;
- resultado vacío o todos prefirieron pasar.

Las barras y paneles tienen entrada animada discreta, con `prefers-reduced-motion` respetado.

### Segunda partida sin crear otra sala
Después del resumen, el anfitrión puede pulsar `Jugar otra ronda en esta sala`. Cloudflare:
- verifica host y que el estado sea `finished`;
- devuelve a todos al lobby con el mismo código y participantes;
- conserva las preferencias de configuración;
- marca a todos como no listos;
- borra el estado efímero de la ronda anterior (votos, turnos, reacciones, recuerdos y resumen);
- espera a que todo el grupo confirme para volver a empezar.

El display central sigue conectado con sus permisos de solo lectura. Los eventos obsoletos no pueden reiniciar una sala que no haya terminado.

### Recuperación de estado personal
En conexión y en `sync`, el servidor envía `private-state` únicamente al WebSocket autenticado de ese jugador. Recupera su reacción, marcador de recuerdo, voto privado y participación en el recuerdo en cadena. La pantalla central y los snapshots compartidos no reciben estos datos individualizados.

### Usabilidad
El anfitrión debe confirmar explícitamente el cierre de una partida. El tutorial no impide crear/unirse a salas y las acciones táctiles mantienen tamaños adecuados.

## Pruebas y criterios

- Unit tests de victoria única, empates, abstenciones y ausencia de votos.
- Integración contra Durable Objects: seguridad de `play-again`, preservación de sala y participantes, ronda nueva, abstenciones, recuperación privada de votos y display sin permisos.
- Playwright iPhone/WebKit y Android/Chromium: tutorial completo, recuerdo de preferencias y reducir movimiento.
- Compilación y tests previos en GitHub Actions.
- Despliegue backend en Cloudflare y publicación frontend desde `main`.
- Pruebas físicas con dos teléfonos reales todavía quedan en la validación de beta, no se inventan.

La ampliación de cartas, niveles de edad de cada carta especial, más géneros y packs pasa a **Fase 13**.
