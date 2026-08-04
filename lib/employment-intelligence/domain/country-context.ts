import type { ConfidenceAssessment } from "./confidence";

export type CountrySourceMetadata = {
  sourceName: string;
  sourceUrl?: string;
  retrievedAt?: string;
  effectiveDate: string;
  version: string;
  confidence: ConfidenceAssessment;
  expiryOrUpdatePolicy: string;
};

export type CountryEmploymentContext = {
  countryCode: string;
  version: string;
  effectiveDate: string;
  sourceMetadata: CountrySourceMetadata[];
  qualificationFramework: Record<string, unknown>;
  regionModel: Record<string, unknown>;
  jobTaxonomyMapping: Record<string, unknown>;
  workAuthorisationContext: Record<string, unknown>;
  recruitmentConventionContract: Record<string, unknown>;
  employmentProgrammeContract: Record<string, unknown>;
  salaryDataContract: Record<string, unknown>;
  languageContext: Record<string, unknown>;
  transportGeographicContext: Record<string, unknown>;
  formalInformalEmploymentContext: Record<string, unknown>;
  lowLiteracySupport: Record<string, unknown>;
  dataFreshness: "CURRENT" | "STALE" | "UNKNOWN";
  unavailableDataMarkers: string[];
};

export const genericCountryEmploymentContext: CountryEmploymentContext = {
  countryCode: "GENERIC",
  version: "phase3a.generic-country-context.v1",
  effectiveDate: "2026-08-04",
  sourceMetadata: [],
  qualificationFramework: {},
  regionModel: {},
  jobTaxonomyMapping: {},
  workAuthorisationContext: {},
  recruitmentConventionContract: {},
  employmentProgrammeContract: {},
  salaryDataContract: {},
  languageContext: {},
  transportGeographicContext: {},
  formalInformalEmploymentContext: {},
  lowLiteracySupport: {},
  dataFreshness: "UNKNOWN",
  unavailableDataMarkers: ["GENERIC_CONTEXT_HAS_NO_LIVE_COUNTRY_FACTS"]
};

export const southAfricaAdapterSpecification = {
  countryCode: "ZA",
  status: "SPECIFICATION_ONLY_NO_LIVE_FACTS",
  requiredContracts: [
    "provinces",
    "major_employment_hubs",
    "nqf",
    "saqa_foreign_qualification_recognition",
    "matric_non_matric_pathways",
    "tvet",
    "seta_related_pathways",
    "learnerships",
    "apprenticeships",
    "internships",
    "graduate_programmes",
    "public_employment_services",
    "youth_employment_programmes",
    "work_authorisation_categories",
    "recruitment_conventions",
    "cv_expectations",
    "salary_data",
    "multilingual_context",
    "rural_township_urban_access",
    "formal_and_informal_pathways"
  ],
  sourceRequirement: "Every external fact must include source, effective date, version, confidence, and update policy."
} as const;
