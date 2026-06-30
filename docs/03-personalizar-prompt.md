# 03 · Personalizar el agente

El agente habla de **tu** negocio gracias al fichero `prompts/negocio.md`. No se
toca el código: toda la personalización vive en ese fichero, que se inyecta en
el system prompt (`src/lib/system-prompt.ts`).

## La forma fácil: `/personaliza`

En Claude Code, escribe **`/personaliza`**. Te hará 6 preguntas, **una a una**:

1. Nombre del negocio.
2. A qué se dedica (una frase).
3. Propuesta de valor.
4. Preguntas de calificación al lead (al menos 2).
5. Criterios de lead bueno vs malo.
6. Acción cuando el lead encaja (Cal.com, link de pago o derivar a humano).

Al terminar, genera `prompts/negocio.md` con las 6 secciones y **reinicia el
bot** automáticamente.

## La forma manual

1. Copia `prompts/negocio.example.md` (o un ejemplo de `prompts/ejemplos/`) a
   `prompts/negocio.md`.
2. Edita las 6 secciones con tus datos reales.
3. **Reinicia el bot** (importante, ver abajo).

## Las 6 secciones obligatorias

`negocio.md` lleva frontmatter (`nombre`, `actividad`, `generado`) y estas H2:

- `## Nombre`
- `## A qué se dedica`
- `## Propuesta de valor`
- `## Preguntas de calificación al lead`
- `## Criterios de lead bueno vs malo` (con bloques `**BUENO**` y `**MALO**`)
- `## Acción cuando el lead encaja`

## Importante: reiniciar tras cambios

El bot lee `negocio.md` en cada respuesta, **pero** el proceso ya en marcha tiene
su lógica cargada. Para que un cambio en `negocio.md` surta efecto, **reinicia el
bot** (`/personaliza` lo hace solo; manualmente, reinicia `npm run start:all` o
escribe el flag `data/.restart`).

## Sin `negocio.md`

Si no existe, el agente usa un prompt **genérico cordial** de respaldo: atiende y
pide datos del lead, pero sin conocer tu negocio.

> Siguiente paso: [04 · Configurar las tools](04-configurar-tools.md).
