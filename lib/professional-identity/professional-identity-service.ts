import type { SupabaseClient } from "@supabase/supabase-js";
import { cvModelFromUnknown, normalizeCoverLetterTemplate, normalizeCvModelForExport, serializeCoverLetterData, serializeCvModel } from "@/components/professional-identity/document-downloads";
import type { CoverLetterData, CvModel } from "@/components/professional-identity/document-downloads";
import type { DiscoveryAnswers, GeneratedRoadmap } from "@/lib/discovery/types";
import { isPremiumUser } from "@/lib/launch/launch-service";
import { canExportProfessionalDocuments, canUseProfessionalIdentity } from "@/lib/navigation/permissions";
import { getBrainContextForAI } from "@/lib/pathzy-brain/brain-service";
import { documentTemplateGallery, normalizeDocumentTemplate } from "@/lib/professional-identity/document-template-engine";
import type { PremiumDocumentTemplate } from "@/lib/professional-identity/document-template-engine";
import type { ImportedCvResult } from "@/lib/professional-identity/cv-import";
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

export function canUseProfessionalIdentityTools(profile: { plan?: string | null; premium_status?: string | null } | null) {
  return canUseProfessionalIdentity({ isAuthenticated: true, membership: profile?.plan, premiumStatus: profile?.premium_status });
}

export async function canCurrentUserUseProfessionalIdentityTools(supabase: Supabase, userId: string) {
  return canUseProfessionalIdentity({ isAuthenticated: Boolean(userId), membership: "free" });
}

export async function canCurrentUserExportProfessionalDocuments(supabase: Supabase, userId: string) {
  return canExportProfessionalDocuments({ isAuthenticated: Boolean(userId), membership: (await isPremiumUser(supabase, userId)) ? "premium" : "free" });
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

function honestExperienceNote(language: ProfessionalLanguage) {
  return language === "french"
    ? "PATHZY ne doit pas inventer d'experience, de formation, de certificats ou de references. Remplacez les sections vides par vos informations reelles."
    : "PATHZY will not invent experience, education, certificates, or references. Replace empty sections with your real information.";
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
    supabase.from("user_profiles").select("full_name,email,phone,country,city,age,education,current_status,employment_status,founder,premium,career_goal,linkedin_url,portfolio_url,field_of_study,highest_qualification,language").or(`user_id.eq.${userId},id.eq.${userId}`).maybeSingle(),
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

async function getLatestCvModel(supabase: Supabase, userId: string) {
  const { data: unified } = await supabase
    .from("user_documents")
    .select("content_json,content_text")
    .eq("user_id", userId)
    .eq("document_type", "cv")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (unified) return cvModelFromUnknown((unified.content_json as Record<string, unknown> | null)?.cvModel, unified.content_text ?? "");

  const { data: legacy } = await supabase
    .from("cv_documents")
    .select("content")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return legacy?.content ? cvModelFromUnknown(null, legacy.content) : null;
}

function firstClean(values: string[]) {
  return values.map((value) => professionalizeUserInput(value)).find(Boolean) ?? "";
}

function coverLetterCvFacts(cv: CvModel | null, fallbackSkills: string[]) {
  if (!cv) {
    return {
      targetRole: "",
      skills: fallbackSkills.slice(0, 4),
      education: "",
      project: "",
      experience: ""
    };
  }

  return {
    targetRole: professionalizeUserInput(cv.targetRole),
    skills: Array.from(new Set([...cv.coreSkills, ...cv.technicalSkills, ...cv.professionalSkills, ...fallbackSkills].map(professionalizeUserInput).filter(Boolean))).slice(0, 5),
    education: firstClean(cv.education.map((item) => [item.qualification, item.fieldOfStudy, item.institution].filter(Boolean).join(" in "))),
    project: firstClean(cv.projects.map((item) => [item.projectName, item.description || item.impact].filter(Boolean).join(": "))),
    experience: firstClean(cv.professionalExperience.map((item) => [item.role, item.company, item.achievements[0]].filter(Boolean).join(" at ")))
  };
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

function toneAdjective(tone: string) {
  if (/warm/i.test(tone)) return "thoughtful";
  if (/confident/i.test(tone)) return "confident";
  return "professional";
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
  const cvModel: CvModel = {
    fullName: cvCandidateName(inputs),
    targetRole: goal,
    phone: professionalizeUserInput(inputs.profile?.phone),
    email: professionalizeUserInput(inputs.profile?.email),
    city: professionalizeUserInput(inputs.profile?.city),
    country: professionalizeUserInput(inputs.profile?.country),
    linkedIn: professionalizeUserInput(inputs.profile?.linkedin_url),
    portfolio: professionalizeUserInput(inputs.profile?.portfolio_url),
    github: "",
    website: "",
    professionalSummary: language === "french"
      ? `Professionnel en developpement oriente vers ${goal}, avec une progression active en competences, preuves de portfolio et preparation a l'emploi.`
      : `Early-career professional building practical experience toward ${goal}. Focused on relevant skills, portfolio proof, and stronger career direction.`,
    coreSkills: skills,
    technicalSkills: [],
    professionalSkills: [],
    professionalExperience: oldCvText ? [{ role: "Previous CV experience", company: "", location: "", startDate: "", endDate: "", current: false, achievements: [formatRecruiterBullet(oldCvText)] }] : [],
    projects: getRecommendedCareers(inputs.roadmap).length ? [{ projectName: `Portfolio focus linked to: ${getRecommendedCareers(inputs.roadmap).join(", ")}`, role: "", tools: [], description: formatRecruiterBullet("built practical proof for selected career direction"), impact: "" }] : [],
    education: education ? [{ qualification: education, institution: "", fieldOfStudy: "", year: "", status: "" }] : [],
    certifications: [],
    achievements: [],
    languages: [],
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
    contentSourceId: data?.id ?? null
  };
  await refreshIdentity(supabase, userId);

  return saveUnifiedDocument(supabase, userId, { id: data?.id, tool: "cv", title, content, contentJson: { cvModel, cvVersion }, score }, templateName, { cv_type: cvType });
}

export async function createImportedCvDraft(
  supabase: Supabase,
  userId: string,
  imported: ImportedCvResult,
  templateNameInput?: string
): Promise<GeneratedProfessionalDocument> {
  const templateName = normalizeTemplate(templateNameInput ?? "Modern ATS");
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

  await supabase.from("user_documents").insert({
    user_id: userId,
    document_type: "old_cv",
    document_title: `Uploaded CV - ${imported.fileName}`,
    template_name: null,
    content_json: {
      source: "uploaded_cv",
      original_file_name: imported.fileName,
      original_file_type: imported.fileType,
      original_file_size: imported.fileSize,
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
  });

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
  const [inputs, latestCv] = await Promise.all([getInputs(supabase, userId), getLatestCvModel(supabase, userId)]);
  const language = normalizeLanguage(options.language ?? inputs.brain?.language);
  const templateName = normalizeCoverLetterTemplate(options.templateName);
  const company = prepareForProfessionalDocument(options.company || "the company").professional;
  const role = prepareForProfessionalDocument(options.role || careerGoal(inputs)).professional;
  const tone = prepareForProfessionalDocument(options.tone || "professional").professional.toLowerCase();
  const fallbackSkills = collectSkills(inputs).slice(0, 5);
  const cvFacts = coverLetterCvFacts(latestCv, fallbackSkills);
  const skills = cvFacts.skills.length ? cvFacts.skills.join(", ") : "practical communication, reliability, and willingness to learn";
  const candidateName = cvCandidateName(inputs);
  const goal = cvFacts.targetRole || careerGoal(inputs);
  const jobFocus = jobDescriptionFocus(options.jobDescription);
  const jobAlignment = jobFocus
    ? language === "french"
      ? `D'apres l'offre, je comprends que ce poste demande ${jobFocus}.`
      : `From the job description, I understand that this role needs ${jobFocus}.`
    : language === "french"
      ? "Je comprends que ce poste demande de la fiabilite, de l'attention aux besoins de l'equipe et une envie d'apprendre."
      : "I understand this role calls for reliability, attention to team needs, and a willingness to learn.";
  const proof = cvFacts.experience || cvFacts.project || cvFacts.education;
  const proofSentence = proof
    ? language === "french"
      ? `Mon parcours montre deja une base pertinente: ${proof}.`
      : `My background already gives me a relevant foundation: ${proof}.`
    : language === "french"
      ? "Lorsque mon experience directe est encore limitee, je compense par une preparation serieuse, une communication claire et une volonte de progresser rapidement."
      : "Where my direct experience is still developing, I bring careful preparation, clear communication, and a genuine commitment to grow quickly.";
  const professionalTone = toneAdjective(tone);
  const coverLetterData: CoverLetterData = {
    fullName: candidateName,
    professionalTitle: goal,
    phone: professionalizeUserInput(inputs.profile?.phone),
    email: professionalizeUserInput(inputs.profile?.email),
    linkedIn: professionalizeUserInput(inputs.profile?.linkedin_url),
    city: professionalizeUserInput(inputs.profile?.city),
    country: professionalizeUserInput(inputs.profile?.country),
    companyName: company,
    hiringManager: "",
    jobTitle: role,
    companyAddress: "",
    date: new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" }),
    subject: language === "french" ? `Candidature - ${role}` : `Application for ${role}`,
    greeting: language === "french" ? "Bonjour," : "Dear Hiring Manager,",
    openingParagraph: language === "french"
      ? `Je vous presente ma candidature pour le poste de ${role} chez ${company}. Mon objectif professionnel est de progresser vers ${goal}, avec une base pratique en ${skills}.`
      : `I am applying for the ${role} role at ${company}. My professional goal is to grow toward ${goal}, with a practical foundation in ${skills}.`,
    motivationParagraph: language === "french"
      ? `${jobAlignment} Cette opportunite correspond a mon parcours actuel et a ma volonte de contribuer de maniere serieuse, utile et progressive.`
      : `${jobAlignment} This opportunity fits my current growth path and gives me a clear way to contribute with care, consistency, and useful work.`,
    evidenceParagraph: language === "french"
      ? `${proofSentence} Je peux apporter une attitude ${professionalTone}, de la fiabilite, une communication claire et une volonte d'apprendre rapidement sans pretendre a une experience que je n'ai pas encore.`
      : `${proofSentence} I can bring a ${professionalTone} attitude, reliability, clear communication, and a commitment to learn quickly without overstating experience I have not yet built.`,
    companyAlignmentParagraph: language === "french"
      ? `Je souhaite rejoindre ${company} parce que ce role me permettrait de mettre mes competences en pratique tout en continuant a developper une contribution professionnelle mesurable.`
      : `I am interested in ${company} because this role would allow me to apply my strengths while continuing to build measurable professional contribution.`,
    bodyParagraphs: [],
    closingParagraph: language === "french"
      ? "Merci pour votre temps et votre consideration. Je serais heureux d'echanger sur ma candidature."
      : "Thank you for your time and consideration. I would welcome the opportunity to discuss my application.",
    closingPhrase: language === "french" ? "Cordialement," : "Kind regards,",
    signature: candidateName,
    tone,
    designSystem: templateName
  };
  const content = serializeCoverLetterData(coverLetterData);
  const title = `${templateName} ${role} cover letter`;

  const { data } = await supabase.from("cover_letters").insert({ user_id: userId, language, title, company, role, content, status: "draft" }).select("id").maybeSingle();
  await refreshIdentity(supabase, userId);

  return saveUnifiedDocument(supabase, userId, { id: data?.id, tool: "cover-letter", title, content, contentJson: { coverLetterData } }, templateName, { company, role });
}

export async function generateLinkedInProfile(supabase: Supabase, userId: string, options: GenerateOptions = {}): Promise<GeneratedProfessionalDocument> {
  const inputs = await getInputs(supabase, userId);
  const language = normalizeLanguage(options.language ?? inputs.brain?.language);
  const skills = collectSkills(inputs).slice(0, 12);
  const goal = prepareForProfessionalDocument(careerGoal(inputs)).professional;
  const headline = language === "french" ? `${goal} | Jeune talent en developpement | ${skills.slice(0, 3).join(" + ")}` : `${goal} | Early-career talent | ${skills.slice(0, 3).join(" + ")}`;
  const about =
    language === "french"
      ? `Je construis mon parcours vers ${goal}. Je developpe mes competences, mon portfolio et ma preparation professionnelle avec PATHZY. Je recherche des opportunites ou je peux apprendre, contribuer et progresser avec integrite.`
      : `I am building my path toward ${goal}. I am developing practical skills, portfolio proof, and employment readiness with PATHZY. I am looking for opportunities where I can learn, contribute, and grow with integrity.`;
  const experienceSummary = language === "french" ? "Ajoutez uniquement vos experiences reelles, projets, benevolat ou responsabilites." : "Add only real experience, projects, volunteering, or leadership responsibilities.";
  const content = `${headline}\n\nABOUT\n${about}\n\nSKILLS\n${skills.map((skill) => `- ${skill}`).join("\n") || "- Add verified skills"}\n\nEXPERIENCE SUMMARY\n${experienceSummary}\n\nFEATURED SECTION IDEAS\n- Portfolio project\n- CV\n- Certificate you completed\n- Short case study\n\nPROFILE CHECKLIST\n- Professional photo\n- Clear headline\n- Honest About section\n- Skills aligned to your target role\n- Featured proof of work\n\nTrust note: PATHZY does not log into LinkedIn. You copy and apply suggestions yourself.`;

  const { data } = await supabase.from("linkedin_profiles").insert({ user_id: userId, language, headline, about, skills, experience_summary: experienceSummary, optimization_score: Math.min(100, 62 + skills.length * 3) }).select("id").maybeSingle();
  await refreshIdentity(supabase, userId);

  return saveUnifiedDocument(
    supabase,
    userId,
    { id: data?.id, tool: "linkedin", title: "LinkedIn profile optimization", content, score: Math.min(100, 62 + skills.length * 3), fields: { headline, about, skills, experienceSummary } },
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
