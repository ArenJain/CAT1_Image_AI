import React from "react";

const MODES = [
  { key: "ocr", label: "OCR only" },
  { key: "icr", label: "ICR only" },
  { key: "ocr-ai", label: "OCR + AI" },
  { key: "icr-ai", label: "ICR + AI" },
  { key: "vision", label: "Full Image AI" },
];

export default function ProcessingModeSelector({ mode, setMode }: { mode: string; setMode: (m: string) => void }) {
  return (
    <div className="flex gap-2 mt-2">
      {MODES.map(m => (
        <button
          key={m.key}
          className={`px-3 py-1 rounded border ${mode === m.key ? "bg-blue-600 text-white" : "bg-white"}`}
          onClick={() => setMode(m.key)}
          type="button"
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
