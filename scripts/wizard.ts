/**
 * npm run wizard — fallback CLI de /setup para quien no usa Claude Code.
 * Importa ./env-loader. Fases A (requisitos) → B (instalar) → C (API key) →
 * D (arrancar). Usa boxen + chalk + enquirer.
 */
import "./env-loader";
import fs from "fs";
import path from "path";
import { execSync, spawn } from "child_process";
import boxen from "boxen";
import chalk from "chalk";
import enquirer from "enquirer";

const ROOT = process.cwd();

function banner() {
  console.log(
    boxen(
      chalk.bold("WhatsApp AI Agent Kit") +
        "\n" +
        chalk.gray("Asistente de instalación (modo CLI)"),
      { padding: 1, margin: 1, borderStyle: "round", borderColor: "yellow" }
    )
  );
}

async function main() {
  banner();

  // ── Fase A: requisitos ──────────────────────────────────────────────────
  console.log(chalk.bold.cyan("\nFase A — Requisitos\n"));
  const major = parseInt(process.versions.node.split(".")[0], 10);
  if (major < 20) {
    console.log(chalk.red(`Node ${process.versions.node} detectado. Se requiere Node >= 20.`));
    console.log(chalk.gray("Instálalo desde https://nodejs.org (versión LTS 22)."));
    process.exit(1);
  }
  console.log(chalk.green(`  Node ${process.versions.node}`));
  console.log(chalk.green(`  Sistema: ${process.platform}`));

  // ── Fase B: instalación ─────────────────────────────────────────────────
  console.log(chalk.bold.cyan("\nFase B — Dependencias\n"));
  if (!fs.existsSync(path.resolve(ROOT, "node_modules"))) {
    console.log(chalk.gray("  Instalando dependencias (npm install)..."));
    execSync("npm install", { stdio: "inherit" });
  } else {
    console.log(chalk.green("  node_modules ya presente; salto la instalación."));
  }

  // ── Fase C: API key de OpenRouter ───────────────────────────────────────
  console.log(chalk.bold.cyan("\nFase C — OpenRouter\n"));
  const envPath = path.resolve(ROOT, ".env.local");
  const examplePath = path.resolve(ROOT, ".env.example");
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      console.log(chalk.gray("  Creado .env.local a partir de .env.example"));
    } else {
      fs.writeFileSync(envPath, "");
    }
  }

  const existingKey = process.env.OPENROUTER_API_KEY;
  if (existingKey && existingKey.trim()) {
    console.log(chalk.green("  OPENROUTER_API_KEY ya configurada."));
  } else {
    const answer = (await enquirer.prompt({
      type: "input",
      name: "apiKey",
      message: "Pega tu API key de OpenRouter (sk-or-...):",
      validate: (value: string) =>
        value.startsWith("sk-or-") || "La key debe empezar por sk-or-",
    })) as { apiKey: string };

    writeEnvVar(envPath, "OPENROUTER_API_KEY", answer.apiKey.trim());
    console.log(chalk.green("  API key guardada en .env.local"));
  }

  // ── Fase D: arrancar ────────────────────────────────────────────────────
  console.log(chalk.bold.cyan("\nFase D — Arranque\n"));
  console.log(chalk.gray("  Arrancando bot + panel (npm run start:all)..."));
  console.log(chalk.gray("  Abre http://localhost:3000 y escanea el QR con WhatsApp."));
  console.log(chalk.gray("  (Pulsa Ctrl+C para detener.)\n"));

  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const child = spawn(npmCmd, ["run", "start:all"], { stdio: "inherit" });
  child.on("exit", (code) => process.exit(code ?? 0));
}

function writeEnvVar(envPath: string, key: string, value: string) {
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
  const re = new RegExp("^" + key + "=.*$", "m");
  if (re.test(content)) {
    content = content.replace(re, `${key}=${value}`);
  } else {
    if (content.length && !content.endsWith("\n")) content += "\n";
    content += `${key}=${value}\n`;
  }
  fs.writeFileSync(envPath, content);
}

main().catch((e) => {
  console.error(chalk.red(String(e)));
  process.exit(1);
});
