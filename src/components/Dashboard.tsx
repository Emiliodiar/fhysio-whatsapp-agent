"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardHeader from "./DashboardHeader";
import ConversationList from "./ConversationList";
import ConversationPanel from "./ConversationPanel";

export interface ConversationItem {
  id: number;
  phone: string;
  name: string | null;
  mode: "AI" | "HUMAN";
  last_message_at: number | null;
  last_message_preview: string | null;
}

export default function Dashboard({ phone }: { phone: string | null }) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations", { cache: "no-store" });
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      // ignore: el siguiente tick reintenta
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 2000);
    return () => clearInterval(t);
  }, [refresh]);

  // Auto-selecciona la primera conversación si no hay ninguna seleccionada.
  useEffect(() => {
    if (selectedId === null && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader phone={phone} />
      <div className="grid flex-1 grid-cols-[320px_1fr] overflow-hidden">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onRefresh={refresh}
        />
        <ConversationPanel conversation={selected} onRefresh={refresh} />
      </div>
    </div>
  );
}
