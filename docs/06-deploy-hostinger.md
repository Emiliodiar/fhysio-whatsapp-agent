# 06 · Deploy 24/7 en Hostinger (EasyPanel + Nixpacks)

Para que el agente funcione siempre (no solo con tu ordenador encendido), se
despliega en un **VPS**. Usamos Hostinger + EasyPanel + Nixpacks (sin Docker
manual). La forma fácil: el comando **`/deploy`** en Claude Code te guía todo.

## Resumen del flujo

1. **Subir el código a GitHub (PRIVADO).**
2. Contratar el VPS e instalar EasyPanel.
3. Crear la App con Nixpacks.
4. Configurar **volúmenes** y **variables** (antes de Deploy).
5. Deploy → escanear QR.
6. Proteger con Cloudflare Access.

## 1. GitHub (privado)

Antes del primer commit, verifica con `git status --short` que **NO** se suben
`.env.local`, `data/` ni `auth/` (el `.gitignore` ya los excluye; `.env.example`
sí se sube). Crea el repo privado, p. ej. con:

```
gh repo create whatsapp-ai-agent-kit --private --source=. --remote=origin --push
```

## 2. VPS + EasyPanel

- VPS Hostinger con **Ubuntu 24.04 + Docker**. Recomendado **KVM 2** (8 GB /
  2 vCPU, ~8 €/mes). El cuello de botella real son las **vCPU** (WebSocket +
  cifrado), no la RAM (~150 MB por agente).
- Instala EasyPanel:
  ```
  docker run --rm -it -v /etc/easypanel:/etc/easypanel -v /var/run/docker.sock:/var/run/docker.sock:ro easypanel/easypanel setup
  ```
  Accede en `http://<IP>:3000` (self-hosted Developer, GRATIS).

## 3. Crear la App

EasyPanel → **Create → App** → Source **GitHub** → Branch **main** → Build path
`/` → Builder **Nixpacks** (se autodetecta por `nixpacks.toml`).

## 4. Volúmenes persistentes (CRÍTICO, antes de Deploy)

Es la **causa #1** de problemas en producción. Crea DOS volúmenes:

- `/app/data` → SQLite y conversaciones.
- `/app/auth` → sesión de WhatsApp. **Sin él, re-escaneas el QR en cada
  redeploy.**

## 5. Variables de entorno

Añade `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` y las opcionales.

> AVISO: EasyPanel inyecta las variables como `--build-arg`, que aparecen en
> **TEXTO PLANO** en el log de build. Si compartes el log, **rota la API key**.

## 6. Deploy

Lanza **Deploy** (3-5 min: compila `better-sqlite3` nativo y Next). Abre el
dominio de la app y **escanea el QR**.

## 7. Proteger

Aplica [05 · Cloudflare Access](05-cloudflare-access.md) **antes** de meter
conversaciones reales.

## Redeploy

Cada `git push` a `main` redespliega automáticamente.

> Nota de futuro: Nixpacks está en modo mantenimiento (Railway lanzó Railpack).
> Si en 12-18 meses el build falla, migra a un `Dockerfile` (EasyPanel lo
> soporta).

> Siguiente paso: [07 · Errores comunes](07-errores-comunes.md).
