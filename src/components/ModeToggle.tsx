"use client";

export default function ModeToggle({
  mode,
  onChange,
}: {
  mode: "AI" | "HUMAN";
  onChange: (mode: "AI" | "HUMAN") => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-neutral-700 p-0.5">
      <button
        onClick={() => onChange("AI")}
        className={`rounded-md px-3 py-1 text-xs font-medium transition ${
          mode === "AI"
            ? "bg-emerald-600 text-white"
            : "text-neutral-400 hover:text-neutral-200"
        }`}
      >
        Modo IA
      </button>
      <button
        onClick={() => onChange("HUMAN")}
        className={`rounded-md px-3 py-1 text-xs font-medium transition ${
          mode === "HUMAN"
            ? "bg-amber-600 text-white"
            : "text-neutral-400 hover:text-neutral-200"
        }`}
      >
        Modo Humano
      </button>
    </div>
  );
}
