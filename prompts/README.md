# prompts/ — La persona del agente

Aquí vive la "personalidad" y el conocimiento de negocio de tu agente.

## Cómo funciona

- El agente lee `prompts/negocio.md` en cada respuesta (vía `system-prompt.ts`).
- Ese contenido se **inyecta** dentro del system prompt, junto a las reglas
  fijas de comunicación y de uso de tools.
- Si `negocio.md` **no existe**, el agente usa un prompt genérico de respaldo.

> Importante: `negocio.md` está en `.gitignore` (es tuyo, no se sube al repo).
> La plantilla `negocio.example.md` sí se versiona.

## Tres formas de crear/cambiar `negocio.md`

1. **Recomendado:** ejecuta **`/personaliza`** y responde las 6 preguntas. Claude
   genera el fichero por ti y reinicia el bot.
2. **Manual:** copia `negocio.example.md` a `negocio.md` y edítalo.
3. **Desde un ejemplo:** copia uno de `prompts/ejemplos/` a `negocio.md` y
   adáptalo.

## Las 6 secciones obligatorias

`negocio.md` debe tener frontmatter (`nombre`, `actividad`, `generado`) y estas
6 secciones H2:

1. `## Nombre`
2. `## A qué se dedica`
3. `## Propuesta de valor`
4. `## Preguntas de calificación al lead`
5. `## Criterios de lead bueno vs malo`
6. `## Acción cuando el lead encaja`

## Ejemplos incluidos

- `ejemplos/agencia-ia.md` — agencia de IA que califica leads.
- `ejemplos/ecommerce.md` — tienda online de licencias de software.
- `ejemplos/infoproducto.md` — vendedor de un curso online.

## Recuerda

Cambiar `negocio.md` **requiere reiniciar el bot** para que el cambio surta
efecto (el proceso ya arrancado tiene el handler en memoria). `/personaliza` lo
reinicia automáticamente.
