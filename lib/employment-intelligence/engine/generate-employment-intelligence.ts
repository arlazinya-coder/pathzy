import type { CareerPlan } from "../domain/career-plan";
import type { EmploymentIntelligenceInput } from "../domain/employment-intelligence-input";
import type { EmploymentIntelligenceProfile } from "../domain/employment-intelligence-profile";
import type { NextBestAction } from "../domain/next-best-action";
import { confidenceFromSignals, createConfidenceAssessment } from "./calculate-confidence";
import { assessEmploymentEvidence } from "./assess-evidence";
import { assessReadinessDimensions, summarizeOverallReadiness } from "./assess-readiness";
import { buildEmploymentExplanations } from "./build-explanations";
import { detectEmploymentBarriers } from "./detect-barriers";
import { detectMissingInformation } from "./detect-missing-information";
import { EMPLOYMENT_INTELLIGENCE_ENGINE_VERSION_3B } from "./engine-version";
import type { EngineContext, EngineIntermediateState, MissingInformation, PathwayEvaluation, PreliminaryAction } from "./engine-types";
import { evaluatePathways, indicateJobLevels, toPathwayRecommendations } from "./evaluate-pathways";
import { extractEmploymentSignals } from "./extract-signals";
import { identifyStrengths } from "./identify-strengths";
import { normalizeEmploymentIntelligenceInput } from "./normalize-input";
import { selectSupportIntensity } from "./select-support-intensity";

function actionFromMissing(missing: MissingInformation[], pathways: PathwayEvaluation[]): PreliminaryAction {
  const blocker = missing.find((item) => item.blocksConclusion) ?? missing[0];
  if (blocker) {
    return {
      code: `RESOLVE_${blocker.code}`,
      title: blocker.resolutionAction,
      urgency: blocker.blocksConclusion ? "HIGH" : "MEDIUM",
      effort: blocker.importance === "REQUIRED_FOR_ASSESSMENT" ? "LOW" : "MEDIUM",
      route: "/professional-identity",
      reason: blocker.reason
    };
  }
  return {
    code: "REVIEW_EMPLOYMENT_PATHWAY",
    title: "Review your recommended employment pathway",
    urgency: "MEDIUM",
    effort: "LOW",
    route: "/home",
    reason: pathways[0]?.reason ?? "PATHZY has enough information to show the next practical step."
  };
}

function toNextBestAction(action: PreliminaryAction, engineVersion: string, confidence = createConfidenceAssessment({ completeness: 0.7, evidence: 0.45, ruleCertainty: 0.75, countryContext: 0.35, rationale: ["next_action.preliminary.phase3b"] })): NextBestAction {
  return {
    actionCode: action.code,
    title: action.title,
    plainLanguageExplanation: action.reason,
    reason: action.reason,
    urgency: action.urgency,
    expectedImpact: "Improves the reliability of PATHZY's employment guidance.",
    estimatedEffort: action.effort,
    prerequisites: [],
    blockedBy: [],
    destination: { route: action.route },
    supportingEvidence: [],
    confidence,
    completionCriteria: ["The related Professional Identity or Employment Diagnosis information is confirmed."],
    sourceEngineVersion: engineVersion
  };
}

function careerPlanFor(profile: Pick<EmploymentIntelligenceProfile, "generatedAt" | "engineVersion" | "supportIntensity" | "nextBestAction">, pathwayCode?: string): CareerPlan {
  return {
    generatedAt: profile.generatedAt,
    engineVersion: profile.engineVersion,
    pathwayCode,
    supportIntensity: profile.supportIntensity,
    steps: [
      {
        id: "phase3b-preliminary-next-action",
        horizon: "TODAY",
        action: profile.nextBestAction.title,
        reason: profile.nextBestAction.reason,
        pathzySupportFeature: "Employment Intelligence",
        measurableOutcome: "The next required information or preparation step is completed.",
        state: "NOT_STARTED",
        urgency: profile.nextBestAction.urgency,
        effort: profile.nextBestAction.estimatedEffort,
        evidence: [],
        confidence: profile.nextBestAction.confidence
      }
    ]
  };
}

export function generateEmploymentIntelligenceWithTrace(input: EmploymentIntelligenceInput, context: EngineContext) {
  const engineVersion = context.engineVersion ?? EMPLOYMENT_INTELLIGENCE_ENGINE_VERSION_3B;
  const normalized = normalizeEmploymentIntelligenceInput(input);
  const signals = extractEmploymentSignals(normalized.input);
  const evidenceSummary = assessEmploymentEvidence(normalized.input);
  const missingInformation = detectMissingInformation(normalized.input);
  const barriers = detectEmploymentBarriers(normalized.input, signals, missingInformation, evidenceSummary);
  const strengths = identifyStrengths(normalized.input, evidenceSummary);
  const pathwayEvaluations = evaluatePathways({ input: normalized.input, barriers, strengths, missing: missingInformation });
  const jobLevelIndications = indicateJobLevels(normalized.input, evidenceSummary);
  const supportIntensity = selectSupportIntensity(normalized.input, barriers, missingInformation);
  const readinessDimensions = assessReadinessDimensions({ signals, missing: missingInformation, barriers, evidenceSummary, engineVersion, assessedAt: context.assessedAt });
  const primaryAction = toNextBestAction(actionFromMissing(missingInformation, pathwayEvaluations), engineVersion);
  const overallReadiness = summarizeOverallReadiness({
    dimensions: readinessDimensions,
    barriers,
    strengths,
    supportIntensity,
    missing: missingInformation,
    recommendedPathway: pathwayEvaluations[0]?.pathwayCode ?? "NOT_ASSESSED"
  });
  const intermediate: EngineIntermediateState = {
    normalizationReport: normalized.report,
    signals,
    evidenceSummary,
    missingInformation,
    barriers,
    strengths,
    pathwayEvaluations,
    jobLevelIndications,
    supportIntensity
  };
  const suitableJobLevels = jobLevelIndications.map((item) => item.level);
  overallReadiness.suitableJobLevels = suitableJobLevels;
  const profile: EmploymentIntelligenceProfile = {
    id: `employment-intelligence-${normalized.input.userId}-${normalized.input.inputSnapshotVersion}-${engineVersion}`,
    userId: normalized.input.userId,
    version: 1,
    engineVersion,
    generatedAt: context.assessedAt,
    inputSnapshotVersion: normalized.input.inputSnapshotVersion,
    countryContext: {
      countryCode: normalized.input.countryContext.countryCode,
      version: normalized.input.countryContext.version,
      effectiveDate: normalized.input.countryContext.effectiveDate,
      dataFreshness: normalized.input.countryContext.dataFreshness
    },
    readinessDimensions,
    overallReadiness,
    strengths: evidenceSummary.strongestSupportedAssets,
    barriers,
    evidenceGaps: evidenceSummary.evidenceGaps,
    pathwayRecommendations: toPathwayRecommendations(pathwayEvaluations),
    suitableRoleFamilies: strengths.map((item) => item.code),
    suitableJobLevels,
    supportIntensity: supportIntensity.level,
    nextBestAction: primaryAction,
    secondaryActions: pathwayEvaluations.slice(1, 4).map((pathway) => toNextBestAction({
      code: `REVIEW_${pathway.pathwayCode}`,
      title: `Review ${pathway.pathwayCode}`,
      urgency: "LOW",
      effort: "LOW",
      route: "/home",
      reason: pathway.reason
    }, engineVersion, pathway.confidence)),
    careerPlan: careerPlanFor({ generatedAt: context.assessedAt, engineVersion, supportIntensity: supportIntensity.level, nextBestAction: primaryAction }, pathwayEvaluations[0]?.pathwayCode),
    explanations: buildEmploymentExplanations({ overall: overallReadiness, dimensions: readinessDimensions, barriers, pathways: pathwayEvaluations, missing: missingInformation, support: supportIntensity, evidenceSummary }),
    confidence: confidenceFromSignals(signals, evidenceSummary),
    missingInformation: missingInformation.map((item) => item.code),
    staleStatus: "CURRENT",
    sensitivity: {
      safeForHome: ["overallReadiness", "nextBestAction", "supportIntensity"],
      safeForCareerCoach: ["readinessDimensions", "barriers", "pathwayRecommendations", "missingInformation"],
      safeForDocuments: ["strengths", "suitableJobLevels", "suitableRoleFamilies"],
      sensitiveInternalOnly: ["workAuthorisation", "careResponsibilities", "incomeUrgency", "barrierEvidence"]
    }
  };
  return { profile, intermediate };
}

export function generateEmploymentIntelligence(input: EmploymentIntelligenceInput, context: EngineContext): EmploymentIntelligenceProfile {
  return generateEmploymentIntelligenceWithTrace(input, context).profile;
}
