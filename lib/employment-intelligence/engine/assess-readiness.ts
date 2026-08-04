import type { DetectedBarrier } from "../domain/barriers";
import type { EvidenceRecord } from "../domain/evidence";
import { readinessBandDefinitions, readinessDimensions, type ReadinessDimensionAssessment, type ReadinessDimensionKey, type OverallReadinessSummary } from "../domain/readiness";
import type { EvidenceAssessmentSummary, EmploymentSignal, MissingInformation, Strength, SupportIntensitySelection } from "./engine-types";
import { bandFromScore } from "./engine-types";
import { createConfidenceAssessment, averageConfidence } from "./calculate-confidence";

const dimensionInputs: Record<ReadinessDimensionKey, string[]> = {
  IDENTITY_READINESS: ["CURRENT_SITUATION_KNOWN", "LOCATION_KNOWN", "WORK_AUTHORIZATION_KNOWN"],
  CAREER_DIRECTION_READINESS: ["CAREER_GOAL_PRESENT", "CAREER_DIRECTION_SPECIFICITY"],
  QUALIFICATION_READINESS: ["EDUCATION_PRESENT", "CERTIFICATES_PRESENT", "LICENCES_PRESENT"],
  EXPERIENCE_READINESS: ["EXPERIENCE_PRESENT", "PROJECT_EVIDENCE_PRESENT", "ACHIEVEMENTS_PRESENT"],
  SKILLS_READINESS: ["SKILLS_PRESENT", "PROJECT_EVIDENCE_PRESENT", "CERTIFICATES_PRESENT"],
  EVIDENCE_READINESS: ["PROJECT_EVIDENCE_PRESENT", "ACHIEVEMENTS_PRESENT", "REFERENCES_AVAILABLE", "PORTFOLIO_PRESENT"],
  DOCUMENT_READINESS: ["SUMMARY_PRESENT", "CAREER_GOAL_PRESENT", "EVIDENCE_READINESS"],
  OPPORTUNITY_READINESS: ["CAREER_GOAL_PRESENT", "LOCATION_KNOWN", "EMPLOYMENT_PREFERENCES_PRESENT"],
  APPLICATION_READINESS: ["APPLICATION_ACTIVITY_KNOWN", "SUMMARY_PRESENT", "REFERENCES_AVAILABLE"],
  INTERVIEW_READINESS: ["INTERVIEW_ACTIVITY_KNOWN", "EXPERIENCE_PRESENT", "LITERACY_COMMUNICATION_COMFORT"],
  DIGITAL_ACCESS_READINESS: ["DEVICE_INTERNET_ACCESS", "DIGITAL_CONFIDENCE"],
  WORK_ELIGIBILITY_READINESS: ["WORK_AUTHORIZATION_KNOWN"],
  PRACTICAL_ACCESS_READINESS: ["TRANSPORT_ACCESS", "AVAILABILITY_KNOWN", "MOBILITY", "CARE_RESPONSIBILITIES"],
  CONFIDENCE_AND_SUPPORT_READINESS: ["USER_CONFIDENCE", "SUPPORT_NEEDS", "WILLINGNESS_TO_LEARN"]
};

function isPositive(signal: EmploymentSignal | undefined) {
  if (!signal || signal.provenance === "UNKNOWN" || signal.provenance === "USER_DECLINED") return false;
  if (typeof signal.value === "boolean") return signal.value;
  if (typeof signal.value === "number") return signal.value > 0;
  if (Array.isArray(signal.value)) return signal.value.length > 0;
  return !/^(unknown|none|no|false|broad|)$/i.test(String(signal.value));
}

function scoreDimension(key: ReadinessDimensionKey, signals: EmploymentSignal[], missing: MissingInformation[], barriers: DetectedBarrier[]) {
  const relevantInputs = dimensionInputs[key];
  const selected = relevantInputs.map((code) => signals.find((signal) => signal.code === code));
  const known = selected.filter((signal) => signal && signal.provenance !== "UNKNOWN" && signal.provenance !== "USER_DECLINED").length;
  const positives = selected.filter(isPositive).length;
  const unknown = selected.length > 0 && known === 0;
  const missingImpact = missing.filter((item) => item.affectedReadinessDimensions.includes(key)).length;
  const barrierImpact = barriers.filter((item) => {
    if (key === "PRACTICAL_ACCESS_READINESS") return item.definitionCode === "PRACTICAL_ACCESS_CONSTRAINT";
    if (key === "WORK_ELIGIBILITY_READINESS") return item.definitionCode === "WORK_AUTHORIZATION_UNCERTAINTY";
    if (key === "EVIDENCE_READINESS" || key === "SKILLS_READINESS") return item.definitionCode === "UNSUPPORTED_SKILL_CLAIMS";
    if (key === "IDENTITY_READINESS") return item.definitionCode === "INCOMPLETE_PROFESSIONAL_IDENTITY";
    return false;
  }).length;
  const score = Math.max(0, Math.min(100, 28 + positives * 18 + known * 8 - missingImpact * 10 - barrierImpact * 14));
  return { score, unknown, selected };
}

function evidenceForDimension(key: ReadinessDimensionKey, evidenceSummary: EvidenceAssessmentSummary): EvidenceRecord[] {
  const supporting = evidenceSummary.assessments
    .filter((assessment) => {
      if (key === "EXPERIENCE_READINESS") return ["EXPERIENCE", "PROJECTS", "ACHIEVEMENTS"].includes(assessment.code);
      if (key === "SKILLS_READINESS") return ["SKILLS", "PROJECTS", "CERTIFICATES"].includes(assessment.code);
      if (key === "QUALIFICATION_READINESS") return ["EDUCATION", "CERTIFICATES", "LICENCES"].includes(assessment.code);
      if (key === "EVIDENCE_READINESS") return ["PROJECTS", "ACHIEVEMENTS", "PORTFOLIO", "REFERENCES"].includes(assessment.code);
      return assessment.evidence.length > 0;
    })
    .flatMap((assessment) => assessment.evidence);
  return supporting.slice(0, 4);
}

export function assessReadinessDimensions(args: {
  signals: EmploymentSignal[];
  missing: MissingInformation[];
  barriers: DetectedBarrier[];
  evidenceSummary: EvidenceAssessmentSummary;
  engineVersion: string;
  assessedAt: string;
}): ReadinessDimensionAssessment[] {
  return readinessDimensions.map((key) => {
    const scored = scoreDimension(key, args.signals, args.missing, args.barriers);
    const dimensionMissing = args.missing.filter((item) => item.affectedReadinessDimensions.includes(key)).map((item) => item.code);
    const dimensionBarriers = args.barriers
      .filter((item) => item.definitionCode.includes(key.split("_")[0]) || dimensionMissing.length)
      .map((item) => item.definitionCode)
      .slice(0, 3);
    return {
      key,
      definition: readinessBandDefinitions[bandFromScore(scored.score, scored.unknown)],
      inputsUsed: dimensionInputs[key],
      exclusions: ["No protected characteristics are used.", "Low access and low confidence are support signals, not capability judgments."],
      band: bandFromScore(scored.score, scored.unknown),
      optionalScore: scored.unknown ? undefined : scored.score,
      confidence: createConfidenceAssessment({
        completeness: scored.selected.length ? scored.selected.filter((signal) => signal && signal.provenance !== "UNKNOWN").length / scored.selected.length : 0,
        evidence: evidenceForDimension(key, args.evidenceSummary).length ? 0.65 : 0.25,
        ruleCertainty: 0.72,
        countryContext: 0.35,
        rationale: [`readiness.dimension.${key.toLowerCase()}`]
      }),
      evidence: evidenceForDimension(key, args.evidenceSummary),
      missingInformation: dimensionMissing,
      strengths: scored.unknown ? [] : scored.selected.filter(isPositive).map((signal) => signal?.code ?? "").filter(Boolean),
      barriers: dimensionBarriers,
      recommendedActions: dimensionMissing.length ? [`Resolve ${dimensionMissing[0]}.`] : ["Use this dimension to guide the next practical action."],
      explainabilityMessage: scored.unknown
        ? `${key} is not assessed yet because the required inputs are missing or declined.`
        : `${key} uses confirmed signals and separates practical support needs from capability.`,
      lastAssessedAt: args.assessedAt,
      engineVersion: args.engineVersion
    };
  });
}

export function summarizeOverallReadiness(args: {
  dimensions: ReadinessDimensionAssessment[];
  barriers: DetectedBarrier[];
  strengths: Strength[];
  supportIntensity: SupportIntensitySelection;
  missing: MissingInformation[];
  recommendedPathway: string;
}): OverallReadinessSummary {
  const assessed = args.dimensions.filter((item) => item.band !== "NOT_ASSESSED");
  const average = assessed.length ? assessed.reduce((total, item) => total + (item.optionalScore ?? 0), 0) / assessed.length : 0;
  const criticalBarrier = args.barriers.some((item) => item.severity === "CRITICAL" || item.definitionCode === "WORK_AUTHORIZATION_UNCERTAINTY");
  const tooUnknown = assessed.length < Math.ceil(args.dimensions.length / 2);
  const adjusted = criticalBarrier ? Math.min(average, 55) : average;
  return {
    readinessBand: bandFromScore(adjusted, tooUnknown),
    secondaryNumericIndex: tooUnknown ? undefined : Math.round(adjusted),
    strongestAssets: args.strengths.map((item) => item.code).slice(0, 5),
    highestImpactBarriers: args.barriers.map((item) => item.definitionCode).slice(0, 5),
    immediateEmploymentPotential: criticalBarrier
      ? "Some routes may be possible, but eligibility or documentation needs review first."
      : tooUnknown
        ? "PATHZY needs more information before making a reliable readiness conclusion."
        : "PATHZY can identify practical next steps from the confirmed information.",
    suitableJobLevels: [],
    supportIntensity: args.supportIntensity.level,
    recommendedPathway: args.recommendedPathway,
    confidence: averageConfidence(args.dimensions.map((item) => item.confidence), ["overall.readiness.dimension.weighted.summary"]),
    missingInformation: args.missing.map((item) => item.code),
    methodologyNotes: [
      "The overall band is dependency-aware and is not a simple average.",
      "Unknown information lowers confidence rather than producing a negative judgment.",
      "Practical barriers affect support intensity and pathway fit, not the user's worth or capability."
    ]
  };
}
