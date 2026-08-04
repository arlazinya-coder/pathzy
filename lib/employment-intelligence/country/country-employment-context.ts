import type { CountryEmploymentContext, CountrySourceMetadata } from "../domain/country-context";
import type { ConfidenceAssessment } from "../domain/confidence";
import type { JobLevel } from "../domain/job-levels";
import type { PathwayCode } from "../domain/pathways";

export const countryFreshnessStates = ["CURRENT", "REVIEW_DUE", "STALE", "UNAVAILABLE", "UNKNOWN"] as const;
export type CountryFreshnessStatus = (typeof countryFreshnessStates)[number];

export const countrySourceTypes = [
  "GOVERNMENT",
  "STATUTORY_BODY",
  "QUALIFICATION_AUTHORITY",
  "INDUSTRY_BODY",
  "OFFICIAL_PROGRAMME",
  "LABOUR_MARKET_DATA",
  "INTERNAL_CURATED",
  "UNKNOWN"
] as const;
export type CountrySourceType = (typeof countrySourceTypes)[number];

export type CountrySourceRegistryRecord = {
  sourceId: string;
  title: string;
  authority: string;
  sourceType: CountrySourceType;
  jurisdiction: string;
  url?: string;
  externalReference?: string;
  retrievedAt?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  confidence: ConfidenceAssessment;
  topicsCovered: string[];
  notes: string[];
  status: CountryFreshnessStatus;
};

export type ProvinceCode = "EC" | "FS" | "GP" | "KZN" | "LP" | "MP" | "NC" | "NW" | "WC";

export type RegionContext = {
  provinceCode: ProvinceCode;
  canonicalName: string;
  labels: { en: string; fr: string };
  majorHubContract: string;
  urbanRuralTownshipContext: "STRUCTURAL_MARKER_ONLY";
  mobilityContext: string[];
  transportAccessConsiderations: string[];
  remoteWorkContextAvailability: CountryFreshnessStatus;
  dataConfidence: ConfidenceAssessment;
  sourceIds: string[];
};

export type QualificationRecognitionState =
  | "NOT_REQUIRED"
  | "RECOGNISED"
  | "RECOGNITION_REQUIRED"
  | "IN_PROGRESS"
  | "NOT_RECOGNISED"
  | "UNKNOWN"
  | "NOT_APPLICABLE";

export type QualificationContextRecord = {
  qualificationType: string;
  nqfLevel: number | null;
  institutionType: string;
  localQualification: boolean | "UNKNOWN";
  foreignQualification: boolean | "UNKNOWN";
  recognitionStatus: QualificationRecognitionState;
  recognitionRequired: boolean | "UNKNOWN";
  verificationEvidenceStatus: "VERIFIED" | "SELF_REPORTED" | "EVIDENCE_REQUIRED" | "UNKNOWN";
  pathwayImplications: PathwayCode[];
  explanationKeys: string[];
};

export type WorkAuthorisationState =
  | "CITIZEN"
  | "PERMANENT_RESIDENT"
  | "VALID_WORK_AUTHORISATION"
  | "AUTHORISATION_RESTRICTED"
  | "AUTHORISATION_EXPIRED"
  | "AUTHORISATION_PENDING"
  | "NO_AUTHORISATION_CONFIRMED"
  | "UNKNOWN"
  | "USER_DECLINED";

export type PathwayCountryContext = {
  pathwayCode: PathwayCode;
  contextRelevance: string;
  dependencies: string[];
  unavailableLiveDataWarning: string;
  confidenceEffect: "INCREASE" | "LOWER_WHEN_UNVERIFIED" | "NEUTRAL";
  sourceRequirements: string[];
  explanationKeys: string[];
};

export type JobLevelCountryContext = {
  level: JobLevel;
  examplesForInternalTesting: string[];
  roleRequirementCategories: string[];
  cautiousWording: string;
};

export type CountryContextResolutionRequest = {
  countryCode?: string | null;
  regionCode?: string | null;
  asOfDate?: string;
};

export type CountryContextResolution = {
  context: CountryEmploymentContext;
  adapterVersion: string;
  resolvedAt: string;
  limitations: string[];
  selectedRegion?: RegionContext;
  sourceRegistry: CountrySourceRegistryRecord[];
};

export function toCountrySourceMetadata(source: CountrySourceRegistryRecord): CountrySourceMetadata {
  return {
    sourceName: source.title,
    sourceUrl: source.url,
    retrievedAt: source.retrievedAt,
    effectiveDate: source.effectiveFrom ?? source.lastReviewedAt ?? "UNKNOWN",
    version: source.sourceId,
    confidence: source.confidence,
    expiryOrUpdatePolicy: source.nextReviewAt ? `Review by ${source.nextReviewAt}.` : "Review date unavailable; treat as UNKNOWN."
  };
}
