import { pathwayCodes, type PathwayCode } from "../../../domain/pathways";
import type { PathwayCountryContext } from "../../country-employment-context";

const dependencies: Partial<Record<PathwayCode, string[]>> = {
  GRADUATE_PROGRAMME: ["qualification_evidence", "eligibility_rules_unavailable"],
  INTERNSHIP: ["field_or_learning_goal", "eligibility_rules_unavailable"],
  LEARNERSHIP: ["eligibility_rules_unavailable", "programme_availability_unavailable"],
  APPRENTICESHIP: ["trade_or_occupational_interest", "eligibility_rules_unavailable"],
  QUALIFICATION_RECOGNITION: ["foreign_or_uncertain_qualification", "recognition_source_required"],
  LICENCE_OR_CERTIFICATE: ["licence_or_registration_evidence_required"],
  PUBLIC_EMPLOYMENT_PROGRAMME: ["programme_availability_unavailable", "eligibility_rules_unavailable"],
  SKILLED_EMPLOYMENT: ["skills_or_trade_evidence"],
  PROFESSIONAL_EMPLOYMENT: ["qualification_or_registration_evidence_may_be_required"],
  INFORMAL_OR_COMMUNITY_WORK: ["informal_evidence_can_be_self_reported_or_reference_supported"],
  MICRO_ENTERPRISE: ["self_employment_evidence_or_business_goal"],
  SELF_EMPLOYMENT: ["self_employment_evidence_or_business_goal"]
};

export const southAfricaPathwayContexts: PathwayCountryContext[] = pathwayCodes.map((pathwayCode) => ({
  pathwayCode,
  contextRelevance: `${pathwayCode} can be evaluated in South Africa through structural dependencies and verified evidence.`,
  dependencies: dependencies[pathwayCode] ?? ["professional_identity", "employment_diagnosis", "work_authorisation_review_when_needed"],
  unavailableLiveDataWarning: ["LEARNERSHIP", "INTERNSHIP", "GRADUATE_PROGRAMME", "APPRENTICESHIP", "PUBLIC_EMPLOYMENT_PROGRAMME"].includes(pathwayCode)
    ? "Live programme availability and eligibility data is unavailable in Phase 3C."
    : "Live market demand data is unavailable in Phase 3C.",
  confidenceEffect: dependencies[pathwayCode]?.some((item) => item.includes("unavailable")) ? "LOWER_WHEN_UNVERIFIED" : "NEUTRAL",
  sourceRequirements: ["ZA_INTERNAL_STRUCTURAL_CONTEXT_V1", "verified external data required before current eligibility or availability claims"],
  explanationKeys: [`za.pathway.${pathwayCode.toLowerCase()}`]
}));

export const southAfricaEmploymentProgrammeContracts = {
  supportedPathways: ["LEARNERSHIP", "INTERNSHIP", "GRADUATE_PROGRAMME", "APPRENTICESHIP", "PUBLIC_EMPLOYMENT_PROGRAMME", "WORK_INTEGRATED_LEARNING"],
  fields: ["pathwayCode", "structuralPurpose", "typicalUserSituations", "likelyDependencies", "evidenceRequirements", "eligibilityDataStatus", "sourceRequirements", "liveAvailabilityStatus", "limitations"],
  defaultLiveAvailabilityStatus: "UNAVAILABLE",
  prohibitedClaims: ["DIRECT_ELIGIBILITY_CONFIRMATION", "LIVE_PROGRAMME_AVAILABILITY_CLAIM", "UNSOURCED_STIPEND_OR_SALARY_CLAIM"]
};
