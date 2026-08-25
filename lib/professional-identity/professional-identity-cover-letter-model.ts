import {
  normalizeCoverLetterDataForExport,
  normalizeCoverLetterTemplate,
  serializeCoverLetterData,
  type CoverLetterData
} from "@/components/professional-identity/document-downloads";
import { appRoutes, routeBuilders } from "@/lib/navigation/routes";
import type { ProfessionalIdentitySectionId } from "@/lib/canonical-profile/canonical-professional-identity.model";
import type { GeneratedProfessionalDocument, ProfessionalLanguage } from "@/lib/professional-identity/professional-identity-types";
import { experienceEntryEvidenceText, normalizeProfessionalIdentityExperienceEntries } from "@/lib/professional-identity/professional-identity-experience";
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

function compactJobDetails(jobContext: CoverLetterJobContext) {
  const requirements = cleanList(jobContext.requirements).slice(0, 4);
  const responsibilities = cleanList(jobContext.responsibilities).slice(0, 3);
  const descriptionSignals = cleanText(jobContext.jobDescription)
    .split(/[.;\n]/)
    .map((item) => cleanText(item))
    .filter((item) => item.length >= 18)
    .slice(0, 3);
  return {
    requirements,
    responsibilities,
    focus: [...requirements, ...responsibilities, ...descriptionSignals].slice(0, 4)
  };
}

function hasJobContext(jobContext: CoverLetterJobContext) {
  return Boolean(cleanText(jobContext.company) && cleanText(jobContext.role));
}

function strongestEvidence(values: ProfessionalIdentityCompletionValues, jobContext: CoverLetterJobContext) {
  const identity = normalizeProfessionalIdentityCompletionValues(values);
  const jobTerms = compactJobDetails(jobContext).focus.join(" ").toLowerCase();
  const skills = cleanList(identity.skills);
  const relevantSkills = skills
    .filter((skill) => jobTerms && jobTerms.includes(skill.toLowerCase()))
    .concat(skills)
    .filter((skill, index, items) => items.findIndex((candidate) => candidate.toLowerCase() === skill.toLowerCase()) === index)
    .slice(0, 4);
  return {
    skills: relevantSkills,
    experience: normalizeProfessionalIdentityExperienceEntries(identity.experience).map(experienceEntryEvidenceText).slice(0, 2),
    projects: cleanList(identity.projects).slice(0, 2),
    achievements: cleanList(identity.achievements).slice(0, 2),
    education: cleanList(identity.education).slice(0, 2),
    certificates: [...cleanList(identity.certificates), ...cleanList(identity.licences)].slice(0, 2),
    languages: cleanList(identity.languages).slice(0, 3)
  };
}

function documentLanguage(values: ProfessionalIdentityCompletionValues, requested?: ProfessionalLanguage): ProfessionalLanguage {
  if (requested === "french") return "french";
  if (requested === "english") return "english";
  return values.professional_document_language === "french" ? "french" : "english";
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
      normalizeProfessionalIdentityExperienceEntries(identity.experience).length ||
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
  const evidence = strongestEvidence(identity, jobContext);
  const jobDetails = compactJobDetails(jobContext);
  const strongestSkills = evidence.skills.length
    ? joinHuman(evidence.skills)
    : language === "french"
      ? "des competences confirmees et une capacite d'apprentissage"
      : "confirmed skills and a capacity to learn";
  const proofItems = [
    ...evidence.experience,
    ...evidence.projects,
    ...evidence.achievements,
    ...evidence.education,
    ...evidence.certificates
  ].slice(0, 3);
  const proof = proofItems.length ? proofItems.map(sentence).join(" ") : "";
  const jobFocus = jobDetails.focus.length ? joinHuman(jobDetails.focus.map((item) => item.toLowerCase())) : "";
  const summary = cleanText(identity.professional_summary);
  const tone = cleanText(options.tone) || "professional";
  const date = new Date().toLocaleDateString(language === "french" ? "fr-FR" : "en-ZA", { year: "numeric", month: "long", day: "numeric" });

  return normalizeCoverLetterDataForExport({
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
      ? `Je vous presente ma candidature pour le poste de ${role} chez ${company}. ${summary ? sentence(summary) : `Mon objectif professionnel est de progresser vers ${title}.`}`
      : `I am applying for the ${role} role at ${company}. ${summary ? sentence(summary) : `My professional direction is focused on ${title}.`}`,
    motivationParagraph: language === "french"
      ? jobFocus
        ? `Ce poste m'interesse parce qu'il demande ${jobFocus}, ce qui correspond a mon parcours actuel et aux points forts confirmes dans mon profil professionnel.`
        : `Ce poste m'interesse parce qu'il correspond a mon objectif professionnel et me permettrait de contribuer de maniere utile et fiable.`
      : jobFocus
        ? `This opportunity interests me because it calls for ${jobFocus}, which aligns with the confirmed strengths in my professional background.`
        : `This opportunity interests me because it aligns with my career direction and would let me contribute with reliable, useful work.`,
    evidenceParagraph: language === "french"
      ? proof
        ? `Mes elements les plus pertinents incluent ${strongestSkills}. ${proof}`
        : `Mes elements les plus pertinents incluent ${strongestSkills}. Je prefere rester factuel plutot que d'affirmer une experience que mon parcours ne confirme pas encore.`
      : proof
        ? `My strongest relevant evidence includes ${strongestSkills}. ${proof}`
        : `My strongest relevant evidence includes ${strongestSkills}. I would rather stay factual than claim experience my background has not yet confirmed.`,
    companyAlignmentParagraph: language === "french"
      ? `Je souhaite apporter une contribution serieuse a ${company}, avec une approche honnete, organisee et adaptee aux besoins reels du poste.`
      : `I would like to contribute to ${company} with an honest, organized approach shaped around the real needs of this role.`,
    bodyParagraphs: [],
    closingParagraph: language === "french"
      ? "Merci pour votre temps et votre consideration. Je serais heureux d'echanger sur ma candidature et sur la facon dont mon profil peut soutenir vos priorites."
      : "Thank you for your time and consideration. I would welcome the opportunity to discuss my application and how my profile can support your priorities.",
    closingPhrase: language === "french" ? "Cordialement," : "Kind regards,",
    signature: candidateName,
    tone,
    designSystem: templateName
  });
}

export function professionalIdentityCoverLetterDocument(
  values: ProfessionalIdentityCompletionValues,
  jobContext: CoverLetterJobContext,
  options: { templateName: string; lastUpdated: string | null; language?: ProfessionalLanguage; tone?: string | null; documentId?: string | null }
): GeneratedProfessionalDocument | null {
  if (!professionalIdentityHasCoverLetterSeedData(values) || !hasJobContext(jobContext)) return null;
  const coverLetterData = coverLetterDataFromProfessionalIdentity(values, jobContext, options);
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
        manualOverride: false,
        status: "up_to_date"
      }
    }
  };
}
