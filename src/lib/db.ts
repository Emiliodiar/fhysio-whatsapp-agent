/**
 * Capa de persistencia única del kit (better-sqlite3).
 *
 * Una sola base de datos en `data/messages.db` que comparten DOS procesos:
 *   - el bot de WhatsApp (scripts/start-bot.ts)
 *   - el panel web Next.js (rutas API)
 * No comparten memoria: se coordinan SOLO a través de estas tablas
 * (`connection_state`, `outbox`) + un fichero flag en disco (`data/.restart`).
 *
 * INICIALIZACIÓN PEREZOSA OBLIGATORIA:
 *   Importar este módulo NO abre la DB. Solo la primera llamada real a una
 *   función crea conexión, esquema y prepared statements, cacheados en
 *   module scope vía ctx()/build().
 *   Motivo: `next build` ("Collecting page data") lanza ~10 workers que
 *   importan las rutas API; abrir/escribir SQLite WAL al importar provoca
 *   `database is locked` (SQLITE_BUSY) no determinista.
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "messages.db");

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------
export type ConversationMode = "AI" | "HUMAN";
export type MessageRole = "user" | "assistant" | "human";
export type ConnectionStatus = "disconnected" | "qr" | "connecting" | "connected";

export interface Conversation {
  id: number;
  phone: string;
  name: string | null;
  jid: string | null;
  mode: ConversationMode;
  last_message_at: number | null;
  created_at: number;
}

export interface ConversationListItem extends Conversation {
  last_message_preview: string | null;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: MessageRole;
  content: string;
  created_at: number;
}

export interface ConnectionState {
  id: number;
  status: ConnectionStatus;
  qr_string: string | null;
  phone: string | null;
  updated_at: number;
}

export interface OutboxItem {
  id: number;
  conversation_id: number;
  phone: string;
  content: string;
  sent: number;
  created_at: number;
}

// ---------------------------------------------------------------------------
// Esquema (todo IF NOT EXISTS — seguro de re-ejecutar)
// ---------------------------------------------------------------------------
const SCHEMA = `
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  jid TEXT,
  mode TEXT CHECK(mode IN ('AI','HUMAN')) NOT NULL DEFAULT 'AI',
  last_message_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id),
  role TEXT CHECK(role IN ('user','assistant','human')) NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);

CREATE TABLE IF NOT EXISTS connection_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  status TEXT CHECK(status IN ('disconnected','qr','connecting','connected')) NOT NULL DEFAULT 'disconnected',
  qr_string TEXT,
  phone TEXT,
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
INSERT OR IGNORE INTO connection_state (id, status) VALUES (1, 'disconnected');

CREATE TABLE IF NOT EXISTS outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  phone TEXT NOT NULL,
  content TEXT NOT NULL,
  sent INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_outbox_pending ON outbox(sent, created_at);
`;

// ---------------------------------------------------------------------------
// Contexto perezoso (conexión + prepared statements cacheados)
// ---------------------------------------------------------------------------
interface Ctx {
  db: Database.Database;
  selConvByPhone: Database.Statement;
  selConvById: Database.Statement;
  insConv: Database.Statement;
  updConvName: Database.Statement;
  updConvJid: Database.Statement;
  listConvs: Database.Statement;
  updMode: Database.Statement;
  insMsg: Database.Statement;
  touchConv: Database.Statement;
  getMsgs: Database.Statement;
  selConnState: Database.Statement;
  updConnState: Database.Statement;
  insOutbox: Database.Statement;
  pendingOutbox: Database.Statement;
  markSent: Database.Statement;
  delMsgs: Database.Statement;
  delOutboxPending: Database.Statement;
  delConv: Database.Statement;
}

let _ctx: Ctx | null = null;

function ctx(): Ctx {
  if (!_ctx) _ctx = build();
  return _ctx;
}

function build(): Ctx {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);

  // Micro-migración: añade la columna `jid` a instalaciones antiguas.
  const cols = db.prepare("PRAGMA table_info(conversations)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "jid")) {
    db.exec("ALTER TABLE conversations ADD COLUMN jid TEXT");
  }

  return {
    db,
    selConvByPhone: db.prepare("SELECT * FROM conversations WHERE phone = ?"),
    selConvById: db.prepare("SELECT * FROM conversations WHERE id = ?"),
    insConv: db.prepare(
      "INSERT INTO conversations (phone, name, jid) VALUES (?, ?, ?)"
    ),
    updConvName: db.prepare(
      "UPDATE conversations SET name = ? WHERE id = ? AND (name IS NULL OR name = '')"
    ),
    updConvJid: db.prepare("UPDATE conversations SET jid = ? WHERE id = ?"),
    listConvs: db.prepare(
      `SELECT c.*,
              (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_preview
         FROM conversations c
        ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`
    ),
    updMode: db.prepare("UPDATE conversations SET mode = ? WHERE id = ?"),
    insMsg: db.prepare(
      "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)"
    ),
    touchConv: db.prepare(
      "UPDATE conversations SET last_message_at = unixepoch() WHERE id = ?"
    ),
    getMsgs: db.prepare(
      "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?"
    ),
    selConnState: db.prepare("SELECT * FROM connection_state WHERE id = 1"),
    updConnState: db.prepare(
      "UPDATE connection_state SET status = ?, qr_string = ?, phone = ?, updated_at = unixepoch() WHERE id = 1"
    ),
    insOutbox: db.prepare(
      "INSERT INTO outbox (conversation_id, phone, content) VALUES (?, ?, ?)"
    ),
    pendingOutbox: db.prepare(
      "SELECT * FROM outbox WHERE sent = 0 ORDER BY created_at ASC LIMIT ?"
    ),
    markSent: db.prepare("UPDATE outbox SET sent = 1 WHERE id = ?"),
    delMsgs: db.prepare("DELETE FROM messages WHERE conversation_id = ?"),
    delOutboxPending: db.prepare(
      "DELETE FROM outbox WHERE conversation_id = ? AND sent = 0"
    ),
    delConv: db.prepare("DELETE FROM conversations WHERE id = ?"),
  };
}

// ---------------------------------------------------------------------------
// Conversaciones
// ---------------------------------------------------------------------------
export function getOrCreateConversation(
  phone: string,
  name?: string,
  jid?: string
): Conversation {
  const c = ctx();
  const existing = c.selConvByPhone.get(phone) as Conversation | undefined;
  if (existing) {
    // Backfill del nombre solo si estaba vacío.
    if (name && (!existing.name || existing.name === "")) {
      c.updConvName.run(name, existing.id);
    }
    // Actualiza el jid si cambió (p. ej. migración a @lid).
    if (jid && jid !== existing.jid) {
      c.updConvJid.run(jid, existing.id);
    }
    return c.selConvById.get(existing.id) as Conversation;
  }
  const info = c.insConv.run(phone, name ?? null, jid ?? null);
  return c.selConvById.get(info.lastInsertRowid as number) as Conversation;
}

export function getConversationById(id: number): Conversation | null {
  return (ctx().selConvById.get(id) as Conversation | undefined) ?? null;
}

export function listConversations(): ConversationListItem[] {
  return ctx().listConvs.all() as ConversationListItem[];
}

export function setMode(conversationId: number, mode: ConversationMode): void {
  ctx().updMode.run(mode, conversationId);
}

// ---------------------------------------------------------------------------
// Mensajes
// ---------------------------------------------------------------------------
export function insertMessage(
  conversationId: number,
  role: MessageRole,
  content: string
): number {
  const c = ctx();
  const tx = c.db.transaction((cid: number, r: MessageRole, txt: string) => {
    const info = c.insMsg.run(cid, r, txt);
    c.touchConv.run(cid);
    return info.lastInsertRowid as number;
  });
  return tx(conversationId, role, content);
}

export function getMessages(conversationId: number, limit = 50): Message[] {
  const rows = ctx().getMsgs.all(conversationId, limit) as Message[];
  return rows.reverse();
}

export function getRecentHistory(conversationId: number, limit = 20): Message[] {
  const rows = ctx().getMsgs.all(conversationId, limit) as Message[];
  return rows.reverse();
}

// ---------------------------------------------------------------------------
// Estado de conexión (singleton id=1)
// ---------------------------------------------------------------------------
export function getConnectionState(): ConnectionState {
  return ctx().selConnState.get() as ConnectionState;
}

export function setConnectionState(input: {
  status?: ConnectionStatus;
  qr_string?: string | null;
  phone?: string | null;
}): void {
  const c = ctx();
  const current = c.selConnState.get() as ConnectionState;
  // Preserva los campos no provistos; solo borra un campo si la clave viene
  // explícita en `input` con valor null.
  const status = input.status ?? current.status;
  const qr_string = "qr_string" in input ? input.qr_string ?? null : current.qr_string;
  const phone = "phone" in input ? input.phone ?? null : current.phone;
  c.updConnState.run(status, qr_string, phone);
}

// ---------------------------------------------------------------------------
// Outbox (mensajes salientes del operador humano)
// ---------------------------------------------------------------------------
export function enqueueOutbox(
  conversationId: number,
  phone: string,
  content: string
): number {
  const info = ctx().insOutbox.run(conversationId, phone, content);
  return info.lastInsertRowid as number;
}

export function getPendingOutbox(limit = 20): OutboxItem[] {
  return ctx().pendingOutbox.all(limit) as OutboxItem[];
}

export function markOutboxSent(id: number): void {
  ctx().markSent.run(id);
}

// ---------------------------------------------------------------------------
// Borrado de conversación (orquestado en código; no hay ON DELETE CASCADE)
// ---------------------------------------------------------------------------
export function deleteConversation(conversationId: number): void {
  const c = ctx();
  const tx = c.db.transaction((cid: number) => {
    c.delMsgs.run(cid);
    c.delOutboxPending.run(cid);
    c.delConv.run(cid);
  });
  tx(conversationId);
}
