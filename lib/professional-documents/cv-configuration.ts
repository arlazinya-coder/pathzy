import type { CvPurpose, CvSectionType, CvViewConfiguration, ProfessionalDocumentLanguage } from "./professional-document.types";

export const CV_ENGINE_VERSION = "phase7.cv-content-engine.v1";
export const CV_RENDERING_ENGINE_VERSION = "pathzy.a4-renderer.v1";
export const CV_TEMPLATE_VERSION = "phase7-template-v1";

export const CV_TYPOGRAPHY = {
  name: { min: 20, preferred: 24, max: 30 },
  headline: { min: 10, preferred: 11, max: 13 },
  sectionHeading: { min: 10, preferred: 11, max: 13 },
  body: { min: 8.5, preferred: 10, max: 11 },
  metadata: { min: 8, preferred: 9, max: 10 }
} as const;

export const CV_SECTION_ORDER: CvSectionType[] = [
  "header",
  "professional_summary",
  "core_skills",
  "employment",
  "education",
  "certifications",
  "projects",
  "languages",
  "awards",
  "memberships",
  "volunteering",
  "references"
];

export function defaultCvViewConfiguration(input: {
  purpose?: CvPurpose;
  language?: ProfessionalDocumentLanguage;
  targetRole?: string;
  targetIndustry?: string;
  targetJobId?: string;
} = {}): CvViewConfiguration {
  const purpose = input.purpose ?? "general";
  return {
    purpose,
    language: input.language ?? "en",
    pagePreference: purpose === "one_page" || purpose === "early_career" ? "one_page" : "automatic",
    targetRole: input.targetRole,
    targetIndustry: input.targetIndustry,
    targetJobId: input.targetJobId,
    sections: CV_SECTION_ORDER.map((type, order) => ({
      type,
      visible: type !== "references",
      order,
      displayStyle: type === "core_skills" ? "grouped" : "standard"
    })),
    selectedEntityIds: {
      employment: [],
      education: [],
      certifications: [],
      skills: [],
      projects: [],
      languages: []
    },
    presentationPreferences: {
      showPhoto: false,
      showFullAddress: false,
      showReferences: false,
      showSkillLevels: false,
      showDates: true,
      dateFormat: "MMM yyyy"
    }
  };
}

export function cvPurposeLabel(purpose: CvPurpose, language: ProfessionalDocumentLanguage = "en") {
  const labels = {
    en: {
      master: "Master CV",
      general: "General CV",
      targeted: "Targeted CV",
      one_page: "One-page CV",
      early_career: "Early-career CV",
      experienced: "Experienced CV",
      career_change: "Career-change CV",
      academic: "Academic CV",
      custom: "Custom CV"
    },
    fr: {
      master: "CV principal",
      general: "CV general",
      targeted: "CV cible",
      one_page: "CV d'une page",
      early_career: "CV debut de carriere",
      experienced: "CV experimente",
      career_change: "CV reconversion",
      academic: "CV academique",
      custom: "CV personnalise"
    }
  } as const;
  return labels[language][purpose];
}

