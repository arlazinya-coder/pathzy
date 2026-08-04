import { professionalPhotoAssetFromUnknown, type CanonicalProfessionalPhotoAsset } from "@/lib/professional-identity/professional-photo";
import { normalizeCurrentSituation } from "@/lib/professional-identity/current-situation";
import { normalizeLanguageCode, normalizeProfessionalDocumentLanguageChoice } from "@/lib/language/language-preferences";

export type ProfessionalIdentityCompletionSectionKey =
  | "profile"
  | "photo"
  | "personal_information"
  | "location"
  | "nationality"
  | "work_authorization"
  | "career_goal"
  | "professional_summary"
  | "education"
  | "experience"
  | "skills"
  | "projects"
  | "achievements"
  | "certificates"
  | "licences"
  | "languages"
  | "references"
  | "portfolio"
  | "social_profiles"
  | "preferences"
  | "employment_preferences"
  | "salary_expectations"
  | "availability";

export type ProfessionalIdentityImportance = "required" | "recommended" | "optional";

export type ProfessionalIdentityCompletionValues = Partial<{
  profilePhoto: string;
  professional_photo_asset: CanonicalProfessionalPhotoAsset | null;
  full_name: string;
  email: string;
  phone: string;
  current_status: string;
  city: string;
  country: string;
  nationality: string;
  work_authorization: string;
  career_goal: string;
  professional_summary: string;
  education: string[];
  field_of_study: string;
  experience: string[];
  skills: string[];
  projects: string[];
  achievements: string[];
  certificates: string[];
  licences: string[];
  languages: string[];
  references: string[];
  linkedin_url: string;
  portfolio_url: string;
  github_url: string;
  behance_url: string;
  website_url: string;
  preferred_roles: string[];
  industries: string[];
  employment_type: string;
  salary_expectations: string;
  availability: string;
  work_type: string;
  relocation: string;
  interface_language: string;
  professional_document_language: string;
  career_coach_intro_seen: string;
}>;

export type ProfessionalIdentityCompletionSection = {
  key: ProfessionalIdentityCompletionSectionKey;
  label: string;
  importance: ProfessionalIdentityImportance;
};

export type ProfessionalIdentityRequiredCheck = {
  section: ProfessionalIdentityCompletionSectionKey;
  label: string;
  status: "required";
  complete: boolean;
  guidance: string;
  missingFields: string[];
};

export const professionalIdentityCompletionSections: ProfessionalIdentityCompletionSection[] = [
  { key: "profile", label: "Profile", importance: "required" },
  { key: "photo", label: "Photo", importance: "optional" },
  { key: "personal_information", label: "Personal Information", importance: "required" },
  { key: "location", label: "Location", importance: "required" },
  { key: "nationality", label: "Nationality", importance: "required" },
  { key: "work_authorization", label: "Work Authorization", importance: "required" },
  { key: "career_goal", label: "Career Goal", importance: "required" },
  { key: "professional_summary", label: "Professional Summary", importance: "recommended" },
  { key: "education", label: "Education", importance: "required" },
  { key: "experience", label: "Experience", importance: "recommended" },
  { key: "skills", label: "Skills", importance: "required" },
  { key: "projects", label: "Projects", importance: "recommended" },
  { key: "achievements", label: "Achievements", importance: "recommended" },
  { key: "certificates", label: "Certificates", importance: "recommended" },
  { key: "licences", label: "Licences", importance: "optional" },
  { key: "languages", label: "Languages", importance: "recommended" },
  { key: "references", label: "References", importance: "optional" },
  { key: "portfolio", label: "Portfolio", importance: "recommended" },
  { key: "social_profiles", label: "Social Profiles", importance: "recommended" },
  { key: "preferences", label: "Preferences", importance: "required" },
  { key: "employment_preferences", label: "Employment Preferences", importance: "required" },
  { key: "salary_expectations", label: "Salary Expectations", importance: "optional" },
  { key: "availability", label: "Availability", importance: "required" }
];

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function listValue(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function hasText(value: unknown) {
  return textValue(value).length > 0;
}

function hasListText(value: unknown) {
  return listValue(value).length > 0;
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const text = textValue(value);
    if (text) return text;
  }
  return "";
}

function firstList(...values: unknown[]) {
  for (const value of values) {
    const list = listValue(value);
    if (list.length) return list;
  }
  return [];
}

function answerText(discovery: { answers?: Record<string, unknown> | null } | null | undefined, key: string) {
  return textValue(discovery?.answers?.[key]);
}

function answerList(discovery: { answers?: Record<string, unknown> | null } | null | undefined, key: string) {
  return listValue(discovery?.answers?.[key]);
}

export function professionalIdentityValuesFromSources(
  profile?: Record<string, unknown> | null,
  discovery?: { answers?: Record<string, unknown> | null } | null,
  user?: { email?: string | null } | null
): ProfessionalIdentityCompletionValues {
  const answers = discovery?.answers ?? {};
  const currentStatus = normalizeCurrentSituation(firstText(profile?.current_status, profile?.employment_status, answers.current_status, answers.employment_status, answers.currentSituation, answers.current_status_label));
  return {
    profilePhoto: answerText(discovery, "profile_photo"),
    professional_photo_asset: professionalPhotoAssetFromUnknown(answers.professional_photo_asset),
    full_name: textValue(profile?.full_name),
    email: firstText(profile?.email, user?.email),
    phone: textValue(profile?.phone),
    current_status: currentStatus,
    city: textValue(profile?.city),
    country: textValue(profile?.country),
    nationality: answerText(discovery, "nationality"),
    work_authorization: answerText(discovery, "work_authorization"),
    career_goal: firstText(profile?.career_goal, profile?.preferred_path),
    professional_summary: answerText(discovery, "professional_summary"),
    education: firstList(answers.education_history, profile?.education, profile?.highest_qualification),
    field_of_study: textValue(profile?.field_of_study),
    experience: firstList(answers.experience_history, answers.personal_background),
    skills: answerList(discovery, "skills"),
    projects: firstList(answers.projects_history, answers.interests),
    achievements: firstList(answers.achievements_list, answers.achievements),
    certificates: firstList(answers.certificates_list, answers.certifications, profile?.has_certificates ? "Certificates available" : ""),
    licences: answerList(discovery, "licences"),
    languages: firstList(answers.languages, profile?.language),
    references: firstList(answers.references_list, answers.references),
    linkedin_url: textValue(profile?.linkedin_url),
    portfolio_url: textValue(profile?.portfolio_url),
    github_url: answerText(discovery, "github_url"),
    behance_url: answerText(discovery, "behance_url"),
    website_url: answerText(discovery, "website_url"),
    preferred_roles: answerList(discovery, "preferred_roles"),
    industries: answerList(discovery, "industries"),
    employment_type: answerText(discovery, "employment_type"),
    salary_expectations: answerText(discovery, "salary_expectations"),
    availability: answerText(discovery, "availability"),
    work_type: answerText(discovery, "work_type"),
    relocation: answerText(discovery, "relocation"),
    interface_language: normalizeLanguageCode(firstText(answers.interface_language, profile?.language)),
    professional_document_language: normalizeProfessionalDocumentLanguageChoice(answerText(discovery, "professional_document_language")),
    career_coach_intro_seen: answers.career_coach_intro_seen === true || answerText(discovery, "career_coach_intro_seen") === "true" ? "true" : ""
  };
}

export function professionalIdentitySectionHasMeaningfulData(section: ProfessionalIdentityCompletionSectionKey, values: ProfessionalIdentityCompletionValues) {
  if (section === "profile") return hasText(values.current_status);
  if (section === "photo") {
    const asset = values.professional_photo_asset;
    return Boolean(asset?.storagePath && asset.photoStatus === "ready");
  }
  if (section === "personal_information") return hasText(values.full_name) || hasText(values.email) || hasText(values.phone) || hasText(values.current_status);
  if (section === "location") return hasText(values.city) || hasText(values.country);
  if (section === "nationality") return hasText(values.nationality);
  if (section === "work_authorization") return hasText(values.work_authorization);
  if (section === "career_goal") return hasText(values.career_goal);
  if (section === "professional_summary") return hasText(values.professional_summary);
  if (section === "education") return hasText(values.field_of_study) || hasListText(values.education);
  if (section === "experience") return hasListText(values.experience);
  if (section === "skills") return hasListText(values.skills);
  if (section === "projects") return hasListText(values.projects);
  if (section === "achievements") return hasListText(values.achievements);
  if (section === "certificates") return hasListText(values.certificates);
  if (section === "licences") return hasListText(values.licences);
  if (section === "languages") return hasListText(values.languages);
  if (section === "references") return hasListText(values.references);
  if (section === "portfolio") return hasText(values.portfolio_url) || hasText(values.website_url) || hasText(values.behance_url);
  if (section === "social_profiles") return hasText(values.linkedin_url) || hasText(values.github_url);
  if (section === "preferences") return hasText(values.interface_language) || hasText(values.professional_document_language);
  if (section === "employment_preferences") {
    return hasText(values.employment_type) || hasText(values.work_type) || hasText(values.relocation) || hasListText(values.preferred_roles) || hasListText(values.industries);
  }
  if (section === "salary_expectations") return hasText(values.salary_expectations);
  if (section === "availability") return hasText(values.availability);
  return false;
}

export function professionalIdentityMissingFields(section: ProfessionalIdentityCompletionSectionKey, values: ProfessionalIdentityCompletionValues) {
  if (section === "profile") return hasText(values.current_status) ? [] : ["Current situation"];
  if (section === "personal_information") return [hasText(values.full_name) ? "" : "Full name", hasText(values.email) ? "" : "Email"].filter(Boolean);
  if (section === "location") return [hasText(values.city) ? "" : "City", hasText(values.country) ? "" : "Country"].filter(Boolean);
  if (section === "nationality") return hasText(values.nationality) ? [] : ["Nationality"];
  if (section === "work_authorization") return hasText(values.work_authorization) ? [] : ["Work authorization"];
  if (section === "career_goal") return hasText(values.career_goal) ? [] : ["Career goal"];
  if (section === "education") return hasText(values.current_status) || hasText(values.field_of_study) || hasListText(values.education) ? [] : ["Education, field of study, or current status"];
  if (section === "skills") return hasListText(values.skills) ? [] : ["At least one skill"];
  if (section === "preferences") return [hasText(values.interface_language) ? "" : "Interface language", hasText(values.professional_document_language) ? "" : "Professional document language"].filter(Boolean);
  if (section === "employment_preferences") {
    return hasText(values.employment_type) || hasText(values.work_type) || hasListText(values.preferred_roles) || hasListText(values.industries)
      ? []
      : ["Employment type, work type, preferred role, or industry"];
  }
  if (section === "availability") return hasText(values.availability) ? [] : ["Availability"];
  return [];
}

export function professionalIdentitySectionIsComplete(section: ProfessionalIdentityCompletionSectionKey, values: ProfessionalIdentityCompletionValues) {
  const model = professionalIdentityCompletionSections.find((item) => item.key === section);
  if (model?.importance === "required") return professionalIdentityMissingFields(section, values).length === 0;
  return professionalIdentitySectionHasMeaningfulData(section, values);
}

export function professionalIdentityRequiredChecksFromValues(values: ProfessionalIdentityCompletionValues): ProfessionalIdentityRequiredCheck[] {
  return professionalIdentityCompletionSections
    .filter((section) => section.importance === "required")
    .map((section) => ({
      section: section.key,
      label: section.label,
      status: "required" as const,
      complete: professionalIdentitySectionIsComplete(section.key, values),
      missingFields: professionalIdentityMissingFields(section.key, values),
      guidance: guidanceForRequiredSection(section.key)
    }));
}

function guidanceForRequiredSection(section: ProfessionalIdentityCompletionSectionKey) {
  if (section === "personal_information") return "Add the name and email PATHZY can use across your employment journey.";
  if (section === "location") return "Add your city and country for practical guidance.";
  if (section === "nationality") return "Add your nationality where it affects work eligibility or employment documents.";
  if (section === "work_authorization") return "Add truthful work authorization details before PATHZY guides applications.";
  if (section === "career_goal") return "Tell PATHZY the professional direction you want support with.";
  if (section === "education") return "Add education, training, current work, current study, or your current employment status.";
  if (section === "skills") return "Add skills you already use so future documents and job matching stay factual.";
  if (section === "preferences") return "Choose your PATHZY interface language and professional document language.";
  if (section === "employment_preferences") return "Add the work you prefer so future matching stays relevant.";
  if (section === "availability") return "Add when you can realistically start.";
  return "Complete this required Professional Identity section.";
}

export function calculateProfessionalIdentityCompletion(values: ProfessionalIdentityCompletionValues) {
  const sections = professionalIdentityCompletionSections.map((section) => ({
    ...section,
    complete: professionalIdentitySectionIsComplete(section.key, values),
    hasMeaningfulData: professionalIdentitySectionHasMeaningfulData(section.key, values),
    missingFields: professionalIdentityMissingFields(section.key, values)
  }));
  const completedSections = sections.filter((section) => section.complete).length;
  return {
    completedSections,
    totalSections: sections.length,
    percentage: sections.length ? Math.round((completedSections / sections.length) * 100) : 0,
    sections,
    requiredChecks: professionalIdentityRequiredChecksFromValues(values)
  };
}
