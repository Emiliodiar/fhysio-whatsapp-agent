/**
 * Tool: derivarHumano
 * Cambia la conversación a modo HUMAN para que un operador la atienda.
 * `conversationId` NO va en el schema: lo inyecta executeTool() desde el contexto.
 */
import { setMode } from "@/lib/db";

export const derivarHumanoDefinition = {
  type: "function" as const,
  function: {
    name: "derivarHumano",
    description:
      "Deriva la conversación a una persona del equipo (modo HUMAN). Úsala si el lead pide precios específicos, plantea un caso raro, presenta una queja o pide algo fuera de tu alcance.",
    parameters: {
      type: "object" as const,
      properties: {
        razon: {
          type: "string",
          description: "Por qué se deriva. Útil para el humano.",
        },
      },
      required: ["razon"],
    },
  },
};

interface DerivarHumanoArgs {
  razon?: string;
  conversationId?: number;
}

export async function derivarHumano(
  args: DerivarHumanoArgs
): Promise<Record<string, unknown>> {
  if (!args.conversationId) {
    return {
      ok: false,
      message: "No se pudo derivar: falta conversationId (bug del wrapper de tools)",
    };
  }
  setMode(args.conversationId, "HUMAN");
  return {
    ok: true,
    message: "Conversación derivada a HUMAN. Razón: " + (args.razon ?? ""),
    instruccion:
      "Responde al usuario con algo como: 'Te paso con una persona del equipo, te escribe enseguida.' No respondas más en esta conversación.",
  };
}
