"use client";

import { useEffect, useRef, useState } from "react";
import type { ConversationItem } from "./Dashboard";
import MessageBubble, { type ChatMessage } from "./MessageBubble";
import ModeToggle from "./ModeToggle";

export default function ConversationPanel({
  conversation,
  onRefresh,
}: {
  conversation: ConversationItem | null;
  onRefresh: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const convId = conversation?.id ?? null;

  // Polling de mensajes cada 2s.
  useEffect(() => {
    if (convId === null) {
      setMessages([]);
      return;
    }
    let mounted = true;

    async function load() {
      try {
        const res = await fetch(`/api/messages/${convId}`, { cache: "no-store" });
        const data = await res.json();
        if (mounted) setMessages(data.messages ?? []);
      } catch {
        // ignore
      }
    }

    load();
    const t = setInterval(load, 2000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [convId]);

  // Autoscroll al fondo cuando cambian los mensajes.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!conversation) {
    return (
      <section className="flex items-center justify-center text-sm text-neutral-500">
        Selecciona una conversación
      </section>
    );
  }

  async function handleModeChange(mode: "AI" | "HUMAN") {
    if (!conversation) return;
    await fetch(`/api/mode/${conversation.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    onRefresh();
  }

  async function handleSend() {
    if (!conversation) return;
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      await fetch(`/api/messages/${conversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      setDraft("");
      onRefresh();
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!conversation) return;
    if (!confirm("¿Borrar esta conversación? No se puede deshacer.")) return;
    await fetch(`/api/conversations/${conversation.id}`, { method: "DELETE" });
    onRefresh();
  }

  const title = conversation.name || `+${conversation.phone}`;

  return (
    <section className="flex h-full flex-col bg-neutral-950">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100">{title}</h2>
          {conversation.name && (
            <p className="text-xs text-neutral-500">+{conversation.phone}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle mode={conversation.mode} onChange={handleModeChange} />
          <button
            onClick={handleDelete}
            className="rounded-lg border border-neutral-800 px-2.5 py-1.5 text-xs text-neutral-400 transition hover:border-red-800 hover:text-red-400"
          >
            Borrar
          </button>
        </div>
      </div>

      {/* Mensajes */}
      <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto p-5">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      {/* Footer condicional */}
      <div className="border-t border-neutral-800 p-4">
        {conversation.mode === "HUMAN" ? (
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="Escribe un mensaje..."
              className="max-h-32 flex-1 resize-none rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-amber-700"
            />
            <button
              onClick={handleSend}
              disabled={sending || !draft.trim()}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-500 disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-neutral-500">
            El agente IA responde automáticamente. Cambia a Modo Humano para
            escribir tú.
          </p>
        )}
      </div>
    </section>
  );
}
