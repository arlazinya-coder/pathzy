import type { ConfidenceAssessment } from "./confidence";

export const pathwayCodes = [
  "DIRECT_EMPLOYMENT",
  "ENTRY_LEVEL_EMPLOYMENT",
  "SKILLED_EMPLOYMENT",
  "PROFESSIONAL_EMPLOYMENT",
  "GRADUATE_PROGRAMME",
  "INTERNSHIP",
  "LEARNERSHIP",
  "APPRENTICESHIP",
  "TEMPORARY_WORK",
  "CONTRACT_WORK",
  "PART_TIME_WORK",
  "INFORMAL_OR_COMMUNITY_WORK",
  "SELF_EMPLOYMENT",
  "MICRO_ENTERPRISE",
  "FREELANCE_WORK",
  "SKILLS_FIRST_TRANSITION",
  "RETURN_TO_WORK",
  "CAREER_CHANGE",
  "QUALIFICATION_RECOGNITION",
  "BRIDGING_EDUCATION",
  "LICENCE_OR_CERTIFICATE",
  "PUBLIC_EMPLOYMENT_PROGRAMME",
  "SUPPORTED_EMPLOYMENT"
] as const;

export type PathwayCode = (typeof pathwayCodes)[number];

export type PathwayDefinition = {
  code: PathwayCode;
  description: string;
  intendedUserSituations: string[];
  eligibilityInputs: string[];
  contraindications: string[];
  dependencies: string[];
  urgencySuitability: string;
  evidenceRequirements: string[];
  likelyTimeHorizon: string;
  pathzySupportFeatures: string[];
  countryAdapterRequirements: string[];
  confidenceRules: string[];
  userFacingLabelContract: string;
  userFacingExplanationContract: string;
};

export type PathwayRecommendation = {
  pathwayCode: PathwayCode;
  rank: number;
  suitability?: "NOT_ASSESSED" | "LOW" | "POSSIBLE" | "SUITABLE_WITH_SUPPORT" | "SUITABLE" | "HIGHLY_SUITABLE";
  reason: string;
  confidence: ConfidenceAssessment;
  dependencies: string[];
  barriers: string[];
  unmetDependencies?: string[];
  missingInformation?: string[];
  timeHorizon?: string;
  urgencySuitability?: string;
};

export const pathwayDefinitions: PathwayDefinition[] = pathwayCodes.map((code) => ({
  code,
  description: `${code} is a canonical employment pathway option evaluated against identity, diagnosis, and country context.`,
  intendedUserSituations: ["Depends on confirmed Professional Identity and Employment Diagnosis inputs."],
  eligibilityInputs: ["career_goal", "work_authorization", "experience", "education", "skills", "availability", "country_context"],
  contraindications: ["Hard eligibility conflict", "unsupported mandatory evidence", "user-declined pathway"],
  dependencies: ["Professional Identity", "Employment Diagnosis", "Country Employment Context"],
  urgencySuitability: "Must be assessed against income urgency and practical access.",
  evidenceRequirements: ["At least one relevant identity or diagnosis signal unless marked exploratory."],
  likelyTimeHorizon: "Country adapter or future engine must provide a sourced estimate.",
  pathzySupportFeatures: ["Career Plan", "Professional Documents", "Opportunities", "Career Coach"],
  countryAdapterRequirements: ["sourceMetadata", "effectiveDate", "unavailableDataMarkers"],
  confidenceRules: ["Lower confidence when country context or evidence is incomplete."],
  userFacingLabelContract: "Presentation layer localizes the label; canonical code remains stable.",
  userFacingExplanationContract: "Explain why the pathway is practical, uncertain, blocked, or exploratory."
}));
