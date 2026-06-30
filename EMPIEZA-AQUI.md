# 👋 Empieza aquí

Vas a montar un **agente de IA conectado a WhatsApp** con un panel web para
controlarlo. No necesitas saber programar. Se hace en una tarde.

## 3 pasos

### 1. Abre esta carpeta en VS Code con Claude Code

Instala la extensión de **Claude Code** en VS Code y abre esta carpeta. Claude
será tu instalador: tú solo conversas y confirmas.

### 2. Escribe `/setup`

Claude comprueba que tu equipo está listo, instala todo, te pide tu API key de
**OpenRouter** (la valida por ti) y te conecta WhatsApp por **QR**.

> Cuando salga el QR: en tu móvil, WhatsApp → Ajustes → Dispositivos vinculados
> → Vincular un dispositivo → escanéalo. Luego escríbete "hola" **desde otro
> teléfono** para probar.

### 3. Escribe `/personaliza`

Claude te hace unas preguntas sobre tu negocio y el agente empieza a hablar como
tú: atiende, califica leads y agenda llamadas.

Cuando quieras dejarlo funcionando 24/7, escribe **`/deploy`**.

---

## ¿No tienes Claude Code?

Claude Code requiere una suscripción a **Claude Pro** (~20 $/mes). Si no la
tienes, usa el asistente por terminal:

```
npm install
npm run wizard
```

Hace lo mismo que `/setup` paso a paso.

## Nota para Windows

Instala **Git for Windows**: Claude Code necesita un shell Bash para funcionar.
Para compilar la base de datos, instala también **Visual Studio Build Tools**
(workload de C++).

---

¿Quieres el detalle de todo? Lee [GUIA-COMPLETA.md](GUIA-COMPLETA.md) o las guías
de [docs/](docs/01-instalar.md).
