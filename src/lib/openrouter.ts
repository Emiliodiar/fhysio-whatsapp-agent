/**
 * Capa de IA: cliente del SDK `openai` apuntado a OpenRouter.
 * Singleton perezoso (no se crea hasta la primera llamada real).
 * No es streaming: usa chat.completions sin stream.
 */
import OpenAI from "openai";
import { buildSystemPrompt } from "./system-prompt";
import { toolDefinitions, executeTool } from "./tools";
import type { Message } from "./db";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error("Falta OPENROUTER_API_KEY. Ejecuta /setup.");
  }
  _client = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://github.com/divisualproject/whatsapp-ai-agent-kit",
      "X-Title": "WhatsApp AI Agent Kit",
    },
  });
  return _client;
}

const MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
const MAX_TURNS = 5;

/**
 * Valida la API key con una llamada que NO consume tokens de chat
 * (lista de modelos). La usa /setup y el wizard.
 */
export async function validateApiKey(): Promise<{ ok: boolean; error?: string }> {
  try {
    await getClient().models.list();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/**
 * Genera la respuesta del agente para una conversación.
 * Resuelve tool calls en un bucle de hasta MAX_TURNS iteraciones.
 */
export async function generateReply(input: {
  history: Message[];
  conversationId: number;
}): Promise<string> {
  const client = getClient();

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt() },
    ...input.history.map((m) => ({
      // Los mensajes 'human' (operador) del historial se presentan al LLM como
      // 'assistant' (respuestas propias previas). NO mapear a 'user'.
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.content,
    })),
  ];

  let turns = 0;
  while (turns < MAX_TURNS) {
    const res = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools: toolDefinitions as unknown as OpenAI.Chat.Completions.ChatCompletionTool[],
      tool_choice: "auto",
      temperature: 0.4,
    });

    const msg = res.choices[0].message;

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return msg.content ?? "";
    }

    // Empuja el turno del assistant con sus tool_calls.
    messages.push({
      role: "assistant",
      content: msg.content ?? "",
      tool_calls: msg.tool_calls,
    });

    for (const call of msg.tool_calls) {
      if (call.type !== "function") continue;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function.arguments);
      } catch {
        args = {};
      }
      const result = await executeTool(call.function.name, args, {
        conversationId: input.conversationId,
      });
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }

    turns++;
  }

  return "Déjame un momento — vuelvo contigo enseguida.";
}
