"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  analyzeJobDescription,
  coverLetterFileName,
  coverLetterRecommendations,
  coverLetterTitle,
  coverLetterTones,
  eliteCoverLetterPdfDocument,
  eliteCoverLetterTemplates,
  normalizeCoverLetterTemplate,
  normalizeCoverLetterTone,
  renderEliteCoverLetterHtml
} from "@/lib/professional-identity/elite-cover-letter-engine";
import type { CoverLetterProfileFacts, CoverLetterTargetJob, EliteCoverLetterData, EliteCoverLetterSavedDocument } from "@/lib/professional-identity/elite-cover-letter-engine";
import { appRoutes } from "@/lib/navigation/routes";

type Props = {
  initialFacts: CoverLetterProfileFacts;
  initialDocument: EliteCoverLetterSavedDocument | null;
  canExport: boolean;
  initialRole?: string;
  initialCompany?: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";

const paragraphFields = [
  ["openingParagraph", "Opening Paragraph"],
  ["relevanceParagraph", "Relevance Paragraph"],
  ["evidenceParagraph", "Evidence / Achievements Paragraph"],
  ["companyInterestParagraph", "Company Interest Paragraph"],
  ["closingParagraph", "Closing Paragraph"]
] as const;

function downloadBlob(filename: string, type: string, content: BlobPart) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function emptyTarget(role = "", company = ""): CoverLetterTargetJob {
  return {
    jobTitle: role,
    companyName: company,
    hiringManager: "",
    companyAddress: "",
    jobDescription: "",
    tone: "Professional"
  };
}

export function EliteCoverLetterTool({ initialFacts, initialDocument, canExport, initialRole = "", initialCompany = "" }: Props) {
  const [targetJob, setTargetJob] = useState<CoverLetterTargetJob>(() => emptyTarget(initialRole, initialCompany));
  const [documentId, setDocumentId] = useState(initialDocument?.id ?? "");
  const [title, setTitle] = useState(initialDocument?.title ?? "");
  const [letter, setLetter] = useState<EliteCoverLetterData | null>(initialDocument?.data ?? null);
  const [selectedTemplate, setSelectedTemplate] = useState(() => initialDocument?.templateName ?? "Modern Professional");
  const [activePanel, setActivePanel] = useState<"write" | "design" | "preview">("write");
  const [previewZoom, setPreviewZoom] = useState<"fit" | "100">("fit");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [lockedAction, setLockedAction] = useState(false);
  const [isPending, startTransition] = useTransition();

  const jobAnalysis = useMemo(() => analyzeJobDescription(targetJob, initialFacts), [targetJob, initialFacts]);
  const recommendations = useMemo(() => coverLetterRecommendations(letter, initialFacts), [letter, initialFacts]);
  const recommendedTemplate = useMemo(() => {
    const signalText = `${targetJob.jobTitle} ${targetJob.jobDescription}`.toLowerCase();
    return eliteCoverLetterTemplates.find((template) => template.recommendedSignals.some((signal) => signalText.includes(signal))) ?? eliteCoverLetterTemplates[2];
  }, [targetJob.jobTitle, targetJob.jobDescription]);

  useEffect(() => {
    if (!letter || !documentId || saveState === "saving") return;
    const timer = window.setTimeout(() => {
      void saveVersion(false);
    }, 1600);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter]);

  function updateTarget<K extends keyof CoverLetterTargetJob>(key: K, value: CoverLetterTargetJob[K]) {
    setTargetJob((current) => ({ ...current, [key]: value }));
  }

  function updateLetter(updater: (draft: EliteCoverLetterData) => void) {
    setLetter((current) => {
      if (!current) return current;
      const draft = structuredClone(current);
      updater(draft);
      draft.updatedAt = new Date().toISOString();
      return draft;
    });
    setSaveState("idle");
  }

  async function generateCoverLetter() {
    setError("");
    setNotice("");
    setLockedAction(false);
    startTransition(async () => {
      try {
        const response = await fetch("/api/professional-identity/elite-cover-letter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...targetJob, selectedTemplate })
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "We could not generate your cover letter yet.");
        setDocumentId(payload.document.id);
        setTitle(payload.document.title);
        setLetter(payload.document.data);
        setSelectedTemplate(normalizeCoverLetterTemplate(payload.document.templateName));
        setSaveState("saved");
        setNotice("Cover letter generated and saved.");
        setActivePanel("preview");
      } catch (err) {
        setError(err instanceof Error ? err.message : "We could not generate your cover letter yet.");
      }
    });
  }

  async function saveVersion(showNotice = true) {
    if (!letter || !documentId) return false;
    setSaveState("saving");
    setError("");
    try {
      const response = await fetch("/api/professional-identity/elite-cover-letter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: documentId, title: title || coverLetterTitle(letter.companyName, letter.jobTitle), data: letter })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "We could not save this version yet.");
      setDocumentId(payload.document.id);
      setTitle(payload.document.title);
      setLetter(payload.document.data);
      setSaveState("saved");
      if (showNotice) setNotice("Saved. You can return later from My Documents.");
      return true;
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "We could not save this version yet.");
      return false;
    }
  }

  async function saveDuplicate() {
    if (!letter || !documentId) return;
    setSaveState("saving");
    try {
      const response = await fetch("/api/professional-identity/elite-cover-letter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: documentId, title, data: letter, duplicate: true })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "We could not save a duplicate yet.");
      setDocumentId(payload.document.id);
      setTitle(payload.document.title);
      setLetter(payload.document.data);
      setSaveState("saved");
      setNotice("Saved as a new version.");
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : "We could not save a duplicate yet.");
    }
  }

  async function downloadPdf() {
    if (!letter || !documentId) return;
    setLockedAction(false);
    if (!canExport) {
      setLockedAction(true);
      return;
    }
    const saved = await saveVersion(false);
    if (!saved) return;
    try {
      downloadBlob(coverLetterFileName(letter), "application/pdf", eliteCoverLetterPdfDocument(letter));
      await fetch("/api/professional-identity/elite-cover-letter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: documentId, title, data: letter, downloaded: true })
      });
      setNotice("Your PDF has downloaded to your browser's Downloads folder.");
    } catch {
      setError("Download failed. Your cover letter is still saved. Please try again.");
    }
  }

  function selectTemplate(templateName: string) {
    const nextTemplate = normalizeCoverLetterTemplate(templateName);
    setSelectedTemplate(nextTemplate);
    if (letter) {
      updateLetter((draft) => {
        draft.selectedTemplate = nextTemplate;
      });
    }
    setNotice("Design selected. Your content stayed the same.");
    setActivePanel("preview");
  }

  const statusLabel = saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : saveState === "error" ? "Could not save. Retry." : letter ? "Unsaved changes" : "Ready";

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-3">
        <Link href={appRoutes.professionalIdentity} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/76 transition hover:bg-white/12">Back to My Professional Profile</Link>
        <Link href={appRoutes.roadmap} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/76 transition hover:bg-white/12">Back to My Employment Journey</Link>
      </div>

      <section className="rounded-[28px] border border-white/10 bg-white/7 p-5 shadow-[0_24px_80px_rgba(0,0,0,.24)] md:p-7">
        <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/46">Target Job Information</p>
            <h2 className="mt-2 text-2xl font-black text-white">Generate a role-specific cover letter</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">PATHZY uses your professional profile and the job description to write a truthful application letter. It will not invent employers, years, certificates, or achievements.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-white/74">Job title
              <input value={targetJob.jobTitle} onChange={(event) => updateTarget("jobTitle", event.target.value)} className="rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-white outline-none focus:border-[#8fb0ff]" placeholder="Data Analyst" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-white/74">Company name
              <input value={targetJob.companyName} onChange={(event) => updateTarget("companyName", event.target.value)} className="rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-white outline-none focus:border-[#8fb0ff]" placeholder="Example Company" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-white/74">Hiring manager
              <input value={targetJob.hiringManager} onChange={(event) => updateTarget("hiringManager", event.target.value)} className="rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-white outline-none focus:border-[#8fb0ff]" placeholder="Optional" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-white/74">Tone
              <select value={targetJob.tone} onChange={(event) => updateTarget("tone", normalizeCoverLetterTone(event.target.value))} className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#8fb0ff]">
                {coverLetterTones.map((tone) => <option key={tone}>{tone}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-white/74 sm:col-span-2">Company address
              <textarea value={targetJob.companyAddress} onChange={(event) => updateTarget("companyAddress", event.target.value)} className="min-h-20 rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-white outline-none focus:border-[#8fb0ff]" placeholder="Optional" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-white/74 sm:col-span-2">Job description
              <textarea value={targetJob.jobDescription} onChange={(event) => updateTarget("jobDescription", event.target.value)} className="min-h-32 rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-white outline-none focus:border-[#8fb0ff]" placeholder="Paste the job description here so PATHZY can target the letter." />
            </label>
            <div className="sm:col-span-2">
              <button type="button" onClick={generateCoverLetter} disabled={isPending} className="w-full rounded-full bg-gradient-to-r from-[#4f8cff] to-[#8a5cff] px-6 py-4 text-sm font-black text-white shadow-[0_18px_48px_rgba(82,124,255,.34)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                {isPending ? "Generating..." : "Generate Cover Letter"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/18 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/44">PATHZY will emphasize</p>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/66">
              {jobAnalysis.factMatches.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/18 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/44">Improve your cover letter</p>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/66">
              {recommendations.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <div className="flex gap-2 rounded-full border border-white/10 bg-white/6 p-1 md:hidden">
        {(["write", "design", "preview"] as const).map((panel) => (
          <button key={panel} type="button" onClick={() => setActivePanel(panel)} className={`flex-1 rounded-full px-4 py-2 text-xs font-black capitalize ${activePanel === panel ? "bg-white text-[#111827]" : "text-white/62"}`}>{panel}</button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[.86fr_1.14fr]">
        <section className={`${activePanel !== "write" ? "hidden md:block" : ""} rounded-[28px] border border-white/10 bg-white/7 p-5 md:p-6`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/44">Edit Content</p>
              <h2 className="mt-2 text-xl font-black text-white">Cover letter sections</h2>
            </div>
            <button type="button" onClick={() => void saveVersion()} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-black text-white/76">{statusLabel}</button>
          </div>

          {!letter ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/18 p-5 text-sm leading-6 text-white/60">Add the target job details and generate your first draft. You will be able to edit every paragraph before downloading.</div>
          ) : (
            <div className="mt-5 grid gap-4">
              <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/16 p-4">
                <p className="text-sm font-black text-white">Personal Header</p>
                <input value={letter.applicantName} onChange={(event) => updateLetter((draft) => { draft.applicantName = event.target.value; draft.applicantSignatureName = event.target.value; })} className="rounded-xl border border-white/10 bg-black/22 px-3 py-2 text-white outline-none" placeholder="Full name" />
                <input value={letter.applicantContact.email} onChange={(event) => updateLetter((draft) => { draft.applicantContact.email = event.target.value; })} className="rounded-xl border border-white/10 bg-black/22 px-3 py-2 text-white outline-none" placeholder="Email" />
                <input value={letter.applicantContact.phone} onChange={(event) => updateLetter((draft) => { draft.applicantContact.phone = event.target.value; })} className="rounded-xl border border-white/10 bg-black/22 px-3 py-2 text-white outline-none" placeholder="Phone" />
                <input value={letter.applicantContact.linkedIn} onChange={(event) => updateLetter((draft) => { draft.applicantContact.linkedIn = event.target.value; })} className="rounded-xl border border-white/10 bg-black/22 px-3 py-2 text-white outline-none" placeholder="LinkedIn" />
              </div>

              <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/16 p-4">
                <p className="text-sm font-black text-white">Employer Details</p>
                <input value={letter.companyName} onChange={(event) => updateLetter((draft) => { draft.companyName = event.target.value; })} className="rounded-xl border border-white/10 bg-black/22 px-3 py-2 text-white outline-none" />
                <input value={letter.jobTitle} onChange={(event) => updateLetter((draft) => { draft.jobTitle = event.target.value; })} className="rounded-xl border border-white/10 bg-black/22 px-3 py-2 text-white outline-none" />
                <input value={letter.hiringManager} onChange={(event) => updateLetter((draft) => { draft.hiringManager = event.target.value; draft.greeting = event.target.value ? `Dear ${event.target.value},` : "Dear Hiring Manager,"; })} className="rounded-xl border border-white/10 bg-black/22 px-3 py-2 text-white outline-none" placeholder="Hiring manager" />
                <textarea value={letter.companyAddress} onChange={(event) => updateLetter((draft) => { draft.companyAddress = event.target.value; })} className="min-h-20 rounded-xl border border-white/10 bg-black/22 px-3 py-2 text-white outline-none" placeholder="Company address" />
              </div>

              <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/16 p-4">
                <p className="text-sm font-black text-white">Greeting</p>
                <input value={letter.greeting} onChange={(event) => updateLetter((draft) => { draft.greeting = event.target.value; })} className="rounded-xl border border-white/10 bg-black/22 px-3 py-2 text-white outline-none" />
              </div>

              {paragraphFields.map(([field, label]) => (
                <div key={field} className="grid gap-3 rounded-2xl border border-white/10 bg-black/16 p-4">
                  <p className="text-sm font-black text-white">{label}</p>
                  <textarea value={letter[field]} onChange={(event) => updateLetter((draft) => { draft[field] = event.target.value; })} className="min-h-28 rounded-xl border border-white/10 bg-black/22 px-3 py-2 text-white outline-none" />
                </div>
              ))}

              <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/16 p-4">
                <p className="text-sm font-black text-white">Signature</p>
                <input value={letter.signOff} onChange={(event) => updateLetter((draft) => { draft.signOff = event.target.value; })} className="rounded-xl border border-white/10 bg-black/22 px-3 py-2 text-white outline-none" />
                <input value={letter.applicantSignatureName} onChange={(event) => updateLetter((draft) => { draft.applicantSignatureName = event.target.value; })} className="rounded-xl border border-white/10 bg-black/22 px-3 py-2 text-white outline-none" />
              </div>
            </div>
          )}
        </section>

        <section className={`${activePanel !== "design" ? "hidden md:block" : ""} rounded-[28px] border border-white/10 bg-white/7 p-5 md:p-6`}>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/44">Preview Designs</p>
          <h2 className="mt-2 text-xl font-black text-white">Choose a recruiter-ready design</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {eliteCoverLetterTemplates.map((template) => (
              <button key={template.name} type="button" onClick={() => selectTemplate(template.name)} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${selectedTemplate === template.name ? "border-[#8fb0ff] bg-[#4f8cff]/14" : "border-white/10 bg-black/18"}`}>
                <div className="flex items-start gap-3">
                  <div className="grid h-14 w-12 shrink-0 place-items-center rounded-xl text-xs font-black text-white" style={{ background: template.accent }}>{template.thumbnail}</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-white">{template.name}</p>
                      {recommendedTemplate.name === template.name ? <span className="rounded-full bg-white/12 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/66">Recommended for you</span> : null}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-white/54">Best for: {template.bestFor}</p>
                    <p className="mt-1 text-xs text-white/42">ATS compatibility: {template.atsCompatibility}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/62">Preview</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/62">Select Design</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className={`${activePanel !== "preview" ? "hidden md:block" : ""} rounded-[28px] border border-white/10 bg-white/7 p-5 md:p-6 lg:col-start-2`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/44">Live Preview</p>
              <h2 className="mt-2 text-xl font-black text-white">Published cover letter</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setPreviewZoom("fit")} className={`rounded-full px-4 py-2 text-xs font-black ${previewZoom === "fit" ? "bg-white text-[#111827]" : "bg-white/10 text-white/68"}`}>Fit width</button>
              <button type="button" onClick={() => setPreviewZoom("100")} className={`rounded-full px-4 py-2 text-xs font-black ${previewZoom === "100" ? "bg-white text-[#111827]" : "bg-white/10 text-white/68"}`}>100%</button>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-[22px] bg-black/22 p-3 md:p-5">
            {letter ? (
              <div className={previewZoom === "fit" ? "mx-auto max-w-full origin-top" : "w-[794px] max-w-none"} dangerouslySetInnerHTML={{ __html: renderEliteCoverLetterHtml(letter) }} />
            ) : (
              <div className="grid min-h-[520px] place-items-center rounded-[22px] border border-dashed border-white/14 bg-black/18 p-8 text-center text-white/58">Generate a cover letter to see the live A4 preview.</div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => letter && updateLetter((draft) => { draft.updatedAt = new Date().toISOString(); })} disabled={!letter} className="rounded-full border border-white/12 bg-white/10 px-5 py-3 text-sm font-black text-white/76 disabled:opacity-40">Improve Content</button>
            <button type="button" onClick={() => void saveVersion()} disabled={!letter || saveState === "saving"} className="rounded-full border border-white/12 bg-white/10 px-5 py-3 text-sm font-black text-white/76 disabled:opacity-40">Save Version</button>
            <button type="button" onClick={() => void saveDuplicate()} disabled={!letter || saveState === "saving"} className="rounded-full border border-white/12 bg-white/10 px-5 py-3 text-sm font-black text-white/76 disabled:opacity-40">Save Copy</button>
            <button type="button" onClick={() => void downloadPdf()} disabled={!letter} className="rounded-full bg-gradient-to-r from-[#4f8cff] to-[#8a5cff] px-5 py-3 text-sm font-black text-white disabled:opacity-40">Download PDF</button>
          </div>

          {lockedAction ? <div className="mt-4 rounded-2xl border border-[#8fb0ff]/30 bg-[#4f8cff]/12 p-4 text-sm leading-6 text-white/72">This feature is available with PATHZY Premium. You can keep editing and previewing your cover letter here.</div> : null}
          {notice ? <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">{notice}</div> : null}
          {error ? <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div> : null}
        </section>
      </div>
    </div>
  );
}

