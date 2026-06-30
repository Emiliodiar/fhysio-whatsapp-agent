# 08 · Coexistencia con WhatsApp

Este kit usa **Baileys**, que se conecta como un **dispositivo vinculado** de
WhatsApp Web (no es la API oficial de WhatsApp Business). Conviene entender qué
implica para convivir bien con tu cuenta.

## Cómo coexiste

- El agente aparece como un **dispositivo vinculado** más (igual que WhatsApp Web
  o WhatsApp Desktop). Tu teléfono sigue funcionando con normalidad.
- WhatsApp permite varios dispositivos vinculados a la vez; el agente ocupa uno.
- Tú puedes seguir usando el mismo número desde el móvil mientras el agente está
  conectado.

## Recomendaciones importantes

- **Usa un número dedicado** para el agente siempre que puedas. Reduce riesgos y
  separa lo automático de tu chat personal.
- **Empieza con poco volumen.** Subir de golpe a cientos de mensajes en una
  cuenta nueva puede activar restricciones de WhatsApp.
- **Tono humano y útil.** El agente está configurado para mensajes breves, sin
  spam y sin emojis; respeta eso para evitar reportes.
- **No envíes masivos no solicitados.** El kit está pensado para **responder** a
  quien escribe (1:1), no para difusión en frío.

## Qué ignora el agente (a propósito)

- **Mensajes propios** (`fromMe`): por eso se prueba desde otro móvil.
- **Grupos** (`@g.us`), **listas de difusión** (`@broadcast`) y **canales**
  (`@newsletter`).
- **Mensajes sin texto**: audios, imágenes, stickers (solo procesa texto:
  `conversation` y `extendedTextMessage`).

## El formato `@lid` (2025-2026)

WhatsApp está desplegando un nuevo identificador, `@lid`, además del clásico
`@s.whatsapp.net`. El kit **acepta ambos**, guarda el `jid` completo de cada
conversación y responde por el dominio correcto. Si en algún momento "llegan
mensajes pero no hay respuesta", suele ser este tema (ver `errores-sesion.md #5`).

## Riesgo y responsabilidad

Baileys es **no oficial**. WhatsApp puede cambiar su protocolo o aplicar
restricciones. Para uso comercial intensivo y máxima estabilidad, valora la API
oficial de WhatsApp Business. Usa este kit de forma responsable y conforme a los
términos de WhatsApp.

## Multi-dispositivo y reconexión

- Si vinculas/desvinculas dispositivos desde el móvil, el agente puede recibir un
  cierre con code **440** (connectionReplaced); el kit reconecta solo con
  backoff.
- Si **cierras la sesión** del agente desde el móvil (code 401), el bot deja de
  reconectar y hay que volver a escanear el QR.
