"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DocumentInspectionStatus } from "@/components/documents/DocumentInspectionStatus";
import { DocumentInspectionSummary } from "@/components/documents/DocumentInspectionSummary";
import { DocumentVisualReadingStatus } from "@/components/documents/DocumentVisualReadingStatus";
import { DocumentVisualReadingSummary } from "@/components/documents/DocumentVisualReadingSummary";
import { DocumentSemanticUnderstandingStatus } from "@/components/documents/DocumentSemanticUnderstandingStatus";
import { DocumentSemanticUnderstandingSummary } from "@/components/documents/DocumentSemanticUnderstandingSummary";
import { DocumentReasoningSummary } from "@/components/documents/DocumentReasoningSummary";
import { Card } from "@/components/ui";
import { PremiumUpgradeCard } from "@/components/upgrade/premium-upgrade-card";
import { TemplateMiniPreview } from "@/components/professional-identity/template-mini-preview";
import { coverLetterDataFromUnknown, coverLetterPdfFilename, coverLetterTemplateGallery, coverLetterTemplateMetadata, cvModelFromUnknown, cvModelWithMissing, downloadBlob, normalizeCoverLetterDataForExport, normalizeCoverLetterTemplate, normalizeCvModelForExport, pathzyFilename, renderAtsCvHtmlFromModel, renderCoverLetterHtmlFromData, renderCvHtml, renderCvHtmlFromModel, serializeCoverLetterData, serializeCvModel, simpleCoverLetterPdfDocument, simplePdfDocument, simplePdfDocumentFromModel } from "@/components/professional-identity/document-downloads";
import type { CoverLetterData, CvModel } from "@/components/professional-identity/document-downloads";
import { PATHZY_ROUTES, appRoutes, routeBuilders } from "@/lib/navigation/routes";
import type { CoverLetterJobContext, ProfessionalIdentityCoverLetterSyncStatus } from "@/lib/professional-identity/professional-identity-cover-letter-model";
import { professionalIdentityHrefForCvSection, type ProfessionalIdentityCvSyncStatus } from "@/lib/professional-identity/professional-identity-cv-model";
import { serializeLinkedInProfileModel, type LinkedInEducationItem, type LinkedInExperienceItem, type LinkedInProfileModel, type ProfessionalIdentityLinkedInSyncStatus } from "@/lib/professional-identity/professional-identity-linkedin-model";
import { documentTemplateGallery, normalizeDocumentTemplate, templateMetadata } from "@/lib/professional-identity/document-template-engine";
import type { DocumentInspectionResult } from "@/lib/documents/inspection";
import type { VisualDocumentModel } from "@/lib/documents/visual";
import type { SemanticDocumentModel } from "@/lib/documents/semantic";
import type { ReasoningRunSummary } from "@/lib/documents/reasoning";
import type { GeneratedProfessionalDocument, GenerateOptions, ProfessionalLanguage } from "@/lib/professional-identity/professional-identity-types";
import { currentCoreDocumentDownloadAccess } from "@/lib/access/core-document-download-access";

type Field = {
  name: keyof GenerateOptions;
  label: string;
  type?: "text" | "textarea" | "select" | "date";
  placeholder?: string;
  options?: string[];
};

type Tool = GeneratedProfessionalDocument["tool"];
type CvPreviewScaleMode = "fit_page" | "fit_width" | "custom";
type CoverLetterJobContextMode = "closed" | "choose" | "manual" | "paste" | "saved";

const cvA4Page = { width: 794, height: 1123 };

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

const cvPrimaryNavigation = [
  { label: "Header", section: "Professional Header" },
  { label: "Summary", section: "Professional Summary" },
  { label: "Experience", section: "Professional Experience" },
  { label: "Education", section: "Education" },
  { label: "Skills", section: "Core Competencies / Skills" },
  { label: "Projects", section: "Projects" },
  { label: "Certifications", section: "Certifications" },
  { label: "More", section: "Achievements" }
];

const cvMoreSections = [
  "Achievements",
  "Languages",
  "References",
  ...optionalCvSections
];

function cvHealthScore(cv: CvModel | null) {
  if (!cv) return { score: 0, label: "Needs a draft", recommendations: ["Generate your first CV draft."] };
  const checks = [
    Boolean(cv.fullName.trim()),
    Boolean(cv.targetRole.trim()),
    Boolean(cv.email.trim() || cv.phone.trim()),
    Boolean(cv.professionalSummary.trim()),
    cv.coreSkills.length + cv.technicalSkills.length + cv.professionalSkills.length >= 5,
    cv.professionalExperience.length > 0 || cv.projects.length > 0,
    cv.education.length > 0 || cv.certifications.length > 0,
    cv.projects.length > 0 || cv.achievements.length > 0,
    cv.languages.length > 0 || Boolean(cv.linkedIn.trim() || cv.portfolio.trim() || cv.website.trim()),
    cv.references.availableUponRequest || cv.references.items.length > 0
  ];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const recommendations = [
    !checks[0] ? "Add your full name so recruiters can identify you." : "",
    !checks[1] ? "Add a target role so the CV has a clear direction." : "",
    !checks[2] ? "Add email or phone so employers can contact you." : "",
    !checks[3] ? "Write a short professional summary focused on your career goal." : "",
    !checks[4] ? "Add at least five relevant skills matched to the role." : "",
    !checks[5] ? "Add experience or projects to prove what you can do." : "",
    !checks[6] ? "Add education, certificates, or training evidence." : "",
    !checks[7] ? "Add achievements or portfolio projects to strengthen proof." : "",
    !checks[8] ? "Add languages, LinkedIn, portfolio, or website details." : "",
    !checks[9] ? "Add references or mark them as available on request." : ""
  ].filter(Boolean).slice(0, 3);
  return {
    score,
    label: score >= 85 ? "Recruiter ready" : score >= 65 ? "Strong draft" : score >= 40 ? "Improving" : "Needs key details",
    recommendations: recommendations.length ? recommendations : ["Review spacing, wording, and tailor this CV to the next job before sending."]
  };
}
function coverLetterHealthStatus(data: CoverLetterData | null) {
  if (!data) {
    return {
      label: "Draft not generated",
      recommendation: "Generate a draft, then review each cover letter section before downloading."
    };
  }
  const missing = [
    !data.fullName.trim() ? "your name" : "",
    !data.companyName.trim() ? "company name" : "",
    !data.jobTitle.trim() ? "job title" : "",
    !data.openingParagraph.trim() ? "opening paragraph" : "",
    !data.evidenceParagraph.trim() ? "evidence paragraph" : "",
    !data.closingParagraph.trim() ? "closing paragraph" : ""
  ].filter(Boolean);
  if (!missing.length) {
    return {
      label: "Ready to review",
      recommendation: "Your main cover letter sections are complete. Review the A4 preview before downloading."
    };
  }
  return {
    label: "Needs review",
    recommendation: `Improve your cover letter: add ${missing.slice(0, 2).join(" and ")}.`
  };
}
type CvVersionMetadata = {
  designSystem: string;
  versionName: string;
  createdAt: string;
  updatedAt: string;
  lastDownloadedAt: string | null;
  contentSourceId?: string | null;
};

type CvImportSummary = {
  counts: {
    workExperiences: number;
    educationRecords: number;
    skills: number;
    certifications: number;
    languages: number;
    references: number;
    projects: number;
    achievements: number;
    unclassifiedItems: number;
    excludedSensitiveFields: number;
  };
  reviewItems: string[];
  unclassifiedItems: string[];
  confidence: "high" | "medium" | "low";
  message: string;
  excludedSensitiveNotice?: string | null;
  inspection?: DocumentInspectionResult | null;
  visualReading?: VisualDocumentModel | null;
  semanticReading?: SemanticDocumentModel | null;
  reasoning?: ReasoningRunSummary | null;
};

function cvVersionFromDocument(document: GeneratedProfessionalDocument | null, fallbackDesign = "PATHZY Signature Professional"): CvVersionMetadata {
  const raw = document?.contentJson?.cvVersion;
  const source = raw && typeof raw === "object" ? raw as Partial<CvVersionMetadata> : {};
  const now = new Date().toISOString();
  const designSystem = normalizeDocumentTemplate(typeof source.designSystem === "string" && source.designSystem.trim()
    ? source.designSystem
    : document?.template_name || fallbackDesign);
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
  initialDocument = null,
  cvSyncStatus = null,
  coverLetterSyncStatus = null,
  coverLetterJobHref = appRoutes.opportunities,
  linkedInSyncStatus = null,
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
  initialDocument?: GeneratedProfessionalDocument | null;
  cvSyncStatus?: ProfessionalIdentityCvSyncStatus | null;
  coverLetterSyncStatus?: ProfessionalIdentityCoverLetterSyncStatus | null;
  coverLetterJobHref?: string;
  linkedInSyncStatus?: ProfessionalIdentityLinkedInSyncStatus | null;
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
  const [document, setDocument] = useState<GeneratedProfessionalDocument | null>(initialDocument ?? null);
  const initialCvModel = useMemo(() => tool === "cv" && initialDocument ? cvModelFromUnknown(initialDocument.contentJson?.cvModel, initialDocument.content) : null, [initialDocument, tool]);
  const initialCoverLetterData = useMemo(() => tool === "cover-letter" && initialDocument ? coverLetterDataFromUnknown(initialDocument.contentJson?.coverLetterData, initialDocument.content) : null, [initialDocument, tool]);
  const [cvModel, setCvModel] = useState<CvModel | null>(initialCvModel);
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData | null>(initialCoverLetterData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [upgradeRequired, setUpgradeRequired] = useState(locked);
  const [exportUpgradeRequired, setExportUpgradeRequired] = useState(false);
  const [copied, setCopied] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);
  const [saved, setSaved] = useState(Boolean(initialDocument && (tool === "cv" || tool === "cover-letter" || tool === "linkedin")));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(initialDocument && (tool === "cv" || tool === "cover-letter" || tool === "linkedin") ? "saved" : "idle");
  const [downloadState, setDownloadState] = useState<"idle" | "preparing" | "downloading" | "error">("idle");
  const [downloadNotice, setDownloadNotice] = useState("");
  const [oldCvNotice, setOldCvNotice] = useState("");
  const [cvImportStatus, setCvImportStatus] = useState<"idle" | "reading" | "inspecting" | "visual-reading" | "semantic-understanding" | "extracting" | "organizing" | "saving" | "ready" | "error">("idle");
  const [cvImportSummary, setCvImportSummary] = useState<CvImportSummary | null>(null);
  const [pendingImportedCv, setPendingImportedCv] = useState<Record<string, unknown> | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [cvEntryMode, setCvEntryMode] = useState<"choice" | "profile" | "upload">("profile");
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [activeCvSection, setActiveCvSection] = useState("Professional Header");
  const [sectionNotice, setSectionNotice] = useState("");
  const [focusedNewRepeatableItem, setFocusedNewRepeatableItem] = useState("");
  const [previewCvModel, setPreviewCvModel] = useState<CvModel | null>(initialCvModel);
  const [previewCoverLetterData, setPreviewCoverLetterData] = useState<CoverLetterData | null>(initialCoverLetterData);
  const [updateLinkedCvVersions] = useState(false);
  const [cvPreviewMode, setCvPreviewMode] = useState<"designed" | "ats">("designed");
  const [cvPreviewScaleMode, setCvPreviewScaleMode] = useState<CvPreviewScaleMode>("fit_page");
  const [cvCustomScale, setCvCustomScale] = useState(0.82);
  const [cvPreviewScale, setCvPreviewScale] = useState(0.82);
  const [cvTemplateFamily, setCvTemplateFamily] = useState("All");
  const [cvTemplateAtsFilter, setCvTemplateAtsFilter] = useState("All");
  const [cvTemplateSearch, setCvTemplateSearch] = useState("");
  const [cvTemplateBrowserOpen, setCvTemplateBrowserOpen] = useState(false);
  const [coverLetterTemplateBrowserOpen, setCoverLetterTemplateBrowserOpen] = useState(false);
  const [coverLetterTemplateCategory, setCoverLetterTemplateCategory] = useState("Recommended");
  const [coverLetterHealthExpanded, setCoverLetterHealthExpanded] = useState(false);
  const [coverLetterJobContextMode, setCoverLetterJobContextMode] = useState<CoverLetterJobContextMode>("closed");
  const [pastedJobDescription, setPastedJobDescription] = useState((defaultOptions?.jobDescription as string | undefined) ?? "");
  const [jobExtractionReviewed, setJobExtractionReviewed] = useState(false);
  const [linkedInHeadlineVariant, setLinkedInHeadlineVariant] = useState<keyof LinkedInProfileModel["headlineVariants"]>("recruiterFriendly");
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coverLetterPreviewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewScrollRef = useRef<HTMLDivElement | null>(null);
  const cvPreviewViewportRef = useRef<HTMLDivElement | null>(null);

  const outputTitle = useMemo(() => document?.title ?? (tool === "cv" ? "Professional CV" : "Professional document"), [document, tool]);
  const recoveryKey = `pathzy-document-draft:${tool}`;
  const templateName = tool === "cover-letter" ? normalizeCoverLetterTemplate(values.templateName) : normalizeDocumentTemplate(values.templateName);
  const selectedTemplateMetadata = tool === "cover-letter" ? coverLetterTemplateMetadata(templateName) : templateMetadata(templateName);
  const coreDownloadsAllowed = currentCoreDocumentDownloadAccess === "allowed";
  const downloadBusy = downloadState === "preparing" || downloadState === "downloading";
  const selectedCvTemplateMetadata = useMemo(() => templateMetadata(templateName), [templateName]);
  const parsedCv = useMemo(() => tool === "cv" && cvModel ? cvModelWithMissing(cvModel) : null, [cvModel, tool]);
  const health = useMemo(() => cvHealthScore(previewCvModel ?? cvModel), [previewCvModel, cvModel]);
  const coverLetterHealth = useMemo(() => coverLetterHealthStatus(previewCoverLetterData ?? coverLetterData), [previewCoverLetterData, coverLetterData]);
  const cvPreviewHtml = useMemo(() => tool === "cv" && previewCvModel ? (cvPreviewMode === "ats" ? renderAtsCvHtmlFromModel(previewCvModel) : renderCvHtmlFromModel(previewCvModel, templateName, activeCvSection)) : "", [activeCvSection, cvPreviewMode, previewCvModel, templateName, tool]);
  const cvPreviewPageCount = useMemo(() => Math.max(1, (cvPreviewHtml.match(/<div class="cv-render-page-frame"/g) ?? []).length || (cvPreviewHtml ? 1 : 0)), [cvPreviewHtml]);
  const coverLetterPreviewHtml = useMemo(() => tool === "cover-letter" && previewCoverLetterData ? renderCoverLetterHtmlFromData(previewCoverLetterData) : "", [previewCoverLetterData, tool]);
  const coverLetterPreviewPageCount = useMemo(() => Math.max(1, (coverLetterPreviewHtml.match(/<div class="cv-render-page-frame"/g) ?? []).length || (coverLetterPreviewHtml ? 1 : 0)), [coverLetterPreviewHtml]);
  const cvTemplateFamilies = useMemo(() => ["All", ...Array.from(new Set(documentTemplateGallery.map((template) => template.family)))], []);
  const cvTemplateAtsFilters = useMemo(() => ["All", "ATS HIGH", "ATS BALANCED", "VISUAL / RECRUITER-FIRST"], []);
  const filteredDocumentTemplates = useMemo(() => {
    const search = cvTemplateSearch.trim().toLowerCase();
    return documentTemplateGallery.map((template) => template).filter((template) => {
      const familyMatch = cvTemplateFamily === "All" || template.family === cvTemplateFamily;
      const atsMatch = cvTemplateAtsFilter === "All" || template.atsClassification === cvTemplateAtsFilter;
      const searchMatch = !search || [template.name, template.family, template.description, template.bestFor, template.atsCharacteristic, template.recruiterCharacteristic].join(" ").toLowerCase().includes(search);
      return familyMatch && atsMatch && searchMatch;
    });
  }, [cvTemplateAtsFilter, cvTemplateFamily, cvTemplateSearch]);
  const recommendedDocumentTemplates = useMemo(() => {
    const selected = selectedCvTemplateMetadata;
    const recommendations = documentTemplateGallery.filter((template) =>
      template.name !== selected.name &&
      (template.family === selected.family || template.atsClassification === "ATS HIGH" || ["Modern Professional", "ATS Essential", "Executive", "Graduate", "Technical / IT"].includes(template.family))
    );
    return [selected, ...recommendations].filter((template, index, list) => list.findIndex((item) => item.name === template.name) === index).slice(0, 6);
  }, [selectedCvTemplateMetadata]);
  const recommendedCoverLetterTemplates = useMemo(() => {
    const selected = coverLetterTemplateMetadata(templateName);
    const recommendations = coverLetterTemplateGallery.filter((template) => template.name !== selected.name);
    return [selected, ...recommendations].filter((template, index, list) => list.findIndex((item) => item.name === template.name) === index).slice(0, 5);
  }, [templateName]);
  const coverLetterTemplateCategories = useMemo(() => ["Recommended", "Formal", "Modern", "Executive", "Corporate", "Graduate", "Technical", "International", "Minimal", "All"], []);
  const filteredCoverLetterTemplates = useMemo(() => {
    if (coverLetterTemplateCategory === "Recommended") return recommendedCoverLetterTemplates;
    if (coverLetterTemplateCategory === "All") return coverLetterTemplateGallery;
    const category = coverLetterTemplateCategory.toLowerCase();
    return coverLetterTemplateGallery.filter((template) => {
      const text = [template.name, template.architecture, template.bestFor, template.description].join(" ").toLowerCase();
      return text.includes(category) || (category === "formal" && ["signature", "ats", "global"].includes(template.architecture)) || (category === "corporate" && ["enterprise", "consulting", "global"].includes(template.architecture)) || (category === "modern" && ["product", "creative", "technical"].includes(template.architecture)) || (category === "minimal" && ["ats", "product", "technical"].includes(template.architecture)) || (category === "international" && template.architecture === "global");
    });
  }, [coverLetterTemplateCategory, recommendedCoverLetterTemplates]);

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
    if (tool !== "cv" && tool !== "cover-letter") return;
    const target = cvPreviewViewportRef.current;
    if (!target) return;
    let frame = 0;
    const calculateScale = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        const padding = 72;
        const availableWidth = Math.max(240, rect.width - padding);
        const availableHeight = Math.max(320, rect.height - padding);
        const fitPageScale = Math.min(availableWidth / cvA4Page.width, availableHeight / cvA4Page.height);
        const fitWidthScale = availableWidth / cvA4Page.width;
        const nextScale = cvPreviewScaleMode === "fit_page" ? fitPageScale : cvPreviewScaleMode === "fit_width" ? fitWidthScale : cvCustomScale;
        setCvPreviewScale(Number(Math.max(0.32, Math.min(1.35, nextScale)).toFixed(3)));
      });
    };
    calculateScale();
    const observer = new ResizeObserver(calculateScale);
    observer.observe(target);
    window.addEventListener("orientationchange", calculateScale);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("orientationchange", calculateScale);
    };
  }, [cvCustomScale, cvPreviewScaleMode, tool, cvPreviewMode]);

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
      ? { ...document, content: serializeCoverLetterData(nextCoverLetterData), contentJson: coverLetterContentJson(document, nextCoverLetterData, true) }
      : tool === "linkedin"
        ? { ...document, content, contentJson: linkedInContentJson(document, true) }
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
    const version = cvVersionFromDocument(nextDocument, nextDocument.template_name ?? values.templateName ?? "PATHZY Signature Professional");
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

  function coverLetterContentJson(nextDocument: GeneratedProfessionalDocument, draft: CoverLetterData, manualOverride: boolean) {
    const existingVersion = nextDocument.contentJson?.coverLetterVersion && typeof nextDocument.contentJson.coverLetterVersion === "object"
      ? nextDocument.contentJson.coverLetterVersion as Record<string, unknown>
      : {};
    const updatedAt = new Date().toISOString();
    return {
      ...(nextDocument.contentJson ?? {}),
      source: "professional_identity_and_job_context",
      coverLetterData: draft,
      coverLetterVersion: {
        ...existingVersion,
        designSystem: draft.designSystem,
        versionName: nextDocument.title,
        updatedAt,
        professionalIdentitySource: "canonical_professional_identity",
        manualOverride: Boolean(existingVersion.manualOverride) || manualOverride,
        status: manualOverride ? "draft_manually_edited" : existingVersion.status ?? "up_to_date"
      }
    };
  }

  function linkedInModelFromDocument(nextDocument: GeneratedProfessionalDocument | null) {
    const raw = nextDocument?.contentJson?.linkedinProfileModel;
    if (!raw || typeof raw !== "object") return null;
    const source = raw as Partial<LinkedInProfileModel>;
    const list = (value: unknown) => Array.isArray(value) ? value.map(String).filter(Boolean) : [];
    const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
    const experienceList = (value: unknown): LinkedInExperienceItem[] => Array.isArray(value)
      ? value.map((item, index) => {
          if (item && typeof item === "object") {
            const record = item as Partial<LinkedInExperienceItem>;
            const sourceText = text(record.sourceText) || [record.role, record.company, record.dates, record.location, record.description].map(text).filter(Boolean).join(" | ");
            return {
              id: text(record.id) || `experience-${index}`,
              role: text(record.role) || sourceText,
              company: text(record.company),
              dates: text(record.dates),
              location: text(record.location),
              description: text(record.description),
              sourceText
            };
          }
          const sourceText = text(item);
          return { id: `experience-${index}`, role: sourceText, company: "", dates: "", location: "", description: "", sourceText };
        }).filter((item) => item.sourceText || item.role)
      : [];
    const educationList = (value: unknown): LinkedInEducationItem[] => Array.isArray(value)
      ? value.map((item, index) => {
          if (item && typeof item === "object") {
            const record = item as Partial<LinkedInEducationItem>;
            const sourceText = text(record.sourceText) || [record.qualification, record.field, record.institution, record.dates].map(text).filter(Boolean).join(" | ");
            return {
              id: text(record.id) || `education-${index}`,
              qualification: text(record.qualification) || sourceText,
              field: text(record.field),
              institution: text(record.institution),
              dates: text(record.dates),
              sourceText
            };
          }
          const sourceText = text(item);
          return { id: `education-${index}`, qualification: sourceText, field: "", institution: "", dates: "", sourceText };
        }).filter((item) => item.sourceText || item.qualification)
      : [];
    return {
      fullName: typeof source.fullName === "string" ? source.fullName : "",
      professionalTitle: typeof source.professionalTitle === "string" ? source.professionalTitle : "",
      profilePhotoAvailable: source.profilePhotoAvailable === true,
      headline: typeof source.headline === "string" ? source.headline : "",
      headlineVariants: {
        recruiterFriendly: source.headlineVariants?.recruiterFriendly ?? source.headline ?? "",
        professional: source.headlineVariants?.professional ?? source.headline ?? "",
        careerTransition: source.headlineVariants?.careerTransition ?? source.headline ?? ""
      },
      about: typeof source.about === "string" ? source.about : "",
      location: typeof source.location === "string" ? source.location : "",
      linkedInUrl: typeof source.linkedInUrl === "string" ? source.linkedInUrl : "",
      professionalLinks: list(source.professionalLinks),
      openToWorkTargets: list(source.openToWorkTargets),
      experience: experienceList(source.experience),
      education: educationList(source.education),
      skills: list(source.skills),
      skillEvidence: {
        supported: list(source.skillEvidence?.supported).length ? list(source.skillEvidence?.supported) : list(source.skills),
        suggestedToDevelop: list(source.skillEvidence?.suggestedToDevelop)
      },
      projects: list(source.projects),
      certifications: list(source.certifications),
      licences: list(source.licences),
      languages: list(source.languages),
      featuredItems: list(source.featuredItems).filter((item) => !["relevant project", "projet pertinent", "certification", "pathzy cv", "cv pathzy"].includes(item.trim().toLowerCase())),
      profileOptimization: {
        status: source.profileOptimization?.status ?? "optimization_available",
        recommendations: Array.isArray(source.profileOptimization?.recommendations) ? source.profileOptimization.recommendations as LinkedInProfileModel["profileOptimization"]["recommendations"] : []
      },
      keywordStrategy: {
        targetRole: source.keywordStrategy?.targetRole ?? source.professionalTitle ?? "",
        supported: list(source.keywordStrategy?.supported).length ? list(source.keywordStrategy?.supported) : list((source.keywordStrategy as { keywords?: unknown } | undefined)?.keywords),
        opportunities: list(source.keywordStrategy?.opportunities)
      },
      completeness: {
        completedChecks: source.completeness?.completedChecks ?? 0,
        totalChecks: source.completeness?.totalChecks ?? 8,
        label: source.completeness?.label ?? "LinkedIn profile draft",
        dimensions: Array.isArray(source.completeness?.dimensions) ? source.completeness.dimensions as LinkedInProfileModel["completeness"]["dimensions"] : []
      },
      sourceMetadata: {
        source: "professional_identity",
        language: source.sourceMetadata?.language === "french" ? "french" : "english",
        professionalIdentityUpdatedAt: source.sourceMetadata?.professionalIdentityUpdatedAt ?? null,
        manualOverride: source.sourceMetadata?.manualOverride === true
      }
    };
  }

  function linkedInContentJson(nextDocument: GeneratedProfessionalDocument, manualOverride: boolean) {
    const existingVersion = nextDocument.contentJson?.linkedInVersion && typeof nextDocument.contentJson.linkedInVersion === "object"
      ? nextDocument.contentJson.linkedInVersion as Record<string, unknown>
      : {};
    const updatedAt = new Date().toISOString();
    return {
      ...(nextDocument.contentJson ?? {}),
      source: "professional_identity",
      linkedInVersion: {
        ...existingVersion,
        updatedAt,
        professionalIdentitySource: "canonical_professional_identity",
        manualOverride: Boolean(existingVersion.manualOverride) || manualOverride,
        status: manualOverride ? "draft_manually_edited" : existingVersion.status ?? "up_to_date"
      }
    };
  }

  function updateLinkedInDraft(mutator: (draft: LinkedInProfileModel) => void) {
    if (!document) return;
    const current = linkedInModelFromDocument(document);
    if (!current) return;
    const draft = JSON.parse(JSON.stringify(current)) as LinkedInProfileModel;
    mutator(draft);
    const content = serializeLinkedInProfileModel(draft);
    const next = {
      ...document,
      content,
      fields: { headline: draft.headline, about: draft.about, skills: draft.skills, experienceSummary: draft.experience.map((item) => item.sourceText).join("\n") },
      contentJson: {
        ...linkedInContentJson(document, true),
        linkedinProfileModel: draft
      }
    };
    setDocument(next);
    setSaved(false);
    setSaveState("idle");
    setHasUnsavedChanges(true);
    window.localStorage.setItem(recoveryKey, JSON.stringify(next));
  }

  function setCoverLetterDocument(nextDocument: GeneratedProfessionalDocument, markSaved: boolean) {
    const nextData = coverLetterDataFromUnknown(nextDocument.contentJson?.coverLetterData, nextDocument.content);
    const content = serializeCoverLetterData(nextData);
    const next = { ...nextDocument, content, contentJson: coverLetterContentJson(nextDocument, nextData, false) };
    setDocument(next);
    setCoverLetterData(nextData);
    setPreviewCoverLetterData(nextData);
    setValues((current) => ({ ...current, templateName: nextData.designSystem }));
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
    const next = { ...document, content, contentJson: coverLetterContentJson(document, draft, true) };
    setCoverLetterData(draft);
    setDocument(next);
    setSaved(false);
    setSaveState("idle");
    setHasUnsavedChanges(true);
    window.localStorage.setItem(recoveryKey, JSON.stringify(next));
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

  function sectionStatus(title: string, items: string[], optional = false) {
    if (!items.length) return optional ? "Hidden" : "Empty";
    return items.some((item) => item.trim()) ? "Visible" : "Empty";
  }

  function statusClasses(status: string) {
    if (status === "Visible") return "border-[#39d98a]/25 bg-[#39d98a]/10 text-[#b9f8d5]";
    if (status === "Empty") return "border-[#f8c45d]/25 bg-[#f8c45d]/10 text-[#ffe2a8]";
    return "border-white/12 bg-white/8 text-white/54";
  }

  function cvSectionStatusForNav(section: string) {
    if (!parsedCv) return "Empty";
    if (section === "Professional Header") {
      return sectionStatus(section, [parsedCv.fullName, parsedCv.targetRole, parsedCv.email, parsedCv.phone, parsedCv.city, parsedCv.country, parsedCv.linkedIn, parsedCv.portfolio, parsedCv.github, parsedCv.website].filter(Boolean));
    }
    if (section === "Core Competencies / Skills") return sectionStatus(section, skillGroupSections.flatMap((group) => cvSectionItems(group.title)));
    if (section === "Achievements") return cvMoreSections.some((title) => cvSectionItems(title).some((item) => item.trim())) ? "Visible" : "Empty";
    return sectionStatus(section, cvSectionItems(section), optionalCvSections.includes(section));
  }

  function saveStatusLabel() {
    if (saveState === "saving") return "Saving...";
    if (saveState === "error") return "Could not save - Retry";
    if (hasUnsavedChanges) return "Unsaved changes";
    if (saved || saveState === "saved") return "Saved";
    return "Ready";
  }

  function saveStatusClasses() {
    if (saveState === "error") return "border-[#ff6b6b]/30 bg-[#ff6b6b]/10 text-[#ffc5c5]";
    if (saveState === "saving" || hasUnsavedChanges) return "border-[#f8c45d]/25 bg-[#f8c45d]/10 text-[#ffe2a8]";
    return "border-[#39d98a]/25 bg-[#39d98a]/10 text-[#b9f8d5]";
  }

  function accordionId(section: string) {
    return `cv-accordion-${section.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section"}`;
  }

  function isCvPrimaryOpen(item: { label: string; section: string }) {
    if (item.label === "More") return activeCvSection === "More" || cvMoreSections.includes(activeCvSection);
    if (item.label === "Skills") return activeCvSection === "Core Competencies / Skills" || skillGroupSections.some((group) => group.title === activeCvSection);
    return activeCvSection === item.section;
  }

  function toggleCvPrimarySection(item: { label: string; section: string }) {
    if (isCvPrimaryOpen(item)) {
      setActiveCvSection("");
      return;
    }
    setActiveCvSection(item.section);
  }

  function renderCvSectionNavigator() {
    return (
      <div className="grid gap-3" data-cv-editor-accordion="primary">
        {cvPrimaryNavigation.map((item, index) => {
          const status = cvSectionStatusForNav(item.section);
          const isOpen = isCvPrimaryOpen(item);
          const panelId = accordionId(item.section);
          return (
            <div key={item.label} className={`overflow-hidden rounded-[20px] border ${isOpen ? "border-[#f2b8a2]/45 bg-[#7f1d1d]/14" : "border-white/10 bg-white/6"}`}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleCvPrimarySection(item)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2]"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-black leading-5 text-white">{index + 1}. {item.label}</span>
                  <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${statusClasses(status)}`}>{status}</span>
                </span>
                <span className="shrink-0 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-black text-white/70" aria-hidden="true">
                  {isOpen ? "Collapse" : "Expand"}
                </span>
              </button>
              {isOpen ? (
                <div id={panelId} className="border-t border-white/10 p-3">
                  {renderCvAccordionContent(item)}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }

  function renderCvCompactStatus() {
    return (
      <div className="grid gap-3 rounded-[20px] border border-white/10 bg-white/6 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="sr-only">CV Health Score</span>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">CV Health</span>
          <span className="rounded-full border border-[#7f1d1d]/25 bg-[#7f1d1d]/10 px-3 py-1 text-sm font-black text-[#f2b8a2]">{health.score}/100</span>
          <span className="text-sm font-bold text-white/62">{health.label}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className={`rounded-full border px-3 py-2 text-xs font-extrabold ${saveStatusClasses()}`}>{saveStatusLabel()}</span>
          {saveState === "error" ? (
            <button type="button" onClick={() => saveDocument(false)} className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-extrabold text-white">
              Retry
            </button>
          ) : null}
        </div>
        {document?.content ? (
          <details className="sm:col-span-2">
            <summary className="cursor-pointer text-xs font-extrabold text-[#f2b8a2]">Improve your CV recommendations</summary>
            <ul className="mt-2 grid gap-1 text-xs font-bold leading-5 text-[#f2b8a2]/82">
              {health.recommendations.map((recommendation) => <li key={recommendation}>Improve your CV: {recommendation}</li>)}
              {parsedCv?.missing.length ? <li>Add {parsedCv.missing.join(", ").toLowerCase()} so recruiters can contact you and understand your target role quickly.</li> : null}
            </ul>
          </details>
        ) : null}
        {tool === "cv" && cvSyncStatus?.missingSections.length ? (
          <div className="sm:col-span-2 rounded-[16px] border border-[#f8c45d]/25 bg-[#f8c45d]/10 p-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#ffe2a8]">Your CV needs a little more information</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {cvSyncStatus.missingSections.slice(0, 4).map((item) => (
                <Link key={item.section} href={item.href} className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-extrabold text-white">
                  Complete {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  function renderCvIdentityCorrectionCard() {
    return (
      <div className="rounded-[20px] border border-[#7f1d1d]/20 bg-[#151110]/92 p-3">
        <div className="flex flex-col gap-3 rounded-[16px] border border-white/8 bg-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f2b8a2]/70">Want to change your CV information?</p>
            <p className="mt-1 max-w-3xl text-sm font-bold leading-6 text-white/68">
              Your CV uses your Professional Identity as its source of truth. Update factual details there, then return to this CV with your content still synchronized.
            </p>
          </div>
          <Link
            href={routeBuilders.professionalIdentityReview(appRoutes.professionalIdentityCv)}
            className="inline-flex w-fit rounded-full border border-[#f2b8a2]/24 bg-[#7f1d1d]/22 px-4 py-2 text-sm font-extrabold text-[#f2b8a2] transition hover:border-[#f2b8a2]/42 hover:bg-[#7f1d1d]/32 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2]"
          >
            Edit information
          </Link>
        </div>
      </div>
    );
  }

  function renderCoverLetterCompactStatus() {
    const panelId = accordionId("Cover Letter Health");

    return (
      <div className="grid gap-3 rounded-[20px] border border-white/10 bg-white/6 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="sr-only">Cover Letter Health</span>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Cover Letter Health</span>
          <span className="rounded-full border border-[#f2d3c2]/24 bg-white/8 px-3 py-1 text-sm font-black text-[#f2d3c2]">{coverLetterHealth.label}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className={`rounded-full border px-3 py-2 text-xs font-extrabold ${saveStatusClasses()}`}>{saveStatusLabel()}</span>
          {saveState === "error" ? (
            <button type="button" onClick={() => saveDocument(false)} className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-extrabold text-white">
              Retry
            </button>
          ) : null}
          <button
            type="button"
            aria-expanded={coverLetterHealthExpanded}
            aria-controls={panelId}
            onClick={() => setCoverLetterHealthExpanded((expanded) => !expanded)}
            className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-black text-white/70 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2]"
          >
            {coverLetterHealthExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
        {coverLetterHealthExpanded ? (
          <p id={panelId} className="text-xs font-bold leading-5 text-[#e7ded0]/82 sm:col-span-2">{coverLetterHealth.recommendation}</p>
        ) : null}
      </div>
    );
  }

  function renderSyncedCvSection(title: string, items: string[], options: { optional?: boolean } = {}) {
    const cleanItems = items.map((item) => item.trim()).filter(Boolean);
    const status = sectionStatus(title, cleanItems, options.optional);
    const editHref = professionalIdentityHrefForCvSection(title);
    return (
      <div className={`rounded-[20px] border p-4 ${activeCvSection === title ? "border-[#f2b8a2]/45 bg-[#7f1d1d]/14" : "border-white/10 bg-white/6"}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-white">{title}</p>
            <p className="mt-1 text-xs font-bold leading-5 text-white/48">This CV section is populated from Professional Identity.</p>
          </div>
          <span className={`w-fit rounded-full border px-3 py-2 text-xs font-extrabold ${statusClasses(status)}`}>{status}</span>
        </div>
        {cleanItems.length ? (
          <ul className="mt-4 grid gap-2 text-sm font-semibold leading-6 text-white/72">
            {cleanItems.slice(0, 8).map((item) => <li key={item} className="rounded-[14px] border border-white/10 bg-white/6 px-3 py-2">{item}</li>)}
          </ul>
        ) : (
          <p className="mt-4 rounded-[14px] border border-dashed border-white/14 bg-white/5 px-3 py-3 text-sm font-semibold leading-6 text-white/58">
            Add this information in Professional Identity and it will appear here automatically.
          </p>
        )}
        <Link href={editHref} className="mt-4 inline-flex rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-extrabold text-white">
          Edit in Professional Identity
        </Link>
      </div>
    );
  }

  function renderSyncedHeaderSection() {
    if (!parsedCv) return null;
    return renderSyncedCvSection("Professional Header", [
      parsedCv.fullName,
      parsedCv.targetRole,
      parsedCv.email,
      parsedCv.phone,
      [parsedCv.city, parsedCv.country].filter(Boolean).join(", "),
      parsedCv.linkedIn,
      parsedCv.portfolio,
      parsedCv.github,
      parsedCv.website
    ]);
  }

  function renderSyncedMoreSections() {
    return (
      <div className="grid gap-3">
        <p className="text-xs font-bold leading-5 text-white/52">Optional CV sections stay synchronized with Professional Identity where PATHZY has matching profile fields.</p>
        {cvMoreSections.map((title) => renderSyncedCvSection(title, cvSectionItems(title), { optional: optionalCvSections.includes(title) }))}
      </div>
    );
  }

  function renderCvAccordionContent(item: { label: string; section: string }) {
    if (!document?.content || !parsedCv) {
      return (
        <div className="rounded-[18px] border border-dashed border-white/14 bg-white/5 p-6 text-center">
          <h3 className="text-lg font-black">Your CV needs a little more information.</h3>
          <p className="mt-3 text-sm leading-6 text-white/58">Complete Professional Identity once. PATHZY will use that information to build your CV automatically.</p>
          <Link href={routeBuilders.professionalIdentityReview(appRoutes.professionalIdentityCv)} className="mt-5 inline-flex rounded-full bg-[#b4232a] px-5 py-3 shadow-[0_12px_30px_rgba(127,29,29,.24)] transition hover:bg-[#961f25] text-sm font-extrabold text-white">
            Complete Professional Identity
          </Link>
        </div>
      );
    }
    if (item.section === "Professional Header") return renderSyncedHeaderSection();
    if (item.section === "Professional Summary") return renderSyncedCvSection("Professional Summary", cvSectionItems("Professional Summary"));
    if (item.section === "Core Competencies / Skills") return renderSyncedCvSection("Core Competencies / Skills", skillGroupSections.flatMap((group) => cvSectionItems(group.title)));
    if (item.label === "More") return renderSyncedMoreSections();
    return renderSyncedCvSection(item.section, cvSectionItems(item.section), { optional: optionalCvSections.includes(item.section) });
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

  function renderCoverLetterIdentityCorrectionCard() {
    return (
      <div className="rounded-[20px] border border-[#7f1d1d]/20 bg-[#151110]/92 p-3">
        <div className="flex flex-col gap-3 rounded-[16px] border border-white/8 bg-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f2b8a2]/70">Want to change something?</p>
            <p className="mt-1 max-w-3xl text-sm font-bold leading-6 text-white/68">
              Your Cover Letter uses your Professional Identity as its source of truth. Update your information there, then return to this Cover Letter with your content synchronized.
            </p>
          </div>
          <Link
            href={routeBuilders.professionalIdentityReview(appRoutes.professionalIdentityCoverLetter)}
            className="inline-flex w-fit rounded-full border border-[#f2b8a2]/24 bg-[#7f1d1d]/22 px-4 py-2 text-sm font-extrabold text-[#f2b8a2] transition hover:border-[#f2b8a2]/42 hover:bg-[#7f1d1d]/32 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2]"
          >
            Edit Information
          </Link>
        </div>
      </div>
    );
  }

  function renderBodyParagraphsEditor() {
    if (!coverLetterData) return null;
    const paragraphs = coverLetterData.bodyParagraphs.length ? coverLetterData.bodyParagraphs : [""];
    return renderCoverLetterSection(
      "8. Additional Paragraphs",
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
        {renderCoverLetterSection("2. Job / Application Details", (
          <>
            {renderCoverLetterField("Company name", coverLetterData.companyName, (value) => updateCoverLetterDraft((draft) => { draft.companyName = value; }))}
            {renderCoverLetterField("Hiring manager", coverLetterData.hiringManager, (value) => updateCoverLetterDraft((draft) => { draft.hiringManager = value; }))}
            {renderCoverLetterField("Job title", coverLetterData.jobTitle, (value) => updateCoverLetterDraft((draft) => { draft.jobTitle = value; }))}
            {renderCoverLetterField("Company address", coverLetterData.companyAddress, (value) => updateCoverLetterDraft((draft) => { draft.companyAddress = value; }))}
            {renderCoverLetterField("Date", coverLetterData.date, (value) => updateCoverLetterDraft((draft) => { draft.date = value; }))}
            {renderCoverLetterField("Subject", coverLetterData.subject, (value) => updateCoverLetterDraft((draft) => { draft.subject = value; }))}
          </>
        ))}
        {renderCoverLetterSection("3. Greeting", renderCoverLetterField("Greeting", coverLetterData.greeting, (value) => updateCoverLetterDraft((draft) => { draft.greeting = value; })))}
        {renderCoverLetterSection("4. Opening Paragraph", renderCoverLetterField("Opening paragraph", coverLetterData.openingParagraph, (value) => updateCoverLetterDraft((draft) => { draft.openingParagraph = value; }), true))}
        {renderCoverLetterSection("5. Motivation / Why This Role", renderCoverLetterField("Motivation", coverLetterData.motivationParagraph, (value) => updateCoverLetterDraft((draft) => { draft.motivationParagraph = value; }), true))}
        {renderCoverLetterSection("6. Evidence / Why Me", renderCoverLetterField("Evidence", coverLetterData.evidenceParagraph, (value) => updateCoverLetterDraft((draft) => { draft.evidenceParagraph = value; }), true))}
        {renderCoverLetterSection("7. Company Alignment", renderCoverLetterField("Company alignment", coverLetterData.companyAlignmentParagraph, (value) => updateCoverLetterDraft((draft) => { draft.companyAlignmentParagraph = value; }), true))}
        {renderBodyParagraphsEditor()}
        {renderCoverLetterSection("9. Closing Paragraph", renderCoverLetterField("Closing paragraph", coverLetterData.closingParagraph, (value) => updateCoverLetterDraft((draft) => { draft.closingParagraph = value; }), true))}
        {renderCoverLetterSection("10. Sign-off", (
          <>
            {renderCoverLetterField("Closing phrase", coverLetterData.closingPhrase, (value) => updateCoverLetterDraft((draft) => { draft.closingPhrase = value; }))}
            {renderCoverLetterField("Signature name", coverLetterData.signature, (value) => updateCoverLetterDraft((draft) => { draft.signature = value; }))}
          </>
        ))}
      </div>
    );
  }

  function renderCoverLetterMiniPreview(template: (typeof coverLetterTemplateGallery)[number]) {
    const line = "rounded-full bg-slate-300/80";
    const darkLine = "rounded-full bg-slate-700/80";
    return (
      <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white p-2 shadow-[0_14px_34px_rgba(0,0,0,.18)]">
        <div className="aspect-[210/297] rounded-[10px] bg-white p-2 text-slate-900" style={{ background: template.background }}>
          {template.architecture === "executive" ? (
            <div className="h-full bg-white">
              <div className="h-[23%] rounded-t-[8px] bg-slate-950 p-2">
                <div className="h-1.5 w-10 rounded-full" style={{ backgroundColor: template.accent }} />
                <div className="mt-3 h-2.5 w-24 rounded-full bg-white/90" />
                <div className="mt-2 h-1.5 w-20 rounded-full bg-white/45" />
              </div>
              <div className="space-y-2 p-2">
                <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: template.accent }} />
                <div className={darkLine} />
                <div className={line} />
                <div className={line} />
                <div className="mt-4 h-1.5 w-14 rounded-full bg-slate-500/80" />
              </div>
            </div>
          ) : template.architecture === "signature" ? (
            <div className="h-full space-y-3 p-2">
              <div className="flex justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="h-2.5 w-24 rounded-full bg-slate-800" />
                  <div className="h-1.5 w-16 rounded-full bg-slate-400" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-10 rounded-full bg-slate-300" />
                  <div className="h-1.5 w-12 rounded-full bg-slate-300" />
                </div>
              </div>
              <div className="h-1 w-16 rounded-full" style={{ backgroundColor: template.accent }} />
              <div className="space-y-1.5">
                <div className={darkLine} />
                <div className={line} />
                <div className={line} />
                <div className="h-1.5 w-20 rounded-full bg-slate-300" />
              </div>
              <div className="pt-5">
                <div className="h-1.5 w-14 rounded-full bg-slate-400" />
                <div className="mt-2 h-2 w-20 rounded-full bg-slate-800" />
              </div>
            </div>
          ) : template.architecture === "creative" ? (
            <div className="h-full rounded-[10px] border border-slate-200 bg-white p-2">
              <div className="flex gap-2 rounded-[8px] bg-amber-50 p-2">
                <div className="h-12 w-1.5 rounded-full" style={{ backgroundColor: template.accent }} />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-24 rounded-full bg-slate-800" />
                  <div className="h-1.5 w-20 rounded-full bg-slate-400" />
                  <div className="h-1.5 w-28 rounded-full bg-slate-300" />
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className={darkLine} />
                <div className={line} />
                <div className={line} />
                <div className="h-1.5 w-16 rounded-full bg-slate-300" />
              </div>
            </div>
          ) : (
            <div className="h-full space-y-2 p-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="h-2.5 w-24 rounded-full bg-slate-800" />
                  <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: template.accent }} />
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-12 rounded-full bg-slate-300" />
                  <div className="h-1.5 w-10 rounded-full bg-slate-300" />
                </div>
              </div>
              <div className="h-px w-full bg-slate-200" />
              <div className="h-2 w-28 rounded-full bg-slate-700" />
              <div className="space-y-1.5">
                <div className={darkLine} />
                <div className={line} />
                <div className={line} />
                <div className={line} />
              </div>
              <div className="mt-3 h-1.5 w-16 rounded-full bg-slate-400" />
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderCoverLetterTemplateGallery() {
    const selectTemplate = (name: string) => {
      updateValue("templateName", name);
      setCoverLetterTemplateBrowserOpen(false);
    };

    return (
      <>
        <Card className="overflow-hidden border-[#7f1d1d]/16 bg-[#111318]/94">
          <div className="grid gap-4 rounded-[18px] border border-white/8 bg-[#1a1513]/58 p-4 lg:grid-cols-[minmax(240px,320px)_1fr_auto] lg:items-center">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f2b8a2]/62">Design</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="w-14 shrink-0">
                  {renderCoverLetterMiniPreview(selectedTemplateMetadata as (typeof coverLetterTemplateGallery)[number])}
                </div>
                <div>
                  <h3 className="text-base font-black leading-5 text-white">{selectedTemplateMetadata.name}</h3>
                  <p className="mt-1 text-xs font-bold leading-5 text-[#f2b8a2]/78">Recommended for: {selectedTemplateMetadata.bestFor}</p>
                  <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white/42">{(selectedTemplateMetadata as (typeof coverLetterTemplateGallery)[number]).architecture.replace("-", " ")} letter</p>
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/38">Recommended designs</p>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="Recommended Cover Letter templates">
                {recommendedCoverLetterTemplates.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => selectTemplate(template.name)}
                    className={`flex min-w-[170px] items-center gap-2 rounded-[14px] border p-2 text-left transition hover:-translate-y-0.5 ${templateName === template.name ? "border-[#f2b8a2]/70 bg-[#7f1d1d]/24" : "border-white/10 bg-white/5 hover:border-[#f2b8a2]/28"}`}
                  >
                    <div className="w-9 shrink-0">{renderCoverLetterMiniPreview(template)}</div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-xs font-black text-white">{template.name}</p>
                      <p className="mt-1 line-clamp-1 text-[10px] font-bold text-white/44">{template.architecture.replace("-", " ")} letter</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCoverLetterTemplateBrowserOpen(true)}
              className="h-11 rounded-full border border-[#f2b8a2]/24 bg-[#7f1d1d]/22 px-5 text-sm font-extrabold text-[#f2b8a2] transition hover:border-[#f2b8a2]/42 hover:bg-[#7f1d1d]/32 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2]"
            >
              Browse all templates
            </button>
          </div>
        </Card>

        {coverLetterTemplateBrowserOpen ? (
          <div className="fixed inset-0 z-50 grid bg-black/72 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="cover-letter-template-browser-title">
            <div className="mx-auto grid h-full w-full max-w-6xl grid-rows-[auto_1fr] overflow-hidden rounded-[28px] border border-white/10 bg-[#111318] shadow-[0_28px_90px_rgba(0,0,0,.55)]">
              <div className="border-b border-white/10 bg-[#18110f] p-4 sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f2b8a2]/62">Template gallery</p>
                    <h3 id="cover-letter-template-browser-title" className="mt-1 text-2xl font-black text-white">Choose a recruiter-ready design</h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-white/54">Browse letter-specific templates without expanding the page. Presentation changes only. Your candidate and job data stay the same.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoverLetterTemplateBrowserOpen(false)}
                    className="w-fit rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-extrabold text-white/78 transition hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2]"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Cover Letter template categories">
                  {coverLetterTemplateCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setCoverLetterTemplateCategory(category)}
                      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold transition ${coverLetterTemplateCategory === category ? "border-[#f2b8a2]/60 bg-[#7f1d1d]/28 text-white" : "border-white/10 bg-black/18 text-white/62 hover:border-[#f2b8a2]/28"}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
                <p className="mb-3 text-[11px] font-bold text-white/42">{filteredCoverLetterTemplates.length} cover letter template{filteredCoverLetterTemplates.length === 1 ? "" : "s"} shown</p>
                <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
                  {filteredCoverLetterTemplates.map((template) => (
                    <button
                      key={template.name}
                      type="button"
                      onClick={() => selectTemplate(template.name)}
                      className={`group flex min-h-[238px] flex-col rounded-[16px] border p-2.5 text-left transition hover:-translate-y-0.5 ${templateName === template.name ? "border-[#f2b8a2]/70 bg-[#7f1d1d]/24 shadow-[0_14px_34px_rgba(127,29,29,.24)]" : "border-white/10 bg-white/5 hover:border-[#f2b8a2]/26"}`}
                    >
                      {renderCoverLetterMiniPreview(template)}
                      <div className="mt-3 flex items-start justify-between gap-2">
                        <p className="text-sm font-black leading-5 text-white">{template.name}</p>
                        {templateName === template.name ? <span className="shrink-0 rounded-full bg-[#b4232a] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-white">Selected</span> : null}
                      </div>
                      <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white/38">{template.architecture.replace("-", " ")} letter</p>
                      <p className="mt-2 line-clamp-2 text-[11px] font-bold leading-4 text-[#f2b8a2]/82">Best for: {template.bestFor}</p>
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-2 text-[9px] font-extrabold uppercase tracking-[0.08em] text-white/64">
                        <span className="rounded-full bg-[#7f1d1d]/24 px-2 py-1 text-[#f2b8a2]">Letter specific</span>
                        <span className="rounded-full bg-white/8 px-2 py-1">PDF ready</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  function renderCvTemplateGallery() {
    const selectTemplate = (name: string) => {
      updateValue("templateName", name);
      setCvTemplateBrowserOpen(false);
    };
    return (
      <>
        <Card className="overflow-hidden border-[#7f1d1d]/16 bg-[#111318]/94">
          <div className="grid gap-4 rounded-[18px] border border-white/8 bg-[#1a1513]/58 p-4 lg:grid-cols-[minmax(240px,320px)_1fr_auto] lg:items-center">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f2b8a2]/62">Design</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="[&_.cv-template-mini-preview]:h-20 [&_.cv-template-mini-preview]:w-14 [&_.cv-template-mini-preview]:rounded-[10px] [&_.cv-template-mini-preview]:border-black/8 [&_.cv-template-mini-preview]:p-1.5">
                  <TemplateMiniPreview template={selectedCvTemplateMetadata} />
                </div>
                <div>
                  <h3 className="text-base font-black leading-5 text-white">{selectedCvTemplateMetadata.name}</h3>
                  <p className="mt-1 text-xs font-bold leading-5 text-[#f2b8a2]/78">Recommended for: {selectedCvTemplateMetadata.bestFor}</p>
                  <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white/42">{selectedCvTemplateMetadata.atsClassification}</p>
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/38">Recommended designs</p>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="Recommended CV templates">
                {recommendedDocumentTemplates.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => selectTemplate(template.name)}
                    className={`min-w-[150px] rounded-[14px] border p-2 text-left transition hover:-translate-y-0.5 ${templateName === template.name ? "border-[#f2b8a2]/70 bg-[#7f1d1d]/24" : "border-white/10 bg-white/5 hover:border-[#f2b8a2]/28"}`}
                  >
                    <p className="line-clamp-1 text-xs font-black text-white">{template.name}</p>
                    <p className="mt-1 line-clamp-1 text-[10px] font-bold text-white/44">{template.family}</p>
                    <p className="mt-2 rounded-full bg-white/8 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#f2b8a2]">{template.atsClassification}</p>
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCvTemplateBrowserOpen(true)}
              className="h-11 rounded-full border border-[#f2b8a2]/24 bg-[#7f1d1d]/22 px-5 text-sm font-extrabold text-[#f2b8a2] transition hover:border-[#f2b8a2]/42 hover:bg-[#7f1d1d]/32 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2]"
            >
              Browse all templates
            </button>
          </div>
        </Card>

        {cvTemplateBrowserOpen ? (
          <div className="fixed inset-0 z-50 grid bg-black/72 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="cv-template-browser-title">
            <div className="mx-auto grid h-full w-full max-w-7xl grid-rows-[auto_1fr] overflow-hidden rounded-[28px] border border-white/10 bg-[#111318] shadow-[0_28px_90px_rgba(0,0,0,.55)]">
              <div className="border-b border-white/10 bg-[#18110f] p-4 sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f2b8a2]/62">Template gallery</p>
                    <h3 id="cv-template-browser-title" className="mt-1 text-2xl font-black text-white">Choose a recruiter-ready design</h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-white/54">Browse {documentTemplateGallery.length} premium templates without expanding the CV page. Presentation changes only. Your canonical CV content stays the same.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCvTemplateBrowserOpen(false)}
                    className="w-fit rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-extrabold text-white/78 transition hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2]"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-4 grid gap-2 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                  <label className="sr-only" htmlFor="cv-template-search">Search CV templates</label>
                  <input
                    id="cv-template-search"
                    value={cvTemplateSearch}
                    onChange={(event) => setCvTemplateSearch(event.target.value)}
                    placeholder="Search templates"
                    className="h-11 rounded-full border border-white/10 bg-black/18 px-4 text-sm font-bold text-white outline-none placeholder:text-white/38 focus:border-[#f2b8a2]/50"
                  />
                  <label className="sr-only" htmlFor="cv-template-family">Template family</label>
                  <select id="cv-template-family" value={cvTemplateFamily} onChange={(event) => setCvTemplateFamily(event.target.value)} className="h-11 rounded-full border border-white/10 bg-black/18 px-4 text-sm font-bold text-white outline-none focus:border-[#f2b8a2]/50">
                    {cvTemplateFamilies.map((family) => <option key={family} value={family}>{family}</option>)}
                  </select>
                  <label className="sr-only" htmlFor="cv-template-ats">ATS classification</label>
                  <select id="cv-template-ats" value={cvTemplateAtsFilter} onChange={(event) => setCvTemplateAtsFilter(event.target.value)} className="h-11 rounded-full border border-white/10 bg-black/18 px-4 text-sm font-bold text-white outline-none focus:border-[#f2b8a2]/50">
                    {cvTemplateAtsFilters.map((classification) => <option key={classification} value={classification}>{classification}</option>)}
                  </select>
                </div>
              </div>
              <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
                <p className="mb-3 text-[11px] font-bold text-white/42">{filteredDocumentTemplates.length} template{filteredDocumentTemplates.length === 1 ? "" : "s"} shown</p>
                <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(154px,1fr))]">
                  {filteredDocumentTemplates.map((template) => (
                    <button
                      key={template.name}
                      type="button"
                      onClick={() => selectTemplate(template.name)}
                      className={`group flex min-h-[218px] flex-col rounded-[16px] border p-2.5 text-left transition hover:-translate-y-0.5 [&_.cv-template-mini-preview]:h-20 [&_.cv-template-mini-preview]:rounded-[12px] [&_.cv-template-mini-preview]:border-black/8 [&_.cv-template-mini-preview]:p-2 ${templateName === template.name ? "border-[#f2b8a2]/70 bg-[#7f1d1d]/24 shadow-[0_14px_34px_rgba(127,29,29,.24)]" : "border-white/10 bg-white/5 hover:border-[#f2b8a2]/26"}`}
                    >
                      <TemplateMiniPreview template={template} />
                      <div className="mt-3 flex items-start justify-between gap-2">
                        <p className="text-sm font-black leading-5 text-white">{template.name}</p>
                        {templateName === template.name ? <span className="shrink-0 rounded-full bg-[#b4232a] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-white">Selected</span> : null}
                      </div>
                      <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white/38">{template.family}</p>
                      <p className="mt-2 line-clamp-2 text-[11px] font-bold leading-4 text-[#f2b8a2]/82">Best for: {template.bestFor}</p>
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-2 text-[9px] font-extrabold uppercase tracking-[0.08em] text-white/64">
                        <span className="rounded-full bg-[#7f1d1d]/24 px-2 py-1 text-[#f2b8a2]">{template.atsClassification}</span>
                        <span className="rounded-full bg-white/8 px-2 py-1">{template.atsCharacteristic}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  function coverLetterFieldValue(name: keyof GenerateOptions) {
    return typeof values[name] === "string" ? (values[name] as string) : "";
  }

  function coverLetterJobContextFromValues(): CoverLetterJobContext {
    const requirements = splitCoverLetterList(coverLetterFieldValue("keyRequirements"));
    const responsibilities = splitCoverLetterList(coverLetterFieldValue("keyResponsibilities"));
    const qualifications = splitCoverLetterList(coverLetterFieldValue("qualifications"));
    return {
      source: coverLetterFieldValue("jobDescription") ? "pasted_job_description" : coverLetterFieldValue("company") || coverLetterFieldValue("role") ? "manual" : "missing",
      company: coverLetterFieldValue("company"),
      role: coverLetterFieldValue("role"),
      jobDescription: coverLetterFieldValue("jobDescription"),
      location: coverLetterFieldValue("companyLocation"),
      hiringManager: coverLetterFieldValue("recruiterName"),
      referenceNumber: coverLetterFieldValue("referenceNumber"),
      closingDate: coverLetterFieldValue("closingDate"),
      url: coverLetterFieldValue("jobUrl"),
      requirements,
      responsibilities,
      qualifications,
      experienceRequirements: coverLetterFieldValue("experienceRequirements")
    };
  }

  function coverLetterHasRequiredJobContext() {
    const context = coverLetterJobContextFromValues();
    return Boolean(context.role?.trim() && context.company?.trim());
  }

  function splitCoverLetterList(value: string) {
    return value
      .split(/\r?\n|;|,/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12);
  }

  function inferPastedJobContext(text: string): Partial<Record<keyof GenerateOptions, string>> {
    const clean = text.trim();
    const lines = clean.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const findValue = (...patterns: RegExp[]) => {
      for (const line of lines) {
        for (const pattern of patterns) {
          const match = line.match(pattern);
          if (match?.[1]?.trim()) return match[1].trim();
        }
      }
      return "";
    };
    const inferredRole = findValue(/^(?:job title|position|role|poste|intitule du poste)\s*[:\-]\s*(.+)$/i) || (lines[0] && lines[0].length <= 90 ? lines[0] : "");
    const inferredCompany = findValue(/^(?:company|organisation|organization|employer|entreprise|societe|recruteur)\s*[:\-]\s*(.+)$/i);
    const location = findValue(/^(?:location|lieu|localisation)\s*[:\-]\s*(.+)$/i);
    const closingDate = findValue(/^(?:closing date|deadline|date limite|cloture)\s*[:\-]\s*(.+)$/i);
    const requirements = lines.filter((line) => /require|must|essential|required|qualification|competenc|exig|obligatoire|indispensable/i.test(line)).slice(0, 6).join("\n");
    const responsibilities = lines.filter((line) => /responsib|duties|you will|mission|taches|fonctions/i.test(line)).slice(0, 6).join("\n");
    return {
      role: inferredRole,
      company: inferredCompany,
      companyLocation: location,
      closingDate,
      jobDescription: clean,
      keyRequirements: requirements,
      keyResponsibilities: responsibilities
    };
  }

  function applyPastedJobDescription() {
    const extracted = inferPastedJobContext(pastedJobDescription);
    setValues((current) => {
      const next = { ...current, jobDescription: pastedJobDescription };
      for (const [key, value] of Object.entries(extracted) as Array<[keyof GenerateOptions, string]>) {
        if (!value) continue;
        if (key === "language") continue;
        if (key === "jobDescription" || !coverLetterFieldValueFromRecord(current, key)) {
          (next as Record<string, string | undefined>)[key] = value;
        }
      }
      return next;
    });
    setJobExtractionReviewed(true);
    setCoverLetterJobContextMode("manual");
  }

  function coverLetterFieldValueFromRecord(record: GenerateOptions, name: keyof GenerateOptions) {
    return typeof record[name] === "string" ? (record[name] as string).trim() : "";
  }

  function updateValue(name: keyof GenerateOptions, value: string) {
    const nextValue = name === "templateName" ? (tool === "cover-letter" ? normalizeCoverLetterTemplate(value) : normalizeDocumentTemplate(value)) : value;
    setValues((current) => ({ ...current, [name]: nextValue }));
    if (document && name === "templateName" && tool === "cv" && cvModel) {
      const version = { ...cvVersionFromDocument(document, nextValue), designSystem: nextValue, updatedAt: new Date().toISOString() };
      const next = { ...document, template_name: nextValue, contentJson: { ...(document.contentJson ?? {}), cvModel, cvVersion: version } };
      setDocument(next);
      setPreviewCvModel(cvModel);
      if (document.id) {
        window.localStorage.setItem(recoveryKey, JSON.stringify(next));
        setSaved(false);
        setSaveState("idle");
        setHasUnsavedChanges(true);
      } else {
        setSaved(true);
        setSaveState("saved");
        setHasUnsavedChanges(false);
      }
      return;
    }
    if (document && name === "templateName" && tool === "cover-letter" && coverLetterData) {
      const draft = { ...coverLetterData, designSystem: normalizeCoverLetterTemplate(nextValue) };
      const content = serializeCoverLetterData(draft);
      const next = { ...document, template_name: draft.designSystem, content, contentJson: coverLetterContentJson(document, draft, false) };
      setCoverLetterData(draft);
      setPreviewCoverLetterData(draft);
      setDocument(next);
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
          setValues((current) => ({ ...current, templateName: normalizeDocumentTemplate(latest.template_name ?? current.templateName ?? "PATHZY Signature Professional") }));
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
    if (tool === "cover-letter" && !coverLetterHasRequiredJobContext()) {
      setError("Add the job title and company name before PATHZY generates a tailored cover letter.");
      setCoverLetterJobContextMode("manual");
      return;
    }

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

  async function copyDocument() {
    if (!document?.content) return;
    await navigator.clipboard.writeText(document.content);
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
            : tool === "cover-letter" && coverLetterData
              ? coverLetterContentJson(document, normalizeCoverLetterDataForExport(coverLetterData), false)
              : tool === "linkedin"
                ? linkedInContentJson(document, false)
                : undefined,
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
    if (downloadBusy) return;
    if (!document?.content) {
      setError("Please generate your document before downloading.");
      return;
    }
    if (tool !== "cover-letter" && (hasUnsavedChanges || saveState === "error" || !saved)) {
      setError("Please save your document before downloading.");
      return;
    }
    if (exportLocked && !coreDownloadsAllowed) {
      setExportUpgradeRequired(true);
      return;
    }
    setDownloadState("preparing");
    setDownloadNotice("");
    setError("");
    try {
      if (tool === "cover-letter" && coverLetterData && (hasUnsavedChanges || saveState === "error" || !saved)) {
        const saveOk = await saveDocument(true);
        if (!saveOk) {
          setDownloadState("error");
          return;
        }
      }
      setDownloadState("downloading");
      const exportCoverLetterData = coverLetterData ? normalizeCoverLetterDataForExport(coverLetterData) : null;
      const pdf = tool === "cv" && cvModel
        ? simplePdfDocumentFromModel(document.title, cvModel, templateName)
        : tool === "cover-letter" && exportCoverLetterData
          ? simpleCoverLetterPdfDocument(exportCoverLetterData)
          : simplePdfDocument(document.title, document.content, templateName, false);
      downloadBlob(tool === "cover-letter" && exportCoverLetterData ? coverLetterPdfFilename(exportCoverLetterData) : pathzyFilename(tool === "cv" ? "CV" : "Document", document.title, "pdf"), "application/pdf", pdf);
      await markDownloaded();
      setDownloadNotice("Your file has downloaded to your browser's Downloads folder.");
      setDownloadState("idle");
    } catch {
      setDownloadState("error");
      setError("Download failed. Your document is still saved. Please try again.");
    }
  }

  async function handleOldCvUpload(file: File | null) {
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const extensionType = extension === "pdf" ? "application/pdf" : extension === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : extension === "txt" ? "text/plain" : "";
    const detectedType = !file.type || file.type === "application/octet-stream" ? extensionType : file.type;
    if (!allowed.includes(detectedType) || (file.type && file.type !== "application/octet-stream" && extensionType && file.type !== extensionType)) {
      setCvImportStatus("error");
      setOldCvNotice("This file format isn't supported yet. Please upload a PDF, DOCX, or TXT CV.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setCvImportStatus("error");
      setOldCvNotice("This file is too large. Please upload a file smaller than 8MB.");
      return;
    }
    if (file.size <= 0) {
      setCvImportStatus("error");
      setOldCvNotice("This CV file appears to be empty.");
      return;
    }
    setCvImportSummary(null);
    setPendingImportedCv(null);
    setCvImportStatus("reading");
    setOldCvNotice("Reading your CV...");
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? "").split(",")[1] ?? "");
        reader.onerror = () => reject(new Error("We could not read this file in your browser. Please try again."));
        reader.readAsDataURL(file);
      });
      setCvImportStatus("inspecting");
      setOldCvNotice("Inspecting your document before extraction...");
      const response = await fetch("/api/professional-identity/import-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: detectedType,
          fileSize: file.size,
          base64,
          templateName
        })
      });
      setCvImportStatus("visual-reading");
      setOldCvNotice("Understanding your document layout and reading order...");
      setCvImportStatus("semantic-understanding");
      setOldCvNotice("Understanding your career information...");
      setCvImportStatus("extracting");
      setOldCvNotice("Finding your experience...");
      setCvImportStatus("organizing");
      setOldCvNotice("Organising your education and skills...");
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error ?? "We could not complete the CV import. Your existing PATHZY information is safe.");
      if (!data.staging) throw new Error("We could not prepare your imported CV for review. Please try again.");
      setCvImportStatus("saving");
      setPendingImportedCv(data.staging);
      setCvImportSummary(data.importSummary ?? null);
      setCvImportStatus("ready");
      setOldCvNotice("Your PATHZY CV is ready to review. Select Review Imported CV to open it in the editor.");
      window.requestAnimationFrame(() => {
        window.document.getElementById("imported-cv-review")?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
    } catch (caught) {
      console.error("[professional-identity] CV import failed", caught instanceof Error ? caught.message : caught);
      setCvImportStatus("error");
      setOldCvNotice(caught instanceof Error ? caught.message : "We could not complete the CV import. Your existing PATHZY information is safe.");
    }
  }

  async function confirmImportedCv() {
    if (!pendingImportedCv) return;
    setCvImportStatus("saving");
    setOldCvNotice("Saving your imported CV draft...");
    try {
      const response = await fetch("/api/professional-identity/import-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirm: true,
          staging: pendingImportedCv,
          templateName
        })
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error ?? "We could not save your imported CV yet. Please try again.");
      setCvDocument(data.document, true);
      setCvEntryMode("profile");
      setActiveCvSection("Professional Header");
      setSectionNotice("Imported from your CV. Review each section before downloading.");
      setCvImportStatus("ready");
      setOldCvNotice("");
    } catch (caught) {
      console.error("[professional-identity] imported CV confirmation failed", caught instanceof Error ? caught.message : caught);
      setCvImportStatus("error");
      setOldCvNotice(caught instanceof Error ? caught.message : "We could not save your imported CV yet. Please try again.");
    }
  }

  function setCvZoom(nextScale: number) {
    const clamped = Number(Math.max(0.35, Math.min(1.35, nextScale)).toFixed(2));
    setCvCustomScale(clamped);
    setCvPreviewScaleMode("custom");
    setCvPreviewScale(clamped);
  }

  function renderCvDocumentBar() {
    const candidateName = previewCvModel?.fullName?.trim() || cvModel?.fullName?.trim() || "";
    const statusLabel = cvSyncStatus?.status === "needs_information" ? "Needs information" : hasUnsavedChanges ? "Unsaved changes" : "Synced / Up to date";

    return (
      <Card className="overflow-hidden border-[#7f1d1d]/20 bg-[#111318]/96">
        <div className="flex flex-col gap-4 rounded-[20px] border border-white/8 bg-[#18110f]/72 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#f2b8a2]/70">MY CV</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Professional CV{candidateName ? ` - ${candidateName}` : ""}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#39d98a]/25 bg-[#39d98a]/10 px-3 py-1 text-xs font-extrabold text-[#b9f8d5]">Status: {statusLabel}</span>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-bold text-white/58">{cvPreviewPageCount} A4 page{cvPreviewPageCount === 1 ? "" : "s"}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <button onClick={downloadPdf} disabled={!document?.content || downloadBusy} className="rounded-full bg-[#b4232a] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(127,29,29,.26)] transition hover:bg-[#961f25] disabled:cursor-not-allowed disabled:opacity-50">
              {downloadBusy ? "Preparing..." : "Download PDF"}
            </button>
            <Link href={routeBuilders.professionalIdentityReview(appRoutes.professionalIdentityCv)} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/78 transition hover:bg-white/12">
              Edit information
            </Link>
            <button type="button" onClick={() => setCvPreviewMode("ats")} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/78 transition hover:bg-white/12">
              ATS Preview
            </button>
          </div>
        </div>
      </Card>
    );
  }

  function renderCvPreviewToolbar() {
    return (
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 rounded-[18px] border border-[#7f1d1d]/25 bg-[#111318]/95 p-2 backdrop-blur" aria-label="CV preview controls">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setCvPreviewMode("designed")} aria-pressed={cvPreviewMode === "designed"} className={`rounded-full border px-3 py-2 text-xs font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2] ${cvPreviewMode === "designed" ? "border-[#f2b8a2]/60 bg-[#7f1d1d]/28 text-white" : "border-white/12 bg-white/8 text-white/72"}`}>
            Designed
          </button>
          <button type="button" onClick={() => setCvPreviewMode("ats")} aria-pressed={cvPreviewMode === "ats"} className={`rounded-full border px-3 py-2 text-xs font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2] ${cvPreviewMode === "ats" ? "border-[#f2b8a2]/60 bg-[#7f1d1d]/28 text-white" : "border-white/12 bg-white/8 text-white/72"}`}>
            ATS
          </button>
          <button type="button" onClick={() => setCvPreviewScaleMode("fit_page")} aria-pressed={cvPreviewScaleMode === "fit_page"} className={`rounded-full border px-3 py-2 text-xs font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2] ${cvPreviewScaleMode === "fit_page" ? "border-[#f2b8a2]/60 bg-[#7f1d1d]/28 text-white" : "border-white/12 bg-white/8 text-white/72"}`}>
            Fit Page
          </button>
          <button type="button" onClick={() => setCvPreviewScaleMode("fit_width")} aria-pressed={cvPreviewScaleMode === "fit_width"} className={`rounded-full border px-3 py-2 text-xs font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2] ${cvPreviewScaleMode === "fit_width" ? "border-[#f2b8a2]/60 bg-[#7f1d1d]/28 text-white" : "border-white/12 bg-white/8 text-white/72"}`}>
            Fit Width
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setCvZoom(cvPreviewScale - 0.08)} aria-label="Zoom Out" className="grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-white/8 text-sm font-black text-white/78 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2]">
            -
          </button>
          <span className="min-w-[54px] text-center text-xs font-black text-white/72" aria-live="polite">{Math.round(cvPreviewScale * 100)}%</span>
          <button type="button" onClick={() => setCvZoom(cvPreviewScale + 0.08)} aria-label="Zoom In" className="grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-white/8 text-sm font-black text-white/78 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2]">
            +
          </button>
          <span className="hidden rounded-full bg-white/8 px-3 py-2 text-xs font-extrabold text-white/54 sm:inline-flex">Page 1 of {cvPreviewPageCount}</span>
        </div>
      </div>
    );
  }

  function renderCvPreviewViewer() {
    if (!document?.content || !previewCvModel) {
      return (
        <div className="mt-5 grid min-h-[420px] place-items-center rounded-[22px] border border-dashed border-white/14 bg-white/5 text-center">
          <div>
            <h3 className="text-xl font-black">Your CV needs a little more information.</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/58">Complete your Professional Identity and PATHZY will build this CV automatically.</p>
            <Link href={routeBuilders.professionalIdentityReview(appRoutes.professionalIdentityCv)} className="mt-5 inline-flex rounded-full bg-[#b4232a] px-5 py-3 shadow-[0_12px_30px_rgba(127,29,29,.24)] transition hover:bg-[#961f25] text-sm font-extrabold text-white">
              Complete Professional Identity
            </Link>
          </div>
        </div>
      );
    }

    const pageGap = 28;
    const scaledWidth = cvA4Page.width * cvPreviewScale;
    const scaledHeight = cvPreviewMode === "ats"
      ? cvA4Page.height * cvPreviewScale
      : cvPreviewPageCount * cvA4Page.height * cvPreviewScale + Math.max(0, cvPreviewPageCount - 1) * pageGap * cvPreviewScale;

    return (
      <div className="grid min-h-0 gap-3">
        {renderCvPreviewToolbar()}
        <div
          ref={cvPreviewViewportRef}
          className="overflow-auto rounded-[26px] border border-[#3f2a22]/50 bg-[#d8d0c4] p-3 text-black shadow-inner sm:p-6 lg:p-8"
          aria-label="Live CV A4 preview"
          data-cv-document-stage="true"
        >
          <div ref={previewScrollRef} className="relative mx-auto" style={{ width: scaledWidth, height: `${scaledHeight + 32}px` }}>
            <div
              className="absolute left-1/2 top-0 origin-top"
              style={{ width: cvA4Page.width, transform: `translateX(-50%) scale(${cvPreviewScale})`, transformOrigin: "top center" }}
            >
              <div dangerouslySetInnerHTML={{ __html: cvPreviewHtml }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderCoverLetterDocumentBar() {
    const jobTitle = previewCoverLetterData?.jobTitle?.trim() || coverLetterData?.jobTitle?.trim() || "";
    const company = previewCoverLetterData?.companyName?.trim() || coverLetterData?.companyName?.trim() || "";
    const documentTitle = jobTitle && company ? `Professional Cover Letter - ${jobTitle} at ${company}` : jobTitle ? `Professional Cover Letter - ${jobTitle}` : "Professional Cover Letter";
    const statusLabel = coverLetterSyncStatus?.status === "missing_information" ? "Needs information" : coverLetterSyncStatus?.status === "missing_job_context" ? "Needs job context" : hasUnsavedChanges ? "Unsaved changes" : "Synced / Up to date";

    return (
      <Card className="overflow-hidden border-[#7f1d1d]/20 bg-[#111318]/96">
        <div className="flex flex-col gap-4 rounded-[20px] border border-white/8 bg-[#18110f]/72 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#f2b8a2]/70">MY COVER LETTER</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">{documentTitle}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#39d98a]/25 bg-[#39d98a]/10 px-3 py-1 text-xs font-extrabold text-[#b9f8d5]">Status: {statusLabel}</span>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-bold text-white/58">{coverLetterPreviewPageCount} A4 page{coverLetterPreviewPageCount === 1 ? "" : "s"}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <button onClick={downloadPdf} disabled={!document?.content || downloadBusy} className="rounded-full bg-[#b4232a] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(127,29,29,.26)] transition hover:bg-[#961f25] disabled:cursor-not-allowed disabled:opacity-50">
              {downloadBusy ? "Preparing..." : "Download PDF"}
            </button>
            <Link href={routeBuilders.professionalIdentityReview(appRoutes.professionalIdentityCoverLetter)} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/78 transition hover:bg-white/12">
              Edit Information
            </Link>
            <button type="button" onClick={() => setCoverLetterJobContextMode("choose")} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/78 transition hover:bg-white/12">
              Change Job
            </button>
            <button type="button" onClick={() => cvPreviewViewportRef.current?.scrollIntoView({ block: "start", behavior: "smooth" })} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/78 transition hover:bg-white/12">
              Preview
            </button>
          </div>
        </div>
      </Card>
    );
  }

  function renderCoverLetterPreviewToolbar() {
    return (
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 rounded-[18px] border border-[#7f1d1d]/25 bg-[#111318]/95 p-2 backdrop-blur" aria-label="Cover Letter preview controls">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[#f2b8a2]/60 bg-[#7f1d1d]/28 px-3 py-2 text-xs font-extrabold text-white">Designed Preview</span>
          <button type="button" onClick={() => setCvPreviewScaleMode("fit_page")} aria-pressed={cvPreviewScaleMode === "fit_page"} className={`rounded-full border px-3 py-2 text-xs font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2] ${cvPreviewScaleMode === "fit_page" ? "border-[#f2b8a2]/60 bg-[#7f1d1d]/28 text-white" : "border-white/12 bg-white/8 text-white/72"}`}>
            Fit Page
          </button>
          <button type="button" onClick={() => setCvPreviewScaleMode("fit_width")} aria-pressed={cvPreviewScaleMode === "fit_width"} className={`rounded-full border px-3 py-2 text-xs font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2] ${cvPreviewScaleMode === "fit_width" ? "border-[#f2b8a2]/60 bg-[#7f1d1d]/28 text-white" : "border-white/12 bg-white/8 text-white/72"}`}>
            Fit Width
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setCvZoom(cvPreviewScale - 0.08)} aria-label="Zoom Out" className="grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-white/8 text-sm font-black text-white/78 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2]">
            -
          </button>
          <span className="min-w-[54px] text-center text-xs font-black text-white/72" aria-live="polite">{Math.round(cvPreviewScale * 100)}%</span>
          <button type="button" onClick={() => setCvZoom(cvPreviewScale + 0.08)} aria-label="Zoom In" className="grid h-9 w-9 place-items-center rounded-full border border-white/12 bg-white/8 text-sm font-black text-white/78 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2]">
            +
          </button>
          <span className="hidden rounded-full bg-white/8 px-3 py-2 text-xs font-extrabold text-white/54 sm:inline-flex">Page 1 of {coverLetterPreviewPageCount}</span>
        </div>
      </div>
    );
  }

  function renderCoverLetterJobContextEntry() {
    const role = coverLetterFieldValue("role");
    const company = coverLetterFieldValue("company");
    const hasContext = coverLetterHasRequiredJobContext();
    const mode = !hasContext && coverLetterJobContextMode === "closed" ? "choose" : coverLetterJobContextMode;
    const title = role || "Job title not added yet";
    const companyLabel = company || "Company not added yet";

    return (
      <div className="grid gap-4 rounded-[22px] border border-[#ffe2a8]/18 bg-[#17110f]/88 p-4 text-left" data-cover-letter-job-context-flow="true">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#ffe2a8]/80">Which opportunity are you applying for?</p>
            {hasContext ? (
              <>
                <h3 className="mt-2 text-xl font-black text-white">Professional Cover Letter</h3>
                <p className="mt-1 text-sm font-extrabold text-[#f2b8a2]">{title} at {companyLabel}</p>
              </>
            ) : (
              <>
                <h3 className="mt-2 text-xl font-black text-white">Add job context before generation</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">PATHZY needs the target role and company before it can create a truthful tailored cover letter.</p>
              </>
            )}
          </div>
          {hasContext ? (
            <button type="button" onClick={() => setCoverLetterJobContextMode("choose")} className="w-fit rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-extrabold text-white/78 transition hover:bg-white/12">
              Change Job
            </button>
          ) : null}
        </div>

        {mode === "choose" ? (
          <div className="grid gap-2 sm:grid-cols-3">
            <button type="button" onClick={() => setCoverLetterJobContextMode("saved")} className="rounded-[18px] border border-white/10 bg-white/7 px-4 py-4 text-left transition hover:border-[#f2b8a2]/34 hover:bg-white/10">
              <span className="block text-sm font-black text-white">Choose a saved job</span>
              <span className="mt-1 block text-xs font-bold leading-5 text-white/56">Use PATHZY Opportunities or Saved Jobs.</span>
            </button>
            <button type="button" onClick={() => setCoverLetterJobContextMode("paste")} className="rounded-[18px] border border-white/10 bg-white/7 px-4 py-4 text-left transition hover:border-[#f2b8a2]/34 hover:bg-white/10">
              <span className="block text-sm font-black text-white">Paste job description</span>
              <span className="mt-1 block text-xs font-bold leading-5 text-white/56">Extract details, then review them.</span>
            </button>
            <button type="button" onClick={() => setCoverLetterJobContextMode("manual")} className="rounded-[18px] border border-[#b4232a]/32 bg-[#7f1d1d]/24 px-4 py-4 text-left transition hover:bg-[#7f1d1d]/34">
              <span className="block text-sm font-black text-white">Enter job details</span>
              <span className="mt-1 block text-xs font-bold leading-5 text-[#f2b8a2]/78">Add only what you know.</span>
            </button>
          </div>
        ) : null}

        {mode === "saved" ? (
          <div className="rounded-[18px] border border-white/10 bg-white/6 p-4">
            <p className="text-sm font-extrabold text-white">Choose a saved job from PATHZY Opportunities.</p>
            <p className="mt-2 text-sm leading-6 text-white/58">When you select a saved opportunity, PATHZY returns here with the job context already populated.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={coverLetterJobHref} className="rounded-full bg-[#b4232a] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(127,29,29,.24)]">
                Open saved jobs
              </Link>
              <button type="button" onClick={() => setCoverLetterJobContextMode("choose")} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/78">
                Back
              </button>
            </div>
          </div>
        ) : null}

        {mode === "paste" ? (
          <div className="rounded-[18px] border border-white/10 bg-white/6 p-4">
            <label className="label">
              Paste the job advert / description
              <textarea className="field min-h-[220px]" placeholder="Paste the job description here..." value={pastedJobDescription} onChange={(event) => setPastedJobDescription(event.target.value)} />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={applyPastedJobDescription} disabled={!pastedJobDescription.trim()} className="rounded-full bg-[#b4232a] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(127,29,29,.24)] disabled:cursor-not-allowed disabled:opacity-50">
                Review extracted details
              </button>
              <button type="button" onClick={() => setCoverLetterJobContextMode("choose")} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/78">
                Back
              </button>
            </div>
          </div>
        ) : null}

        {mode === "manual" ? (
          <form onSubmit={generate} className="grid gap-4 rounded-[18px] border border-white/10 bg-white/6 p-4">
            {jobExtractionReviewed ? (
              <p className="rounded-[14px] border border-[#f8c45d]/22 bg-[#f8c45d]/10 px-4 py-3 text-sm font-bold leading-6 text-[#ffe2a8]">Review the extracted details before generation. If PATHZY could not identify something confidently, leave it blank or correct it here.</p>
            ) : null}
            <div className="grid gap-3 md:grid-cols-2">
              <label className="label">
                Job title / position <span className="text-[#f2b8a2]">*</span>
                <input className="field" required placeholder="Example: Marketing Coordinator" value={role} onChange={(event) => updateValue("role", event.target.value)} />
              </label>
              <label className="label">
                Company name <span className="text-[#f2b8a2]">*</span>
                <input className="field" required placeholder="Example: Avolito Beverages" value={company} onChange={(event) => updateValue("company", event.target.value)} />
              </label>
            </div>
            <label className="label">
              Job description
              <textarea className="field min-h-[120px]" placeholder="Paste or summarize the job description." value={coverLetterFieldValue("jobDescription")} onChange={(event) => updateValue("jobDescription", event.target.value)} />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="label">
                Key requirements / responsibilities
                <textarea className="field min-h-[110px]" placeholder="Add the most important requirements, one per line." value={coverLetterFieldValue("keyRequirements")} onChange={(event) => updateValue("keyRequirements", event.target.value)} />
              </label>
              <label className="label">
                Responsibilities
                <textarea className="field min-h-[110px]" placeholder="Add the main responsibilities, one per line." value={coverLetterFieldValue("keyResponsibilities")} onChange={(event) => updateValue("keyResponsibilities", event.target.value)} />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="label">
                Company location
                <input className="field" placeholder="Optional" value={coverLetterFieldValue("companyLocation")} onChange={(event) => updateValue("companyLocation", event.target.value)} />
              </label>
              <label className="label">
                Hiring manager / recruiter name
                <input className="field" placeholder="Optional" value={coverLetterFieldValue("recruiterName")} onChange={(event) => updateValue("recruiterName", event.target.value)} />
              </label>
              <label className="label">
                Job reference number
                <input className="field" placeholder="Optional" value={coverLetterFieldValue("referenceNumber")} onChange={(event) => updateValue("referenceNumber", event.target.value)} />
              </label>
              <label className="label">
                Application closing date
                <input className="field" type="date" value={coverLetterFieldValue("closingDate")} onChange={(event) => updateValue("closingDate", event.target.value)} />
              </label>
              <label className="label md:col-span-2">
                Job URL
                <input className="field" placeholder="Optional" value={coverLetterFieldValue("jobUrl")} onChange={(event) => updateValue("jobUrl", event.target.value)} />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="label">
                Language
                <select className="field" value={values.language ?? "english"} onChange={(event) => updateValue("language", event.target.value as ProfessionalLanguage)}>
                  <option value="english">English</option>
                  <option value="french">French</option>
                </select>
              </label>
              <label className="label">
                Tone
                <select className="field" value={coverLetterFieldValue("tone") || "professional"} onChange={(event) => updateValue("tone", event.target.value)}>
                  <option value="professional">professional</option>
                  <option value="confident">confident</option>
                  <option value="warm">warm</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button disabled={loading || !coverLetterFieldValue("role").trim() || !coverLetterFieldValue("company").trim()} className="rounded-full bg-[#b4232a] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(127,29,29,.24)] disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? "Generating" : "Generate Cover Letter"}
              </button>
              <button type="button" onClick={() => setCoverLetterJobContextMode(hasContext ? "closed" : "choose")} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/78">
                {hasContext ? "Close" : "Back"}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    );
  }

  function renderCoverLetterJobAndEditorDisclosure() {
    return (
      <details className="rounded-[18px] border border-[#7f1d1d]/24 bg-[#7f1d1d]/10 px-4 py-3">
        <summary className="cursor-pointer text-xs font-extrabold uppercase tracking-[0.12em] text-[#f2b8a2]">Change job or letter wording</summary>
        <div className="mt-4 grid gap-4">
          {renderCoverLetterCompactStatus()}
          {renderCoverLetterJobContextEntry()}
          {guidance ? (
            <div className="rounded-[18px] border border-[#f2d3c2]/18 bg-white/6 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#f2d3c2]/72">Recommended</p>
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
          <p className="rounded-[16px] border border-[#39d98a]/20 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold leading-6 text-[#b9f8d5]">{trustNote}</p>
          {coverLetterData ? renderCoverLetterEditor() : null}
        </div>
      </details>
    );
  }

  function renderCoverLetterPreviewViewer() {
    if (!document?.content || !previewCoverLetterData) {
      return (
        <div className="mt-5 grid min-h-[420px] place-items-center rounded-[22px] border border-dashed border-white/14 bg-white/5 p-4">
          {coverLetterSyncStatus?.status === "missing_job_context" ? renderCoverLetterJobContextEntry() : (
            <div className="text-center">
              <h3 className="text-xl font-black">Your cover letter needs a little more information.</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/58">Complete the highlighted Professional Identity sections, then return here to create the letter.</p>
            </div>
          )}
        </div>
      );
    }

    const pageGap = 28;
    const scaledWidth = cvA4Page.width * cvPreviewScale;
    const scaledHeight = coverLetterPreviewPageCount * cvA4Page.height * cvPreviewScale + Math.max(0, coverLetterPreviewPageCount - 1) * pageGap * cvPreviewScale;

    return (
      <div className="grid min-h-0 gap-3">
        {renderCoverLetterPreviewToolbar()}
        <div
          ref={cvPreviewViewportRef}
          className="overflow-auto rounded-[26px] border border-[#3f2a22]/50 bg-[#d8d0c4] p-3 text-black shadow-inner sm:p-6 lg:p-8"
          aria-label="Live Cover Letter A4 preview"
          data-cover-letter-document-stage="true"
        >
          <div ref={previewScrollRef} className="relative mx-auto" style={{ width: scaledWidth, height: `${scaledHeight + 32}px` }}>
            <div
              className="absolute left-1/2 top-0 origin-top"
              style={{ width: cvA4Page.width, transform: `translateX(-50%) scale(${cvPreviewScale})`, transformOrigin: "top center" }}
            >
              <div dangerouslySetInnerHTML={{ __html: coverLetterPreviewHtml }} />
            </div>
          </div>
        </div>
      </div>
    );
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

  if (tool === "linkedin") {
    return (
      <div className="relative z-0 grid scroll-mt-24 gap-4 pt-4" data-linkedin-page-height="content-driven" data-linkedin-nav-offset="app-shell">
        {renderLinkedInDocumentBar()}
        {renderLinkedInIdentityCorrectionCard()}
        {error ? <p className="rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc5c5]">{error}</p> : null}
        {xpAwarded ? <p className="rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold text-[#b9f8d5]">{celebrationCopy[tool]} +{xpAwarded} XP added to your PATHZY level.</p> : null}
        {saved || saveState !== "idle" ? <p className="rounded-[16px] border border-[#7f1d1d]/25 bg-[#7f1d1d]/10 px-4 py-3 text-sm font-bold text-[#f2b8a2]">{saveState === "saving" ? "Saving..." : saveState === "error" ? "Could not save. Retry." : copied ? "Copied - ready to paste into LinkedIn." : "Saved to My Documents."}</p> : null}
        {renderLinkedInStudio()}
        {renderDocumentNextActions()}
      </div>
    );
  }

  const workspaceClass = tool === "cv" || tool === "cover-letter" ? "grid gap-5" : "grid gap-5 lg:grid-cols-[.82fr_1fr]";

  return (
    <div className={workspaceClass}>
      {tool !== "cv" && tool !== "cover-letter" ? (
        <Card>
          <>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="mt-3 leading-7 text-white/62">{description}</p>
            <p className="mt-4 rounded-[16px] border border-[#39d98a]/20 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold leading-6 text-[#b9f8d5]">{trustNote}</p>
            {guidance ? (
              <div className="mt-4 rounded-[18px] border border-[#7f1d1d]/25 bg-[#7f1d1d]/10 p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#f2b8a2]/72">Recommended</p>
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
              <button disabled={loading} className="rounded-full bg-[#b4232a] px-6 py-3 shadow-[0_12px_30px_rgba(127,29,29,.24)] transition hover:bg-[#961f25] text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Generating" : document ? "Replace current draft" : "Generate Draft"}
              </button>
            </form>
          </>
        </Card>
      ) : null}

      {tool !== "cv" && tool !== "cover-letter" ? (
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-white/42">Preview</p>
            <h2 className="mt-2 text-2xl font-black">{outputTitle}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setViewMode("preview")} disabled={!document?.content} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-50">Preview</button>
            <button onClick={() => setViewMode("edit")} disabled={!document?.content} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-50">Edit</button>
            <button onClick={copyDocument} disabled={!document?.content} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-50">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {error ? <p className="mt-5 rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc5c5]">{error}</p> : null}
        {xpAwarded ? <p className="mt-5 rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold text-[#b9f8d5]">{celebrationCopy[tool]} +{xpAwarded} XP added to your PATHZY level.</p> : null}
        {saved || saveState !== "idle" ? <p className="mt-5 rounded-[16px] border border-[#7f1d1d]/25 bg-[#7f1d1d]/10 px-4 py-3 text-sm font-bold text-[#f2b8a2]">{saveState === "saving" ? "Saving..." : saveState === "error" ? "Could not save. Retry." : "Saved to My Documents."}</p> : null}
        {downloadNotice ? <p className="mt-5 rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold text-[#b9f8d5]">{downloadNotice}</p> : null}

        {viewMode === "preview" && document?.content ? (
          <div className="mt-5 overflow-hidden rounded-[22px] bg-white p-2 text-black">
            <div dangerouslySetInnerHTML={{ __html: renderCvHtml(document.content, templateName) }} />
          </div>
        ) : (
          <textarea
            className="mt-5 min-h-[420px] w-full resize-y rounded-[22px] border border-white/10 bg-[#111318]/88 p-5 text-sm leading-7 text-white/76 outline-none transition focus:border-[#f2b8a2]/50"
            value={document?.content ?? "Generate a draft, review every line, then edit it with your real experience, education, projects, and achievements."}
            onChange={(event) => {
              if (!document) return;
              updateDocumentContent(event.target.value);
            }}
            readOnly={!document}
          />
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={() => saveDocument(false)} disabled={!document?.id} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-50">
            {saveState === "saving" ? "Saving..." : "Save Draft"}
          </button>
          <button onClick={downloadPdf} disabled={!document?.content || downloadBusy} className="rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-extrabold text-white/82 disabled:cursor-not-allowed disabled:opacity-50">
            {downloadBusy ? "Preparing..." : "Download PDF"}
          </button>
        </div>
      </Card>
      ) : null}

      {tool === "cv" ? renderCvDocumentBar() : null}

      {tool === "cv" ? renderCvIdentityCorrectionCard() : null}

      {tool === "cv" ? renderCvTemplateGallery() : null}

      {tool === "cv" ? (
        <Card className="overflow-hidden border-[#7f1d1d]/18 bg-[#101318]/96">
          <div className="mb-4 grid gap-3" data-cv-document-studio="true">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/42">Document studio</p>
                <h2 className="mt-1 text-2xl font-black text-white">{cvPreviewMode === "ats" ? "ATS Preview" : "Designed Preview"}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">{cvPreviewMode === "ats" ? "ATS Preview shows the same Professional Identity CV model in a parser-friendly structure recruiters and screening systems can read." : "Designed Preview shows the print-ready A4 document built from your current Professional Identity."}</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <form onSubmit={generate}>
                  <button disabled={loading} className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-extrabold text-white/72 disabled:cursor-not-allowed disabled:opacity-60">
                    {loading ? "Syncing" : "Refresh from Identity"}
                  </button>
                </form>
                <details className="relative">
                  <summary className="list-none rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-extrabold text-white/72 cursor-pointer">More</summary>
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-[18px] border border-white/10 bg-[#18110f] p-2 shadow-[0_18px_58px_rgba(0,0,0,.42)]">
                    <button type="button" onClick={() => setCvEntryMode(cvEntryMode === "upload" ? "profile" : "upload")} className="w-full rounded-[12px] px-3 py-2 text-left text-xs font-extrabold text-white/76 hover:bg-white/8">
                      {cvEntryMode === "upload" ? "Use Profile" : "Upload CV"}
                    </button>
                  </div>
                </details>
              </div>
            </div>
            {document?.content ? (
              <details className="rounded-[16px] border border-[#7f1d1d]/24 bg-[#7f1d1d]/10 px-4 py-3">
                <summary className="cursor-pointer text-xs font-extrabold uppercase tracking-[0.12em] text-[#f2b8a2]">Improve your CV recommendations</summary>
                <ul className="mt-3 grid gap-1 text-sm font-bold leading-6 text-white/68">
                  {health.recommendations.map((recommendation) => <li key={recommendation}>Improve your CV: {recommendation}</li>)}
                  {parsedCv?.missing.length ? <li>Add {parsedCv.missing.join(", ").toLowerCase()} so recruiters can contact you and understand your target role quickly.</li> : null}
                </ul>
              </details>
            ) : null}
          </div>
          <div className="grid gap-3">
            {error ? (
              <div className="rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc5c5]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{error}</span>
                  {saveState === "error" ? <button type="button" onClick={() => saveDocument(false)} className="w-fit rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-extrabold text-white">Retry</button> : null}
                </div>
              </div>
            ) : null}
            {xpAwarded ? <p className="rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold text-[#b9f8d5]">{celebrationCopy[tool]} +{xpAwarded} XP added to your PATHZY level.</p> : null}
            {downloadNotice ? <p className="rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold text-[#b9f8d5]">{downloadNotice}</p> : null}
            {sectionNotice ? <p className="rounded-[16px] border border-[#7f1d1d]/30 bg-[#7f1d1d]/14 px-4 py-3 text-sm font-bold text-[#f2b8a2]">{sectionNotice}</p> : null}
          </div>
          {cvEntryMode === "upload" ? (
            <div id="old-cv-upload" className="mt-5 rounded-[18px] border border-white/10 bg-white/6 p-4">
              <p className="text-sm font-extrabold text-white">Upload old CV</p>
              <p className="mt-1 text-sm leading-6 text-white/58">Upload a text-based PDF, DOCX, or TXT CV. PATHZY will read the content, organize it into your CV draft, then ask you to review before editing.</p>
              <input className="mt-3 block w-full text-sm text-white/62 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-extrabold file:text-white" type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={(event) => handleOldCvUpload(event.target.files?.[0] ?? null)} />
              {oldCvNotice ? (
                <p className={`mt-3 rounded-[16px] border px-4 py-3 text-sm font-bold ${cvImportStatus === "error" ? "border-[#ff6b7a]/25 bg-[#ff6b7a]/10 text-[#ffd5da]" : "border-[#7f1d1d]/24 bg-[#7f1d1d]/10 text-[#f2b8a2]"}`}>
                  {oldCvNotice}
                </p>
              ) : null}
              {cvImportStatus !== "idle" && cvImportStatus !== "ready" && cvImportStatus !== "error" ? (
                <div className="mt-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#7f1d1d] to-[#f2b8a2]" style={{ width: cvImportStatus === "reading" ? "18%" : cvImportStatus === "inspecting" ? "34%" : cvImportStatus === "visual-reading" ? "48%" : cvImportStatus === "semantic-understanding" ? "62%" : cvImportStatus === "extracting" ? "72%" : cvImportStatus === "organizing" ? "82%" : "90%" }} />
                </div>
              ) : null}
              <DocumentInspectionStatus status={cvImportStatus === "inspecting" ? "inspecting" : cvImportSummary?.inspection ? "completed" : cvImportStatus === "error" ? "failed" : "idle"} />
              <DocumentInspectionSummary inspection={cvImportSummary?.inspection} />
              <DocumentVisualReadingStatus status={cvImportStatus === "visual-reading" ? "reading" : cvImportSummary?.visualReading ? "completed" : cvImportStatus === "error" ? "failed" : "idle"} />
              <DocumentVisualReadingSummary visualReading={cvImportSummary?.visualReading} />
              <DocumentSemanticUnderstandingStatus status={cvImportStatus === "semantic-understanding" ? "understanding" : cvImportSummary?.semanticReading ? "completed" : cvImportStatus === "error" ? "failed" : "idle"} />
              <DocumentSemanticUnderstandingSummary semanticReading={cvImportSummary?.semanticReading} />
              <DocumentReasoningSummary reasoning={cvImportSummary?.reasoning} />
              {cvImportStatus === "ready" && pendingImportedCv ? (
                <div id="imported-cv-review" className="mt-4 rounded-[18px] border border-[#39d98a]/25 bg-[#39d98a]/10 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-white">{cvImportSummary?.message ?? "Your imported CV is ready for review."}</p>
                      {cvImportSummary?.counts ? (
                        <p className="mt-1 text-sm leading-6 text-[#b9f8d5]">
                          We found {cvImportSummary.counts.workExperiences} work experiences, {cvImportSummary.counts.educationRecords} education records, {cvImportSummary.counts.skills} skills, {cvImportSummary.counts.certifications} qualifications, {cvImportSummary.counts.languages} languages, and {cvImportSummary.counts.references} references.
                        </p>
                      ) : (
                        <p className="mt-1 text-sm leading-6 text-[#b9f8d5]">PATHZY prepared your imported CV. Review it before saving it as your draft.</p>
                      )}
                      {cvImportSummary?.counts.unclassifiedItems ? (
                        <p className="mt-2 text-xs font-bold text-[#ffe2a8]">{cvImportSummary.counts.unclassifiedItems} item{cvImportSummary.counts.unclassifiedItems === 1 ? "" : "s"} stayed unclassified for review instead of being guessed.</p>
                      ) : null}
                      {cvImportSummary?.excludedSensitiveNotice ? (
                        <p className="mt-2 text-xs font-bold text-[#f2b8a2]">{cvImportSummary.excludedSensitiveNotice}</p>
                      ) : null}
                      {cvImportSummary?.reviewItems.length ? (
                        <p className="mt-2 text-xs font-bold text-[#ffe2a8]">{cvImportSummary.reviewItems.length} item{cvImportSummary.reviewItems.length === 1 ? "" : "s"} may need your review.</p>
                      ) : (
                        <p className="mt-2 text-xs font-bold text-[#b9f8d5]">Imported details are ready for review.</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={confirmImportedCv}
                      className="h-[44px] shrink-0 rounded-full bg-[#b4232a] px-5 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(127,29,29,.26)] transition hover:bg-[#961f25] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2b8a2]"
                    >
                      Review Imported CV
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          {renderCvPreviewViewer()}
        </Card>
      ) : null}

      {tool === "cover-letter" ? (
        renderCoverLetterDocumentBar()
      ) : null}

      {tool === "cover-letter" ? renderCoverLetterIdentityCorrectionCard() : null}

      {tool === "cover-letter" ? renderCoverLetterTemplateGallery() : null}

      {tool === "cover-letter" ? (
        <Card className="overflow-hidden border-[#7f1d1d]/18 bg-[#101318]/96">
          <div className="mb-4 grid gap-3" data-cover-letter-document-studio="true">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/42">Document studio</p>
                <h2 className="mt-1 text-2xl font-black text-white">Designed Preview</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">Designed Preview shows the print-ready A4 cover letter that the PDF export uses.</p>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <form onSubmit={generate}>
                  <button disabled={loading} className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-extrabold text-white/72 disabled:cursor-not-allowed disabled:opacity-60">
                    {loading ? "Syncing" : "Refresh from Identity"}
                  </button>
                </form>
              </div>
            </div>
            {renderCoverLetterJobAndEditorDisclosure()}
          </div>
          <div className="grid gap-3">
            {error ? (
              <div className="rounded-[16px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffc5c5]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{error}</span>
                  {saveState === "error" ? <button type="button" onClick={() => saveDocument(false)} className="w-fit rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-extrabold text-white">Retry</button> : null}
                </div>
              </div>
            ) : null}
            {xpAwarded ? <p className="rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold text-[#b9f8d5]">{celebrationCopy[tool]} +{xpAwarded} XP added to your PATHZY level.</p> : null}
            {downloadNotice ? <p className="rounded-[16px] border border-[#39d98a]/25 bg-[#39d98a]/10 px-4 py-3 text-sm font-bold text-[#b9f8d5]">{downloadNotice}</p> : null}
            {saved || saveState !== "idle" ? <p className="rounded-[16px] border border-[#7f1d1d]/25 bg-[#7f1d1d]/10 px-4 py-3 text-sm font-bold text-[#f2b8a2]">{saveState === "saving" ? "Saving..." : saveState === "error" ? "Could not save. Retry." : "Saved to My Documents."}</p> : null}
            {sectionNotice ? <p className="rounded-[16px] border border-[#7f1d1d]/30 bg-[#7f1d1d]/14 px-4 py-3 text-sm font-bold text-[#f2b8a2]">{sectionNotice}</p> : null}
          </div>
          {renderCoverLetterPreviewViewer()}
        </Card>
      ) : null}

      {renderDocumentNextActions()}
    </div>
  );

  function renderLinkedInDocumentBar() {
    const model = linkedInModelFromDocument(document);
    const statusLabel = linkedInSyncStatus?.status === "draft_manually_edited"
      ? "Review recommended"
      : linkedInSyncStatus?.status === "missing_information"
        ? "Review recommended"
        : "Synced with Professional Identity";
    const targetRole = model?.keywordStrategy.targetRole || model?.professionalTitle || "Career direction in progress";
    return (
      <section className="rounded-[24px] border border-[#7f1d1d]/22 bg-[#111318] p-4 shadow-[0_22px_70px_rgba(0,0,0,.28)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#f2b8a2]/72">MY LINKEDIN</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">LinkedIn Professional Profile</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#39d98a]/22 bg-[#17251c] px-3 py-1 text-xs font-extrabold text-[#b9f8d5]">{statusLabel}</span>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-bold text-white/70">Profile Strength: {model?.completeness.label ?? "Ready to prepare"}</span>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-bold text-white/70">Target Role: {targetRole}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Link href={routeBuilders.professionalIdentityReview(appRoutes.professionalIdentityLinkedin)} className="rounded-full border border-white/12 bg-transparent px-5 py-3 text-sm font-extrabold text-white/72 transition hover:bg-white/8">
              Edit Information
            </Link>
            <form onSubmit={generate}>
              <button disabled={loading} className="rounded-full bg-[#b4232a] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(127,29,29,.24)] transition hover:bg-[#961f25] disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? "Optimizing" : "Optimize Profile"}
              </button>
            </form>
            {model?.linkedInUrl ? (
              <a href={model.linkedInUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/12 bg-transparent px-5 py-3 text-sm font-extrabold text-white/72 transition hover:bg-white/8">
                Open LinkedIn
              </a>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  function renderLinkedInIdentityCorrectionCard() {
    return (
      <section className="rounded-[18px] border border-[#f2d3c2]/14 bg-[#171311] px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#f2b8a2]/72">NEED TO CHANGE YOUR INFORMATION?</p>
            <p className="mt-1 text-sm font-bold leading-6 text-white/68">Your LinkedIn content uses your Professional Identity. Update it once and PATHZY keeps this profile synchronized.</p>
          </div>
          <Link
            href={routeBuilders.professionalIdentityReview(appRoutes.professionalIdentityLinkedin)}
            className="inline-flex w-fit rounded-full border border-[#f2b8a2]/24 bg-[#7f1d1d]/20 px-4 py-2 text-sm font-extrabold text-[#f2b8a2] transition hover:border-[#f2b8a2]/42 hover:bg-[#7f1d1d]/30"
          >
            Edit Information
          </Link>
        </div>
      </section>
    );
  }

  function linkedinField(name: string) {
    const value = document?.fields?.[name];
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    return typeof value === "string" ? value.trim() : "";
  }

  function linkedinSection(label: string) {
    const lines = (document?.content ?? "").split(/\r?\n/);
    const index = lines.findIndex((line) => line.trim().toUpperCase() === label);
    if (index < 0) return "";
    const nextIndex = lines.findIndex((line, lineIndex) => lineIndex > index && /^[A-Z][A-Z\s/]+$/.test(line.trim()) && line.trim().length > 2);
    return lines.slice(index + 1, nextIndex > -1 ? nextIndex : undefined).join("\n").trim();
  }

  function linkedInPreviewList(items: string[]) {
    return items.map((item) => item.replace(/^[-*]\s*/, "").trim()).filter(Boolean);
  }

  function renderLinkedInStudio() {
    return (
      <section className="mx-auto w-full max-w-[1320px]" data-linkedin-studio-layout="responsive-card-grid">
        {renderLinkedInPreview()}
      </section>
    );
  }

  function renderLinkedInPreview() {
    const model = linkedInModelFromDocument(document);
    const headline = model?.headline || (linkedinField("headline") as string) || (document?.content ?? "").split(/\r?\n/).find((line) => line.trim())?.trim() || "Career direction in progress";
    const headlineParts = headline.split("|").map((part) => part.trim()).filter(Boolean);
    const mainHeadline = headlineParts[0] ?? headline;
    const secondaryHeadline = headlineParts.slice(1).join(" - ");
    const about = model?.about || (linkedinField("about") as string) || linkedinSection("ABOUT");
    const experienceFallback = (linkedinField("experienceSummary") as string) || linkedinSection("EXPERIENCE SUMMARY");
    const formatExperienceForCopy = (item: LinkedInExperienceItem) => [item.role, item.company, item.dates, item.location, item.description].filter(Boolean).join(" | ");
    const experienceItems = model?.experience.length ? model.experience : linkedInPreviewList(experienceFallback.split(/\r?\n/)).map((item, index) => ({ id: `fallback-experience-${index}`, role: item, company: "", dates: "", location: "", description: "", sourceText: item }));
    const experienceSummary = experienceItems.map(formatExperienceForCopy).join("\n");
    const fieldSkills = linkedinField("skills");
    const skills = model?.skills.length ? model.skills.slice(0, 10) : Array.isArray(fieldSkills) ? fieldSkills.slice(0, 10) : linkedInPreviewList(linkedinSection("SKILLS").split(/\r?\n/)).slice(0, 10);
    const education = model?.education ?? linkedInPreviewList(linkedinSection("EDUCATION").split(/\r?\n/)).map((item, index) => ({ id: `fallback-education-${index}`, qualification: item, field: "", institution: "", dates: "", sourceText: item }));
    const projects = model?.projects ?? linkedInPreviewList(linkedinSection("PROJECTS").split(/\r?\n/));
    const certifications = model ? [...model.certifications, ...model.licences] : linkedInPreviewList(linkedinSection("CERTIFICATIONS / LICENCES").split(/\r?\n/));
    const languages = model?.languages ?? linkedInPreviewList(linkedinSection("LANGUAGES").split(/\r?\n/));
    const featuredIdeas = model?.featuredItems ?? linkedInPreviewList(linkedinSection("FEATURED SECTION IDEAS").split(/\r?\n/)).filter((item) => !["relevant project", "projet pertinent", "certification", "pathzy cv", "cv pathzy"].includes(item.trim().toLowerCase()));
    const portfolioItems = Array.from(new Set([...(model?.professionalLinks ?? [])].filter(Boolean)));
    const headlineVariants = model?.headlineVariants ? Object.entries(model.headlineVariants) as Array<[keyof LinkedInProfileModel["headlineVariants"], string]> : [];
    const activeVariant = headlineVariants.find(([variant]) => variant === linkedInHeadlineVariant) ?? headlineVariants[0];
    const recommendations = model?.profileOptimization.recommendations ?? [];
    const incompleteDimensions = model?.completeness.dimensions.filter((item) => !item.complete) ?? [];
    const improvementItems = recommendations.length
      ? recommendations.map((item) => ({ label: item.label, why: item.why, href: item.href, priority: item.priority }))
      : incompleteDimensions.map((item) => ({ label: item.label, why: item.recommendation, href: routeBuilders.professionalIdentityReview(appRoutes.professionalIdentityLinkedin), priority: "REVIEW" }));
    const copySection = async (text: string) => {
      if (!text) return;
      await navigator.clipboard.writeText(text);
      setCopied(true);
    };
    const shortenAbout = () => updateLinkedInDraft((draft) => {
      draft.about = draft.about.split(/\n\n/).filter(Boolean).slice(0, 2).join("\n\n");
    });
    const makeAboutProfessional = () => updateLinkedInDraft((draft) => {
      if (!draft.about.includes("verified Professional Identity")) {
        draft.about = `${draft.about.trim()}\n\nThis profile is grounded in verified Professional Identity information.`;
      }
    });
    const sectionHeader = (label: string, sourceSection: Parameters<typeof routeBuilders.professionalIdentitySection>[0], copyText: string, extra?: ReactNode) => (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">{label}</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => copySection(copyText)} className="rounded-full border border-[#d8c7ba] bg-white px-3 py-1.5 text-xs font-black text-[#7f1d1d]">Copy</button>
          {extra}
          <Link href={routeBuilders.professionalIdentitySection(sourceSection, appRoutes.professionalIdentityLinkedin)} className="rounded-full border border-[#d8c7ba] bg-[#f8f3ed] px-3 py-1.5 text-xs font-black text-[#342820]">Edit Information</Link>
        </div>
      </div>
    );
    return (
      <div className="grid min-w-0 gap-5" data-linkedin-profile-workspace="exact-content-flow">
        <section className="overflow-hidden rounded-[20px] border border-[#d8c7ba] bg-[#f8f3ed] text-[#111827] shadow-[0_16px_50px_rgba(15,23,42,.12)]" data-linkedin-section="headline">
          <div className="h-14 bg-gradient-to-r from-[#111318] via-[#2a1714] to-[#7f1d1d]" />
          <div className="px-5 pb-5 pt-0 sm:px-7">
            <div className="-mt-7 mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#f8f3ed] bg-[#efe3d6] text-lg font-black text-[#7f1d1d] shadow-md">
              {model?.profilePhotoAvailable ? "Photo" : (model?.fullName || mainHeadline).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">HEADLINE</p>
              {model?.fullName ? <h3 className="mt-3 text-[clamp(1.45rem,3vw,2.1rem)] font-black leading-[1.12] text-[#111827] [overflow-wrap:anywhere]">{model.fullName}</h3> : null}
              <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-[#6b625b]">Recommended headline</p>
              <h3 className="mt-2 max-w-full text-[clamp(1.15rem,2.5vw,1.55rem)] font-black leading-[1.16] text-[#342820] [overflow-wrap:anywhere]">{activeVariant?.[1] ?? mainHeadline}</h3>
              {secondaryHeadline ? <p className="mt-2 max-w-full text-sm font-bold leading-6 text-[#5d5149] [overflow-wrap:anywhere]">{secondaryHeadline}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[#7f1d1d]">
                {model?.location ? <span>{model.location}</span> : null}
                {model?.openToWorkTargets.length ? <span>Target role: {model.openToWorkTargets.slice(0, 2).join(", ")}</span> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => copySection(activeVariant?.[1] ?? headline)} className="rounded-full border border-[#d8c7ba] bg-white px-3 py-1.5 text-xs font-black text-[#7f1d1d]">Copy</button>
                <button type="button" onClick={() => activeVariant ? updateLinkedInDraft((draft) => { draft.headline = activeVariant[1]; }) : undefined} className="rounded-full border border-[#d8c7ba] bg-white px-3 py-1.5 text-xs font-black text-[#342820]">Improve</button>
              </div>
              {headlineVariants.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {headlineVariants.filter(([, value]) => Boolean(value)).slice(0, 3).map(([variant]) => {
                    const label = variant === "recruiterFriendly" ? "Recruiter Focused" : variant === "careerTransition" ? "Career Transition" : "Professional";
                    return (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => setLinkedInHeadlineVariant(variant)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-black ${linkedInHeadlineVariant === variant ? "border-[#7f1d1d] bg-[#7f1d1d] text-white" : "border-[#d8c7ba] bg-white text-[#342820]"}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-[18px] border border-[#e4d8cc] bg-[#f8f3ed] p-5 text-[#111827] shadow-[0_14px_44px_rgba(15,23,42,.08)] sm:p-7" data-linkedin-section="about">
          {sectionHeader("ABOUT", "professional_summary", about, (
            <>
              <button type="button" onClick={shortenAbout} className="rounded-full border border-[#d8c7ba] bg-white px-3 py-1.5 text-xs font-black text-[#342820]">Shorter</button>
              <button type="button" onClick={makeAboutProfessional} className="rounded-full border border-[#d8c7ba] bg-white px-3 py-1.5 text-xs font-black text-[#342820]">More Professional</button>
            </>
          ))}
          <p className="mt-4 max-w-5xl whitespace-pre-line text-base font-medium leading-8 text-[#342820] [overflow-wrap:anywhere]">{about || "Add an honest About section that explains your direction, strengths, and the value you bring."}</p>
          {!model?.linkedInUrl ? (
            <div className="mt-4 rounded-[16px] border border-[#f8c45d]/30 bg-[#fff7df] px-4 py-3 text-sm font-bold leading-6 text-[#5d5149]">
              Don&apos;t have LinkedIn yet? PATHZY has prepared your profile content. You can use it when creating your LinkedIn profile.
            </div>
          ) : null}
        </section>

        {experienceItems.length ? (
          <section className="rounded-[18px] border border-[#e4d8cc] bg-[#f8f3ed] p-5 text-[#111827] shadow-[0_14px_44px_rgba(15,23,42,.08)] sm:p-7" data-linkedin-section="experience">
            {sectionHeader("EXPERIENCE", "experience", experienceSummary, <button type="button" onClick={() => copySection(experienceSummary)} className="rounded-full border border-[#d8c7ba] bg-white px-3 py-1.5 text-xs font-black text-[#342820]">Optimize wording</button>)}
            <div className="mt-4 grid gap-4">
              {experienceItems.map((item) => (
                <article key={item.id || item.sourceText} className="rounded-[16px] border border-[#e4d8cc] bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7f1d1d]">Role</p>
                  <p className="mt-1 text-base font-black leading-6 text-[#342820] [overflow-wrap:anywhere]">{item.role}</p>
                  {item.company ? <p className="mt-2 text-sm font-bold leading-6 text-[#5d5149] [overflow-wrap:anywhere]">{item.company}</p> : null}
                  {(item.dates || item.location) ? <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[#6b625b] [overflow-wrap:anywhere]">{[item.dates, item.location].filter(Boolean).join(" | ")}</p> : null}
                  {item.description ? <p className="mt-3 whitespace-pre-line text-sm font-medium leading-7 text-[#342820] [overflow-wrap:anywhere]">{item.description}</p> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {(education.length || skills.length) ? (
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]" data-linkedin-section="education-skills">
            {education.length ? (
              <section className="rounded-[18px] border border-[#e4d8cc] bg-[#f8f3ed] p-5 text-[#111827] shadow-[0_14px_44px_rgba(15,23,42,.08)] sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <h4 className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">EDUCATION</h4>
                  <Link href={routeBuilders.professionalIdentitySection("education", appRoutes.professionalIdentityLinkedin)} className="rounded-full border border-[#d8c7ba] bg-[#f8f3ed] px-3 py-1.5 text-xs font-black text-[#342820]">Edit Information</Link>
                </div>
                <ul className="mt-4 grid gap-3 text-sm font-medium leading-6 text-[#342820]">
                  {education.map((item) => (
                    <li key={item.id || item.sourceText} className="rounded-[14px] border border-[#e4d8cc] bg-white p-3 [overflow-wrap:anywhere]">
                      <p className="font-black text-[#342820]">{item.qualification}</p>
                      {item.field ? <p className="mt-1 text-sm font-semibold text-[#5d5149]">{item.field}</p> : null}
                      {item.institution ? <p className="mt-1 text-sm font-semibold text-[#5d5149]">{item.institution}</p> : null}
                      {item.dates ? <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-[#6b625b]">{item.dates}</p> : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {skills.length ? (
              <section className="rounded-[18px] border border-[#e4d8cc] bg-[#f8f3ed] p-5 text-[#111827] shadow-[0_14px_44px_rgba(15,23,42,.08)] sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">SKILLS</h4>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[#6b625b]">TOP SKILLS</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => copySection(skills.join(", "))} className="rounded-full border border-[#d8c7ba] bg-white px-3 py-1.5 text-xs font-black text-[#7f1d1d]">Copy skills</button>
                    <Link href={routeBuilders.professionalIdentitySection("skills", appRoutes.professionalIdentityLinkedin)} className="rounded-full border border-[#d8c7ba] bg-[#f8f3ed] px-3 py-1.5 text-xs font-black text-[#342820]">Edit Information</Link>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.slice(0, 8).map((skill) => <span key={skill} className="max-w-full rounded-full border border-[#d8c7ba] bg-white px-3 py-1.5 text-xs font-bold leading-5 text-[#342820] [overflow-wrap:anywhere]">{skill}</span>)}
                </div>
                {(model?.skills.length ?? skills.length) > 8 ? (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.12em] text-[#7f1d1d]">View all skills</summary>
                    <p className="mt-2 text-sm leading-6 text-[#5d5149]">{(model?.skills ?? skills).join(", ")}</p>
                  </details>
                ) : null}
              </section>
            ) : null}
          </section>
        ) : null}

        {(projects.length || featuredIdeas.length) ? (
          <section className="rounded-[18px] border border-[#e4d8cc] bg-[#f8f3ed] p-5 text-[#111827] shadow-[0_14px_44px_rgba(15,23,42,.08)] sm:p-7" data-linkedin-section="projects-achievements">
            {sectionHeader("PROJECTS / ACHIEVEMENTS", "projects", [...projects, ...featuredIdeas].join("\n"))}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[...projects, ...featuredIdeas].map((item) => (
                <article key={item} className="rounded-[16px] border border-[#e4d8cc] bg-white p-4">
                  <p className="text-sm font-bold leading-6 text-[#342820] [overflow-wrap:anywhere]">{item}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {(certifications.length || languages.length || portfolioItems.length || model?.linkedInUrl) ? (
          <section className="grid gap-5 lg:grid-cols-3" data-linkedin-section="certifications-languages-links">
            {certifications.length ? (
              <section className="rounded-[18px] border border-[#e4d8cc] bg-[#f8f3ed] p-5 shadow-[0_14px_44px_rgba(15,23,42,.08)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between lg:flex-col">
                  <h4 className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">CERTIFICATIONS</h4>
                  <Link href={routeBuilders.professionalIdentitySection("certificates", appRoutes.professionalIdentityLinkedin)} className="rounded-full border border-[#d8c7ba] bg-[#f8f3ed] px-3 py-1.5 text-xs font-black text-[#342820]">Edit Information</Link>
                </div>
                <ul className="mt-4 grid gap-2 text-sm font-medium leading-6 text-[#342820]">
                  {certifications.map((item) => <li key={item} className="[overflow-wrap:anywhere]">- {item}</li>)}
                </ul>
              </section>
            ) : null}
            {languages.length ? (
              <section className="rounded-[18px] border border-[#e4d8cc] bg-[#f8f3ed] p-5 shadow-[0_14px_44px_rgba(15,23,42,.08)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between lg:flex-col">
                  <h4 className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">LANGUAGES</h4>
                  <Link href={routeBuilders.professionalIdentitySection("languages", appRoutes.professionalIdentityLinkedin)} className="rounded-full border border-[#d8c7ba] bg-[#f8f3ed] px-3 py-1.5 text-xs font-black text-[#342820]">Edit Information</Link>
                </div>
                <ul className="mt-4 grid gap-2 text-sm font-medium leading-6 text-[#342820]">
                  {languages.map((item) => <li key={item} className="[overflow-wrap:anywhere]">- {item}</li>)}
                </ul>
              </section>
            ) : null}
            {(portfolioItems.length || model?.linkedInUrl) ? (
              <section className="rounded-[18px] border border-[#e4d8cc] bg-[#f8f3ed] p-5 shadow-[0_14px_44px_rgba(15,23,42,.08)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between lg:flex-col">
                  <h4 className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">PROFESSIONAL LINKS</h4>
                  <Link href={routeBuilders.professionalIdentitySection("social_profiles", appRoutes.professionalIdentityLinkedin)} className="rounded-full border border-[#d8c7ba] bg-[#f8f3ed] px-3 py-1.5 text-xs font-black text-[#342820]">Edit Information</Link>
                </div>
                <div className="mt-4 grid gap-2 text-sm font-medium leading-6 text-[#342820]">
                  {model?.linkedInUrl ? <a href={model.linkedInUrl} target="_blank" rel="noreferrer" className="underline decoration-[#7f1d1d]/40 underline-offset-4 [overflow-wrap:anywhere]">LinkedIn</a> : null}
                  {portfolioItems.map((item) => <span key={item} className="[overflow-wrap:anywhere]">{item}</span>)}
                  {model?.linkedInUrl ? <a href={model.linkedInUrl} target="_blank" rel="noreferrer" className="mt-2 w-fit rounded-full border border-[#d8c7ba] bg-white px-3 py-1.5 text-xs font-black text-[#7f1d1d]">Open LinkedIn</a> : null}
                </div>
              </section>
            ) : null}
          </section>
        ) : null}

        {model ? (
          <section className="rounded-[20px] border border-[#7f1d1d]/22 bg-[#111318] p-5 text-white shadow-[0_16px_50px_rgba(0,0,0,.2)]" data-linkedin-section="improve-linkedin">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f2b8a2]/72">IMPROVE YOUR LINKEDIN</p>
            <ol className="mt-4 grid gap-2 text-sm font-bold leading-6 text-white/78">
              {(improvementItems.length ? improvementItems : [{ label: "Review your LinkedIn profile", why: "Your profile is ready to copy, but a quick review helps keep it accurate.", href: routeBuilders.professionalIdentityReview(appRoutes.professionalIdentityLinkedin), priority: "REVIEW" }]).slice(0, 3).map((item, index) => (
                <li key={`${item.priority}-${item.label}`} className="rounded-[14px] border border-white/10 bg-white/6 px-3 py-2">
                  {index + 1}. {item.label}
                </li>
              ))}
            </ol>
            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-extrabold uppercase tracking-[0.12em] text-[#f2b8a2]">See full analysis</summary>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-[14px] border border-white/10 bg-white/6 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#b9f8d5]">Supported keywords</p>
                  <p className="mt-2 text-sm leading-6 text-white/68">{model.keywordStrategy.supported.length ? model.keywordStrategy.supported.join(", ") : "Add supported keywords through Professional Identity."}</p>
                </div>
                <div className="rounded-[14px] border border-white/10 bg-white/6 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#ffe2a8]">Recommendations</p>
                  <p className="mt-2 text-sm leading-6 text-white/68">{improvementItems.map((item) => item.why).filter(Boolean).slice(0, 4).join(" ") || "No urgent changes found."}</p>
                </div>
              </div>
            </details>
          </section>
        ) : null}

        <section className="rounded-[20px] border border-[#e4d8cc] bg-[#f8f3ed] p-5 text-[#111827] shadow-[0_14px_44px_rgba(15,23,42,.08)]" data-linkedin-section="ready-to-use">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7f1d1d]">READY TO USE YOUR PROFILE?</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={copyDocument} disabled={!document?.content} className="rounded-full bg-[#b4232a] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(127,29,29,.24)] transition hover:bg-[#961f25] disabled:cursor-not-allowed disabled:opacity-50">
              {copied ? "Copied - ready to paste into LinkedIn." : "Copy Full Profile"}
            </button>
            {model?.linkedInUrl ? (
              <a href={model.linkedInUrl} target="_blank" rel="noreferrer" className="rounded-full border border-[#d8c7ba] bg-white px-5 py-3 text-sm font-extrabold text-[#342820]">
                Open LinkedIn
              </a>
            ) : (
              <Link href={routeBuilders.professionalIdentitySection("social_profiles", appRoutes.professionalIdentityLinkedin)} className="rounded-full border border-[#d8c7ba] bg-white px-5 py-3 text-sm font-extrabold text-[#342820]">
                Add LinkedIn URL
              </Link>
            )}
          </div>
        </section>

        <section className="rounded-[20px] border border-[#f2d3c2]/16 bg-[#121411] p-5 text-[#fffaf2]" data-linkedin-section="next-step">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f2d3c2]/78">NEXT STEP</p>
          <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 className="text-2xl font-black text-[#fffaf2]">Understand where you fit in the job market.</h3>
            </div>
            <Link href={PATHZY_ROUTES.CAREER_PLAN} className="rounded-full bg-[#b4232a] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(127,29,29,.26)] transition hover:bg-[#961f25]">
              View Employment Intelligence
            </Link>
          </div>
        </section>
      </div>
    );
  }

  function renderDocumentNextActions() {
    if (!document?.content || !["cv", "cover-letter"].includes(tool)) return null;

    const buttonClass = "rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-extrabold text-white";
    const mentorHref = tool === "cv" ? `${appRoutes.mentor}?context=CV%20page%20-%20help%20with%20CV` : `${appRoutes.mentor}?context=Cover%20letter%20page%20-%20help%20with%20cover%20letter`;

    if (tool === "cv") {
      return (
        <Card>
          <div className="rounded-[22px] border border-[#f2d3c2]/16 bg-[#121411] p-5 text-[#fffaf2]">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f2d3c2]/78">Your CV is ready</p>
            <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h3 className="text-2xl font-black text-[#fffaf2]">Create your cover letter</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#e7ded0]/82">PATHZY can use your Professional Identity and the job you are applying for to prepare a tailored professional cover letter.</p>
              </div>
              <Link href={PATHZY_ROUTES.COVER_LETTER} className="rounded-full bg-[#b4232a] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(127,29,29,.26)] transition hover:bg-[#961f25]">
                Create Cover Letter
              </Link>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-xs font-extrabold uppercase tracking-[0.12em] text-[#e7ded0]/68">More actions</summary>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={PATHZY_ROUTES.FIND_OPPORTUNITIES} className={buttonClass}>Find Opportunities</Link>
                <Link href={PATHZY_ROUTES.INTERVIEW_PREPARATION} className={buttonClass}>Prepare for Interview</Link>
                <Link href={PATHZY_ROUTES.LINKEDIN_OPTIMIZER} className={buttonClass}>Optimize LinkedIn</Link>
                <Link href={mentorHref} className={buttonClass}>Ask Your Mentor</Link>
              </div>
            </details>
          </div>
        </Card>
      );
    }

    return (
      <Card className="lg:col-span-4">
        <div className="rounded-[22px] border border-[#f2d3c2]/16 bg-[#121411] p-5 text-[#fffaf2]">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#f2d3c2]/78">Your cover letter is ready</p>
          <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 className="text-2xl font-black text-[#fffaf2]">Prepare for interview</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#e7ded0]/82">Use the same job context and Professional Identity evidence to prepare credible interview answers.</p>
            </div>
            <Link href={PATHZY_ROUTES.INTERVIEW_PREPARATION} className="rounded-full bg-[#b4232a] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(127,29,29,.26)] transition hover:bg-[#961f25]">
              Prepare for Interview
            </Link>
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-extrabold uppercase tracking-[0.12em] text-[#e7ded0]/68">More actions</summary>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={PATHZY_ROUTES.CV_BUILDER} className={buttonClass}>Return to My CV</Link>
              <Link href={PATHZY_ROUTES.LINKEDIN_OPTIMIZER} className={buttonClass}>Optimise LinkedIn</Link>
              <Link href={PATHZY_ROUTES.FIND_OPPORTUNITIES} className={buttonClass}>Find Opportunities</Link>
              <Link href={mentorHref} className={buttonClass}>Ask Your Mentor</Link>
              <button type="button" onClick={() => setSaved(false)} className={buttonClass}>Improve Cover Letter</button>
            </div>
          </details>
        </div>
      </Card>
    );
  }
}
