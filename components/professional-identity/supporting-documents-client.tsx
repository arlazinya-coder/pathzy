"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { appRoutes } from "@/lib/navigation/routes";

type SupportingDocument = {
  id: string;
  title: string;
  content: string;
  contentJson?: Record<string, unknown> | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const categories = [
  "Certifications",
  "Diplomas",
  "Degrees",
  "Academic Transcripts",
  "Portfolio",
  "Awards",
  "Licences",
  "Recommendation Letters",
  "Other Supporting Documents"
];

const allowedTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "text/plain"
]);

function metadataText(file: File, category: string) {
  return [`Category: ${category}`, `File name: ${file.name}`, `File type: ${file.type || "Unknown"}`, `File size: ${Math.round(file.size / 1024)} KB`, `Uploaded: ${new Date().toLocaleString()}`].join("\n");
}

export function SupportingDocumentsClient({ initialDocuments }: { initialDocuments: SupportingDocument[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedId, setSelectedId] = useState(initialDocuments[0]?.id ?? "");
  const [category, setCategory] = useState(categories[0]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const selected = useMemo(() => documents.find((document) => document.id === selectedId) ?? documents[0] ?? null, [documents, selectedId]);

  function validateFile(file: File) {
    if (!allowedTypes.has(file.type)) return "Unsupported file type. Upload PDF, DOCX, PNG, JPG, JPEG, or TXT.";
    if (file.size > 10 * 1024 * 1024) return "This file is too large. Upload a file smaller than 10MB.";
    if (file.size === 0) return "This file looks blank. Please choose another file.";
    return "";
  }

  async function upload(file: File | null, replaceId?: string) {
    if (!file) return;
    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (replaceId) {
        const nextContent = metadataText(file, category);
        const response = await fetch("/api/professional-identity", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: replaceId, tool: "supporting-document", title: file.name, content: nextContent, status: "ready" })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Could not replace this document.");
        setDocuments((current) => current.map((document) => document.id === replaceId ? { ...document, title: file.name, content: nextContent, updated_at: new Date().toISOString(), status: "ready" } : document));
        setNotice("Document replaced.");
        return;
      }

      const response = await fetch("/api/professional-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "supporting-document",
          upload: {
            documentType: "supporting_document",
            title: file.name,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            content: metadataText(file, category),
            status: "ready"
          }
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not upload this document.");
      const created = {
        id: data.document.id,
        title: data.document.title,
        content: data.document.content,
        contentJson: data.document.contentJson,
        status: data.document.status,
        created_at: data.document.created_at,
        updated_at: data.document.updated_at
      };
      setDocuments((current) => [created, ...current]);
      setSelectedId(created.id);
      setNotice("Supporting document saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save this document.");
    } finally {
      setSaving(false);
    }
  }

  async function rename(title: string) {
    if (!selected) return;
    setDocuments((current) => current.map((document) => document.id === selected.id ? { ...document, title } : document));
    const response = await fetch("/api/professional-identity", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, tool: "supporting-document", title, content: selected.content })
    });
    if (response.ok) setNotice("Renamed.");
  }

  async function deleteDocument() {
    if (!selected) return;
    const response = await fetch(`/api/professional-identity?id=${encodeURIComponent(selected.id)}&tool=supporting-document`, { method: "DELETE" });
    if (!response.ok) {
      setError("Could not delete this document.");
      return;
    }
    const remaining = documents.filter((document) => document.id !== selected.id);
    setDocuments(remaining);
    setSelectedId(remaining[0]?.id ?? "");
    setNotice("Deleted.");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[.4fr_1fr]">
      <Card className="h-fit">
        <h2 className="text-2xl font-black">Supporting Documents</h2>
        <p className="mt-3 text-sm leading-6 text-white/58">Upload employment proof you may use across CVs, Career Passport, and applications.</p>
        <label className="label mt-5">
          Document type
          <select className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <input className="mt-4 block w-full text-sm text-white/62 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-extrabold file:text-white" type="file" accept=".pdf,.docx,.png,.jpg,.jpeg,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,text/plain" onChange={(event) => upload(event.target.files?.[0] ?? null)} />
        {saving ? <p className="mt-4 rounded-[16px] border border-[#5B8CFF]/25 bg-[#5B8CFF]/10 px-4 py-3 text-sm font-bold text-[#c7d6ff]">Saving...</p> : null}
        {notice ? <p className="mt-4 rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold text-[#b9f8d5]">{notice}</p> : null}
        {error ? <p className="mt-4 rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc5c5]">{error}</p> : null}
        <div className="mt-5 grid gap-2">
          {documents.map((document) => (
            <button key={document.id} onClick={() => setSelectedId(document.id)} className={`rounded-[18px] border p-4 text-left transition ${selected?.id === document.id ? "border-[#5B8CFF]/50 bg-[#5B8CFF]/12" : "border-white/10 bg-white/7 hover:bg-white/10"}`}>
              <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">{document.status ?? "ready"}</span>
              <strong className="mt-2 block">{document.title}</strong>
            </button>
          ))}
        </div>
      </Card>
      <Card>
        {selected ? (
          <>
            <label className="label">
              Rename document
              <input className="field" value={selected.title} onChange={(event) => rename(event.target.value)} />
            </label>
            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/6 p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Preview</p>
              <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/72">{selected.content}</pre>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <label className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82">
                Replace
                <input className="hidden" type="file" accept=".pdf,.docx,.png,.jpg,.jpeg,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,text/plain" onChange={(event) => upload(event.target.files?.[0] ?? null, selected.id)} />
              </label>
              <button onClick={deleteDocument} className="rounded-full border border-[#ff6b6b]/25 bg-[#ff6b6b]/10 px-5 py-3 text-sm font-extrabold text-[#ffc5c5]">Delete</button>
              <Link href={appRoutes.professionalIdentity} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82">Back to My Professional Profile</Link>
              <Link href={appRoutes.roadmap} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82">Back to My Employment Journey</Link>
            </div>
          </>
        ) : (
          <div className="grid min-h-[420px] place-items-center text-center">
            <div>
              <h2 className="text-2xl font-black">No supporting documents yet.</h2>
              <p className="mt-3 max-w-md text-white/58">Upload certificates, diplomas, portfolio proof, awards, licences, or recommendation letters when ready.</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
