import type { Explanation } from "../domain/explainability";
import type { OverallReadinessSummary, ReadinessDimensionAssessment } from "../domain/readiness";
import type { DetectedBarrier } from "../domain/barriers";
import type { EvidenceAssessmentSummary, MissingInformation, PathwayEvaluation, SupportIntensitySelection } from "./engine-types";
import { createConfidenceAssessment } from "./calculate-confidence";

export function buildEmploymentExplanations(args: {
  overall: OverallReadinessSummary;
  dimensions: ReadinessDimensionAssessment[];
  barriers: DetectedBarrier[];
  pathways: PathwayEvaluation[];
  missing: MissingInformation[];
  support: SupportIntensitySelection;
  evidenceSummary: EvidenceAssessmentSummary;
}): Explanation[] {
  const topPathway = args.pathways[0];
  return [
    {
      conclusionCode: "OVERALL_READINESS",
      summary: `Overall readiness is ${args.overall.readinessBand}. This conclusion uses confirmed profile information, diagnosis answers, barriers, and missing information.`,
      reasons: args.dimensions.slice(0, 5).map((dimension) => ({
        code: dimension.key,
        summary: `${dimension.key} is ${dimension.band}.`,
        sourceReferences: dimension.evidence.map((item) => item.id)
      })),
      evidenceReferences: args.evidenceSummary.strongestSupportedAssets.map((item) => item.id),
      uncertainty: args.missing.map((item) => item.code),
      userControlledFactors: args.barriers.flatMap((item) => item.userCanChange),
      externalFactors: args.barriers.flatMap((item) => item.externalFactors),
      confidence: args.overall.confidence
    },
    {
      conclusionCode: "RECOMMENDED_PATHWAY",
      summary: topPathway
        ? `${topPathway.pathwayCode} is ranked first with ${topPathway.suitability} suitability.`
        : "No pathway can be ranked until more information is available.",
      reasons: topPathway
        ? [{
            code: topPathway.pathwayCode,
            summary: topPathway.reason,
            sourceReferences: args.evidenceSummary.strongestSupportedAssets.map((item) => item.id)
          }]
        : [],
      evidenceReferences: args.evidenceSummary.strongestSupportedAssets.map((item) => item.id),
      uncertainty: topPathway?.missingInformation ?? args.missing.map((item) => item.code),
      userControlledFactors: topPathway?.unmetDependencies ?? [],
      externalFactors: args.barriers.flatMap((item) => item.externalFactors),
      confidence: topPathway?.confidence ?? createConfidenceAssessment({ completeness: 0, evidence: 0, ruleCertainty: 0.4, countryContext: 0.3, rationale: ["explanation.no.pathway"] })
    },
    {
      conclusionCode: "SUPPORT_INTENSITY",
      summary: `Support intensity is ${args.support.level}.`,
      reasons: args.support.reasons.map((reason, index) => ({
        code: `SUPPORT_REASON_${index + 1}`,
        summary: reason,
        sourceReferences: []
      })),
      evidenceReferences: [],
      uncertainty: args.missing.map((item) => item.code),
      userControlledFactors: args.support.reasons,
      externalFactors: [],
      confidence: args.support.confidence
    }
  ];
}
