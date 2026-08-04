import type { ConfidenceAssessment } from "../domain/confidence";
import type { EmploymentSignal, EvidenceAssessmentSummary } from "./engine-types";
import { confidenceLevelFromScore } from "./engine-types";

function bounded(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

export function createConfidenceAssessment(input: {
  completeness: number;
  evidence: number;
  ruleCertainty: number;
  countryContext: number;
  recency?: number;
  conflicts?: string[];
  rationale?: string[];
}): ConfidenceAssessment {
  const conflictingInformation = input.conflicts ?? [];
  const conflictingPenalty = Math.min(0.25, conflictingInformation.length * 0.07);
  const composite = bounded(
    bounded(input.completeness) * 0.28 +
      bounded(input.evidence) * 0.28 +
      bounded(input.ruleCertainty) * 0.22 +
      bounded(input.countryContext) * 0.12 +
      bounded(input.recency ?? 0.7) * 0.1 -
      conflictingPenalty
  );
  return {
    level: confidenceLevelFromScore(composite),
    rationale: input.rationale ?? [],
    inputCompleteness: bounded(input.completeness),
    evidenceQuality: bounded(input.evidence),
    ruleCertainty: bounded(input.ruleCertainty),
    countryContextQuality: bounded(input.countryContext),
    recency: bounded(input.recency ?? 0.7),
    conflictingInformation
  };
}

export function confidenceFromSignals(signals: EmploymentSignal[], evidenceSummary?: EvidenceAssessmentSummary) {
  const known = signals.filter((signal) => signal.provenance !== "UNKNOWN" && signal.provenance !== "USER_DECLINED").length;
  const completeness = signals.length ? known / signals.length : 0;
  const conflicts = signals.flatMap((signal) => signal.conflictingData);
  const evidence = evidenceSummary?.overallEvidenceConfidence.evidenceQuality ?? (signals.some((signal) => signal.sourceReferences.length) ? 0.55 : 0.2);
  return createConfidenceAssessment({
    completeness,
    evidence,
    ruleCertainty: 0.74,
    countryContext: 0.35,
    conflicts,
    rationale: ["confidence.from.normalized.signals", "confidence.evidence.separate.from.self_confidence"]
  });
}

export function averageConfidence(assessments: ConfidenceAssessment[], rationale: string[]) {
  if (!assessments.length) {
    return createConfidenceAssessment({ completeness: 0, evidence: 0, ruleCertainty: 0.4, countryContext: 0.3, rationale });
  }
  const sum = assessments.reduce(
    (acc, item) => ({
      completeness: acc.completeness + item.inputCompleteness,
      evidence: acc.evidence + item.evidenceQuality,
      ruleCertainty: acc.ruleCertainty + item.ruleCertainty,
      countryContext: acc.countryContext + item.countryContextQuality,
      recency: acc.recency + item.recency,
      conflicts: [...acc.conflicts, ...item.conflictingInformation]
    }),
    { completeness: 0, evidence: 0, ruleCertainty: 0, countryContext: 0, recency: 0, conflicts: [] as string[] }
  );
  const count = assessments.length;
  return createConfidenceAssessment({
    completeness: sum.completeness / count,
    evidence: sum.evidence / count,
    ruleCertainty: sum.ruleCertainty / count,
    countryContext: sum.countryContext / count,
    recency: sum.recency / count,
    conflicts: Array.from(new Set(sum.conflicts)),
    rationale
  });
}
