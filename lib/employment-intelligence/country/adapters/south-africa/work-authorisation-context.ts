import type { WorkAuthorisationState } from "../../country-employment-context";

export const southAfricaWorkAuthorisationStates: WorkAuthorisationState[] = [
  "CITIZEN",
  "PERMANENT_RESIDENT",
  "VALID_WORK_AUTHORISATION",
  "AUTHORISATION_RESTRICTED",
  "AUTHORISATION_EXPIRED",
  "AUTHORISATION_PENDING",
  "NO_AUTHORISATION_CONFIRMED",
  "UNKNOWN",
  "USER_DECLINED"
];

export const southAfricaWorkAuthorisationContext = {
  states: southAfricaWorkAuthorisationStates,
  rules: [
    "Do not infer work authorization from nationality.",
    "User-supplied status remains self-reported unless evidence is verified.",
    "Unknown is uncertainty, not ineligibility.",
    "Restricted, expired, or pending status creates legal/documentation review needs, not a judgement of the person.",
    "No definitive legal advice is produced by the adapter."
  ],
  evidenceRequirements: ["user_confirmed_status", "document_reference_when_voluntarily_provided", "verification_status"],
  readinessImpact: ["WORK_ELIGIBILITY_READINESS"],
  confidenceImpact: "Unknown or unverified status lowers eligibility confidence only.",
  missingInformationActions: ["Confirm work authorization status or mark it for review."],
  pathwayDependencyHandling: "Pathways with lawful eligibility dependencies remain conditional until verified.",
  explanationKeys: ["za.work_authorisation.self_reported", "za.work_authorisation.verify_when_needed", "za.work_authorisation.nationality_not_authorisation"]
};
