# errores-sesion.md — Errores conocidos y sus soluciones

Bitácora de los errores que costaron tiempo durante la construcción del kit, con
su **causa real** y la **solución que ya está aplicada** en el código. Consulta
este fichero ANTES de improvisar una solución (regla de `CLAUDE.md`).

> Muchas de estas correcciones ya están en el código. Si reaparece una, lo
> primero es comprobar que no se ha revertido la mitigación.

---

## #1 — Code 405: "Connection Failure" al conectar

**Síntoma:** el socket se cierra al instante con `statusCode 405` y nunca sale el QR.
**Causa:** WhatsApp rechaza versiones antiguas de WhatsApp Web.
**Solución (aplicada):** llamar SIEMPRE a `fetchLatestBaileysVersion()` y pasar
`version` a `makeWASocket`. Está en `src/lib/baileys/client.ts`.

## #2 — Code 440: bucle de reconexión justo tras escanear

**Síntoma:** escaneas el QR, conecta, y a los segundos se desconecta con `440`
(connectionReplaced) en bucle.
**Causa 1:** un `browser` fingerprint custom/desconocido.
**Causa 2:** reconectar demasiado rápido tras el pairing.
**Solución (aplicada):** `browser: Browsers.macOS('Desktop')` (fingerprint
conocido) + backoff de **15s** específico para el code 440 en `scheduleReconnect`.

## #3 — Code 515: parece un error pero NO lo es

**Síntoma:** ves `statusCode 515` en el cierre justo después de vincular.
**Causa:** es la **señal de pairing OK**; Baileys reconecta solo.
**Solución:** **ignorarlo**. No tocar la DB ni tratarlo como fallo. El código no
degrada el estado para códigos distintos de 401.

## #4 — Code 401 (loggedOut): no debe reconectar

**Síntoma:** tras cerrar sesión desde el móvil, el bot intenta reconectar en vano.
**Causa:** `DisconnectReason.loggedOut` (401) significa sesión cerrada de verdad.
**Solución (aplicada):** en `close`, si el code es `loggedOut`, marcar
`disconnected` y NO reconectar. Para los demás códigos, reconectar sin tocar la DB.

## #5 — El bot conecta pero NO responde a los mensajes

**Síntoma:** WhatsApp aparece conectado, escribes y no contesta.
**Causa:** WhatsApp despliega el formato **`@lid`** (2025-2026) en algunos chats,
además de `@s.whatsapp.net`. Si el handler solo acepta `@s.whatsapp.net`, ignora
esos mensajes **en silencio**.
**Solución (aplicada):** el handler acepta `@s.whatsapp.net` **y** `@lid`. Para
responder por el dominio correcto se guarda el `jid` completo en la conversación
y el outbox usa `convo.jid`.
**Comprobación:** ¿llegan filas a `messages` con `role='user'`? Si sí pero no hay
respuesta, mira el modo (¿HUMAN?) y la API key.

## #6 — `database is locked` (SQLITE_BUSY) durante `next build`

**Síntoma:** el build falla intermitentemente en "Collecting page data".
**Causa:** `next build` lanza ~10 workers que importan las rutas API. Si `db.ts`
abre/escribe la DB (WAL) **al importarse**, varios workers chocan.
**Solución (aplicada):** **inicialización PEREZOSA** en `db.ts`: importar no abre
nada; la conexión y el esquema se crean en la primera llamada real vía
`ctx()`/`build()`. No revertir esto.

## #7 — Mensajes propios provocan eco / no llegan los de prueba

**Síntoma:** pruebas escribiéndote a ti mismo y no pasa nada (o se lía).
**Causa:** los mensajes con `key.fromMe` se ignoran a propósito.
**Solución:** **probar siempre desde OTRO teléfono.** Documentado en `/setup`.

## #8 — `printQRInTerminal` deprecated

**Síntoma:** warning o comportamiento raro con el QR en Baileys 6.7+.
**Causa:** `printQRInTerminal` está deprecado.
**Solución (aplicada):** NO se usa esa opción; el QR se maneja a mano con
`qrcode-terminal` (terminal) y con `qrcode` → dataURL (panel web).

## #9 — Windows: falla la compilación de `better-sqlite3`

**Síntoma:** `npm install` revienta compilando `better-sqlite3` (node-gyp).
**Causa:** es un módulo **nativo**; en Windows necesita compilador C++.
**Solución:** instalar **Visual Studio Build Tools** (workload "Desktop
development with C++") y luego `npm rebuild better-sqlite3`. Versión real del
paquete: **12.x**.

## #10 — Modelos `:free` dan 429 en producción

**Síntoma:** funciona en pruebas y luego empieza a fallar con `429 Too Many
Requests`.
**Causa:** los modelos terminados en `:free` de OpenRouter están saturados.
**Solución:** **nunca** usar `:free`. Default `openai/gpt-4o-mini`. El `doctor`
avisa si detecta un modelo `:free`.

## #11 — La API key no se carga (variables vacías al arrancar el bot)

**Síntoma:** "Falta OPENROUTER_API_KEY" aunque está en `.env.local`.
**Causa:** `client.ts`/`openrouter.ts` leen `process.env` en top-level; si
`.env.local` no se cargó **antes** de esos imports (hoisting de ES modules), las
vars están vacías.
**Solución (aplicada):** `import "./env-loader"` debe ser el **PRIMER** import de
`start-bot.ts`, `wizard.ts` y `doctor.ts`.

## #12 — El QR no aparece en el panel en máquinas rápidas

**Síntoma:** en equipos rápidos, el panel no llega a mostrar el QR.
**Causa:** race condition: el socket pasa a `connecting` antes de que el cliente
recoja el `qr_string`.
**Solución (aplicada):** el endpoint `/api/connection/status` devuelve el QR
también cuando `status==='connecting'` (no solo en `'qr'`). No quitar esa
condición.

## #13 — `npm install` falla con `ERR_INVALID_ARG_TYPE` / `reify` / `rollback`

**Síntoma:** la instalación revienta con uno de estos errores internos de npm.
**Causa:** **`node_modules` corrupto** (instalación a medias, corte de red,
etc.). **No** es un problema de las dependencias del `package.json`.
**Solución:** borrar `node_modules` (y opcionalmente `package-lock.json`) y
reinstalar con `npm install`. NO empezar a "arreglar" versiones.

## #14 — Tras redeploy, vuelve a pedir el QR

**Síntoma:** cada vez que despliegas en el VPS, hay que re-escanear el QR.
**Causa:** la carpeta `auth/` no es persistente entre redeploys.
**Solución:** montar **volúmenes persistentes** en EasyPanel para `/app/auth`
(sesión) y `/app/data` (SQLite) **antes** del primer Deploy. Causa #1 de
problemas en producción.

## #15 — `*.tsbuildinfo` subido a git rompe el build de Nixpacks

**Síntoma:** el build en el servidor falla de forma rara tras un push.
**Causa:** se subió la caché de compilación incremental (`*.tsbuildinfo`).
**Solución:** está en `.gitignore`. No forzar su subida.

---

### Mapa rápido para el `doctor`

Los 10 errores que `npm run doctor` cubre en sus 5 bloques: configuración
(#10, #11), deps + typecheck (#9, #13), estado de conexión (#1, #2, #3, #4, #5),
sesión + persona (#14), y procesos zombie en Windows.
