import { createConfidenceAssessment } from "../../../engine/calculate-confidence";

export const SOUTH_AFRICA_EMPLOYMENT_CONTEXT_VERSION = "3C.1";
export const SOUTH_AFRICA_CONTEXT_EFFECTIVE_DATE = "2026-08-04";

export const zaStructuralConfidence = createConfidenceAssessment({
  completeness: 0.68,
  evidence: 0.58,
  ruleCertainty: 0.72,
  countryContext: 0.62,
  rationale: ["south_africa.structural_context.no_live_claims"]
});

export const zaUnavailableConfidence = createConfidenceAssessment({
  completeness: 0.25,
  evidence: 0.05,
  ruleCertainty: 0.8,
  countryContext: 0.1,
  rationale: ["south_africa.live_data.unavailable"]
});

export const southAfricaUnavailableDataMarkers = [
  "ZA_CURRENT_SALARY_DATA_UNAVAILABLE",
  "ZA_CURRENT_PROGRAMME_OPENINGS_UNAVAILABLE",
  "ZA_CURRENT_MARKET_DEMAND_UNAVAILABLE",
  "ZA_CURRENT_LEGAL_RULE_DETAILS_REQUIRE_VERIFIED_SOURCE",
  "ZA_CURRENT_COMMUTE_COSTS_UNAVAILABLE"
] as const;

export const southAfricaAdapterLimitations = [
  "Structural South Africa context is available, but live labour-market data is unavailable.",
  "Programme eligibility, salary, market demand, and legal details require verified source configuration before user-facing conclusions.",
  "Nationality is never used as work authorization.",
  "Foreign qualification recognition is evidence-aware and may require user review."
] as const;
