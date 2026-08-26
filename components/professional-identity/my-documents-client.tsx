"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import {
  coverLetterDataFromUnknown,
  coverLetterPdfFilename,
  cvModelFromUnknown,
  downloadBlob,
  pathzyFilename,
  simplePdfDocument,
  simpleCoverLetterPdfDocument,
  simplePdfDocumentFromModel
} from "@/components/professional-identity/document-downloads";
import {
  vaultCategoryLabels,
  vaultDocumentTypeForCategory,
  vaultDocumentTypeLabels,
  vaultDocumentStorageContract,
  isVaultStorageErrorCode,
  type VaultDocumentCategory,
  type VaultDocumentRecord
} from "@/lib/professional-identity/document-vault";
import { currentCoreDocumentDownloadAccess } from "@/lib/access/core-document-download-access";

const categoryOrder: VaultDocumentCategory[] = ["all", "cvs", "cover_letters", "certificates", "qualifications", "licences", "references", "portfolio", "other"];
const uploadCategories: Exclude<VaultDocumentCategory, "all">[] = ["other", "certificates", "qualifications", "licences", "references", "portfolio", "cvs", "cover_letters"];

function formatDate(value: string | null) {
  if (!value) return "Not dated";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function documentFormat(document: VaultDocumentRecord) {
  if (document.documentType === "cv") return "CV";
  if (document.documentType === "cover_letter") return "Cover Letter";
  if (document.fileType?.includes("pdf")) return "PDF";
  if (document.fileType?.includes("wordprocessingml")) return "DOCX";
  if (document.fileType?.startsWith("image/")) return document.fileType.endsWith("png") ? "PNG" : "JPG";
  if (document.fileType === "text/plain") return "TXT";
  return vaultDocumentTypeLabels[document.documentType];
}

function uploadSuccessMessage(category: Exclude<VaultDocumentCategory, "all">, replacing: boolean) {
  if (replacing) return "Document replaced.";
  const label = vaultCategoryLabels[category].replace(/s$/, "").replace("Portfolio & Evidence", "Portfolio evidence");
  return `${label} uploaded.`;
}

function savedCvPaletteId(document: VaultDocumentRecord) {
  const version = document.contentJson?.cvVersion;
  if (!version || typeof version !== "object" || !("paletteId" in version)) return undefined;
  const paletteId = (version as { paletteId?: unknown }).paletteId;
  return typeof paletteId === "string" && paletteId.trim() ? paletteId.trim() : undefined;
}

function emptyStateForCategory(category: VaultDocumentCategory) {
  if (category === "all") {
    return {
      title: "No documents yet.",
      body: "Upload an employment document or save a CV or Cover Letter from PATHZY.",
      action: "Upload document"
    };
  }
  const label = vaultCategoryLabels[category].toLowerCase();
  return {
    title: `No ${label} yet.`,
    body: `Upload ${label} you may need for applications.`,
    action: `Upload ${vaultCategoryLabels[category].replace(/s$/, "").toLowerCase()}`
  };
}

function openHrefForDocument(document: VaultDocumentRecord) {
  if (document.documentType === "cv") return `/professional-identity/cv?documentId=${encodeURIComponent(document.id)}`;
  if (document.documentType === "cover_letter") return `/professional-identity/cover-letter?documentId=${encodeURIComponent(document.id)}`;
  return "";
}

function dedupeDocuments(documents: VaultDocumentRecord[]) {
  const seen = new Set<string>();
  return documents.filter((document) => {
    const key = document.storagePath
      ? `file:${document.storagePath}`
      : `generated:${document.documentType}:${document.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function MyDocumentsClient({ initialDocuments, canExport = false }: { initialDocuments: VaultDocumentRecord[]; canExport?: boolean }) {
  const [documents, setDocuments] = useState(() => dedupeDocuments(initialDocuments));
  const [selectedCategory, setSelectedCategory] = useState<VaultDocumentCategory>("all");
  const [uploadCategory, setUploadCategory] = useState<Exclude<VaultDocumentCategory, "all">>("other");
  const [uploading, setUploading] = useState(false);
  const [renamingId, setRenamingId] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingUploadCategoryRef = useRef<Exclude<VaultDocumentCategory, "all"> | null>(null);
  const replaceInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const coreDownloadsAllowed = currentCoreDocumentDownloadAccess === "allowed";
  const storageServiceUnavailable = isVaultStorageErrorCode(errorCode);

  const visibleDocuments = useMemo(
    () => documents.filter((document) => selectedCategory === "all" || document.category === selectedCategory),
    [documents, selectedCategory]
  );
  const counts = useMemo(() => {
    const result: Record<VaultDocumentCategory, number> = {
      all: documents.length,
      cvs: 0,
      cover_letters: 0,
      certificates: 0,
      qualifications: 0,
      licences: 0,
      references: 0,
      portfolio: 0,
      other: 0
    };
    for (const document of documents) result[document.category] += 1;
    return result;
  }, [documents]);

  function upsertDocument(document: VaultDocumentRecord) {
    setDocuments((current) => dedupeDocuments([document, ...current.filter((item) => item.id !== document.id)]));
  }

  async function readApiJson(response: Response) {
    try {
      return await response.json() as { error?: string; code?: string; document?: VaultDocumentRecord; signedUrl?: string | null };
    } catch {
      return {};
    }
  }

  async function uploadFile(file: File, options?: { replaceDocumentId?: string; category?: Exclude<VaultDocumentCategory, "all"> }) {
    setUploading(!options?.replaceDocumentId);
    setBusyId(options?.replaceDocumentId ?? "");
    setError("");
    setErrorCode("");
    setNotice("");
    const category = options?.category ?? uploadCategory;
    const formData = new FormData();
    formData.set("file", file);
    formData.set("category", category);
    formData.set("documentType", vaultDocumentTypeForCategory(category));
    formData.set("title", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    if (options?.replaceDocumentId) formData.set("replaceDocumentId", options.replaceDocumentId);

    try {
      const response = await fetch("/api/professional-identity/documents", { method: "POST", body: formData });
      const data = await readApiJson(response);
      if (!response.ok) {
        setErrorCode(data.code ?? "");
        throw new Error(data.error ?? "We couldn't upload your document. Please try again.");
      }
      if (data.document) upsertDocument(data.document);
      setNotice(uploadSuccessMessage(category, Boolean(options?.replaceDocumentId)));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We couldn't upload your document. Please try again.");
    } finally {
      setUploading(false);
      setBusyId("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      const replaceInput = options?.replaceDocumentId ? replaceInputRefs.current[options.replaceDocumentId] : null;
      if (replaceInput) replaceInput.value = "";
    }
  }

  async function openUploadedDocument(document: VaultDocumentRecord, download = false) {
    setBusyId(document.id);
    setError("");
    setErrorCode("");
    try {
      const response = await fetch(`/api/professional-identity/documents?id=${encodeURIComponent(document.id)}`);
      const data = await readApiJson(response);
      if (!response.ok) {
        setErrorCode(data.code ?? "");
        throw new Error(data.error ?? "Could not open document.");
      }
      if (!data.signedUrl) throw new Error("This document does not have a stored file preview yet.");
      const anchor = window.document.createElement("a");
      anchor.href = data.signedUrl;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      if (download) anchor.download = document.fileName ?? document.title;
      anchor.click();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not open document.");
    } finally {
      setBusyId("");
    }
  }

  async function downloadGeneratedDocument(document: VaultDocumentRecord) {
    if (!canExport && !coreDownloadsAllowed) {
      setError("PATHZY could not confirm your download access. Please refresh and try again.");
      return;
    }
    setBusyId(document.id);
    setError("");
    setErrorCode("");
    try {
      const coverLetterData = document.documentType === "cover_letter"
        ? coverLetterDataFromUnknown(document.contentJson?.coverLetterData, document.content)
        : null;
      const pdf = document.documentType === "cv"
        ? simplePdfDocumentFromModel(document.title, cvModelFromUnknown(document.contentJson?.cvModel, document.content), document.templateName ?? undefined, undefined, savedCvPaletteId(document))
        : coverLetterData
          ? simpleCoverLetterPdfDocument(coverLetterData)
          : simplePdfDocument(document.title, document.content, document.templateName ?? undefined);
      downloadBlob(coverLetterData ? coverLetterPdfFilename(coverLetterData) : pathzyFilename(document.documentType === "cv" ? "CV" : "Document", document.title, "pdf"), "application/pdf", pdf);
      setNotice("Your file has downloaded to your browser's Downloads folder.");
    } catch {
      setError("Download failed. Your document is still saved. Please try again.");
    } finally {
      setBusyId("");
    }
  }

  async function saveDocumentPatch(document: VaultDocumentRecord, patch: { title?: string; category?: VaultDocumentCategory }) {
    setBusyId(document.id);
    setError("");
    setErrorCode("");
    setNotice("");
    try {
      const response = await fetch("/api/professional-identity/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: document.id, ...patch })
      });
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error ?? "Could not save document.");
      if (data.document) upsertDocument(data.document);
      setRenamingId("");
      setNotice("Document updated.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save document.");
    } finally {
      setBusyId("");
    }
  }

  async function deleteDocument(document: VaultDocumentRecord) {
    if (!window.confirm(`Delete ${document.title}?`)) return;
    setBusyId(document.id);
    setError("");
    setErrorCode("");
    try {
      const response = await fetch(`/api/professional-identity/documents?id=${encodeURIComponent(document.id)}`, { method: "DELETE" });
      const data = await readApiJson(response);
      if (!response.ok) throw new Error(data.error ?? "Could not delete document.");
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      setNotice("Document deleted.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete document.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#7f1d1d]">Employment File Vault</p>
            <h2 className="mt-2 text-3xl font-black text-[#1f1613]">Your application documents</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5d5550]">
              Store CVs, cover letters, certificates, qualifications, licences, references and supporting files. Editing stays in the original PATHZY workspace.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              className="min-h-12 rounded-full border border-[#ded6ce] bg-[#fffaf4] px-4 text-sm font-bold text-[#2b211d] outline-none"
              value={uploadCategory}
              onChange={(event) => setUploadCategory(event.target.value as Exclude<VaultDocumentCategory, "all">)}
              aria-label="Upload category"
            >
              {uploadCategories.map((category) => (
                <option key={category} value={category}>{vaultCategoryLabels[category]}</option>
              ))}
            </select>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                const category = pendingUploadCategoryRef.current ?? uploadCategory;
                pendingUploadCategoryRef.current = null;
                if (file) void uploadFile(file, { category });
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => {
                pendingUploadCategoryRef.current = uploadCategory;
                fileInputRef.current?.click();
              }}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d93a46] px-6 py-3 text-sm font-black text-white shadow-[0_18px_40px_rgba(127,29,29,.2)] transition hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload document"}
            </button>
          </div>
        </div>
        <p className="mt-4 text-xs font-semibold text-[#766b63]">
          Supported files: PDF, DOCX, TXT, PNG and JPG/JPEG up to {Math.round(vaultDocumentStorageContract.maxFileSizeBytes / (1024 * 1024))}MB.
        </p>
        {notice ? <p className="mt-4 rounded-[16px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm font-bold text-[#166534]">{notice}</p> : null}
        {error ? <p className="mt-4 rounded-[16px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-bold text-[#991b1b]">{error}</p> : null}
      </Card>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible" aria-label="Document categories">
        {categoryOrder.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black transition ${
              selectedCategory === category
                ? "border-[#7f1d1d] bg-[#7f1d1d] text-white"
                : "border-[#ded6ce] bg-[#fffaf4] text-[#3b312d] hover:border-[#7f1d1d]"
            }`}
          >
            {vaultCategoryLabels[category]} <span className="ml-1 opacity-70">{counts[category]}</span>
          </button>
        ))}
      </div>

      {storageServiceUnavailable && !visibleDocuments.length ? (
        <Card>
          <div className="grid min-h-[220px] place-items-center text-center">
            <div>
              <h2 className="text-2xl font-black text-[#1f1613]">Document upload is temporarily unavailable.</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#6b5f57]">
                Your saved documents are safe. Please try again soon.
              </p>
            </div>
          </div>
        </Card>
      ) : visibleDocuments.length ? (
        <div className="grid gap-3">
          {visibleDocuments.map((document) => {
            const openHref = openHrefForDocument(document);
            const isBusy = busyId === document.id;
            return (
              <article key={document.id} className="rounded-[28px] border border-[#ded6ce] bg-[#fffaf4] p-4 shadow-[0_18px_46px_rgba(31,22,19,.08)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#f4e9dd] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#7f1d1d]">{vaultCategoryLabels[document.category]}</span>
                      <span className="rounded-full border border-[#e7ddd2] px-3 py-1 text-xs font-bold text-[#6b5f57]">{documentFormat(document)}</span>
                      <span className="rounded-full border border-[#e7ddd2] px-3 py-1 text-xs font-bold text-[#6b5f57]">{document.source === "pathzy" ? "PATHZY" : "Uploaded"}</span>
                      {document.status !== "draft" ? <span className="rounded-full border border-[#e7ddd2] px-3 py-1 text-xs font-bold text-[#6b5f57]">{document.status === "final" ? "Final" : "Archived"}</span> : null}
                    </div>
                    {renamingId === document.id ? (
                      <div className="mt-3 flex max-w-xl flex-col gap-2 sm:flex-row">
                        <input
                          className="min-h-11 flex-1 rounded-full border border-[#ded6ce] bg-white px-4 text-sm font-bold text-[#1f1613] outline-none focus:border-[#7f1d1d]"
                          value={renameValue}
                          onChange={(event) => setRenameValue(event.target.value)}
                          aria-label="Document name"
                        />
                        <button type="button" className="rounded-full bg-[#7f1d1d] px-4 py-2 text-sm font-black text-white" onClick={() => saveDocumentPatch(document, { title: renameValue })}>Save</button>
                        <button type="button" className="rounded-full border border-[#ded6ce] px-4 py-2 text-sm font-black text-[#3b312d]" onClick={() => setRenamingId("")}>Cancel</button>
                      </div>
                    ) : (
                      <h3 className="mt-3 truncate text-xl font-black text-[#1f1613]">{document.title}</h3>
                    )}
                    <p className="mt-2 text-sm text-[#6b5f57]">
                      Updated {formatDate(document.updatedAt)}{document.fileName ? ` · ${document.fileName}` : ""}{formatFileSize(document.fileSize) ? ` · ${formatFileSize(document.fileSize)}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {openHref ? (
                      <Link href={openHref} className="rounded-full bg-[#d93a46] px-4 py-2 text-sm font-black text-white transition hover:bg-[#b91c1c]">Open</Link>
                    ) : (
                      <button type="button" disabled={isBusy} onClick={() => openUploadedDocument(document)} className="rounded-full bg-[#d93a46] px-4 py-2 text-sm font-black text-white transition hover:bg-[#b91c1c] disabled:opacity-60">Open</button>
                    )}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => document.source === "pathzy" ? downloadGeneratedDocument(document) : openUploadedDocument(document, true)}
                      className="rounded-full border border-[#ded6ce] bg-white px-4 py-2 text-sm font-black text-[#2b211d] transition hover:border-[#7f1d1d] disabled:opacity-60"
                    >
                      {isBusy ? "Working..." : "Download"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-[#ded6ce] bg-white px-4 py-2 text-sm font-black text-[#2b211d] transition hover:border-[#7f1d1d]"
                      onClick={() => {
                        setRenamingId(document.id);
                        setRenameValue(document.title);
                      }}
                    >
                      Rename
                    </button>
                    {document.source === "uploaded" ? (
                      <>
                        <select
                          className="min-h-10 rounded-full border border-[#ded6ce] bg-white px-3 text-sm font-bold text-[#2b211d]"
                          value={document.category}
                          onChange={(event) => saveDocumentPatch(document, { category: event.target.value as VaultDocumentCategory })}
                          aria-label={`Move ${document.title}`}
                        >
                          {uploadCategories.map((category) => (
                            <option key={category} value={category}>{vaultCategoryLabels[category]}</option>
                          ))}
                        </select>
                        <input
                          ref={(node) => {
                            replaceInputRefs.current[document.id] = node;
                          }}
                          type="file"
                          className="hidden"
                          accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg"
                          onChange={(event) => {
                            const file = event.currentTarget.files?.[0];
                            if (file) void uploadFile(file, { replaceDocumentId: document.id, category: document.category });
                          }}
                        />
                        <button type="button" disabled={isBusy} onClick={() => replaceInputRefs.current[document.id]?.click()} className="rounded-full border border-[#ded6ce] bg-white px-4 py-2 text-sm font-black text-[#2b211d] transition hover:border-[#7f1d1d] disabled:opacity-60">Replace</button>
                      </>
                    ) : null}
                    <button type="button" disabled={isBusy} onClick={() => deleteDocument(document)} className="rounded-full border border-[#fecaca] bg-[#fff1f2] px-4 py-2 text-sm font-black text-[#991b1b] transition hover:border-[#b91c1c] disabled:opacity-60">Delete</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="grid min-h-[260px] place-items-center text-center">
            <div>
              {(() => {
                const empty = emptyStateForCategory(selectedCategory);
                return (
                  <>
                    <h2 className="text-2xl font-black text-[#1f1613]">{empty.title}</h2>
                    <p className="mt-3 max-w-md text-sm leading-6 text-[#6b5f57]">{empty.body}</p>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => {
                        pendingUploadCategoryRef.current = selectedCategory === "all" ? uploadCategory : selectedCategory;
                        if (selectedCategory !== "all") setUploadCategory(selectedCategory);
                        fileInputRef.current?.click();
                      }}
                      className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#d93a46] px-5 py-2.5 text-sm font-black text-white shadow-[0_14px_32px_rgba(127,29,29,.18)] transition hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploading ? "Uploading..." : empty.action}
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
