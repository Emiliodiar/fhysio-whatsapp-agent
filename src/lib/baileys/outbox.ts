/**
 * Loop de outbox: los mensajes que el operador humano escribe desde el panel
 * NO se envían directamente. El panel los encola en la tabla `outbox` y este
 * loop (que corre en el proceso del bot, con acceso al socket) los manda.
 *
 * Así se desacoplan los dos procesos: web encola, bot envía.
 */
import type { WASocket } from "@whiskeysockets/baileys";
import {
  getPendingOutbox,
  markOutboxSent,
  getConversationById,
} from "@/lib/db";

let outboxTimer: ReturnType<typeof setInterval> | null = null;

export function startOutboxLoop(sock: WASocket): void {
  if (outboxTimer) return;
  outboxTimer = setInterval(async () => {
    const pending = getPendingOutbox(20);
    for (const item of pending) {
      try {
        const convo = getConversationById(item.conversation_id);
        // Usar convo.jid soporta @lid; nunca hardcodear @s.whatsapp.net.
        const jid = convo?.jid ?? `${item.phone}@s.whatsapp.net`;
        await sock.sendMessage(jid, { text: item.content });
        markOutboxSent(item.id);
      } catch {
        // En fallo NO marcamos enviado: queda sent=0 y se reintenta en el
        // siguiente tick. Sin límite de reintentos ni backoff por item;
        // el único ritmo es el tick de 2s.
      }
    }
  }, 2000);
}

export function stopOutboxLoop(): void {
  if (outboxTimer) {
    clearInterval(outboxTimer);
    outboxTimer = null;
  }
}
