import type { CountrySourceRegistryRecord } from "../../country-employment-context";
import { SOUTH_AFRICA_CONTEXT_EFFECTIVE_DATE, zaStructuralConfidence, zaUnavailableConfidence } from "./data-status";

export const southAfricaSourceRegistry: CountrySourceRegistryRecord[] = [
  {
    sourceId: "ZA_INTERNAL_STRUCTURAL_CONTEXT_V1",
    title: "PATHZY South Africa structural employment context",
    authority: "PATHZY curated structural model",
    sourceType: "INTERNAL_CURATED",
    jurisdiction: "ZA",
    effectiveFrom: SOUTH_AFRICA_CONTEXT_EFFECTIVE_DATE,
    lastReviewedAt: SOUTH_AFRICA_CONTEXT_EFFECTIVE_DATE,
    nextReviewAt: "2026-10-04",
    confidence: zaStructuralConfidence,
    topicsCovered: ["provinces", "pathway_dependencies", "informal_work_evidence", "practical_access"],
    notes: ["Contains structural contracts only. Does not contain live jobs, salary values, legal conclusions, or programme availability records."],
    status: "CURRENT"
  },
  {
    sourceId: "ZA_QUALIFICATION_AUTHORITY_REQUIRED_SOURCE",
    title: "Qualification recognition source required",
    authority: "Qualification authority source required before factual recognition claims",
    sourceType: "QUALIFICATION_AUTHORITY",
    jurisdiction: "ZA",
    confidence: zaUnavailableConfidence,
    topicsCovered: ["nqf", "foreign_qualification_recognition", "professional_registration"],
    notes: ["Placeholder marks that recognition data must be verified before PATHZY claims a level or status."],
    status: "UNAVAILABLE"
  },
  {
    sourceId: "ZA_LIVE_PROGRAMME_DATA_REQUIRED_SOURCE",
    title: "Live programme availability source required",
    authority: "Official programme source required before eligibility or availability claims",
    sourceType: "OFFICIAL_PROGRAMME",
    jurisdiction: "ZA",
    confidence: zaUnavailableConfidence,
    topicsCovered: ["learnerships", "internships", "graduate_programmes", "public_employment_programmes"],
    notes: ["No live programme names, openings, age rules, stipends, or eligibility outcomes are included in Phase 3C."],
    status: "UNAVAILABLE"
  },
  {
    sourceId: "ZA_SALARY_DATA_REQUIRED_SOURCE",
    title: "Salary data source required",
    authority: "Labour-market data source required before salary estimates",
    sourceType: "LABOUR_MARKET_DATA",
    jurisdiction: "ZA",
    confidence: zaUnavailableConfidence,
    topicsCovered: ["salary_data", "market_demand"],
    notes: ["No salary values or demand forecasts are included in Phase 3C."],
    status: "UNAVAILABLE"
  },
  {
    sourceId: "ZA_WORK_AUTHORISATION_VERIFICATION_REQUIRED",
    title: "Work authorization verification required",
    authority: "Verified user evidence or official guidance required before legal conclusions",
    sourceType: "GOVERNMENT",
    jurisdiction: "ZA",
    confidence: zaUnavailableConfidence,
    topicsCovered: ["work_authorisation", "documentation"],
    notes: ["The adapter provides states and evidence requirements only; it does not provide immigration or labour-law advice."],
    status: "UNAVAILABLE"
  }
];
