# 04 · Configurar las tools del agente

El agente tiene **4 herramientas** que puede usar durante una conversación. Dos
funcionan siempre; otras dos necesitan que configures una variable de entorno.

| Tool | Qué hace | Necesita |
|---|---|---|
| `guardarLead` | Guarda el lead en Google Sheets | `GOOGLE_SHEETS_WEBHOOK_URL` |
| `calificar` | Puntúa al lead 0-10 y decide si encaja (umbral 7) | nada |
| `agendar` | Genera el link de Cal.com/Calendly con datos prerellenados | `CAL_BOOKING_URL` |
| `derivarHumano` | Pasa la conversación a Modo Humano | nada |

> Si falta su variable, `guardarLead` y `agendar` **no fallan**: devuelven
> "Tool no configurada…" y el modelo lo entiende y sigue. No bloquean al agente.

## `guardarLead` → Google Sheets

1. Crea una Google Sheet.
2. Extensiones → Apps Script. Pega un script que reciba un `POST` con JSON
   (`nombre`, `telefono`, `negocio`, `facturacion`, `dolor`, `fecha`) y añada una
   fila.
3. Publica como **App web** (acceso "cualquiera") y copia la URL.
4. Ponla en `.env.local`:
   ```
   GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/XXXX/exec
   ```

## `agendar` → Cal.com / Calendly

1. Crea un tipo de evento (p. ej. "Diagnóstico 20 min").
2. Copia su URL pública.
3. Ponla en `.env.local`:
   ```
   CAL_BOOKING_URL=https://cal.com/tu-usuario/diagnostico
   ```
   El agente añadirá `?name=...&email=...` automáticamente.

> `/personaliza` escribe `CAL_BOOKING_URL` por ti si en la pregunta 6 eliges
> Cal.com.

## `calificar` (umbral 7)

Pesos por defecto (pensados para agencia/freelance, ajustables en
`src/lib/tools/calificar.ts`):

- Tiene negocio activo: **+3**
- Factura > 5k/mes: **+3**
- El dolor encaja: **+2**
- Urgencia alta: **+1**
- Presupuesto confirmado: **+1**

Si el score es **≥ 7**, el lead califica y el agente puede `agendar`. Si es
menor, responde cordial pero **no** agenda.

## `derivarHumano`

La IA la usa sola cuando el lead pide **precios específicos**, plantea un caso
raro, presenta una **queja** o pide algo fuera de alcance. Cambia la conversación
a **Modo Humano**; a partir de ahí respondes tú desde el panel.

> Tras cambiar variables en `.env.local`, **reinicia el bot**.

> Siguiente paso: [05 · Cloudflare Access](05-cloudflare-access.md).
