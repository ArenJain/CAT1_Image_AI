
import React, { useState } from "react";

// Editable output component
function EditableFixedOutput({ fixed }: { fixed: any }) {
  const [form, setForm] = useState({
    vendor_name: fixed.vendor_name ?? "",
    vendor_address: fixed.vendor_address ?? "",
    customer_name: fixed.customer_name ?? "",
    customer_address: fixed.customer_address ?? "",
    total_amount: fixed.total_amount ?? "",
    date: fixed.date ?? "",
    items: Array.isArray(fixed.items) ? fixed.items.map((item: any) => ({
      name: item?.name ?? "",
      quantity: item?.quantity ?? ""
    })) : []
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle item change
  const handleItemChange = (idx: number, field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    }));
  };

  // Add new item
  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: "" }]
    }));
  };

  // Remove item
  const removeItem = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  // Save/submit handler (replace with API call if needed)
  const handleSave = () => {
    // You can send 'form' to your backend here
    alert("Saved!\n" + JSON.stringify(form, null, 2));
  };

  return (
    <div className="bg-white p-2 rounded mb-2 text-sm w-full border border-green-400">
      <h3 className="font-bold mb-2 text-green-700">Final Fixed Output (Editable)</h3>
      <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-2">
        <label className="flex flex-col">
          <span className="font-semibold">Vendor Name:</span>
          <input type="text" name="vendor_name" value={form.vendor_name} onChange={handleChange} className="border rounded px-2 py-1" />
        </label>
        <label className="flex flex-col">
          <span className="font-semibold">Vendor Address:</span>
          <input type="text" name="vendor_address" value={form.vendor_address} onChange={handleChange} className="border rounded px-2 py-1" />
        </label>
        <label className="flex flex-col">
          <span className="font-semibold">Customer Name:</span>
          <input type="text" name="customer_name" value={form.customer_name} onChange={handleChange} className="border rounded px-2 py-1" />
        </label>
        <label className="flex flex-col">
          <span className="font-semibold">Customer Address:</span>
          <input type="text" name="customer_address" value={form.customer_address} onChange={handleChange} className="border rounded px-2 py-1" />
        </label>
        <label className="flex flex-col">
          <span className="font-semibold">Total Amount:</span>
          <input type="number" name="total_amount" value={form.total_amount} onChange={handleChange} className="border rounded px-2 py-1" />
        </label>
        <label className="flex flex-col">
          <span className="font-semibold">Date:</span>
          <input type="text" name="date" value={form.date} onChange={handleChange} className="border rounded px-2 py-1" />
        </label>
      </div>
      {/* Items Table Editable */}
      <div className="overflow-x-auto mt-4">
        <table className="min-w-[300px] w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-green-100">
              <th className="px-2 py-1 border-b border-gray-300 text-left">Item Name</th>
              <th className="px-2 py-1 border-b border-gray-300 text-left">Quantity</th>
              <th className="px-2 py-1 border-b border-gray-300 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {form.items.length > 0 ? (
              form.items.map((item, idx) => (
                <tr key={idx} className="even:bg-green-50">
                  <td className="px-2 py-1 border-b border-gray-200">
                    <input type="text" value={item.name} onChange={e => handleItemChange(idx, "name", e.target.value)} className="border rounded px-2 py-1 w-full" />
                  </td>
                  <td className="px-2 py-1 border-b border-gray-200">
                    <input type="number" value={item.quantity} onChange={e => handleItemChange(idx, "quantity", e.target.value)} className="border rounded px-2 py-1 w-full" />
                  </td>
                  <td className="px-2 py-1 border-b border-gray-200">
                    <button className="text-red-500 text-xs" onClick={() => removeItem(idx)}>Remove</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-2 py-1 text-center text-gray-400">No items found</td>
              </tr>
            )}
          </tbody>
        </table>
        <button className="mt-2 bg-green-200 px-3 py-1 rounded" onClick={addItem}>Add Item</button>
      </div>
      <div className="mt-4 flex justify-end">
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}

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

  // Tab UI
  const tabs = [
    { label: "Raw Text", key: "raw" },
    // { label: "AI Summary", key: "summary" },
    // { label: "Structured Data", key: "structured" },
    { label: "Final Output", key: "fixed" }
  ];
  const [activeTab, setActiveTab] = useState("fixed");

  return (
    <div className="mt-6 bg-gray-100 p-4 rounded">
      <div className="mb-4 flex gap-2 border-b border-gray-300">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 font-semibold rounded-t ${activeTab === tab.key ? "bg-white border-x border-t border-gray-300 -mb-px" : "bg-gray-100 text-gray-500"}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-b p-4 min-h-[120px]">
        {activeTab === "raw" && (
          <div>
            <h3 className="font-bold mb-2">Raw Text</h3>
            <pre className="bg-gray-50 p-2 rounded mb-2 overflow-x-auto text-sm">{rawText || ""}</pre>
            <button
              className="bg-gray-300 px-3 py-1 rounded"
              onClick={() => navigator.clipboard.writeText(rawText || "")}
            >
              Copy Text
            </button>
          </div>
        )}
        {activeTab === "summary" && (
          summary ? (
            <div className="whitespace-pre-line">
              <h3 className="font-bold mb-2 text-blue-700">AI Summary</h3>
              <div>{summary}</div>
            </div>
          ) : (
            <div className="text-gray-400 italic">No summary provided by AI.</div>
          )
        )}
        {activeTab === "structured" && (
          <div>
            <h3 className="font-bold mb-2">Structured Data (AI Raw Output)</h3>
            <RenderTree data={structured} />
            <button
              className="bg-gray-300 px-3 py-1 rounded mt-2"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(structured, null, 2))}
            >
              Copy JSON
            </button>
          </div>
        )}
        {activeTab === "fixed" && fixed && (
          <EditableFixedOutput fixed={fixed} />
        )}
      </div>
      <div className="flex gap-2 mt-2">
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
