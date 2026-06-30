"use client";

export interface ChatMessage {
  id: number;
  role: "user" | "assistant" | "human";
  content: string;
  created_at: number;
}

function formatTime(tsSeconds: number): string {
  return new Date(tsSeconds * 1000).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-neutral-800 px-3.5 py-2">
          <p className="whitespace-pre-wrap break-words text-sm text-neutral-100">
            {message.content}
          </p>
          <span className="mt-1 block text-[10px] text-neutral-500">
            {formatTime(message.created_at)}
          </span>
        </div>
      </div>
    );
  }

  const isAssistant = message.role === "assistant";
  const accent = isAssistant
    ? "bg-emerald-900/60 text-emerald-50"
    : "bg-amber-900/60 text-amber-50";
  const label = isAssistant ? "Agente IA" : "Humano";
  const labelColor = isAssistant ? "text-emerald-400" : "text-amber-400";

  return (
    <div className="flex justify-end">
      <div className={`max-w-[75%] rounded-2xl rounded-br-sm px-3.5 py-2 ${accent}`}>
        <span className={`mb-0.5 block text-[10px] font-semibold uppercase tracking-wider ${labelColor}`}>
          {label}
        </span>
        <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
        <span className="mt-1 block text-right text-[10px] opacity-60">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
