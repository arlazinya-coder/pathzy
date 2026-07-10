"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { PremiumUpgradeCard } from "@/components/upgrade/premium-upgrade-card";
import { coverLetterDataFromUnknown, coverLetterPdfFilename, cvModelFromUnknown, cvModelWithMissing, downloadBlob, normalizeCoverLetterDataForExport, normalizeCvModelForExport, pathzyFilename, renderCoverLetterHtmlFromData, renderCvHtml, renderCvHtmlFromModel, serializeCoverLetterData, serializeCvModel, simpleCoverLetterPdfDocument, simplePdfDocument, simplePdfDocumentFromModel } from "@/components/professional-identity/document-downloads";
import { appRoutes } from "@/lib/navigation/routes";
import type { CoverLetterData, CvModel } from "@/components/professional-identity/document-downloads";
import type { GeneratedProfessionalDocument, GenerateOptions, ProfessionalLanguage } from "@/lib/professional-identity/professional-identity-types";

type Field = {
  name: keyof GenerateOptions;
  label: string;
  type?: "text" | "textarea" | "select" | "date";
  placeholder?: string;
  options?: string[];
};

type Tool = GeneratedProfessionalDocument["tool"];

const upgradeBenefits = [
  "Unlimited Downloads",
  "Premium PDF exports",
  "Unlimited Saves",
  "ATS Pro",
  "Resume Optimizer",
  "LinkedIn Optimizer",
  "Cover Letter Optimizer",
  "Application Kit"
];

const celebrationCopy: Record<Tool, string> = {
  cv: "Your CV is ready. You are one step closer to applying with confidence.",
  "cover-letter": "Great step. Your application story is getting stronger.",
  linkedin: "LinkedIn optimized. Your professional profile is becoming clearer.",
  "recruiter-message": "Recruiter message created. You are ready to reach out with confidence.",
  "follow-up": "Follow-up email ready. Consistent action strengthens your application.",
  "career-passport": "Career Passport created. Your professional identity is easier to explain now."
};

const mainCvSections = [
  "Professional Summary",
  "Core Competencies / Skills",
  "Professional Experience",
  "Projects",
  "Education",
  "Certifications",
  "Achievements",
  "Languages",
  "References"
];

const optionalCvSections = [
  "Volunteer Experience",
  "Awards",
  "Publications",
  "Conferences",
  "Professional Memberships",
  "Interests",
  "Portfolio Links",
  "GitHub",
  "Website"
];

const skillGroupSections = [
  { label: "Core", title: "Core Competencies / Skills" },
  { label: "Technical", title: "Technical Skills" },
  { label: "Professional", title: "Professional Skills" }
];

const cvDesignSystems = ["ATS Friendly", "Modern Blue", "Professional Green", "Graduate Fresh", "Executive Premium"] as const;

type CvVersionMetadata = {
  designSystem: string;
  versionName: string;
  createdAt: string;
  updatedAt: string;
  lastDownloadedAt: string | null;
  contentSourceId?: string | null;
};

function cvVersionFromDocument(document: GeneratedProfessionalDocument | null, fallbackDesign = "ATS Friendly"): CvVersionMetadata {
  const raw = document?.contentJson?.cvVersion;
  const source = raw && typeof raw === "object" ? raw as Partial<CvVersionMetadata> : {};
  const now = new Date().toISOString();
  const designSystem = typeof source.designSystem === "string" && source.designSystem.trim()
    ? source.designSystem
    : document?.template_name || fallbackDesign;
  return {
    designSystem,
    versionName: typeof source.versionName === "string" && source.versionName.trim() ? source.versionName : document?.title || `${designSystem} CV`,
    createdAt: typeof source.createdAt === "string" && source.createdAt ? source.createdAt : document?.created_at || now,
    updatedAt: typeof source.updatedAt === "string" && source.updatedAt ? source.updatedAt : document?.updated_at || now,
    lastDownloadedAt: typeof source.lastDownloadedAt === "string" && source.lastDownloadedAt ? source.lastDownloadedAt : document?.last_downloaded_at || null,
    contentSourceId: typeof source.contentSourceId === "string" && source.contentSourceId ? source.contentSourceId : document?.id ?? null
  };
}

function cvContentJson(document: GeneratedProfessionalDocument | null, cvModel: CvModel, metadata: CvVersionMetadata) {
  return {
    ...(document?.contentJson ?? {}),
    cvModel: normalizeCvModelForExport(cvModel),
    cvVersion: metadata
  };
}

function getLinkedInFields(document: GeneratedProfessionalDocument | null) {
  const fields = document?.fields ?? {};
  const skills = Array.isArray(fields.skills) ? fields.skills.filter((skill): skill is string => typeof skill === "string") : [];
  const headline = typeof fields.headline === "string" ? fields.headline : document?.title ?? "";
  return {
    headline,
    about: typeof fields.about === "string" ? fields.about : "",
    targetRole: headline.split("|")[0]?.trim() || "Target role",
    experience: typeof fields.experienceSummary === "string" ? fields.experienceSummary : "",
    education: typeof fields.education === "string" ? fields.education : "",
    projects: typeof fields.projects === "string" ? fields.projects : "",
    skills,
    keywords: skills.slice(0, 8),
    suggestions: [
      "Use a professional profile photo.",
      "Keep the headline aligned with your target role.",
      "Add real projects, certificates, or proof of work to Featured.",
      "Ask for recommendations when you have real work others can speak about."
    ]
  };
}

function LinkedInPreview({ document }: { document: GeneratedProfessionalDocument }) {
  const fields = getLinkedInFields(document);

  return (
    <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-[#f8fbff] p-5 text-[#0d1630]">
      <div className="rounded-[20px] bg-white p-5 shadow-[0_18px_55px_rgba(13,22,48,0.12)]">
        <div className="border-b border-[#dbe5f2] pb-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#4d6bb3]">LinkedIn Preview</p>
          <h3 className="mt-2 text-2xl font-black">{fields.headline || "Professional headline"}</h3>
          <p className="mt-2 text-sm font-bold text-[#53617c]">Target Role: {fields.targetRole}</p>
        </div>
        <div className="mt-5 grid gap-5">
          <section>
            <h4 className="text-sm font-black uppercase tracking-[0.12em] text-[#4d6bb3]">About</h4>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#26344f]">{fields.about || "Write a clear About section after generating your LinkedIn profile."}</p>
          </section>
          <section>
            <h4 className="text-sm font-black uppercase tracking-[0.12em] text-[#4d6bb3]">Experience</h4>
            <p className="mt-2 text-sm leading-7 text-[#26344f]">{fields.experience || "Add real experience, projects, volunteering, or responsibilities."}</p>
          </section>
          <section>
            <h4 className="text-sm font-black uppercase tracking-[0.12em] text-[#4d6bb3]">Education</h4>
            <p className="mt-2 text-sm leading-7 text-[#26344f]">{fields.education || "Add your education when ready."}</p>
          </section>
          <section>
            <h4 className="text-sm font-black uppercase tracking-[0.12em] text-[#4d6bb3]">Skills</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {(fields.skills.length ? fields.skills : ["Communication", "Learning agility", "Reliability"]).map((skill) => (
                <span key={skill} className="rounded-full bg-[#edf4ff] px-3 py-2 text-xs font-black text-[#2d4f9f]">{skill}</span>
              ))}
            </div>
          </section>
          <section>
            <h4 className="text-sm font-black uppercase tracking-[0.12em] text-[#4d6bb3]">Featured Projects</h4>
            <p className="mt-2 text-sm leading-7 text-[#26344f]">{fields.projects || "Feature your CV, a portfolio project, a certificate, or a short case study."}</p>
          </section>
          <section>
            <h4 className="text-sm font-black uppercase tracking-[0.12em] text-[#4d6bb3]">Recommended Keywords</h4>
            <p className="mt-2 text-sm leading-7 text-[#26344f]">{fields.keywords.join(", ") || "Add keywords from your target role and skills."}</p>
          </section>
          <section>
            <h4 className="text-sm font-black uppercase tracking-[0.12em] text-[#4d6bb3]">Suggestions</h4>
            <ul className="mt-2 grid gap-2 text-sm leading-6 text-[#26344f]">
              {fields.suggestions.map((suggestion) => <li key={suggestion}>- {suggestion}</li>)}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function CvRepeatableItem({
  value,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  autoFocus = false
}: {
  value: string;
  index: number;
  total: number;
  onChange: (value: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  autoFocus?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const preview = value.trim() || "Empty item";

  useEffect(() => {
    if (!autoFocus || !expanded) return;
    inputRef.current?.focus();
  }, [autoFocus, expanded]);

  return (
    <div className="rounded-[16px] border border-white/10 bg-white/6 p-3">
      <button type="button" onClick={() => setExpanded((current) => !current)} className="flex w-full items-center justify-between gap-3 text-left">
        <span className="line-clamp-1 text-sm font-extrabold text-white/78">{preview}</span>
        <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-extrabold text-white/54">{expanded ? "Collapse" : "Expand"}</span>
      </button>
      {expanded ? (
        <div className="mt-3 grid gap-2">
          <textarea ref={inputRef} className="field min-h-[88px]" value={value} onChange={(event) => onChange(event.target.value)} />
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={index === 0} onClick={onMoveUp} className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-extrabold text-white/70 disabled:cursor-not-allowed disabled:opacity-40">Move up</button>
            <button type="button" disabled={index === total - 1} onClick={onMoveDown} className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-extrabold text-white/70 disabled:cursor-not-allowed disabled:opacity-40">Move down</button>
            <button type="button" onClick={onDuplicate} className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-extrabold text-white/70">Duplicate</button>
            <button type="button" onClick={onRemove} className="rounded-full border border-[#ff6b6b]/25 bg-[#ff6b6b]/10 px-3 py-2 text-xs font-extrabold text-[#ffc5c5]">Remove</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ProfessionalIdentityTool({
  tool,
  title,
  description,
  fields,
  defaultOptions,
  locked = false,
  exportLocked = false,
  trustNote,
  guidance = null
}: {
  tool: Tool;
  title: string;
  description: string;
  fields: Field[];
  defaultOptions?: GenerateOptions;
  locked?: boolean;
  exportLocked?: boolean;
  trustNote: string;
  guidance?: {
    recommendation: string;
    why: string;
    impact: string;
    followHref: string;
    followLabel: string;
    continueLabel: string;
  } | null;
}) {
  const [values, setValues] = useState<GenerateOptions>(defaultOptions ?? { language: "english" });
  const [document, setDocument] = useState<GeneratedProfessionalDocument | null>(null);
  const [cvModel, setCvModel] = useState<CvModel | null>(null);
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [upgradeRequired, setUpgradeRequired] = useState(locked);
  const [exportUpgradeRequired, setExportUpgradeRequired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [downloadNotice, setDownloadNotice] = useState("");
  const [oldCvNotice, setOldCvNotice] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [cvEntryMode, setCvEntryMode] = useState<"choice" | "profile" | "upload">("profile");
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [activeCvSection, setActiveCvSection] = useState("Professional Header");
  const [sectionNotice, setSectionNotice] = useState("");
  const [focusedNewRepeatableItem, setFocusedNewRepeatableItem] = useState("");
  const [previewCvModel, setPreviewCvModel] = useState<CvModel | null>(null);
  const [previewCoverLetterData, setPreviewCoverLetterData] = useState<CoverLetterData | null>(null);
  const [updateLinkedCvVersions, setUpdateLinkedCvVersions] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coverLetterPreviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewScrollRef = useRef<HTMLDivElement | null>(null);

  const outputTitle = useMemo(() => document?.title ?? "Your generated draft will appear here.", [document]);
  const recoveryKey = `pathzy-document-draft:${tool}`;
  const templateName = values.templateName ?? "ATS Friendly";
  const parsedCv = useMemo(() => tool === "cv" && cvModel ? cvModelWithMissing(cvModel) : null, [cvModel, tool]);
  const activeCvVersion = useMemo(() => tool === "cv" ? cvVersionFromDocument(document, templateName) : null, [document, templateName, tool]);

  useEffect(() => {
    if (tool !== "cv" || !activeCvSection) return;
    const frame = window.requestAnimationFrame(() => {
      previewScrollRef.current?.querySelector("#cv-section-active")?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeCvSection, tool]);

  useEffect(() => {
    if (tool !== "cv") return;
    if (!cvModel) {
      setPreviewCvModel(null);
      return;
    }
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      setPreviewCvModel(cvModel);
    }, 260);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [cvModel, tool]);

  useEffect(() => {
    if (tool !== "cover-letter") return;
    if (!coverLetterData) {
      setPreviewCoverLetterData(null);
      return;
    }
    if (coverLetterPreviewTimer.current) clearTimeout(coverLetterPreviewTimer.current);
    coverLetterPreviewTimer.current = setTimeout(() => {
      setPreviewCoverLetterData(coverLetterData);
    }, 260);
    return () => {
      if (coverLetterPreviewTimer.current) clearTimeout(coverLetterPreviewTimer.current);
    };
  }, [coverLetterData, tool]);

  function updateDocumentContent(content: string) {
    if (!document) return;
    const nextCoverLetterData = tool === "cover-letter" ? coverLetterDataFromUnknown(document.contentJson?.coverLetterData, content) : null;
    const next = nextCoverLetterData
      ? { ...document, content: serializeCoverLetterData(nextCoverLetterData), contentJson: { ...(document.contentJson ?? {}), coverLetterData: nextCoverLetterData } }
      : { ...document, content };
    setDocument(next);
    if (nextCoverLetterData) setCoverLetterData(nextCoverLetterData);
    setSaved(false);
    setSaveState("idle");
    setHasUnsavedChanges(true);
    window.localStorage.setItem(recoveryKey, JSON.stringify(next));
  }

  function cvModelFromDocument(nextDocument: GeneratedProfessionalDocument) {
    return cvModelFromUnknown(nextDocument.contentJson?.cvModel, nextDocument.content);
  }

  function setCvDocument(nextDocument: GeneratedProfessionalDocument, markSaved: boolean) {
    const nextModel = cvModelFromDocument(nextDocument);
    const content = serializeCvModel(nextModel);
    const version = cvVersionFromDocument(nextDocument, nextDocument.template_name ?? values.templateName ?? "ATS Friendly");
    const next = { ...nextDocument, title: version.versionName, content, template_name: version.designSystem, contentJson: { ...(nextDocument.contentJson ?? {}), cvModel: nextModel, cvVersion: version } };
    setDocument(next);
    setCvModel(nextModel);
    setPreviewCvModel(nextModel);
    setValues((current) => ({ ...current, templateName: version.designSystem as GenerateOptions["templateName"] }));
    setSaved(markSaved);
    setSaveState(markSaved ? "saved" : "idle");
    setHasUnsavedChanges(!markSaved);
    if (markSaved) window.localStorage.removeItem(recoveryKey);
    else window.localStorage.setItem(recoveryKey, JSON.stringify(next));
  }

  function setCoverLetterDocument(nextDocument: GeneratedProfessionalDocument, markSaved: boolean) {
    const nextData = coverLetterDataFromUnknown(nextDocument.contentJson?.coverLetterData, nextDocument.content);
    const content = serializeCoverLetterData(nextData);
    const next = { ...nextDocument, content, contentJson: { ...(nextDocument.contentJson ?? {}), coverLetterData: nextData } };
    setDocument(next);
    setCoverLetterData(nextData);
    setPreviewCoverLetterData(nextData);
    setSaved(markSaved);
    setSaveState(markSaved ? "saved" : "idle");
    setHasUnsavedChanges(!markSaved);
    if (markSaved) window.localStorage.removeItem(recoveryKey);
    else window.localStorage.setItem(recoveryKey, JSON.stringify(next));
  }

  function updateCoverLetterDraft(mutator: (draft: CoverLetterData) => void) {
    if (!coverLetterData || !document) return;
    const draft = JSON.parse(JSON.stringify(coverLetterData)) as CoverLetterData;
    mutator(draft);
    const content = serializeCoverLetterData(draft);
    const next = { ...document, content, contentJson: { ...(document.contentJson ?? {}), coverLetterData: draft } };
    setCoverLetterData(draft);
    setDocument(next);
    setSaved(false);
    setSaveState("idle");
    setHasUnsavedChanges(true);
    window.localStorage.setItem(recoveryKey, JSON.stringify(next));
  }

  function updateCvDraft(mutator: (draft: CvModel) => void, immediatePreview = false) {
    if (!cvModel || !document) return;
    const draft = JSON.parse(JSON.stringify(cvModel)) as CvModel;
    mutator(draft);
    const content = serializeCvModel(draft);
    const version = { ...cvVersionFromDocument(document, templateName), designSystem: templateName, updatedAt: new Date().toISOString() };
    const next = { ...document, content, contentJson: { ...(document.contentJson ?? {}), cvModel: draft, cvVersion: version }, template_name: version.designSystem };
    setCvModel(draft);
    if (immediatePreview) setPreviewCvModel(draft);
    setDocument(next);
    setSaved(false);
    setSaveState("idle");
    setHasUnsavedChanges(true);
    window.localStorage.setItem(recoveryKey, JSON.stringify(next));
  }

  function ensureCvSection(title: string) {
    updateCvSectionItems(title, cvSectionItems(title).length ? cvSectionItems(title) : [""]);
    setActiveCvSection(title);
    setSectionNotice(`${title} added. Status: Empty until you add content.`);
  }

  function cvSectionItems(title: string) {
    if (!cvModel) return [];
    if (title === "Professional Summary") return cvModel.professionalSummary ? [cvModel.professionalSummary] : [];
    if (title === "Core Competencies / Skills") return cvModel.coreSkills;
    if (title === "Technical Skills") return cvModel.technicalSkills;
    if (title === "Professional Skills") return cvModel.professionalSkills;
    if (title === "Professional Experience") return cvModel.professionalExperience.map((item) => [item.role, item.company, item.location, item.startDate, item.current ? "Present" : item.endDate, ...item.achievements].filter(Boolean).join(" | "));
    if (title === "Projects") return cvModel.projects.map((item) => [item.projectName, item.role, item.tools.join(", "), item.description, item.impact].filter(Boolean).join(" | "));
    if (title === "Education") return cvModel.education.map((item) => [item.qualification, item.institution, item.fieldOfStudy, item.year, item.status].filter(Boolean).join(" | "));
    if (title === "Certifications") return cvModel.certifications.map((item) => [item.name, item.provider, item.year, item.credentialUrl].filter(Boolean).join(" | "));
    if (title === "Achievements") return cvModel.achievements;
    if (title === "Languages") return cvModel.languages.map((item) => [item.language, item.level].filter(Boolean).join(" | "));
    if (title === "References") return [...cvModel.references.items, cvModel.references.availableUponRequest ? "Available upon request" : ""].filter(Boolean);
    if (title === "Volunteer Experience") return cvModel.optionalSections.volunteerExperience;
    if (title === "Awards") return cvModel.optionalSections.awards;
    if (title === "Publications") return cvModel.optionalSections.publications;
    if (title === "Conferences") return cvModel.optionalSections.conferences;
    if (title === "Professional Memberships") return cvModel.optionalSections.professionalMemberships;
    if (title === "Interests") return cvModel.optionalSections.interests;
    if (title === "Portfolio Links") return cvModel.optionalSections.portfolioLinks;
    if (title === "GitHub") return cvModel.github ? [cvModel.github] : [];
    if (title === "Website") return cvModel.website ? [cvModel.website] : [];
    return [];
  }

  function updateCvSectionItems(title: string, items: string[]) {
    updateCvDraft((draft) => {
      if (title === "Professional Summary") draft.professionalSummary = items[0] ?? "";
      else if (title === "Core Competencies / Skills") draft.coreSkills = items;
      else if (title === "Technical Skills") draft.technicalSkills = items;
      else if (title === "Professional Skills") draft.professionalSkills = items;
      else if (title === "Professional Experience") draft.professionalExperience = items.map((item) => ({ role: item, company: "", location: "", startDate: "", endDate: "", current: false, achievements: [] }));
      else if (title === "Projects") draft.projects = items.map((item) => ({ projectName: item, role: "", tools: [], description: "", impact: "" }));
      else if (title === "Education") draft.education = items.map((item) => ({ qualification: item, institution: "", fieldOfStudy: "", year: "", status: "" }));
      else if (title === "Certifications") draft.certifications = items.map((item) => ({ name: item, provider: "", year: "", credentialUrl: "" }));
      else if (title === "Achievements") draft.achievements = items;
      else if (title === "Languages") draft.languages = items.map((item) => ({ language: item, level: "" }));
      else if (title === "References") draft.references = { availableUponRequest: items.some((item) => /available upon request/i.test(item)), items: items.filter((item) => !/available upon request/i.test(item)) };
      else if (title === "Volunteer Experience") draft.optionalSections.volunteerExperience = items;
      else if (title === "Awards") draft.optionalSections.awards = items;
      else if (title === "Publications") draft.optionalSections.publications = items;
      else if (title === "Conferences") draft.optionalSections.conferences = items;
      else if (title === "Professional Memberships") draft.optionalSections.professionalMemberships = items;
      else if (title === "Interests") draft.optionalSections.interests = items;
      else if (title === "Portfolio Links") draft.optionalSections.portfolioLinks = items;
      else if (title === "GitHub") draft.github = items[0] ?? "";
      else if (title === "Website") draft.website = items[0] ?? "";
    }, true);
    setActiveCvSection(title);
  }

  function removeCvSection(title: string) {
    updateCvSectionItems(title, []);
    setSectionNotice(`${title} hidden. Status: Hidden.`);
  }

  function sectionStatus(title: string, items: string[], optional = false) {
    if (!items.length) return optional ? "Hidden" : "Empty";
    return items.some((item) => item.trim()) ? "Visible" : "Empty";
  }

  function statusClasses(status: string) {
    if (status === "Visible") return "border-[#39d98a]/25 bg-[#39d98a]/10 text-[#b9f8d5]";
    if (status === "Empty") return "border-[#f8c45d]/25 bg-[#f8c45d]/10 text-[#ffe2a8]";
    return "border-white/12 bg-white/8 text-white/54";
  }

  function renderRepeatableSection(title: string, options: { optional?: boolean } = {}) {
    const items = cvSectionItems(title);
    const editableItems = items.length ? items : [""];
    const status = sectionStatus(title, items, options.optional);

    return (
      <div key={title} className={`rounded-[20px] border p-4 ${activeCvSection === title ? "border-[#5B8CFF]/45 bg-[#5B8CFF]/10" : "border-white/10 bg-white/6"}`} onClick={() => setActiveCvSection(title)} onFocus={() => setActiveCvSection(title)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-white">{title}</p>
            <p className="mt-1 text-xs font-bold text-white/48">{status === "Visible" ? "This section is shown in the CV preview." : status === "Empty" ? "This section is ready, but hidden until it has content." : "This section is hidden from the CV preview."}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full border px-3 py-2 text-xs font-extrabold ${statusClasses(status)}`}>{status}</span>
            <button type="button" onClick={() => removeCvSection(title)} className="w-fit rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-extrabold text-white/66">Clear</button>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          {editableItems.map((item, index) => (
            <CvRepeatableItem
              key={`${title}-${index}`}
              value={item}
              index={index}
              total={editableItems.length}
              autoFocus={focusedNewRepeatableItem === `${title}-${index}`}
              onChange={(value) => {
                const next = [...editableItems];
                next[index] = value;
                updateCvSectionItems(title, next);
              }}
              onMoveUp={() => {
                const next = [...editableItems];
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                updateCvSectionItems(title, next);
              }}
              onMoveDown={() => {
                const next = [...editableItems];
                [next[index], next[index + 1]] = [next[index + 1], next[index]];
                updateCvSectionItems(title, next);
              }}
              onDuplicate={() => {
                const next = [...editableItems];
                next.splice(index + 1, 0, item);
                updateCvSectionItems(title, next);
              }}
              onRemove={() => {
                const next = editableItems.filter((_, itemIndex) => itemIndex !== index);
                updateCvSectionItems(title, next);
              }}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              const next = [...editableItems, ""];
              setFocusedNewRepeatableItem(`${title}-${next.length - 1}`);
              updateCvSectionItems(title, next);
            }}
            className="w-fit rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-extrabold text-white"
          >
            Add item
          </button>
        </div>
      </div>
    );
  }

  function renderSkillGroup(label: string, title: string) {
    const items = cvSectionItems(title);
    const editableItems = items.length ? items : [""];
    const status = sectionStatus(title, items);

    return (
      <div key={title} className={`rounded-[18px] border p-4 ${activeCvSection === title ? "border-[#5B8CFF]/45 bg-[#5B8CFF]/10" : "border-white/10 bg-white/6"}`} onClick={() => setActiveCvSection(title)} onFocus={() => setActiveCvSection(title)}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-white">{label}</p>
            <p className="mt-1 text-xs font-bold text-white/48">{status === "Visible" ? "This skill group is shown in the CV preview." : status === "Empty" ? "Add at least one skill to show this group in the preview." : "This skill group is hidden from the CV preview."}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full border px-3 py-2 text-xs font-extrabold ${statusClasses(status)}`}>{status}</span>
            <button type="button" onClick={() => removeCvSection(title)} className="w-fit rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-extrabold text-white/66">Clear</button>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          {editableItems.map((item, index) => (
            <CvRepeatableItem
              key={`${title}-${index}`}
              value={item}
              index={index}
              total={editableItems.length}
              autoFocus={focusedNewRepeatableItem === `${title}-${index}`}
              onChange={(value) => {
                const next = [...editableItems];
                next[index] = value;
                updateCvSectionItems(title, next);
              }}
              onMoveUp={() => {
                const next = [...editableItems];
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                updateCvSectionItems(title, next);
              }}
              onMoveDown={() => {
                const next = [...editableItems];
                [next[index], next[index + 1]] = [next[index + 1], next[index]];
                updateCvSectionItems(title, next);
              }}
              onDuplicate={() => {
                const next = [...editableItems];
                next.splice(index + 1, 0, item);
                updateCvSectionItems(title, next);
              }}
              onRemove={() => {
                const next = editableItems.filter((_, itemIndex) => itemIndex !== index);
                updateCvSectionItems(title, next);
              }}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              const next = [...editableItems, ""];
              setFocusedNewRepeatableItem(`${title}-${next.length - 1}`);
              updateCvSectionItems(title, next);
            }}
            className="w-fit rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-extrabold text-white"
          >
            Add item
          </button>
        </div>
      </div>
    );
  }

  function renderSkillsSection() {
    const items = skillGroupSections.flatMap((group) => cvSectionItems(group.title));
    const status = sectionStatus("Core Competencies / Skills", items);

    return (
      <div className={`rounded-[20px] border p-5 ${skillGroupSections.some((group) => activeCvSection === group.title) ? "border-[#5B8CFF]/45 bg-[#5B8CFF]/10" : "border-white/10 bg-white/6"}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="pr-2">
            <p className="text-sm font-extrabold leading-6 text-white">Core Competencies / Skills</p>
            <p className="mt-1 text-xs font-bold leading-5 text-white/48">Add Core, Technical, and Professional skills separately. Each group updates the CV preview immediately.</p>
          </div>
          <span className={`w-fit rounded-full border px-3 py-2 text-xs font-extrabold ${statusClasses(status)}`}>{status}</span>
        </div>
        <div className="mt-5 grid gap-4">
          {skillGroupSections.map((group) => renderSkillGroup(group.label, group.title))}
        </div>
      </div>
    );
  }

  function renderCoverLetterField(label: string, value: string, onChange: (value: string) => void, multiline = false) {
    return (
      <label className="label">
        {label}
        {multiline ? (
          <textarea className="field min-h-[108px]" value={value} onChange={(event) => onChange(event.target.value)} />
        ) : (
          <input className="field" value={value} onChange={(event) => onChange(event.target.value)} />
        )}
      </label>
    );
  }

  function renderCoverLetterSection(title: string, children: ReactNode) {
    return (
      <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-white">{title}</p>
            <p className="mt-1 text-xs font-bold text-white/48">Changes update your cover letter data and preview.</p>
          </div>
          <span className="w-fit rounded-full border border-[#39d98a]/25 bg-[#39d98a]/10 px-3 py-2 text-xs font-extrabold text-[#b9f8d5]">Editable</span>
        </div>
        <div className="mt-4 grid gap-3">{children}</div>
      </div>
    );
  }

  function renderBodyParagraphsEditor() {
    if (!coverLetterData) return null;
    const paragraphs = coverLetterData.bodyParagraphs.length ? coverLetterData.bodyParagraphs : [""];
    return renderCoverLetterSection(
      "5. Body Paragraphs",
      <>
        {paragraphs.map((paragraph, index) => (
          <CvRepeatableItem
            key={`cover-body-${index}`}
            value={paragraph}
            index={index}
            total={paragraphs.length}
            autoFocus={focusedNewRepeatableItem === `Cover Letter Body-${index}`}
            onChange={(value) => updateCoverLetterDraft((draft) => {
              const next = [...paragraphs];
              next[index] = value;
              draft.bodyParagraphs = next;
            })}
            onMoveUp={() => updateCoverLetterDraft((draft) => {
              const next = [...paragraphs];
              [next[index - 1], next[index]] = [next[index], next[index - 1]];
              draft.bodyParagraphs = next;
            })}
            onMoveDown={() => updateCoverLetterDraft((draft) => {
              const next = [...paragraphs];
              [next[index], next[index + 1]] = [next[index + 1], next[index]];
              draft.bodyParagraphs = next;
            })}
            onDuplicate={() => updateCoverLetterDraft((draft) => {
              const next = [...paragraphs];
              next.splice(index + 1, 0, paragraph);
              draft.bodyParagraphs = next;
            })}
            onRemove={() => updateCoverLetterDraft((draft) => {
              draft.bodyParagraphs = paragraphs.filter((_, paragraphIndex) => paragraphIndex !== index);
            })}
          />
        ))}
        <button
          type="button"
          onClick={() => {
            const next = [...paragraphs, ""];
            setFocusedNewRepeatableItem(`Cover Letter Body-${next.length - 1}`);
            updateCoverLetterDraft((draft) => {
              draft.bodyParagraphs = next;
            });
          }}
          className="w-fit rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-extrabold text-white"
        >
          Add paragraph
        </button>
      </>
    );
  }

  function renderCoverLetterEditor() {
    if (!coverLetterData) return null;

    return (
      <div className="mt-5 grid gap-4">
        {renderCoverLetterSection("1. Personal Header", (
          <>
            {renderCoverLetterField("Full name", coverLetterData.fullName, (value) => updateCoverLetterDraft((draft) => { draft.fullName = value; }))}
            {renderCoverLetterField("Phone", coverLetterData.phone, (value) => updateCoverLetterDraft((draft) => { draft.phone = value; }))}
            {renderCoverLetterField("Email", coverLetterData.email, (value) => updateCoverLetterDraft((draft) => { draft.email = value; }))}
            {renderCoverLetterField("LinkedIn", coverLetterData.linkedIn, (value) => updateCoverLetterDraft((draft) => { draft.linkedIn = value; }))}
            {renderCoverLetterField("City", coverLetterData.city, (value) => updateCoverLetterDraft((draft) => { draft.city = value; }))}
            {renderCoverLetterField("Country", coverLetterData.country, (value) => updateCoverLetterDraft((draft) => { draft.country = value; }))}
          </>
        ))}
        {renderCoverLetterSection("2. Employer Details", (
          <>
            {renderCoverLetterField("Company name", coverLetterData.companyName, (value) => updateCoverLetterDraft((draft) => { draft.companyName = value; }))}
            {renderCoverLetterField("Hiring manager", coverLetterData.hiringManager, (value) => updateCoverLetterDraft((draft) => { draft.hiringManager = value; }))}
            {renderCoverLetterField("Job title", coverLetterData.jobTitle, (value) => updateCoverLetterDraft((draft) => { draft.jobTitle = value; }))}
            {renderCoverLetterField("Company address", coverLetterData.companyAddress, (value) => updateCoverLetterDraft((draft) => { draft.companyAddress = value; }))}
            {renderCoverLetterField("Date", coverLetterData.date, (value) => updateCoverLetterDraft((draft) => { draft.date = value; }))}
          </>
        ))}
        {renderCoverLetterSection("3. Greeting", renderCoverLetterField("Greeting", coverLetterData.greeting, (value) => updateCoverLetterDraft((draft) => { draft.greeting = value; })))}
        {renderCoverLetterSection("4. Opening Paragraph", renderCoverLetterField("Opening paragraph", coverLetterData.openingParagraph, (value) => updateCoverLetterDraft((draft) => { draft.openingParagraph = value; }), true))}
        {renderBodyParagraphsEditor()}
        {renderCoverLetterSection("6. Closing Paragraph", renderCoverLetterField("Closing paragraph", coverLetterData.closingParagraph, (value) => updateCoverLetterDraft((draft) => { draft.closingParagraph = value; }), true))}
        {renderCoverLetterSection("7. Signature", renderCoverLetterField("Signature", coverLetterData.signature, (value) => updateCoverLetterDraft((draft) => { draft.signature = value; })))}
      </div>
    );
  }

  function updateValue(name: keyof GenerateOptions, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    if (document && name === "templateName" && tool === "cv" && cvModel) {
      const version = { ...cvVersionFromDocument(document, value), designSystem: value, updatedAt: new Date().toISOString() };
      const next = { ...document, template_name: value, contentJson: { ...(document.contentJson ?? {}), cvModel, cvVersion: version } };
      setDocument(next);
      setPreviewCvModel(cvModel);
      window.localStorage.setItem(recoveryKey, JSON.stringify(next));
      setSaved(false);
      setSaveState("idle");
      setHasUnsavedChanges(true);
      return;
    }
    if (document && name === "templateName") {
      setSaved(false);
      setSaveState("idle");
      setHasUnsavedChanges(true);
    }
  }

  function renameCvVersion(versionName: string) {
    if (!document || !cvModel) return;
    const version = { ...cvVersionFromDocument(document, templateName), versionName, updatedAt: new Date().toISOString() };
    const next = { ...document, title: versionName, contentJson: { ...(document.contentJson ?? {}), cvModel, cvVersion: version } };
    setDocument(next);
    setSaved(false);
    setSaveState("idle");
    setHasUnsavedChanges(true);
    window.localStorage.setItem(recoveryKey, JSON.stringify(next));
  }

  async function duplicateCvVersion() {
    if (!document?.id || !cvModel) return;
    setError("");
    const source = cvVersionFromDocument(document, templateName);
    const now = new Date().toISOString();
    const copyName = `${source.versionName} copy`;
    try {
      const response = await fetch("/api/professional-identity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: document.id,
          tool: document.tool,
          title: copyName,
          duplicate: true,
          templateName,
          contentJson: cvContentJson(document, cvModel, {
            ...source,
            versionName: copyName,
            designSystem: templateName,
            createdAt: now,
            updatedAt: now,
            lastDownloadedAt: null
          })
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not duplicate CV version.");
      setCvDocument({
        id: data.document.id,
        tool: "cv",
        title: data.document.document_title ?? copyName,
        content: data.document.content_text ?? document.content,
        contentJson: data.document.content_json ?? document.contentJson,
        template_name: data.document.template_name ?? templateName,
        version_number: data.document.version_number,
        created_at: data.document.created_at,
        updated_at: data.document.updated_at,
        last_downloaded_at: data.document.last_downloaded_at
      }, true);
      setDownloadNotice("CV version duplicated. You can now switch design without changing your original content.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not duplicate CV version.");
    }
  }

  useEffect(() => {
    const recovered = window.localStorage.getItem(recoveryKey);
    if (!recovered) return;
    try {
      const parsed = JSON.parse(recovered) as GeneratedProfessionalDocument;
      if (parsed?.content && !document) {
        if (tool === "cv") setCvDocument(parsed, false);
        else if (tool === "cover-letter") setCoverLetterDocument(parsed, false);
        else {
          setDocument(parsed);
          setSaveState("idle");
          setHasUnsavedChanges(true);
        }
      }
    } catch {
      window.localStorage.removeItem(recoveryKey);
    }
  }, [document, recoveryKey]);

  useEffect(() => {
    if (document || tool !== "cv") return;
    let cancelled = false;
    async function loadLatestDraft() {
      try {
        const response = await fetch("/api/professional-identity", { cache: "no-store" });
        const data = await response.json();
        const latest = (data.documents ?? []).find((item: GeneratedProfessionalDocument & { template_name?: string }) => item.tool === tool);
        if (!cancelled && latest?.content) {
          setCvDocument({ id: latest.id, tool, title: latest.title, content: latest.content, contentJson: latest.contentJson ?? null }, true);
          setValues((current) => ({ ...current, templateName: latest.template_name ?? current.templateName ?? "ATS Friendly" }));
          setCvEntryMode("profile");
          setViewMode("preview");
        }
      } catch {
        // Local recovery still protects user work when server recovery is unavailable.
      }
    }
    void loadLatestDraft();
    return () => {
      cancelled = true;
    };
  }, [document, tool]);

  useEffect(() => {
    function warnBeforeLeave(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!document?.id || !hasUnsavedChanges) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      void saveDocument(true);
    }, 900);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [document?.content, document?.title, document?.id, hasUnsavedChanges, templateName]);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (upgradeRequired) return;

    setLoading(true);
    setError("");
    setCopied(false);
    setXpAwarded(null);

    try {
      const response = await fetch("/api/professional-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, options: values, replaceDocumentId: document?.id })
      });
      const data = await response.json();

      if (data?.upgradeRequired) {
        setUpgradeRequired(true);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Could not generate this document.");
      }

      if (tool === "cv") setCvDocument(data.document, true);
      else if (tool === "cover-letter") setCoverLetterDocument(data.document, true);
      else setDocument(data.document);
      setXpAwarded(typeof data.xpAwarded === "number" ? data.xpAwarded : null);
      if (tool !== "cv") {
        setSaved(true);
        setSaveState("saved");
        setHasUnsavedChanges(false);
      }
      setViewMode("preview");
      window.localStorage.removeItem(recoveryKey);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not generate this document.");
    } finally {
      setLoading(false);
    }
  }

  async function regenerateCurrentDraft() {
    if (upgradeRequired) return;

    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const response = await fetch("/api/professional-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, options: values, replaceDocumentId: document?.id })
      });
      const data = await response.json();

      if (data?.upgradeRequired) {
        setUpgradeRequired(true);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Could not improve this document.");
      }

      if (tool === "cv") setCvDocument(data.document, true);
      else if (tool === "cover-letter") setCoverLetterDocument(data.document, true);
      else setDocument(data.document);
      setSaved(true);
      setSaveState("saved");
      setHasUnsavedChanges(false);
      setViewMode("preview");
      window.localStorage.removeItem(recoveryKey);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not improve this document.");
    } finally {
      setLoading(false);
    }
  }

  async function copyDocument() {
    if (!document?.content) return;
    await navigator.clipboard.writeText(document.content);
    setCopied(true);
  }

  async function copyTextValue(value: string) {
    if (!value.trim()) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
  }

  async function saveDocument(silent = false) {
    if (!document?.id) return false;
    setError("");
    if (!silent) setSaved(false);
    setSaveState("saving");
    try {
      const response = await fetch("/api/professional-identity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: document.id,
          tool: document.tool,
          title: document.title,
          content: tool === "cover-letter" && coverLetterData ? serializeCoverLetterData(coverLetterData) : document.content,
          contentJson: tool === "cv" && cvModel
            ? cvContentJson(document, cvModel, { ...cvVersionFromDocument(document, templateName), designSystem: templateName, versionName: document.title, updatedAt: new Date().toISOString() })
            : tool === "cover-letter" && coverLetterData ? { coverLetterData: normalizeCoverLetterDataForExport(coverLetterData) } : undefined,
          templateName,
          updateLinkedVersions: tool === "cv" ? updateLinkedCvVersions : false
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save this document.");
      setSaved(true);
      setSaveState("saved");
      setHasUnsavedChanges(false);
      window.localStorage.removeItem(recoveryKey);
      return true;
    } catch (caught) {
      window.localStorage.setItem(recoveryKey, JSON.stringify(document));
      setSaveState("error");
      setError(caught instanceof Error ? caught.message : "Could not save this document.");
      return false;
    }
  }

  async function markDownloaded() {
    if (!document?.id) return;
    const downloadedAt = new Date().toISOString();
    await fetch("/api/professional-identity", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: document.id,
        tool: document.tool,
        downloaded: true,
        contentJson: tool === "cv" && cvModel
          ? cvContentJson(document, cvModel, { ...cvVersionFromDocument(document, templateName), designSystem: templateName, lastDownloadedAt: downloadedAt, updatedAt: downloadedAt })
          : undefined
      })
    });
  }

  async function downloadPdf() {
    if (!document?.content) {
      setError("Please generate your document before downloading.");
      return;
    }
    if (tool !== "cover-letter" && (hasUnsavedChanges || saveState === "error" || !saved)) {
      setError("Please save your document before downloading.");
      return;
    }
    if (exportLocked) {
      setExportUpgradeRequired(true);
      return;
    }
    try {
      if (tool === "cover-letter" && coverLetterData && (hasUnsavedChanges || saveState === "error" || !saved)) {
        const saveOk = await saveDocument(true);
        if (!saveOk) return;
      }
      const exportCoverLetterData = coverLetterData ? normalizeCoverLetterDataForExport(coverLetterData) : null;
      const pdf = tool === "cv" && cvModel
        ? simplePdfDocumentFromModel(document.title, cvModel, templateName)
        : tool === "cover-letter" && exportCoverLetterData
          ? simpleCoverLetterPdfDocument(exportCoverLetterData)
          : simplePdfDocument(document.title, document.content, templateName, false);
      downloadBlob(tool === "cover-letter" && exportCoverLetterData ? coverLetterPdfFilename(exportCoverLetterData) : pathzyFilename(tool === "cv" ? "CV" : "Document", document.title, "pdf"), "application/pdf", pdf);
      await markDownloaded();
      setDownloadNotice("Your file has downloaded to your browser's Downloads folder.");
    } catch {
      setError("Download failed. Your document is still saved. Please try again.");
    }
  }

  async function handleOldCvUpload(file: File | null) {
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg"];
    if (!allowed.includes(file.type)) {
      setOldCvNotice("Unsupported file type. Please upload PDF, DOCX, PNG, JPG, or JPEG.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setOldCvNotice("This file is too large. Please upload a file smaller than 8MB.");
      return;
    }
    setOldCvNotice("Saving your uploaded CV record...");
    try {
      const response = await fetch("/api/professional-identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "uploaded-document",
          upload: {
            documentType: "old_cv",
            title: `Old CV - ${file.name}`,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            content: values.oldCvText ?? "",
            status: "draft"
          }
        })
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error ?? "Could not save uploaded CV.");
      setOldCvNotice("Your old CV record is saved in My Documents. PATHZY could not read this file clearly in the browser, so paste the CV text below and rebuild it.");
    } catch (caught) {
      console.error("[professional-identity] old CV upload save failed", caught);
      setOldCvNotice("We could not save the upload record yet. Your file was not changed. Paste the CV text below, then try again when your connection is stable.");
    }
    setValues((current) => ({
      ...current,
      oldCvText: current.oldCvText || ""
    }));
  }

  if (upgradeRequired || exportUpgradeRequired) {
    return (
      <PremiumUpgradeCard
        title={exportUpgradeRequired ? "Your document is ready." : "Upgrade when you are ready to export."}
        subtitle={exportUpgradeRequired ? "Upgrade to download and export your documents with confidence. Your saved draft stays available." : "Free users can build, edit, save, and preview core documents. Pro unlocks premium downloads, exports, advanced optimization, and application kits."}
        benefits={upgradeBenefits}
        primaryLabel="Upgrade to Starter - $9.99/month"
        secondaryLabel="View pricing later"
        onSecondary={() => {
          setExportUpgradeRequired(false);
          if (!locked) setUpgradeRequired(false);
        }}
      />
    );
  }

  const workspaceClass = tool === "cv" ? "grid gap-5 lg:grid-cols-4" : tool === "cover-letter" ? "grid gap-5 lg:grid-cols-2" : "grid gap-5 lg:grid-cols-[.82fr_1fr]";

  return (
    <div className={workspaceClass}>
      <Card className={tool === "cv" ? "lg:col-span-4" : tool === "cover-letter" ? "lg:col-span-2" : undefined}>
        {tool === "cv" ? (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">{document ? "CV generated" : "Generate your CV"}</p>
              <h2 className="mt-2 text-2xl font-black">{document ? outputTitle : title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/58">{document ? "Your draft is ready. Keep editing below, save changes, or regenerate from your latest PATHZY profile." : description}</p>
            </div>
            <form onSubmit={generate} className="grid w-full gap-3 lg:max-w-3xl lg:grid-cols-[.85fr_1.15fr_.95fr_auto_auto] lg:items-end">
              <label className="label">
                Language
                <select className="field" value={values.language ?? "english"} onChange={(event) => updateValue("language", event.target.value as ProfessionalLanguage)}>
                  <option value="english">English</option>
                  <option value="french">French</option>
                </select>
              </label>
              <label className="label">
                Template
                <select className="field" value={values.templateName ?? "ATS Friendly"} onChange={(event) => updateValue("templateName", event.target.value)}>
                  {cvDesignSystems.map((template) => (
                    <option key={template} value={template}>{template}</option>
                  ))}
                </select>
              </label>
              {fields.map((field) => (
                <label key={field.name} className="label">
                  {field.label}
                  {field.type === "select" ? (
                    <select className="field" value={(values[field.name] as string | undefined) ?? field.options?.[0] ?? ""} onChange={(event) => updateValue(field.name, event.target.value)}>
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input className="field" type={field.type ?? "text"} placeholder={field.placeholder} value={(values[field.name] as string | undefined) ?? ""} onChange={(event) => updateValue(field.name, event.target.value)} />
                  )}
                </label>
              ))}
              <button disabled={loading} className="h-[46px] rounded-full blue-purple px-5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Generating" : document ? "Regenerate" : "Generate"}
              </button>
              <button type="button" onClick={() => setCvEntryMode(cvEntryMode === "upload" ? "profile" : "upload")} className="h-[46px] rounded-full border border-white/12 bg-white/8 px-5 text-sm font-extrabold text-white/82">
                {cvEntryMode === "upload" ? "Use Profile" : "Upload CV"}
              </button>
              {cvEntryMode === "upload" ? (
                <div id="old-cv-upload" className="rounded-[18px] border border-white/10 bg-white/6 p-4 lg:col-span-5">
                  <p className="text-sm font-extrabold text-white">Upload old CV</p>
                  <input className="mt-3 block w-full text-sm text-white/62 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-extrabold file:text-white" type="file" accept=".pdf,.docx,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg" onChange={(event) => handleOldCvUpload(event.target.files?.[0] ?? null)} />
                  {oldCvNotice ? <p className="mt-3 rounded-[16px] border border-[#f8c45d]/25 bg-[#f8c45d]/10 px-4 py-3 text-sm font-bold text-[#ffe2a8]">{oldCvNotice}</p> : null}
                  <textarea className="field mt-3 min-h-[96px]" placeholder="Paste text from your old CV here." value={values.oldCvText ?? ""} onChange={(event) => updateValue("oldCvText", event.target.value)} />
                </div>
              ) : null}
            </form>
            {document && cvModel && activeCvVersion ? (
              <div className="rounded-[22px] border border-[#5B8CFF]/25 bg-[#5B8CFF]/10 p-4 lg:col-span-2">
                <div className="grid gap-3 lg:grid-cols-[1.2fr_.9fr_auto] lg:items-end">
                  <label className="label">
                    CV version name
                    <input className="field" value={activeCvVersion.versionName} onChange={(event) => renameCvVersion(event.target.value)} />
                  </label>
                  <label className="label">
                    Design system
                    <select className="field" value={activeCvVersion.designSystem} onChange={(event) => updateValue("templateName", event.target.value)}>
                      {cvDesignSystems.map((template) => (
                        <option key={template} value={template}>{template}</option>
                      ))}
                    </select>
                  </label>
                  <button type="button" onClick={duplicateCvVersion} className="h-[46px] rounded-full border border-white/12 bg-white/8 px-5 text-sm font-extrabold text-white/82">
                    Duplicate CV
                  </button>
                </div>
                <div className="mt-3 grid gap-2 text-xs font-bold text-[#c7d6ff]/80 sm:grid-cols-3">
                  <span>Design changes only the layout.</span>
                  <span>Content source: one CV model.</span>
                  <span>Updated: {new Date(activeCvVersion.updatedAt).toLocaleDateString()}</span>
                </div>
                <label className="mt-4 flex items-start gap-3 rounded-[16px] border border-white/10 bg-white/6 p-3 text-sm font-bold text-white/70">
                  <input type="checkbox" className="mt-1" checked={updateLinkedCvVersions} onChange={(event) => setUpdateLinkedCvVersions(event.target.checked)} />
                  <span>When I save content edits, also update linked CV versions that share this content source.</span>
                </label>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="mt-3 leading-7 text-white/62">{description}</p>
            <p className="mt-4 rounded-[16px] border border-[#39d98a]/20 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold leading-6 text-[#b9f8d5]">{trustNote}</p>
            {guidance ? (
              <div className="mt-4 rounded-[18px] border border-[#5B8CFF]/25 bg-[#5B8CFF]/10 p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#c7d6ff]/72">Recommended</p>
                <h3 className="mt-2 text-lg font-black">{guidance.recommendation}</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">{guidance.why}</p>
                <p className="mt-2 text-sm font-extrabold text-[#9df0c4]">{guidance.impact}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={guidance.followHref} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">
                    {guidance.followLabel}
                  </Link>
                  <span className="rounded-full bg-white/8 px-4 py-2 text-sm font-extrabold text-white/70">{guidance.continueLabel}</span>
                </div>
              </div>
            ) : null}
            <form onSubmit={generate} className="mt-6 grid gap-4">
              <label className="label">
                Language
                <select className="field" value={values.language ?? "english"} onChange={(event) => updateValue("language", event.target.value as ProfessionalLanguage)}>
                  <option value="english">English</option>
                  <option value="french">French</option>
                </select>
              </label>
              {(tool === "cover-letter") ? (
                <label className="label">
                  Premium template
                  <select className="field" value={values.templateName ?? "ATS Friendly"} onChange={(event) => updateValue("templateName", event.target.value)}>
                    {cvDesignSystems.map((template) => (
                      <option key={template} value={template}>{template}</option>
                    ))}
                  </select>
                </label>
              ) : null}
              {fields.map((field) => (
                <label key={field.name} className="label">
                  {field.label}
                  {field.type === "textarea" ? (
                    <textarea className="field min-h-[130px]" placeholder={field.placeholder} value={(values[field.name] as string | undefined) ?? ""} onChange={(event) => updateValue(field.name, event.target.value)} />
                  ) : field.type === "select" ? (
                    <select className="field" value={(values[field.name] as string | undefined) ?? field.options?.[0] ?? ""} onChange={(event) => updateValue(field.name, event.target.value)}>
                      {(field.options ?? []).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input className="field" type={field.type ?? "text"} placeholder={field.placeholder} value={(values[field.name] as string | undefined) ?? ""} onChange={(event) => updateValue(field.name, event.target.value)} />
                  )}
                </label>
              ))}
              <button disabled={loading} className="rounded-full blue-purple px-6 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Generating" : document ? "Replace current draft" : "Generate Draft"}
              </button>
            </form>
          </>
        )}
      </Card>

      <Card className={tool === "cv" ? "lg:col-span-1" : undefined}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">{tool === "cv" || tool === "cover-letter" ? "Structured editor" : "Preview"}</p>
            <h2 className="mt-2 text-2xl font-black">{tool === "cv" ? "Edit CV" : tool === "cover-letter" ? "Edit Cover Letter" : outputTitle}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {tool === "cv" ? (
              <button onClick={() => saveDocument(false)} disabled={!document?.id} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-50">
                {saveState === "saving" ? "Saving..." : "Save Draft"}
              </button>
            ) : tool === "cover-letter" ? (
              <button onClick={() => saveDocument(false)} disabled={!document?.id} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-50">
                {saveState === "saving" ? "Saving..." : "Save Draft"}
              </button>
            ) : (
              <>
                <button onClick={() => setViewMode("preview")} disabled={!document?.content} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-50">Preview</button>
                <button onClick={() => setViewMode("edit")} disabled={!document?.content} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-50">Edit</button>
              </>
            )}
            {tool !== "cv" ? (
              <button onClick={copyDocument} disabled={!document?.content} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-50">
                {copied ? "Copied" : "Copy"}
              </button>
            ) : null}
          </div>
        </div>

        {error ? <p className="mt-5 rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc5c5]">{error}</p> : null}
        {xpAwarded ? <p className="mt-5 rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold text-[#b9f8d5]">{celebrationCopy[tool]} +{xpAwarded} XP added to your PATHZY level.</p> : null}
        {saved || saveState !== "idle" ? <p className="mt-5 rounded-[16px] border border-[#5B8CFF]/25 bg-[#5B8CFF]/10 px-4 py-3 text-sm font-bold text-[#c7d6ff]">{saveState === "saving" ? "Saving..." : saveState === "error" ? "Could not save. Retry." : "Saved to My Documents."}</p> : null}
        {downloadNotice ? <p className="mt-5 rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold text-[#b9f8d5]">{downloadNotice}</p> : null}
        {parsedCv?.missing.length ? (
          <div className="mt-5 rounded-[18px] border border-[#f8c45d]/25 bg-[#f8c45d]/10 p-4 text-sm font-bold text-[#ffe2a8]">
            Missing before download: {parsedCv.missing.join(", ")}. Add this in edit mode so your final CV is complete.
          </div>
        ) : null}

        {tool === "cv" && document?.content && parsedCv ? (
          <div className="mt-5 grid gap-4">
            <div className={`rounded-[20px] border p-4 ${activeCvSection === "Professional Header" ? "border-[#5B8CFF]/45 bg-[#5B8CFF]/10" : "border-white/10 bg-white/6"}`} onFocus={() => setActiveCvSection("Professional Header")} onClick={() => setActiveCvSection("Professional Header")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-white">1. Professional Header</p>
                  <p className="mt-1 text-xs font-bold text-white/48">Name, role, and contact details.</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${hasUnsavedChanges ? "bg-[#f8c45d]/12 text-[#ffe2a8]" : "bg-[#39d98a]/12 text-[#b9f8d5]"}`}>{hasUnsavedChanges ? "Dirty" : "Saved"}</span>
              </div>
              <div className="mt-4 grid gap-3">
                <label className="label">
                  Full name
                  <input className="field" value={parsedCv.fullName} onChange={(event) => updateCvDraft((draft) => { draft.fullName = event.target.value; })} />
                </label>
                <label className="label">
                  Target role
                  <input className="field" value={parsedCv.targetRole} onChange={(event) => updateCvDraft((draft) => { draft.targetRole = event.target.value; })} />
                </label>
                <label className="label">Phone<input className="field" value={parsedCv.phone} onChange={(event) => updateCvDraft((draft) => { draft.phone = event.target.value; })} /></label>
                <label className="label">Email<input className="field" value={parsedCv.email} onChange={(event) => updateCvDraft((draft) => { draft.email = event.target.value; })} /></label>
                <label className="label">City<input className="field" value={parsedCv.city} onChange={(event) => updateCvDraft((draft) => { draft.city = event.target.value; })} /></label>
                <label className="label">Country<input className="field" value={parsedCv.country} onChange={(event) => updateCvDraft((draft) => { draft.country = event.target.value; })} /></label>
                <label className="label">LinkedIn<input className="field" value={parsedCv.linkedIn} onChange={(event) => updateCvDraft((draft) => { draft.linkedIn = event.target.value; })} /></label>
                <label className="label">Portfolio<input className="field" value={parsedCv.portfolio} onChange={(event) => updateCvDraft((draft) => { draft.portfolio = event.target.value; })} /></label>
                <label className="label">GitHub<input className="field" value={parsedCv.github} onChange={(event) => updateCvDraft((draft) => { draft.github = event.target.value; })} /></label>
                <label className="label">Website<input className="field" value={parsedCv.website} onChange={(event) => updateCvDraft((draft) => { draft.website = event.target.value; })} /></label>
              </div>
            </div>

            <div className={`rounded-[20px] border p-4 ${activeCvSection === "Professional Summary" ? "border-[#5B8CFF]/45 bg-[#5B8CFF]/10" : "border-white/10 bg-white/6"}`} onFocus={() => setActiveCvSection("Professional Summary")} onClick={() => setActiveCvSection("Professional Summary")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-white">2. Professional Summary</p>
                  <p className="mt-1 text-xs font-bold text-white/48">{sectionStatus("Professional Summary", cvSectionItems("Professional Summary")) === "Visible" ? "This section is shown in the CV preview." : "This section is ready, but hidden until it has content."}</p>
                </div>
                <span className={`rounded-full border px-3 py-2 text-xs font-extrabold ${statusClasses(sectionStatus("Professional Summary", cvSectionItems("Professional Summary")))}`}>{sectionStatus("Professional Summary", cvSectionItems("Professional Summary"))}</span>
              </div>
              <textarea className="field mt-4 min-h-[140px]" value={cvSectionItems("Professional Summary")[0] ?? ""} onChange={(event) => updateCvSectionItems("Professional Summary", [event.target.value])} />
            </div>

            {mainCvSections.slice(1).map((title, index) => (
              <div key={title}>
                <p className="sr-only">{index + 3}. {title}</p>
                {title === "Core Competencies / Skills" ? renderSkillsSection() : renderRepeatableSection(title)}
              </div>
            ))}

            <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
              <p className="text-sm font-extrabold text-white">Add Optional Section</p>
              <p className="mt-1 text-xs font-bold text-white/48">Optional sections appear in the editor immediately and stay hidden from preview/PDF until they contain content.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {optionalCvSections.filter((title) => !cvSectionItems(title).length).map((title) => (
                  <button key={title} type="button" onClick={() => ensureCvSection(title)} className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-extrabold text-white">
                    Add {title}
                  </button>
                ))}
              </div>
            </div>

            {optionalCvSections.filter((title) => cvSectionItems(title).length).map((title) => renderRepeatableSection(title, { optional: true }))}
            {sectionNotice ? <p className="rounded-[16px] border border-[#5B8CFF]/25 bg-[#5B8CFF]/10 px-4 py-3 text-sm font-bold text-[#c7d6ff]">{sectionNotice}</p> : null}
          </div>
        ) : tool === "cv" ? (
          <div className="mt-5 rounded-[22px] border border-dashed border-white/14 bg-white/5 p-8 text-center">
            <h3 className="text-xl font-black">Generate a CV draft to start editing.</h3>
            <p className="mt-3 text-sm leading-6 text-white/58">PATHZY becomes your editing workspace after generation. You will be able to edit every section before exporting the final PDF.</p>
          </div>
        ) : tool === "cover-letter" && coverLetterData ? (
          renderCoverLetterEditor()
        ) : tool === "linkedin" && document?.content ? (
          <>
            <LinkedInPreview document={document} />
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setViewMode("edit")} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Edit</button>
              <button type="button" onClick={regenerateCurrentDraft} disabled={loading} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Improving..." : "AI Improve"}</button>
              <button type="button" onClick={() => copyTextValue(getLinkedInFields(document).headline)} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Copy Headline</button>
              <button type="button" onClick={() => copyTextValue(getLinkedInFields(document).about)} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Copy About Section</button>
              <button type="button" onClick={() => copyTextValue(document.content)} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Copy Full LinkedIn Content</button>
              <Link href={appRoutes.roadmap} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Back to My Employment Journey</Link>
            </div>
          </>
        ) : viewMode === "preview" && document?.content ? (
          <div className="mt-5 overflow-hidden rounded-[22px] bg-white p-2 text-black">
            <div dangerouslySetInnerHTML={{ __html: tool === "cover-letter" && coverLetterData ? renderCoverLetterHtmlFromData(coverLetterData) : renderCvHtml(document.content, templateName) }} />
          </div>
        ) : (
          <textarea
            className="mt-5 min-h-[420px] w-full resize-y rounded-[22px] border border-white/10 bg-[#050816]/70 p-5 text-sm leading-7 text-white/76 outline-none transition focus:border-[#5B8CFF]/50"
            value={document?.content ?? "Generate a draft, review every line, then edit it with your real experience, education, projects, and achievements."}
            onChange={(event) => {
              if (!document) return;
              updateDocumentContent(event.target.value);
            }}
            readOnly={!document}
          />
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {tool !== "cv" && tool !== "cover-letter" ? (
            <>
              <button onClick={() => saveDocument(false)} disabled={!document?.id} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-50">
                {saveState === "saving" ? "Saving..." : "Save Draft"}
              </button>
              <button onClick={downloadPdf} disabled={!document?.content} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-50">
                Download PDF
              </button>
            </>
          ) : null}
        </div>
      </Card>

      {tool === "cv" ? (
        <Card className="lg:col-span-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Live preview</p>
              <h2 className="mt-2 text-2xl font-black">{outputTitle}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={downloadPdf} disabled={!document?.content} className="rounded-full blue-purple px-5 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">
                Download PDF
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/58">This is the published version. Edit in the center panel; export only when the preview is ready.</p>
          {document?.content && previewCvModel ? (
            <div ref={previewScrollRef} className="mt-5 rounded-[22px] bg-[#dfe7f3] p-3 text-black">
              <div dangerouslySetInnerHTML={{ __html: renderCvHtmlFromModel(previewCvModel, templateName, activeCvSection) }} />
            </div>
          ) : (
            <div className="mt-5 grid min-h-[420px] place-items-center rounded-[22px] border border-dashed border-white/14 bg-white/5 text-center">
              <div>
                <h3 className="text-xl font-black">Your A4 preview will appear here.</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/58">Generate a draft first, then the preview will update live as you edit.</p>
              </div>
            </div>
          )}
        </Card>
      ) : null}

      {tool === "cover-letter" ? (
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Live preview</p>
              <h2 className="mt-2 text-2xl font-black">{outputTitle}</h2>
            </div>
            <button onClick={downloadPdf} disabled={!document?.content} className="rounded-full blue-purple px-5 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">
              Download PDF
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/58">This is the published A4 cover letter. Empty fields stay hidden.</p>
          {document?.content && previewCoverLetterData ? (
            <div className="mt-5 rounded-[22px] bg-[#dfe7f3] p-3 text-black">
              <div dangerouslySetInnerHTML={{ __html: renderCoverLetterHtmlFromData(previewCoverLetterData) }} />
            </div>
          ) : (
            <div className="mt-5 grid min-h-[420px] place-items-center rounded-[22px] border border-dashed border-white/14 bg-white/5 text-center">
              <div>
                <h3 className="text-xl font-black">Your A4 cover letter preview will appear here.</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/58">Generate a draft first, then edit it from the structured editor.</p>
              </div>
            </div>
          )}
        </Card>
      ) : null}

      {tool === "cv" && document?.content ? (
        <Card className="lg:col-span-4">
          <div className="rounded-[20px] border border-[#39d98a]/25 bg-[#39d98a]/10 p-5">
            <h3 className="text-xl font-black">Your CV is ready. What would you like to do next?</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={appRoutes.professionalIdentityCoverLetter} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Build My Cover Letter</Link>
              <Link href={appRoutes.professionalIdentityLinkedin} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Improve My LinkedIn</Link>
              <Link href={appRoutes.roadmap} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Back to My Employment Journey</Link>
              <Link href={appRoutes.opportunities} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Find Opportunities</Link>
              <Link href="/mentor?context=CV%20page%20-%20help%20with%20CV" className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Ask Your Mentor</Link>
              <button type="button" onClick={() => setSaved(false)} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Improve This CV</button>
              <a href="#old-cv-upload" className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Upload Old CV</a>
            </div>
          </div>
        </Card>
      ) : null}
      {tool === "cover-letter" && document?.content ? (
        <Card>
          <div className="rounded-[20px] border border-[#39d98a]/25 bg-[#39d98a]/10 p-5">
            <h3 className="text-xl font-black">Your cover letter is ready. Keep moving.</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={appRoutes.roadmap} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Back to My Employment Journey</Link>
              <Link href={appRoutes.professionalIdentityLinkedin} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Improve My LinkedIn</Link>
              <Link href={appRoutes.opportunities} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white">Find Opportunities</Link>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
