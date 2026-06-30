/**
 * Tool: agendar
 * Construye el link de Cal.com/Calendly con el nombre (y email) prerellenados.
 * No-op intencionado si falta CAL_BOOKING_URL: devuelve ok:false (no lanza).
 */
export const agendarDefinition = {
  type: "function" as const,
  function: {
    name: "agendar",
    description:
      "Genera el link de agenda (Cal.com/Calendly) para que el lead reserve una llamada. Úsala SOLO si calificar devolvió score >= 7.",
    parameters: {
      type: "object" as const,
      properties: {
        nombre: { type: "string", description: "Nombre del lead" },
        email: { type: "string", description: "Email del lead (opcional)" },
      },
      required: ["nombre"],
    },
  },
};

interface AgendarArgs {
  nombre?: string;
  email?: string;
  conversationId?: number;
}

export async function agendar(
  args: AgendarArgs
): Promise<Record<string, unknown>> {
  const baseUrl = process.env.CAL_BOOKING_URL;
  if (!baseUrl || !baseUrl.trim()) {
    return { ok: false, message: "Tool no configurada: falta CAL_BOOKING_URL" };
  }

  try {
    const url = new URL(baseUrl);
    if (args.nombre) url.searchParams.set("name", args.nombre);
    if (args.email) url.searchParams.set("email", args.email);
    const link = url.toString();
    return {
      ok: true,
      link,
      message: "Envía este link al lead para agendar: " + link,
    };
  } catch (e) {
    return { ok: false, message: String(e) };
  }
}
