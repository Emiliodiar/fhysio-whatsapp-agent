---
description: Despliega el kit 24/7 en un VPS de Hostinger con EasyPanel (Nixpacks, sin Docker manual) y protege el panel con Cloudflare Access. Sube el repo a GitHub PRIVADO.
---

# /deploy — Pon tu agente 24/7

Guías al usuario para dejar el agente funcionando siempre, en un servidor. Tú
ejecutas los pasos de git/GitHub; los pasos del panel de Hostinger/Cloudflare
los hace el usuario siguiendo tus instrucciones claras (con capturas mentales).

## Parte 0 — Subir el código a GitHub (ANTES de tocar el servidor)

1. Verifica `git --version` y `gh auth status`.
2. **Verificación de seguridad OBLIGATORIA**: ejecuta `git status --short` antes
   del primer commit y confirma que **NO** aparecen `.env.local`, `data/` ni
   `auth/` (el `.gitignore` ya los excluye). El `.env.example` **SÍ** se sube.
3. Crea el repo. Tres caminos según el estado de `gh`:
   - **gh logueado**:
     `gh repo create <nombre> --private --source=. --remote=origin --push`
   - **gh sin login**: `gh auth login` y luego el comando anterior.
   - **sin gh**: guía a crear un Personal Access Token *fine-grained* con
     permiso **Contents: Read and Write** y usarlo como credencial de push.
4. **El repo es PRIVADO siempre.**

## Parte 1 — VPS Hostinger + EasyPanel

- VPS Hostinger con **Ubuntu 24.04 + Docker**. Recomendado **KVM 2**
  (8 GB RAM / 2 vCPU, ~8 €/mes). El cuello de botella real son las **vCPU**
  (WebSocket + cifrado), no la RAM (~150 MB por agente).
- Instala EasyPanel:
  ```
  docker run --rm -it -v /etc/easypanel:/etc/easypanel -v /var/run/docker.sock:/var/run/docker.sock:ro easypanel/easypanel setup
  ```
  Queda accesible en `http://<IP>:3000` (edición self-hosted Developer, GRATIS).
- En EasyPanel: **Create → App**, Source = **GitHub**, Branch = **main**,
  Build path = `/`, Builder = **Nixpacks** (autodetecta por `nixpacks.toml`).

## Parte 2 — Volúmenes persistentes (CRÍTICO, antes de Deploy)

Configura DOS volúmenes **antes** del primer Deploy. Es la causa **#1** de
problemas en producción:

- `/app/data` → SQLite y conversaciones.
- `/app/auth` → sesión de WhatsApp. **Sin este volumen, se re-escanea el QR en
  cada redeploy.**

## Parte 3 — Variables de entorno

Añade en EasyPanel: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, y las opcionales
(`GOOGLE_SHEETS_WEBHOOK_URL`, `CAL_BOOKING_URL`).

> AVISO de seguridad: EasyPanel inyecta las variables como `--build-arg`, que
> aparecen en **TEXTO PLANO** en el log de build. Si compartes el log con
> alguien, **ROTA la API key** después.

## Parte 4 — Deploy

- Lanza **Deploy** (tarda 3-5 min: compila `better-sqlite3` nativo y Next).
- Abre el dominio de la app y **escanea el QR**.

## Parte 5 — Cloudflare Access (BLOQUEANTE: nunca deployes sin esto)

Protege el panel ANTES de meter conversaciones reales:

- Cloudflare **Zero Trust → Access → Applications → Add → Self-hosted**.
- `Application domain = panel.tu-dominio.com`.
- Policy **Allow** con Include = **Emails** (o "Emails ending in").
- Identity provider: **Email One-Time PIN** (recomendado: cero configuración,
  sin OAuth de Google).
- Si usas el dominio `*.easypanel.host` en vez de uno propio: alternativa con
  **Basic Auth**.
- **Prueba SIEMPRE en incógnito con un email NO autorizado** para confirmar que
  rechaza el acceso.

## Redeploy

Cada `git push` a `main` hace que EasyPanel redespliegue automáticamente.

> Nota de futuro: Nixpacks está en modo mantenimiento (Railway lanzó Railpack).
> Si en 12-18 meses el build falla, migra a un `Dockerfile` (EasyPanel lo
> soporta). Déjalo anotado.
