# WhatsApp AI Agent Kit

Kit llave en mano para montar un **agente de IA conectado a WhatsApp con panel
web de control**. Pensado para dueños de negocio, freelancers y agencias que
quieren atender y captar clientes por WhatsApp **sin saber programar**: se monta
en una tarde abriendo la carpeta en VS Code con Claude Code y escribiendo 3
comandos.

> ¿Primera vez? Empieza por **[EMPIEZA-AQUI.md](EMPIEZA-AQUI.md)**.

---

## Qué hace

- Conecta un número de WhatsApp por **QR** (vía Baileys, WhatsApp Web no oficial).
- Recibe mensajes 1:1 y, en **Modo IA**, responde con un LLM (vía OpenRouter) que
  conoce tu negocio.
- **4 herramientas** del agente: guardar lead, calificar lead, agendar llamada,
  derivar a humano.
- **Panel web** (Next.js) tipo bandeja de entrada: lista de conversaciones +
  chat, toggle **Modo IA / Modo Humano** por conversación, envío manual y
  desconexión.
- **Despliegue 24/7** en un VPS (Hostinger + EasyPanel + Nixpacks, sin Docker
  manual), con el panel protegido por **Cloudflare Access**.

## Requisitos

- **Node.js 22** (mínimo 20.9) y npm.
- ~500 MB de disco.
- Una **API key de OpenRouter** (`sk-or-v1-...`).
- **Windows:** Git for Windows + Visual Studio Build Tools (C++) para
  `better-sqlite3`.
- Para el onboarding mágico: **Claude Code** (requiere Claude Pro, ~20 $/mes).
  Si no lo tienes, existe `npm run wizard` como alternativa por terminal.

## 3 pasos

1. Abre la carpeta en VS Code con **Claude Code**.
2. **`/setup`** — instala, valida la API key y conecta WhatsApp por QR.
3. **`/personaliza`** — entrena el agente con tu negocio.

Y cuando quieras producción: **`/deploy`**.

## Comandos

```
npm run dev         # panel Next.js en desarrollo
npm run build       # build de producción (necesario para start:all)
npm run start       # panel en producción
npm run start:bot   # solo el bot de WhatsApp
npm run start:all   # bot + panel a la vez (concurrently)
npm run wizard      # instalador por terminal (alternativa a /setup)
npm run check       # chequeo rápido del sistema
npm run doctor      # diagnóstico de errores conocidos
npm run typecheck   # comprobación de tipos
npm run clean       # borra .next, data y auth
```

## FAQ

**¿Necesito la API oficial de WhatsApp Business?** No. Esto usa WhatsApp Web (no
oficial) vía Baileys. Para uso comercial intensivo, valora la oficial. Ver
[docs/08](docs/08-whatsapp-coexistence.md).

**¿Dónde personalizo el agente?** En `prompts/negocio.md` (lo genera
`/personaliza`). Nunca se toca el código.

**¿Por qué no responde?** Prueba desde **otro** teléfono (ignora tus propios
mensajes), revisa el modo de la conversación y ejecuta `npm run doctor`. Ver
[docs/07](docs/07-errores-comunes.md).

**¿Qué modelo uso?** `openai/gpt-4o-mini` por defecto. **Nunca** modelos `:free`
(429 en producción).

**¿Es seguro el panel?** En local sí; en producción **protégelo con Cloudflare
Access** antes de meter datos reales. Ver [docs/05](docs/05-cloudflare-access.md).

## Estructura

```
.claude/        comandos (/setup, /personaliza, /deploy) + subagente + CLAUDE.md
docs/           guías paso a paso (01-08)
prompts/        persona del negocio (negocio.md) + ejemplos
scripts/        bot, wizard, check, doctor, env-loader
src/app/        panel Next.js + endpoints API
src/components/ UI del panel
src/lib/        db (SQLite), openrouter, system-prompt, baileys, tools
nixpacks.toml   build del deploy (Nixpacks)
```

Carpetas de runtime no versionadas: `auth/` (sesión WhatsApp) y `data/` (SQLite).

## Stack

Next 16 · React 19 · Tailwind v4 · TypeScript 5.7 · Baileys 6.7 ·
better-sqlite3 12 · OpenAI SDK (apuntado a OpenRouter) · pino · tsx ·
concurrently. Node 22. Deploy con Nixpacks + EasyPanel.

## Arquitectura en una frase

**Dos procesos** (bot + panel) que **no comparten memoria**: se coordinan solo a
través de SQLite (`data/messages.db`, tablas `connection_state` y `outbox`) y un
flag en disco (`data/.restart`). El panel encola; el bot envía.

## Cuánto cobrar (tarifas de mercado)

Diagnóstico **150-300 €** · Implementación **800-1.500 €** · Mantenimiento
**80-200 €/mes**.

## Comunidad

**La Tribu Divisual** — https://www.skool.com/la-tribu-divisual

## Licencia

Uso exclusivo para miembros de La Tribu Divisual. No redistribuir.
