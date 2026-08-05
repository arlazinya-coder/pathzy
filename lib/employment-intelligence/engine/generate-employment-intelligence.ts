import type { EmploymentDiagnosisResult } from "../diagnosis/diagnosis-models";
import { canonicalizeEmploymentIntelligenceProfile } from "../domain/collection-invariants";
import type { EmploymentIntelligenceInput } from "../domain/employment-intelligence-input";
import type { EmploymentIntelligenceProfile } from "../domain/employment-intelligence-profile";
import { determineNextBestActions, generateCareerPlan } from "../actions";
import { confidenceFromSignals } from "./calculate-confidence";
import { assessEmploymentEvidence } from "./assess-evidence";
import { assessReadinessDimensions, summarizeOverallReadiness } from "./assess-readiness";
import { buildEmploymentExplanations } from "./build-explanations";
import { detectEmploymentBarriers } from "./detect-barriers";
import { detectMissingInformation } from "./detect-missing-information";
import { EMPLOYMENT_INTELLIGENCE_ENGINE_VERSION_3E } from "./engine-version";
import type { EngineContext, EngineIntermediateState } from "./engine-types";
import { evaluatePathways, indicateJobLevels, toPathwayRecommendations } from "./evaluate-pathways";
import { extractEmploymentSignals } from "./extract-signals";
import { identifyStrengths } from "./identify-strengths";
import { normalizeEmploymentIntelligenceInput } from "./normalize-input";
import { selectSupportIntensity } from "./select-support-intensity";

function diagnosisContextFromInput(input: EmploymentIntelligenceInput): EmploymentDiagnosisResult | null {
  const urgentIncome = String(input.employmentDiagnosis.incomeUrgency.value ?? "").toUpperCase().includes("URGENT");
  const practicalConstraints = [input.employmentDiagnosis.transportAccess.value, input.employmentDiagnosis.deviceInternetAccess.value]
    .map((value) => String(value ?? "").toUpperCase())
    .filter((value) => /LIMIT|SHARED|SMARTPHONE|UNRELIABLE|LOCAL/.test(value));
  const supportNeeds = Array.isArray(input.employmentDiagnosis.supportNeeds.value) ? input.employmentDiagnosis.supportNeeds.value.map(String) : [];
  const evidenceGaps = [
    String(input.employmentDiagnosis.documentationAvailability.value ?? "").toUpperCase().includes("UNKNOWN") ? "DOCUMENTATION_EVIDENCE" : "",
    String(input.employmentDiagnosis.workAuthorisationConstraints.value ?? "").toUpperCase().includes("UNKNOWN") ? "WORK_ELIGIBILITY_UNCERTAIN" : ""
  ].filter(Boolean);
  if (!urgentIncome && !practicalConstraints.length && !supportNeeds.length && !evidenceGaps.length) return null;
  return {
    summaryCodes: ["DERIVED_FROM_EMPLOYMENT_INTELLIGENCE_INPUT"],
    diagnosisStatus: "ENOUGH_FOR_INTELLIGENCE",
    primaryEmploymentSituation: null,
    strongestSignals: [],
    majorBarriers: [],
    practicalConstraints,
    immediateNeeds: urgentIncome ? ["URGENT_INCOME"] : [],
    workEligibilityUncertainty: evidenceGaps.includes("WORK_ELIGIBILITY_UNCERTAIN"),
    digitalAccessNeeds: practicalConstraints.filter((value) => /SHARED|SMARTPHONE|UNRELIABLE/.test(value)),
    supportNeeds,
    preferredPathwaySignals: [],
    evidenceGaps,
    unansweredImportantQuestions: [],
    identitySuggestions: [],
    readinessImpactReferences: [],
    countryContextReferences: [input.countryContext.version],
    confidence: 0.65,
    explanationFacts: ["Derived from mapped Employment Diagnosis values already present in the intelligence input."],
    diagnosisVersion: "3E.input-context",
    generatedAt: new Date().toISOString()
  };
}

export function generateEmploymentIntelligenceWithTrace(input: EmploymentIntelligenceInput, context: EngineContext) {
  const engineVersion = context.engineVersion ?? EMPLOYMENT_INTELLIGENCE_ENGINE_VERSION_3E;
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
  const actionContext = {
    userId: normalized.input.userId,
    engineVersion,
    generatedAt: context.assessedAt,
    readinessDimensions,
    barriers,
    evidenceGaps: evidenceSummary.evidenceGaps,
    pathwayRecommendations: toPathwayRecommendations(pathwayEvaluations),
    supportIntensity: supportIntensity.level,
    missingInformation: missingInformation.map((item) => item.code),
    confidence: confidenceFromSignals(signals, evidenceSummary)
  };
  const diagnosisResult = diagnosisContextFromInput(normalized.input);
  const actionSet = determineNextBestActions({
    intelligenceProfile: actionContext,
    diagnosisResult,
    documentState: { hasCv: false }
  });
  const careerPlan = generateCareerPlan({
    intelligenceProfile: actionContext,
    diagnosisResult,
    documentState: { hasCv: false }
  }, actionSet);
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
    pathwayRecommendations: actionContext.pathwayRecommendations,
    suitableRoleFamilies: strengths.map((item) => item.code),
    suitableJobLevels,
    supportIntensity: supportIntensity.level,
    nextBestAction: actionSet.primary,
    secondaryActions: actionSet.secondary,
    careerPlan,
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
  return { profile: canonicalizeEmploymentIntelligenceProfile(profile), intermediate };
}

export function generateEmploymentIntelligence(input: EmploymentIntelligenceInput, context: EngineContext): EmploymentIntelligenceProfile {
  return generateEmploymentIntelligenceWithTrace(input, context).profile;
}
