"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { normalizePathzyError } from "@/lib/errors/error-normalization";
import { usePathzyLanguage } from "@/components/language/language-selector";
import { formatPathzyStepCount, pathzyPhase2List, pathzyPhase2T, pathzyT, professionalIdentityFieldText, professionalIdentityImportanceLabel, professionalIdentitySectionText, professionalIdentityStepText } from "@/lib/language/pathzy-i18n";
import { languageLabels, normalizeProfessionalDocumentLanguageChoice, normalizeSupportedLanguage, professionalDocumentLanguageLabels, type ProfessionalDocumentLanguageChoice, type SupportedLanguageCode } from "@/lib/language/language-preferences";
import { appRoutes } from "@/lib/navigation/routes";
import {
  calculateProfessionalIdentityCompletion,
  professionalIdentityMissingFields,
  professionalIdentitySectionHasMeaningfulData,
  professionalIdentitySectionIsComplete,
  type ProfessionalIdentityCompletionSectionKey
} from "@/lib/professional-identity/professional-identity-completion";
import {
  PROFESSIONAL_PHOTO_LIMITS,
  isAllowedProfessionalPhotoMimeType,
  validateProfessionalPhotoUploadInput,
  type ProfessionalPhotoAssetView
} from "@/lib/professional-identity/professional-photo";
import { currentSituationDisplayLabel, currentSituationValues, normalizeCurrentSituation } from "@/lib/professional-identity/current-situation";
import { useProfessionalIdentityAutosave } from "@/lib/professional-identity/use-professional-identity-autosave";

export type ProfileSectionKey =
  | "profile"
  | "photo"
  | "profilePhoto"
  | "name"
  | "email"
  | "phone"
  | "personalInfo"
  | "personal_information"
  | "location"
  | "nationality"
  | "work_authorization"
  | "currentStatus"
  | "education"
  | "fieldOfStudy"
  | "careerDirection"
  | "careerGoal"
  | "career_goal"
  | "professionalSummary"
  | "professional_summary"
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
  | "employmentPreferences"
  | "employment_preferences"
  | "salary_expectations"
  | "availability"
  | "uploadedDocuments";

export type ProfileActionRow = {
  section: ProfileSectionKey;
  label: string;
  value: string;
  helper: string;
};

export type ProfessionalIdentityValues = {
  profilePhoto: string;
  professional_photo_asset: ProfessionalPhotoAssetView | null;
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
  interface_language: SupportedLanguageCode | "";
  professional_document_language: ProfessionalDocumentLanguageChoice | "";
  career_coach_intro_seen: string;
};

type FieldConfig = {
  name: keyof ProfessionalIdentityValues;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
};

type SectionAction = {
  title: string;
  description: string;
  fields: FieldConfig[];
};

type JourneyStep = {
  key: Exclude<ProfileSectionKey, "uploadedDocuments" | "name" | "email" | "phone" | "currentStatus" | "fieldOfStudy" | "careerDirection">;
  title: string;
  description: string;
  guidance: string;
  importance: "required" | "recommended" | "optional";
  kind: "fields" | "list" | "skills" | "portfolio" | "preferences" | "photo";
  fields?: FieldConfig[];
  listKey?: ListValueKey;
  suggestions?: string[];
};

type IntroStage = "welcome" | "interfaceLanguage" | "documentLanguage" | "careerCoach" | "professionalIdentityIntroduction" | "identity";

type ListValueKey =
  | "education"
  | "experience"
  | "skills"
  | "projects"
  | "achievements"
  | "certificates"
  | "licences"
  | "languages"
  | "references"
  | "preferred_roles"
  | "industries";

const emptyValues: ProfessionalIdentityValues = {
  profilePhoto: "",
  professional_photo_asset: null,
  full_name: "",
  email: "",
  phone: "",
  current_status: "",
  city: "",
  country: "",
  nationality: "",
  work_authorization: "",
  career_goal: "",
  professional_summary: "",
  education: [],
  field_of_study: "",
  experience: [],
  skills: [],
  projects: [],
  achievements: [],
  certificates: [],
  licences: [],
  languages: [],
  references: [],
  linkedin_url: "",
  portfolio_url: "",
  github_url: "",
  behance_url: "",
  website_url: "",
  preferred_roles: [],
  industries: [],
  employment_type: "",
  salary_expectations: "",
  availability: "",
  work_type: "",
  relocation: "",
  interface_language: "",
  professional_document_language: "",
  career_coach_intro_seen: ""
};

export const profileSectionActions: Record<string, SectionAction> = {
  profilePhoto: {
    title: "Profile Photo",
    description: "Upload, preview, replace, reposition, or remove the professional photo connected to your PATHZY Professional Identity.",
    fields: [{ name: "profilePhoto", label: "Photo status", placeholder: "Professional photo saved" }]
  },
  name: {
    title: "Name editor",
    description: "This name appears in your CV, cover letters, and professional documents.",
    fields: [{ name: "full_name", label: "Full name", placeholder: "Nicka Candida" }]
  },
  email: {
    title: "Email editor",
    description: "Use the email address employers should contact.",
    fields: [{ name: "email", label: "Email", type: "email", placeholder: "name@example.com" }]
  },
  phone: {
    title: "Phone editor",
    description: "Add a reachable phone number for job applications.",
    fields: [{ name: "phone", label: "Phone", type: "tel", placeholder: "+27 00 000 0000" }]
  },
  personalInfo: {
    title: "Personal Information",
    description: "Confirm the basic identity details PATHZY can use in future documents.",
    fields: [
      { name: "full_name", label: "Full name", placeholder: "Nicka Candida" },
      { name: "email", label: "Email", type: "email", placeholder: "name@example.com" },
      { name: "phone", label: "Phone", type: "tel", placeholder: "+27 00 000 0000" },
      { name: "current_status", label: "Current status", placeholder: "Graduate, student, employed, career changer..." }
    ]
  },
  location: {
    title: "Location editor",
    description: "Location, nationality, and work authorization help PATHZY guide applications truthfully.",
    fields: [
      { name: "city", label: "City", placeholder: "Johannesburg" },
      { name: "country", label: "Country", placeholder: "South Africa" },
      { name: "nationality", label: "Nationality", placeholder: "South African" },
      { name: "work_authorization", label: "Work authorization", placeholder: "Authorized to work in South Africa" }
    ]
  },
  currentStatus: {
    title: "Current Status editor",
    description: "Tell PATHZY where you are right now so your documents sound accurate.",
    fields: [{ name: "current_status", label: "Current status", placeholder: "Graduate, student, employed, career changer..." }]
  },
  education: {
    title: "Education editor",
    description: "Add education, training, or learning evidence. You can add more than one item.",
    fields: [{ name: "field_of_study", label: "Field of study", placeholder: "Information Technology" }]
  },
  fieldOfStudy: {
    title: "Field of Study editor",
    description: "Add your main area of study or training.",
    fields: [{ name: "field_of_study", label: "Field of study", placeholder: "Information Technology" }]
  },
  careerDirection: {
    title: "Career Direction editor",
    description: "Choose the direction PATHZY should use when guiding your next steps.",
    fields: [{ name: "career_goal", label: "Selected career direction", placeholder: "Data Analyst" }]
  },
  careerGoal: {
    title: "Career Goal",
    description: "Choose the professional direction PATHZY should use for future guidance.",
    fields: [{ name: "career_goal", label: "Career goal", placeholder: "Data Analyst, IT Support, Project Coordinator..." }]
  },
  professionalSummary: {
    title: "Professional Summary",
    description: "A short truthful summary helps PATHZY position your documents without inventing facts.",
    fields: [{ name: "professional_summary", label: "Professional summary", type: "textarea", placeholder: "Write a short summary of who you are professionally and where you are going." }]
  },
  experience: {
    title: "Experience editor",
    description: "No formal experience yet? Use volunteering, school projects, family work, leadership, or transferable skills.",
    fields: [{ name: "experience", label: "Experience", type: "textarea", placeholder: "Describe relevant experience honestly." }]
  },
  skills: {
    title: "Skills editor",
    description: "Add skills you want PATHZY to use in future documents and job matching.",
    fields: [{ name: "skills", label: "Skills", type: "textarea", placeholder: "Excel, communication, customer service, SQL" }]
  },
  projects: {
    title: "Projects editor",
    description: "Add coursework, portfolio work, case studies, community work, or practical examples.",
    fields: [{ name: "projects", label: "Projects", type: "textarea", placeholder: "Describe a project and what it proves." }]
  },
  achievements: {
    title: "Achievements editor",
    description: "Add achievements that show effort, consistency, leadership, or results.",
    fields: [{ name: "achievements", label: "Achievements", type: "textarea", placeholder: "Awards, milestones, academic results, community wins..." }]
  },
  certificates: {
    title: "Certificates editor",
    description: "Add certificates, qualifications, and short courses. Upload support stays in My Documents.",
    fields: [{ name: "certificates", label: "Certificates", type: "textarea", placeholder: "Google Data Analytics Certificate, Excel course..." }]
  },
  licences: {
    title: "Licences",
    description: "Add licences or professional registrations that employers may need to verify.",
    fields: [{ name: "licences", label: "Licences", type: "textarea", placeholder: "Driver's licence, professional registration, trade licence..." }]
  },
  languages: {
    title: "Languages editor",
    description: "Add languages you can use professionally.",
    fields: [{ name: "languages", label: "Languages", placeholder: "English, French" }]
  },
  references: {
    title: "References editor",
    description: "Add reference notes or people you may ask for employment references.",
    fields: [{ name: "references", label: "References", type: "textarea", placeholder: "Available on request, or add reference details." }]
  },
  portfolio: {
    title: "Portfolio and Social Profiles",
    description: "Add links that show your work or professional presence.",
    fields: [
      { name: "linkedin_url", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
      { name: "github_url", label: "GitHub", placeholder: "https://github.com/..." },
      { name: "portfolio_url", label: "Portfolio", placeholder: "https://..." },
      { name: "website_url", label: "Website", placeholder: "https://..." },
      { name: "behance_url", label: "Behance", placeholder: "https://behance.net/..." }
    ]
  },
  employmentPreferences: {
    title: "Employment Preferences",
    description: "Tell PATHZY what kind of work you are aiming for. This guides future opportunities without blocking you.",
    fields: [
      { name: "employment_type", label: "Employment type", placeholder: "Full-time, part-time, contract, internship" },
      { name: "salary_expectations", label: "Salary expectations", placeholder: "Optional" },
      { name: "availability", label: "Availability", placeholder: "Immediately, 2 weeks, after graduation..." },
      { name: "work_type", label: "Work type", placeholder: "Remote, hybrid, on-site" },
      { name: "relocation", label: "Relocation", placeholder: "Open to relocate, not available, depends on role" }
    ]
  },
  preferences: {
    title: "Preferences",
    description: "Choose how PATHZY should speak to you and which language professional documents should use.",
    fields: [
      { name: "interface_language", label: "Interface language" },
      { name: "professional_document_language", label: "Professional document language" }
    ]
  }
};

const journeySteps: JourneyStep[] = [
  { key: "profile", title: "Profile", description: "Set the starting context for your Professional Identity.", guidance: "One step at a time. Your progress is saved, and this profile will power documents, matching, applications, interviews, and Coach.", importance: "required", kind: "fields", fields: [{ name: "current_status", label: "Current situation", placeholder: "Student, graduate, employed, unemployed, career changer..." }] },
  { key: "photo", title: "Photo", description: "Capture whether you have a professional photo ready.", guidance: "This is optional. You can continue without a photo and upload supporting files later.", importance: "optional", kind: "photo", fields: profileSectionActions.profilePhoto.fields },
  { key: "personal_information", title: "Personal Information", description: "Confirm the identity details employers and documents will use.", guidance: "Use the name, email, and phone number that should appear in your professional materials.", importance: "required", kind: "fields", fields: profileSectionActions.personalInfo.fields },
  { key: "location", title: "Location", description: "Add the location employers should understand.", guidance: "Use the city and country you want PATHZY to use for documents, job matching, and practical next steps.", importance: "required", kind: "fields", fields: [{ name: "city", label: "City", placeholder: "Johannesburg" }, { name: "country", label: "Country", placeholder: "South Africa" }] },
  { key: "nationality", title: "Nationality", description: "Keep nationality separate from work authorization.", guidance: "Add only what is true and relevant. PATHZY keeps this separate from eligibility to work.", importance: "required", kind: "fields", fields: [{ name: "nationality", label: "Nationality", placeholder: "South African" }] },
  { key: "work_authorization", title: "Work Authorization", description: "Add truthful work eligibility details.", guidance: "Do not guess. PATHZY will use this later to avoid unsuitable application guidance.", importance: "required", kind: "fields", fields: [{ name: "work_authorization", label: "Work authorization", placeholder: "Authorized to work in South Africa" }] },
  { key: "career_goal", title: "Career Goal", description: "Choose the direction PATHZY should use as your professional north star.", guidance: "You can change this later. A clear target helps documents, jobs, and coaching feel more relevant.", importance: "required", kind: "fields", fields: profileSectionActions.careerGoal.fields },
  { key: "professional_summary", title: "Professional Summary", description: "Write a short foundation statement in your own words.", guidance: "Tell us a little about your background and goals. You can improve this later.", importance: "recommended", kind: "fields", fields: profileSectionActions.professionalSummary.fields },
  { key: "education", title: "Education", description: "Add education, training, modules, or learning evidence.", guidance: "Add formal education, incomplete studies, short courses, current work, current study, or relevant learning.", importance: "required", kind: "list", listKey: "education", fields: [{ name: "field_of_study", label: "Field of study", placeholder: "Information Technology, Business, Healthcare..." }] },
  { key: "experience", title: "Experience", description: "Capture work and transferable experience.", guidance: "Do not have professional experience yet? That is okay. PATHZY can help you use education, projects, volunteering, and transferable skills.", importance: "recommended", kind: "list", listKey: "experience" },
  { key: "skills", title: "Skills", description: "Build a skill foundation PATHZY can reuse later.", guidance: "Select skills you already use or add your own. PATHZY removes duplicates before saving.", importance: "required", kind: "skills", listKey: "skills" },
  { key: "projects", title: "Projects", description: "Add practical proof of what you can do.", guidance: "Projects can come from school, portfolio work, community activities, side work, or self-learning.", importance: "recommended", kind: "list", listKey: "projects" },
  { key: "achievements", title: "Achievements", description: "Capture evidence of effort, progress, and results.", guidance: "Use achievements from school, work, community, sport, volunteering, or personal growth.", importance: "recommended", kind: "list", listKey: "achievements" },
  { key: "certificates", title: "Certificates", description: "Add certificates or courses you have completed.", guidance: "Manual entry is enough for now. Upload support will stay in My Documents when needed.", importance: "recommended", kind: "list", listKey: "certificates" },
  { key: "licences", title: "Licences", description: "Add licences or professional registrations.", guidance: "Add only licences you actually hold or are actively completing.", importance: "optional", kind: "list", listKey: "licences" },
  { key: "languages", title: "Languages", description: "Add languages you can use professionally.", guidance: "Add language and level if useful, for example English - professional, French - conversational.", importance: "recommended", kind: "list", listKey: "languages" },
  { key: "references", title: "References", description: "Prepare references without exposing them too early.", guidance: "You can write Available on request or add people you may ask later. Private notes stay in PATHZY.", importance: "optional", kind: "list", listKey: "references" },
  { key: "portfolio", title: "Portfolio", description: "Add portfolio or website links that support your identity.", guidance: "Use links that show work, evidence, projects, or a professional presence.", importance: "recommended", kind: "portfolio", fields: [{ name: "portfolio_url", label: "Portfolio", placeholder: "https://..." }, { name: "website_url", label: "Website", placeholder: "https://..." }, { name: "behance_url", label: "Behance", placeholder: "https://behance.net/..." }] },
  { key: "social_profiles", title: "Social Profiles", description: "Add professional social links separately from portfolio evidence.", guidance: "LinkedIn and GitHub are useful signals, but they remain separate from your core identity facts.", importance: "recommended", kind: "portfolio", fields: [{ name: "linkedin_url", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." }, { name: "github_url", label: "GitHub", placeholder: "https://github.com/..." }] },
  { key: "preferences", title: "Preferences", description: "Choose how PATHZY should support you.", guidance: "Interface language controls PATHZY navigation and guidance. Document language controls CVs, cover letters, bios, and related professional materials.", importance: "required", kind: "fields", fields: profileSectionActions.preferences.fields },
  { key: "employment_preferences", title: "Employment Preferences", description: "Tell PATHZY what work you are aiming for.", guidance: "Preferred roles, industries, work type, and relocation guide future matching. They do not lock you in.", importance: "required", kind: "preferences", fields: profileSectionActions.employmentPreferences.fields },
  { key: "salary_expectations", title: "Salary Expectations", description: "Add salary preferences only if you are comfortable.", guidance: "Salary expectations are optional and are not inserted into documents by default.", importance: "optional", kind: "fields", fields: [{ name: "salary_expectations", label: "Salary expectations", placeholder: "Optional amount, range, currency, frequency, negotiability" }] },
  { key: "availability", title: "Availability", description: "Tell PATHZY when you can realistically start.", guidance: "Availability helps with applications and interviews. Immediate and future availability are both acceptable.", importance: "required", kind: "fields", fields: [{ name: "availability", label: "Availability", placeholder: "Immediately, 2 weeks, after graduation..." }] }
];

const sectionAliases: Partial<Record<ProfileSectionKey | string, JourneyStep["key"]>> = {
  profile: "profile",
  profilePhoto: "photo",
  photo: "photo",
  personal_information: "personal_information",
  personalInfo: "personal_information",
  nationality: "nationality",
  work_authorization: "work_authorization",
  career_goal: "career_goal",
  careerGoal: "career_goal",
  professional_summary: "professional_summary",
  professionalSummary: "professional_summary",
  certificates: "certificates",
  social_profiles: "social_profiles",
  preferences: "preferences",
  employment_preferences: "employment_preferences",
  salary_expectations: "salary_expectations",
  availability: "availability",
  name: "personal_information",
  email: "personal_information",
  phone: "personal_information",
  currentStatus: "profile",
  fieldOfStudy: "education",
  careerDirection: "career_goal"
};

const storageKey = "pathzy:professional-identity-step";
const professionalPhotoUploadTimeoutMs = 30_000;

function cleanList(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value.map((item) => String(item ?? ""))
    : typeof value === "string"
      ? value.split(/\r?\n|,/)
      : [];
  const seen = new Set<string>();
  return raw
    .map((item) => item.trim())
    .filter((item) => {
      if (!item) return false;
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function editableList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item ?? ""));
  if (typeof value === "string" && value.length) return value.split(/\r?\n|,/);
  return [];
}

function stepIsComplete(step: JourneyStep, values: ProfessionalIdentityValues) {
  return professionalIdentitySectionIsComplete(step.key as ProfessionalIdentityCompletionSectionKey, values);
}

function stepPayload(step: JourneyStep, values: ProfessionalIdentityValues) {
  if (step.key === "education") {
    return { education: values.education, field_of_study: values.field_of_study };
  }
  if (step.key === "portfolio") {
    return {
      portfolio_url: values.portfolio_url,
      website_url: values.website_url,
      behance_url: values.behance_url
    };
  }
  if (step.key === "social_profiles") {
    return {
      linkedin_url: values.linkedin_url,
      github_url: values.github_url
    };
  }
  if (step.key === "preferences") {
    return {
      interface_language: values.interface_language,
      professional_document_language: values.professional_document_language,
      career_coach_intro_seen: values.career_coach_intro_seen
    };
  }
  if (step.key === "employment_preferences") {
    return {
      preferred_roles: values.preferred_roles,
      industries: values.industries,
      employment_type: values.employment_type,
      salary_expectations: values.salary_expectations,
      availability: values.availability,
      work_type: values.work_type,
      relocation: values.relocation
    };
  }
  if (step.key === "salary_expectations") return { salary_expectations: values.salary_expectations };
  if (step.key === "availability") return { availability: values.availability };
  if (step.kind === "fields" || step.kind === "photo") {
    return Object.fromEntries((step.fields ?? []).map((field) => [field.name, values[field.name]]));
  }
  if (step.listKey) return { [step.listKey]: values[step.listKey] };
  return {};
}

export function ProfileActionEditor({
  rows,
  initialSection,
  initialIntroStage,
  initialValues,
  returnTo
}: {
  rows: ProfileActionRow[];
  initialSection?: string;
  initialIntroStage?: IntroStage;
  initialValues?: Partial<ProfessionalIdentityValues>;
  returnTo?: string;
}) {
  const router = useRouter();
  const mergedInitialValues = useMemo(() => ({ ...emptyValues, ...initialValues }), [initialValues]);
  const requestedStep = (sectionAliases[initialSection ?? ""] ?? initialSection) as JourneyStep["key"] | undefined;
  const requestedIndex = journeySteps.findIndex((step) => step.key === requestedStep);
  const requestedPreferences = requestedStep === "preferences";
  const resolvedInitialIntroStage: IntroStage = initialIntroStage ?? (requestedIndex >= 0 && !requestedPreferences
    ? "identity"
    : requestedPreferences
      ? "interfaceLanguage"
      : !mergedInitialValues.interface_language
        ? "welcome"
        : !mergedInitialValues.professional_document_language
          ? "documentLanguage"
          : mergedInitialValues.career_coach_intro_seen === "true"
            ? "professionalIdentityIntroduction"
            : "careerCoach");
  const firstIncompleteIndex = journeySteps.findIndex((step) => step.importance === "required" && !stepIsComplete(step, mergedInitialValues));
  const [activeIndex, setActiveIndex] = useState(requestedIndex >= 0 ? requestedIndex : firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
  const [introStage, setIntroStage] = useState<IntroStage>(resolvedInitialIntroStage);
  const [values, setValues] = useState<ProfessionalIdentityValues>(mergedInitialValues);
  const [photoStatus, setPhotoStatus] = useState<"idle" | "preparing" | "uploading" | "processing" | "saved" | "removing" | "error">("idle");
  const [photoMessage, setPhotoMessage] = useState("");
  const [localPhotoPreview, setLocalPhotoPreview] = useState("");
  const [lastPhotoFile, setLastPhotoFile] = useState<File | null>(null);
  const [showCropControls, setShowCropControls] = useState(false);
  const { language: storedInterfaceLanguage, setLanguage: setPathzyInterfaceLanguage } = usePathzyLanguage(mergedInitialValues.interface_language);
  const activeStep = introStage === "identity" && activeIndex >= 0 ? journeySteps[activeIndex] : null;
  const activeLanguage: SupportedLanguageCode = normalizeSupportedLanguage(values.interface_language, storedInterfaceLanguage);
  const buildStepPayload = useCallback((step: JourneyStep, nextValues: ProfessionalIdentityValues) => stepPayload(step, nextValues), []);
  const {
    autosaveState,
    message,
    setMessage,
    hasHydrated,
    persistStep,
    scheduleAutosave,
    persistOnboardingProgress,
    retrySave: retryActiveSave
  } = useProfessionalIdentityAutosave<ProfessionalIdentityValues, JourneyStep>({
    activeStep,
    activeLanguage,
    buildPayload: buildStepPayload,
    debounceMs: 700
  });
  const t = (key: Parameters<typeof pathzyT>[1]) => pathzyT(activeLanguage, key);
  const professionalDocumentLanguage: SupportedLanguageCode =
    normalizeProfessionalDocumentLanguageChoice(values.professional_document_language) === "fr"
      ? "fr"
      : normalizeProfessionalDocumentLanguageChoice(values.professional_document_language) === "en"
        ? "en"
        : activeLanguage;
  const sectionTitle = (step: JourneyStep) => professionalIdentitySectionText(activeLanguage, step.key, step.title);
  const stepDescription = (step: JourneyStep) => professionalIdentityStepText(activeLanguage, step.key, "description", step.description);
  const stepGuidance = (step: JourneyStep) => professionalIdentityStepText(activeLanguage, step.key, "guidance", step.guidance);
  const fieldLabel = (field: FieldConfig) => professionalIdentityFieldText(activeLanguage, field.name, "label", field.label);
  const fieldPlaceholder = (field: FieldConfig) => professionalIdentityFieldText(activeLanguage, field.name, "placeholder", field.placeholder ?? "");
  const importanceLabel = (importance: JourneyStep["importance"]) => professionalIdentityImportanceLabel(activeLanguage, importance);
  const itemTitle = (step: JourneyStep) => {
    if (step.listKey === "preferred_roles") return pathzyPhase2T(activeLanguage, "identity.ui.preferredRole");
    if (step.listKey === "industries") return pathzyPhase2T(activeLanguage, "identity.ui.industry");
    return sectionTitle(step);
  };
  const professionalDocumentLanguageLabel = (choice: ProfessionalDocumentLanguageChoice) =>
    choice === "same_as_interface" ? t("onboarding.document.sameAsInterface") : professionalDocumentLanguageLabels[choice];
  const identityCompletion = calculateProfessionalIdentityCompletion(values);
  const requiredSteps = journeySteps.filter((step) => step.importance === "required");
  const requiredComplete = requiredSteps.every((step) => stepIsComplete(step, values));
  const missingRequiredSteps = requiredSteps
    .map((step) => ({ step, missingFields: missingFieldsForStep(step) }))
    .filter((item) => !stepIsComplete(item.step, values));
  const progress = identityCompletion.percentage;
  const premiumOnboardingOrder: IntroStage[] = ["welcome", "interfaceLanguage", "documentLanguage", "careerCoach", "professionalIdentityIntroduction"];
  const premiumOnboardingIndex = premiumOnboardingOrder.indexOf(introStage);
  const introShellStep = premiumOnboardingIndex >= 0 ? premiumOnboardingIndex + 1 : 1;
  const introShellTotal = premiumOnboardingOrder.length;
  const shellProgress = introStage === "identity" ? progress : Math.round((introShellStep / introShellTotal) * 100);
  const reviewHref = `${appRoutes.professionalIdentity}?review=1`;
  const shouldReturnToReview = returnTo === "review" || returnTo === reviewHref;
  const photoInputId = "pathzy-professional-photo-input";
  const currentPhoto = values.professional_photo_asset;
  const photoPreviewUrl = localPhotoPreview || currentPhoto?.signedUrl || "";
  const photoBusy = ["preparing", "uploading", "processing", "removing"].includes(photoStatus);
  const photoNavigationBlocked = activeStep?.key === "photo" && (photoBusy || photoStatus === "error");
  const saveStatusLabel =
    autosaveState === "dirty"
      ? t("onboarding.save.unsaved")
      : autosaveState === "saving" || autosaveState === "retrying"
        ? t("onboarding.save.saving")
        : autosaveState === "still-saving"
          ? t("onboarding.save.stillSaving")
          : autosaveState === "error"
            ? t("onboarding.save.error")
            : autosaveState === "saved"
              ? t("onboarding.save.saved")
              : t("onboarding.save.ready");
  const saveStatusClasses =
    autosaveState === "dirty"
      ? "bg-[#eff6ff] text-[#1d4ed8]"
      : autosaveState === "saving" || autosaveState === "retrying" || autosaveState === "still-saving"
        ? "bg-[#fffbeb] text-[#92400e]"
        : autosaveState === "error"
          ? "bg-[#fef2f2] text-[#b91c1c]"
          : "bg-[#ecfdf5] text-[#047857]";

  function missingFieldsForStep(step: JourneyStep) {
    const missingFields = professionalIdentityMissingFields(step.key as ProfessionalIdentityCompletionSectionKey, values);
    return missingFields.length ? missingFields : professionalIdentitySectionHasMeaningfulData(step.key as ProfessionalIdentityCompletionSectionKey, values) ? [] : [sectionTitle(step)];
  }

  function openRequiredStep(step: JourneyStep) {
    const index = journeySteps.findIndex((candidate) => candidate.key === step.key);
    if (index >= 0) {
      setIntroStage("identity");
      setActiveIndex(index);
    }
  }

  useEffect(() => {
    setValues((current) => (hasHydrated.current ? { ...mergedInitialValues, ...current } : mergedInitialValues));
  }, [hasHydrated, mergedInitialValues]);

  useEffect(() => {
    setValues((current) => (current.interface_language === storedInterfaceLanguage ? current : { ...current, interface_language: storedInterfaceLanguage }));
  }, [storedInterfaceLanguage]);

  useEffect(() => {
    if (activeStep?.key !== "photo") return;
    let cancelled = false;
    fetch("/api/professional-identity/photo", { method: "GET" })
      .then((response) => response.json())
      .then((data) => {
        if (cancelled || !data?.photo) return;
        setValues((current) => ({ ...current, profilePhoto: "Professional photo saved", professional_photo_asset: data.photo }));
      })
      .catch(() => {
        if (!cancelled) setPhotoMessage(pathzyPhase2T(activeLanguage, "identity.photo.loadWarning"));
      });
    return () => {
      cancelled = true;
    };
  }, [activeStep?.key, activeLanguage]);

  useEffect(() => {
    return () => {
      if (localPhotoPreview) URL.revokeObjectURL(localPhotoPreview);
    };
  }, [localPhotoPreview]);

  useEffect(() => {
    if (requestedIndex >= 0) {
      setActiveIndex(requestedIndex);
      setIntroStage(requestedPreferences ? "interfaceLanguage" : "identity");
      return;
    }
    const stored = window.localStorage.getItem(storageKey);
    const storedIndex = stored ? Number(stored) : NaN;
    if (introStage === "identity" && Number.isInteger(storedIndex) && storedIndex >= 0 && storedIndex < journeySteps.length) {
      setActiveIndex(storedIndex);
    }
  }, [introStage, requestedIndex, requestedPreferences]);

  useEffect(() => {
    if (activeIndex >= 0) window.localStorage.setItem(storageKey, String(activeIndex));
  }, [activeIndex]);

  useEffect(() => {
    router.prefetch(reviewHref);
  }, [reviewHref, router]);

  async function persistPreferences(nextValues: ProfessionalIdentityValues) {
    const preferencesStep = journeySteps.find((step) => step.key === "preferences");
    if (!preferencesStep) return true;
    return persistStep(preferencesStep, nextValues);
  }

  function updateValue<K extends keyof ProfessionalIdentityValues>(key: K, value: ProfessionalIdentityValues[K]) {
    setValues((current) => {
      if (Object.is(current[key], value)) return current;
      const next = { ...current, [key]: value };
      if (hasHydrated.current) scheduleAutosave(next);
      return next;
    });
  }

  function photoErrorMessage(errorCode: unknown, fallback = "upload_failed") {
    const code = typeof errorCode === "string" && errorCode.trim() ? errorCode.trim() : fallback;
    return pathzyPhase2T(activeLanguage, `identity.photo.error.${code}` as Parameters<typeof pathzyPhase2T>[1]);
  }

  function updateInterfaceLanguage(language: SupportedLanguageCode) {
    setPathzyInterfaceLanguage(language);
    updateValue("interface_language", language);
  }

  function addListItem(key: ListValueKey, value = "") {
    const list = editableList(values[key]);
    updateValue(key, [...list, value]);
  }

  function updateListItem(key: ListValueKey, index: number, value: string) {
    const list = editableList(values[key]);
    list[index] = value;
    updateValue(key, list);
  }

  function removeListItem(key: ListValueKey, index: number) {
    const list = editableList(values[key]).filter((_, itemIndex) => itemIndex !== index);
    updateValue(key, list);
  }

  async function goNext(options: { allowPhotoError?: boolean } = {}) {
    if (introStage !== "identity") {
      if (introStage === "welcome") {
        const saved = await persistOnboardingProgress("welcome_completed");
        if (saved === false) return;
        setIntroStage("interfaceLanguage");
        return;
      }
      if (introStage === "interfaceLanguage") {
        if (!values.interface_language) {
          setMessage(t("onboarding.interface.required"));
          return;
        }
        const saved = await persistPreferences(values);
        if (saved === false) return;
        const progressSaved = await persistOnboardingProgress("interface_language_completed");
        if (progressSaved === false) return;
        setIntroStage("documentLanguage");
        return;
      }
      if (introStage === "documentLanguage") {
        if (!values.professional_document_language) {
          setMessage(t("onboarding.document.required"));
          return;
        }
        const saved = await persistPreferences(values);
        if (saved === false) return;
        const progressSaved = await persistOnboardingProgress("document_language_completed");
        if (progressSaved === false) return;
        setIntroStage("careerCoach");
        return;
      }
      if (introStage === "careerCoach") {
        const nextValues = { ...values, career_coach_intro_seen: "true" };
        setValues(nextValues);
        const saved = await persistPreferences(nextValues);
        if (saved === false) return;
        const progressSaved = await persistOnboardingProgress("coach_intro_completed");
        if (progressSaved === false) return;
        setIntroStage("professionalIdentityIntroduction");
        return;
      }
      if (introStage === "professionalIdentityIntroduction") {
        const introSaved = await persistOnboardingProgress("professional_identity_intro_completed");
        if (introSaved === false) return;
        const saved = await persistOnboardingProgress("identity_started");
        if (saved === false) return;
        setIntroStage("identity");
        setActiveIndex(0);
        return;
      }
      return;
    }
    if (activeIndex < 0) {
      setActiveIndex(0);
      return;
    }
    if (activeStep?.key === "photo" && (photoBusy || (photoStatus === "error" && !options.allowPhotoError))) {
      setPhotoMessage(photoBusy ? pathzyPhase2T(activeLanguage, "identity.photo.waitForUpload") : pathzyPhase2T(activeLanguage, "identity.photo.error.upload_failed"));
      return;
    }
    if (activeStep) {
      const saved = await persistStep(activeStep, values);
      if (saved === false) return;
      if (shouldReturnToReview && stepIsComplete(activeStep, values)) {
        router.push(`${reviewHref}#identity-review-${activeStep.key}`);
        return;
      }
    }
    setActiveIndex((current) => Math.min(journeySteps.length - 1, current + 1));
  }

  async function goBack() {
    if (introStage !== "identity") {
      const order: IntroStage[] = ["welcome", "interfaceLanguage", "documentLanguage", "careerCoach", "professionalIdentityIntroduction", "identity"];
      const currentIndex = order.indexOf(introStage);
      setIntroStage(order[Math.max(0, currentIndex - 1)]);
      return;
    }
    if (activeStep) {
      const saved = await persistStep(activeStep, values);
      if (saved === false) return;
    }
    if (activeIndex <= 0) {
      setIntroStage("professionalIdentityIntroduction");
      return;
    }
    setActiveIndex((current) => Math.max(0, current - 1));
  }

  async function openReview() {
    if (activeStep) {
      const saved = await persistStep(activeStep, values);
      if (saved === false) return;
    }
    router.push(activeStep ? `${reviewHref}#identity-review-${activeStep.key}` : reviewHref);
  }

  function retrySave() {
    retryActiveSave(values);
  }

  function readBrowserImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        const dimensions = { width: image.naturalWidth, height: image.naturalHeight };
        URL.revokeObjectURL(url);
        resolve(dimensions);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("corrupted_image"));
      };
      image.src = url;
    });
  }

  function updateLocalPhotoPreview(file: File) {
    const url = URL.createObjectURL(file);
    setLocalPhotoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return url;
    });
  }

  async function continueWithoutPhoto() {
    setPhotoStatus("idle");
    setPhotoMessage("");
    setLastPhotoFile(null);
    setLocalPhotoPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
    await goNext({ allowPhotoError: true });
  }

  async function uploadPhotoFile(file: File | null) {
    if (!file) return;
    setLastPhotoFile(file);
    setPhotoStatus("preparing");
    setPhotoMessage(pathzyPhase2T(activeLanguage, "identity.photo.preparing"));

    try {
      if (!isAllowedProfessionalPhotoMimeType(file.type)) {
        throw new Error(photoErrorMessage("unsupported_mime_type"));
      }
      updateLocalPhotoPreview(file);
      const dimensions = await readBrowserImageDimensions(file);
      const validation = validateProfessionalPhotoUploadInput({
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        width: dimensions.width,
        height: dimensions.height
      });
      if (!validation.ok) {
        throw new Error(photoErrorMessage(validation.errors[0] ?? "upload_failed"));
      }

      setPhotoStatus("uploading");
      setPhotoMessage(pathzyPhase2T(activeLanguage, "identity.photo.uploading"));
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("photoConsent", "true");
      formData.append("profileVisibility", currentPhoto?.profileVisibility === "profile" ? "profile" : "private");
      formData.append("cvUsageAllowed", currentPhoto?.cvUsageAllowed ? "true" : "false");
      formData.append("publicSharingAllowed", currentPhoto?.publicSharingAllowed ? "true" : "false");

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), professionalPhotoUploadTimeoutMs);
      const response = await fetch("/api/professional-identity/photo", { method: "POST", body: formData, signal: controller.signal })
        .catch((caught) => {
          if (caught instanceof DOMException && caught.name === "AbortError") {
            throw new Error(photoErrorMessage("upload_timeout"));
          }
          throw caught;
        })
        .finally(() => window.clearTimeout(timeoutId));
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.photo) {
        throw new Error(photoErrorMessage(data?.code, "upload_failed"));
      }

      setPhotoStatus("processing");
      setPhotoMessage(pathzyPhase2T(activeLanguage, "identity.photo.processing"));
      setValues((current) => ({ ...current, profilePhoto: "Professional photo saved", professional_photo_asset: data.photo }));
      setLocalPhotoPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return "";
      });
      setPhotoStatus("saved");
      setPhotoMessage(pathzyPhase2T(activeLanguage, "identity.photo.saved"));
    } catch (caught) {
      setPhotoStatus("error");
      setPhotoMessage(caught instanceof Error && caught.message ? caught.message : photoErrorMessage("upload_failed"));
      setLocalPhotoPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return "";
      });
    }
  }

  async function updatePhotoPermissions(patch: Partial<Pick<ProfessionalPhotoAssetView, "profileVisibility" | "cvUsageAllowed" | "publicSharingAllowed" | "crop">>) {
    if (!currentPhoto) return;
    const optimistic = { ...currentPhoto, ...patch, updatedAt: new Date().toISOString() };
    setValues((current) => ({ ...current, professional_photo_asset: optimistic }));
    setPhotoStatus("processing");
    setPhotoMessage(pathzyPhase2T(activeLanguage, "identity.photo.processing"));
    try {
      const response = await fetch("/api/professional-identity/photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(optimistic)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.photo) throw new Error(photoErrorMessage(data?.code, "metadata_failed"));
      setValues((current) => ({ ...current, professional_photo_asset: data.photo }));
      setPhotoStatus("saved");
      setPhotoMessage(pathzyPhase2T(activeLanguage, "identity.photo.saved"));
    } catch (caught) {
      setPhotoStatus("error");
      setPhotoMessage(caught instanceof Error && caught.message ? caught.message : photoErrorMessage("metadata_failed"));
    }
  }

  async function removePhoto() {
    setPhotoStatus("removing");
    setPhotoMessage(pathzyPhase2T(activeLanguage, "identity.photo.removing"));
    try {
      const response = await fetch("/api/professional-identity/photo", { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(photoErrorMessage(data?.code, "delete_failed"));
      setValues((current) => ({ ...current, profilePhoto: "", professional_photo_asset: null }));
      setLocalPhotoPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return "";
      });
      setPhotoStatus("saved");
      setPhotoMessage(pathzyPhase2T(activeLanguage, "identity.photo.removed"));
    } catch (caught) {
      setPhotoStatus("error");
      setPhotoMessage(caught instanceof Error && caught.message ? caught.message : photoErrorMessage("delete_failed"));
    }
  }

  function renderPhotoSection() {
    const statusText =
      photoStatus === "preparing"
        ? pathzyPhase2T(activeLanguage, "identity.photo.preparing")
        : photoStatus === "uploading"
          ? pathzyPhase2T(activeLanguage, "identity.photo.uploading")
          : photoStatus === "processing"
            ? pathzyPhase2T(activeLanguage, "identity.photo.processing")
            : photoStatus === "removing"
              ? pathzyPhase2T(activeLanguage, "identity.photo.removing")
              : photoStatus === "saved"
                ? pathzyPhase2T(activeLanguage, "identity.photo.saved")
                : photoStatus === "error"
                  ? photoMessage
                  : currentPhoto
                    ? pathzyPhase2T(activeLanguage, "identity.photo.ready")
                    : pathzyPhase2T(activeLanguage, "identity.photo.empty");
    const crop = currentPhoto?.crop ?? null;
    return (
      <div className="grid gap-5 md:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[24px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
          <div className="grid min-h-72 place-items-center overflow-hidden rounded-[22px] border border-dashed border-[#cbd5e1] bg-white">
            {photoPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreviewUrl} alt={pathzyPhase2T(activeLanguage, "identity.photo.previewAlt")} className="h-full max-h-80 w-full object-cover" />
            ) : (
              <div className="p-6 text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#eff6ff] text-2xl font-semibold text-[#2563EB]">PH</div>
                <p className="mt-4 text-lg font-semibold text-[#111827]">{pathzyPhase2T(activeLanguage, "identity.photo.emptyTitle")}</p>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">{pathzyPhase2T(activeLanguage, "identity.photo.emptyBody")}</p>
              </div>
            )}
          </div>
          <p aria-live="polite" className={`mt-3 rounded-[18px] px-4 py-3 text-sm font-semibold ${photoStatus === "error" ? "bg-[#fef2f2] text-[#b91c1c]" : "bg-[#eff6ff] text-[#1e3a8a]"}`}>
            {statusText}
          </p>
        </div>
        <div className="grid content-start gap-4">
          <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-4">
            <p className="text-sm font-bold text-[#111827]">{pathzyPhase2T(activeLanguage, "identity.photo.uploadTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">{pathzyPhase2T(activeLanguage, "identity.photo.guidance")}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              {pathzyPhase2T(activeLanguage, "identity.photo.accepted")} JPEG, PNG, WebP · {Math.round(PROFESSIONAL_PHOTO_LIMITS.maxFileSizeBytes / 1024 / 1024)}MB
            </p>
            <input
              id={photoInputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={photoBusy}
              onChange={(event) => {
                const input = event.currentTarget;
                const file = input.files?.[0] ?? null;
                void uploadPhotoFile(file).finally(() => {
                  input.value = "";
                });
              }}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <label htmlFor={photoInputId} className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full bg-[#2563EB] px-5 py-3 text-sm font-bold text-white shadow-[0_16px_34px_rgba(37,99,235,.18)] ${photoBusy ? "pointer-events-none opacity-60" : "hover:bg-[#1D4ED8]"}`}>
                {currentPhoto ? pathzyPhase2T(activeLanguage, "identity.photo.replace") : pathzyPhase2T(activeLanguage, "identity.photo.add")}
              </label>
              <label htmlFor={photoInputId} className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-[#d1d5db] bg-white px-5 py-3 text-sm font-bold text-[#374151] ${photoBusy ? "pointer-events-none opacity-60" : "hover:border-[#2563EB] hover:text-[#2563EB]"}`}>
                {pathzyPhase2T(activeLanguage, "identity.photo.chooseDevice")}
              </label>
              {photoStatus === "error" && lastPhotoFile ? (
                <button type="button" onClick={() => uploadPhotoFile(lastPhotoFile)} className="rounded-full border border-[#fecaca] bg-white px-5 py-3 text-sm font-bold text-[#b91c1c]">
                  {pathzyPhase2T(activeLanguage, "identity.photo.retry")}
                </button>
              ) : null}
              {photoStatus === "error" ? (
                <button type="button" onClick={continueWithoutPhoto} className="rounded-full border border-[#d1d5db] bg-white px-5 py-3 text-sm font-bold text-[#374151]">
                  {pathzyPhase2T(activeLanguage, "identity.photo.continueWithout")}
                </button>
              ) : null}
            </div>
          </div>

          {currentPhoto ? (
            <>
              <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-4">
                <p className="text-sm font-bold text-[#111827]">{pathzyPhase2T(activeLanguage, "identity.photo.permissionsTitle")}</p>
                <div className="mt-3 grid gap-3">
                  <label className="flex items-start gap-3 text-sm font-semibold text-[#374151]">
                    <input type="checkbox" className="mt-1" checked={currentPhoto.profileVisibility === "profile"} onChange={(event) => updatePhotoPermissions({ profileVisibility: event.target.checked ? "profile" : "private" })} />
                    <span>{pathzyPhase2T(activeLanguage, "identity.photo.profilePermission")}</span>
                  </label>
                  <label className="flex items-start gap-3 text-sm font-semibold text-[#374151]">
                    <input type="checkbox" className="mt-1" checked={currentPhoto.cvUsageAllowed} onChange={(event) => updatePhotoPermissions({ cvUsageAllowed: event.target.checked })} />
                    <span>{pathzyPhase2T(activeLanguage, "identity.photo.cvPermission")}</span>
                  </label>
                  <label className="flex items-start gap-3 text-sm font-semibold text-[#374151]">
                    <input type="checkbox" className="mt-1" checked={currentPhoto.publicSharingAllowed} onChange={(event) => updatePhotoPermissions({ publicSharingAllowed: event.target.checked })} />
                    <span>{pathzyPhase2T(activeLanguage, "identity.photo.publicPermission")}</span>
                  </label>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-4">
                <button type="button" onClick={() => setShowCropControls((visible) => !visible)} className="rounded-full border border-[#d1d5db] bg-white px-5 py-3 text-sm font-bold text-[#374151] hover:border-[#2563EB] hover:text-[#2563EB]">
                  {pathzyPhase2T(activeLanguage, "identity.photo.crop")}
                </button>
                {showCropControls ? (
                  <div className="mt-4 grid gap-3">
                    <label className="grid gap-2 text-sm font-semibold text-[#374151]">
                      <span>{pathzyPhase2T(activeLanguage, "identity.photo.repositionX")}</span>
                      <input type="range" min="0" max="1" step="0.05" value={crop?.focalPointX ?? 0.5} onChange={(event) => updatePhotoPermissions({ crop: { ...(crop ?? { aspect: "portrait", x: 0, y: 0, width: currentPhoto.width, height: currentPhoto.height }), focalPointX: Number(event.target.value) } })} />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-[#374151]">
                      <span>{pathzyPhase2T(activeLanguage, "identity.photo.repositionY")}</span>
                      <input type="range" min="0" max="1" step="0.05" value={crop?.focalPointY ?? 0.5} onChange={(event) => updatePhotoPermissions({ crop: { ...(crop ?? { aspect: "portrait", x: 0, y: 0, width: currentPhoto.width, height: currentPhoto.height }), focalPointY: Number(event.target.value) } })} />
                    </label>
                  </div>
                ) : null}
              </div>

              <button type="button" disabled={photoBusy} onClick={removePhoto} className="w-fit rounded-full border border-[#fecaca] bg-white px-5 py-3 text-sm font-bold text-[#b91c1c] transition hover:border-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60">
                {pathzyPhase2T(activeLanguage, "identity.photo.remove")}
              </button>
            </>
          ) : null}
        </div>
      </div>
    );
  }

  function renderField(field: FieldConfig) {
    const value = values[field.name];
    const inputClasses = "field text-sm font-semibold";
    if (field.name === "interface_language") {
      return (
        <fieldset key={field.name} className="grid gap-3 md:col-span-2">
          <legend className="label text-xs uppercase tracking-[0.12em]">{t("onboarding.interface.legend")}</legend>
          <p className="text-sm leading-6 text-[#6B7280]">{t("onboarding.interface.body")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["en", "fr"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => updateInterfaceLanguage(code)}
                aria-pressed={values.interface_language === code}
                className={`rounded-[22px] border p-4 text-left transition ${values.interface_language === code ? "border-[var(--pathzy-red)] bg-[#fff1f2] text-[var(--pathzy-red-dark)]" : "border-[#e5e7eb] bg-white text-[#374151] hover:border-[var(--pathzy-red)]"}`}
              >
                <span className="block text-lg font-semibold">{languageLabels[code]}</span>
                <span className="mt-1 block text-sm text-[#6B7280]">{code.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </fieldset>
      );
    }
    if (field.name === "professional_document_language") {
      return (
        <fieldset key={field.name} className="grid gap-3 md:col-span-2">
          <legend className="label text-xs uppercase tracking-[0.12em]">{t("onboarding.document.legend")}</legend>
          <p className="text-sm leading-6 text-[#6B7280]">{t("onboarding.document.body")}</p>
          <div className="grid gap-3">
            {(["same_as_interface", "en", "fr"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => updateValue("professional_document_language", code)}
                aria-pressed={values.professional_document_language === code}
                className={`rounded-[22px] border p-4 text-left transition ${values.professional_document_language === code ? "border-[var(--pathzy-red)] bg-[#fff1f2] text-[var(--pathzy-red-dark)]" : "border-[#e5e7eb] bg-white text-[#374151] hover:border-[var(--pathzy-red)]"}`}
              >
                <span className="block text-lg font-semibold">{professionalDocumentLanguageLabel(code)}</span>
              </button>
            ))}
          </div>
        </fieldset>
      );
    }
    if (field.name === "current_status") {
      const normalizedValue = normalizeCurrentSituation(value);
      return (
        <fieldset key={field.name} className="grid gap-3 md:col-span-2">
          <legend className="label text-xs uppercase tracking-[0.12em]">{fieldLabel(field)}</legend>
          <p className="text-sm leading-6 text-[#6B7280]">{fieldPlaceholder(field)}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {currentSituationValues.map((situation) => (
              <button
                key={situation}
                type="button"
                onClick={() => updateValue("current_status", situation)}
                aria-pressed={normalizedValue === situation}
                className={`rounded-[22px] border p-4 text-left text-sm font-bold transition ${normalizedValue === situation ? "border-[var(--pathzy-red)] bg-[#fff1f2] text-[var(--pathzy-red-dark)]" : "border-[#e5e7eb] bg-white text-[#374151] hover:border-[var(--pathzy-red)]"}`}
              >
                {currentSituationDisplayLabel(activeLanguage, situation)}
              </button>
            ))}
          </div>
        </fieldset>
      );
    }
    return (
      <label key={field.name} className={field.type === "textarea" ? "grid gap-2 md:col-span-2" : "grid gap-2"}>
        <span className="label text-xs uppercase tracking-[0.12em]">{fieldLabel(field)}</span>
        {field.type === "textarea" ? (
          <textarea className={`${inputClasses} min-h-36 resize-y`} value={String(value ?? "")} placeholder={fieldPlaceholder(field)} onChange={(event) => updateValue(field.name, event.target.value as never)} />
        ) : (
          <input className={inputClasses} type={field.type ?? "text"} value={String(value ?? "")} placeholder={fieldPlaceholder(field)} onChange={(event) => updateValue(field.name, event.target.value as never)} />
        )}
      </label>
    );
  }

  function renderList(step: JourneyStep) {
    const key = step.listKey;
    if (!key) return null;
    const items = editableList(values[key]);
    return (
      <div className="grid gap-3">
        {step.key === "education" ? (
          <div className="grid gap-3 md:grid-cols-2">
            {profileSectionActions.education.fields.map(renderField)}
          </div>
        ) : null}
        {items.length ? items.map((item, index) => (
          <div key={`${step.key}-${index}`} className="rounded-[22px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#6B7280]">{itemTitle(step)} {index + 1}</span>
              <button type="button" onClick={() => removeListItem(key, index)} className="rounded-full border border-[#e5e7eb] bg-white px-3 py-2 text-xs font-bold text-[#6B7280] transition hover:text-[#111827]">{pathzyPhase2T(activeLanguage, "identity.ui.remove")}</button>
            </div>
            <textarea className="field min-h-28 resize-y text-sm font-semibold leading-6" value={item} placeholder={`${pathzyPhase2T(activeLanguage, "identity.ui.addDetails")} - ${itemTitle(step)}`} onChange={(event) => updateListItem(key, index, event.target.value)} />
          </div>
        )) : (
          <p className="rounded-[20px] border border-dashed border-[#d1d5db] bg-[#f9fafb] p-4 text-sm leading-6 text-[#6B7280]">{pathzyPhase2T(activeLanguage, "identity.ui.emptyList")}</p>
        )}
        <button type="button" onClick={() => addListItem(key)} className="w-fit rounded-full border border-[#d1d5db] bg-white px-5 py-3 text-sm font-bold text-[#374151] transition hover:border-[#2563EB] hover:text-[#2563EB]">{pathzyPhase2T(activeLanguage, "identity.ui.addItem")}</button>
      </div>
    );
  }

  function renderSkills(step: JourneyStep) {
    const skills = cleanList(values.skills);
    const suggestions = pathzyPhase2List(professionalDocumentLanguage, "identity.suggestions.skills");
    return (
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((skill) => {
            const selected = skills.map((item) => item.toLowerCase()).includes(skill.toLowerCase());
            return (
              <button key={skill} type="button" onClick={() => updateValue("skills", (selected ? skills.filter((item) => item.toLowerCase() !== skill.toLowerCase()) : [...skills, skill]) as never)} className={`rounded-full border px-4 py-2 text-sm font-bold transition ${selected ? "border-[#2563EB] bg-[#eff6ff] text-[#2563EB]" : "border-[#e5e7eb] bg-white text-[#6B7280] hover:text-[#111827]"}`}>
                {skill}
              </button>
            );
          })}
        </div>
        {renderList(step)}
      </div>
    );
  }

  function renderPreferences() {
    const preferredRoleListStep: JourneyStep = {
      key: "employment_preferences",
      title: pathzyPhase2T(activeLanguage, "identity.ui.preferredRole"),
      description: "",
      guidance: "",
      importance: "required",
      kind: "list",
      listKey: "preferred_roles"
    };
    const industryListStep: JourneyStep = {
      key: "employment_preferences",
      title: pathzyPhase2T(activeLanguage, "identity.ui.industry"),
      description: "",
      guidance: "",
      importance: "required",
      kind: "list",
      listKey: "industries"
    };
    return (
      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          {(profileSectionActions.employmentPreferences.fields ?? []).map(renderField)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {renderList(preferredRoleListStep)}
          {renderList(industryListStep)}
        </div>
      </div>
    );
  }

  function renderCurrentStep() {
    if (introStage !== "identity") {
      const introOrder: IntroStage[] = ["welcome", "interfaceLanguage", "documentLanguage", "careerCoach", "professionalIdentityIntroduction"];
      const premiumOnboardingOrder: IntroStage[] = ["welcome", "interfaceLanguage", "documentLanguage", "careerCoach", "professionalIdentityIntroduction"];
      const introLifecycleIndex = introOrder.indexOf(introStage);
      const premiumIntroIndex = premiumOnboardingOrder.indexOf(introStage);
      const visibleStepNumber = premiumIntroIndex >= 0 ? premiumIntroIndex + 1 : 1;
      const visibleStepTotal = premiumOnboardingOrder.length;
      const introProgressLabel = formatPathzyStepCount(activeLanguage, visibleStepNumber, visibleStepTotal);
      const introProgressPercent = Math.round((visibleStepNumber / visibleStepTotal) * 100);
      const splitPhase2List = (key: Parameters<typeof pathzyPhase2T>[1]) =>
        pathzyPhase2T(activeLanguage, key)
          .split("|")
          .map((item) => item.trim())
          .filter(Boolean);
      const introTitle =
        introStage === "welcome"
          ? t("onboarding.welcome.title")
          : introStage === "interfaceLanguage"
            ? t("onboarding.interface.title")
            : introStage === "documentLanguage"
              ? t("onboarding.document.title")
              : introStage === "careerCoach"
                ? t("onboarding.coach.title")
                : pathzyPhase2T(activeLanguage, "identity.intro.title");
      const introBody =
        introStage === "welcome"
          ? t("onboarding.welcome.body")
          : introStage === "interfaceLanguage"
            ? t("onboarding.interface.body")
            : introStage === "documentLanguage"
              ? t("onboarding.document.body")
              : introStage === "careerCoach"
                ? t("onboarding.coach.body")
                : pathzyPhase2T(activeLanguage, "identity.intro.body");
      const illustrationTitle =
        introStage === "welcome"
          ? t("onboarding.shell.foundation")
          : introStage === "interfaceLanguage"
            ? t("onboarding.interface.legend")
            : introStage === "documentLanguage"
              ? t("onboarding.document.legend")
              : introStage === "careerCoach"
                ? t("onboarding.coach.title")
                : pathzyPhase2T(activeLanguage, "identity.ui.foundationValue");
      const illustrationItems =
        introStage === "documentLanguage"
          ? splitPhase2List("onboarding.document.examplePairs")
          : introStage === "careerCoach"
            ? splitPhase2List("onboarding.coach.supportAreas")
            : introStage === "professionalIdentityIntroduction"
              ? splitPhase2List("identity.intro.powers")
              : splitPhase2List("onboarding.welcome.reassurancePoints");
      return (
        <div data-onboarding-stage={introLifecycleIndex + 1} className="overflow-hidden rounded-[34px] border border-[#1e293b] bg-[#07111f] text-white shadow-[0_28px_80px_rgba(2,6,23,.28)]">
          <div className="relative grid gap-7 p-5 transition-all duration-300 md:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div aria-hidden="true" className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#2563EB]/20 blur-3xl" />
            <div aria-hidden="true" className="absolute bottom-0 left-10 h-40 w-40 rounded-full bg-[var(--pathzy-red)]/15 blur-3xl" />
            <div className="relative">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#bfdbfe]">
                  {introProgressLabel}
                </span>
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--pathzy-red)]">{pathzyPhase2T(activeLanguage, "identity.ui.setupEyebrow")}</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-4xl">{introTitle}</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#dbeafe] md:text-lg">{introBody}</p>
              {introStage === "welcome" ? <p className="mt-4 max-w-2xl text-base leading-7 text-white/78">{t("onboarding.welcome.subheadline")}</p> : null}
              {introStage === "welcome" ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {splitPhase2List("onboarding.welcome.reassurancePoints").map((item) => (
                    <div key={item} className="rounded-[22px] border border-white/10 bg-white/[0.07] p-4">
                      <p className="text-base font-semibold leading-7 text-white">{item}</p>
                    </div>
                  ))}
                </div>
              ) : null}
              {introStage === "interfaceLanguage" ? (
                <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.08] p-4">
                  <p className="mb-4 text-sm font-semibold leading-6 text-[#dbeafe]">{t("onboarding.interface.explanation")}</p>
                  {renderField({ name: "interface_language", label: "Interface language" })}
                </div>
              ) : null}
              {introStage === "documentLanguage" ? (
                <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.08] p-4">
                  <p className="mb-4 text-sm font-semibold leading-6 text-[#dbeafe]">{t("onboarding.document.explanation")}</p>
                  {renderField({ name: "professional_document_language", label: "Professional document language" })}
                </div>
              ) : null}
              {introStage === "careerCoach" ? (
                <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.08] p-5">
                  <p className="text-base font-semibold leading-7 text-white">{t("onboarding.coach.pause")}</p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#dbeafe]">{t("onboarding.coach.support")}</p>
                </div>
              ) : null}
              {introStage === "professionalIdentityIntroduction" ? (
                <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.08] p-5">
                  <p className="text-base font-semibold leading-7 text-white">{pathzyPhase2T(activeLanguage, "identity.intro.reassurance")}</p>
                </div>
              ) : null}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                {introStage !== "welcome" ? (
                  <button type="button" onClick={goBack} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15">
                    {t("onboarding.back")}
                  </button>
                ) : (
                  <span className="text-sm font-semibold text-white/70">{introProgressLabel}</span>
                )}
                <button type="button" onClick={() => goNext()} className="rounded-full bg-[var(--pathzy-red)] px-7 py-4 text-sm font-bold text-white shadow-[0_16px_34px_rgba(217,58,70,.22)] transition hover:bg-[var(--pathzy-red-dark)] focus:outline-none focus:ring-2 focus:ring-white/70">
                  {introStage === "welcome" ? t("onboarding.welcome.action") : introStage === "careerCoach" ? t("onboarding.coach.action") : introStage === "professionalIdentityIntroduction" ? pathzyPhase2T(activeLanguage, "identity.intro.action") : t("onboarding.continue")}
                </button>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                <div className="h-full rounded-full bg-[#60a5fa] transition-all duration-300" style={{ width: `${introProgressPercent}%` }} />
              </div>
            </div>
            <div className="relative min-h-[240px] overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.08] p-5">
              <div aria-hidden="true" className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-[#60a5fa]/45" />
              <div aria-hidden="true" className="absolute -bottom-10 left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
              <p className="relative text-xs font-bold uppercase tracking-[0.16em] text-[#93c5fd]">{illustrationTitle}</p>
              <div className="relative mt-6 grid gap-3">
                {illustrationItems.map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/10 p-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#111827]">{index + 1}</span>
                    <span className="text-sm font-semibold leading-5 text-white">{item}</span>
                  </div>
                ))}
              </div>
              <div className="relative mt-6 rounded-[22px] border border-white/10 bg-[#0f172a]/75 p-4">
                <p className="text-sm font-semibold leading-6 text-[#dbeafe]">
                  {introStage === "welcome"
                    ? pathzyPhase2T(activeLanguage, "identity.ui.foundationValue")
                    : introStage === "professionalIdentityIntroduction"
                      ? pathzyPhase2T(activeLanguage, "identity.intro.reassurance")
                      : t("onboarding.welcome.reassurance")}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (!activeStep) {
      return (
        <div className="rounded-[30px] border border-[#e5e7eb] bg-white p-6 shadow-[0_18px_55px_rgba(17,24,39,.08)] md:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#2563EB]">{t("onboarding.welcome.title")}</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#111827] md:text-5xl">{t("identity.page.title")}</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#6B7280]">{t("identity.page.body")}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9CA3AF]">{pathzyPhase2T(activeLanguage, "identity.ui.estimatedTime")}</p>
              <p className="mt-2 text-2xl font-semibold text-[#111827]">{pathzyPhase2T(activeLanguage, "identity.ui.estimatedValue")}</p>
            </div>
            <div className="rounded-[22px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9CA3AF]">{pathzyPhase2T(activeLanguage, "identity.ui.progress")}</p>
              <p className="mt-2 text-2xl font-semibold text-[#111827]">{pathzyPhase2T(activeLanguage, "identity.ui.automaticallySaved")}</p>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-[#6B7280]">{t("onboarding.welcome.reassurance")}</p>
          <button type="button" onClick={() => goNext()} className="mt-7 rounded-full bg-[#2563EB] px-7 py-4 text-sm font-bold text-white shadow-[0_16px_34px_rgba(37,99,235,.22)] transition hover:bg-[#1D4ED8]">{pathzyPhase2T(activeLanguage, "identity.ui.begin")}</button>
        </div>
      );
    }

    return (
      <div className="rounded-[30px] border border-[#e5e7eb] bg-white p-5 shadow-[0_18px_55px_rgba(17,24,39,.08)] md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#2563EB]">{pathzyPhase2T(activeLanguage, "identity.ui.foundationValue")}</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.02em] text-[#111827] md:text-4xl">{sectionTitle(activeStep)}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#6B7280]">{stepDescription(activeStep)}</p>
          </div>
          <span className="w-fit rounded-full border border-[#dbeafe] bg-[#eff6ff] px-4 py-2 text-xs font-bold text-[#2563EB]">{importanceLabel(activeStep.importance)}</span>
        </div>

        <div className="mt-5 rounded-[22px] border border-[#dbeafe] bg-[#eff6ff] p-4 text-sm font-semibold leading-6 text-[#1e3a8a]">{stepGuidance(activeStep)}</div>

        <div className="mt-6">
          {activeStep.kind === "photo" ? (
            renderPhotoSection()
          ) : activeStep.kind === "fields" || activeStep.kind === "portfolio" ? (
            <div className="grid gap-4 md:grid-cols-2">{(activeStep.fields ?? []).map(renderField)}</div>
          ) : activeStep.kind === "list" ? (
            renderList(activeStep)
          ) : activeStep.kind === "skills" ? (
            renderSkills(activeStep)
          ) : activeStep.kind === "preferences" ? (
            renderPreferences()
          ) : null}
        </div>

        {activeIndex === journeySteps.length - 1 ? (
          <div className={`mt-6 rounded-[24px] border p-5 ${requiredComplete ? "border-[#bfdbfe] bg-[#eff6ff]" : "border-[#fde68a] bg-[#fffbeb]"}`}>
            <p className={`text-sm font-bold uppercase tracking-[0.14em] ${requiredComplete ? "text-[#2563EB]" : "text-[#92400e]"}`}>{requiredComplete ? pathzyPhase2T(activeLanguage, "identity.ui.readyForReview") : pathzyPhase2T(activeLanguage, "identity.ui.requiredDetailsNeeded")}</p>
            <h3 className="mt-2 text-2xl font-semibold text-[#111827]">{requiredComplete ? pathzyPhase2T(activeLanguage, "identity.ui.reviewBeforeHome") : pathzyPhase2T(activeLanguage, "identity.ui.finishRequired")}</h3>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              {requiredComplete ? pathzyPhase2T(activeLanguage, "identity.ui.reviewExplanation") : pathzyPhase2T(activeLanguage, "identity.ui.requiredSectionsExplanation")}
            </p>
            {requiredComplete ? (
              <button type="button" onClick={openReview} className="mt-4 inline-flex rounded-full bg-[#2563EB] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1D4ED8]">{t("onboarding.review")}</button>
            ) : (
              <div className="mt-4 grid gap-3" aria-live="polite">
                <p className="text-sm font-bold text-[#92400e]">{pathzyPhase2T(activeLanguage, "identity.ui.youStillNeed")}</p>
                <div className="grid gap-2">
                  {requiredSteps.map((step) => {
                    const complete = stepIsComplete(step, values);
                    const missing = missingRequiredSteps.find((item) => item.step.key === step.key);
                    return (
                      <div key={step.key} className={`rounded-[18px] border p-3 text-sm ${complete ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]" : "border-[#fecaca] bg-[#fff7ed] text-[#991b1b]"}`}>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-bold">{complete ? pathzyPhase2T(activeLanguage, "identity.ui.completePrefix") : pathzyPhase2T(activeLanguage, "identity.ui.missingPrefix")} {sectionTitle(step)}</span>
                          {!complete ? (
                            <button type="button" onClick={() => openRequiredStep(step)} className="inline-flex w-fit rounded-full border border-[#fecaca] bg-white px-4 py-2 text-xs font-bold text-[#991b1b] transition hover:border-[#991b1b]">
                              {pathzyPhase2T(activeLanguage, "identity.ui.continueWith")} {sectionTitle(step)}
                            </button>
                          ) : null}
                        </div>
                        {missing?.missingFields.length ? <p className="mt-1 leading-6">{pathzyPhase2T(activeLanguage, "identity.ui.requiredField")}: {missing.missingFields.join(", ")}</p> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  if (introStage !== "identity") {
    return <section className="mt-6">{renderCurrentStep()}</section>;
  }

  return (
    <section className="mt-6">
      <div className="mb-5 rounded-[26px] border border-[#e5e7eb] bg-white p-4 shadow-[0_14px_40px_rgba(17,24,39,.06)] md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2563EB]">{pathzyPhase2T(activeLanguage, "identity.ui.foundationValue")}</p>
            <p className="mt-1 text-sm font-semibold text-[#6B7280]">
              {introStage === "identity" ? formatPathzyStepCount(activeLanguage, activeIndex + 1, journeySteps.length) : formatPathzyStepCount(activeLanguage, introShellStep, introShellTotal)} · {requiredComplete ? t("onboarding.shell.requiredComplete") : t("onboarding.shell.requiredProgress")}
            </p>
          </div>
          <div className="flex min-h-10 flex-wrap items-center gap-2">
            <p aria-live="polite" className={`min-w-[9.5rem] rounded-full px-4 py-2 text-center text-xs font-bold ${saveStatusClasses}`}>
              {saveStatusLabel}
            </p>
            <span className="inline-flex min-w-[4.75rem] justify-end">
              <button type="button" onClick={retrySave} disabled={autosaveState !== "error"} aria-hidden={autosaveState !== "error"} className={`rounded-full border border-[#fecaca] bg-white px-4 py-2 text-xs font-bold text-[#b91c1c] transition hover:border-[#b91c1c] ${autosaveState === "error" ? "" : "pointer-events-none invisible"}`}>
                {t("onboarding.save.retry")}
              </button>
            </span>
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e5e7eb]" role="progressbar" aria-label={pathzyPhase2T(activeLanguage, "identity.ui.progressAria")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={shellProgress}>
          <div className="h-full rounded-full bg-[#2563EB] transition-all" style={{ width: `${shellProgress}%` }} />
        </div>
        <p aria-live="polite" className="mt-3 min-h-5 text-sm font-semibold text-[#6B7280]">{message || "\u00A0"}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-[#e5e7eb] bg-white p-4 shadow-[0_14px_40px_rgba(17,24,39,.06)] lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">{t("identity.steps.title")}</p>
          <div className="grid gap-2">
            {journeySteps.map((step, index) => {
              const completed = stepIsComplete(step, values);
              const current = introStage === "identity" && index === activeIndex;
              const nextAvailable = introStage === "identity" && index === activeIndex + 1;
              const canOpen = introStage === "identity" && (completed || index <= activeIndex || nextAvailable);
              const stateLabel = completed ? t("identity.status.completed") : current ? t("identity.status.current") : canOpen ? t("identity.status.available") : t("identity.status.locked");
              return (
                <button key={step.key} type="button" disabled={!canOpen} aria-disabled={!canOpen} title={!canOpen ? t("identity.locked.help") : undefined} onClick={() => canOpen && setActiveIndex(index)} className={`rounded-[18px] border px-3 py-3 text-left transition ${current ? "border-[var(--pathzy-red)] bg-[#fff1f2]" : "border-[#e5e7eb] bg-white"} ${canOpen ? "text-[#111827]" : "cursor-not-allowed text-[#9CA3AF]"}`}>
                  <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">{stateLabel} · {importanceLabel(step.importance)}</span>
                  <span className="mt-1 block text-sm font-semibold">{index + 1}. {sectionTitle(step)}</span>
                  {!canOpen ? <span className="mt-1 block text-xs text-[#6B7280]">{t("identity.locked.help")}</span> : null}
                </button>
              );
            })}
          </div>
        </aside>

        <div>
          {renderCurrentStep()}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            {shouldReturnToReview ? (
              <Link href={reviewHref} className="rounded-full border border-[#d1d5db] bg-white px-6 py-3 text-sm font-bold text-[#374151]">
                {pathzyPhase2T(activeLanguage, "identity.review.cancelReturn")}
              </Link>
            ) : (
              <button type="button" onClick={goBack} className="rounded-full border border-[#d1d5db] bg-white px-6 py-3 text-sm font-bold text-[#374151]">{t("onboarding.back")}</button>
            )}
            {introStage === "identity" && activeIndex === journeySteps.length - 1 && requiredComplete ? (
              <button type="button" onClick={openReview} className="rounded-full bg-[var(--pathzy-red)] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_34px_rgba(217,58,70,.22)] transition hover:bg-[var(--pathzy-red-dark)]">{t("onboarding.review")}</button>
            ) : (
              <button type="button" onClick={() => goNext()} disabled={photoNavigationBlocked || (introStage === "identity" && activeIndex === journeySteps.length - 1 && !shouldReturnToReview)} className="rounded-full bg-[var(--pathzy-red)] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_34px_rgba(217,58,70,.22)] transition hover:bg-[var(--pathzy-red-dark)] disabled:cursor-not-allowed disabled:opacity-45">{shouldReturnToReview ? pathzyPhase2T(activeLanguage, "identity.review.saveReturn") : t("onboarding.continue")}</button>
            )}
          </div>
        </div>
      </div>

      {rows.some((row) => row.section === "uploadedDocuments" && row.value.trim()) ? (
        <div className="mt-5 rounded-[20px] border border-[#e5e7eb] bg-white p-4 text-sm font-semibold leading-6 text-[#6B7280]">
          <p>{pathzyPhase2T(activeLanguage, "identity.ui.uploadedDocuments")} {rows.find((row) => row.section === "uploadedDocuments")?.value}.</p>
          <Link href={appRoutes.documents} className="mt-3 inline-flex rounded-full border border-[#d1d5db] bg-white px-4 py-2 text-xs font-bold text-[#374151]">{pathzyPhase2T(activeLanguage, "identity.ui.openDocuments")}</Link>
        </div>
      ) : null}
    </section>
  );
}

export function ProfessionalIdentityReviewActions({
  editHref = appRoutes.professionalIdentity,
  requiredComplete = false,
  setupComplete = false
}: {
  editHref?: string;
  requiredComplete?: boolean;
  setupComplete?: boolean;
}) {
  const router = useRouter();
  const { language } = usePathzyLanguage();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function finishSetup() {
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch("/api/professional-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "finishSetup" })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(typeof data.error === "string" ? data.error : pathzyPhase2T(language, "identity.finish.failure"));
        if (typeof data.redirectTo === "string") router.push(data.redirectTo);
        return;
      }

      router.push(typeof data.redirectTo === "string" ? data.redirectTo : appRoutes.authenticatedHome);
    } catch (caught) {
      const normalized = normalizePathzyError(caught, pathzyPhase2T(language, "identity.finish.failure"));
      console.warn("[professional-identity] Finish setup failed", {
        code: normalized.code ?? "unknown",
        message: normalized.developerMessage,
        originalType: normalized.originalType
      });
      setStatus("error");
      setMessage(normalized.userMessage);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-3 border-t border-[#e5e7eb] pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div aria-live="polite" className="min-h-6 text-sm font-medium text-[#6B7280]">
        {status === "saving" ? pathzyPhase2T(language, "identity.finish.saving") : status === "error" ? message : setupComplete ? pathzyPhase2T(language, "identity.review.upToDate") : pathzyPhase2T(language, "identity.finish.saved")}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={editHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d1d5db] bg-white px-6 py-3 text-sm font-bold text-[#374151] transition hover:border-[#2563EB] hover:text-[#2563EB]">
          {pathzyPhase2T(language, "identity.finish.edit")}
        </Link>
        {setupComplete ? (
          <Link href={appRoutes.professionalIdentity} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#2563EB] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_34px_rgba(37,99,235,.22)] transition hover:bg-[#1D4ED8]">
            {pathzyPhase2T(language, "identity.review.returnToIdentity")}
          </Link>
        ) : requiredComplete ? (
          <button type="button" onClick={finishSetup} disabled={status === "saving"} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#2563EB] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_34px_rgba(37,99,235,.22)] transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60">
            {pathzyPhase2T(language, "identity.finish.submit")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
