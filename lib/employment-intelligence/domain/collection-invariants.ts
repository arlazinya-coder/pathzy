import type { DetectedBarrier } from "./barriers";
import type { CareerPlan, CareerPlanStep } from "./career-plan";
import type { ConfidenceAssessment } from "./confidence";
import type { EmploymentIntelligenceProfile } from "./employment-intelligence-profile";
import type { EvidenceRecord } from "./evidence";
import type { NextBestAction } from "./next-best-action";
import type { PathwayRecommendation } from "./pathways";
import type { ReadinessDimensionAssessment } from "./readiness";

function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean)));
}

function canonicalKey(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function confidenceScore(confidence: ConfidenceAssessment) {
  return confidence.inputCompleteness + confidence.evidenceQuality + confidence.ruleCertainty + confidence.countryContextQuality + confidence.recency;
}

function mergeConfidence(primary: ConfidenceAssessment, duplicate: ConfidenceAssessment): ConfidenceAssessment {
  const stronger = confidenceScore(duplicate) > confidenceScore(primary) ? duplicate : primary;
  return {
    ...stronger,
    inputCompleteness: Math.max(primary.inputCompleteness, duplicate.inputCompleteness),
    evidenceQuality: Math.max(primary.evidenceQuality, duplicate.evidenceQuality),
    ruleCertainty: Math.max(primary.ruleCertainty, duplicate.ruleCertainty),
    countryContextQuality: Math.max(primary.countryContextQuality, duplicate.countryContextQuality),
    recency: Math.max(primary.recency, duplicate.recency),
    rationale: uniqueStrings([...primary.rationale, ...duplicate.rationale]),
    conflictingInformation: uniqueStrings([...primary.conflictingInformation, ...duplicate.conflictingInformation])
  };
}

function mergeEvidenceRecord(primary: EvidenceRecord, duplicate: EvidenceRecord): EvidenceRecord {
  const sourceReferences = uniqueStrings([primary.sourceReference, duplicate.sourceReference]);
  const supportingFields = uniqueStrings([primary.supportingField, duplicate.supportingField]);
  const supportingAssets = uniqueStrings([primary.supportingAssetId, duplicate.supportingAssetId]);
  return {
    ...primary,
    confidence: mergeConfidence(primary.confidence, duplicate.confidence),
    missingEvidence: uniqueStrings([...(primary.missingEvidence ?? []), ...(duplicate.missingEvidence ?? [])]),
    internalNotes: uniqueStrings([
      ...(primary.internalNotes ?? []),
      ...(duplicate.internalNotes ?? []),
      sourceReferences.length > 1 ? `Merged evidence source references: ${sourceReferences.join(", ")}` : "",
      supportingFields.length > 1 ? `Merged supporting fields: ${supportingFields.join(", ")}` : "",
      supportingAssets.length > 1 ? `Merged supporting assets: ${supportingAssets.join(", ")}` : ""
    ])
  };
}

export function employmentEvidenceDisplayCode(record: EvidenceRecord) {
  return canonicalKey(record.subject || record.id || record.supportingField || record.sourceReference);
}

export function mergeDuplicateEvidenceRecords(records: EvidenceRecord[] = []) {
  const merged = new Map<string, EvidenceRecord>();
  for (const record of records) {
    const key = employmentEvidenceDisplayCode(record);
    if (!key) continue;
    const existing = merged.get(key);
    merged.set(key, existing ? mergeEvidenceRecord(existing, record) : record);
  }
  return Array.from(merged.values()).sort((a, b) => employmentEvidenceDisplayCode(a).localeCompare(employmentEvidenceDisplayCode(b)));
}

function uniqueBy<T>(items: T[], keyFor: (item: T) => string | null | undefined, merge?: (existing: T, duplicate: T) => T) {
  const keyed = new Map<string, T>();
  for (const item of items) {
    const key = canonicalKey(keyFor(item));
    if (!key) continue;
    const existing = keyed.get(key);
    keyed.set(key, existing && merge ? merge(existing, item) : existing ?? item);
  }
  return Array.from(keyed.values());
}

function mergeBarrier(existing: DetectedBarrier, duplicate: DetectedBarrier): DetectedBarrier {
  const severityOrder = ["INFORMATIONAL", "LOW", "MODERATE", "HIGH", "CRITICAL"] as const;
  const severity = severityOrder.indexOf(duplicate.severity) > severityOrder.indexOf(existing.severity) ? duplicate.severity : existing.severity;
  return {
    ...existing,
    severity,
    evidence: mergeDuplicateEvidenceRecords([...existing.evidence, ...duplicate.evidence]),
    confidence: mergeConfidence(existing.confidence, duplicate.confidence),
    userCanChange: uniqueStrings([...existing.userCanChange, ...duplicate.userCanChange]),
    externalFactors: uniqueStrings([...existing.externalFactors, ...duplicate.externalFactors]),
    recommendedActions: uniqueStrings([...existing.recommendedActions, ...duplicate.recommendedActions])
  };
}

function mergeDimension(existing: ReadinessDimensionAssessment, duplicate: ReadinessDimensionAssessment): ReadinessDimensionAssessment {
  return {
    ...existing,
    evidence: mergeDuplicateEvidenceRecords([...existing.evidence, ...duplicate.evidence]),
    confidence: mergeConfidence(existing.confidence, duplicate.confidence),
    missingInformation: uniqueStrings([...existing.missingInformation, ...duplicate.missingInformation]),
    strengths: uniqueStrings([...existing.strengths, ...duplicate.strengths]),
    barriers: uniqueStrings([...existing.barriers, ...duplicate.barriers]),
    recommendedActions: uniqueStrings([...existing.recommendedActions, ...duplicate.recommendedActions])
  };
}

function uniquePathways(pathways: PathwayRecommendation[] = []) {
  return uniqueBy(pathways, (pathway) => pathway.pathwayCode)
    .sort((a, b) => a.rank - b.rank || a.pathwayCode.localeCompare(b.pathwayCode))
    .map((pathway, index) => ({ ...pathway, rank: index + 1 }));
}

function uniqueActions(actions: NextBestAction[] = [], primaryActionCode?: string) {
  return uniqueBy(
    actions.filter((action) => action.actionCode !== primaryActionCode),
    (action) => action.actionCode
  );
}

function uniqueCareerPlanSteps(steps: CareerPlanStep[] = []) {
  return uniqueBy(steps, (step) => step.stepId ?? step.id ?? step.actionCode);
}

function canonicalizeCareerPlan(plan: CareerPlan): CareerPlan {
  const steps = uniqueCareerPlanSteps(plan.steps);
  return {
    ...plan,
    steps,
    progress: {
      ...plan.progress,
      totalSteps: steps.length,
      completedSteps: steps.filter((step) => step.state === "COMPLETED").length
    }
  };
}

export function canonicalizeEmploymentIntelligenceProfile(profile: EmploymentIntelligenceProfile): EmploymentIntelligenceProfile {
  const strengths = mergeDuplicateEvidenceRecords(profile.strengths);
  const barriers = uniqueBy(profile.barriers, (barrier) => barrier.definitionCode, mergeBarrier).sort((a, b) => a.definitionCode.localeCompare(b.definitionCode));
  const readinessDimensions = uniqueBy(profile.readinessDimensions, (dimension) => dimension.key, mergeDimension);
  const pathwayRecommendations = uniquePathways(profile.pathwayRecommendations);
  const secondaryActions = uniqueActions(profile.secondaryActions, profile.nextBestAction.actionCode);
  const careerPlan = canonicalizeCareerPlan(profile.careerPlan);
  return {
    ...profile,
    strengths,
    barriers,
    readinessDimensions,
    overallReadiness: {
      ...profile.overallReadiness,
      strongestAssets: uniqueStrings(profile.overallReadiness.strongestAssets),
      highestImpactBarriers: uniqueStrings(profile.overallReadiness.highestImpactBarriers)
    },
    pathwayRecommendations,
    secondaryActions,
    careerPlan
  };
}

export function employmentIntelligenceCollectionInvariantReport(profile: EmploymentIntelligenceProfile) {
  const strengthDisplayCodes = profile.strengths.map((item) => employmentEvidenceDisplayCode(item)).filter(Boolean);
  return {
    uniqueStrengthDisplayCodes: uniqueStrings(strengthDisplayCodes).length === strengthDisplayCodes.length,
    uniqueBarrierCodes: uniqueStrings(profile.barriers.map((item) => item.definitionCode)).length === profile.barriers.length,
    uniquePathwayCodes: uniqueStrings(profile.pathwayRecommendations.map((item) => item.pathwayCode)).length === profile.pathwayRecommendations.length,
    uniqueReadinessDimensions: uniqueStrings(profile.readinessDimensions.map((item) => item.key)).length === profile.readinessDimensions.length,
    uniqueSecondaryActions: uniqueStrings(profile.secondaryActions.map((item) => item.actionCode)).length === profile.secondaryActions.length,
    uniqueCareerPlanSteps: uniqueStrings(profile.careerPlan.steps.map((item) => item.stepId ?? item.id)).length === profile.careerPlan.steps.length
  };
}
