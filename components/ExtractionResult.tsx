
import React, { useState } from "react";

function RenderTree({ data, level = 0 }: { data: any; level?: number }) {
  const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({});
  if (typeof data !== "object" || data === null) {
    return <span className="text-blue-800">{String(data)}</span>;
  }
  return (
    <div style={{ paddingLeft: level * 16 }}>
      {Object.entries(data).map(([key, value]) => {
        const isObject = typeof value === "object" && value !== null;
        const isArray = Array.isArray(value);
        const collapsedKey = `${level}-${key}`;
        return (
          <div key={collapsedKey} className="mb-1">
            <span className="font-semibold text-gray-700">
              {isObject ? (
                <button
                  className="mr-1 text-xs text-blue-600 underline"
                  onClick={() => setCollapsed((c) => ({ ...c, [collapsedKey]: !c[collapsedKey] }))}
                  type="button"
                >
                  {collapsed[collapsedKey] ? "+" : "-"}
                </button>
              ) : null}
              {key}
            </span>
            <span className="text-gray-400 mx-1">:</span>
            {isObject ? (
              collapsed[collapsedKey] ? (
                <span className="italic text-gray-400">{isArray ? "[Array]" : "{Object}"}</span>
              ) : (
                <RenderTree data={value} level={level + 1} />
              )
            ) : (
              <span className="text-blue-800">{String(value)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}



export default function ExtractionResult({ result }: { result: any }) {
  if (!result) return null;
  const { rawText, jsonResult } = result;
  // Try to extract summary from multiple possible locations
  let summary = jsonResult?.summary;
  let structured = jsonResult?.structured ?? jsonResult?.extracted ?? jsonResult;
  let fixed = jsonResult?.structured ?? jsonResult?.extracted ?? jsonResult;

  // If summary is missing, try to find it in a stringified object
  if (!summary && typeof jsonResult === "string") {
    try {
      const parsed = JSON.parse(jsonResult);
      summary = parsed.summary;
      structured = parsed.structured ?? parsed;
      fixed = parsed.fixed ?? null;
    } catch {}
  }
  // If summary is still missing, try inside structured
  if (!summary && typeof structured === "object" && structured?.summary) {
    summary = structured.summary;
    delete structured.summary;
  }

  return (
    <div className="mt-6 bg-gray-100 p-4 rounded">
      <h3 className="font-bold mb-2">Raw Text</h3>
      <pre className="bg-white p-2 rounded mb-2 overflow-x-auto text-sm">{rawText || ""}</pre>
      <div className="flex flex-col gap-4">
        {summary ? (
          <div className="bg-white p-2 rounded mb-2 text-sm whitespace-pre-line border border-blue-200">
            <h3 className="font-bold mb-2 text-blue-700">AI Summary</h3>
            <div>{summary}</div>
          </div>
        ) : (
          <div className="bg-white p-2 rounded mb-2 text-sm border border-blue-100 text-gray-400 italic">No summary provided by AI.</div>
        )}
        <div className="bg-white p-2 rounded mb-2 text-sm w-full border border-gray-200">
          <h3 className="font-bold mb-2">Structured Data (AI Raw Output)</h3>
          <RenderTree data={structured} />
        </div>
        {fixed && (
          <div className="bg-white p-2 rounded mb-2 text-sm w-full border border-green-400">
            <h3 className="font-bold mb-2 text-green-700">Final Fixed Output</h3>
            {/* Show main fields */}
            <div className="mb-2">
              <div><span className="font-semibold">Vendor Name:</span> {fixed.vendor_name || <span className="text-gray-400">N/A</span>}</div>
              <div><span className="font-semibold">Vendor Address:</span> {fixed.vendor_address || <span className="text-gray-400">N/A</span>}</div>
              <div><span className="font-semibold">Customer Name:</span> {fixed.customer_name || <span className="text-gray-400">N/A</span>}</div>
              <div><span className="font-semibold">Customer Address:</span> {fixed.customer_address || <span className="text-gray-400">N/A</span>}</div>
              <div><span className="font-semibold">Total Amount:</span> {fixed.total_amount || <span className="text-gray-400">N/A</span>}</div>
              <div><span className="font-semibold">Date:</span> {fixed.date || <span className="text-gray-400">N/A</span>}</div>
            </div>
            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="min-w-[300px] w-full border border-gray-300 rounded">
                <thead>
                  <tr className="bg-green-100">
                    <th className="px-2 py-1 border-b border-gray-300 text-left">Item Name</th>
                    <th className="px-2 py-1 border-b border-gray-300 text-left">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(fixed.items) && fixed.items.length > 0 ? (
                    fixed.items.map((item: any, idx: number) => (
                      <tr key={idx} className="even:bg-green-50">
                        <td className="px-2 py-1 border-b border-gray-200">{item.name || <span className="text-gray-400">N/A</span>}</td>
                        <td className="px-2 py-1 border-b border-gray-200">{item.quantity || <span className="text-gray-400">N/A</span>}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-2 py-1 text-center text-gray-400">No items found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="bg-gray-300 px-3 py-1 rounded"
          onClick={() => navigator.clipboard.writeText(rawText || "")}
        >
          Copy Text
        </button>
        <button
          className="bg-gray-300 px-3 py-1 rounded"
          onClick={() => navigator.clipboard.writeText(JSON.stringify(jsonResult, null, 2))}
        >
          Copy JSON
        </button>
        <a
          href={`data:application/json,${encodeURIComponent(JSON.stringify(jsonResult, null, 2))}`}
          download="extracted.json"
          className="bg-gray-300 px-3 py-1 rounded"
        >
          Download JSON
        </a>
      </div>
    </div>
  );
}
