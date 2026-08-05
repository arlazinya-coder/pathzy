export * from "./barriers";
export * from "./career-plan";
export * from "./collection-invariants";
export * from "./confidence";
export * from "./country-context";
export * from "./employment-intelligence-input";
export * from "./employment-intelligence-profile";
export * from "./evidence";
export * from "./explainability";
export * from "./job-levels";
export * from "./next-best-action";
export * from "./pathways";
export * from "./readiness";
export * from "./stale-status";
export * from "./support-intensity";
export * from "../actions";

export const phase3aForbiddenCanonicalTerms = ["WEAK", "POOR", "BAD", "UNEMPLOYABLE"] as const;

export const employmentIntelligenceConsumerRule =
  "Consumers may read Employment Intelligence. Consumers must not independently recalculate it." as const;

export const employmentIntelligenceAiBoundary = {
  maySupport: [
    "summarise_open_text_answers",
    "identify_possible_transferable_skills",
    "generate_supportive_explanations",
    "adapt_plain_language_wording",
    "propose_career_directions",
    "draft_career_plan_wording"
  ],
  mustNotDetermine: [
    "identity_completion",
    "work_eligibility",
    "evidence_verification",
    "hard_eligibility",
    "canonical_readiness_bands_without_rules",
    "route_state",
    "ownership",
    "legal_conclusions"
  ]
} as const;
