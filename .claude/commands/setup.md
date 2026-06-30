---
description: Primera instalación del kit, llave en mano. Comprueba requisitos, instala dependencias, valida la API key de OpenRouter y conecta WhatsApp por QR. El usuario solo conversa y confirma.
---

# /setup — Instalación guiada

Ejecutas TÚ todo el proceso. El usuario no toca la terminal. Sigue las fases en
orden. Consulta `errores-sesion.md` ante cualquier fallo antes de improvisar.

## Fase A — Validación SILENCIOSA (no preguntes; solo interrumpe si algo falla)

- `node --version` → debe ser **>= 20** (recomendado 22). Si es menor, detente y
  guía a instalar Node LTS desde nodejs.org.
- `npm --version` → debe existir.
- Espacio en disco: **>= 500 MB** libres (`df -m .` en mac/linux; en Windows usa
  el equivalente / `fs.statfsSync` vía `npm run check`).
- Detecta el SO con `process.platform` para adaptar comandos.

> Atajo: puedes correr `npm run check` para cubrir Node, SO, npm, disco,
> estructura, `.env.local` y `node_modules` de una sola vez.

## Fase A.5 — Saludo (según estado)

- Si NO existe `data/messages.db`: trátalo como primera instalación.
- Si ya existe: confirma con el usuario si quiere reinstalar/continuar.

## Fase B — Instalación

1. `npm install`.
   - Si falla con `ERR_INVALID_ARG_TYPE`, `reify` o `rollback`: es
     `node_modules` **corrupto** (no las deps). Borra `node_modules` y reinstala
     (ver `errores-sesion #13`).
   - **Windows + better-sqlite3**: si la compilación nativa falla, instala
     **Visual Studio Build Tools** y ejecuta `npm rebuild better-sqlite3`.
2. **Valida**: `npm run typecheck` debe salir con exit code 0.
3. `npm run build` (OBLIGATORIO: `start:all` usa `next start` en modo
   producción; sin build, el panel no arranca).

## Fase C — OpenRouter (API key)

1. Pregunta si ya tiene cuenta en OpenRouter. Si no, guíale a
   https://openrouter.ai/keys (es gratis crear la key).
2. Pide la API key (formato `sk-or-v1-...`).
3. Crea o edita `.env.local` **conservando** las demás variables (no lo
   sobrescribas entero). Si no existe, parte de `.env.example`.
4. **VALIDA con una llamada de prueba** usando `validateApiKey()` (lista de
   modelos; no consume tokens de chat). Un **401** significa key inválida.
   **Nunca** des por buena la key sin validarla antes.
5. Recuerda: el modelo por defecto es `openai/gpt-4o-mini`. **Nunca** uses
   modelos `:free`.

## Fase D — Conexión de WhatsApp

1. Arranca `npm run start:all` en segundo plano.
2. Haz **polling** de la tabla `connection_state` (id=1) cada 3s, máximo 2 min,
   hasta `status='connected'` **y** `phone IS NOT NULL`.
3. Indica al usuario que abra `http://localhost:3000` para ver y escanear el QR
   (WhatsApp → Ajustes → Dispositivos vinculados → Vincular un dispositivo).
4. Si `start:all` falla, usa el fallback: `start:bot` + `dev` por separado.

## Fase E — Prueba

- Pide al usuario que escriba **"hola"** desde **OTRO** teléfono (los mensajes
  del propio número vinculado se ignoran a propósito).
- El kit soporta el formato `@lid` de WhatsApp 2025+; si el mensaje llega pero no
  hay respuesta, revisa `connection_state` y `errores-sesion.md`.

Cuando todo esté validado, felicítale y sugiere **`/personaliza`** para que el
agente hable de su negocio.
