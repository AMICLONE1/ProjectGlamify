"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { clientsApi, type ImportClientRow, type ImportClientResult } from "@/lib/api-client";

// Fields we import into. `key` matches ImportClientRow.
const FIELDS = [
  { key: "fullName", label: "Name", required: true },
  { key: "phone", label: "Phone", required: false },
  { key: "email", label: "Email", required: false },
  { key: "gender", label: "Gender", required: false },
  { key: "notes", label: "Notes", required: false },
] as const;
type FieldKey = (typeof FIELDS)[number]["key"];

// Header keywords → field. Used to auto-guess the mapping.
const AUTO_MATCH: Record<FieldKey, string[]> = {
  fullName: ["name", "client", "customer", "full name", "fullname"],
  phone: ["phone", "mobile", "contact", "number", "whatsapp", "cell"],
  email: ["email", "e-mail", "mail"],
  gender: ["gender", "sex"],
  notes: ["note", "notes", "remark", "comment", "detail"],
};

type ParsedSheet = { headers: string[]; rows: Record<string, string>[] };

function guessMapping(headers: string[]): Record<FieldKey, string> {
  const map = {} as Record<FieldKey, string>;
  for (const f of FIELDS) {
    const hit = headers.find((h) =>
      AUTO_MATCH[f.key].some((kw) => h.toLowerCase().trim().includes(kw))
    );
    map[f.key] = hit ?? "";
  }
  return map;
}

export function ImportClientsModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<Record<FieldKey, string>>({} as Record<FieldKey, string>);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportClientResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "", raw: false });
        if (!json.length) { setError("That file has no rows."); return; }
        const headers = Object.keys(json[0]);
        setSheet({ headers, rows: json });
        setMapping(guessMapping(headers));
      } catch {
        setError("Could not read that file. Use a .xlsx or .csv file.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function buildRows(): ImportClientRow[] {
    if (!sheet) return [];
    return sheet.rows
      .map((row) => {
        const get = (k: FieldKey) => (mapping[k] ? String(row[mapping[k]] ?? "").trim() : "");
        return {
          fullName: get("fullName"),
          phone: get("phone"),
          email: get("email"),
          gender: get("gender"),
          notes: get("notes"),
        };
      })
      .filter((r) => r.fullName.length > 0);
  }

  const preview = buildRows();
  const canImport = !!mapping.fullName && preview.length > 0;

  async function runImport() {
    setImporting(true); setError(null);
    try {
      const res = await clientsApi.import(buildRows());
      setResult(res);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Name", "Phone", "Email", "Gender", "Notes"],
      ["Priya Sharma", "9876543210", "priya@example.com", "Female", "Prefers morning slots"],
      ["Rahul Verma", "9123456780", "", "Male", "Regular — beard trim"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    XLSX.writeFile(wb, "clitell-clients-template.xlsx");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <div className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-biz-surface p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-biz-ink">Import clients</h2>
            <p className="text-sm text-biz-muted">Upload your client list from Excel or CSV.</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-biz-bg text-biz-muted hover:text-biz-ink">✕</button>
        </div>

        {/* RESULT */}
        {result ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-biz-green-400/10 p-5 text-center">
              <p className="text-2xl font-bold text-biz-green-600">Done! 🎉</p>
              <p className="mt-2 text-sm text-biz-ink">
                <strong>{result.created}</strong> new · <strong>{result.updated}</strong> updated · <strong>{result.skipped}</strong> skipped
              </p>
            </div>
            {result.errors.length > 0 && (
              <div className="rounded-xl bg-biz-orange-300/15 p-3 text-xs text-biz-orange-700">
                <p className="mb-1 font-semibold">Some rows had issues:</p>
                <ul className="list-disc pl-4">{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
            )}
            <button onClick={onClose} className="w-full rounded-2xl bg-biz-violet-500 py-2.5 text-sm font-semibold text-white hover:bg-biz-violet-600">Close</button>
          </div>
        ) : !sheet ? (
          /* STEP 1 — upload */
          <div className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-biz-border bg-biz-bg py-10 transition-colors hover:border-biz-violet-300"
            >
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none" className="mb-2 text-biz-muted"><path d="M14 5v14M7 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 22h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              <p className="text-sm font-semibold text-biz-ink">Click to upload Excel or CSV</p>
              <p className="text-xs text-biz-muted">.xlsx or .csv · up to 5000 clients</p>
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
            {error && <p className="text-sm text-biz-pink-500">{error}</p>}
            <div className="flex items-center justify-between rounded-xl bg-biz-bg px-4 py-3 text-sm">
              <span className="text-biz-muted">First time? Use our template.</span>
              <button onClick={downloadTemplate} className="font-semibold text-biz-violet-600 hover:text-biz-violet-700">Download template ↓</button>
            </div>
          </div>
        ) : (
          /* STEP 2 — map columns + preview */
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-biz-muted-2">Match your columns</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {FIELDS.map((f) => (
                  <label key={f.key} className="flex items-center gap-2 text-sm">
                    <span className="w-20 shrink-0 text-biz-muted">{f.label}{f.required && " *"}</span>
                    <select
                      value={mapping[f.key] ?? ""}
                      onChange={(e) => setMapping((m) => ({ ...m, [f.key]: e.target.value }))}
                      className="flex-1 rounded-lg border border-biz-border bg-white px-2 py-1.5 text-sm text-biz-ink focus:outline-none"
                    >
                      <option value="">— skip —</option>
                      {sheet.headers.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </label>
                ))}
              </div>
              {!mapping.fullName && <p className="mt-2 text-xs text-biz-pink-500">Map the Name column to continue.</p>}
            </div>

            {/* Preview */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-biz-muted-2">
                Preview — {preview.length} client{preview.length === 1 ? "" : "s"} ready
              </p>
              <div className="max-h-52 overflow-auto rounded-xl border border-biz-border">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-biz-bg text-biz-muted-2">
                    <tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">Phone</th><th className="px-3 py-2">Email</th></tr>
                  </thead>
                  <tbody className="divide-y divide-biz-border">
                    {preview.slice(0, 50).map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-1.5 text-biz-ink">{r.fullName}</td>
                        <td className="px-3 py-1.5 text-biz-muted">{r.phone || "—"}</td>
                        <td className="px-3 py-1.5 text-biz-muted">{r.email || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.length > 50 && <p className="mt-1 text-[11px] text-biz-muted-2">…and {preview.length - 50} more</p>}
            </div>

            {error && <p className="text-sm text-biz-pink-500">{error}</p>}

            <div className="flex gap-2">
              <button onClick={() => { setSheet(null); setError(null); }} className="rounded-2xl border border-biz-border px-4 py-2.5 text-sm font-semibold text-biz-muted hover:bg-biz-bg">Back</button>
              <button
                onClick={runImport}
                disabled={!canImport || importing}
                className="flex-1 rounded-2xl bg-biz-violet-500 py-2.5 text-sm font-semibold text-white hover:bg-biz-violet-600 disabled:opacity-40"
              >
                {importing ? "Importing…" : `Import ${preview.length} client${preview.length === 1 ? "" : "s"}`}
              </button>
            </div>
            <p className="text-[11px] text-biz-muted-2">Clients with a matching phone number will be updated, not duplicated.</p>
          </div>
        )}
      </div>
    </div>
  );
}
