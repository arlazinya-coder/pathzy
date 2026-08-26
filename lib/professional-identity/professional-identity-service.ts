import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeCoverLetterTemplate, normalizeCvModelForExport, serializeCoverLetterData, serializeCvModel } from "@/components/professional-identity/document-downloads";
import type { CoverLetterData, CvModel } from "@/components/professional-identity/document-downloads";
import type { GeneratedRoadmap } from "@/lib/discovery/types";
import { canAccessFeature, userCanAccessFeature } from "@/lib/access/entitlements";
import { canExportProfessionalDocuments } from "@/lib/navigation/permissions";
import { getBrainContextForAI } from "@/lib/pathzy-brain/brain-service";
import { createCanonicalCvDocument, legacyCvCompatibilityMetadata, type CanonicalCvDocumentResult } from "@/lib/professional-documents";
import { documentTemplateGallery, normalizeDocumentTemplate } from "@/lib/professional-identity/document-template-engine";
import type { PremiumDocumentTemplate } from "@/lib/professional-identity/document-template-engine";
import type { ImportedCvResult } from "@/lib/professional-identity/cv-import";
import {
  coverLetterDataFromProfessionalIdentity,
  type CoverLetterJobContext
} from "@/lib/professional-identity/professional-identity-cover-letter-model";
import {
  linkedinProfileModelFromProfessionalIdentity,
  serializeLinkedInProfileModel
} from "@/lib/professional-identity/professional-identity-linkedin-model";
import { professionalIdentityValuesFromSources } from "@/lib/professional-identity/professional-identity-completion";
import type {
  GenerateOptions,
  GeneratedProfessionalDocument,
  ProfessionalIdentityContext,
  ProfessionalIdentityInputs,
  ProfessionalIdentityLabel,
  ProfessionalIdentityRecord,
  ProfessionalIdentityScore,
  ProfessionalLanguage,
  ProfessionalStatus
} from "@/lib/professional-identity/professional-identity-types";
import { formatRecruiterBullet, prepareForProfessionalDocument, professionalizeUserInput } from "@/lib/writing/user-text";

type Supabase = SupabaseClient;
type StoredDocumentType = "cv" | "cover_letter" | "linkedin_profile" | "recruiter_message" | "follow_up_email" | "career_passport" | "old_cv";

export const premiumDocumentTemplates = documentTemplateGallery;

function normalizeTemplate(value: unknown): PremiumDocumentTemplate {
  return normalizeDocumentTemplate(value);
}

function documentTypeForTool(tool: GeneratedProfessionalDocument["tool"]): StoredDocumentType {
  if (tool === "cover-letter") return "cover_letter";
  if (tool === "linkedin") return "linkedin_profile";
  if (tool === "recruiter-message") return "recruiter_message";
  if (tool === "follow-up") return "follow_up_email";
  if (tool === "career-passport") return "career_passport";
  return "cv";
}

const defaultIdentity = (userId: string): ProfessionalIdentityRecord => ({
  user_id: userId,
  language: "english",
  professional_identity_score: 0,
  cv_status: "not_started",
  cover_letter_status: "not_started",
  linkedin_status: "not_started",
  portfolio_status: "not_started",
  career_passport_status: "not_started",
  next_action: "Build your first CV from your PATHZY profile."
});

function normalizeLanguage(value: unknown): ProfessionalLanguage {
  return value === "french" ? "french" : "english";
}

function normalizeStatus(value: unknown): ProfessionalStatus {
  return value === "ready" || value === "improving" || value === "draft" ? value : "not_started";
}

function normalizeIdentity(row: any, userId: string): ProfessionalIdentityRecord {
  if (!row) return defaultIdentity(userId);

  return {
    id: row.id,
    user_id: row.user_id ?? userId,
    language: normalizeLanguage(row.language),
    professional_identity_score: row.professional_identity_score ?? 0,
    cv_status: normalizeStatus(row.cv_status),
    cover_letter_status: normalizeStatus(row.cover_letter_status),
    linkedin_status: normalizeStatus(row.linkedin_status),
    portfolio_status: normalizeStatus(row.portfolio_status),
    career_passport_status: normalizeStatus(row.career_passport_status),
    next_action: row.next_action ?? "Build your first CV from your PATHZY profile.",
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function scoreLabel(score: number): ProfessionalIdentityLabel {
  if (score <= 30) return "Not Started";
  if (score <= 50) return "Needs Work";
  if (score <= 70) return "Improving";
  if (score <= 85) return "Recruiter Ready";
  return "Strong Professional Identity";
}

export function canUseProfessionalIdentityTools(profile: { plan?: string | null; premium_status?: string | null; founder?: boolean | null; is_admin?: boolean | null } | null) {
  return canAccessFeature({
    userId: "",
    accessLevel: "free",
    status: "active",
    isFounder: Boolean(profile?.founder),
    isAdmin: Boolean(profile?.is_admin),
    isBetaFull: false,
    isTrial: false,
    isPaid: Boolean(["starter", "pro", "premium", "enterprise"].includes(profile?.plan ?? "") || ["starter", "pro", "premium", "enterprise"].includes(profile?.premium_status ?? "")),
    startsAt: null,
    expiresAt: null,
    badge: profile?.founder ? "FOUNDING TESTER" : "PATHZY Member",
    message: null
  }, "professional_identity");
}

export async function canCurrentUserUseProfessionalIdentityTools(supabase: Supabase, userId: string) {
  return Boolean(userId) && userCanAccessFeature(supabase, userId, "professional_identity");
}

export async function canCurrentUserExportProfessionalDocuments(supabase: Supabase, userId: string) {
  void supabase;
  return canExportProfessionalDocuments({ isAuthenticated: Boolean(userId) });
}

function firstString(value: unknown, fallback = "Not provided") {
  if (typeof value === "string" && value.trim()) return professionalizeUserInput(value);
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string" && item.trim()).map((item) => professionalizeUserInput(item)).slice(0, 5).join(", ") || fallback;
  return fallback;
}

function getRecommendedCareers(roadmap: GeneratedRoadmap | null) {
  return roadmap?.career_paths?.map((path) => path.title).filter(Boolean).slice(0, 3) ?? [];
}

function collectSkills(inputs: ProfessionalIdentityInputs) {
  const roadmapSkills = inputs.roadmap?.career_paths?.flatMap((path) => path.skills ?? []) ?? [];
  const answerSkills = firstString(inputs.discoveryAnswers?.currentSkills ?? inputs.discoveryAnswers?.skills, "").split(",").map((skill) => skill.trim()).filter(Boolean);
  return Array.from(new Set([...answerSkills, ...roadmapSkills, ...inputs.skillGaps.map((gap) => gap.missing_skill)])).slice(0, 10);
}

function careerGoal(inputs: ProfessionalIdentityInputs) {
  return inputs.brain?.career_goal ?? getRecommendedCareers(inputs.roadmap)[0] ?? firstString(inputs.discoveryAnswers?.preferred_career_direction, "Career direction in progress");
}

function userName(inputs: ProfessionalIdentityInputs) {
  return professionalizeUserInput(inputs.profile?.full_name) || "Add your full name";
}

function cvCandidateName(inputs: ProfessionalIdentityInputs) {
  return professionalizeUserInput(inputs.profile?.full_name) || "";
}

async function saveUnifiedDocument(
  supabase: Supabase,
  userId: string,
  document: GeneratedProfessionalDocument,
  templateName: string | null,
  extra: Record<string, unknown> = {}
) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("user_documents")
    .upsert(
      {
        user_id: userId,
        document_type: documentTypeForTool(document.tool),
        document_title: document.title,
        template_name: templateName,
        content_json: {
          tool: document.tool,
          score: document.score ?? null,
          fields: document.fields ?? null,
          legacy_document_id: document.id ?? null,
          ...(document.contentJson ?? {}),
          ...extra
        },
        content_text: document.content,
        status: "draft",
        version_number: 1,
        updated_at: now
      },
      { onConflict: "id" }
    )
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[professional-identity] user_documents save failed", error);
    throw error;
  }

  return { ...document, id: data?.id ?? document.id };
}

async function getInputs(supabase: Supabase, userId: string): Promise<ProfessionalIdentityInputs> {
  const [{ data: profile }, { data: discovery }, brainContext] = await Promise.all([
    supabase.from("user_profiles").select("full_name,email,phone,country,city,age,education,current_status,employment_status,founder,premium,career_goal,linkedin_url,portfolio_url,field_of_study,highest_qualification,language,updated_at").or(`user_id.eq.${userId},id.eq.${userId}`).maybeSingle(),
    supabase
      .from("discovery_responses")
      .select("answers,generated_result")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getBrainContextForAI(supabase, userId)
  ]);

  return {
    profile: profile ?? null,
    discoveryAnswers: (discovery?.answers as Record<string, unknown> | null) ?? null,
    roadmap: (discovery?.generated_result as GeneratedRoadmap | null) ?? null,
    brain: brainContext.brain,
    readiness: brainContext.readiness,
    skillGaps: brainContext.skillGaps
  };
}

export async function getOrCreateProfessionalIdentity(supabase: Supabase, userId: string): Promise<ProfessionalIdentityRecord> {
  const { data } = await supabase.from("professional_identity").select("*").eq("user_id", userId).maybeSingle();
  if (data) return normalizeIdentity(data, userId);

  const defaults = defaultIdentity(userId);
  const { data: created } = await supabase
    .from("professional_identity")
    .upsert(
      {
        user_id: userId,
        language: defaults.language,
        next_action: defaults.next_action
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .maybeSingle();

  return normalizeIdentity(created, userId);
}

async function latestDocuments(supabase: Supabase, userId: string) {
  const [cv, cover, linkedin, recruiter, followUp, passport] = await Promise.all([
    supabase.from("cv_documents").select("title,score,status,content").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("cover_letters").select("title,company,role,status,content").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("linkedin_profiles").select("headline,optimization_score,skills").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("recruiter_messages").select("company,role,status,message").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("follow_up_emails").select("company,role,status,email_content,follow_up_date").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("career_passport_summaries").select("summary,strengths,skills,career_goal").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle()
  ]);

  return {
    latest_cv: cv.data ?? null,
    latest_cover_letter: cover.data ?? null,
    linkedin_profile: linkedin.data ?? null,
    latest_recruiter_message: recruiter.data ?? null,
    latest_follow_up_email: followUp.data ?? null,
    career_passport: passport.data ?? null
  };
}

export async function calculateProfessionalIdentityScore(supabase: Supabase, userId: string): Promise<ProfessionalIdentityScore> {
  const [identity, docs, inputs] = await Promise.all([getOrCreateProfessionalIdentity(supabase, userId), latestDocuments(supabase, userId), getInputs(supabase, userId)]);
  const skills = collectSkills(inputs);
  const cvReadiness = docs.latest_cv ? Math.min(25, 15 + Math.round((docs.latest_cv.score ?? 60) / 10)) : 0;
  const coverLetterReadiness = docs.latest_cover_letter ? 15 : 0;
  const linkedinReadiness = docs.linkedin_profile ? Math.min(20, Math.round((docs.linkedin_profile.optimization_score ?? 70) / 5)) : 0;
  const skillsPresentation = Math.min(15, skills.length * 2);
  const careerClarity = inputs.brain?.career_goal || inputs.roadmap ? 10 : 0;
  const applicationReadiness = (docs.latest_recruiter_message ? 5 : 0) + (docs.latest_follow_up_email ? 5 : 0);
  const professionalTone = docs.latest_cv || docs.latest_cover_letter || docs.linkedin_profile ? 5 : 0;
  const totalScore = Math.min(100, cvReadiness + coverLetterReadiness + linkedinReadiness + skillsPresentation + careerClarity + applicationReadiness + professionalTone);
  const weaknesses = [
    !docs.latest_cv ? "Create a clear, honest CV." : "",
    !docs.linkedin_profile ? "Optimize your LinkedIn profile manually with stronger positioning." : "",
    !docs.latest_cover_letter ? "Prepare a reusable cover letter draft." : "",
    skills.length < 5 ? "Present more relevant skills from your career plan." : ""
  ].filter(Boolean);
  const strengths = [
    docs.latest_cv ? "CV draft exists" : "",
    docs.linkedin_profile ? "LinkedIn positioning started" : "",
    inputs.brain?.career_goal ? "Career goal is clear" : "",
    skills.length >= 5 ? "Skills are becoming visible" : ""
  ].filter(Boolean);
  const nextRecommendedAction = weaknesses[0] ?? "Tailor your CV and cover letter to the next opportunity you apply for.";

  const nextIdentity = {
    ...identity,
    professional_identity_score: totalScore,
    cv_status: docs.latest_cv ? "draft" : identity.cv_status,
    cover_letter_status: docs.latest_cover_letter ? "draft" : identity.cover_letter_status,
    linkedin_status: docs.linkedin_profile ? "draft" : identity.linkedin_status,
    career_passport_status: docs.career_passport ? "draft" : identity.career_passport_status,
    next_action: nextRecommendedAction,
    updated_at: new Date().toISOString()
  };

  await supabase.from("professional_identity").upsert(nextIdentity, { onConflict: "user_id" });

  return {
    totalScore,
    label: scoreLabel(totalScore),
    strengths: strengths.length ? strengths : ["You have started your PATHZY profile."],
    weaknesses: weaknesses.length ? weaknesses : ["Keep tailoring documents to real opportunities."],
    nextRecommendedAction,
    categoryScores: {
      cv_readiness: cvReadiness,
      cover_letter_readiness: coverLetterReadiness,
      linkedin_readiness: linkedinReadiness,
      skills_presentation: skillsPresentation,
      career_clarity: careerClarity,
      application_readiness: applicationReadiness,
      professional_tone: professionalTone
    }
  };
}

async function refreshIdentity(supabase: Supabase, userId: string) {
  await calculateProfessionalIdentityScore(supabase, userId);
  return getOrCreateProfessionalIdentity(supabase, userId);
}

function cvPurposeFromType(value: string | undefined) {
  const lower = (value ?? "").toLowerCase();
  if (lower.includes("graduate") || lower.includes("intern") || lower.includes("entry")) return "early_career";
  if (lower.includes("career change")) return "career_change";
  if (lower.includes("professional")) return "experienced";
  return "general";
}

function jobDescriptionFocus(value?: string) {
  const clean = prepareForProfessionalDocument(value ?? "").professional;
  if (!clean) return "";
  const lower = clean.toLowerCase();
  const matches = [
    /data|analytics|sql|excel|report/.test(lower) ? "working with data, reporting, and practical analysis" : "",
    /customer|client|support|service/.test(lower) ? "supporting customers with clear communication and reliability" : "",
    /design|figma|ux|ui|brand/.test(lower) ? "creating thoughtful user-facing work with attention to detail" : "",
    /sales|marketing|social|content/.test(lower) ? "communicating value clearly and understanding customer needs" : "",
    /admin|operations|coordinat|organis/.test(lower) ? "staying organized, following process, and supporting daily operations" : "",
    /learn|intern|graduate|junior|entry/.test(lower) ? "learning quickly while contributing with consistency and humility" : ""
  ].filter(Boolean);
  return matches[0] ?? "understanding the role requirements and contributing with care";
}

function listFromGenerateOption(value?: string) {
  return prepareForProfessionalDocument(value || "")
    .professional
    .split(/\r?\n|;|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export async function generateCV(supabase: Supabase, userId: string, options: GenerateOptions = {}): Promise<GeneratedProfessionalDocument> {
  const inputs = await getInputs(supabase, userId);
  const language = normalizeLanguage(options.language ?? inputs.brain?.language);
  const templateName = normalizeTemplate(options.templateName);
  const cvType = options.cvType ?? "Entry-Level CV";
  const goal = prepareForProfessionalDocument(careerGoal(inputs)).professional;
  const skills = collectSkills(inputs);
  const education = professionalizeUserInput(inputs.profile?.education || inputs.profile?.highest_qualification || firstString(inputs.discoveryAnswers?.educationLevel ?? inputs.discoveryAnswers?.education, ""));
  const oldCvText = prepareForProfessionalDocument(options.oldCvText || "").professional;
  let canonicalDocument: CanonicalCvDocumentResult | null = null;
  try {
    canonicalDocument = await createCanonicalCvDocument(supabase, {
      userId,
      name: `${templateName} ${cvType}`,
      purpose: cvPurposeFromType(cvType),
      language: language === "french" ? "fr" : "en",
      targetRole: goal,
      templateId: templateName
    });
  } catch (error) {
    console.warn("[professional-documents] canonical CV view unavailable; using legacy-compatible CV generation", {
      userId,
      message: error instanceof Error ? error.message : "unknown"
    });
  }
  const canonicalCvModel = canonicalDocument?.cvModel;
  const cvModel: CvModel = {
    fullName: cvCandidateName(inputs),
    targetRole: goal,
    phone: canonicalCvModel?.phone || professionalizeUserInput(inputs.profile?.phone),
    email: canonicalCvModel?.email || professionalizeUserInput(inputs.profile?.email),
    city: canonicalCvModel?.city || professionalizeUserInput(inputs.profile?.city),
    country: canonicalCvModel?.country || professionalizeUserInput(inputs.profile?.country),
    linkedIn: canonicalCvModel?.linkedIn || professionalizeUserInput(inputs.profile?.linkedin_url),
    portfolio: canonicalCvModel?.portfolio || professionalizeUserInput(inputs.profile?.portfolio_url),
    github: canonicalCvModel?.github || "",
    website: canonicalCvModel?.website || "",
    professionalSummary: canonicalCvModel?.professionalSummary || (language === "french"
      ? `Professionnel en developpement oriente vers ${goal}, avec une progression active en competences, preuves de portfolio et preparation a l'emploi.`
      : `Early-career professional building practical experience toward ${goal}. Focused on relevant skills, portfolio proof, and stronger career direction.`),
    coreSkills: canonicalCvModel?.coreSkills?.length ? canonicalCvModel.coreSkills : skills,
    technicalSkills: canonicalCvModel?.technicalSkills ?? [],
    professionalSkills: canonicalCvModel?.professionalSkills ?? [],
    professionalExperience: canonicalCvModel?.professionalExperience?.length ? canonicalCvModel.professionalExperience : oldCvText ? [{ role: "Previous CV experience", company: "", location: "", startDate: "", endDate: "", current: false, achievements: [formatRecruiterBullet(oldCvText)] }] : [],
    projects: canonicalCvModel?.projects?.length ? canonicalCvModel.projects : getRecommendedCareers(inputs.roadmap).length ? [{ projectName: `Portfolio focus linked to: ${getRecommendedCareers(inputs.roadmap).join(", ")}`, role: "", tools: [], description: formatRecruiterBullet("built practical proof for selected career direction"), impact: "" }] : [],
    education: canonicalCvModel?.education?.length ? canonicalCvModel.education : education ? [{ qualification: education, institution: "", fieldOfStudy: "", year: "", status: "" }] : [],
    certifications: canonicalCvModel?.certifications ?? [],
    achievements: canonicalCvModel?.achievements ?? [],
    languages: canonicalCvModel?.languages ?? [],
    references: { availableUponRequest: false, items: [] },
    optionalSections: {
      volunteerExperience: [],
      awards: [],
      publications: [],
      conferences: [],
      professionalMemberships: [],
      interests: [],
      portfolioLinks: [],
      qrCodePlaceholder: ""
    }
  };
  const content = serializeCvModel(cvModel);
  const score = Math.min(100, 55 + collectSkills(inputs).length * 3 + (inputs.brain?.career_goal ? 10 : 0));
  const title = `${templateName} ${cvType}${cvCandidateName(inputs) ? ` - ${cvCandidateName(inputs)}` : ""}`;
  const { data } = await supabase.from("cv_documents").insert({ user_id: userId, language, cv_type: cvType, title, content, score, status: "draft" }).select("id").maybeSingle();
  const now = new Date().toISOString();
  const cvVersion = {
    designSystem: templateName,
    versionName: title,
    createdAt: now,
    updatedAt: now,
    lastDownloadedAt: null,
    contentSourceId: data?.id ?? null,
    professionalDocumentId: canonicalDocument?.document.id ?? null
  };
  await refreshIdentity(supabase, userId);
  const professionalDocumentMetadata = canonicalDocument
    ? legacyCvCompatibilityMetadata({
        canonicalProfileId: canonicalDocument.profile.id,
        profileVersion: canonicalDocument.profile.version,
        templateName,
        purpose: cvPurposeFromType(cvType)
      })
    : null;

  return saveUnifiedDocument(supabase, userId, { id: data?.id, tool: "cv", title, content, contentJson: { cvModel, cvVersion }, score }, templateName, { cv_type: cvType, ...(professionalDocumentMetadata ?? {}) });
}

export async function createImportedCvDraft(
  supabase: Supabase,
  userId: string,
  imported: ImportedCvResult,
  templateNameInput?: string
): Promise<GeneratedProfessionalDocument> {
  const templateName = normalizeTemplate(templateNameInput ?? "Atlas Professional");
  const cvModel = normalizeCvModelForExport(imported.cvModel);
  const content = serializeCvModel(cvModel);
  const now = new Date().toISOString();
  const namePart = cvCandidateName({ profile: { full_name: cvModel.fullName }, discoveryAnswers: null, roadmap: null, brain: null, readiness: null, skillGaps: [] });
  const baseFileName = imported.fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  const title = `Imported CV${namePart ? ` - ${namePart}` : baseFileName ? ` - ${baseFileName}` : ""}`;
  const score = Math.min(
    95,
    Math.max(
      35,
      40 +
        imported.counts.skills * 2 +
        imported.counts.workExperiences * 8 +
        imported.counts.educationRecords * 6 +
        imported.counts.projects * 4 +
        imported.counts.certifications * 3
    )
  );
  const { data } = await supabase
    .from("cv_documents")
    .insert({
      user_id: userId,
      language: "english",
      cv_type: "Imported CV",
      title,
      content,
      score,
      status: "draft"
    })
    .select("id")
    .maybeSingle();

  const cvVersion = {
    designSystem: templateName,
    versionName: title,
    createdAt: now,
    updatedAt: now,
    lastDownloadedAt: null,
    contentSourceId: data?.id ?? null
  };

  const uploadedCvRecord = {
    user_id: userId,
    document_type: "old_cv",
    document_title: `Uploaded CV - ${imported.fileName}`,
    template_name: null,
    content_json: {
      source: "uploaded_cv",
      original_file_name: imported.fileName,
      original_file_type: imported.fileType,
      original_file_size: imported.fileSize,
      inspection: imported.inspection ?? null,
      visual_reading: imported.visualReading ?? null,
      semantic_reading: imported.semanticReading ?? null,
      confidence: imported.confidence,
      counts: imported.counts,
      review_items: imported.reviewItems,
      unclassified_items: imported.unclassifiedItems ?? [],
      interpretation: imported.interpretation
        ? {
            coverage: imported.interpretation.coverage,
            warnings: imported.interpretation.warnings
          }
        : null
    },
    content_text: imported.normalizedText,
    status: "ready",
    version_number: 1,
    updated_at: now
  };
  if (imported.uploadDocumentId) {
    await supabase.from("user_documents").update(uploadedCvRecord).eq("id", imported.uploadDocumentId).eq("user_id", userId);
  } else {
    await supabase.from("user_documents").insert(uploadedCvRecord);
  }

  await refreshIdentity(supabase, userId);

  return saveUnifiedDocument(
    supabase,
    userId,
    {
      id: data?.id,
      tool: "cv",
      title,
      content,
      contentJson: {
        cvModel,
        cvVersion,
        cvImport: {
          source: "uploaded_cv",
          fileName: imported.fileName,
          fileType: imported.fileType,
          fileSize: imported.fileSize,
          confidence: imported.confidence,
          inspection: imported.inspection ?? null,
          visualReading: imported.visualReading ?? null,
          semanticReading: imported.semanticReading ?? null,
          counts: imported.counts,
          reviewItems: imported.reviewItems,
          unclassifiedItems: imported.unclassifiedItems ?? [],
          interpretation: imported.interpretation,
          importedAt: now
        }
      },
      score
    },
    templateName,
    { cv_type: "Imported CV" }
  );
}

export async function generateCoverLetter(supabase: Supabase, userId: string, options: GenerateOptions = {}): Promise<GeneratedProfessionalDocument> {
  const inputs = await getInputs(supabase, userId);
  const language = normalizeLanguage(options.language ?? inputs.brain?.language);
  const templateName = normalizeCoverLetterTemplate(options.templateName ?? "PATHZY Signature Letter");
  const company = prepareForProfessionalDocument(options.company || "").professional;
  const role = prepareForProfessionalDocument(options.role || "").professional;
  const tone = prepareForProfessionalDocument(options.tone || "professional").professional.toLowerCase();
  if (!company || !role) {
    throw new Error("A job title and company name are required before PATHZY can generate a tailored cover letter.");
  }
  const descriptionFocus = jobDescriptionFocus(options.jobDescription);
  const requirements = listFromGenerateOption(options.keyRequirements);
  const responsibilities = listFromGenerateOption(options.keyResponsibilities);
  const qualifications = listFromGenerateOption(options.qualifications);
  const jobContext: CoverLetterJobContext = {
    source: options.jobDescription ? "pasted_job_description" : "manual",
    company,
    role,
    jobDescription: prepareForProfessionalDocument(options.jobDescription || "").professional,
    location: prepareForProfessionalDocument(options.companyLocation || "").professional,
    hiringManager: prepareForProfessionalDocument(options.recruiterName || "").professional,
    referenceNumber: prepareForProfessionalDocument(options.referenceNumber || "").professional,
    closingDate: prepareForProfessionalDocument(options.closingDate || "").professional,
    url: prepareForProfessionalDocument(options.jobUrl || "").professional,
    requirements: requirements.length ? requirements : descriptionFocus ? [descriptionFocus] : [],
    responsibilities,
    qualifications,
    experienceRequirements: prepareForProfessionalDocument(options.experienceRequirements || "").professional
  };
  const identityValues = professionalIdentityValuesFromSources(inputs.profile, { answers: inputs.discoveryAnswers }, null);
  const coverLetterData: CoverLetterData = coverLetterDataFromProfessionalIdentity(identityValues, jobContext, { templateName, language, tone });
  const content = serializeCoverLetterData(coverLetterData);
  const title = `${templateName} ${coverLetterData.jobTitle} cover letter`;

  const { data } = await supabase.from("cover_letters").insert({ user_id: userId, language, title, company: coverLetterData.companyName, role: coverLetterData.jobTitle, content, status: "draft" }).select("id").maybeSingle();
  await refreshIdentity(supabase, userId);

  return saveUnifiedDocument(
    supabase,
    userId,
    {
      id: data?.id,
      tool: "cover-letter",
      title,
      content,
      contentJson: {
        source: "professional_identity_and_job_context",
        coverLetterData,
        coverLetterVersion: {
          designSystem: coverLetterData.designSystem,
          versionName: title,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          professionalIdentitySource: "canonical_professional_identity",
          jobContext,
          manualOverride: false,
          status: "up_to_date"
        }
      }
    },
    templateName,
    { company: coverLetterData.companyName, role: coverLetterData.jobTitle }
  );
}

export async function generateLinkedInProfile(supabase: Supabase, userId: string, options: GenerateOptions = {}): Promise<GeneratedProfessionalDocument> {
  const inputs = await getInputs(supabase, userId);
  const language = normalizeLanguage(options.language ?? inputs.brain?.language);
  const identityValues = professionalIdentityValuesFromSources(inputs.profile, { answers: inputs.discoveryAnswers }, null);
  const model = linkedinProfileModelFromProfessionalIdentity(identityValues, { language, profileUpdatedAt: inputs.profile?.updated_at ?? null });
  const content = serializeLinkedInProfileModel(model);
  const score = Math.round((model.completeness.completedChecks / model.completeness.totalChecks) * 100);

  const experienceSummary = model.experience.map((item) => item.sourceText).join("\n");
  const { data } = await supabase.from("linkedin_profiles").insert({ user_id: userId, language, headline: model.headline, about: model.about, skills: model.skills, experience_summary: experienceSummary, optimization_score: score }).select("id").maybeSingle();
  await refreshIdentity(supabase, userId);

  return saveUnifiedDocument(
    supabase,
    userId,
    {
      id: data?.id,
      tool: "linkedin",
      title: "LinkedIn profile optimization",
      content,
      score,
      fields: { headline: model.headline, about: model.about, skills: model.skills, experienceSummary },
      contentJson: {
        source: "professional_identity",
        linkedinProfileModel: model,
        linkedInVersion: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          professionalIdentitySource: "canonical_professional_identity",
          professionalIdentityUpdatedAt: inputs.profile?.updated_at ?? null,
          manualOverride: false,
          status: model.profileOptimization.status
        }
      }
    },
    null
  );
}

export async function generateRecruiterMessage(supabase: Supabase, userId: string, options: GenerateOptions = {}): Promise<GeneratedProfessionalDocument> {
  const inputs = await getInputs(supabase, userId);
  const language = normalizeLanguage(options.language ?? inputs.brain?.language);
  const recruiterName = prepareForProfessionalDocument(options.recruiterName || "").professional;
  const company = prepareForProfessionalDocument(options.company || "your company").professional;
  const role = prepareForProfessionalDocument(options.role || careerGoal(inputs)).professional;
  const platform = prepareForProfessionalDocument(options.platform || "LinkedIn").professional;
  const greeting = recruiterName ? (language === "french" ? `Bonjour ${recruiterName}` : `Hi ${recruiterName}`) : language === "french" ? "Bonjour" : "Hi";
  const message =
    language === "french"
      ? `${greeting}, je m'interesse au poste de ${role} chez ${company}. Je construis actuellement mon parcours vers ${careerGoal(inputs)} et j'aimerais savoir si mon profil pourrait correspondre a vos besoins. Je peux partager mon CV et mes projets reels si utile. Merci pour votre temps.`
      : `${greeting}, I am interested in the ${role} role at ${company}. I am currently building my path toward ${careerGoal(inputs)} and would value the chance to understand whether my profile could be a fit. I can share my CV and real project work if helpful. Thank you for your time.`;

  const { data } = await supabase.from("recruiter_messages").insert({ user_id: userId, language, company, recruiter_name: recruiterName || null, role, message, status: "draft" }).select("id").maybeSingle();
  await refreshIdentity(supabase, userId);

  return saveUnifiedDocument(supabase, userId, { id: data?.id, tool: "recruiter-message", title: `${platform} recruiter message`, content: message }, null, { company, role });
}

export async function generateFollowUpEmail(supabase: Supabase, userId: string, options: GenerateOptions = {}): Promise<GeneratedProfessionalDocument> {
  const inputs = await getInputs(supabase, userId);
  const language = normalizeLanguage(options.language ?? inputs.brain?.language);
  const company = prepareForProfessionalDocument(options.company || "the company").professional;
  const role = prepareForProfessionalDocument(options.role || careerGoal(inputs)).professional;
  const applicationDate = prepareForProfessionalDocument(options.applicationDate || new Date().toISOString().slice(0, 10)).professional;
  const followUpDate = new Date(Date.parse(applicationDate) + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const greeting = options.recruiterName ? (language === "french" ? `Bonjour ${options.recruiterName}` : `Hello ${options.recruiterName}`) : language === "french" ? "Bonjour" : "Hello";
  const emailContent =
    language === "french"
      ? `${greeting},\n\nJe vous contacte pour faire un suivi de ma candidature au poste de ${role} chez ${company}, envoyee le ${applicationDate}. Je reste tres interesse par cette opportunite et serais heureux de partager toute information supplementaire sur mon parcours reel, mes projets ou mes competences.\n\nMerci pour votre temps.\n\nCordialement,\n${userName(inputs)}`
      : `${greeting},\n\nI am following up on my application for the ${role} role at ${company}, submitted on ${applicationDate}. I remain very interested in the opportunity and would be glad to share any additional information about my real experience, projects, or skills.\n\nThank you for your time.\n\nKind regards,\n${userName(inputs)}`;

  const { data } = await supabase.from("follow_up_emails").insert({ user_id: userId, language, company, role, email_content: emailContent, follow_up_date: followUpDate, status: "draft" }).select("id").maybeSingle();
  await refreshIdentity(supabase, userId);

  return saveUnifiedDocument(supabase, userId, { id: data?.id, tool: "follow-up", title: `${role} follow-up email`, content: emailContent, followUpDate }, null, { company, role, follow_up_date: followUpDate });
}

export async function generateCareerPassportSummary(supabase: Supabase, userId: string, options: GenerateOptions = {}): Promise<GeneratedProfessionalDocument> {
  const inputs = await getInputs(supabase, userId);
  const language = normalizeLanguage(options.language ?? inputs.brain?.language);
  const identityScore = await calculateProfessionalIdentityScore(supabase, userId);
  const skills = collectSkills(inputs).slice(0, 8);
  const strengths = inputs.readiness?.topStrengths?.slice(0, 5) ?? identityScore.strengths;
  const summary =
    language === "french"
      ? `Objectif de carriere: ${prepareForProfessionalDocument(careerGoal(inputs)).professional}\nScore d'employabilite: ${inputs.readiness?.totalScore ?? 0}/100\nScore d'identite professionnelle: ${identityScore.totalScore}/100\nCompetences principales: ${skills.join(", ") || "A completer"}\nForces: ${strengths.join(", ")}\nProjets: Ajoutez vos projets reels et preuves de travail.\nRealisations: Ajoutez uniquement des resultats reels.\nFocus actuel: ${inputs.readiness?.todayPriority ?? identityScore.nextRecommendedAction}\nProchaine action: ${identityScore.nextRecommendedAction}`
      : `Career goal: ${prepareForProfessionalDocument(careerGoal(inputs)).professional}\nEmployment readiness score: ${inputs.readiness?.totalScore ?? 0}/100\nProfessional identity score: ${identityScore.totalScore}/100\nTop skills: ${skills.join(", ") || "To be completed"}\nStrengths: ${strengths.join(", ")}\nProjects: Add your real projects and proof of work.\nAchievements: Add only real outcomes.\nCurrent focus: ${inputs.readiness?.todayPriority ?? identityScore.nextRecommendedAction}\nNext action: ${identityScore.nextRecommendedAction}`;

  const { data } = await supabase.from("career_passport_summaries").insert({
    user_id: userId,
    language,
    summary,
    strengths,
    skills,
    career_goal: careerGoal(inputs),
    readiness_snapshot: {
      employment_readiness_score: inputs.readiness?.totalScore ?? 0,
      professional_identity_score: identityScore.totalScore,
      label: identityScore.label
    }
  }).select("id").maybeSingle();
  await refreshIdentity(supabase, userId);

  return saveUnifiedDocument(supabase, userId, { id: data?.id, tool: "career-passport", title: "Career Passport Summary", content: summary, score: identityScore.totalScore }, null);
}

export async function getProfessionalIdentityContext(supabase: Supabase, userId: string): Promise<ProfessionalIdentityContext> {
  const [identity, score, docs] = await Promise.all([
    getOrCreateProfessionalIdentity(supabase, userId),
    calculateProfessionalIdentityScore(supabase, userId),
    latestDocuments(supabase, userId)
  ]);

  return {
    identity: { ...identity, professional_identity_score: score.totalScore, next_action: score.nextRecommendedAction },
    score,
    ...docs
  };
}
