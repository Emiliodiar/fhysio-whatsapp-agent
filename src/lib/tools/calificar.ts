/**
 * Tool: calificar
 * Calcula un score 0-10 a partir de criterios booleanos y decide si el lead
 * está cualificado (score >= 7). El umbral 7 está hardcodeado y también se
 * referencia en el system prompt (system-prompt.ts).
 */
export const calificarDefinition = {
  type: "function" as const,
  function: {
    name: "calificar",
    description:
      "Califica al lead según criterios booleanos y devuelve un score 0-10. Úsala cuando ya tengas los datos clave. agendar SOLO procede si el score es >= 7.",
    parameters: {
      type: "object" as const,
      properties: {
        tieneNegocioActivo: {
          type: "boolean",
          description: "¿Tiene un negocio en marcha?",
        },
        facturaMasDe5kMes: {
          type: "boolean",
          description: "¿Factura más de 5.000 € al mes?",
        },
        dolorEncajaConPropuesta: {
          type: "boolean",
          description: "¿Su dolor encaja con la propuesta de valor del negocio?",
        },
        urgenciaAlta: {
          type: "boolean",
          description: "¿Tiene urgencia alta por resolverlo?",
        },
        presupuestoConfirmado: {
          type: "boolean",
          description: "¿Ha confirmado que tiene presupuesto?",
        },
      },
      // ninguno required: el modelo aporta lo que sepa.
    },
  },
};

interface CalificarArgs {
  tieneNegocioActivo?: boolean;
  facturaMasDe5kMes?: boolean;
  dolorEncajaConPropuesta?: boolean;
  urgenciaAlta?: boolean;
  presupuestoConfirmado?: boolean;
  conversationId?: number;
}

export async function calificar(
  args: CalificarArgs
): Promise<Record<string, unknown>> {
  // TODO: pesos por defecto pensados para agencia/freelance. Ajustables al
  // modelo de negocio concreto si hace falta.
  let score = 0;
  if (args.tieneNegocioActivo) score += 3;
  if (args.facturaMasDe5kMes) score += 3;
  if (args.dolorEncajaConPropuesta) score += 2;
  if (args.urgenciaAlta) score += 1;
  if (args.presupuestoConfirmado) score += 1;
  // máximo 10

  const califica = score >= 7;
  return {
    ok: true,
    score,
    califica,
    mensaje: califica
      ? "Lead cualificado. Procede a agendar llamada."
      : "Lead NO cualificado. Responde cordialmente sin agendar.",
  };
}
