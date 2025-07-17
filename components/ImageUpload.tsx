"use client";
import { useRef, useState } from "react";
import ProcessingModeSelector from "./ProcessingModeSelector";
import ExtractionResult from "./ExtractionResult";
import { runOcrFromDataUrl } from "../utils/ocrUtil";

const MODES = [
  { key: "ocr", label: "OCR only" },
  { key: "icr", label: "ICR only" },
  { key: "ocr-ai", label: "OCR + AI" },
  { key: "icr-ai", label: "ICR + AI" },
  { key: "vision", label: "Full Image AI" },
];

export default function ImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState(MODES[0].key);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    if (mode === "ocr" || mode === "icr") {
      // Run OCR/ICR in browser
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const rawText = await runOcrFromDataUrl(dataUrl);
        setResult({ rawText, jsonResult: { extracted: rawText } });
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } else if (mode === "ocr-ai" || mode === "icr-ai") {
      // Run OCR/ICR in browser, then send rawText + image to server for AI
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const rawText = await runOcrFromDataUrl(dataUrl);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("mode", mode);
        formData.append("rawText", rawText);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        setResult(data);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } else {
      // For vision mode, send image to server
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="border-2 border-dashed rounded p-6 text-center cursor-pointer mb-4 bg-white"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        {file ? (
          <div>{file.name}</div>
        ) : (
          <div>Drag & drop or click to select an image</div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <ProcessingModeSelector mode={mode} setMode={setMode} />
      <button
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleUpload}
        disabled={!file || loading}
      >
        {loading ? "Processing..." : "Process Image"}
      </button>
      {result && <ExtractionResult result={result} />}
    </div>
  );
}
