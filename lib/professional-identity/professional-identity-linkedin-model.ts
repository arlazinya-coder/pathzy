import { appRoutes, routeBuilders } from "@/lib/navigation/routes";
import type { ProfessionalIdentitySectionId } from "@/lib/canonical-profile/canonical-professional-identity.model";
import type { GeneratedProfessionalDocument, ProfessionalLanguage } from "@/lib/professional-identity/professional-identity-types";
import { experienceEntryDateLabel, experienceEntryToText, selectCanonicalProfessionalIdentityExperiences, type ProfessionalIdentityExperienceEntry } from "@/lib/professional-identity/professional-identity-experience";
import {
  normalizeProfessionalIdentityCompletionValues,
  professionalIdentityRequiredChecksFromValues,
  type ProfessionalIdentityCompletionSectionKey,
  type ProfessionalIdentityCompletionValues
} from "@/lib/professional-identity/professional-identity-completion";

export type LinkedInProfileModel = {
  fullName: string;
  professionalTitle: string;
  profilePhotoAvailable: boolean;
  headline: string;
  headlineVariants: {
    recruiterFriendly: string;
    professional: string;
    careerTransition: string;
  };
  about: string;
  location: string;
  linkedInUrl: string;
  professionalLinks: string[];
  openToWorkTargets: string[];
  experience: LinkedInExperienceItem[];
  education: LinkedInEducationItem[];
  skills: string[];
  skillEvidence: {
    supported: string[];
    suggestedToDevelop: string[];
  };
  projects: string[];
  certifications: string[];
  licences: string[];
  languages: string[];
  featuredItems: string[];
  profileOptimization: {
    status: "ready_to_copy" | "missing_information" | "optimization_available";
    recommendations: { priority: "HIGH" | "MEDIUM" | "OPTIONAL"; label: string; why: string; section: ProfessionalIdentityCompletionSectionKey; href: string }[];
  };
  keywordStrategy: {
    targetRole: string;
    supported: string[];
    opportunities: string[];
  };
  completeness: {
    completedChecks: number;
    totalChecks: number;
    label: string;
    dimensions: { label: string; complete: boolean; recommendation: string }[];
  };
  sourceMetadata: {
    source: "professional_identity";
    language: ProfessionalLanguage;
    professionalIdentityUpdatedAt: string | null;
    manualOverride: boolean;
  };
};

export type LinkedInExperienceItem = {
  id: string;
  role: string;
  company: string;
  dates: string;
  location: string;
  description: string;
  sourceText: string;
};

export type LinkedInEducationItem = {
  id: string;
  qualification: string;
  field: string;
  institution: string;
  dates: string;
  sourceText: string;
};

export type ProfessionalIdentityLinkedInMissingSection = {
  section: ProfessionalIdentityCompletionSectionKey;
  label: string;
  missingFields: string[];
  href: string;
};

export type ProfessionalIdentityLinkedInSyncStatus = {
  source: "professional_identity";
  status: "up_to_date" | "missing_information" | "optimization_available" | "draft_manually_edited";
  lastUpdated: string | null;
  profileUpdatedAt: string | null;
  missingSections: ProfessionalIdentityLinkedInMissingSection[];
};

const linkedInIdentitySections = new Set<ProfessionalIdentityCompletionSectionKey>([
  "profile",
  "personal_information",
  "location",
  "career_goal",
  "professional_summary",
  "education",
  "experience",
  "skills",
  "projects",
  "achievements",
  "certificates",
  "licences",
  "languages",
  "portfolio",
  "social_profiles"
]);

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function normalizedKey(value: string) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isPlaceholderRecord(value: string) {
  const key = normalizedKey(value);
  return [
    "relevant project",
    "projet pertinent",
    "certification",
    "pathzy cv",
    "cv pathzy"
  ].includes(key);
}

function cleanList(value: unknown, options: { excludePlaceholders?: boolean; excludeKeys?: Set<string> } = {}) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const output: string[] = [];
  for (const item of value) {
    const text = cleanText(item);
    if (!text) continue;
    if (options.excludePlaceholders && isPlaceholderRecord(text)) continue;
    const key = normalizedKey(text);
    if (!key) continue;
    if (options.excludeKeys?.has(key)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(text);
  }
  return output;
}

function splitRecordParts(value: string) {
  return cleanText(value)
    .split(/\s*(?:\||•|·|;| \/ )\s*/g)
    .map((part) => cleanText(part.replace(/^(role|title|company|employer|organisation|organization|institution|period|date|dates|location|description|qualification|field)\s*[:=-]\s*/i, "")))
    .filter(Boolean);
}

function looksLikeDateRange(value: string) {
  return /\b(19|20)\d{2}\b|present|current|actuel|aujourd'hui|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|janv|fev|fév|mars|avr|mai|juin|juil|aout|août|sept|oct|nov|dec|déc/i.test(value);
}

function linkedInExperienceFromIdentityEntry(value: ProfessionalIdentityExperienceEntry, index: number): LinkedInExperienceItem {
  const sourceText = experienceEntryToText(value);
  return {
    id: value.id || `experience-${index}-${normalizedKey(sourceText).slice(0, 32)}`,
    role: value.role,
    company: value.company,
    dates: experienceEntryDateLabel(value),
    location: value.location,
    description: [value.description, ...value.achievements].map(cleanText).filter(Boolean).join(" "),
    sourceText
  };
}

function parseEducationRecord(value: string, index: number, fallbackField = ""): LinkedInEducationItem {
  const sourceText = cleanText(value);
  const parts = splitRecordParts(sourceText);
  const datesIndex = parts.findIndex(looksLikeDateRange);
  const dates = datesIndex >= 0 ? parts[datesIndex] : "";
  const remaining = parts.filter((_, partIndex) => partIndex !== datesIndex);
  return {
    id: `education-${index}-${normalizedKey(sourceText).slice(0, 32)}`,
    qualification: remaining[0] ?? sourceText,
    field: remaining.length > 2 ? remaining[1] : cleanText(fallbackField),
    institution: remaining.length > 2 ? remaining[2] : remaining[1] ?? "",
    dates,
    sourceText
  };
}

function sentenceList(value: string) {
  return cleanText(value)
    .split(/(?<=[.!?])\s+/)
    .map(sentence)
    .filter(Boolean);
}

function uniqueSentences(values: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values.flatMap(sentenceList)) {
    const key = normalizedKey(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(value);
  }
  return output;
}

function wordLimit(value: string, maxWords: number) {
  const words = cleanText(value).split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return cleanText(value);
  return `${words.slice(0, maxWords).join(" ")}.`;
}

function joinHuman(items: string[]) {
  const clean = items.map(cleanText).filter(Boolean);
  if (clean.length <= 1) return clean[0] ?? "";
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean.at(-1)}`;
}

function sectionHref(section: ProfessionalIdentitySectionId) {
  return routeBuilders.professionalIdentitySection(section, appRoutes.professionalIdentityLinkedin);
}

const sectionPresentationLabels: Record<ProfessionalIdentityCompletionSectionKey, Record<ProfessionalLanguage, string>> = {
  profile: { english: "Profile", french: "Profil" },
  photo: { english: "Professional photo", french: "Photo professionnelle" },
  personal_information: { english: "Personal information", french: "Informations personnelles" },
  location: { english: "Location", french: "Localisation" },
  nationality: { english: "Nationality", french: "Nationalite" },
  work_authorization: { english: "Work authorization", french: "Autorisation de travail" },
  career_goal: { english: "Career goal", french: "Objectif professionnel" },
  professional_summary: { english: "Professional summary", french: "Resume professionnel" },
  education: { english: "Education", french: "Formation" },
  experience: { english: "Experience", french: "Experience" },
  skills: { english: "Skills", french: "Competences" },
  projects: { english: "Projects", french: "Projets" },
  achievements: { english: "Achievements", french: "Realisations" },
  certificates: { english: "Certifications", french: "Certifications" },
  licences: { english: "Licences", french: "Licences" },
  languages: { english: "Languages", french: "Langues" },
  references: { english: "References", french: "References" },
  portfolio: { english: "Portfolio", french: "Portfolio" },
  social_profiles: { english: "Social profiles", french: "Profils sociaux" },
  preferences: { english: "Preferences", french: "Preferences" },
  employment_preferences: { english: "Employment preferences", french: "Preferences d'emploi" },
  salary_expectations: { english: "Salary expectations", french: "Attentes salariales" },
  availability: { english: "Availability", french: "Disponibilite" }
};

function sectionPresentationLabel(section: ProfessionalIdentityCompletionSectionKey, language: ProfessionalLanguage) {
  return sectionPresentationLabels[section]?.[language] ?? section.replace(/_/g, " ");
}

function missingFieldPresentation(fields: string[], language: ProfessionalLanguage) {
  if (!fields.length) return language === "french" ? "information manquante" : "missing information";
  return fields.join(", ");
}

function documentLanguage(values: ProfessionalIdentityCompletionValues, requested?: ProfessionalLanguage): ProfessionalLanguage {
  if (requested === "french") return "french";
  if (requested === "english") return "english";
  return values.professional_document_language === "french" ? "french" : "english";
}

function sentence(value: string) {
  const text = cleanText(value);
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function buildLinkedInAbout(input: {
  language: ProfessionalLanguage;
  summary: string;
  targetRole: string;
  topSkills: string[];
  experience: LinkedInExperienceItem[];
  projects: string[];
  achievements: string[];
  education: LinkedInEducationItem[];
}) {
  const { language, summary, targetRole, topSkills, experience, projects, achievements, education } = input;
  const lines = uniqueSentences([
    summary,
    topSkills.length
      ? language === "french"
        ? `Mes competences confirmees incluent ${joinHuman(topSkills)}.`
        : `My confirmed skills include ${joinHuman(topSkills)}.`
      : "",
    experience.length
      ? language === "french"
        ? `Mon parcours comprend ${experience.length === 1 ? "une experience professionnelle confirmee" : `${experience.length} experiences professionnelles confirmees`}.`
        : `My background includes ${experience.length === 1 ? "one confirmed professional experience" : `${experience.length} confirmed professional experiences`}.`
      : "",
    projects.length || achievements.length
      ? language === "french"
        ? "Je peux appuyer mon profil avec des projets ou realisations confirmes dans mon Professional Identity."
        : "I can support my profile with projects or achievements confirmed in my Professional Identity."
      : "",
    education.length
      ? language === "french"
        ? "Ma formation ajoute un contexte utile a mon parcours professionnel."
        : "My education adds useful context to my professional direction."
      : "",
    language === "french"
      ? `Je recherche des opportunites ou je peux contribuer serieusement et continuer a progresser vers ${targetRole}.`
      : `I am interested in opportunities where I can contribute reliably while continuing to grow toward ${targetRole}.`
  ]);
  return wordLimit(lines.join(" "), 300);
}

function formatExperienceItem(item: LinkedInExperienceItem) {
  return [
    item.role,
    item.company,
    item.dates,
    item.location,
    item.description
  ].map(cleanText).filter(Boolean).join(" | ");
}

function formatEducationItem(item: LinkedInEducationItem) {
  return [
    item.qualification,
    item.field,
    item.institution,
    item.dates
  ].map(cleanText).filter(Boolean).join(" | ");
}

export function professionalIdentityHrefForLinkedInSection(section: ProfessionalIdentityCompletionSectionKey) {
  return sectionHref(section as ProfessionalIdentitySectionId);
}

export function professionalIdentityHasLinkedInSeedData(values: ProfessionalIdentityCompletionValues) {
  const identity = normalizeProfessionalIdentityCompletionValues(values);
  return Boolean(
    identity.full_name ||
      identity.career_goal ||
      identity.professional_summary ||
      cleanList(identity.skills).length ||
      selectCanonicalProfessionalIdentityExperiences(identity.experience).length ||
      cleanList(identity.education).length ||
      cleanList(identity.projects).length
  );
}

export function linkedinProfileModelFromProfessionalIdentity(
  values: ProfessionalIdentityCompletionValues,
  options: { language?: ProfessionalLanguage; profileUpdatedAt?: string | null; manualOverride?: boolean } = {}
): LinkedInProfileModel {
  const identity = normalizeProfessionalIdentityCompletionValues(values);
  const language = documentLanguage(identity, options.language);
  const targetRole = cleanText(identity.career_goal) || (language === "french" ? "direction professionnelle en construction" : "career direction in progress");
  const skills = cleanList(identity.skills).slice(0, 18);
  const topSkills = skills.slice(0, 4);
  const experienceSource = selectCanonicalProfessionalIdentityExperiences(identity.experience)
    .filter((item) => !isPlaceholderRecord(experienceEntryToText(item)))
    .slice(0, 6);
  const experience = experienceSource.map(linkedInExperienceFromIdentityEntry);
  const experienceKeys = new Set(experienceSource.map((item) => normalizedKey(experienceEntryToText(item))));
  const education = cleanList(identity.education, { excludePlaceholders: true }).slice(0, 4).map((item, index) => parseEducationRecord(item, index, identity.field_of_study));
  const projects = cleanList(identity.projects, { excludePlaceholders: true, excludeKeys: experienceKeys }).slice(0, 4);
  const projectKeys = new Set(projects.map(normalizedKey));
  const achievements = cleanList(identity.achievements, { excludePlaceholders: true, excludeKeys: new Set([...experienceKeys, ...projectKeys]) }).slice(0, 3);
  const certifications = cleanList(identity.certificates, { excludePlaceholders: true }).slice(0, 4);
  const licences = cleanList(identity.licences, { excludePlaceholders: true }).slice(0, 4);
  const languages = cleanList(identity.languages).slice(0, 5);
  const preferredRoles = cleanList(identity.preferred_roles).slice(0, 5);
  const industries = cleanList(identity.industries).slice(0, 4);
  const location = [identity.city, identity.country].map(cleanText).filter(Boolean).join(", ");
  const supportedKeywords = Array.from(new Set([targetRole, ...topSkills].map(cleanText).filter(Boolean))).slice(0, 12);
  const opportunityKeywords = Array.from(new Set([...preferredRoles, ...industries].map(cleanText).filter((item) => item && !supportedKeywords.some((keyword) => keyword.toLowerCase() === item.toLowerCase())))).slice(0, 6);
  const summary = cleanText(identity.professional_summary);
  const headlineCore = topSkills.length ? `${targetRole} | ${topSkills.slice(0, 3).join(" + ")}` : targetRole;
  const about = buildLinkedInAbout({ language, summary, targetRole, topSkills, experience, projects, achievements, education });
  const featuredItems = achievements;
  const recommendations = professionalIdentityRequiredChecksFromValues(identity)
    .filter((check) => !check.complete && linkedInIdentitySections.has(check.section))
    .map((check) => ({
      priority: check.status === "required" ? "HIGH" as const : "MEDIUM" as const,
      label: language === "french"
        ? `${sectionPresentationLabel(check.section, language)}: ${missingFieldPresentation(check.missingFields, language)}`
        : `${sectionPresentationLabel(check.section, language)}: ${missingFieldPresentation(check.missingFields, language)}`,
      why: language === "french" ? "Cette information aide PATHZY a presenter votre profil LinkedIn avec plus de precision." : "This helps PATHZY present your LinkedIn profile more accurately.",
      section: check.section,
      href: sectionHref(check.section as ProfessionalIdentitySectionId)
    }));
  if (!summary) recommendations.push({ priority: "HIGH", label: language === "french" ? "Ameliorez la section About." : "Strengthen the About section.", why: language === "french" ? "Une section About claire explique votre direction et vos preuves sans recopier le CV." : "A clear About section explains your direction and evidence without copying the CV.", section: "professional_summary", href: sectionHref("professional_summary") });
  if (!projects.length && !experience.length) recommendations.push({ priority: "MEDIUM", label: language === "french" ? "Ajoutez une experience ou un projet." : "Add experience or a project.", why: language === "french" ? "Les projets peuvent renforcer le profil lorsque l'experience formelle est limitee." : "Projects can strengthen the profile when formal experience is limited.", section: "projects", href: sectionHref("projects") });
  const dimensions = [
    { label: language === "french" ? "Positionnement professionnel" : "Professional positioning", complete: Boolean(targetRole), recommendation: language === "french" ? "Clarifiez votre objectif professionnel." : "Clarify your target role." },
    { label: "Headline", complete: Boolean(targetRole && topSkills.length), recommendation: language === "french" ? "Ajoutez des competences confirmees pour renforcer le titre." : "Add confirmed skills to strengthen the headline." },
    { label: "About", complete: Boolean(summary), recommendation: language === "french" ? "Ajoutez un resume professionnel." : "Add a professional summary." },
    { label: language === "french" ? "Experience ou projets" : "Experience or projects", complete: experience.length > 0 || projects.length > 0, recommendation: language === "french" ? "Ajoutez une experience, un projet ou du benevolat verifie." : "Add verified experience, projects, or volunteering." },
    { label: language === "french" ? "Formation" : "Education", complete: education.length > 0, recommendation: language === "french" ? "Ajoutez votre formation." : "Add education or training." },
    { label: language === "french" ? "Competences" : "Skills", complete: skills.length >= 5, recommendation: language === "french" ? "Ajoutez au moins cinq competences verifiees." : "Add at least five verified skills." },
    { label: language === "french" ? "Preuves supplementaires" : "Additional proof", complete: certifications.length > 0 || licences.length > 0 || projects.length > 0, recommendation: language === "french" ? "Ajoutez projets, certifications ou licences si pertinents." : "Add projects, certifications, or licences where relevant." },
    { label: language === "french" ? "Liens professionnels" : "Professional links", complete: Boolean(identity.linkedin_url || identity.portfolio_url || identity.website_url), recommendation: language === "french" ? "Ajoutez LinkedIn, portfolio ou site professionnel si disponible." : "Add LinkedIn, portfolio, or website when available." }
  ];
  const checks = dimensions.map((item) => item.complete);
  const completedChecks = checks.filter(Boolean).length;
  const completenessLabel = language === "french"
    ? completedChecks >= 7 ? "Pret a copier" : completedChecks >= 5 ? "Brouillon LinkedIn solide" : "Plus d'informations Professional Identity requises"
    : completedChecks >= 7 ? "Ready to copy" : completedChecks >= 5 ? "Strong LinkedIn draft" : "Needs more Professional Identity detail";

  return {
    fullName: cleanText(identity.full_name),
    professionalTitle: targetRole,
    profilePhotoAvailable: Boolean(identity.professional_photo_asset?.storagePath && identity.professional_photo_asset.photoStatus === "ready"),
    headline: headlineCore,
    headlineVariants: {
      recruiterFriendly: headlineCore,
      professional: topSkills.length ? `${targetRole} | ${joinHuman(topSkills.slice(0, 2))}` : targetRole,
      careerTransition: language === "french" ? `${targetRole} | Competences transferables et progression professionnelle` : `${targetRole} | Transferable strengths and professional growth`
    },
    about,
    location,
    linkedInUrl: cleanText(identity.linkedin_url),
    professionalLinks: [identity.linkedin_url, identity.portfolio_url, identity.github_url, identity.behance_url, identity.website_url].map(cleanText).filter(Boolean),
    openToWorkTargets: preferredRoles.length ? preferredRoles : [targetRole],
    experience,
    education,
    skills,
    skillEvidence: {
      supported: skills,
      suggestedToDevelop: opportunityKeywords
    },
    projects,
    certifications,
    licences,
    languages,
    featuredItems,
    profileOptimization: {
      status: recommendations.length ? "missing_information" : "ready_to_copy",
      recommendations: recommendations.slice(0, 5)
    },
    keywordStrategy: {
      targetRole,
      supported: supportedKeywords,
      opportunities: opportunityKeywords
    },
    completeness: {
      completedChecks,
      totalChecks: checks.length,
      label: completenessLabel,
      dimensions
    },
    sourceMetadata: {
      source: "professional_identity",
      language,
      professionalIdentityUpdatedAt: options.profileUpdatedAt ?? null,
      manualOverride: Boolean(options.manualOverride)
    }
  };
}

export function serializeLinkedInProfileModel(model: LinkedInProfileModel) {
  const language = model.sourceMetadata.language;
  const labels = language === "french"
    ? {
        about: "A PROPOS",
        experience: "EXPERIENCE",
        education: "FORMATION",
        skills: "COMPETENCES",
        projects: "PROJETS",
        certifications: "CERTIFICATIONS / LICENCES",
        languages: "LANGUES",
        featured: "SUGGESTIONS DE CONTENU A LA UNE",
        keywords: "STRATEGIE DE MOTS-CLES",
        checklist: "LISTE DE CONTROLE DU PROFIL",
        trust: "Note de confiance: PATHZY ne se connecte pas a LinkedIn. Vous copiez et appliquez les suggestions vous-meme.",
        emptyExperience: "- Ajoutez une experience, un projet, du benevolat ou des responsabilites verifies dans Professional Identity.",
        emptyEducation: "- Ajoutez une formation dans Professional Identity.",
        emptySkills: "- Ajoutez des competences verifiees.",
        emptyProjects: "- Ajoutez des projets pertinents si necessaire.",
        emptyCertifications: "- Ajoutez des certifications ou licences si necessaire.",
        emptyLanguages: "- Ajoutez des langues si necessaire.",
        emptyFeatured: "- Ajoutez un portfolio, un CV, un projet, un certificat ou un site professionnel."
      }
    : {
        about: "ABOUT",
        experience: "EXPERIENCE",
        education: "EDUCATION",
        skills: "SKILLS",
        projects: "PROJECTS",
        certifications: "CERTIFICATIONS / LICENCES",
        languages: "LANGUAGES",
        featured: "FEATURED SUGGESTIONS",
        keywords: "KEYWORD STRATEGY",
        checklist: "PROFILE CHECKLIST",
        trust: "Trust note: PATHZY does not log into LinkedIn. You copy and apply suggestions yourself.",
        emptyExperience: "- Add verified experience, projects, volunteering, or responsibilities in Professional Identity.",
        emptyEducation: "- Add education or training in Professional Identity.",
        emptySkills: "- Add verified skills",
        emptyProjects: "- Add relevant projects where appropriate.",
        emptyCertifications: "- Add certifications or licences if relevant.",
        emptyLanguages: "- Add languages if relevant.",
        emptyFeatured: "- Add a portfolio, CV, project, certificate, or professional website."
      };
  const lines = [
    model.headline,
    "",
    labels.about,
    model.about,
  ];
  if (model.experience.length) lines.push("", labels.experience, ...model.experience.map((item) => `- ${formatExperienceItem(item)}`));
  if (model.education.length) lines.push("", labels.education, ...model.education.map((item) => `- ${formatEducationItem(item)}`));
  if (model.skills.length) lines.push("", labels.skills, ...model.skills.map((item) => `- ${item}`));
  if (model.projects.length) lines.push("", labels.projects, ...model.projects.map((item) => `- ${item}`));
  if ([...model.certifications, ...model.licences].length) lines.push("", labels.certifications, ...[...model.certifications, ...model.licences].map((item) => `- ${item}`));
  if (model.languages.length) lines.push("", labels.languages, ...model.languages.map((item) => `- ${item}`));
  if (model.featuredItems.length) lines.push("", labels.featured, ...model.featuredItems.map((item) => `- ${item}`));
  if (model.keywordStrategy.supported.length) lines.push("", labels.keywords, model.keywordStrategy.supported.join(", "));
  if (model.profileOptimization.recommendations.length) lines.push("", labels.checklist, ...model.profileOptimization.recommendations.map((item) => `- ${item.label}`));
  lines.push("", labels.trust);
  return lines.join("\n");
}

export function professionalIdentityLinkedInSyncStatus(
  values: ProfessionalIdentityCompletionValues,
  options: { lastUpdated?: string | null; profileUpdatedAt?: string | null; manualOverride?: boolean } = {}
): ProfessionalIdentityLinkedInSyncStatus {
  const missingSections = professionalIdentityRequiredChecksFromValues(values)
    .filter((check) => !check.complete && linkedInIdentitySections.has(check.section))
    .map((check) => ({
      section: check.section,
      label: check.label,
      missingFields: check.missingFields,
      href: sectionHref(check.section as ProfessionalIdentitySectionId)
    }));
  return {
    source: "professional_identity",
    status: options.manualOverride ? "draft_manually_edited" : missingSections.length ? "missing_information" : professionalIdentityHasLinkedInSeedData(values) ? "up_to_date" : "optimization_available",
    lastUpdated: options.lastUpdated ?? null,
    profileUpdatedAt: options.profileUpdatedAt ?? null,
    missingSections
  };
}

export function professionalIdentityLinkedInDocument(
  values: ProfessionalIdentityCompletionValues,
  options: { lastUpdated?: string | null; language?: ProfessionalLanguage; documentId?: string | null; manualOverride?: boolean } = {}
): GeneratedProfessionalDocument | null {
  if (!professionalIdentityHasLinkedInSeedData(values)) return null;
  const model = linkedinProfileModelFromProfessionalIdentity(values, { language: options.language, profileUpdatedAt: options.lastUpdated, manualOverride: options.manualOverride });
  const now = options.lastUpdated ?? new Date().toISOString();
  const content = serializeLinkedInProfileModel(model);
  return {
    id: options.documentId ?? undefined,
    tool: "linkedin",
    title: "LinkedIn profile optimization",
    content,
    contentJson: {
      source: "professional_identity",
      linkedinProfileModel: model,
      linkedInVersion: {
        createdAt: now,
        updatedAt: now,
        professionalIdentitySource: "canonical_professional_identity",
        professionalIdentityUpdatedAt: options.lastUpdated ?? null,
        manualOverride: Boolean(options.manualOverride),
        status: model.profileOptimization.status
      }
    },
    updated_at: now,
    score: model.completeness.completedChecks,
    fields: {
      headline: model.headline,
      about: model.about,
      skills: model.skills,
        experienceSummary: model.experience.map((item) => item.sourceText).join("\n")
    }
  };
}
