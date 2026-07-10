"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { PremiumUpgradeCard } from "@/components/upgrade/premium-upgrade-card";
import { cvModelFromUnknown, downloadBlob, normalizeCvModelForExport, pathzyFilename, renderCvHtmlFromModel, simplePdfDocument, simplePdfDocumentFromModel } from "@/components/professional-identity/document-downloads";
import { documentTemplateGallery, normalizeDocumentTemplate } from "@/lib/professional-identity/document-template-engine";

type DocumentTool = "cv" | "cover-letter" | "linkedin" | "recruiter-message" | "follow-up" | "career-passport" | "uploaded-document" | "supporting-document";

type SavedDocument = {
  id: string;
  tool: DocumentTool;
  title: string;
  content: string;
  contentJson?: Record<string, unknown> | null;
  template_name?: string | null;
  status?: string | null;
  version_number?: number | null;
  last_downloaded_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

const cvDesignSystems = documentTemplateGallery.map((template) => template.name);

type CvVersionMetadata = {
  designSystem: string;
  versionName: string;
  createdAt: string;
  updatedAt: string;
  lastDownloadedAt: string | null;
};

function cvVersionFromDocument(document: SavedDocument | null): CvVersionMetadata {
  const raw = document?.contentJson?.cvVersion;
  const source = raw && typeof raw === "object" ? raw as Partial<CvVersionMetadata> : {};
  const now = new Date().toISOString();
  const designSystem = normalizeDocumentTemplate(typeof source.designSystem === "string" && source.designSystem.trim()
    ? source.designSystem
    : document?.template_name || "Modern ATS");
  return {
    designSystem,
    versionName: typeof source.versionName === "string" && source.versionName.trim() ? source.versionName : document?.title || `${designSystem} CV`,
    createdAt: typeof source.createdAt === "string" && source.createdAt ? source.createdAt : document?.created_at || now,
    updatedAt: typeof source.updatedAt === "string" && source.updatedAt ? source.updatedAt : document?.updated_at || now,
    lastDownloadedAt: typeof source.lastDownloadedAt === "string" && source.lastDownloadedAt ? source.lastDownloadedAt : document?.last_downloaded_at || null
  };
}

const labels: Record<DocumentTool, string> = {
  cv: "CV",
  "cover-letter": "Cover Letter",
  linkedin: "LinkedIn Profile",
  "recruiter-message": "Recruiter Message",
  "follow-up": "Follow-up Email",
  "career-passport": "Career Passport",
  "uploaded-document": "Uploaded Document",
  "supporting-document": "Supporting Document"
};

export function MyDocumentsClient({ initialDocuments, canExport = false }: { initialDocuments: SavedDocument[]; canExport?: boolean }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedId, setSelectedId] = useState(initialDocuments[0]?.id ?? "");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selected = useMemo(() => documents.find((document) => document.id === selectedId) ?? documents[0] ?? null, [documents, selectedId]);
  const selectedCvModel = useMemo(() => selected?.tool === "cv" ? cvModelFromUnknown(selected.contentJson?.cvModel, selected.content) : null, [selected]);
  const selectedCvVersion = useMemo(() => selected?.tool === "cv" ? cvVersionFromDocument(selected) : null, [selected]);

  const grouped = useMemo(() => {
    const categories = ["cv", "cover-letter", "linkedin", "recruiter-message", "follow-up", "career-passport", "uploaded-document", "supporting-document"] as const;
    return categories.map((category) => ({ category, documents: documents.filter((document) => document.tool === category) })).filter((group) => group.documents.length);
  }, [documents]);

  useEffect(() => {
    function warnBeforeLeave(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [dirty]);

  async function copyText() {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.content);
    setNotice("Copied.");
  }

  async function savePatch(patch: Partial<SavedDocument>) {
    if (!selected) return;
    setError("");
    setNotice("");
    const next = { ...selected, ...patch };
    setDocuments((current) => current.map((document) => (document.id === selected.id ? next : document)));
    setDirty(true);
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      void persistPatch(next);
    }, 700);
  }

  async function saveCvVersionPatch(versionPatch: Partial<CvVersionMetadata>) {
    if (!selected || !selectedCvModel || selected.tool !== "cv") return;
    const version = { ...cvVersionFromDocument(selected), ...versionPatch, updatedAt: new Date().toISOString() };
    const title = version.versionName;
    const contentJson = {
      ...(selected.contentJson ?? {}),
      cvModel: normalizeCvModelForExport(selectedCvModel),
      cvVersion: version
    };
    const next = { ...selected, title, template_name: version.designSystem, contentJson };
    setDocuments((current) => current.map((document) => (document.id === selected.id ? next : document)));
    setDirty(true);
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      void persistCvVersionPatch(next);
    }, 700);
  }

  async function persistCvVersionPatch(next: SavedDocument) {
    setSaving(true);
    try {
      const response = await fetch("/api/professional-identity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: next.id,
          tool: next.tool,
          title: next.title,
          content: next.content,
          contentJson: next.contentJson,
          templateName: next.template_name
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save CV version.");
      setNotice("Saved.");
      setDirty(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save CV version.");
    } finally {
      setSaving(false);
    }
  }

  async function persistPatch(next: SavedDocument) {
    setSaving(true);
    try {
      const response = await fetch("/api/professional-identity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: next.id, tool: next.tool, title: next.title, content: next.content })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save document.");
      setNotice("Saved.");
      setDirty(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save document.");
    } finally {
      setSaving(false);
    }
  }

  async function duplicateDocument() {
    if (!selected) return;
    setError("");
    const version = selected.tool === "cv" ? cvVersionFromDocument(selected) : null;
    const title = `${version?.versionName ?? selected.title} copy`;
    const now = new Date().toISOString();
    const contentJson = selected.tool === "cv" && selectedCvModel && version
      ? {
          ...(selected.contentJson ?? {}),
          cvModel: normalizeCvModelForExport(selectedCvModel),
          cvVersion: { ...version, versionName: title, createdAt: now, updatedAt: now, lastDownloadedAt: null }
        }
      : selected.contentJson;
    try {
      const response = await fetch("/api/professional-identity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, tool: selected.tool, title, duplicate: true, templateName: selected.template_name, contentJson })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not duplicate document.");
      const copy = { ...selected, id: data.document.id, title, contentJson: data.document.content_json ?? contentJson, template_name: data.document.template_name ?? selected.template_name, created_at: data.document.created_at, updated_at: data.document.updated_at, last_downloaded_at: null };
      setDocuments((current) => [copy, ...current]);
      setSelectedId(copy.id);
      setNotice("Duplicated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not duplicate document.");
    }
  }

  async function deleteDocument() {
    if (!selected) return;
    setError("");
    try {
      const response = await fetch(`/api/professional-identity?id=${encodeURIComponent(selected.id)}&tool=${encodeURIComponent(selected.tool)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not delete document.");
      const remaining = documents.filter((document) => document.id !== selected.id);
      setDocuments(remaining);
      setSelectedId(remaining[0]?.id ?? "");
      setNotice("Deleted.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete document.");
    }
  }

  async function markDownloaded() {
    if (!selected) return;
    const downloadedAt = new Date().toISOString();
    const contentJson = selected.tool === "cv" && selectedCvModel
      ? {
          ...(selected.contentJson ?? {}),
          cvModel: normalizeCvModelForExport(selectedCvModel),
          cvVersion: { ...cvVersionFromDocument(selected), lastDownloadedAt: downloadedAt, updatedAt: downloadedAt }
        }
      : undefined;
    await fetch("/api/professional-identity", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, tool: selected.tool, downloaded: true, contentJson })
    });
    if (selected.tool === "cv" && contentJson) {
      setDocuments((current) => current.map((document) => document.id === selected.id ? { ...document, contentJson, last_downloaded_at: downloadedAt } : document));
    }
  }

  async function downloadPdf() {
    if (!selected) return;
    if (dirty || saving) {
      setError("Please wait for your document to save before downloading.");
      return;
    }
    if (!canExport) {
      setUpgradeRequired(true);
      return;
    }
    try {
      const designSystem = selected.tool === "cv" ? cvVersionFromDocument(selected).designSystem : selected.template_name ?? undefined;
      const pdf = selected.tool === "cv" && selectedCvModel ? simplePdfDocumentFromModel(selected.title, selectedCvModel, designSystem) : simplePdfDocument(selected.title, selected.content, selected.template_name ?? undefined);
      downloadBlob(pathzyFilename(selected.tool === "cv" ? "CV" : "Document", selected.title, "pdf"), "application/pdf", pdf);
      await markDownloaded();
      setNotice("Your file has downloaded to your browser's Downloads folder.");
    } catch {
      setError("Download failed. Your document is still saved. Please try again.");
    }
  }

  if (upgradeRequired) {
    return (
      <PremiumUpgradeCard
        title="Your document is ready."
        subtitle="Upgrade to download and export your documents. You can still preview, edit, and copy your work for free."
        primaryLabel="Upgrade to Starter - $9.99/month"
        secondaryLabel="Keep previewing"
        onSecondary={() => setUpgradeRequired(false)}
      />
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[.38fr_1fr]">
      <Card className="h-fit">
        <h2 className="text-2xl font-black">Saved documents</h2>
        <p className="mt-3 text-sm leading-6 text-white/58">CVs, cover letters, LinkedIn drafts, outreach messages, follow-ups, and Career Passport summaries.</p>
        <div className="mt-5 grid gap-3">
          {grouped.map((group) => (
            <div key={group.category}>
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white/36">{labels[group.category]}</p>
              <div className="grid gap-2">
                {group.documents.map((document) => (
                  <button key={document.id} onClick={() => setSelectedId(document.id)} className={`rounded-[18px] border p-4 text-left transition ${selected?.id === document.id ? "border-[#5B8CFF]/50 bg-[#5B8CFF]/12" : "border-white/10 bg-white/7 hover:bg-white/10"}`}>
                    <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">{document.status ?? "draft"}</span>
                    <strong className="mt-2 block">{document.title}</strong>
                    {document.template_name ? <span className="mt-1 block text-xs text-white/44">{document.template_name}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {!documents.length ? (
            <div className="rounded-[22px] border border-dashed border-white/14 bg-white/5 p-6 text-center text-white/58">
              No saved documents yet. Generate your first CV or cover letter to begin.
            </div>
          ) : null}
        </div>
      </Card>

      <Card>
        {selected ? (
          <>
            <label className="label">
              Document title
              <input className="field" value={selected.title} onChange={(event) => savePatch({ title: event.target.value })} />
            </label>
            {error ? <p className="mt-4 rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc5c5]">{error}</p> : null}
            {notice || saving ? <p className="mt-4 rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold text-[#b9f8d5]">{saving ? "Saving..." : notice}</p> : null}
            <div className="mt-4 grid gap-3 rounded-[18px] border border-white/10 bg-white/6 p-4 text-sm text-white/58 sm:grid-cols-3">
              <span>Status: {selected.status ?? "draft"}</span>
              <span>Template: {selected.template_name ?? "None"}</span>
              <span>Version: {selected.version_number ?? 1}</span>
            </div>
            {selected.tool === "cv" && selectedCvModel ? (
              <>
                <div className="mt-5 rounded-[20px] border border-[#5B8CFF]/25 bg-[#5B8CFF]/10 p-4">
                  <div className="grid gap-3 lg:grid-cols-[1.2fr_.9fr]">
                    <label className="label">
                      CV version name
                      <input className="field" value={selectedCvVersion?.versionName ?? selected.title} onChange={(event) => saveCvVersionPatch({ versionName: event.target.value })} />
                    </label>
                    <label className="label">
                      Design system
                      <select className="field" value={selectedCvVersion?.designSystem ?? normalizeDocumentTemplate(selected.template_name)} onChange={(event) => saveCvVersionPatch({ designSystem: normalizeDocumentTemplate(event.target.value) })}>
                        {cvDesignSystems.map((template) => (
                          <option key={template} value={template}>{template}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs font-bold text-[#c7d6ff]/80 sm:grid-cols-3">
                    <span>Design version: {selectedCvVersion?.versionName ?? selected.title}</span>
                    <span>Content source: one CV model</span>
                    <span>Last downloaded: {selectedCvVersion?.lastDownloadedAt ? new Date(selectedCvVersion.lastDownloadedAt).toLocaleDateString() : "Not yet"}</span>
                  </div>
                </div>
                <div className="mt-5 overflow-hidden rounded-[22px] bg-white p-2 text-black">
                  <div dangerouslySetInnerHTML={{ __html: renderCvHtmlFromModel(selectedCvModel, selectedCvVersion?.designSystem ?? selected.template_name ?? undefined) }} />
                </div>
              </>
            ) : null}
            {selected.tool === "cv" ? (
              <div className="mt-5 rounded-[18px] border border-[#5B8CFF]/25 bg-[#5B8CFF]/10 p-4">
                <p className="text-sm font-bold leading-6 text-[#c7d6ff]">CVs use the structured CV Builder so preview and PDF stay identical.</p>
                <Link href="/professional-identity/cv" className="mt-3 inline-flex rounded-full blue-purple px-5 py-3 text-sm font-extrabold text-white">Edit in CV Builder</Link>
              </div>
            ) : (
              <textarea className="mt-5 min-h-[420px] w-full resize-y rounded-[22px] border border-white/10 bg-[#050816]/70 p-5 text-sm leading-7 text-white/76 outline-none focus:border-[#5B8CFF]/50" value={selected.content} onChange={(event) => savePatch({ content: event.target.value })} />
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={copyText} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82">Copy</button>
              <button onClick={downloadPdf} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82">Download PDF</button>
              <button onClick={duplicateDocument} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82">Duplicate</button>
              <button onClick={deleteDocument} className="rounded-full border border-[#ff6b6b]/25 bg-[#ff6b6b]/10 px-5 py-3 text-sm font-extrabold text-[#ffc5c5]">Delete</button>
            </div>
          </>
        ) : (
          <div className="grid min-h-[420px] place-items-center text-center">
            <div>
              <h2 className="text-2xl font-black">Your document library is ready.</h2>
              <p className="mt-3 max-w-md text-white/58">Generate a CV, cover letter, LinkedIn profile, recruiter message, follow-up email, or Career Passport to see it here.</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
