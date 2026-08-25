import { ProfessionalIdentityTool } from "@/components/professional-identity/professional-identity-tool";
import { PATHZY_ROUTES, appRoutes, routeBuilders } from "@/lib/navigation/routes";
import {
  professionalIdentityCoverLetterDocument,
  professionalIdentityCoverLetterSyncStatus,
  type CoverLetterJobContext
} from "@/lib/professional-identity/professional-identity-cover-letter-model";
import { canCurrentUserExportProfessionalDocuments, canCurrentUserUseProfessionalIdentityTools } from "@/lib/professional-identity/professional-identity-service";
import { getProfessionalIdentityReadModelSafe } from "@/lib/professional-identity/professional-identity-read-service";
import type { GeneratedProfessionalDocument } from "@/lib/professional-identity/professional-identity-types";
import { requireAuthenticatedUser } from "@/lib/supabase/server";

type CoverLetterSearchParams = {
  role?: string;
  company?: string;
  jobDescription?: string;
  applicationId?: string;
  jobId?: string;
  documentId?: string;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function jsonList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        return cleanText(record.text ?? record.label ?? record.name ?? record.description ?? record.requirement ?? record.responsibility);
      }
      return "";
    })
    .filter(Boolean);
}

function latestDate(...values: unknown[]) {
  return values.map(cleanText).filter(Boolean).sort().at(-1) ?? null;
}

async function loadExistingCoverLetterDocument(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>["supabase"],
  userId: string,
  documentId?: string
): Promise<GeneratedProfessionalDocument | null> {
  if (!documentId) return null;
  const { data, error } = await supabase
    .from("user_documents")
    .select("id,document_title,content_text,content_json,template_name,updated_at,created_at")
    .eq("user_id", userId)
    .eq("id", documentId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    tool: "cover-letter",
    title: data.document_title ?? "Cover Letter",
    content: data.content_text ?? "",
    contentJson: data.content_json ?? null,
    template_name: data.template_name ?? null,
    updated_at: data.updated_at ?? data.created_at ?? null,
    created_at: data.created_at ?? null
  };
}

async function loadJobUnderstandingContext(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>["supabase"],
  userId: string,
  jobId?: string
): Promise<CoverLetterJobContext | null> {
  if (!jobId) return null;
  const { data, error } = await supabase
    .from("job_understandings")
    .select("id,job_title,organization,location,employment_type,work_arrangement,summary,responsibilities_json,requirements_json,application_details_json,updated_at")
    .eq("user_id", userId)
    .eq("id", jobId)
    .maybeSingle();
  if (error || !data) return null;
  const applicationDetails = data.application_details_json && typeof data.application_details_json === "object" ? data.application_details_json as Record<string, unknown> : {};
  return {
    source: "saved_job",
    jobId: data.id,
    company: cleanText(data.organization),
    role: cleanText(data.job_title),
    jobDescription: cleanText(data.summary),
    location: cleanText(data.location),
    employmentType: cleanText(data.employment_type),
    workArrangement: cleanText(data.work_arrangement),
    hiringManager: cleanText(applicationDetails.hiringManager ?? applicationDetails.recruiter ?? applicationDetails.contact),
    applicationInstructions: cleanText(applicationDetails.instructions ?? applicationDetails.applicationInstructions),
    requirements: jsonList(data.requirements_json),
    responsibilities: jsonList(data.responsibilities_json),
    referenceNumber: cleanText(applicationDetails.referenceNumber ?? applicationDetails.reference ?? applicationDetails.jobReference),
    closingDate: cleanText(applicationDetails.closingDate ?? applicationDetails.deadline),
    url: cleanText(applicationDetails.url ?? applicationDetails.jobUrl ?? applicationDetails.link),
    updatedAt: data.updated_at ?? null
  };
}

async function loadJobImportContext(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>["supabase"],
  userId: string,
  jobId?: string
): Promise<CoverLetterJobContext | null> {
  if (!jobId) return null;
  const { data, error } = await supabase
    .from("job_imports")
    .select("id,source_url,raw_text,normalized_text,preliminary_details_json,inspection_json,updated_at")
    .eq("user_id", userId)
    .eq("id", jobId)
    .maybeSingle();
  if (error || !data) return null;

  const details = data.preliminary_details_json && typeof data.preliminary_details_json === "object" ? data.preliminary_details_json as Record<string, unknown> : {};
  const inspection = data.inspection_json && typeof data.inspection_json === "object" ? data.inspection_json as Record<string, unknown> : {};
  return {
    source: "saved_job",
    jobId: data.id,
    company: cleanText(details.organisation ?? details.organization ?? details.company),
    role: cleanText(details.jobTitle ?? details.title ?? details.role),
    jobDescription: cleanText(data.normalized_text ?? data.raw_text),
    location: cleanText(details.location),
    employmentType: cleanText(details.employmentType),
    workArrangement: cleanText(details.workArrangement),
    applicationInstructions: cleanText(details.applicationInstructions),
    requirements: jsonList(inspection.requirements),
    responsibilities: jsonList(inspection.responsibilities),
    referenceNumber: cleanText(details.referenceNumber ?? details.reference ?? details.jobReference),
    closingDate: cleanText(details.closingDate),
    url: cleanText(data.source_url ?? details.url ?? details.jobUrl ?? details.applicationUrl),
    updatedAt: data.updated_at ?? null
  };
}

async function loadApplicationContext(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>["supabase"],
  userId: string,
  applicationId?: string
): Promise<CoverLetterJobContext | null> {
  if (!applicationId) return null;
  const { data, error } = await supabase
    .from("employment_applications")
    .select("id,company_name,role,notes,closing_date,interview_date,next_action,updated_at")
    .eq("user_id", userId)
    .eq("id", applicationId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    source: "application",
    applicationId: data.id,
    company: cleanText(data.company_name),
    role: cleanText(data.role),
    jobDescription: cleanText(data.notes),
    closingDate: cleanText(data.closing_date),
    applicationInstructions: cleanText(data.next_action),
    updatedAt: latestDate(data.updated_at, data.closing_date, data.interview_date)
  };
}

async function resolveCoverLetterJobContext(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>["supabase"],
  userId: string,
  params: CoverLetterSearchParams
): Promise<CoverLetterJobContext> {
  const applicationContext = await loadApplicationContext(supabase, userId, params.applicationId);
  if (applicationContext) return applicationContext;
  const jobContext = await loadJobUnderstandingContext(supabase, userId, params.jobId);
  if (jobContext) return jobContext;
  const jobImportContext = await loadJobImportContext(supabase, userId, params.jobId);
  if (jobImportContext) return jobImportContext;
  const company = cleanText(params.company);
  const role = cleanText(params.role);
  const jobDescription = cleanText(params.jobDescription);
  if (jobDescription) return { source: "pasted_job_description", company, role, jobDescription };
  if (company || role) return { source: "manual", company, role };
  return { source: "missing" };
}

export default async function CoverLetterPage({ searchParams }: { searchParams?: Promise<CoverLetterSearchParams> }) {
  const { user, supabase } = await requireAuthenticatedUser("/professional-identity/cover-letter");
  const params = searchParams ? await searchParams : {};
  const [unlocked, canExport, identity, jobContext, savedDocument] = await Promise.all([
    canCurrentUserUseProfessionalIdentityTools(supabase, user.id),
    canCurrentUserExportProfessionalDocuments(supabase, user.id),
    getProfessionalIdentityReadModelSafe(supabase, user, "cover letter professional identity"),
    resolveCoverLetterJobContext(supabase, user.id, params),
    loadExistingCoverLetterDocument(supabase, user.id, params.documentId)
  ]);
  const initialDocument = savedDocument ?? professionalIdentityCoverLetterDocument(identity.values, jobContext, {
    templateName: "PATHZY Signature Letter",
    lastUpdated: identity.profile?.updated_at ?? null,
    documentId: params.documentId,
    language: identity.values.professional_document_language === "french" ? "french" : "english",
    tone: "professional"
  });
  const coverLetterSyncStatus = professionalIdentityCoverLetterSyncStatus(identity.values, jobContext, {
    lastUpdated: initialDocument?.updated_at ?? null,
    profileUpdatedAt: identity.profile?.updated_at ?? null,
    manualOverride: Boolean(savedDocument?.contentJson && (savedDocument.contentJson as Record<string, unknown>).coverLetterVersion && ((savedDocument.contentJson as Record<string, unknown>).coverLetterVersion as Record<string, unknown>).manualOverride)
  });
  const jobHref = jobContext.applicationId
    ? routeBuilders.applicationDetail(jobContext.applicationId, appRoutes.professionalIdentityCoverLetter)
    : jobContext.jobId
      ? routeBuilders.jobMatch(jobContext.jobId, appRoutes.professionalIdentityCoverLetter)
      : PATHZY_ROUTES.FIND_OPPORTUNITIES;

  return (
    <div className="page-pad mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-8">
      <ProfessionalIdentityTool
        tool="cover-letter"
        title="My Cover Letter"
        description="Choose the opportunity and document preferences. PATHZY uses your Professional Identity for factual details."
        trustNote="PATHZY strengthens your wording but does not add experience you do not have."
        locked={!unlocked}
        exportLocked={!canExport}
        initialDocument={initialDocument}
        coverLetterSyncStatus={coverLetterSyncStatus}
        coverLetterJobHref={jobHref}
        guidance={coverLetterSyncStatus.status === "missing_information" && coverLetterSyncStatus.missingSections[0] ? {
          recommendation: "Your cover letter needs a little more information.",
          why: `${coverLetterSyncStatus.missingSections[0].label}: ${coverLetterSyncStatus.missingSections[0].missingFields.join(", ")}`,
          impact: "Stronger factual grounding",
          followHref: coverLetterSyncStatus.missingSections[0].href,
          followLabel: `Edit ${coverLetterSyncStatus.missingSections[0].label}`,
          continueLabel: "Return to Cover Letter"
        } : null}
        defaultOptions={{
          role: jobContext.role ?? params.role ?? "",
          company: jobContext.company ?? params.company ?? "",
          jobDescription: jobContext.jobDescription ?? params.jobDescription ?? "",
          keyRequirements: (jobContext.requirements ?? []).join("\n"),
          keyResponsibilities: (jobContext.responsibilities ?? []).join("\n"),
          qualifications: (jobContext.qualifications ?? []).join("\n"),
          experienceRequirements: jobContext.experienceRequirements ?? "",
          companyLocation: jobContext.location ?? "",
          recruiterName: jobContext.hiringManager ?? "",
          referenceNumber: jobContext.referenceNumber ?? "",
          closingDate: jobContext.closingDate ?? "",
          jobUrl: jobContext.url ?? "",
          language: identity.values.professional_document_language === "french" ? "french" : "english",
          templateName: initialDocument?.template_name ?? "PATHZY Signature Letter"
        }}
        fields={[
          { name: "company", label: "Company", placeholder: "Example: Flutterwave" },
          { name: "role", label: "Role", placeholder: "Example: Junior Product Designer" },
          { name: "jobDescription", label: "Job description optional", type: "textarea", placeholder: "Paste the job description here" },
          { name: "tone", label: "Tone", type: "select", options: ["professional", "confident", "warm"] }
        ]}
      />
    </div>
  );
}
