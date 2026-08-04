import { jobLevels, type JobLevel } from "../../../domain/job-levels";
import type { JobLevelCountryContext } from "../../country-employment-context";

const examples: Record<JobLevel, string[]> = {
  FOUNDATIONAL: ["cleaner", "domestic worker", "retail assistant"],
  SERVICE: ["cleaner", "domestic worker", "security officer", "retail assistant", "cashier", "call-centre worker"],
  OPERATIONAL: ["warehouse worker", "driver", "receptionist"],
  CLERICAL: ["administrator", "receptionist"],
  TECHNICAL: ["technician", "IT support", "laboratory technician"],
  SKILLED_TRADE: ["artisan", "trade candidate"],
  GRADUATE: ["graduate"],
  PROFESSIONAL: ["accountant", "engineer", "healthcare professional"],
  MANAGEMENT: ["manager"],
  EXECUTIVE: ["executive"],
  ENTREPRENEURIAL: ["micro-enterprise owner"]
};

export const southAfricaJobLevelContexts: JobLevelCountryContext[] = jobLevels.map((level) => ({
  level,
  examplesForInternalTesting: examples[level],
  roleRequirementCategories: [
    "no_formal_qualification_usually_required",
    "role_specific_training_often_required",
    "licence_or_registration_potentially_required",
    "occupational_qualification_relevant",
    "tertiary_qualification_commonly_relevant",
    "professional_registration_potentially_required",
    "experience_led_pathway",
    "evidence_or_portfolio_led_pathway"
  ],
  cautiousWording: "Role requirements vary by employer and must be verified against the actual opportunity."
}));

export const southAfricaSecuritySectorContext = {
  dependencyMarkers: ["registration_or_licence_dependency", "training_dependency", "renewal_or_validity_evidence", "work_authorisation_dependency", "shift_availability", "transport_considerations"],
  evidenceStatus: "EVIDENCE_REQUIRED",
  missingInformationAction: "Confirm registration, training, validity, and work authorization evidence before relying on the security pathway.",
  prohibitedClaims: ["current fees", "current grades", "validity period", "automatic qualification"]
};

export const southAfricaServiceRoleEvidenceContext = {
  evidenceExamples: ["household management", "cleaning", "hygiene standards", "reliability", "time management", "customer service", "stock handling", "cash handling", "caregiving", "food preparation", "informal references", "community work", "self-employment", "family business experience"],
  rules: ["Informal experience counts.", "Lack of a formal job title must not erase capability.", "Informal references may be clearly labelled."]
};
