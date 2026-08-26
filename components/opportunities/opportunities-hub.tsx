"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, ProgressBar } from "@/components/ui";
import type { SmartApplicationRecord } from "@/lib/applications/smart-application.types";
import { jobIntelligenceCopy, targetedDocumentsCopy } from "@/lib/job-intelligence/job-intelligence-translations";
import { appRoutes } from "@/lib/navigation/routes";
import type {
  JobImportPreliminaryDetails,
  JobImportRecord,
  JobImportSourceType,
  JobMatchAnalysis,
  ProfileJobMatchAnalysis,
  SemanticJobUnderstanding,
  TargetedDocumentApprovalState,
  TargetedDocumentPackage,
  StructuredJobRequirement,
  StructuredJobResponsibility
} from "@/lib/job-intelligence/job-intelligence.types";
import { getOpportunityStats } from "@/lib/opportunities/data";
import type { JobProviderStatus, OpportunityAction, OpportunityEligibilityStatus, OpportunitySuitabilityLabel, PersonalizedOpportunity } from "@/lib/opportunities/types";

type OpportunityTab = "recommended" | "near" | "saved" | "all";

const opportunityTabs: Array<{ id: OpportunityTab; label: string }> = [
  { id: "recommended", label: "Recommended" },
  { id: "near", label: "Near Reach" },
  { id: "saved", label: "Saved" },
  { id: "all", label: "All Jobs" }
];

function matchLabel(label: OpportunitySuitabilityLabel) {
  return {
    STRONG_MATCH: "Strong match",
    GOOD_MATCH: "Good match",
    POSSIBLE_MATCH: "Possible match",
    STRETCH_OPPORTUNITY: "Stretch opportunity"
  }[label];
}

function eligibilityLabel(status: OpportunityEligibilityStatus) {
  return {
    COMPATIBLE: "Compatible",
    CHECK_NEEDED: "Check needed",
    BLOCKED: "Blocked",
    UNKNOWN: "Unknown"
  }[status];
}

function opportunityTabMatches(opportunity: PersonalizedOpportunity, tab: OpportunityTab) {
  if (tab === "all") return true;
  if (tab === "saved") return opportunity.action.saved;
  if (tab === "near") return opportunity.match.recommendation === "PREPARE_FIRST" || opportunity.match.recommendation === "APPLY_AFTER_CHECKING";
  return opportunity.match.recommendation === "WORTH_APPLYING";
}

function displayDate(value?: string) {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}

export function OpportunitiesHub({
  initialOpportunities,
  initialJobIntelligence = {},
  providerStatus
}: {
  initialOpportunities: PersonalizedOpportunity[];
  initialJobIntelligence?: Record<string, JobMatchAnalysis>;
  providerStatus?: JobProviderStatus;
}) {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [activeTab, setActiveTab] = useState<OpportunityTab>("recommended");
  const [expandedId, setExpandedId] = useState("");
  const [busyId, setBusyId] = useState("");
  const [preparingId, setPreparingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [jobImportMode, setJobImportMode] = useState<JobImportSourceType>("pasted_text");
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [manualDetails, setManualDetails] = useState<JobImportPreliminaryDetails>({});
  const [manualResponsibilities, setManualResponsibilities] = useState("");
  const [manualRequirements, setManualRequirements] = useState("");
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [jobImport, setJobImport] = useState<JobImportRecord | null>(null);
  const [reviewDetails, setReviewDetails] = useState<JobImportPreliminaryDetails>({});
  const [jobImportStatus, setJobImportStatus] = useState<"idle" | "processing" | "review" | "ready" | "warning" | "failed">("idle");
  const [jobImportMessage, setJobImportMessage] = useState("");
  const [jobUnderstanding, setJobUnderstanding] = useState<SemanticJobUnderstanding | null>(null);
  const [jobUnderstandingStatus, setJobUnderstandingStatus] = useState<"idle" | "processing" | "review" | "confirmed" | "failed">("idle");
  const [jobUnderstandingMessage, setJobUnderstandingMessage] = useState("");
  const [profileJobMatch, setProfileJobMatch] = useState<ProfileJobMatchAnalysis | null>(null);
  const [profileJobMatchStatus, setProfileJobMatchStatus] = useState<"idle" | "processing" | "ready" | "failed">("idle");
  const [profileJobMatchMessage, setProfileJobMatchMessage] = useState("");
  const [targetedDocuments, setTargetedDocuments] = useState<TargetedDocumentPackage | null>(null);
  const [targetedDocumentsStatus, setTargetedDocumentsStatus] = useState<"idle" | "processing" | "ready" | "failed">("idle");
  const [targetedDocumentsMessage, setTargetedDocumentsMessage] = useState("");
  const [smartApplication, setSmartApplication] = useState<SmartApplicationRecord | null>(null);
  const [smartApplicationStatus, setSmartApplicationStatus] = useState<"idle" | "processing" | "ready" | "failed">("idle");
  const [smartApplicationMessage, setSmartApplicationMessage] = useState("");
  const stats = useMemo(() => getOpportunityStats(opportunities), [opportunities]);
  const visibleOpportunities = useMemo(
    () => opportunities.filter((item) => opportunityTabMatches(item, activeTab)),
    [activeTab, opportunities]
  );

  async function updateAction(opportunity: PersonalizedOpportunity, patch: Partial<OpportunityAction>) {
    const nextAction = { ...opportunity.action, ...patch };
    setBusyId(opportunity.id);
    setError("");
    setSuccess("");
    setOpportunities((current) =>
      current
        .map((item) => (item.id === opportunity.id ? { ...item, action: nextAction } : item))
        .filter((item) => !item.action.hidden)
    );

    try {
      const response = await fetch("/api/opportunities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: opportunity.id, ...nextAction })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "Could not update opportunity.");

      if (patch.saved || patch.applied) {
        await fetch("/api/employment-tracker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_name: opportunity.employer,
            role: opportunity.title,
            opportunity_type: opportunity.category,
            status: patch.applied ? "applied" : "saved",
            application_date: patch.applied ? new Date().toISOString().slice(0, 10) : null,
            notes: "Created from PATHZY Opportunities. Review and approve every application before sending."
          })
        });
        setSuccess(patch.applied ? "Application tracked. Keep going." : "Opportunity saved to your tracker.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update opportunity.");
      setOpportunities(initialOpportunities);
    } finally {
      setBusyId("");
    }
  }

  async function prepareApplication(opportunity: PersonalizedOpportunity) {
    setPreparingId(opportunity.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/opportunities/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not prepare this opportunity.");
      await updateAction(opportunity, { saved: true });
      window.location.href = data.coverLetterUrl;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not prepare this opportunity.");
    } finally {
      setPreparingId("");
    }
  }

  async function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Could not read file."));
      reader.readAsDataURL(file);
    });
  }

  async function submitJobImport() {
    setJobImportStatus("processing");
    setJobImportMessage("");
    setJobImport(null);

    try {
      let payload: Record<string, unknown>;
      if (jobImportMode === "pasted_text") {
        payload = { sourceType: "pasted_text", rawText: jobText };
      } else if (jobImportMode === "manual_entry") {
        payload = {
          sourceType: "manual_entry",
          details: manualDetails,
          responsibilities: manualResponsibilities,
          requirements: manualRequirements,
          applicationInstructions: manualDetails.applicationInstructions
        };
      } else if (jobImportMode === "public_url") {
        payload = { sourceType: "public_url", url: jobUrl };
      } else {
        if (!jobFile) throw new Error("Please choose a job advert file.");
        payload = {
          sourceType: "uploaded_document",
          upload: {
            fileName: jobFile.name,
            fileType: jobFile.type || "application/octet-stream",
            fileSize: jobFile.size,
            base64: await fileToBase64(jobFile)
          }
        };
      }

      const response = await fetch("/api/job-imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not inspect this job advert.");
      const record = data.jobImport as JobImportRecord;
      setJobImport(record);
      setJobUnderstanding(null);
      setProfileJobMatch(null);
      setTargetedDocuments(null);
      setSmartApplication(null);
      setReviewDetails(record.inspection.preliminaryDetails);
      setJobImportStatus(record.status === "ocr_required" ? "warning" : "review");
      setJobImportMessage(record.status === "ocr_required" ? "This advert needs OCR. Paste the job description text for now." : "Job advert inspected. Review the details before matching it later.");
    } catch (caught) {
      setJobImportStatus("failed");
      setJobImportMessage(caught instanceof Error ? caught.message : "Could not inspect this job advert.");
    }
  }

  async function markJobImportReady() {
    if (!jobImport) return;
    setJobImportStatus("processing");
    setJobImportMessage("");
    try {
      const response = await fetch("/api/job-imports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobImportId: jobImport.id, corrections: reviewDetails, markReady: true })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save this job review.");
      setJobImport(data.jobImport as JobImportRecord);
      setJobImportStatus("ready");
      setJobImportMessage("Job review saved. PATHZY can use this for matching in the next step.");
    } catch (caught) {
      setJobImportStatus("failed");
      setJobImportMessage(caught instanceof Error ? caught.message : "Could not save this job review.");
    }
  }

  async function createJobAnalysis() {
    if (!jobImport) return;
    setJobUnderstandingStatus("processing");
    setJobUnderstandingMessage("");
    try {
      const response = await fetch("/api/job-understanding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobImportId: jobImport.id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not analyse this job.");
      setJobUnderstanding(data.jobUnderstanding as SemanticJobUnderstanding);
      setProfileJobMatch(null);
      setTargetedDocuments(null);
      setSmartApplication(null);
      setJobUnderstandingStatus("review");
      setJobUnderstandingMessage("Job analysis ready. Review the responsibilities, requirements and application details before matching.");
    } catch (caught) {
      setJobUnderstandingStatus("failed");
      setJobUnderstandingMessage(caught instanceof Error ? caught.message : "Could not analyse this job.");
    }
  }

  async function confirmJobAnalysis(next?: SemanticJobUnderstanding) {
    const active = next ?? jobUnderstanding;
    if (!active) return;
    setJobUnderstandingStatus("processing");
    setJobUnderstandingMessage("");
    try {
      const response = await fetch("/api/job-understanding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobUnderstandingId: active.id,
          title: active.title,
          organization: active.organization,
          location: active.location,
          employmentType: active.employmentType,
          workArrangement: active.workArrangement,
          requirements: active.requirements,
          responsibilities: active.responsibilities,
          applicationDetails: active.applicationDetails,
          confirm: true
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not confirm this job analysis.");
      setJobUnderstanding(data.jobUnderstanding as SemanticJobUnderstanding);
      setProfileJobMatch(null);
      setJobUnderstandingStatus("confirmed");
      setJobUnderstandingMessage("Job analysis confirmed. Profile matching comes next.");
    } catch (caught) {
      setJobUnderstandingStatus("failed");
      setJobUnderstandingMessage(caught instanceof Error ? caught.message : "Could not confirm this job analysis.");
    }
  }

  async function createProfileMatch() {
    if (!jobUnderstanding) return;
    setProfileJobMatchStatus("processing");
    setProfileJobMatchMessage("");
    try {
      const response = await fetch("/api/job-match-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobUnderstandingId: jobUnderstanding.id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not match this job yet.");
      setProfileJobMatch(data.jobMatchAnalysis as ProfileJobMatchAnalysis);
      setTargetedDocuments(null);
      setSmartApplication(null);
      setProfileJobMatchStatus("ready");
      setProfileJobMatchMessage("Job match created. Review the evidence before preparing a targeted application.");
    } catch (caught) {
      setProfileJobMatchStatus("failed");
      setProfileJobMatchMessage(caught instanceof Error ? caught.message : "Could not match this job yet.");
    }
  }

  async function refreshProfileMatch() {
    if (!profileJobMatch) return;
    setProfileJobMatchStatus("processing");
    setProfileJobMatchMessage("");
    try {
      const response = await fetch("/api/job-match-analysis", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: profileJobMatch.id, action: "refresh" })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not refresh this job match.");
      setProfileJobMatch(data.jobMatchAnalysis as ProfileJobMatchAnalysis);
      setTargetedDocuments(null);
      setSmartApplication(null);
      setProfileJobMatchStatus("ready");
      setProfileJobMatchMessage("Job match refreshed with the latest Professional Identity evidence.");
    } catch (caught) {
      setProfileJobMatchStatus("failed");
      setProfileJobMatchMessage(caught instanceof Error ? caught.message : "Could not refresh this job match.");
    }
  }

  async function prepareSmartApplication(createAnotherVersion = false) {
    if (!profileJobMatch) return;
    setSmartApplicationStatus("processing");
    setSmartApplicationMessage("");
    try {
      const response = await fetch("/api/smart-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: profileJobMatch.id, createAnotherVersion })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not prepare the application workspace.");
      setSmartApplication(data.application as SmartApplicationRecord);
      setSmartApplicationStatus("ready");
      setSmartApplicationMessage(data.reused ? "Existing application workspace opened." : "Application workspace prepared. Nothing has been submitted.");
    } catch (caught) {
      setSmartApplicationStatus("failed");
      setSmartApplicationMessage(caught instanceof Error ? caught.message : "Could not prepare the application workspace.");
    }
  }

  async function createTargetedDocuments() {
    if (!profileJobMatch) return;
    setTargetedDocumentsStatus("processing");
    setTargetedDocumentsMessage("");
    try {
      const response = await fetch("/api/targeted-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: profileJobMatch.id,
          includeApplicationEmail: true,
          includeLinkedInMessage: true,
          includeRecruiterMessage: true
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not prepare targeted documents.");
      setTargetedDocuments(data.targetedDocuments as TargetedDocumentPackage);
      setTargetedDocumentsStatus("ready");
      setTargetedDocumentsMessage("Targeted documents are ready for review. Nothing has been sent.");
    } catch (caught) {
      setTargetedDocumentsStatus("failed");
      setTargetedDocumentsMessage(caught instanceof Error ? caught.message : "Could not prepare targeted documents.");
    }
  }

  async function updateTargetedDocumentApproval(documentId: string, approvalState: TargetedDocumentApprovalState) {
    if (!targetedDocuments) return;
    setTargetedDocumentsStatus("processing");
    setTargetedDocumentsMessage("");
    try {
      const response = await fetch("/api/targeted-documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, approvalState })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update document approval.");
      setTargetedDocuments({
        ...targetedDocuments,
        documents: targetedDocuments.documents.map((document) =>
          document.professionalDocumentId === documentId
            ? { ...document, approvalState: data.document.approval_state as TargetedDocumentApprovalState }
            : document
        )
      });
      setTargetedDocumentsStatus("ready");
      setTargetedDocumentsMessage(approvalState === "approved" ? "Document approved for your review records." : "Document marked for changes.");
    } catch (caught) {
      setTargetedDocumentsStatus("failed");
      setTargetedDocumentsMessage(caught instanceof Error ? caught.message : "Could not update document approval.");
    }
  }

  return (
    <div className="grid gap-5">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="pathzy-eyebrow-accent text-xs font-extrabold uppercase tracking-[0.16em]">Jobs</p>
            <h2 className="mt-2 text-3xl font-black">Real opportunities that fit your Professional Identity.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
              PATHZY shows real provider listings only, then explains suitability and eligibility separately before you decide what to do next. PATHZY never substitutes fake vacancies.
            </p>
          </div>
          {providerStatus ? (
            <div className={`rounded-[18px] border px-4 py-3 text-sm leading-6 ${
              providerStatus.status === "available"
                ? "pathzy-status-success"
                : "pathzy-status-warning"
            }`}>
              <strong className="block text-xs uppercase tracking-[0.14em]">
                {providerStatus.status === "available" ? "Provider connected" : providerStatus.status.replaceAll("_", " ")}
              </strong>
              <span>{providerStatus.message ?? `Live listings from ${providerStatus.provider}.`}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {opportunityTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full border px-4 py-2 text-sm font-extrabold transition ${
                activeTab === tab.id
                  ? "border-[rgba(217,58,70,.55)] bg-[var(--brand-primary)] text-white"
                  : "border-white/10 bg-white/7 text-white/66 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 md:max-w-md">
          <div className="rounded-[18px] border border-white/10 bg-white/7 p-3"><p className="text-xs font-bold text-white/45">Saved</p><strong className="mt-1 block text-2xl font-black">{stats.saved}</strong></div>
          <div className="rounded-[18px] border border-white/10 bg-white/7 p-3"><p className="text-xs font-bold text-white/45">Applied</p><strong className="mt-1 block text-2xl font-black">{stats.applied}</strong></div>
          <div className="rounded-[18px] border border-white/10 bg-white/7 p-3"><p className="text-xs font-bold text-white/45">Done</p><strong className="mt-1 block text-2xl font-black">{stats.completed}</strong></div>
        </div>
        <div className="mt-4 md:max-w-md">
          <div className="mb-2 flex items-center justify-between text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">
            <span>Application progress</span>
            <span>{stats.progress}%</span>
          </div>
          <ProgressBar value={stats.progress} />
        </div>

        {error ? <p className="pathzy-status-danger mt-4 rounded-[16px] border px-4 py-3 text-sm">{error}</p> : null}
        {success ? <p className="pathzy-status-success mt-4 rounded-[16px] border px-4 py-3 text-sm font-bold">{success}</p> : null}

        <div className="mt-6 grid gap-4">
          {visibleOpportunities.map((opportunity) => {
            const expanded = expandedId === opportunity.id;
            return (
              <article key={opportunity.id} className="rounded-[24px] border border-white/10 bg-white/7 p-4 md:p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-[rgba(217,58,70,.22)] bg-[rgba(217,58,70,.1)] px-3 py-1 text-xs font-extrabold text-[var(--text-secondary)]">Live {opportunity.source} listing</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/60">{opportunity.remoteType.replaceAll("_", "-")}</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/60">{opportunity.employmentType}</span>
                    </div>
                    <h3 className="mt-3 text-2xl font-black">{opportunity.title}</h3>
                    <p className="mt-1 text-sm font-bold text-white/52">{opportunity.employer} · {opportunity.location}</p>
                    <p className="mt-1 text-xs font-bold text-white/38">Posted: {displayDate(opportunity.postedAt)} · Closing: {displayDate(opportunity.closingAt)}</p>
                  </div>
                  <div className="flex flex-col gap-2 md:items-end">
                    <span className="w-fit rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-extrabold text-white">{matchLabel(opportunity.match.suitabilityLabel)}</span>
                    <span className="w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/68">Eligibility: {eligibilityLabel(opportunity.match.eligibilityStatus)}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_.8fr]">
                  <div className="rounded-[18px] border border-white/10 bg-black/10 p-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/40">Why PATHZY recommends this</p>
                    <ul className="mt-2 grid gap-1 text-sm leading-6 text-white/66">
                      {opportunity.match.reasons.slice(0, 4).map((reason) => <li key={reason}>- {reason}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-black/10 p-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/40">What to check</p>
                    <ul className="mt-2 grid gap-1 text-sm leading-6 text-white/66">
                      {[...opportunity.match.unknowns, ...opportunity.match.gaps].slice(0, 4).map((item) => <li key={item}>- {item}</li>)}
                      {!opportunity.match.unknowns.length && !opportunity.match.gaps.length ? <li>No major check found from your confirmed profile.</li> : null}
                    </ul>
                  </div>
                </div>

                {initialJobIntelligence[opportunity.id] ? (
                  <JobIntelligencePanel analysis={initialJobIntelligence[opportunity.id]} />
                ) : null}

                {expanded ? (
                  <div className="mt-4 grid gap-4 rounded-[20px] border border-white/10 bg-black/12 p-4">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/40">About the job</p>
                      <p className="mt-2 text-sm leading-6 text-white/64">{opportunity.description}</p>
                    </div>
                    {opportunity.responsibilities.length ? (
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/40">Responsibilities</p>
                        <ul className="mt-2 grid gap-1 text-sm leading-6 text-white/64">
                          {opportunity.responsibilities.slice(0, 6).map((item) => <li key={item}>- {item}</li>)}
                        </ul>
                      </div>
                    ) : null}
                    {opportunity.requirements.length ? (
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/40">Requirements</p>
                        <ul className="mt-2 grid gap-1 text-sm leading-6 text-white/64">
                          {opportunity.requirements.slice(0, 8).map((item) => <li key={item}>- {item}</li>)}
                        </ul>
                      </div>
                    ) : null}
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/40">Source</p>
                      <p className="mt-2 text-sm leading-6 text-white/64">Source: {opportunity.source}. PATHZY opens the genuine vacancy destination when you apply.</p>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setExpandedId(expanded ? "" : opportunity.id)} className="rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/70 transition hover:bg-white/14">
                    {expanded ? "Hide details" : "View Job"}
                  </button>
                  <button disabled={busyId === opportunity.id} onClick={() => updateAction(opportunity, { saved: !opportunity.action.saved })} className={`rounded-full px-4 py-2 text-sm font-extrabold ${opportunity.action.saved ? "pathzy-status-success border" : "bg-white/10 text-white/68"}`}>
                    {opportunity.action.saved ? "Saved" : "Save"}
                  </button>
                  <button disabled={preparingId === opportunity.id || busyId === opportunity.id} onClick={() => prepareApplication(opportunity)} className="pathzy-control-primary px-4 py-2 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60">
                    {preparingId === opportunity.id ? "Preparing..." : "Prepare Application"}
                  </button>
                  <Link href={opportunity.applicationUrl} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/68 transition hover:bg-white/14">Apply on source site</Link>
                  <button disabled={busyId === opportunity.id} onClick={() => updateAction(opportunity, { saved: true, applied: !opportunity.action.applied })} className={`rounded-full px-4 py-2 text-sm font-extrabold ${opportunity.action.applied ? "pathzy-status-info border" : "bg-white/10 text-white/68"}`}>
                    {opportunity.action.applied ? "Applied" : "Mark as Applied"}
                  </button>
                  {opportunity.action.applied ? (
                    <Link href={`${appRoutes.applications}?company=${encodeURIComponent(opportunity.employer)}&role=${encodeURIComponent(opportunity.title)}&type=${encodeURIComponent(opportunity.category)}`} className="rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/68 transition hover:bg-white/14">Track application</Link>
                  ) : null}
                  <button disabled={busyId === opportunity.id} onClick={() => updateAction(opportunity, { hidden: true })} className="rounded-full bg-white/10 px-4 py-2 text-sm font-extrabold text-white/54">Not for me</button>
                </div>
              </article>
            );
          })}
          {!visibleOpportunities.length ? (
            <div className="rounded-[22px] border border-white/10 bg-white/7 p-6 text-center text-white/58">
              {providerStatus?.status === "provider_unavailable"
                ? "The job provider is unavailable right now. PATHZY will not show fake vacancies."
                : providerStatus?.status === "invalid_provider_response"
                  ? "The job provider returned a response PATHZY could not read. No fake vacancies are shown."
                  : providerStatus?.status === "no_jobs_found"
                    ? "No real jobs were found for this search. Try a broader role or location."
                    : "No visible opportunities in this tab. Save a job, broaden your search, or update your Professional Identity."}
            </div>
          ) : null}
        </div>
      </Card>

      <Card>
        <JobImportCard
          mode={jobImportMode}
          setMode={setJobImportMode}
          jobText={jobText}
          setJobText={setJobText}
          jobUrl={jobUrl}
          setJobUrl={setJobUrl}
          manualDetails={manualDetails}
          setManualDetails={setManualDetails}
          manualResponsibilities={manualResponsibilities}
          setManualResponsibilities={setManualResponsibilities}
          manualRequirements={manualRequirements}
          setManualRequirements={setManualRequirements}
          setJobFile={setJobFile}
          jobImport={jobImport}
          reviewDetails={reviewDetails}
          setReviewDetails={setReviewDetails}
          status={jobImportStatus}
          message={jobImportMessage}
          onSubmit={submitJobImport}
          onMarkReady={markJobImportReady}
        />
        <JobUnderstandingReview
          jobImport={jobImport}
          understanding={jobUnderstanding}
          setUnderstanding={setJobUnderstanding}
          status={jobUnderstandingStatus}
          message={jobUnderstandingMessage}
          onCreate={createJobAnalysis}
          onConfirm={confirmJobAnalysis}
        />
        <ProfileJobMatchReview
          understanding={jobUnderstanding}
          analysis={profileJobMatch}
          status={profileJobMatchStatus}
          message={profileJobMatchMessage}
          onCreate={createProfileMatch}
          onRefresh={refreshProfileMatch}
        />
        <TargetedDocumentsReview
          analysis={profileJobMatch}
          packageData={targetedDocuments}
          status={targetedDocumentsStatus}
          message={targetedDocumentsMessage}
          onCreate={createTargetedDocuments}
          onApprove={(documentId) => updateTargetedDocumentApproval(documentId, "approved")}
          onRequestChanges={(documentId) => updateTargetedDocumentApproval(documentId, "changes_requested")}
          smartApplication={smartApplication}
          smartApplicationStatus={smartApplicationStatus}
          smartApplicationMessage={smartApplicationMessage}
          onPrepareApplication={() => prepareSmartApplication(false)}
          onCreateAnotherVersion={() => prepareSmartApplication(true)}
        />
      </Card>
    </div>
  );
}

function updateDetail(
  current: JobImportPreliminaryDetails,
  setCurrent: (next: JobImportPreliminaryDetails) => void,
  key: keyof JobImportPreliminaryDetails,
  value: string
) {
  setCurrent({ ...current, [key]: value });
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-white/68">
      {label}
      <input
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[16px] border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-[rgba(217,58,70,.6)]"
      />
    </label>
  );
}

function JobImportCard({
  mode,
  setMode,
  jobText,
  setJobText,
  jobUrl,
  setJobUrl,
  manualDetails,
  setManualDetails,
  manualResponsibilities,
  setManualResponsibilities,
  manualRequirements,
  setManualRequirements,
  setJobFile,
  jobImport,
  reviewDetails,
  setReviewDetails,
  status,
  message,
  onSubmit,
  onMarkReady
}: {
  mode: JobImportSourceType;
  setMode: (mode: JobImportSourceType) => void;
  jobText: string;
  setJobText: (value: string) => void;
  jobUrl: string;
  setJobUrl: (value: string) => void;
  manualDetails: JobImportPreliminaryDetails;
  setManualDetails: (value: JobImportPreliminaryDetails) => void;
  manualResponsibilities: string;
  setManualResponsibilities: (value: string) => void;
  manualRequirements: string;
  setManualRequirements: (value: string) => void;
  setJobFile: (file: File | null) => void;
  jobImport: JobImportRecord | null;
  reviewDetails: JobImportPreliminaryDetails;
  setReviewDetails: (value: JobImportPreliminaryDetails) => void;
  status: "idle" | "processing" | "review" | "ready" | "warning" | "failed";
  message: string;
  onSubmit: () => void;
  onMarkReady: () => void;
}) {
  const isBusy = status === "processing";
  const modes: Array<{ id: JobImportSourceType; label: string }> = [
    { id: "pasted_text", label: "Paste text" },
    { id: "manual_entry", label: "Manual entry" },
    { id: "uploaded_document", label: "Upload file" },
    { id: "public_url", label: "Job link" }
  ];

  return (
    <section className="pathzy-status-info mb-5 rounded-[24px] border p-4 md:p-5" aria-labelledby="job-import-title">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="pathzy-eyebrow-accent text-xs font-extrabold uppercase tracking-[0.14em]">Job Import</p>
          <h2 id="job-import-title" className="mt-2 text-2xl font-black">Inspect a job advert</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            Paste or upload a job advert. PATHZY will extract the job basics first, then you can review them before matching your profile in the next step.
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-extrabold text-white/62">English + French</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Job import method">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${mode === item.id ? "bg-[var(--brand-primary)] text-white" : "bg-white/10 text-white/64 hover:bg-white/14"}`}
            aria-pressed={mode === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {mode === "pasted_text" ? (
          <label className="grid gap-2 text-sm font-bold text-white/68">
            Job description
            <textarea
              value={jobText}
              onChange={(event) => setJobText(event.target.value)}
              placeholder="Paste the full job description, responsibilities, requirements, closing date and application instructions."
              rows={8}
              className="w-full rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-[rgba(217,58,70,.6)]"
            />
          </label>
        ) : null}

        {mode === "manual_entry" ? (
          <div className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <FieldInput label="Job title" value={manualDetails.jobTitle} onChange={(value) => updateDetail(manualDetails, setManualDetails, "jobTitle", value)} />
              <FieldInput label="Organisation" value={manualDetails.organisation} onChange={(value) => updateDetail(manualDetails, setManualDetails, "organisation", value)} />
              <FieldInput label="Location" value={manualDetails.location} onChange={(value) => updateDetail(manualDetails, setManualDetails, "location", value)} />
              <FieldInput label="Employment type" value={manualDetails.employmentType} onChange={(value) => updateDetail(manualDetails, setManualDetails, "employmentType", value)} />
              <FieldInput label="Work arrangement" value={manualDetails.workArrangement} onChange={(value) => updateDetail(manualDetails, setManualDetails, "workArrangement", value)} placeholder="Remote, hybrid, on-site" />
              <FieldInput label="Closing date" value={manualDetails.closingDate} onChange={(value) => updateDetail(manualDetails, setManualDetails, "closingDate", value)} />
            </div>
            <label className="grid gap-2 text-sm font-bold text-white/68">
              Responsibilities
              <textarea value={manualResponsibilities} onChange={(event) => setManualResponsibilities(event.target.value)} rows={4} className="w-full rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold leading-6 text-white outline-none focus:border-[rgba(217,58,70,.6)]" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-white/68">
              Candidate requirements
              <textarea value={manualRequirements} onChange={(event) => setManualRequirements(event.target.value)} rows={4} className="w-full rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold leading-6 text-white outline-none focus:border-[rgba(217,58,70,.6)]" />
            </label>
          </div>
        ) : null}

        {mode === "uploaded_document" ? (
          <label className="grid gap-2 text-sm font-bold text-white/68">
            Upload job advert
            <input
              type="file"
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg"
              onChange={(event) => setJobFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white file:mr-3 file:rounded-full file:border-0 file:bg-white/12 file:px-3 file:py-2 file:text-sm file:font-extrabold file:text-white"
            />
            <span className="text-xs leading-5 text-white/44">PDF, DOCX and TXT can be inspected now. Image adverts may ask for pasted text until OCR is available.</span>
          </label>
        ) : null}

        {mode === "public_url" ? (
          <FieldInput label="Public job advert link" value={jobUrl} onChange={setJobUrl} placeholder="https://example.com/jobs/role" />
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isBusy}
          onClick={onSubmit}
          className="pathzy-control-primary px-5 py-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? "Inspecting job..." : "Inspect Job"}
        </button>
        <span className="text-sm font-semibold text-white/48">PATHZY will not compare your profile or apply automatically in this step.</span>
      </div>

      {message ? (
        <p className={`mt-4 rounded-[16px] border px-4 py-3 text-sm font-bold ${status === "failed" ? "pathzy-status-danger" : status === "warning" ? "pathzy-status-warning" : "pathzy-status-success"}`}>
          {message}
        </p>
      ) : null}

      {jobImport ? (
        <div className="mt-5 rounded-[20px] border border-white/10 bg-black/16 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Review imported job</p>
              <h3 className="mt-1 text-xl font-black">{reviewDetails.jobTitle || "Job title needs review"}</h3>
            </div>
            <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/58">{jobImport.inspection.language === "fr" ? "French" : jobImport.inspection.language === "en" ? "English" : "Language needs review"}</span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <FieldInput label="Job title" value={reviewDetails.jobTitle} onChange={(value) => updateDetail(reviewDetails, setReviewDetails, "jobTitle", value)} />
            <FieldInput label="Organisation" value={reviewDetails.organisation} onChange={(value) => updateDetail(reviewDetails, setReviewDetails, "organisation", value)} />
            <FieldInput label="Location" value={reviewDetails.location} onChange={(value) => updateDetail(reviewDetails, setReviewDetails, "location", value)} />
            <FieldInput label="Closing date" value={reviewDetails.closingDate} onChange={(value) => updateDetail(reviewDetails, setReviewDetails, "closingDate", value)} />
            <FieldInput label="Employment type" value={reviewDetails.employmentType} onChange={(value) => updateDetail(reviewDetails, setReviewDetails, "employmentType", value)} />
            <FieldInput label="Work arrangement" value={reviewDetails.workArrangement} onChange={(value) => updateDetail(reviewDetails, setReviewDetails, "workArrangement", value)} />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-[16px] border border-white/10 bg-white/7 p-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/40">Requirements</p>
              <p className="mt-2 text-2xl font-black">{jobImport.inspection.requirements.length}</p>
              <p className="mt-1 text-xs leading-5 text-white/52">{jobImport.inspection.requirements[0]?.text ?? "No clear requirements yet."}</p>
            </div>
            <div className="rounded-[16px] border border-white/10 bg-white/7 p-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/40">Responsibilities</p>
              <p className="mt-2 text-2xl font-black">{jobImport.inspection.responsibilities.length}</p>
              <p className="mt-1 text-xs leading-5 text-white/52">{jobImport.inspection.responsibilities[0]?.text ?? "No clear responsibilities yet."}</p>
            </div>
            <div className="rounded-[16px] border border-white/10 bg-white/7 p-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/40">Warnings</p>
              <p className="mt-2 text-2xl font-black">{jobImport.inspection.warnings.length}</p>
              <p className="mt-1 text-xs leading-5 text-white/52">{jobImport.inspection.warnings[0]?.message ?? "No warning detected."}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onMarkReady}
              disabled={isBusy || jobImport.status === "ocr_required"}
              className="pathzy-control-primary px-5 py-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "ready" ? "Saved for Matching" : "Save Job Review"}
            </button>
            <span className="rounded-full bg-white/10 px-4 py-3 text-sm font-bold text-white/54">Profile matching comes next.</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function JobUnderstandingReview({
  jobImport,
  understanding,
  setUnderstanding,
  status,
  message,
  onCreate,
  onConfirm
}: {
  jobImport: JobImportRecord | null;
  understanding: SemanticJobUnderstanding | null;
  setUnderstanding: (value: SemanticJobUnderstanding) => void;
  status: "idle" | "processing" | "review" | "confirmed" | "failed";
  message: string;
  onCreate: () => void;
  onConfirm: (next?: SemanticJobUnderstanding) => void;
}) {
  const canCreate = jobImport?.status === "ready";
  const isBusy = status === "processing";

  if (!canCreate && !understanding) return null;

  function updateRequirement(requirementId: string, patch: Partial<StructuredJobRequirement>) {
    if (!understanding) return;
    setUnderstanding({
      ...understanding,
      requirements: understanding.requirements.map((item) => (item.id === requirementId ? { ...item, ...patch, userStatus: "edited" } : item))
    });
  }

  function removeRequirement(requirementId: string) {
    if (!understanding) return;
    setUnderstanding({
      ...understanding,
      requirements: understanding.requirements.map((item) => (item.id === requirementId ? { ...item, userStatus: "removed" } : item))
    });
  }

  function addRequirement() {
    if (!understanding) return;
    const nextRequirement: StructuredJobRequirement = {
      id: `user-added-requirement-${Date.now()}`,
      type: "other",
      importance: "unclear",
      sourceText: "",
      normalizedConcept: "",
      confidence: 0.5,
      evidence: {
        text: "Added by user during review",
        originalWording: "Added by user during review",
        section: "user_review",
        confidence: 0.5
      },
      userStatus: "added"
    };
    setUnderstanding({ ...understanding, requirements: [...understanding.requirements, nextRequirement] });
  }

  function updateResponsibility(responsibilityId: string, patch: Partial<StructuredJobResponsibility>) {
    if (!understanding) return;
    setUnderstanding({
      ...understanding,
      responsibilities: understanding.responsibilities.map((item) => (item.id === responsibilityId ? { ...item, ...patch, userStatus: "edited" } : item))
    });
  }

  function removeResponsibility(responsibilityId: string) {
    if (!understanding) return;
    setUnderstanding({
      ...understanding,
      responsibilities: understanding.responsibilities.map((item) => (item.id === responsibilityId ? { ...item, userStatus: "removed" } : item))
    });
  }

  const activeRequirements = understanding?.requirements.filter((item) => item.userStatus !== "removed") ?? [];
  const activeResponsibilities = understanding?.responsibilities.filter((item) => item.userStatus !== "removed") ?? [];

  return (
    <section className="pathzy-status-info mb-5 rounded-[24px] border p-4 md:p-5" aria-labelledby="job-analysis-title">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="pathzy-eyebrow-accent text-xs font-extrabold uppercase tracking-[0.14em]">Job Analysis</p>
          <h2 id="job-analysis-title" className="mt-2 text-2xl font-black">Review the job analysis</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            PATHZY has not matched this job to your profile yet. First, confirm what the job asks for so the next step stays truthful.
          </p>
        </div>
        {understanding ? (
          <span className="w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-extrabold text-white/70">
            Confidence {Math.round(understanding.overallConfidence * 100)}%
          </span>
        ) : null}
      </div>

      {!understanding ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isBusy || !canCreate}
            onClick={onCreate}
            className="pathzy-control-primary px-5 py-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Analysing job..." : "Review Analysis"}
          </button>
          <span className="text-sm font-semibold text-white/48">This creates responsibilities, requirements, evidence and application details.</span>
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <FieldInput label="Job title" value={understanding.title} onChange={(value) => setUnderstanding({ ...understanding, title: value })} />
            <FieldInput label="Organization" value={understanding.organization} onChange={(value) => setUnderstanding({ ...understanding, organization: value })} />
            <FieldInput label="Location" value={understanding.location} onChange={(value) => setUnderstanding({ ...understanding, location: value })} />
            <FieldInput label="Employment type" value={understanding.employmentType} onChange={(value) => setUnderstanding({ ...understanding, employmentType: value })} />
            <FieldInput label="Work arrangement" value={understanding.workArrangement} onChange={(value) => setUnderstanding({ ...understanding, workArrangement: value })} />
            <FieldInput label="Closing date" value={understanding.applicationDetails.closingDate} onChange={(value) => setUnderstanding({ ...understanding, applicationDetails: { ...understanding.applicationDetails, closingDate: value } })} />
          </div>

          <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Summary</p>
            <p className="mt-2 text-sm leading-6 text-white/66">{understanding.summary}</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Responsibilities</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/50">{activeResponsibilities.length}</span>
              </div>
              <div className="mt-3 grid gap-3">
                {activeResponsibilities.map((responsibility) => (
                  <div key={responsibility.id} className="rounded-[16px] border border-white/10 bg-white/7 p-3">
                    <textarea
                      value={responsibility.text}
                      onChange={(event) => updateResponsibility(responsibility.id, { text: event.target.value })}
                      rows={3}
                      className="w-full rounded-[14px] border border-white/10 bg-black/18 px-3 py-2 text-sm font-semibold leading-6 text-white outline-none focus:border-[rgba(217,58,70,.6)]"
                    />
                    <p className="mt-2 text-xs leading-5 text-white/42">Evidence: {responsibility.evidence.originalWording}</p>
                    <button type="button" onClick={() => removeResponsibility(responsibility.id)} className="mt-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/56">Remove</button>
                  </div>
                ))}
                {!activeResponsibilities.length ? <p className="text-sm text-white/52">No responsibilities extracted. Add them in the source import review before matching.</p> : null}
              </div>
            </div>

            <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Requirements</p>
                <button type="button" onClick={addRequirement} className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/68">Add requirement</button>
              </div>
              <div className="mt-3 grid gap-3">
                {activeRequirements.map((requirement) => (
                  <div key={requirement.id} className="rounded-[16px] border border-white/10 bg-white/7 p-3">
                    <textarea
                      value={requirement.sourceText}
                      onChange={(event) => updateRequirement(requirement.id, { sourceText: event.target.value, normalizedConcept: event.target.value })}
                      rows={2}
                      className="w-full rounded-[14px] border border-white/10 bg-black/18 px-3 py-2 text-sm font-semibold leading-6 text-white outline-none focus:border-[rgba(217,58,70,.6)]"
                    />
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <label className="grid gap-1 text-xs font-bold text-white/50">
                        Importance
                        <select
                          value={requirement.importance}
                          onChange={(event) => updateRequirement(requirement.id, { importance: event.target.value as StructuredJobRequirement["importance"] })}
                          className="rounded-[12px] border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
                        >
                          <option value="mandatory">Mandatory</option>
                          <option value="preferred">Preferred</option>
                          <option value="optional">Optional</option>
                          <option value="unclear">Unclear</option>
                        </select>
                      </label>
                      <label className="grid gap-1 text-xs font-bold text-white/50">
                        Type
                        <select
                          value={requirement.type}
                          onChange={(event) => updateRequirement(requirement.id, { type: event.target.value as StructuredJobRequirement["type"] })}
                          className="rounded-[12px] border border-white/10 bg-black/30 px-3 py-2 text-white outline-none"
                        >
                          {["skill", "experience", "education", "certification", "licence", "language", "location", "work_authorization", "availability", "technical", "behavioural", "industry", "travel", "physical", "other"].map((item) => (
                            <option key={item} value={item}>{item.replaceAll("_", " ")}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-white/42">Evidence: {requirement.evidence.originalWording}</p>
                    <button type="button" onClick={() => removeRequirement(requirement.id)} className="mt-2 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/56">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Application Details</p>
              <div className="mt-3 grid gap-3">
                <FieldInput label="Application method" value={understanding.applicationDetails.applicationMethod} onChange={(value) => setUnderstanding({ ...understanding, applicationDetails: { ...understanding.applicationDetails, applicationMethod: value } })} />
                <FieldInput label="Contact email" value={understanding.applicationDetails.contactEmail} onChange={(value) => setUnderstanding({ ...understanding, applicationDetails: { ...understanding.applicationDetails, contactEmail: value } })} />
                <FieldInput label="Reference number" value={understanding.applicationDetails.referenceNumber} onChange={(value) => setUnderstanding({ ...understanding, applicationDetails: { ...understanding.applicationDetails, referenceNumber: value } })} />
              </div>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Warnings</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/62">
                {understanding.warnings.length ? understanding.warnings.map((warning) => <li key={warning}>- {warning}</li>) : <li>No warning detected.</li>}
              </ul>
              <p className="mt-3 text-xs leading-5 text-white/42">Original source references are saved for review. PATHZY stores evidence, not hidden reasoning.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onConfirm(understanding)}
              className="pathzy-control-primary px-5 py-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "confirmed" ? "Analysis Confirmed" : "Confirm Job Analysis"}
            </button>
            <span className="rounded-full bg-white/10 px-4 py-3 text-sm font-bold text-white/54">No match score is created in Phase 8B.</span>
          </div>
        </div>
      )}

      {message ? (
        <p className={`mt-4 rounded-[16px] border px-4 py-3 text-sm font-bold ${status === "failed" ? "pathzy-status-danger" : "pathzy-status-success"}`}>
          {message}
        </p>
      ) : null}
    </section>
  );
}

function fitBandLabel(band: ProfileJobMatchAnalysis["fitBand"]) {
  return {
    strong_match: "Strong match",
    good_potential: "Good potential",
    possible_match: "Possible match",
    significant_gaps: "Significant gaps",
    insufficient_information: "Insufficient information"
  }[band];
}

function readinessLabel(readiness: ProfileJobMatchAnalysis["readiness"]) {
  return {
    ready_to_prepare_application: "Ready to prepare application",
    review_recommended: "Review recommended",
    information_needed: "More information needed",
    eligibility_concern: "Eligibility concern",
    not_recommended_without_changes: "Significant gaps"
  }[readiness];
}

function matchStatusLabel(status: ProfileJobMatchAnalysis["requirements"][number]["status"]) {
  return {
    confirmed_match: "Confirmed match",
    partial_match: "Partial match",
    transferable_match: "Transferable match",
    not_confirmed: "Not confirmed",
    confirmed_gap: "Confirmed gap",
    unclear: "Unclear",
    not_applicable: "Not applicable"
  }[status];
}

function ProfileJobMatchReview({
  understanding,
  analysis,
  status,
  message,
  onCreate,
  onRefresh
}: {
  understanding: SemanticJobUnderstanding | null;
  analysis: ProfileJobMatchAnalysis | null;
  status: "idle" | "processing" | "ready" | "failed";
  message: string;
  onCreate: () => void;
  onRefresh: () => void;
}) {
  if (understanding?.status !== "confirmed" && !analysis) return null;
  const isBusy = status === "processing";
  return (
    <section className="pathzy-status-info mb-5 rounded-[24px] border p-4 md:p-5" aria-labelledby="profile-job-match-title">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="pathzy-eyebrow-accent text-xs font-extrabold uppercase tracking-[0.14em]">Job Match</p>
          <h2 id="profile-job-match-title" className="mt-2 text-2xl font-black">Compare this job with your Professional Identity</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            PATHZY checks confirmed evidence against each requirement. Gaps and unknowns are kept separate, and your profile is not changed automatically.
          </p>
        </div>
        {analysis ? (
          <span className="w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-extrabold text-white/70">
            {fitBandLabel(analysis.fitBand)}
          </span>
        ) : null}
      </div>

      {!analysis ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={onCreate}
            className="pathzy-control-primary px-5 py-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Matching job..." : "Create Job Match"}
          </button>
          <span className="text-sm font-semibold text-white/48">This creates evidence, fit score, confidence, questions and next steps.</span>
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          {analysis.freshness?.stale ? (
            <div className="pathzy-status-warning rounded-[18px] border p-4">
              <p className="text-sm font-extrabold">{analysis.freshness.reason ?? "This match may be stale."}</p>
              <button type="button" onClick={onRefresh} disabled={isBusy} className="pathzy-control-primary mt-3 px-4 py-2 text-sm font-extrabold disabled:opacity-60">Refresh analysis</button>
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Fit Score</p>
              <p className="mt-2 text-3xl font-black">{analysis.fitScore ?? "--"}{analysis.fitScore !== undefined ? "%" : ""}</p>
              <p className="mt-1 text-sm text-white/54">{fitBandLabel(analysis.fitBand)}</p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Analysis Confidence</p>
              <p className="mt-2 text-3xl font-black">{Math.round(analysis.analysisConfidence * 100)}%</p>
              <p className="mt-1 text-sm text-white/54">Evidence quality, completeness and consistency.</p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Readiness</p>
              <p className="mt-2 text-xl font-black">{readinessLabel(analysis.readiness)}</p>
              <p className="mt-1 text-sm text-white/54">You stay in control before applying.</p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Strong Matches</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/64">
                {analysis.strengths.length ? analysis.strengths.slice(0, 5).map((item) => <li key={item.id}>- {item.description}</li>) : <li>No confirmed strong match yet.</li>}
              </ul>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Partial and Transferable Matches</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/64">
                {analysis.partialMatches.length ? analysis.partialMatches.slice(0, 5).map((item) => <li key={item.id}>- {item.description}</li>) : <li>No partial or transferable match yet.</li>}
              </ul>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Missing Requirements</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/64">
                {analysis.gaps.length ? analysis.gaps.slice(0, 5).map((item) => <li key={item.id}>- {item.description}</li>) : <li>No major missing requirement detected.</li>}
              </ul>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Potential Blockers</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/64">
                {analysis.blockers.length ? analysis.blockers.slice(0, 5).map((item) => <li key={item.id}>- {item.description}</li>) : <li>No potential blocker detected from current evidence.</li>}
              </ul>
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-white/10 bg-black/14">
            <div className="grid grid-cols-[1.4fr_.8fr_.8fr_1.2fr] gap-3 border-b border-white/10 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">
              <span>Requirement</span>
              <span>Importance</span>
              <span>Match</span>
              <span>Action</span>
            </div>
            <div className="grid gap-0">
              {analysis.requirements.slice(0, 8).map((requirement) => (
                <div key={requirement.requirementId} className="grid gap-3 border-b border-white/8 px-4 py-3 text-sm md:grid-cols-[1.4fr_.8fr_.8fr_1.2fr]">
                  <span className="text-white/74">{requirement.requirementText}</span>
                  <span className="font-bold text-white/54">{requirement.requirementImportance}</span>
                  <span className="font-bold text-white/70">{matchStatusLabel(requirement.status)}</span>
                  <span className="text-white/54">{requirement.userAction}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Recommended Next Steps</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/64">
                {analysis.recommendations.map((item) => <li key={item.id}>- {item.label}: {item.description}</li>)}
              </ul>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">Information Needed</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/64">
                {analysis.clarificationQuestions.length ? analysis.clarificationQuestions.slice(0, 5).map((item) => <li key={item.id}>- {item.question}</li>) : <li>No clarification question generated.</li>}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={analysis.targetedCvRoute} className="pathzy-control-primary px-5 py-3 text-sm font-extrabold transition">
              Prepare Targeted Application
            </Link>
            <button type="button" disabled={isBusy} onClick={onRefresh} className="rounded-full bg-white/10 px-5 py-3 text-sm font-extrabold text-white/64 transition hover:bg-white/14 disabled:opacity-60">
              Refresh analysis
            </button>
            <span className="rounded-full bg-white/10 px-4 py-3 text-sm font-bold text-white/54">No profile facts were changed.</span>
          </div>
        </div>
      )}

      {message ? (
        <p className={`mt-4 rounded-[16px] border px-4 py-3 text-sm font-bold ${status === "failed" ? "pathzy-status-danger" : "pathzy-status-success"}`}>
          {message}
        </p>
      ) : null}
    </section>
  );
}

function targetedDocumentLabel(type: TargetedDocumentPackage["documents"][number]["type"]) {
  const copy = targetedDocumentsCopy.en;
  return {
    targeted_cv: copy.targetedCv,
    tailored_cover_letter: copy.coverLetter,
    application_email: copy.applicationEmail,
    linkedin_message: copy.linkedInMessage,
    recruiter_message: copy.recruiterMessage
  }[type];
}

function approvalLabel(state: TargetedDocumentApprovalState) {
  return {
    draft: "Draft",
    review_required: targetedDocumentsCopy.en.reviewRequired,
    approved: targetedDocumentsCopy.en.approved,
    changes_requested: "Changes requested",
    archived: "Archived"
  }[state];
}

function TargetedDocumentsReview({
  analysis,
  packageData,
  status,
  message,
  onCreate,
  onApprove,
  onRequestChanges,
  smartApplication,
  smartApplicationStatus,
  smartApplicationMessage,
  onPrepareApplication,
  onCreateAnotherVersion
}: {
  analysis: ProfileJobMatchAnalysis | null;
  packageData: TargetedDocumentPackage | null;
  status: "idle" | "processing" | "ready" | "failed";
  message: string;
  onCreate: () => void;
  onApprove: (documentId: string) => void;
  onRequestChanges: (documentId: string) => void;
  smartApplication: SmartApplicationRecord | null;
  smartApplicationStatus: "idle" | "processing" | "ready" | "failed";
  smartApplicationMessage: string;
  onPrepareApplication: () => void;
  onCreateAnotherVersion: () => void;
}) {
  if (!analysis) return null;
  const copy = targetedDocumentsCopy.en;
  const isBusy = status === "processing";
  return (
    <section className="pathzy-status-info mb-5 rounded-[24px] border p-4 md:p-5" aria-labelledby="targeted-documents-title">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="pathzy-eyebrow-accent text-xs font-extrabold uppercase tracking-[0.14em]">{copy.title}</p>
          <h2 id="targeted-documents-title" className="mt-2 text-2xl font-black">Create truthful documents for this job</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            PATHZY selects confirmed evidence from your Professional Identity and this job match. Targeting means better positioning, not invented experience.
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-extrabold text-white/70">
          {copy.reviewRequired}
        </span>
      </div>

      {!packageData ? (
        <div className="mt-4 grid gap-3 rounded-[18px] border border-white/10 bg-black/14 p-4">
          <p className="text-sm leading-6 text-white/62">{copy.noAutoSend}</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={onCreate}
              className="pathzy-control-primary px-5 py-3 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? "Preparing documents..." : copy.prepare}
            </button>
            <span className="text-sm font-semibold text-white/48">Creates a new targeted CV and document drafts. Your master CV is preserved.</span>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          {packageData.freshness.stale ? (
            <div className="pathzy-status-warning rounded-[18px] border p-4 text-sm font-bold">
              This targeted package may be stale. Create a refreshed version instead of silently rewriting these documents.
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
            <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">{copy.strategy}</p>
              <h3 className="mt-2 text-xl font-black">{packageData.strategy.targetRole}</h3>
              {packageData.strategy.targetOrganization ? <p className="mt-1 text-sm font-bold text-white/50">{packageData.strategy.targetOrganization}</p> : null}
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-white/62">
                <span className="rounded-[14px] bg-white/8 px-3 py-2">{packageData.strategy.selectedEmploymentIds.length} employment records</span>
                <span className="rounded-[14px] bg-white/8 px-3 py-2">{packageData.strategy.selectedSkillIds.length} skills</span>
                <span className="rounded-[14px] bg-white/8 px-3 py-2">{packageData.strategy.emphasizedRequirementIds.length} requirements emphasized</span>
                <span className="rounded-[14px] bg-white/8 px-3 py-2">{packageData.strategy.gapHandling.length} gaps handled</span>
              </div>
              {packageData.unsupportedClaimsBlocked.length ? (
                <div className="mt-4 rounded-[16px] border border-[#ff6b6b]/25 bg-[#ff6b6b]/10 p-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#ffc5c5]">Unsupported claims blocked</p>
                  <ul className="mt-2 grid gap-1 text-sm leading-6 text-[#ffd8d8]">
                    {packageData.unsupportedClaimsBlocked.slice(0, 4).map((claim) => <li key={claim}>- {claim}</li>)}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="rounded-[18px] border border-white/10 bg-black/14 p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/42">{copy.review}</p>
              <div className="mt-3 grid gap-3">
                {packageData.documents.map((document) => (
                  <article key={document.professionalDocumentId} className="rounded-[16px] border border-white/10 bg-white/7 p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-white">{targetedDocumentLabel(document.type)}</p>
                        <p className="mt-1 text-xs font-bold text-white/48">{document.title}</p>
                      </div>
                      <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/60">{approvalLabel(document.approvalState)}</span>
                    </div>
                    {document.warnings.length ? (
                      <ul className="mt-2 grid gap-1 text-xs leading-5 text-[var(--text-secondary)]">
                        {document.warnings.slice(0, 2).map((warning) => <li key={warning}>- {warning}</li>)}
                      </ul>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {document.route ? (
                        <Link href={document.route} className="rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold text-white/70 transition hover:bg-white/14">
                          Open editor
                        </Link>
                      ) : null}
                      <button type="button" disabled={isBusy} onClick={() => onApprove(document.professionalDocumentId)} className="pathzy-control-primary px-4 py-2 text-xs font-extrabold disabled:opacity-60">
                        Approve
                      </button>
                      <button type="button" disabled={isBusy} onClick={() => onRequestChanges(document.professionalDocumentId)} className="rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold text-white/62 disabled:opacity-60">
                        Request changes
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" disabled={smartApplicationStatus === "processing"} onClick={onPrepareApplication} className="pathzy-control-primary px-5 py-3 text-sm font-extrabold transition disabled:opacity-60">
              {smartApplicationStatus === "processing" ? "Preparing application..." : "Prepare Application"}
            </button>
            <button type="button" disabled={isBusy} onClick={onCreate} className="rounded-full bg-white/10 px-5 py-3 text-sm font-extrabold text-white/64 transition hover:bg-white/14 disabled:opacity-60">
              {copy.createNewVersion}
            </button>
            <button type="button" disabled={smartApplicationStatus === "processing"} onClick={onCreateAnotherVersion} className="rounded-full bg-white/10 px-5 py-3 text-sm font-extrabold text-white/64 transition hover:bg-white/14 disabled:opacity-60">
              Create another application version
            </button>
            <span className="rounded-full bg-white/10 px-4 py-3 text-sm font-bold text-white/54">No application is sent automatically.</span>
          </div>
          {smartApplication ? (
            <div className="pathzy-status-success rounded-[18px] border p-4">
              <p className="text-sm font-extrabold">Application Workspace is ready.</p>
              <p className="mt-1 text-sm leading-6 text-white/60">Review the package checklist, approve documents, and mark as applied only after you submit externally.</p>
              <Link href={`${appRoutes.applications}?applicationId=${encodeURIComponent(smartApplication.id)}`} className="pathzy-control-primary mt-3 inline-flex px-4 py-2 text-sm font-extrabold">
                Open Application Workspace
              </Link>
            </div>
          ) : null}
        </div>
      )}

      {message ? (
        <p className={`mt-4 rounded-[16px] border px-4 py-3 text-sm font-bold ${status === "failed" ? "pathzy-status-danger" : "pathzy-status-success"}`}>
          {message}
        </p>
      ) : null}
      {smartApplicationMessage ? (
        <p className={`mt-4 rounded-[16px] border px-4 py-3 text-sm font-bold ${smartApplicationStatus === "failed" ? "pathzy-status-danger" : "pathzy-status-success"}`}>
          {smartApplicationMessage}
        </p>
      ) : null}
    </section>
  );
}

function JobIntelligencePanel({ analysis }: { analysis: JobMatchAnalysis }) {
  const copy = jobIntelligenceCopy[analysis.job.language];
  return (
    <div className="pathzy-status-info mt-4 rounded-[20px] border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="pathzy-eyebrow-accent text-xs font-extrabold uppercase tracking-[0.14em]">{copy.title}</p>
          <h4 className="mt-2 text-lg font-black text-white">{analysis.headline}</h4>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">{copy.subtitle}</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-extrabold text-white/72">
          {copy.suitability[analysis.suitability]}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-[16px] border border-white/10 bg-black/12 p-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">{copy.strengths}</p>
          <p className="mt-2 text-2xl font-black text-white">{analysis.strengths.length}</p>
          <p className="mt-1 text-xs leading-5 text-white/52">{analysis.strengths[0]?.requirement.text ?? "Complete your profile to unlock evidence-based matches."}</p>
        </div>
        <div className="rounded-[16px] border border-white/10 bg-black/12 p-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">{copy.gaps}</p>
          <p className="mt-2 text-2xl font-black text-white">{analysis.gaps.length}</p>
          <p className="mt-1 text-xs leading-5 text-white/52">{analysis.gaps[0]?.action ?? "No major gap detected from the confirmed profile."}</p>
        </div>
        <div className="rounded-[16px] border border-white/10 bg-black/12 p-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/42">{copy.uncertain}</p>
          <p className="mt-2 text-2xl font-black text-white">{analysis.uncertainties.length}</p>
          <p className="mt-1 text-xs leading-5 text-white/52">{analysis.questionsForUser[0] ?? "Review before applying. PATHZY will not send applications for you."}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={analysis.nextActions[1]?.route ?? "/professional-identity/cv"} className="pathzy-control-primary px-4 py-2 text-sm font-extrabold transition">
          {copy.prepareCv}
        </Link>
        <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white/58">User reviews before applying</span>
      </div>
    </div>
  );
}
