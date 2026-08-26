import {
  normalizeCoverLetterDataForExport,
  normalizeCoverLetterTemplate,
  serializeCoverLetterData,
  type CoverLetterData
} from "@/components/professional-identity/document-downloads";
import { appRoutes, routeBuilders } from "@/lib/navigation/routes";
import type { ProfessionalIdentitySectionId } from "@/lib/canonical-profile/canonical-professional-identity.model";
import type { GeneratedProfessionalDocument, ProfessionalLanguage } from "@/lib/professional-identity/professional-identity-types";
import { selectCanonicalProfessionalIdentityExperiences } from "@/lib/professional-identity/professional-identity-experience";
import { selectCoverLetterEvidence, validateCoverLetterDraftQuality } from "@/lib/professional-identity/cover-letter-intelligence";
import {
  normalizeProfessionalIdentityCompletionValues,
  professionalIdentityRequiredChecksFromValues,
  type ProfessionalIdentityCompletionSectionKey,
  type ProfessionalIdentityCompletionValues
} from "@/lib/professional-identity/professional-identity-completion";

export type CoverLetterJobContextSource = "saved_job" | "application" | "pasted_job_description" | "manual" | "missing";

export type CoverLetterJobContext = {
  source: CoverLetterJobContextSource;
  jobId?: string | null;
  applicationId?: string | null;
  company?: string | null;
  role?: string | null;
  jobDescription?: string | null;
  location?: string | null;
  qualifications?: string[];
  experienceRequirements?: string | null;
  referenceNumber?: string | null;
  closingDate?: string | null;
  url?: string | null;
  employmentType?: string | null;
  workArrangement?: string | null;
  hiringManager?: string | null;
  applicationInstructions?: string | null;
  requirements?: string[];
  responsibilities?: string[];
  updatedAt?: string | null;
};

export type ProfessionalIdentityCoverLetterMissingSection = {
  section: ProfessionalIdentityCompletionSectionKey;
  label: string;
  missingFields: string[];
  href: string;
};

export type ProfessionalIdentityCoverLetterSyncStatus = {
  source: "professional_identity_and_job_context";
  status: "up_to_date" | "missing_information" | "missing_job_context" | "draft_manually_edited";
  lastUpdated: string | null;
  profileUpdatedAt: string | null;
  jobUpdatedAt: string | null;
  missingSections: ProfessionalIdentityCoverLetterMissingSection[];
  jobContext: CoverLetterJobContext;
};

const coverLetterIdentitySections = new Set<ProfessionalIdentityCompletionSectionKey>([
  "profile",
  "personal_information",
  "location",
  "career_goal",
  "education",
  "skills",
  "preferences"
]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function cleanList(value: unknown) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const items: string[] = [];
  for (const item of value) {
    const text = cleanText(item);
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(text);
  }
  return items;
}

function sectionHref(section: ProfessionalIdentitySectionId) {
  return routeBuilders.professionalIdentitySection(section, appRoutes.professionalIdentityCoverLetter);
}

function sentence(value: string) {
  const text = cleanText(value);
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function joinHuman(items: string[]) {
  const clean = items.map(cleanText).filter(Boolean);
  if (clean.length <= 1) return clean[0] ?? "";
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean.at(-1)}`;
}

function firstAvailable(...values: unknown[]) {
  for (const value of values) {
    const text = cleanText(value);
    if (text) return text;
  }
  return "";
}

function hasJobContext(jobContext: CoverLetterJobContext) {
  return Boolean(cleanText(jobContext.company) && cleanText(jobContext.role));
}

function documentLanguage(values: ProfessionalIdentityCompletionValues, requested?: ProfessionalLanguage): ProfessionalLanguage {
  if (requested === "french") return "french";
  if (requested === "english") return "english";
  return values.professional_document_language === "french" ? "french" : "english";
}

function shortProfessionalPositioning(identity: ProfessionalIdentityCompletionValues, role: string, language: ProfessionalLanguage) {
  const careerGoal = cleanText(identity.career_goal);
  const skills = cleanList(identity.skills).slice(0, 2);
  if (careerGoal && careerGoal.toLowerCase() !== role.toLowerCase()) {
    return language === "french"
      ? `mon objectif professionnel vers ${careerGoal}`
      : `my career direction toward ${careerGoal}`;
  }
  if (skills.length) {
    return language === "french"
      ? `mes competences confirmees en ${joinHuman(skills)}`
      : `my confirmed strengths in ${joinHuman(skills)}`;
  }
  return language === "french" ? "mon profil professionnel confirme" : "my confirmed professional profile";
}

function evidenceSentence(items: string[], language: ProfessionalLanguage) {
  const clean = cleanList(items).slice(0, 4);
  if (!clean.length) {
    return language === "french"
      ? "Je resterai factuel sur les elements deja confirmes dans mon profil et je n'affirmerai pas une experience non verifiee."
      : "I will stay factual about the evidence already confirmed in my profile and will not claim unsupported experience.";
  }
  return clean.map(sentence).join(" ");
}

function skillsSentence(skills: string[], language: ProfessionalLanguage) {
  const clean = cleanList(skills).slice(0, 5);
  if (!clean.length) {
    return language === "french"
      ? "Mon profil montre aussi une capacite d'apprentissage et une approche organisee."
      : "My profile also shows a capacity to learn and an organized approach.";
  }
  return language === "french"
    ? `Les competences les plus utiles pour cette candidature sont ${joinHuman(clean)}.`
    : `The most useful skills for this application are ${joinHuman(clean)}.`;
}

export function coverLetterProfessionalIdentityHrefForSection(section: ProfessionalIdentityCompletionSectionKey) {
  return sectionHref(section as ProfessionalIdentitySectionId);
}

export function professionalIdentityHasCoverLetterSeedData(values: ProfessionalIdentityCompletionValues) {
  const identity = normalizeProfessionalIdentityCompletionValues(values);
  return Boolean(
    identity.full_name ||
      identity.email ||
      identity.phone ||
      identity.career_goal ||
      identity.professional_summary ||
      cleanList(identity.education).length ||
      selectCanonicalProfessionalIdentityExperiences(identity.experience).length ||
      cleanList(identity.skills).length ||
      cleanList(identity.projects).length
  );
}

export function professionalIdentityCoverLetterSyncStatus(
  values: ProfessionalIdentityCompletionValues,
  jobContext: CoverLetterJobContext,
  options: { lastUpdated?: string | null; profileUpdatedAt?: string | null; manualOverride?: boolean } = {}
): ProfessionalIdentityCoverLetterSyncStatus {
  const missingSections = professionalIdentityRequiredChecksFromValues(values)
    .filter((check) => !check.complete && coverLetterIdentitySections.has(check.section))
    .map((check) => ({
      section: check.section,
      label: check.label,
      missingFields: check.missingFields,
      href: sectionHref(check.section as ProfessionalIdentitySectionId)
    }));
  return {
    source: "professional_identity_and_job_context",
    status: options.manualOverride
      ? "draft_manually_edited"
      : !hasJobContext(jobContext)
        ? "missing_job_context"
        : missingSections.length
          ? "missing_information"
          : "up_to_date",
    lastUpdated: options.lastUpdated ?? null,
    profileUpdatedAt: options.profileUpdatedAt ?? null,
    jobUpdatedAt: jobContext.updatedAt ?? null,
    missingSections,
    jobContext
  };
}

export function coverLetterDataFromProfessionalIdentity(
  values: ProfessionalIdentityCompletionValues,
  jobContext: CoverLetterJobContext,
  options: { templateName?: string | null; language?: ProfessionalLanguage; tone?: string | null } = {}
): CoverLetterData {
  const identity = normalizeProfessionalIdentityCompletionValues(values);
  const language = documentLanguage(identity, options.language);
  const templateName = normalizeCoverLetterTemplate(options.templateName);
  const company = firstAvailable(jobContext.company, language === "french" ? "l'organisation" : "the organization");
  const role = firstAvailable(jobContext.role, identity.career_goal, language === "french" ? "ce poste" : "this role");
  const candidateName = firstAvailable(identity.full_name, language === "french" ? "Candidat" : "Candidate");
  const title = firstAvailable(identity.career_goal, role);
  const intelligence = selectCoverLetterEvidence(identity, jobContext, { language });
  const selectedEvidence = intelligence.selectedEvidence.map((item) => item.presentation);
  const jobFocus = intelligence.jobAnalysis.employerPriorities[0] || intelligence.selectedMotivation;
  const responsibilityFocus = intelligence.jobAnalysis.responsibilities[0]?.text;
  const positioning = shortProfessionalPositioning(identity, role, language);
  const tone = cleanText(options.tone) || "professional";
  const date = new Date().toLocaleDateString(language === "french" ? "fr-FR" : "en-ZA", { year: "numeric", month: "long", day: "numeric" });

  const coverLetterData = normalizeCoverLetterDataForExport({
    fullName: candidateName,
    professionalTitle: title,
    phone: cleanText(identity.phone),
    email: cleanText(identity.email),
    linkedIn: cleanText(identity.linkedin_url),
    city: cleanText(identity.city),
    country: cleanText(identity.country),
    companyName: company,
    hiringManager: cleanText(jobContext.hiringManager),
    jobTitle: role,
    companyAddress: cleanText(jobContext.location),
    date,
    subject: language === "french" ? `Candidature - ${role}` : `Application for ${role}`,
    greeting: cleanText(jobContext.hiringManager)
      ? language === "french"
        ? `Bonjour ${cleanText(jobContext.hiringManager)},`
        : `Dear ${cleanText(jobContext.hiringManager)},`
      : language === "french"
        ? "Bonjour,"
        : "Dear Hiring Manager,",
    openingParagraph: language === "french"
      ? `Je vous presente ma candidature pour le poste de ${role} chez ${company}, avec ${positioning}.`
      : `I am applying for the ${role} role at ${company}, bringing ${positioning}.`,
    motivationParagraph: language === "french"
      ? jobFocus
        ? `Ce poste m'interesse parce qu'il demande ${jobFocus.toLowerCase()}, et ma candidature se concentre sur les preuves confirmees les plus utiles pour ce besoin.`
        : `Ce poste m'interesse parce qu'il correspond a mon objectif professionnel et me permettrait de contribuer de maniere utile et fiable.`
      : jobFocus
        ? `This opportunity interests me because it calls for ${jobFocus.toLowerCase()}, and my application is focused on the strongest confirmed evidence for that need.`
        : `This opportunity interests me because it aligns with my career direction and would let me contribute with reliable, useful work.`,
    evidenceParagraph: language === "french"
      ? `${skillsSentence(intelligence.selectedSkills, language)} ${evidenceSentence(selectedEvidence, language)}`
      : `${skillsSentence(intelligence.selectedSkills, language)} ${evidenceSentence(selectedEvidence, language)}`,
    companyAlignmentParagraph: language === "french"
      ? responsibilityFocus
        ? `Je souhaite contribuer a ${company} avec une approche serieuse et organisee, adaptee aux responsabilites du poste comme ${responsibilityFocus.toLowerCase()}.`
        : `Je souhaite apporter une contribution serieuse a ${company}, avec une approche honnete, organisee et adaptee aux besoins reels du poste.`
      : responsibilityFocus
        ? `I would like to contribute to ${company} with an honest, organized approach shaped around responsibilities such as ${responsibilityFocus.toLowerCase()}.`
        : `I would like to contribute to ${company} with an honest, organized approach shaped around the real needs of this role.`,
    bodyParagraphs: [],
    closingParagraph: language === "french"
      ? "Merci pour votre temps et votre consideration. Je serais heureux d'echanger sur ma candidature."
      : "Thank you for your time and consideration. I would welcome the opportunity to discuss my application.",
    closingPhrase: language === "french" ? "Cordialement," : "Kind regards,",
    signature: candidateName,
    tone,
    designSystem: templateName
  });
  const quality = validateCoverLetterDraftQuality(coverLetterData, intelligence);
  if (!quality.valid && process.env.NODE_ENV !== "production") {
    console.warn("[cover-letter-intelligence] draft quality warnings", { warnings: quality.warnings });
  }
  return coverLetterData;
}

export function professionalIdentityCoverLetterDocument(
  values: ProfessionalIdentityCompletionValues,
  jobContext: CoverLetterJobContext,
  options: { templateName: string; lastUpdated: string | null; language?: ProfessionalLanguage; tone?: string | null; documentId?: string | null }
): GeneratedProfessionalDocument | null {
  if (!professionalIdentityHasCoverLetterSeedData(values) || !hasJobContext(jobContext)) return null;
  const coverLetterData = coverLetterDataFromProfessionalIdentity(values, jobContext, options);
  const coverLetterIntelligence = selectCoverLetterEvidence(normalizeProfessionalIdentityCompletionValues(values), jobContext, { language: documentLanguage(normalizeProfessionalIdentityCompletionValues(values), options.language) });
  const coverLetterQuality = validateCoverLetterDraftQuality(coverLetterData, coverLetterIntelligence);
  const now = options.lastUpdated ?? new Date().toISOString();
  const company = cleanText(coverLetterData.companyName);
  const role = cleanText(coverLetterData.jobTitle);
  const title = `Cover Letter${role ? ` - ${role}` : ""}${company ? ` at ${company}` : ""}`;
  const content = serializeCoverLetterData(coverLetterData);
  return {
    id: options.documentId ?? undefined,
    tool: "cover-letter",
    title,
    content,
    template_name: coverLetterData.designSystem,
    updated_at: now,
    contentJson: {
      source: "professional_identity_and_job_context",
      coverLetterData,
      coverLetterVersion: {
        designSystem: coverLetterData.designSystem,
        versionName: title,
        createdAt: now,
        updatedAt: now,
        lastDownloadedAt: null,
        professionalIdentitySource: "canonical_professional_identity",
        jobContext,
        intelligence: {
          strategyVersion: "pathzy-cover-letter-evidence-selection-v1",
          jobAnalysis: coverLetterIntelligence.jobAnalysis,
          selectedEvidence: coverLetterIntelligence.selectedEvidence.map((item) => ({
            id: item.id,
            type: item.type,
            label: item.label,
            matchedKeywords: item.matchedKeywords,
            score: item.score
          })),
          selectedSkills: coverLetterIntelligence.selectedSkills,
          trace: coverLetterIntelligence.trace,
          qualityWarnings: coverLetterQuality.warnings
        },
        manualOverride: false,
        status: coverLetterQuality.valid ? "up_to_date" : "ready_with_warnings"
      }
    }
  };
}
