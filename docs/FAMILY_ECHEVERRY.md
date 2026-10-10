# Edición Familia Echeverry

## Propósito

Una opción diferenciada al crear una sala: **Familia Echeverry**.

Se diseñó a partir de tendencias generales identificadas en el archivo de conversación aportado por quien solicitó la función y de la lista de miembros mostrada en capturas. Se observaron temas recurrentes de felicitaciones, cumpleaños, bendiciones, reuniones, fotografías, stickers, comidas, viajes, bromas cariñosas y recuerdos.

Las preguntas son **creaciones originales, inspiradas en temas generales**. No se copiaron textos literales del chat, identificadores, fotos, contactos, relaciones privadas ni números telefónicos. Tampoco se atribuyen comportamientos o anécdotas privadas a miembros concretos.

**El archivo de WhatsApp no se ha subido a GitHub, Cloudflare ni incluido como recurso de la aplicación.** Como este repositorio es público, el catálogo escrito es visible para quien examine su código. Por ello se optó por preguntas no identificables y cuidadosas.

## Cómo se juega

- Al crear una sala, el anfitrión elige «Juego para todos» o «Familia Echeverry».
- La elección se fija para esa sala y todos los invitados la heredan al unirse con el QR/código.
- El modo personalizado utiliza su propio mazo y filtros de edad/intensidad.
- El modo general conserva su mazo y mecánicas actuales.
- No se muestra el tamaño total de las preguntas en la interfaz del modo familiar.
- El juego conserva las rondas especiales, votaciones, reacciones, pantalla central y revancha.
- El modo familiar permite reuniones grandes de hasta 40 personas. El modo general mantiene su límite previo.

## Contenido y seguridad

El catálogo está organizado para explorar chismes ligeros, primeros amores, primeras veces, la vida del grupo y encuentros familiares, sin cuestionarios invasivos.

- El juego no fuerza a nadie a responder y permite cambiar una pregunta.
- Las preguntas más personales requieren una mayor edad/intensidad en los filtros.
- El servidor valida que la pregunta solicitada pertenezca al mazo del modo y respete los filtros.
- Una sala familiar no puede iniciar el mazo general ni viceversa.
- Ninguna pregunta declara que una persona concreta tuvo pareja, consumió alcohol, habló de terceros u ocultó un secreto.

## Implementación

- `src/lib/family-echeverry.ts`: catálogo editorial y selección de preguntas elegibles.
- `worker/src/family-rules.mjs`: metadatos de elegibilidad para validación server-side.
- `mode` de sala: `standard` o `echeverry`.
- `echeverry-v1`: versión independiente del mazo personalizado.
- `scripts/family-echeverry-smoke.mjs`: creación/unión/seguridad de mazos e integración contra Cloudflare.
- Pruebas Playwright móviles verifican que el lobby no muestre el número total.

## Revisión humana recomendada

Antes de invitar a todo el grupo, revisar con una persona de confianza de la familia que el tono resulte divertido y respetuoso. Especialmente para preguntas de relaciones personales y primeros amores, mantener disponible «pasar» sin comentarios ni presiones.
