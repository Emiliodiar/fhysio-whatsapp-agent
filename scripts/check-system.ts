/**
 * npm run check — comprobación rápida del sistema (NO importa env-loader).
 * 7 checks no bloqueantes (salvo el exit code final). Exit 0 si todo OK, 1 si
 * algo falla.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import chalk from "chalk";

let failures = 0;

function ok(msg: string) {
  console.log(chalk.green("  OK  ") + msg);
}
function bad(msg: string) {
  console.log(chalk.red(" FAIL ") + msg);
  failures++;
}
function warn(msg: string) {
  console.log(chalk.yellow(" WARN ") + msg);
}

console.log(chalk.bold("\n  Comprobación del sistema — WhatsApp AI Agent Kit\n"));

// 1) Node >= 20
const major = parseInt(process.versions.node.split(".")[0], 10);
if (major >= 20) ok(`Node ${process.versions.node}`);
else bad(`Node ${process.versions.node} — se requiere >= 20`);

// 2) SO soportado
const platform = process.platform;
if (platform === "darwin" || platform === "linux" || platform === "win32") {
  ok(`Sistema operativo soportado (${platform})`);
} else {
  bad(`Sistema operativo no soportado (${platform})`);
}

// 3) npm presente
try {
  const npmV = execSync("npm --version").toString().trim();
  ok(`npm ${npmV}`);
} catch {
  bad("npm no encontrado en el PATH");
}

// 4) >= 500MB libres
try {
  const stat = fs.statfsSync(process.cwd());
  const freeMB = (stat.bavail * stat.bsize) / (1024 * 1024);
  if (freeMB >= 500) ok(`Espacio en disco: ${Math.round(freeMB)} MB libres`);
  else bad(`Poco espacio en disco: ${Math.round(freeMB)} MB (se recomiendan >= 500 MB)`);
} catch {
  warn("No se pudo comprobar el espacio en disco");
}

// 5) Estructura del kit
const required = ["package.json", "src/lib/db.ts", "scripts/start-bot.ts"];
let structureOk = true;
for (const rel of required) {
  if (!fs.existsSync(path.resolve(process.cwd(), rel))) {
    bad(`Falta archivo del kit: ${rel}`);
    structureOk = false;
  }
}
if (structureOk) ok("Estructura del kit correcta");

// 6) .env.local
if (fs.existsSync(path.resolve(process.cwd(), ".env.local"))) {
  ok(".env.local presente");
} else {
  warn(".env.local no existe todavía (lo crea /setup o el wizard)");
}

// 7) node_modules
if (fs.existsSync(path.resolve(process.cwd(), "node_modules"))) {
  ok("Dependencias instaladas (node_modules)");
} else {
  bad("Faltan dependencias: ejecuta npm install");
}

console.log("");
if (failures === 0) {
  console.log(chalk.green.bold("  Todo en orden.\n"));
  process.exit(0);
} else {
  console.log(chalk.red.bold(`  ${failures} problema(s) detectado(s).\n`));
  process.exit(1);
}
