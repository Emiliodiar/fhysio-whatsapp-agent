/**
 * Registro central de las tools del agente.
 * - toolDefinitions: schemas que se pasan al LLM (tool_choice "auto").
 * - executeTool: despacha por nombre e inyecta SIEMPRE el conversationId.
 */
import { guardarLead, guardarLeadDefinition } from "./guardar-lead";
import { calificar, calificarDefinition } from "./calificar";
import { agendar, agendarDefinition } from "./agendar";
import { derivarHumano, derivarHumanoDefinition } from "./derivar-humano";

export type ToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
};

type GenericHandler = (
  args: Record<string, unknown> & { conversationId?: number }
) => Promise<Record<string, unknown>>;

export const toolDefinitions: ToolDefinition[] = [
  guardarLeadDefinition,
  calificarDefinition,
  agendarDefinition,
  derivarHumanoDefinition,
];

// Claves = nombres EXACTOS de las tools (deben coincidir con los schemas).
const handlers: Record<string, GenericHandler> = {
  guardarLead: guardarLead as GenericHandler,
  calificar: calificar as GenericHandler,
  agendar: agendar as GenericHandler,
  derivarHumano: derivarHumano as GenericHandler,
};

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  context: { conversationId: number }
): Promise<Record<string, unknown>> {
  const handler = handlers[toolName];
  if (!handler) {
    return { ok: false, message: "Tool desconocida: " + toolName };
  }
  return handler({ ...args, conversationId: context.conversationId });
}
