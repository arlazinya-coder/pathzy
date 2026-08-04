import type { ConfidenceAssessment } from "./confidence";
import type { EvidenceRecord } from "./evidence";

export const barrierCategories = [
  "PROFILE_AND_EVIDENCE",
  "JOB_SEARCH",
  "PRACTICAL_ACCESS",
  "QUALIFICATION",
  "LEGAL_AND_DOCUMENTATION",
  "COMMUNICATION",
  "CONFIDENCE_AND_SUPPORT",
  "MARKET_AND_STRUCTURAL"
] as const;

export type BarrierCategory = (typeof barrierCategories)[number];

export const barrierSeverityLevels = ["INFORMATIONAL", "LOW", "MODERATE", "HIGH", "CRITICAL"] as const;

export type BarrierSeverity = (typeof barrierSeverityLevels)[number];

export type BarrierControlClassification = "USER_CONTROLLED" | "PARTLY_CONTROLLED" | "EXTERNAL";

export type BarrierDefinition = {
  code: string;
  category: BarrierCategory;
  title: string;
  description: string;
  severityLevels: BarrierSeverity[];
  evidenceRequirements: string[];
  confidenceRules: string[];
  controlClassification: BarrierControlClassification;
  immediateAction: string;
  longerTermAction: string;
  pathzySupportRoute: string;
  falsePositiveRisk: string;
  supportiveUserFacingWording: string;
};

export type DetectedBarrier = {
  definitionCode: string;
  severity: BarrierSeverity;
  evidence: EvidenceRecord[];
  confidence: ConfidenceAssessment;
  userCanChange: string[];
  externalFactors: string[];
  recommendedActions: string[];
};

export const coreBarrierDefinitions: BarrierDefinition[] = [
  {
    code: "INCOMPLETE_PROFESSIONAL_IDENTITY",
    category: "PROFILE_AND_EVIDENCE",
    title: "Incomplete Professional Identity",
    description: "Important employment identity information is missing or unconfirmed.",
    severityLevels: ["LOW", "MODERATE", "HIGH"],
    evidenceRequirements: ["Professional Identity completion metadata"],
    confidenceRules: ["Increase confidence only when required sections are known."],
    controlClassification: "USER_CONTROLLED",
    immediateAction: "Complete the next required Professional Identity section.",
    longerTermAction: "Review and maintain identity evidence as circumstances change.",
    pathzySupportRoute: "/professional-identity",
    falsePositiveRisk: "A user may intentionally decline a field.",
    supportiveUserFacingWording: "A few details are still needed so PATHZY can guide you accurately."
  },
  {
    code: "UNSUPPORTED_SKILL_CLAIMS",
    category: "PROFILE_AND_EVIDENCE",
    title: "Unsupported Skill Claims",
    description: "Skills exist in the profile without enough evidence for confident use.",
    severityLevels: ["INFORMATIONAL", "LOW", "MODERATE"],
    evidenceRequirements: ["Skills, projects, experience, documents, or portfolio evidence"],
    confidenceRules: ["Do not treat unsupported skills as verified."],
    controlClassification: "PARTLY_CONTROLLED",
    immediateAction: "Add examples, projects, or documents that support the skill.",
    longerTermAction: "Build portfolio or reference evidence over time.",
    pathzySupportRoute: "/professional-identity?section=skills",
    falsePositiveRisk: "Informal or lived experience may not be documented yet.",
    supportiveUserFacingWording: "You may have the skill; PATHZY needs clearer evidence before relying on it."
  },
  {
    code: "PRACTICAL_ACCESS_CONSTRAINT",
    category: "PRACTICAL_ACCESS",
    title: "Practical Access Constraint",
    description: "Transport, device, internet, care, or location constraints may affect next steps.",
    severityLevels: ["LOW", "MODERATE", "HIGH", "CRITICAL"],
    evidenceRequirements: ["Employment Diagnosis answers and user-confirmed constraints"],
    confidenceRules: ["Separate practical constraints from capability."],
    controlClassification: "PARTLY_CONTROLLED",
    immediateAction: "Choose actions and opportunities that match current access realities.",
    longerTermAction: "Identify support routes, remote options, or practical changes.",
    pathzySupportRoute: "/discovery",
    falsePositiveRisk: "Access may vary week to week.",
    supportiveUserFacingWording: "PATHZY will adapt the plan to your real-world access, not judge your ability."
  },
  {
    code: "MARKET_OR_STRUCTURAL_BARRIER",
    category: "MARKET_AND_STRUCTURAL",
    title: "Market or Structural Barrier",
    description: "External labour-market conditions may affect opportunity availability.",
    severityLevels: ["INFORMATIONAL", "LOW", "MODERATE", "HIGH"],
    evidenceRequirements: ["Country context, location context, opportunity availability, source metadata"],
    confidenceRules: ["Do not blame the user for external conditions."],
    controlClassification: "EXTERNAL",
    immediateAction: "Use a wider or alternative pathway search where appropriate.",
    longerTermAction: "Track market options and skill/pathway alternatives.",
    pathzySupportRoute: "/opportunities",
    falsePositiveRisk: "Market data may be stale or incomplete.",
    supportiveUserFacingWording: "Some barriers are external; PATHZY will help you find practical routes around them."
  }
];
