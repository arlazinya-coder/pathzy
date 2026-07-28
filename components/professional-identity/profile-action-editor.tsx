"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { normalizePathzyError } from "@/lib/errors/error-normalization";
import { usePathzyLanguage } from "@/components/language/language-selector";
import { formatPathzyStepCount, pathzyPhase2T, pathzyT, professionalIdentityFieldText, professionalIdentityImportanceLabel, professionalIdentitySectionTranslations, professionalIdentityStepText } from "@/lib/language/pathzy-i18n";
import { languageLabels, professionalDocumentLanguageLabels, type ProfessionalDocumentLanguageChoice, type SupportedLanguageCode } from "@/lib/language/language-preferences";
import { appRoutes } from "@/lib/navigation/routes";

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

type IntroStage = "welcome" | "interfaceLanguage" | "documentLanguage" | "careerCoach" | "identity";

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
    description: "Add a note about the professional photo you want to use. File upload stays in My Documents.",
    fields: [{ name: "profilePhoto", label: "Photo note", placeholder: "Professional headshot ready, or needs new photo" }]
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
  { key: "skills", title: "Skills", description: "Build a skill foundation PATHZY can reuse later.", guidance: "Select skills you already use or add your own. PATHZY removes duplicates before saving.", importance: "required", kind: "skills", listKey: "skills", suggestions: ["Communication", "Microsoft Excel", "Microsoft Word", "Customer service", "Problem solving", "Teamwork", "SQL", "Data analysis", "Administration", "Project coordination", "Leadership", "Research"] },
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

function hasStepData(step: JourneyStep, values: ProfessionalIdentityValues) {
  if (step.kind === "fields" || step.kind === "photo" || step.kind === "portfolio" || step.kind === "preferences") {
    return (step.fields ?? []).some((field) => {
      const value = values[field.name];
      return Array.isArray(value) ? value.length > 0 : String(value ?? "").trim().length > 0;
    });
  }
  if (step.listKey) {
    const value = values[step.listKey];
    return Array.isArray(value) && value.some((item) => item.trim());
  }
  return false;
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasListText(value: unknown) {
  return Array.isArray(value) && value.some((item) => hasText(item));
}

function stepIsComplete(step: JourneyStep, values: ProfessionalIdentityValues) {
  if (step.key === "profile") return hasText(values.current_status);
  if (step.key === "personal_information") return hasText(values.full_name) && hasText(values.email);
  if (step.key === "location") return hasText(values.city) && hasText(values.country);
  if (step.key === "nationality") return hasText(values.nationality);
  if (step.key === "work_authorization") return hasText(values.work_authorization);
  if (step.key === "career_goal") return hasText(values.career_goal);
  if (step.key === "education") return hasText(values.current_status) || hasText(values.field_of_study) || hasListText(values.education);
  if (step.key === "skills") return hasListText(values.skills);
  if (step.key === "preferences") return hasText(values.interface_language) && hasText(values.professional_document_language);
  if (step.key === "employment_preferences") {
    const hasPreference = hasText(values.employment_type) || hasText(values.work_type) || hasListText(values.preferred_roles) || hasListText(values.industries);
    return hasPreference;
  }
  if (step.key === "availability") return hasText(values.availability);
  return hasStepData(step, values);
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
  initialValues
}: {
  rows: ProfileActionRow[];
  initialSection?: string;
  initialIntroStage?: IntroStage;
  initialValues?: Partial<ProfessionalIdentityValues>;
}) {
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
            ? "identity"
            : "careerCoach");
  const firstIncompleteIndex = journeySteps.findIndex((step) => step.importance === "required" && !stepIsComplete(step, mergedInitialValues));
  const [activeIndex, setActiveIndex] = useState(requestedIndex >= 0 ? requestedIndex : firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
  const [introStage, setIntroStage] = useState<IntroStage>(resolvedInitialIntroStage);
  const [values, setValues] = useState<ProfessionalIdentityValues>(mergedInitialValues);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const { language: storedInterfaceLanguage } = usePathzyLanguage(mergedInitialValues.interface_language);
  const hasHydrated = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSave = useRef(0);
  const activeStep = introStage === "identity" && activeIndex >= 0 ? journeySteps[activeIndex] : null;
  const activeLanguage: SupportedLanguageCode = values.interface_language || storedInterfaceLanguage || "en";
  const t = (key: Parameters<typeof pathzyT>[1]) => pathzyT(activeLanguage, key);
  const sectionTitle = (step: JourneyStep) => professionalIdentitySectionTranslations[activeLanguage]?.[step.key] ?? step.title;
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
  const completedCount = journeySteps.filter((step) => stepIsComplete(step, values)).length;
  const requiredSteps = journeySteps.filter((step) => step.importance === "required");
  const requiredComplete = requiredSteps.every((step) => stepIsComplete(step, values));
  const progress = Math.round((completedCount / journeySteps.length) * 100);
  const reviewHref = `${appRoutes.professionalIdentity}?review=1`;

  useEffect(() => {
    setValues(mergedInitialValues);
  }, [mergedInitialValues]);

  useEffect(() => {
    setValues((current) => (current.interface_language ? current : { ...current, interface_language: storedInterfaceLanguage }));
  }, [storedInterfaceLanguage]);

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

  const persistStep = useCallback(async (step: JourneyStep, nextValues: ProfessionalIdentityValues) => {
    const saveId = latestSave.current + 1;
    latestSave.current = saveId;
    setAutosaveState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/professional-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: step.key, values: stepPayload(step, nextValues) })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (saveId === latestSave.current) {
          setAutosaveState("error");
          setMessage(typeof data.error === "string" ? data.error : pathzyT(nextValues.interface_language || activeLanguage, "onboarding.save.error"));
        }
        return false;
      }
      if (saveId === latestSave.current) {
        setAutosaveState("saved");
        setMessage(pathzyT(nextValues.interface_language || activeLanguage, "onboarding.save.saved"));
      }
      return true;
    } catch (caught) {
      const normalized = normalizePathzyError(caught, pathzyT(nextValues.interface_language || activeLanguage, "onboarding.save.error"));
      console.warn("[professional-identity] Autosave failed", {
        code: normalized.code ?? "unknown",
        message: normalized.developerMessage,
        originalType: normalized.originalType
      });
      if (saveId === latestSave.current) {
        setAutosaveState("error");
        setMessage(normalized.userMessage);
      }
      return false;
    }
  }, [activeLanguage]);

  const scheduleAutosave = useCallback((nextValues: ProfessionalIdentityValues, step = activeStep) => {
    if (!step) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void persistStep(step, nextValues);
    }, 700);
  }, [activeStep, persistStep]);

  async function persistPreferences(nextValues: ProfessionalIdentityValues) {
    const preferencesStep = journeySteps.find((step) => step.key === "preferences");
    if (!preferencesStep) return true;
    return persistStep(preferencesStep, nextValues);
  }

  function updateValue<K extends keyof ProfessionalIdentityValues>(key: K, value: ProfessionalIdentityValues[K]) {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (hasHydrated.current) scheduleAutosave(next);
      return next;
    });
  }

  useEffect(() => {
    hasHydrated.current = true;
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

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

  async function goNext() {
    if (introStage !== "identity") {
      if (introStage === "welcome") {
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
        setIntroStage("careerCoach");
        return;
      }
      const nextValues = { ...values, career_coach_intro_seen: "true" };
      setValues(nextValues);
      const saved = await persistPreferences(nextValues);
      if (saved === false) return;
      setIntroStage("identity");
      setActiveIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
      return;
    }
    if (activeIndex < 0) {
      setActiveIndex(0);
      return;
    }
    if (activeStep) {
      const saved = await persistStep(activeStep, values);
      if (saved === false) return;
    }
    setActiveIndex((current) => Math.min(journeySteps.length - 1, current + 1));
  }

  async function goBack() {
    if (introStage !== "identity") {
      const order: IntroStage[] = ["welcome", "interfaceLanguage", "documentLanguage", "careerCoach", "identity"];
      const currentIndex = order.indexOf(introStage);
      setIntroStage(order[Math.max(0, currentIndex - 1)]);
      return;
    }
    if (activeStep) {
      const saved = await persistStep(activeStep, values);
      if (saved === false) return;
    }
    if (activeIndex <= 0) {
      setIntroStage("careerCoach");
      return;
    }
    setActiveIndex((current) => Math.max(0, current - 1));
  }

  async function openReview() {
    if (activeStep) {
      const saved = await persistStep(activeStep, values);
      if (saved === false) return;
    }
    window.location.assign(reviewHref);
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
                onClick={() => updateValue("interface_language", code)}
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
    return (
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {(step.suggestions ?? []).map((skill) => {
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
      const introIndex = ["welcome", "interfaceLanguage", "documentLanguage", "careerCoach"].indexOf(introStage);
      const introTitle =
        introStage === "welcome"
          ? t("onboarding.welcome.title")
          : introStage === "interfaceLanguage"
            ? t("onboarding.interface.title")
            : introStage === "documentLanguage"
              ? t("onboarding.document.title")
              : t("onboarding.coach.title");
      const introBody =
        introStage === "welcome"
          ? t("onboarding.welcome.body")
          : introStage === "interfaceLanguage"
            ? t("onboarding.interface.body")
            : introStage === "documentLanguage"
              ? t("onboarding.document.body")
              : t("onboarding.coach.body");
      return (
        <div className="rounded-[30px] border border-[#e5e7eb] bg-white p-6 shadow-[0_18px_55px_rgba(17,24,39,.08)] md:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--pathzy-red)]">{pathzyPhase2T(activeLanguage, "identity.ui.setupEyebrow")}</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.02em] text-[#111827] md:text-5xl">{introTitle}</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#6B7280]">{introBody}</p>
          {introStage === "welcome" ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9CA3AF]">{t("onboarding.shell.progress")}</p>
                <p className="mt-2 text-2xl font-semibold text-[#111827]">{t("onboarding.welcome.reassurance")}</p>
              </div>
              <div className="rounded-[22px] border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9CA3AF]">{t("onboarding.shell.foundation")}</p>
                <p className="mt-2 text-2xl font-semibold text-[#111827]">{pathzyPhase2T(activeLanguage, "identity.ui.foundationValue")}</p>
              </div>
            </div>
          ) : null}
          {introStage === "interfaceLanguage" ? (
            <div className="mt-6">{renderField({ name: "interface_language", label: "Interface language" })}</div>
          ) : null}
          {introStage === "documentLanguage" ? (
            <div className="mt-6">{renderField({ name: "professional_document_language", label: "Professional document language" })}</div>
          ) : null}
          {introStage === "careerCoach" ? (
            <div className="mt-6 rounded-[24px] border border-[#fee2e2] bg-[#fff7f7] p-5">
              <p className="text-base font-semibold leading-7 text-[#374151]">{t("onboarding.coach.pause")}</p>
            </div>
          ) : null}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-semibold text-[#6B7280]">{formatPathzyStepCount(activeLanguage, introIndex + 1, 4)}</span>
            <button type="button" onClick={goNext} className="rounded-full bg-[var(--pathzy-red)] px-7 py-4 text-sm font-bold text-white shadow-[0_16px_34px_rgba(217,58,70,.22)] transition hover:bg-[var(--pathzy-red-dark)]">
              {introStage === "welcome" ? t("onboarding.welcome.action") : introStage === "careerCoach" ? t("onboarding.coach.action") : t("onboarding.continue")}
            </button>
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
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9CA3AF]">Progress</p>
              <p className="mt-2 text-2xl font-semibold text-[#111827]">{pathzyPhase2T(activeLanguage, "identity.ui.automaticallySaved")}</p>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-[#6B7280]">{t("onboarding.welcome.reassurance")}</p>
          <button type="button" onClick={goNext} className="mt-7 rounded-full bg-[#2563EB] px-7 py-4 text-sm font-bold text-white shadow-[0_16px_34px_rgba(37,99,235,.22)] transition hover:bg-[#1D4ED8]">{pathzyPhase2T(activeLanguage, "identity.ui.begin")}</button>
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
          {activeStep.kind === "fields" || activeStep.kind === "photo" || activeStep.kind === "portfolio" ? (
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
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <section className="mt-6">
      <div className="mb-5 rounded-[26px] border border-[#e5e7eb] bg-white p-4 shadow-[0_14px_40px_rgba(17,24,39,.06)] md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2563EB]">{pathzyPhase2T(activeLanguage, "identity.ui.foundationValue")}</p>
            <p className="mt-1 text-sm font-semibold text-[#6B7280]">
              {introStage === "identity" ? formatPathzyStepCount(activeLanguage, activeIndex + 1, journeySteps.length) : formatPathzyStepCount(activeLanguage, Math.max(1, ["welcome", "interfaceLanguage", "documentLanguage", "careerCoach"].indexOf(introStage) + 1), 4)} · {requiredComplete ? t("onboarding.shell.requiredComplete") : t("onboarding.shell.requiredProgress")}
            </p>
          </div>
          <p aria-live="polite" className={`rounded-full px-4 py-2 text-xs font-bold ${autosaveState === "saving" ? "bg-[#fffbeb] text-[#92400e]" : autosaveState === "error" ? "bg-[#fef2f2] text-[#b91c1c]" : "bg-[#ecfdf5] text-[#047857]"}`}>
            {autosaveState === "saving" ? t("onboarding.save.saving") : autosaveState === "error" ? t("onboarding.save.error") : autosaveState === "saved" ? t("onboarding.save.saved") : t("onboarding.save.ready")}
          </p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e5e7eb]" role="progressbar" aria-label={pathzyPhase2T(activeLanguage, "identity.ui.progressAria")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="h-full rounded-full bg-[#2563EB] transition-all" style={{ width: `${progress}%` }} />
        </div>
        {message ? <p className="mt-3 text-sm font-semibold text-[#6B7280]">{message}</p> : null}
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
            <button type="button" onClick={goBack} disabled={introStage === "welcome"} className="rounded-full border border-[#d1d5db] bg-white px-6 py-3 text-sm font-bold text-[#374151] disabled:cursor-not-allowed disabled:opacity-45">{t("onboarding.back")}</button>
            {introStage === "identity" && activeIndex === journeySteps.length - 1 && requiredComplete ? (
              <button type="button" onClick={openReview} className="rounded-full bg-[var(--pathzy-red)] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_34px_rgba(217,58,70,.22)] transition hover:bg-[var(--pathzy-red-dark)]">{t("onboarding.review")}</button>
            ) : (
              <button type="button" onClick={goNext} disabled={introStage === "identity" && activeIndex === journeySteps.length - 1} className="rounded-full bg-[var(--pathzy-red)] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_34px_rgba(217,58,70,.22)] transition hover:bg-[var(--pathzy-red-dark)] disabled:cursor-not-allowed disabled:opacity-45">{t("onboarding.continue")}</button>
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

export function ProfessionalIdentityReviewActions({ editHref = appRoutes.professionalIdentity }: { editHref?: string }) {
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
        {status === "saving" ? pathzyPhase2T(language, "identity.finish.saving") : status === "error" ? message : pathzyPhase2T(language, "identity.finish.saved")}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={editHref} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#d1d5db] bg-white px-6 py-3 text-sm font-bold text-[#374151] transition hover:border-[#2563EB] hover:text-[#2563EB]">
          {pathzyPhase2T(language, "identity.finish.edit")}
        </Link>
        <button type="button" onClick={finishSetup} disabled={status === "saving"} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#2563EB] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_34px_rgba(37,99,235,.22)] transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60">
          {pathzyPhase2T(language, "identity.finish.submit")}
        </button>
      </div>
    </div>
  );
}
