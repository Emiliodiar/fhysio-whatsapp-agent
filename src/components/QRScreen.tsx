"use client";

import { useEffect, useState } from "react";

type Status = "disconnected" | "qr" | "connecting" | "connected" | "unknown";

const STATUS_MESSAGE: Record<Status, string> = {
  connecting: "Conectando...",
  disconnected: "Esperando al bot...",
  unknown: "Cargando...",
  qr: "Generando QR...",
  connected: "Conectado",
};

export default function QRScreen({
  status,
  qrPng,
}: {
  status: Status;
  qrPng: string | null;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const expired = elapsed > 60;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
        <h1 className="mb-1 text-center text-xl font-semibold">Conectar WhatsApp</h1>
        <p className="mb-6 text-center text-sm text-neutral-400">
          Vincula tu número para activar el agente.
        </p>

        <div className="mb-6 flex items-center justify-center">
          {qrPng ? (
            <div className="rounded-xl bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrPng} alt="Código QR de WhatsApp" width={280} height={280} />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-700 border-t-emerald-400" />
              <span className="text-sm text-neutral-400">
                {STATUS_MESSAGE[status] ?? "Cargando..."}
              </span>
            </div>
          )}
        </div>

        {qrPng && expired && (
          <div className="mb-4 rounded-lg border border-amber-900 bg-amber-950/40 p-3 text-center text-sm text-amber-300">
            El QR puede haber caducado. Si no conecta, recarga la página para
            generar uno nuevo.
          </div>
        )}

        <ol className="space-y-2 text-sm text-neutral-400">
          <li>1. Abre WhatsApp en tu teléfono.</li>
          <li>2. Ve a Ajustes → Dispositivos vinculados.</li>
          <li>3. Toca &quot;Vincular un dispositivo&quot;.</li>
          <li>4. Escanea este código QR.</li>
        </ol>
      </div>
    </main>
  );
}
