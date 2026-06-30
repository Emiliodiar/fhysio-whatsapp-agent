---
description: Entrena al agente con la información del negocio del usuario. Conversa una pregunta a la vez, genera prompts/negocio.md con las 6 secciones y reinicia el bot.
---

# /personaliza — Entrena tu agente

Recoges la información del negocio **conversando, UNA pregunta a la vez** (nunca
las 6 de golpe). Al final escribes `prompts/negocio.md` y reinicias el bot.

> La personalización va SIEMPRE por `prompts/negocio.md` (lo lee
> `system-prompt.ts`). **Nunca** modifiques `src/` para esto.

## Antes de empezar

- Si `prompts/negocio.md` **ya existe**, ofrece 3 opciones:
  1. Sobrescribir desde cero.
  2. Editar un punto concreto.
  3. Cancelar.

## Las 6 preguntas (una a una, en orden)

Guarda las respuestas con estas claves internas:

1. **`nombre`** — ¿Cómo se llama tu negocio?
2. **`actividad`** — ¿A qué se dedica? (una frase)
3. **`propuesta_valor`** — ¿Cuál es tu propuesta de valor? ¿Por qué te eligen?
4. **`preguntas_calificacion`** — ¿Qué preguntas debe hacer el agente para saber
   si un lead encaja? (necesitas **al menos 2**; si da menos, pide más)
5. **`criterios_lead`** — ¿Cómo es un lead BUENO y cómo es uno MALO?
6. **`accion_lead`** — Cuando un lead encaja, ¿qué hacemos?
   - Si elige **Cal.com / Calendly**: pídele el link y guárdalo en
     `CAL_BOOKING_URL` dentro de `.env.local`.
   - Otras opciones: link de pago, o derivar a un humano.

## Cierre

1. Muestra un **resumen** de las 6 respuestas y pide **confirmación** antes de
   escribir nada.
2. Escribe `prompts/negocio.md` con:
   - Frontmatter YAML: `nombre`, `actividad`, `generado:` (timestamp ISO).
   - `# Datos del negocio`
   - Las **6 secciones H2** (en este orden):
     - `## Nombre`
     - `## A qué se dedica`
     - `## Propuesta de valor`
     - `## Preguntas de calificación al lead`
     - `## Criterios de lead bueno vs malo`  (bloques `**BUENO**` y `**MALO**`)
     - `## Acción cuando el lead encaja`
3. **Valida** que el fichero contiene las 6 secciones.
4. **Reinicia el bot** para que el cambio surta efecto: escribe el flag
   `data/.restart` (lo vigila el bot) o reinicia `npm run start:all`.

Recuerda al usuario que cambiar el negocio más adelante es volver a ejecutar
`/personaliza`.
