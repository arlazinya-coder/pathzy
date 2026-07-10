"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type ProfileActionRow = {
  label: string;
  value: string;
  section: string;
  fields: Array<{
    name: string;
    label: string;
    value: string;
    type?: "text" | "textarea";
  }>;
  href?: string;
};

function rowStatus(value: string) {
  return value.trim() ? "Ready" : "Missing";
}

export function ProfileActionEditor({ rows }: { rows: ProfileActionRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const activeRow = useMemo(() => rows.find((row) => row.section === editing) ?? null, [editing, rows]);

  function openEditor(row: ProfileActionRow) {
    setError("");
    setEditing(row.section);
    setDraft(Object.fromEntries(row.fields.map((field) => [field.name, field.value])));
  }

  function cancel() {
    setEditing(null);
    setDraft({});
    setError("");
  }

  async function save() {
    if (!activeRow) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/professional-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: activeRow.section, values: draft })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We could not save this information yet.");
      setEditing(null);
      setDraft({});
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not save this information yet.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => {
        const cleanValue = row.value.trim();
        const status = rowStatus(cleanValue);
        const isEditing = editing === row.section;
        return (
          <div key={row.label} className="rounded-[18px] border border-white/10 bg-white/6 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/38">{row.label}</p>
                <p className={`mt-2 text-sm leading-6 ${cleanValue ? "text-white/72" : "text-[#ffe2a8]"}`}>{cleanValue || "Missing - add this when available"}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${status === "Ready" ? "bg-[#39d98a]/12 text-[#b9f8d5]" : "bg-[#f8c45d]/12 text-[#ffe2a8]"}`}>{status}</span>
            </div>

            {isEditing ? (
              <div className="mt-4 grid gap-3 rounded-[16px] border border-[#5B8CFF]/25 bg-[#5B8CFF]/10 p-3">
                {activeRow?.fields.map((field) => (
                  <label key={field.name} className="label">
                    {field.label}
                    {field.type === "textarea" ? (
                      <textarea className="field min-h-[96px]" value={draft[field.name] ?? ""} onChange={(event) => setDraft((current) => ({ ...current, [field.name]: event.target.value }))} />
                    ) : (
                      <input className="field" value={draft[field.name] ?? ""} onChange={(event) => setDraft((current) => ({ ...current, [field.name]: event.target.value }))} />
                    )}
                  </label>
                ))}
                {error ? <p className="rounded-[14px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-3 py-2 text-sm text-[#ffc5c5]">{error}</p> : null}
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={save} disabled={saving} className="rounded-full blue-purple px-4 py-2 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
                  <button type="button" onClick={cancel} disabled={saving} className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-extrabold text-white/76 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                {row.href ? (
                  <Link href={row.href} className="inline-flex rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-extrabold text-white/82">Open Documents</Link>
                ) : (
                  <button type="button" onClick={() => openEditor(row)} className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-extrabold text-white/82">
                    {cleanValue ? "Edit" : "Add missing info"}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      <div className="rounded-[18px] border border-white/10 bg-white/6 p-4 md:col-span-2 xl:col-span-3">
        <p className="text-sm font-extrabold text-[#c7d6ff]">Save returns here with your updated information. Cancel keeps your current information unchanged.</p>
      </div>
    </div>
  );
}
