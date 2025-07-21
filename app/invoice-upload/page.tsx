"use client";
import React, { useState } from "react";
import ExtractionResult from "../../components/ExtractionResult";
// @ts-ignore
import Tesseract from "tesseract.js";

export default function InvoiceUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [mode, setMode] = useState<string>("vision");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rawText, setRawText] = useState("");

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setPreviewUrl("");
    }
    setResult(null);
  };

  // Handle mode change
  const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMode(e.target.value);
    setResult(null);
  };

  // Handle upload and process
  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    let ocrText = rawText;
    if (mode === "ocr-ai" || mode === "icr-ai") {
      // Run OCR before sending to backend
      try {
        const { data } = await Tesseract.recognize(file, "eng", {
          workerPath: "/tesseract-worker/worker.min.js"
        });
        ocrText = data.text;
      } catch (err) {
        ocrText = "";
      }
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);
    if (mode === "ocr-ai" || mode === "icr-ai") {
      formData.append("rawText", ocrText);
    }
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <h1 className="text-3xl font-extrabold mb-8 text-blue-700 text-center drop-shadow">Invoice Upload & AI Extraction</h1>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
        {/* Left: Upload & Image Preview */}
        <div className="md:w-1/2 w-full max-w-lg bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6 border border-blue-100">
          <div>
            <label className="font-semibold text-lg text-blue-700 mb-2 block">Upload Invoice Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          {previewUrl && (
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-500 mb-1">Preview</span>
              <img src={previewUrl} alt="Preview" className="border-2 border-blue-200 rounded-lg max-h-[500px] w-full object-contain shadow" />
            </div>
          )}
          <div>
            <label className="font-semibold text-lg text-blue-700 mb-2 block">Processing AI Mode</label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="mode" value="ocr-ai" checked={mode === "ocr-ai"} onChange={handleModeChange} className="accent-blue-600" />
                <span className="text-blue-600 font-medium">Basic</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="mode" value="vision" checked={mode === "vision"} onChange={handleModeChange} className="accent-blue-600" />
                <span className="text-blue-600 font-medium">Advance</span>
              </label>
            </div>
          </div>
          {/* No raw OCR textarea or button shown for OCR+AI mode */}
          <button
            className="mt-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg shadow hover:scale-105 transition-transform disabled:opacity-50 font-semibold text-lg"
            onClick={handleProcess}
            disabled={!file || loading}
          >
            {loading ? (
              <span className="flex items-center gap-2"><span className="animate-spin h-5 w-5 border-2 border-white border-t-blue-300 rounded-full inline-block"></span> Processing...</span>
            ) : "Process Image"}
          </button>
        </div>
        {/* Right: Editable Result */}
        <div className="md:w-1/2 w-full max-w-xl bg-white rounded-xl shadow-lg p-6 border border-green-100">
          {result ? (
            <ExtractionResult result={result} />
          ) : (
            <div className="text-gray-400 italic mt-12 text-center">Processed result will appear here.</div>
          )}
        </div>
      </div>
    </div>
  );
}
