# 01 · Instalar el kit

Tienes dos caminos. El recomendado usa Claude Code (conversas y confirmas); el
otro es un asistente de terminal por si no tienes Claude Code.

## Requisitos

- **Node.js 22** (mínimo 20.9). Descárgalo en https://nodejs.org (versión LTS).
- **npm** (viene con Node).
- ~500 MB de espacio libre.
- **Windows:** Git for Windows (Claude Code necesita un shell Bash) y, para
  compilar `better-sqlite3`, Visual Studio Build Tools (workload C++).

## Camino A — con Claude Code (recomendado)

1. Abre la carpeta del kit en VS Code con la extensión de Claude Code.
2. Escribe **`/setup`** y sigue la conversación.
3. Claude comprueba requisitos, instala todo, valida tu API key de OpenRouter y
   te conecta WhatsApp por QR.

No tocas la terminal en ningún momento.

## Camino B — sin Claude Code (asistente CLI)

```
npm install
npm run wizard
```

El `wizard` te pide la API key, configura `.env.local` y arranca el kit.

## Comprobar que todo está bien

```
npm run check     # 7 chequeos rápidos del sistema
npm run typecheck # el proyecto compila sin errores de tipos
npm run doctor    # diagnóstico de los errores conocidos
```

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena al menos `OPENROUTER_API_KEY`.
Ver detalle en el README y en `.env.example` (comentarios incluidos).

> Siguiente paso: [02 · Conectar WhatsApp](02-conectar-whatsapp.md).
