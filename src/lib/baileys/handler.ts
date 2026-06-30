/**
 * Manejador de mensajes entrantes de WhatsApp.
 *
 * Reglas clave:
 *  - Solo procesa event.type === "notify" (los "append"/"replace" son histórico).
 *  - Ignora mensajes propios (fromMe): por eso SIEMPRE se prueba desde OTRO móvil.
 *  - Acepta solo chats 1:1 (@s.whatsapp.net o @lid). Descarta grupos, broadcast,
 *    newsletter, y mensajes sin texto (audio/imagen/sticker).
 *  - Re-lee la conversación tras guardar el mensaje (el modo pudo cambiar).
 *  - Solo responde con IA si la conversación está en modo AI.
 */
import type { WASocket, BaileysEventMap } from "@whiskeysockets/baileys";
import {
  getOrCreateConversation,
  getConversationById,
  insertMessage,
  getRecentHistory,
} from "@/lib/db";
import { generateReply } from "@/lib/openrouter";

export async function handleIncomingMessages(
  sock: WASocket,
  event: BaileysEventMap["messages.upsert"]
): Promise<void> {
  // Solo mensajes nuevos en tiempo real.
  if (event.type !== "notify") return;

  for (const msg of event.messages) {
    // Mensajes propios: ignorar (se prueba siempre desde otro móvil).
    if (msg.key.fromMe) continue;

    const remoteJid = msg.key.remoteJid;
    if (!remoteJid) continue;

    // Descartar grupos, listas de difusión y canales.
    if (
      remoteJid.endsWith("@g.us") ||
      remoteJid.endsWith("@broadcast") ||
      remoteJid.endsWith("@newsletter")
    ) {
      continue;
    }

    // Aceptar SOLO chats 1:1. @lid lo despliega WhatsApp en 2025-2026; aceptar
    // ambos o se pierden mensajes en silencio.
    if (!remoteJid.endsWith("@s.whatsapp.net") && !remoteJid.endsWith("@lid")) {
      continue;
    }

    // Texto plano (descarta audio/imagen/sticker).
    const text =
      msg.message?.conversation ??
      msg.message?.extendedTextMessage?.text ??
      null;
    if (!text) continue;

    const phone = remoteJid.split("@")[0].split(":")[0];
    const name = msg.pushName ?? undefined;

    const convo = getOrCreateConversation(phone, name, remoteJid);
    insertMessage(convo.id, "user", text);

    // Re-lee: el modo pudo cambiar mientras tanto (toggle del panel o derivar).
    const fresh = getConversationById(convo.id);
    if (!fresh || fresh.mode !== "AI") {
      // Modo HUMAN: solo guarda, NO responde.
      continue;
    }

    const reply = await generateReply({
      history: getRecentHistory(convo.id, 20),
      conversationId: convo.id,
    });
    if (!reply) continue;

    insertMessage(convo.id, "assistant", reply);
    await sock.sendMessage(remoteJid, { text: reply });
  }
}
