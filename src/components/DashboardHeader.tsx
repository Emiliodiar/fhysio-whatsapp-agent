"use client";

import { useState } from "react";

export default function DashboardHeader({ phone }: { phone: string | null }) {
  const [busy, setBusy] = useState(false);

  async function handleDisconnect() {
    if (!confirm("¿Seguro que quieres desconectar? Tendrás que volver a escanear el QR.")) {
      return;
    }
    setBusy(true);
    try {
      await fetch("/api/connection/disconnect", { method: "POST" });
      window.location.reload();
    } catch {
      alert("No se pudo desconectar. Inténtalo de nuevo.");
      setBusy(false);
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-5 py-3">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <span className="text-sm font-medium text-neutral-200">Agente conectado</span>
        {phone && <span className="text-sm text-neutral-500">+{phone}</span>}
      </div>
      <button
        onClick={handleDisconnect}
        disabled={busy}
        className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition hover:border-red-800 hover:text-red-400 disabled:opacity-50"
      >
        {busy ? "Desconectando..." : "Desconectar"}
      </button>
    </header>
  );
}
