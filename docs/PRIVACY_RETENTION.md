# Privacidad, recuerdos y retención

## Principio de Fase 7

JuegoFamiliaEch ayuda a conversar; no debe convertirse silenciosamente en un sistema de grabación.

En la Fase 7, “Guardar este momento” **no captura la respuesta de nadie**. Guarda únicamente metadatos mínimos de la ronda:

- número de turno;
- jugador que tenía el turno;
- índice de la pregunta;
- cantidad de personas que marcaron ese momento para recordar.

Las reacciones ligeras guardan únicamente una reacción por jugador y turno mientras la sala exista.

## Retención actual

Las salas del MVP expiran automáticamente a las **12 horas desde su creación** mediante la alarma del Durable Object.

Al expirar la sala se elimina el estado completo del Durable Object, incluyendo:

- nombres de jugadores;
- tokens de sesión;
- estados listo/conectado;
- preguntas utilizadas;
- reacciones;
- momentos guardados;
- recap;
- token de pantalla central.

No existe en esta fase:

- cuenta de usuario;
- historial permanente;
- biblioteca personal;
- exportación automática;
- almacenamiento de respuestas;
- audio;
- fotos;
- video.

## “Guardar este momento”

La acción es explícita y reversible durante el turno. No se interpreta una reacción como consentimiento para guardar.

El recap puede mostrar la pregunta, el turno y cuántas personas quisieron recordarlo. No reconstruye ni almacena lo que la persona respondió.

## Captura multimedia futura

Cualquier función futura que capture audio, foto o video debe permanecer **desactivada por defecto** y requerir consentimiento específico antes de iniciar la captura.

Como mínimo deberá cumplir:

1. explicar qué se va a capturar y para qué;
2. pedir una acción afirmativa separada de “unirse a la sala”;
3. mostrar un indicador visible mientras exista captura;
4. permitir detener la captura;
5. definir quién puede acceder al archivo;
6. definir una retención y eliminación explícitas;
7. no reutilizar material para entrenamiento, publicidad o perfiles sin un consentimiento adicional y separado.

Para una grabación grupal, el anfitrión por sí solo no debe poder dar consentimiento en nombre de otros participantes identificables.

## Analítica

Las métricas futuras de producto deberán separar telemetría operacional de contenido de conversación. No se deben enviar preguntas respondidas, recuerdos privados ni textos libres de los jugadores a analítica por defecto.

## Cambios de política

Si una fase futura añade persistencia permanente, cuentas o multimedia, este documento debe actualizarse antes del despliegue de esa función.


## Datos antiabuso de Fase 9

Para limitar creación de salas, intentos de unión y reconexiones abusivas, el Worker deriva un identificador SHA-256 a partir de la dirección de red proporcionada por Cloudflare. La IP en texto claro no se escribe en el almacenamiento de la aplicación.

El Durable Object de rate limiting:

- solo guarda contadores de ventana y timestamps;
- no se relaciona con nombres, preguntas, recuerdos ni respuestas;
- se elimina tras 20 minutos de inactividad;
- existe exclusivamente para seguridad y disponibilidad.

Este identificador no debe reutilizarse para analítica, publicidad, perfilado o seguimiento entre productos.


## Analítica mínima de Fase 10

La beta utiliza Workers Analytics Engine para métricas agregadas del producto.

El servidor puede registrar eventos como creación de sala, unión, inicio y finalización de partida junto con conteos numéricos agregados. No se incluyen nombres, códigos de sala, IDs de jugador, tokens ni respuestas.

Para errores del navegador solo se permite registrar una categoría general de error y una superficie genérica de la aplicación. No se transmiten mensajes de error, stack traces ni la URL completa de una sala.

La instalación PWA puede registrarse como un evento agregado.

Estas métricas se usan para entender activación, finalización y estabilidad técnica, no para publicidad ni perfilado de personas.
