# Guía completa — de cero a producción

Recorrido completo del kit en **4 fases**: instalar, entrenar, desplegar y
mantener. Si usas Claude Code, los comandos `/setup`, `/personaliza` y `/deploy`
hacen el trabajo por ti; aquí tienes el detalle y el "por qué".

---

## Fase 1 — Instalar y conectar

**Objetivo:** tener el agente respondiendo en tu WhatsApp, en tu ordenador.

1. **Requisitos:** Node 22 (mín. 20.9), npm, ~500 MB libres. Windows: Git for
   Windows + Visual Studio Build Tools (C++).
2. **Instalación:** abre la carpeta en VS Code con Claude Code y escribe
   `/setup`. (Sin Claude Code: `npm install` y `npm run wizard`.)
3. **API key:** crea una en https://openrouter.ai/keys (`sk-or-v1-...`) y
   ponla en `.env.local`. Modelo recomendado: `openai/gpt-4o-mini`.
   **Nunca uses modelos `:free`** (dan 429 en producción).
4. **Conectar WhatsApp:** `npm run start:all`, abre `http://localhost:3000` y
   escanea el QR (WhatsApp → Dispositivos vinculados).
5. **Probar:** escribe "hola" **desde otro teléfono**.

Detalle: [docs/01](docs/01-instalar.md) y [docs/02](docs/02-conectar-whatsapp.md).

---

## Fase 2 — Entrenar el agente

**Objetivo:** que el agente hable de tu negocio y filtre leads como tú quieres.

1. **`/personaliza`** (o edita `prompts/negocio.md` a mano). Responde 6 cosas:
   nombre, a qué te dedicas, propuesta de valor, preguntas de calificación,
   criterios de lead bueno/malo y qué hacer cuando encaja.
2. **Tools:** configura las opcionales si las quieres:
   - `GOOGLE_SHEETS_WEBHOOK_URL` → guarda leads en una hoja.
   - `CAL_BOOKING_URL` → el agente manda link de agenda.
   (`calificar` y `derivarHumano` funcionan sin configurar nada.)
3. **Reinicia el bot** tras cualquier cambio en `negocio.md` o `.env.local`.

El agente: responde en 2-4 líneas, sin emojis, una pregunta a la vez; usa
`calificar` (umbral **7/10**), y solo agenda si el lead califica; deriva a humano
ante precios concretos, quejas o casos raros.

Detalle: [docs/03](docs/03-personalizar-prompt.md) y
[docs/04](docs/04-configurar-tools.md).

---

## Fase 3 — Desplegar 24/7

**Objetivo:** que funcione siempre, sin tu ordenador encendido.

1. **GitHub privado:** sube el código. Verifica con `git status --short` que NO
   se suben `.env.local`, `data/` ni `auth/`.
2. **VPS Hostinger + EasyPanel:** Ubuntu 24.04 + Docker (KVM 2 recomendado).
   Instala EasyPanel y crea una **App** con **Nixpacks**.
3. **Volúmenes (CRÍTICO):** monta `/app/data` y `/app/auth` **antes** de Deploy,
   o re-escanearás el QR en cada redeploy.
4. **Variables:** añade `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` y opcionales.
5. **Deploy** (3-5 min) y escanea el QR.
6. **Cloudflare Access (BLOQUEANTE):** protege el panel antes de meter
   conversaciones reales. Pruébalo en incógnito con un email no autorizado.

Detalle: [docs/05](docs/05-cloudflare-access.md) y
[docs/06](docs/06-deploy-hostinger.md).

---

## Fase 4 — Mantenimiento

**Objetivo:** que siga sano y mejore con el tiempo.

- **Diagnóstico:** `npm run doctor` (errores conocidos) y `npm run check`
  (sistema). Estado de conexión visible en el panel.
- **Actualizar el agente:** vuelve a `/personaliza` cuando cambie tu oferta.
- **Redeploy:** cada `git push` a `main` redespliega solo.
- **Conversaciones:** desde el panel cambias Modo IA/Humano por conversación,
  respondes a mano y borras conversaciones.
- **Errores:** consulta `errores-sesion.md` y [docs/07](docs/07-errores-comunes.md).
- **Seguridad:** si compartes un log de build (que muestra las variables en
  texto plano), **rota la API key**.

---

## ¿Cuánto cobrar por montar esto?

Tarifas de mercado orientativas: diagnóstico **150-300 €**, implementación
**800-1.500 €**, mantenimiento **80-200 €/mes**.

Apóyate en la comunidad: **La Tribu Divisual** —
https://www.skool.com/la-tribu-divisual
