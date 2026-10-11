# Cultura familiar — banco de trivia, pendiente de personalización

Hay 30 preguntas genéricas en `src/lib/family-trivia.ts`, repartidas entre generaciones, origen, tradiciones, recuerdos y curiosidades. Por ejemplo: «¿Cuántos nietos tienen los abuelos?».

**Importante:** el proyecto NO tiene un chat exportado ni un árbol familiar verificado. Ninguna respuesta, nombre privado, cifra de nietos o historia personal se inventa. Las preguntas están formuladas como plantillas verificables por los jugadores, no como hechos confirmados.

## Propuesta de siguiente integración

1. Si la familia lo desea, proporcionar voluntariamente un resumen o exportación limitada del chat, revisada para retirar teléfonos, direcciones, datos médicos y otros datos innecesarios.
2. Confirmar con un familiar las respuestas factuales (números de nietos, vínculos, orígenes, anécdotas).
3. No subir el chat, respuestas familiares identificables ni información sensible al repositorio. Guardar cualquier banco familiar como dato privado y opcional del anfitrión, con borrado al terminar la sala.
4. En la partida, mostrar pregunta y opción de respuesta oral, con «Pasar»; el anfitrión puede validar la respuesta sin que el sistema afirme conocerla.
5. No puntuar preguntas que admitan múltiples interpretaciones o puedan incomodar a los participantes.

Estas preguntas genéricas están en el código como **biblioteca editorial**. Aún no están disponibles dentro de la partida en producción; conectarlas a una ronda de trivia familiar requiere una integración adicional del motor y la interfaz.
