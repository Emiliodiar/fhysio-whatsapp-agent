"use client";

import type { ConversationItem } from "./Dashboard";

function formatRelative(tsSeconds: number | null): string {
  if (!tsSeconds) return "";
  const diff = Math.floor(Date.now() / 1000) - tsSeconds;
  if (diff < 60) return "ahora";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} días`;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: ConversationItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onRefresh: () => void;
}) {
  return (
    <aside className="flex h-full flex-col border-r border-neutral-800 bg-neutral-950">
      <div className="border-b border-neutral-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-neutral-300">
          Conversaciones · {conversations.length}
        </h2>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-neutral-500">
          Aún no hay conversaciones. Escribe &quot;hola&quot; al número conectado
          desde otro teléfono para empezar.
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {conversations.map((c) => {
            const active = c.id === selectedId;
            const title = c.name || `+${c.phone}`;
            return (
              <li key={c.id}>
                <button
                  onClick={() => onSelect(c.id)}
                  className={`flex w-full flex-col gap-1 border-b border-neutral-900 px-4 py-3 text-left transition hover:bg-neutral-900 ${
                    active ? "bg-neutral-900" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-neutral-200">
                      {title}
                    </span>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        c.mode === "AI"
                          ? "bg-emerald-950 text-emerald-400"
                          : "bg-amber-950 text-amber-400"
                      }`}
                    >
                      {c.mode === "AI" ? "IA" : "Humano"}
                    </span>
                  </div>
                  {c.name && (
                    <span className="text-xs text-neutral-500">+{c.phone}</span>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-neutral-500">
                      {c.last_message_preview ?? ""}
                    </span>
                    <span className="shrink-0 text-[10px] text-neutral-600">
                      {formatRelative(c.last_message_at)}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
