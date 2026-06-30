# 02 · Conectar WhatsApp

El kit se conecta a WhatsApp por **QR**, como WhatsApp Web (vía Baileys, no
oficial). Usa un número que puedas dedicar al agente.

## Pasos

1. Arranca el kit:
   ```
   npm run start:all
   ```
   Esto levanta los dos procesos: el **bot** (WhatsApp) y el **panel** (web).
2. Abre **http://localhost:3000**. Verás la pantalla "Conectar WhatsApp" con un QR.
3. En tu teléfono: **WhatsApp → Ajustes → Dispositivos vinculados → Vincular un
   dispositivo** y escanea el QR.
4. Cuando conecta, el panel pasa solo a la **bandeja de entrada**.

## Probar que funciona

Escribe **"hola"** al número conectado **desde OTRO teléfono**.

> Los mensajes que te envías a ti mismo (tu número vinculado) se **ignoran a
> propósito**. Prueba siempre desde otro móvil.

Deberías ver la conversación aparecer en el panel y, en Modo IA, una respuesta
automática.

## Si el QR caduca

Si pasan más de ~60 segundos sin escanear, recarga la página para generar uno
nuevo.

## Desconectar / cambiar de número

Botón **Desconectar** (arriba a la derecha del panel). Borra la sesión y vuelve
a mostrar el QR para vincular otro número.

## Si conecta pero no responde

Probablemente sea el formato `@lid` o el modo de la conversación. Ejecuta
`npm run doctor` y revisa [07 · Errores comunes](07-errores-comunes.md) y
`errores-sesion.md` (#5).

> Siguiente paso: [03 · Personalizar el prompt](03-personalizar-prompt.md).
