import "./env-loader"; // PRIMER import, side-effect: carga .env.local antes que nada
import pino from "pino";
import { start, watchRestartFlag } from "../src/lib/baileys/client";

const logger = pino({ level: (process.env.LOG_LEVEL ?? "info") as pino.Level });

async function main() {
  if (!process.env.OPENROUTER_API_KEY?.trim()) {
    logger.error("Falta OPENROUTER_API_KEY. Edita .env.local o ejecuta /setup");
    process.exit(1);
  }

  logger.info("Iniciando bot de WhatsApp...");
  await start();
  watchRestartFlag();
  logger.info("Bot en marcha. Esperando conexión / QR.");
}

process.on("SIGINT", () => {
  logger.info("SIGINT recibido. Cerrando bot.");
  process.exit(0);
});
process.on("SIGTERM", () => {
  logger.info("SIGTERM recibido. Cerrando bot.");
  process.exit(0);
});

main().catch((e) => {
  logger.error(e, "Error fatal al arrancar el bot");
  process.exit(1);
});
