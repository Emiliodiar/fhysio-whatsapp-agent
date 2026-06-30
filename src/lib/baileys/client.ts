/**
 * Cliente de WhatsApp (Baileys, WhatsApp Web no oficial).
 *
 * Códigos de desconexión relevantes (documentados aquí porque costaron sangre):
 *   405 = versión de WhatsApp Web desactualizada.
 *         Mitigado SIEMPRE con fetchLatestBaileysVersion().
 *   440 = browser fingerprint / connectionReplaced (típico justo tras el
 *         pairing). Mitigado con Browsers.macOS('Desktop') + backoff de 15s
 *         (reconectar rápido entra en loop).
 *   401 = loggedOut (DisconnectReason.loggedOut): NO reconectar.
 *   515 = NO es error: es la señal de "pairing OK". Se ignora (Baileys
 *         reconecta solo; aquí simplemente no tocamos la DB).
 */
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  DisconnectReason,
  type WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import qrcodeTerminal from "qrcode-terminal";
import fs from "fs";
import path from "path";
import { setConnectionState, getConnectionState } from "@/lib/db";
import { handleIncomingMessages } from "./handler";
import { startOutboxLoop, stopOutboxLoop } from "./outbox";

const AUTH_DIR = path.resolve(process.cwd(), "auth");
const DATA_DIR = path.resolve(process.cwd(), "data");
const RESTART_FLAG = path.join(DATA_DIR, ".restart");

const logger = pino({ level: (process.env.LOG_LEVEL ?? "info") as pino.Level });

interface Handle {
  sock: WASocket;
  shutdown: () => Promise<void>;
}

let handle: Handle | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export async function start(): Promise<void> {
  // Crea carpetas de runtime si faltan.
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  // SIEMPRE intentar la última versión (WhatsApp rechaza versiones viejas: 405).
  let version: [number, number, number] | undefined;
  try {
    ({ version } = await fetchLatestBaileysVersion());
  } catch {
    logger.warn("No se pudo obtener la última versión de Baileys; usando default");
    version = undefined;
  }

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }), // Baileys SIEMPRE silent (aparte de nuestro logger)
    browser: Browsers.macOS("Desktop"), // fingerprint conocido; uno custom dispara 440 en loop
    markOnlineOnConnect: false,
    syncFullHistory: false,
    // NO printQRInTerminal: deprecated en Baileys 6.7+; el QR se maneja a mano.
  });

  const shutdown = async () => {
    try {
      sock.end(undefined);
    } catch {
      // ignore
    }
  };
  handle = { sock, shutdown };

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (u) => {
    const { connection, lastDisconnect, qr } = u;

    if (qr) {
      setConnectionState({ status: "qr", qr_string: qr, phone: null });
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === "connecting") {
      // Solo degradar a connecting si veníamos de disconnected; así no pisamos
      // el qr_string cuando ya estamos en qr o connected.
      const current = getConnectionState();
      if (current.status === "disconnected") {
        setConnectionState({ status: "connecting" });
      }
    }

    if (connection === "open") {
      const userId = sock.user?.id ?? "";
      const phone = userId.split(":")[0].split("@")[0] || null;
      setConnectionState({ status: "connected", phone });
      startOutboxLoop(sock);
    }

    if (connection === "close") {
      const code = (lastDisconnect?.error as Boom)?.output?.statusCode;
      stopOutboxLoop();
      if (code === DisconnectReason.loggedOut) {
        // 401: sesión cerrada desde el móvil. NO reconectar.
        setConnectionState({ status: "disconnected" });
      } else {
        // Cualquier otro código: NO tocar la DB (mantener 'connected' mientras
        // reconecta) y reprogramar reconexión.
        scheduleReconnect(code);
      }
    }
  });

  sock.ev.on("messages.upsert", (e) => handleIncomingMessages(sock, e));
}

function scheduleReconnect(code: number | undefined): void {
  if (reconnectTimer) return;
  // 440 (connectionReplaced) necesita backoff largo o entra en loop.
  const delay = code === 440 ? 15000 : 5000;
  reconnectTimer = setTimeout(async () => {
    // Cleanup del socket viejo para no dejar listeners colgando.
    try {
      handle?.sock.end(undefined);
    } catch {
      // ignore
    }
    reconnectTimer = null;
    await start();
  }, delay);
}

/**
 * Vigila el fichero flag data/.restart. Cuando aparece (lo crea el endpoint
 * /api/connection/disconnect), borra la sesión y regenera el QR.
 */
export function watchRestartFlag(): void {
  setInterval(async () => {
    if (!fs.existsSync(RESTART_FLAG)) return;
    try {
      fs.rmSync(RESTART_FLAG, { force: true });
    } catch {
      // ignore
    }
    await handle?.shutdown();
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    await start();
  }, 1000);
}
