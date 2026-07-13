"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  analyzeJobDescription,
  coverLetterFileName,
  coverLetterLanguages,
  coverLetterRecommendations,
  coverLetterTitle,
  coverLetterTones,
  eliteCoverLetterPdfDocument,
  eliteCoverLetterTemplates,
  normalizeCoverLetterLanguage,
  normalizeCoverLetterTemplate,
  normalizeCoverLetterTone,
  renderEliteCoverLetterHtml,
  renderEliteCoverLetterPlainText
} from "@/lib/professional-identity/elite-cover-letter-engine";
import type { CoverLetterEvidenceItem, CoverLetterLanguage, CoverLetterProfileFacts, CoverLetterTargetJob, EliteCoverLetterData, EliteCoverLetterSavedDocument } from "@/lib/professional-identity/elite-cover-letter-engine";
import { appRoutes } from "@/lib/navigation/routes";

type Props = {
  initialFacts: CoverLetterProfileFacts;
  initialDocument: EliteCoverLetterSavedDocument | null;
  canExport: boolean;
  initialRole?: string;
  initialCompany?: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";
type StudioPanel = "write" | "design" | "preview";
type PreviewMode = "designed" | "plain";
type AccordionSection = "Applicant" | "Target Job" | "Employer" | "Greeting" | "Opening" | "Relevant Experience" | "Evidence of Fit" | "Why This Company" | "Closing" | "Signature";

const accordionSections: AccordionSection[] = [
  "Applicant",
  "Target Job",
  "Employer",
  "Greeting",
  "Opening",
  "Relevant Experience",
  "Evidence of Fit",
  "Why This Company",
  "Closing",
  "Signature"
];

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

function emptyTarget(role = "", company = "", language: CoverLetterLanguage = "English"): CoverLetterTargetJob {
  return {
    jobTitle: role,
    companyName: company,
    jobDescription: "",
    hiringManager: "",
    hiringManagerTitle: "",
    companyAddress: "",
    jobLocation: "",
    jobReferenceNumber: "",
    applicationDeadline: "",
    companyNotes: "",
    tone: "Professional",
    language,
    evidenceItems: []
  };
}

function Field({ label, value, onChange, placeholder, multiline = false, required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; multiline?: boolean; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-white/74">
      <span>{label}{required ? <span className="text-[#c7d6ff]"> *</span> : null}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-white outline-none transition focus:border-[#8fb0ff]" placeholder={placeholder} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-white outline-none transition focus:border-[#8fb0ff]" placeholder={placeholder} />
      )}
    </label>
  );
}

function TemplateMiniPreview({ templateName }: { templateName: string }) {
  const template = eliteCoverLetterTemplates.find((item) => item.name === templateName) ?? eliteCoverLetterTemplates[0];
  const rail = ["executive", "creative", "technical"].includes(template.architecture);
  const centered = template.architecture === "international" || template.architecture === "classic";
  return (
    <div className="h-28 rounded-xl border border-white/10 bg-white p-2">
      <div className={`h-full rounded-lg border border-slate-200 p-2 ${centered ? "text-center" : ""}`} style={{ background: template.paper }}>
        <div className={`mb-2 h-3 rounded ${rail ? "w-1/2" : "w-3/4"}`} style={{ background: template.accent }} />
        <div className="grid gap-1">
          <div className="h-1.5 rounded bg-slate-800/80" />
          <div className="h-1.5 w-2/3 rounded bg-slate-400" />
          <div className={`mt-2 grid gap-1 ${rail ? "grid-cols-[.35fr_1fr]" : ""}`}>
            {rail ? <div className="h-12 rounded" style={{ background: `${template.accent}33` }} /> : null}
            <div className="grid gap-1">
              <div className="h-1.5 rounded bg-slate-300" />
              <div className="h-1.5 rounded bg-slate-300" />
              <div className="h-1.5 w-4/5 rounded bg-slate-300" />
              <div className="h-1.5 w-3/5 rounded bg-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EliteCoverLetterTool({ initialFacts, initialDocument, canExport, initialRole = "", initialCompany = "" }: Props) {
  const [targetJob, setTargetJob] = useState<CoverLetterTargetJob>(() => emptyTarget(initialRole, initialCompany, initialFacts.language));
  const [documentId, setDocumentId] = useState(initialDocument?.id ?? "");
  const [title, setTitle] = useState(initialDocument?.title ?? "");
  const [letter, setLetter] = useState<EliteCoverLetterData | null>(initialDocument?.data ?? null);
  const [selectedTemplate, setSelectedTemplate] = useState(() => initialDocument?.templateName ?? "Classic Professional");
  const [activePanel, setActivePanel] = useState<StudioPanel>("write");
  const [activeSection, setActiveSection] = useState<AccordionSection>("Target Job");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("designed");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [lockedAction, setLockedAction] = useState(false);
  const [isPending, startTransition] = useTransition();

  const jobAnalysis = useMemo(() => analyzeJobDescription(targetJob, initialFacts), [targetJob, initialFacts]);
  const evidenceForReview = letter?.selectedEvidence.length ? letter.selectedEvidence : targetJob.evidenceItems?.length ? targetJob.evidenceItems : jobAnalysis.selectedEvidence;
  const recommendations = useMemo(() => coverLetterRecommendations(letter, initialFacts), [letter, initialFacts]);
  const recommendedTemplate = useMemo(() => {
    const signalText = `${targetJob.jobTitle} ${targetJob.jobDescription}`.toLowerCase();
    return eliteCoverLetterTemplates.find((template) => template.recommendedSignals.some((signal) => signalText.includes(signal))) ?? eliteCoverLetterTemplates[0];
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

  function updateEvidence(nextEvidence: CoverLetterEvidenceItem[]) {
    setTargetJob((current) => ({ ...current, evidenceItems: nextEvidence }));
    if (letter) updateLetter((draft) => { draft.selectedEvidence = nextEvidence; draft.status = "Edited"; });
  }

  function updateLetter(updater: (draft: EliteCoverLetterData) => void) {
    setLetter((current) => {
      if (!current) return current;
      const draft = structuredClone(current);
      updater(draft);
      draft.updatedAt = new Date().toISOString();
      draft.lastPreviewedAt = new Date().toISOString();
      if (draft.status === "Generated" || draft.status === "Ready") draft.status = "Edited";
      return draft;
    });
    setSaveState("idle");
  }

  async function generateCoverLetter() {
    setError("");
    setNotice("");
    setLockedAction(false);
    if (!targetJob.companyName.trim() || !targetJob.jobTitle.trim() || !targetJob.jobDescription.trim()) {
      setError("Please add the company name, position title, and job description before generating.");
      setActiveSection("Target Job");
      return;
    }
    const evidenceItems = evidenceForReview.length ? evidenceForReview : jobAnalysis.selectedEvidence;
    startTransition(async () => {
      try {
        const response = await fetch("/api/professional-identity/elite-cover-letter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...targetJob, evidenceItems, selectedTemplate })
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
        body: JSON.stringify({ id: documentId, title, data: { ...letter, lastDownloadedAt: new Date().toISOString() }, downloaded: true })
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

  function renderEvidenceReview() {
    const items = evidenceForReview.length ? evidenceForReview : jobAnalysis.selectedEvidence;
    return (
      <div className="grid gap-3">
        <p className="text-sm leading-6 text-white/58">Review the truthful evidence PATHZY can use. Select only what you want included, edit wording if needed, or add another true item.</p>
        {items.map((item, index) => (
          <div key={item.id || index} className="rounded-2xl border border-white/10 bg-black/18 p-3">
            <label className="flex items-start gap-3 text-sm font-bold text-white/70">
              <input type="checkbox" className="mt-1" checked={item.selected} onChange={(event) => {
                const next = [...items];
                next[index] = { ...item, selected: event.target.checked };
                updateEvidence(next);
              }} />
              <span>{item.source} - {item.matchedReason}</span>
            </label>
            <textarea value={item.text} onChange={(event) => {
              const next = [...items];
              next[index] = { ...item, text: event.target.value };
              updateEvidence(next);
            }} className="mt-3 min-h-20 w-full rounded-xl border border-white/10 bg-black/24 px-3 py-2 text-sm text-white outline-none focus:border-[#8fb0ff]" />
            <button type="button" onClick={() => updateEvidence(items.filter((_, itemIndex) => itemIndex !== index))} className="mt-2 rounded-full bg-white/8 px-3 py-1.5 text-xs font-black text-white/62">Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => updateEvidence([...items, { id: `manual-${Date.now()}`, source: "Profile", text: "", matchedReason: "User-added truthful evidence", selected: true }])} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-black text-white/76">Add truthful evidence item</button>
      </div>
    );
  }

  function renderAccordionContent(section: AccordionSection) {
    if (section === "Applicant") return (
      <div className="grid gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/18 p-3 text-sm leading-6 text-white/60">Selected CV source: <span className="font-black text-white">{initialFacts.selectedCvTitle || "Latest saved CV"}</span></div>
        {letter ? (
          <>
            <Field label="Full name" value={letter.applicantName} onChange={(value) => updateLetter((draft) => { draft.applicantName = value; draft.signatureName = value; draft.applicantSignatureName = value; })} />
            <Field label="Email" value={letter.applicantContact.email} onChange={(value) => updateLetter((draft) => { draft.applicantContact.email = value; })} />
            <Field label="Phone" value={letter.applicantContact.phone} onChange={(value) => updateLetter((draft) => { draft.applicantContact.phone = value; })} />
            <Field label="LinkedIn" value={letter.applicantContact.linkedIn} onChange={(value) => updateLetter((draft) => { draft.applicantContact.linkedIn = value; })} />
            <Field label="Portfolio / website" value={letter.applicantContact.portfolio} onChange={(value) => updateLetter((draft) => { draft.applicantContact.portfolio = value; })} />
          </>
        ) : <p className="text-sm leading-6 text-white/58">Generate a draft to edit applicant details directly. PATHZY will use your profile and selected CV as the source.</p>}
      </div>
    );
    if (section === "Target Job") return (
      <div className="grid gap-3" data-cover-letter-form-flow="single-column">
        <Field label="Company name" value={targetJob.companyName} onChange={(value) => updateTarget("companyName", value)} placeholder="Example Company" required />
        <Field label="Position title" value={targetJob.jobTitle} onChange={(value) => updateTarget("jobTitle", value)} placeholder="Junior Data Analyst" required />
        <Field label="Job description" value={targetJob.jobDescription} onChange={(value) => updateTarget("jobDescription", value)} placeholder="Paste the job description here so PATHZY can target the letter." multiline required />
        <label className="grid gap-2 text-sm font-bold text-white/74">Preferred tone
          <select value={targetJob.tone} onChange={(event) => updateTarget("tone", normalizeCoverLetterTone(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#8fb0ff]">
            {coverLetterTones.map((tone) => <option key={tone}>{tone}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-white/74">Language
          <select value={targetJob.language} onChange={(event) => updateTarget("language", normalizeCoverLetterLanguage(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#8fb0ff]">
            {coverLetterLanguages.map((language) => <option key={language}>{language}</option>)}
          </select>
        </label>
      </div>
    );
    if (section === "Employer") return (
      <div className="grid gap-3">
        <Field label="Hiring manager name" value={letter?.hiringManager ?? targetJob.hiringManager} onChange={(value) => letter ? updateLetter((draft) => { draft.hiringManager = value; draft.employerDetails.hiringManager = value; }) : updateTarget("hiringManager", value)} placeholder="Optional" />
        <Field label="Hiring manager title" value={letter?.employerDetails.hiringManagerTitle ?? targetJob.hiringManagerTitle} onChange={(value) => letter ? updateLetter((draft) => { draft.employerDetails.hiringManagerTitle = value; }) : updateTarget("hiringManagerTitle", value)} placeholder="Optional" />
        <Field label="Company address" value={letter?.companyAddress ?? targetJob.companyAddress} onChange={(value) => letter ? updateLetter((draft) => { draft.companyAddress = value; draft.employerDetails.companyAddress = value; }) : updateTarget("companyAddress", value)} multiline placeholder="Optional" />
        <Field label="Job location" value={letter?.employerDetails.jobLocation ?? targetJob.jobLocation} onChange={(value) => letter ? updateLetter((draft) => { draft.employerDetails.jobLocation = value; }) : updateTarget("jobLocation", value)} placeholder="Optional" />
        <Field label="Job reference number" value={letter?.employerDetails.jobReferenceNumber ?? targetJob.jobReferenceNumber} onChange={(value) => letter ? updateLetter((draft) => { draft.employerDetails.jobReferenceNumber = value; }) : updateTarget("jobReferenceNumber", value)} placeholder="Optional" />
      </div>
    );
    if (!letter) return <p className="text-sm leading-6 text-white/58">Generate a draft first, then this section becomes editable.</p>;
    if (section === "Greeting") return <Field label="Greeting" value={letter.greeting} onChange={(value) => updateLetter((draft) => { draft.greeting = value; })} />;
    if (section === "Opening") return <Field label="Opening paragraph" value={letter.openingParagraph} onChange={(value) => updateLetter((draft) => { draft.openingParagraph = value; })} multiline />;
    if (section === "Relevant Experience") return <Field label="Relevant experience and skills" value={letter.relevantExperienceParagraph} onChange={(value) => updateLetter((draft) => { draft.relevantExperienceParagraph = value; draft.relevanceParagraph = value; })} multiline />;
    if (section === "Evidence of Fit") return renderEvidenceReview();
    if (section === "Why This Company") return (
      <div className="grid gap-3">
        <Field label="Company or role notes" value={targetJob.companyNotes} onChange={(value) => updateTarget("companyNotes", value)} multiline placeholder="Optional. Use only information you know from the job post or approved notes." />
        <Field label="Why this company paragraph" value={letter.whyCompanyParagraph} onChange={(value) => updateLetter((draft) => { draft.whyCompanyParagraph = value; draft.companyInterestParagraph = value; })} multiline />
      </div>
    );
    if (section === "Closing") return <Field label="Closing paragraph" value={letter.closingParagraph} onChange={(value) => updateLetter((draft) => { draft.closingParagraph = value; })} multiline />;
    return (
      <div className="grid gap-3">
        <Field label="Sign-off" value={letter.signOff} onChange={(value) => updateLetter((draft) => { draft.signOff = value; })} />
        <Field label="Signature name" value={letter.signatureName} onChange={(value) => updateLetter((draft) => { draft.signatureName = value; draft.applicantSignatureName = value; })} />
      </div>
    );
  }

  const statusLabel = saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : saveState === "error" ? "Could not save. Retry." : letter ? "Unsaved changes" : "Ready";

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-[28px] border border-white/10 bg-white/7 p-5 shadow-[0_24px_80px_rgba(0,0,0,.24)] md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/46">Cover Letter</p>
          <h2 className="mt-2 text-2xl font-black text-white">Build your professional cover letter</h2>
          <p className="mt-3 text-sm leading-6 text-white/62">Create a clear, job-tailored cover letter using your PATHZY profile, selected CV and target-job information.</p>
          <p className="mt-3 text-sm leading-6 text-white/52">PATHZY will prepare the first draft, and you can review, edit and improve it before downloading.</p>
        </section>
        <section className="rounded-[28px] border border-white/10 bg-white/7 p-5 shadow-[0_24px_80px_rgba(0,0,0,.24)] md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/46">Why It Matters</p>
          <h2 className="mt-2 text-2xl font-black text-white">Show why you fit the role</h2>
          <p className="mt-3 text-sm leading-6 text-white/62">A strong cover letter connects your experience and achievements to the employer's needs instead of repeating your CV.</p>
          <p className="mt-3 text-sm leading-6 text-white/52">PATHZY will help you present the strongest truthful evidence for the position.</p>
        </section>
      </div>

      <div className="flex gap-2 rounded-full border border-white/10 bg-white/6 p-1 md:hidden">
        {(["write", "design", "preview"] as const).map((panel) => (
          <button key={panel} type="button" onClick={() => setActivePanel(panel)} className={`flex-1 rounded-full px-4 py-2 text-xs font-black capitalize ${activePanel === panel ? "bg-white text-[#111827]" : "text-white/62"}`}>{panel}</button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[.86fr_1.14fr]">
        <section className={`${activePanel !== "write" ? "hidden md:block" : ""} rounded-[28px] border border-white/10 bg-white/7 p-5 md:p-6`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/44">Structured Editor</p>
              <h2 className="mt-2 text-xl font-black text-white">Cover letter sections</h2>
            </div>
            <button type="button" onClick={() => void saveVersion()} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-black text-white/76">{statusLabel}</button>
          </div>
          <div className="mt-5 grid gap-3" data-cover-letter-accordion="vertical">
            {accordionSections.map((section) => {
              const open = activeSection === section;
              const panelId = `cover-letter-${section.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
              return (
                <div key={section} className="rounded-2xl border border-white/10 bg-black/18">
                  <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setActiveSection(open ? "Target Job" : section)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-black text-white outline-none transition focus-visible:ring-2 focus-visible:ring-[#8fb0ff]">
                    <span>{section}</span>
                    <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/54">{open ? "Open" : "Edit"}</span>
                  </button>
                  {open ? <div id={panelId} className="grid gap-3 border-t border-white/10 p-4">{renderAccordionContent(section)}</div> : null}
                </div>
              );
            })}
          </div>
          <div className="mt-5">
            <button type="button" onClick={generateCoverLetter} disabled={isPending} className="w-full rounded-full bg-gradient-to-r from-[#4f8cff] to-[#8a5cff] px-6 py-4 text-sm font-black text-white shadow-[0_18px_48px_rgba(82,124,255,.34)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              {isPending ? "Generating..." : "Generate Cover Letter"}
            </button>
          </div>
          {notice ? <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">{notice}</div> : null}
          {error ? <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</div> : null}
        </section>

        <section className={`${activePanel !== "preview" ? "hidden md:block" : ""} rounded-[28px] border border-white/10 bg-white/7 p-5 md:p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/44">Live A4 Preview</p>
              <h2 className="mt-2 text-xl font-black text-white">Published cover letter</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setPreviewMode("designed")} className={`rounded-full px-4 py-2 text-xs font-black ${previewMode === "designed" ? "bg-white text-[#111827]" : "bg-white/10 text-white/68"}`}>Designed Preview</button>
              <button type="button" onClick={() => setPreviewMode("plain")} className={`rounded-full px-4 py-2 text-xs font-black ${previewMode === "plain" ? "bg-white text-[#111827]" : "bg-white/10 text-white/68"}`}>Plain Text / Recruiter View</button>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto rounded-[22px] bg-black/22 p-3 md:p-5">
            {letter ? (
              previewMode === "designed"
                ? <div dangerouslySetInnerHTML={{ __html: renderEliteCoverLetterHtml(letter) }} />
                : <pre className="plain-letter whitespace-pre-wrap rounded-[18px] bg-white p-8 text-sm leading-7 text-[#111827]">{renderEliteCoverLetterPlainText(letter)}</pre>
            ) : (
              <div className="grid min-h-[520px] place-items-center rounded-[22px] border border-dashed border-white/14 bg-black/18 p-8 text-center text-white/58">Generate a cover letter to see the live A4 preview.</div>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => letter && updateLetter((draft) => { draft.status = "Ready for review"; })} disabled={!letter} className="rounded-full border border-white/12 bg-white/10 px-5 py-3 text-sm font-black text-white/76 disabled:opacity-40">Improve Content</button>
            <button type="button" onClick={() => void saveVersion()} disabled={!letter || saveState === "saving"} className="rounded-full border border-white/12 bg-white/10 px-5 py-3 text-sm font-black text-white/76 disabled:opacity-40">Save Version</button>
            <button type="button" onClick={() => void saveDuplicate()} disabled={!letter || saveState === "saving"} className="rounded-full border border-white/12 bg-white/10 px-5 py-3 text-sm font-black text-white/76 disabled:opacity-40">Save Copy</button>
            <button type="button" onClick={() => void downloadPdf()} disabled={!letter} className="rounded-full bg-gradient-to-r from-[#4f8cff] to-[#8a5cff] px-5 py-3 text-sm font-black text-white disabled:opacity-40">Download PDF</button>
          </div>
          {lockedAction ? <div className="mt-4 rounded-2xl border border-[#8fb0ff]/30 bg-[#4f8cff]/12 p-4 text-sm leading-6 text-white/72">This feature is available with PATHZY Premium. You can keep editing and previewing your cover letter here.</div> : null}
        </section>
      </div>

      <section className={`${activePanel !== "design" ? "hidden md:block" : ""} rounded-[28px] border border-white/10 bg-white/7 p-5 md:p-6`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/44">Template Gallery</p>
            <h2 className="mt-2 text-xl font-black text-white">Choose one of 10 cover letter designs</h2>
            <p className="mt-2 text-sm leading-6 text-white/58">Template switching changes presentation only. Your letter content and edits stay the same.</p>
          </div>
          <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-[#c7d6ff]">Recommended: {recommendedTemplate.name}</span>
        </div>
        <div className="mt-5 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {eliteCoverLetterTemplates.map((template) => (
            <button key={template.name} type="button" onClick={() => selectTemplate(template.name)} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${selectedTemplate === template.name ? "border-[#8fb0ff] bg-[#4f8cff]/14 shadow-[0_18px_54px_rgba(91,140,255,.18)]" : "border-white/10 bg-black/18"}`}>
              <TemplateMiniPreview templateName={template.name} />
              <div className="mt-4 flex items-start justify-between gap-2">
                <p className="font-black text-white">{template.name}</p>
                {selectedTemplate === template.name ? <span className="rounded-full bg-[#8fb0ff]/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#c7d6ff]">Selected</span> : null}
              </div>
              <p className="mt-2 text-xs leading-5 text-white/54">Best for: {template.bestFor}</p>
              <p className="mt-2 text-xs leading-5 text-white/42">{template.visualDirection}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/62">Preview</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/62">Select Design</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/7 p-5">
        <h2 className="text-lg font-black text-white">Next actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={appRoutes.professionalIdentity} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/76 transition hover:bg-white/12">Back to My Professional Profile</Link>
          <Link href={appRoutes.roadmap} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/76 transition hover:bg-white/12">Back to My Employment Journey</Link>
          <Link href={appRoutes.opportunities} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/76 transition hover:bg-white/12">Find Opportunities</Link>
          <Link href={appRoutes.applications} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/76 transition hover:bg-white/12">My Applications</Link>
        </div>
      </section>

      <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-white/42">Document readiness</p>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/64">
          {recommendations.map((item) => <li key={item}>- {item}</li>)}
        </ul>
      </div>
    </div>
  );
}
