# Fase 11 — Rondas especiales

## Mecánicas implementadas

La experiencia tradicional de preguntas sigue siendo el modo base. El anfitrión puede activar/desactivar cada sorpresa desde el lobby. Los cambios en la configuración devuelven a los participantes a «No listo», igual que los filtros del mazo.

Rondas disponibles:

1. **¿Quién es más probable que…?** Cada jugador vota por una persona de la sala. No se ven votos individuales ni resultados hasta que el anfitrión los revela.
2. **Todos responden.** Elección A/B desde cada celular, con resultados agregados y animados tras la revelación.
3. **Reto sorpresa.** Una consigna breve y cronómetro orientativo. Participar es voluntario y se puede pasar sin dar explicaciones.
4. **Recuerdo en cadena.** El grupo reconstruye una historia en voz alta; cada persona puede marcar «Ya participé». No se guarda lo dicho.
5. **Carta dorada.** Consigna especial de agradecimiento o reconocimiento, completamente opcional.

Se incluyen **20 cartas originales** (cuatro por modo).

## Frecuencia, controles y ritmo

- Nuevo lobby: sorpresas automáticas **cada tres turnos** por defecto, o modo manual.
- El anfitrión puede desmarcar cualquier tipo; si no quedan tipos activos, no se insertan sorpresas.
- Las sorpresas automáticas rotan entre los modos habilitados y se activan al iniciar el turno correspondiente.
- El anfitrión también puede lanzar una sorpresa manual cuando la pregunta normal todavía no se ha revelado.
- Durante una sorpresa, el anfitrión o la persona del turno puede avanzar. El reto nunca bloquea la partida por tiempo.
- El cronómetro es **orientativo**, sin penalizaciones ni saltos automáticos.
- No se gastan preguntas no reveladas cuando una sorpresa reemplaza temporalmente el turno.
- El resumen final indica cuántas rondas especiales ocurrieron.

## Seguridad, privacidad y sincronización

- El Worker es la autoridad para el turno, la selección y la validación de votos.
- Solo el host puede lanzar manualmente una ronda o revelar una votación.
- Cada persona autenticada puede emitir un voto o cambiarlo hasta que se revelen los resultados.
- Antes de revelar, el snapshot solo informa el total de personas que votaron; la distribución de opciones permanece oculta también en el display.
- El display es estrictamente **solo lectura**, sin IDs ni credenciales de jugadores.
- En «Recuerdo en cadena», el servidor solo almacena IDs efímeros de personas que marcaron que participaron; nunca el texto de la historia.
- Votos, rondas e historial forman parte del Durable Object efímero y desaparecen con la sala a las 12 horas.
- Nadie tiene obligación de responder un reto, completar el temporizador ni aportar una historia.

## Animaciones

Cada modo tiene tratamiento cromático propio, transiciones al entrar, barras de resultados y pequeños destellos. Todo movimiento se desactiva cuando `prefers-reduced-motion: reduce` está activo.

## Validación

- Unit tests: catálogo y tipado de las 20 cartas.
- Typecheck y compilación Next.js/OpenNext.
- Sintaxis del Worker y del service worker.
- Smoke realtime existente.
- Smoke independiente: host vs invitado, display read-only, votos ocultos, revelación, cambios de turno, modo automático, participación en cadena, carta dorada y reto.
- E2E WebKit/iPhone y Chromium/Android.

Los resultados de las pruebas automatizadas no sustituyen la beta presencial con teléfonos reales.
