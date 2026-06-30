/**
 * npm run doctor — diagnóstico de los 10 errores conocidos en 5 bloques.
 * Importa ./env-loader primero (necesita las vars para validar la key/modelo).
 * Lee connection_state en READONLY para no disparar la creación de la DB/WAL.
 */
import "./env-loader";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { createRequire } from "module";
import chalk from "chalk";

const require = createRequire(import.meta.url);
const ROOT = process.cwd();

function head(title: string) {
  console.log(chalk.bold.cyan(`\n— ${title} —`));
}
function ok(msg: string) {
  console.log(chalk.green("  OK   ") + msg);
}
function bad(msg: string) {
  console.log(chalk.red("  ERROR") + " " + msg);
}
function warn(msg: string) {
  console.log(chalk.yellow("  AVISO") + " " + msg);
}
function info(msg: string) {
  console.log(chalk.gray("  ·    ") + msg);
}

console.log(chalk.bold("\n  Doctor — WhatsApp AI Agent Kit\n"));

// ── Bloque 1: .env.local + OPENROUTER_API_KEY + modelo no-:free ──────────────
head("1. Configuración (.env.local)");
const envPath = path.resolve(ROOT, ".env.local");
if (!fs.existsSync(envPath)) {
  bad(".env.local no existe. Ejecuta /setup o npm run wizard.");
} else {
  ok(".env.local presente");
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || !key.trim()) {
    bad("OPENROUTER_API_KEY vacía. El bot abortará al arrancar.");
  } else if (!key.startsWith("sk-or-")) {
    warn("OPENROUTER_API_KEY no tiene el formato esperado (sk-or-...).");
  } else {
    ok("OPENROUTER_API_KEY presente");
  }
  const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
  if (model.endsWith(":free")) {
    bad(`Modelo ":free" detectado (${model}). Saturado: da 429 en producción. Cámbialo.`);
  } else {
    ok(`Modelo: ${model}`);
  }
}

// ── Bloque 2: node_modules + tsc ─────────────────────────────────────────────
head("2. Dependencias y typecheck");
if (!fs.existsSync(path.resolve(ROOT, "node_modules"))) {
  bad("node_modules no existe. Ejecuta npm install.");
} else {
  ok("node_modules presente");
  try {
    execSync("npx tsc --noEmit", { stdio: "pipe" });
    ok("typecheck (tsc --noEmit) sin errores");
  } catch {
    bad("typecheck falló. Ejecuta 'npx tsc --noEmit' para ver los errores.");
  }
}

// ── Bloque 3: estado de conexión (readonly) ──────────────────────────────────
head("3. Estado de la conexión de WhatsApp");
const dbPath = path.resolve(ROOT, "data", "messages.db");
if (!fs.existsSync(dbPath)) {
  warn("No hay base de datos todavía (el bot aún no ha arrancado).");
} else {
  try {
    const Database = require("better-sqlite3");
    const db = new Database(dbPath, { readonly: true });
    const row = db
      .prepare("SELECT status, phone, qr_string FROM connection_state WHERE id = 1")
      .get() as { status: string; phone: string | null; qr_string: string | null } | undefined;
    db.close();
    const status = row?.status ?? "desconocido";
    switch (status) {
      case "connected":
        ok(`Conectado${row?.phone ? " (+" + row.phone + ")" : ""}`);
        break;
      case "qr":
        warn("Esperando escaneo de QR. Abre http://localhost:3000 para verlo.");
        break;
      case "connecting":
        info("Conectando...");
        break;
      case "disconnected":
        warn("Desconectado. Arranca el bot (npm run start:all) y escanea el QR.");
        break;
      default:
        warn(`Estado desconocido: ${status}`);
    }
  } catch (e) {
    bad("No se pudo leer connection_state: " + String(e));
  }
}

// ── Bloque 4: sesión y persona ───────────────────────────────────────────────
head("4. Sesión de WhatsApp y persona del negocio");
if (fs.existsSync(path.resolve(ROOT, "auth"))) {
  ok("Carpeta auth/ presente (hay sesión guardada)");
} else {
  warn("No hay carpeta auth/. Tendrás que escanear el QR.");
}
if (fs.existsSync(path.resolve(ROOT, "prompts", "negocio.md"))) {
  ok("prompts/negocio.md presente (agente personalizado)");
} else {
  warn("prompts/negocio.md no existe. El agente usará el prompt genérico. Ejecuta /personaliza.");
}

// ── Bloque 5: procesos zombie (solo Windows) ─────────────────────────────────
head("5. Procesos");
if (process.platform === "win32") {
  try {
    const out = execSync('tasklist /FI "IMAGENAME eq node.exe"').toString();
    const count = (out.match(/node\.exe/g) || []).length;
    if (count > 3) {
      warn(`Hay ${count} procesos node.exe. Puede haber zombies de arranques previos; ciérralos si el bot no conecta.`);
    } else {
      ok(`${count} proceso(s) node.exe (normal)`);
    }
  } catch {
    info("No se pudo listar procesos (tasklist).");
  }
} else {
  info("Comprobación de zombies solo aplica en Windows.");
}

console.log(chalk.bold("\n  Diagnóstico completado.\n"));
