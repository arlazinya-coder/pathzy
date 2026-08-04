import type { EmploymentIntelligenceInput } from "../domain/employment-intelligence-input";
import type { DetectedBarrier } from "../domain/barriers";
import type { EvidenceAssessmentSummary, EmploymentSignal, MissingInformation } from "./engine-types";
import { createConfidenceAssessment } from "./calculate-confidence";
import { hasUnavailableMarker, inputHasText, isSouthAfricaContext } from "./country-context-accessors";
import { barrierCategoryForCode } from "./engine-types";
import { normalizeText } from "./normalize-input";

function barrier(code: string, severity: DetectedBarrier["severity"], actions: string[], evidenceSummary: EvidenceAssessmentSummary, externalFactors: string[] = []): DetectedBarrier {
  return {
    definitionCode: code,
    severity,
    evidence: evidenceSummary.strongestSupportedAssets.slice(0, 3),
    confidence: createConfidenceAssessment({
      completeness: severity === "CRITICAL" ? 0.8 : 0.6,
      evidence: evidenceSummary.overallEvidenceConfidence.evidenceQuality,
      ruleCertainty: 0.72,
      countryContext: externalFactors.length ? 0.45 : 0.3,
      rationale: [`barrier.${code.toLowerCase()}`, `barrier.category.${barrierCategoryForCode(code).toLowerCase()}`]
    }),
    userCanChange: actions,
    externalFactors,
    recommendedActions: actions
  };
}

function signalValue(signals: EmploymentSignal[], code: string) {
  return normalizeText(signals.find((signal) => signal.code === code)?.value).toLowerCase();
}

export function detectEmploymentBarriers(input: EmploymentIntelligenceInput, signals: EmploymentSignal[], missing: MissingInformation[], evidenceSummary: EvidenceAssessmentSummary): DetectedBarrier[] {
  const barriers: DetectedBarrier[] = [];
  if (missing.some((item) => item.code === "CURRENT_SITUATION_MISSING" || item.code === "WORK_AUTHORIZATION_UNCLEAR")) {
    barriers.push(barrier("INCOMPLETE_PROFESSIONAL_IDENTITY", "HIGH", ["Complete required Professional Identity fields before relying on pathway conclusions."], evidenceSummary));
  } else if (missing.length >= 5) {
    barriers.push(barrier("INCOMPLETE_PROFESSIONAL_IDENTITY", "MODERATE", ["Complete the highest-impact missing fields first."], evidenceSummary));
  }
  if (evidenceSummary.unsupportedClaims.length) {
    barriers.push(barrier("UNSUPPORTED_SKILL_CLAIMS", "LOW", ["Add examples, projects, documents, or references that support important skill claims."], evidenceSummary));
  }

  const transport = signalValue(signals, "TRANSPORT_ACCESS");
  const device = signalValue(signals, "DEVICE_INTERNET_ACCESS");
  const care = signalValue(signals, "CARE_RESPONSIBILITIES");
  if (/(none|no|limited|unreliable|difficult|constraint|shared)/.test(`${transport} ${device} ${care}`)) {
    barriers.push(barrier("PRACTICAL_ACCESS_CONSTRAINT", /(none|no|unreliable)/.test(`${transport} ${device}`) ? "HIGH" : "MODERATE", ["Prioritize pathways and actions that fit current access, device, transport, and care realities."], evidenceSummary));
  }

  const authorization = signalValue(signals, "WORK_AUTHORIZATION_KNOWN");
  const authConstraints = normalizeText(input.employmentDiagnosis.workAuthorisationConstraints.value).toLowerCase();
  if (authorization === "unknown" || /(unclear|unknown|pending|permit|visa|document)/.test(authConstraints)) {
    barriers.push(barrier("WORK_AUTHORIZATION_UNCERTAINTY", "HIGH", ["Clarify work authorization before relying on pathways with legal eligibility requirements."], evidenceSummary));
  }

  const literacy = signalValue(signals, "LITERACY_COMMUNICATION_COMFORT");
  if (/(low|limited|difficult|support|help|reading|writing)/.test(literacy)) {
    barriers.push(barrier("COMMUNICATION_SUPPORT_NEED", "MODERATE", ["Use plain-language steps and prepare written or spoken answers with support."], evidenceSummary));
  }

  const duration = signalValue(signals, "UNEMPLOYMENT_DURATION_KNOWN");
  if (/(long|12|year|years|extended)/.test(duration)) {
    barriers.push(barrier("LONG_UNEMPLOYMENT_SUPPORT_NEED", "MODERATE", ["Use return-to-work explanations, fresh evidence, and confidence-building actions."], evidenceSummary));
  }

  if (input.countryContext.sourceMetadata.length && input.countryContext.dataFreshness === "STALE") {
    barriers.push(barrier("MARKET_OR_STRUCTURAL_BARRIER", "INFORMATIONAL", ["Treat country context as stale and verify current opportunity conditions before decisions."], evidenceSummary, ["Country context data is marked stale."]));
  }
  if (isSouthAfricaContext(input.countryContext)) {
    if (missing.some((item) => item.code === "ZA_FOREIGN_QUALIFICATION_RECOGNITION_UNKNOWN")) {
      barriers.push(barrier("QUALIFICATION_RECOGNITION_UNCERTAINTY", "MODERATE", ["Clarify recognition status before relying on qualification-dependent pathways."], evidenceSummary));
    }
    if (missing.some((item) => item.code === "ZA_SECURITY_REGISTRATION_EVIDENCE_UNKNOWN")) {
      barriers.push(barrier("LICENCE_OR_REGISTRATION_EVIDENCE_MISSING", "MODERATE", ["Confirm registration, training, validity, and related evidence before relying on the security pathway."], evidenceSummary));
    }
    if (hasUnavailableMarker(input.countryContext, "MARKET_DEMAND")) {
      barriers.push(barrier("MARKET_DATA_UNAVAILABLE", "INFORMATIONAL", ["Do not use market-demand claims until verified source data exists."], evidenceSummary, ["South Africa market-demand data is unavailable in the current adapter."]));
    }
    if (inputHasText(input.professionalIdentity.nationality.value, ["south africa", "south african", "za"]) && authorization === "unknown") {
      barriers.push(barrier("NATIONALITY_NOT_WORK_AUTHORIZATION", "INFORMATIONAL", ["Confirm work authorization directly; nationality is not used as an authorization shortcut."], evidenceSummary));
    }
  }

  return Array.from(new Map(barriers.map((item) => [item.definitionCode, item])).values()).sort((a, b) => a.definitionCode.localeCompare(b.definitionCode));
}
